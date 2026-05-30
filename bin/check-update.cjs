#!/usr/bin/env node

'use strict';

/**
 * check-update.cjs -- SessionStart hook: nudge when takeToMarket is outdated.
 *
 * Fires at session start via two install paths:
 *   - plugin install : hooks/hooks.json runs `node "${CLAUDE_PLUGIN_ROOT}/bin/check-update.cjs"`
 *   - npm / clone     : install.js injects a SessionStart hook into ~/.claude/settings.json
 *                       pointing at ~/.taketomarket/bin/check-update.cjs
 *
 * Behaviour: read the installed version, compare against the npm registry
 * (throttled to once per CHECK_INTERVAL via an on-disk cache), and -- if a newer
 * version exists -- print a SessionStart `additionalContext` block instructing
 * Claude to surface the update and offer to run /ttm-update.
 *
 * HARD CONTRACT: never break the session. Any failure -> exit 0 with no output.
 * Zero npm dependencies; Node built-ins only.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const PACKAGE = 'taketomarket';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h throttle between npm registry hits
const NPM_TIMEOUT_MS = 3000; // fail fast so session start is never blocked
const NUDGE_COOLDOWN_MS = 30 * 1000; // suppress a duplicate nudge from back-to-back hook fires

// ── Pure helpers (unit-tested) ─────────────────────────────────────────────────

/**
 * Compare two prerelease identifier strings per semver §11.
 * Numeric identifiers compare numerically and rank below alphanumeric ones;
 * a larger set of identifiers outranks a smaller prefix-equal set.
 * @param {string} a - dot-separated prerelease string (non-empty)
 * @param {string} b - dot-separated prerelease string (non-empty)
 * @returns {number} 1 if a>b, -1 if a<b, 0 if equal
 */
function comparePrerelease(a, b) {
  const ai = a.split('.');
  const bi = b.split('.');
  const len = Math.max(ai.length, bi.length);
  for (let i = 0; i < len; i++) {
    if (ai[i] === undefined) return -1; // a is a prefix of b -> a is lower
    if (bi[i] === undefined) return 1;
    const aNum = /^\d+$/.test(ai[i]);
    const bNum = /^\d+$/.test(bi[i]);
    if (aNum && bNum) {
      const d = parseInt(ai[i], 10) - parseInt(bi[i], 10);
      if (d !== 0) return d > 0 ? 1 : -1;
    } else if (aNum !== bNum) {
      return aNum ? -1 : 1; // numeric identifiers rank below alphanumeric
    } else if (ai[i] !== bi[i]) {
      return ai[i] > bi[i] ? 1 : -1;
    }
  }
  return 0;
}

/**
 * Compare two semver strings with proper prerelease precedence (semver §11).
 * Numeric major.minor.patch compare first; when those are equal, a version
 * WITHOUT a prerelease tag outranks one WITH a tag (e.g. 2.3.0 > 2.3.0-rc.1),
 * and two prerelease tags compare by identifier.
 * @param {string} a
 * @param {string} b
 * @returns {number} 1 if a>b, -1 if a<b, 0 if equal
 */
function compareSemver(a, b) {
  const parse = (v) => {
    const s = String(v).trim().replace(/^v/, '');
    const dash = s.indexOf('-');
    const core = dash === -1 ? s : s.slice(0, dash);
    const pre = dash === -1 ? '' : s.slice(dash + 1);
    const parts = core.split('.');
    return { nums: [0, 1, 2].map((i) => parseInt(parts[i], 10) || 0), pre };
  };
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    if (pa.nums[i] > pb.nums[i]) return 1;
    if (pa.nums[i] < pb.nums[i]) return -1;
  }
  if (pa.pre === pb.pre) return 0;
  if (pa.pre === '') return 1; // no prerelease outranks a prerelease of same core
  if (pb.pre === '') return -1;
  return comparePrerelease(pa.pre, pb.pre);
}

/**
 * @param {string} installed
 * @param {string} latest
 * @returns {boolean} true when `latest` is strictly newer than `installed`
 */
function isOutdated(installed, latest) {
  if (!installed || !latest) return false;
  return compareSemver(latest, installed) === 1;
}

/**
 * @param {?{checked_at:number}} cache
 * @param {number} now - epoch ms
 * @param {number} intervalMs
 * @returns {boolean} true when the cache exists and is younger than intervalMs
 */
function isCacheFresh(cache, now, intervalMs) {
  if (!cache || typeof cache.checked_at !== 'number') return false;
  const age = now - cache.checked_at;
  // Negative age = future timestamp (clock moved backward / imported cache):
  // treat as stale so it forces a re-check rather than pinning a stale latest.
  return age >= 0 && age < intervalMs;
}

/**
 * Build the SessionStart context string injected into Claude's context.
 * Deliberately directive: this is the "strong inject-context" nudge.
 * @param {string} installed
 * @param {string} latest
 * @returns {string}
 */
function buildContext(installed, latest) {
  return [
    `[takeToMarket] Your installed version is OUT OF DATE: v${installed} installed, v${latest} is the latest on npm.`,
    `ACTION: Proactively tell the user their takeToMarket install is outdated (v${installed} -> v${latest})`,
    `and offer to upgrade now. If they agree, invoke the /ttm-update skill -- it detects the install`,
    `method (plugin/npm/clone) and performs the upgrade safely, preserving local edits.`,
    `Do NOT attempt the upgrade by any other means (no manual npm/git commands).`,
  ].join(' ');
}

/**
 * Decide whether update checking is disabled.
 * @param {NodeJS.ProcessEnv} env
 * @returns {boolean}
 */
function isOptedOut(env) {
  const v = env && env.TTM_NO_UPDATE_CHECK;
  return v === '1' || v === 'true';
}

/**
 * Read the `version` from a package.json, but only if it is the taketomarket package.
 * @param {string} filePath
 * @returns {?string} version string, or null
 */
function readVersionFromPackageJson(filePath) {
  try {
    const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (pkg && pkg.name === PACKAGE && typeof pkg.version === 'string') return pkg.version;
  } catch (_) {
    // unreadable / not JSON / wrong package -> null
  }
  return null;
}

/**
 * Resolve the installed version. Prefers the package.json adjacent to this
 * script (works for BOTH the plugin-cache layout, where bin/ sits beside
 * package.json at the plugin root, AND the ~/.taketomarket/bin layout written
 * by install.js). Falls back to ~/.taketomarket/package.json.
 * @param {string} scriptDir - directory of this script (__dirname)
 * @param {string} homeDir
 * @returns {?string}
 */
function resolveInstalledVersion(scriptDir, homeDir) {
  const candidates = [
    path.join(scriptDir, '..', 'package.json'),
    path.join(homeDir, '.taketomarket', 'package.json'),
  ];
  for (const p of candidates) {
    const v = readVersionFromPackageJson(p);
    if (v) return v;
  }
  return null;
}

// ── I/O helpers ─────────────────────────────────────────────────────────────--

function readCache(cachePath) {
  try {
    const c = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    if (c && typeof c.checked_at === 'number') return c;
  } catch (_) {
    // missing / corrupt -> treat as no cache
  }
  return null;
}

function writeCache(cachePath, data) {
  try {
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2) + '\n');
  } catch (_) {
    // cache is best-effort; never throw
  }
}

/**
 * Query the npm registry for the latest published version. Short timeout,
 * fail-silent (returns null on any error / offline / timeout).
 * @returns {?string}
 */
function fetchLatestVersion() {
  try {
    // On Windows the npm launcher is npm.cmd, which execFile cannot run without
    // a shell -> spawn via the shell there. PACKAGE is a fixed constant (no user
    // input interpolated), so shell use carries no injection risk.
    const out = execFileSync('npm', ['show', PACKAGE, 'version'], {
      timeout: NPM_TIMEOUT_MS,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
      shell: process.platform === 'win32',
    });
    const v = String(out).trim();
    return /^\d+\.\d+\.\d+/.test(v) ? v : null;
  } catch (_) {
    return null;
  }
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

/**
 * Run the update check. All side-effecting dependencies are injectable for tests.
 * @param {object} [deps]
 * @returns {{action:string, installed?:string, latest?:string}} summary (for tests)
 */
function run(deps = {}) {
  const {
    now = Date.now(),
    homeDir = os.homedir(),
    scriptDir = __dirname,
    env = process.env,
    fetchLatest = fetchLatestVersion,
    out = (s) => process.stdout.write(s),
  } = deps;

  if (isOptedOut(env)) return { action: 'opted-out' };

  const installed = resolveInstalledVersion(scriptDir, homeDir);
  if (!installed) return { action: 'no-version' };

  const cachePath = path.join(homeDir, '.taketomarket', '.update-check.json');
  const cache = readCache(cachePath);

  let latest = cache ? cache.latest : null;
  if (!isCacheFresh(cache, now, CHECK_INTERVAL_MS)) {
    const fetched = fetchLatest();
    if (fetched) {
      latest = fetched;
      writeCache(cachePath, { checked_at: now, latest, installed });
    }
    // else: offline/timeout -> keep stale `latest` if we had one, otherwise null
  }

  if (!latest) return { action: 'no-latest' };

  if (isOutdated(installed, latest)) {
    // Double-fire guard: a user with BOTH a plugin install (hooks/hooks.json)
    // and an npm/clone install (settings.json) runs this script twice per
    // SessionStart. The two fires happen back-to-back, so suppress a second
    // emission within a short cooldown to avoid a duplicated nudge. (The
    // installer's idempotency is settings.json-scoped and cannot see the
    // plugin-discovered hooks.json, so the dedupe must live here.)
    const nudgedAt = cache && typeof cache.nudged_at === 'number' ? cache.nudged_at : null;
    if (nudgedAt !== null && (now - nudgedAt) >= 0 && (now - nudgedAt) < NUDGE_COOLDOWN_MS) {
      return { action: 'nudge-suppressed', installed, latest };
    }
    out(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: buildContext(installed, latest),
      },
    }) + '\n');
    writeCache(cachePath, {
      checked_at: cache && typeof cache.checked_at === 'number' ? cache.checked_at : now,
      latest,
      installed,
      nudged_at: now,
    });
    return { action: 'nudged', installed, latest };
  }

  return { action: 'up-to-date', installed, latest };
}

module.exports = {
  compareSemver,
  comparePrerelease,
  isOutdated,
  isCacheFresh,
  buildContext,
  isOptedOut,
  readVersionFromPackageJson,
  resolveInstalledVersion,
  readCache,
  writeCache,
  fetchLatestVersion,
  run,
  CHECK_INTERVAL_MS,
};

if (require.main === module) {
  try {
    run();
  } catch (_) {
    // HARD CONTRACT: never break the session.
  }
  process.exit(0);
}
