'use strict';

// Unit tests for bin/check-update.cjs — the SessionStart update-check hook.
// Covers semver compare, cache freshness, opt-out, version resolution, and the
// run() orchestrator with injected (network-free) dependencies, plus the
// fail-silent contract via a real child-process spawn.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createTempDir } = require('./helpers.cjs');

const cu = require('../bin/check-update.cjs');
const SCRIPT = path.join(__dirname, '..', 'bin', 'check-update.cjs');

describe('check-update: compareSemver', () => {
  it('orders major/minor/patch correctly', () => {
    assert.strictEqual(cu.compareSemver('2.0.0', '1.9.9'), 1);
    assert.strictEqual(cu.compareSemver('1.2.0', '1.10.0'), -1);
    assert.strictEqual(cu.compareSemver('1.0.1', '1.0.0'), 1);
    assert.strictEqual(cu.compareSemver('2.3.3', '2.3.3'), 0);
  });

  it('tolerates a leading v', () => {
    assert.strictEqual(cu.compareSemver('v2.3.4', '2.3.3'), 1);
  });

  it('ranks a prerelease BELOW its stable release (semver §11)', () => {
    // The load-bearing fix: a user on an RC must be told a stable of the same
    // numeric core is newer.
    assert.strictEqual(cu.compareSemver('2.3.0', '2.3.0-rc.1'), 1);
    assert.strictEqual(cu.compareSemver('2.3.3-rc.1', '2.3.3'), -1);
  });

  it('orders prerelease identifiers (rc.2 > rc.1, numeric < alphanumeric, prefix lower)', () => {
    assert.strictEqual(cu.compareSemver('2.3.0-rc.2', '2.3.0-rc.1'), 1);
    assert.strictEqual(cu.compareSemver('2.3.0-rc.1', '2.3.0-rc.1'), 0);
    assert.strictEqual(cu.compareSemver('1.0.0-alpha', '1.0.0-alpha.1'), -1);
    assert.strictEqual(cu.compareSemver('1.0.0-alpha.1', '1.0.0-alpha.beta'), -1);
  });
});

describe('check-update: isOutdated', () => {
  it('true only when latest is strictly newer', () => {
    assert.strictEqual(cu.isOutdated('2.3.3', '2.3.4'), true);
    assert.strictEqual(cu.isOutdated('2.3.3', '2.3.3'), false);
    assert.strictEqual(cu.isOutdated('2.3.4', '2.3.3'), false);
  });

  it('nudges a prerelease install toward its stable release', () => {
    // Real shipping scenario: installed RC, npm `latest` is the stable.
    assert.strictEqual(cu.isOutdated('2.3.0-rc.1', '2.3.0'), true);
    assert.strictEqual(cu.isOutdated('2.3.0', '2.3.0-rc.1'), false);
  });

  it('false when either version is missing', () => {
    assert.strictEqual(cu.isOutdated(null, '2.3.4'), false);
    assert.strictEqual(cu.isOutdated('2.3.3', null), false);
  });
});

describe('check-update: isCacheFresh', () => {
  const now = 1_000_000_000_000;
  const interval = cu.CHECK_INTERVAL_MS;

  it('fresh when within interval', () => {
    assert.strictEqual(cu.isCacheFresh({ checked_at: now - 1000 }, now, interval), true);
  });

  it('stale when older than interval', () => {
    assert.strictEqual(cu.isCacheFresh({ checked_at: now - interval - 1 }, now, interval), false);
  });

  it('not fresh when cache missing or malformed', () => {
    assert.strictEqual(cu.isCacheFresh(null, now, interval), false);
    assert.strictEqual(cu.isCacheFresh({}, now, interval), false);
  });

  it('not fresh when timestamp is in the future (backward clock skew)', () => {
    assert.strictEqual(cu.isCacheFresh({ checked_at: now + 60_000 }, now, interval), false);
  });
});

describe('check-update: isOptedOut', () => {
  it('honours TTM_NO_UPDATE_CHECK=1 and =true', () => {
    assert.strictEqual(cu.isOptedOut({ TTM_NO_UPDATE_CHECK: '1' }), true);
    assert.strictEqual(cu.isOptedOut({ TTM_NO_UPDATE_CHECK: 'true' }), true);
  });

  it('not opted out otherwise', () => {
    assert.strictEqual(cu.isOptedOut({}), false);
    assert.strictEqual(cu.isOptedOut({ TTM_NO_UPDATE_CHECK: '0' }), false);
  });
});

describe('check-update: buildContext', () => {
  it('mentions both versions and instructs /ttm-update', () => {
    const ctx = cu.buildContext('2.3.3', '2.4.0');
    assert.ok(ctx.includes('2.3.3'), 'includes installed version');
    assert.ok(ctx.includes('2.4.0'), 'includes latest version');
    assert.ok(ctx.includes('/ttm-update'), 'instructs running /ttm-update');
  });
});

describe('check-update: readVersionFromPackageJson', () => {
  it('reads version only for the taketomarket package', () => {
    const tmp = createTempDir();
    try {
      const good = path.join(tmp.dir, 'good.json');
      fs.writeFileSync(good, JSON.stringify({ name: 'taketomarket', version: '9.9.9' }));
      assert.strictEqual(cu.readVersionFromPackageJson(good), '9.9.9');

      const wrong = path.join(tmp.dir, 'wrong.json');
      fs.writeFileSync(wrong, JSON.stringify({ name: 'something-else', version: '1.0.0' }));
      assert.strictEqual(cu.readVersionFromPackageJson(wrong), null);

      assert.strictEqual(cu.readVersionFromPackageJson(path.join(tmp.dir, 'nope.json')), null);
    } finally {
      tmp.cleanup();
    }
  });
});

describe('check-update: resolveInstalledVersion', () => {
  it('prefers package.json adjacent to the script dir', () => {
    const tmp = createTempDir();
    try {
      // Simulate plugin-cache layout: <root>/package.json + <root>/bin/
      const scriptDir = path.join(tmp.dir, 'bin');
      fs.mkdirSync(scriptDir, { recursive: true });
      fs.writeFileSync(
        path.join(tmp.dir, 'package.json'),
        JSON.stringify({ name: 'taketomarket', version: '3.1.4' })
      );
      assert.strictEqual(cu.resolveInstalledVersion(scriptDir, tmp.dir), '3.1.4');
    } finally {
      tmp.cleanup();
    }
  });

  it('falls back to ~/.taketomarket/package.json', () => {
    const tmp = createTempDir();
    try {
      const scriptDir = path.join(tmp.dir, 'somewhere', 'bin'); // no adjacent package.json
      fs.mkdirSync(scriptDir, { recursive: true });
      const base = path.join(tmp.dir, '.taketomarket');
      fs.mkdirSync(base, { recursive: true });
      fs.writeFileSync(
        path.join(base, 'package.json'),
        JSON.stringify({ name: 'taketomarket', version: '5.0.0' })
      );
      assert.strictEqual(cu.resolveInstalledVersion(scriptDir, tmp.dir), '5.0.0');
    } finally {
      tmp.cleanup();
    }
  });
});

describe('check-update: run() orchestrator (injected deps)', () => {
  function setup(installedVersion) {
    const tmp = createTempDir();
    const scriptDir = path.join(tmp.dir, 'bin');
    fs.mkdirSync(scriptDir, { recursive: true });
    fs.writeFileSync(
      path.join(tmp.dir, 'package.json'),
      JSON.stringify({ name: 'taketomarket', version: installedVersion })
    );
    return { tmp, scriptDir };
  }

  it('nudges and writes cache when a newer version exists', () => {
    const { tmp, scriptDir } = setup('2.3.3');
    try {
      let captured = '';
      const result = cu.run({
        now: 1000,
        homeDir: tmp.dir,
        scriptDir,
        env: {},
        fetchLatest: () => '2.4.0',
        out: (s) => { captured += s; },
      });

      assert.strictEqual(result.action, 'nudged');
      const parsed = JSON.parse(captured);
      assert.strictEqual(parsed.hookSpecificOutput.hookEventName, 'SessionStart');
      assert.ok(parsed.hookSpecificOutput.additionalContext.includes('/ttm-update'));

      const cache = JSON.parse(fs.readFileSync(path.join(tmp.dir, '.taketomarket', '.update-check.json'), 'utf8'));
      assert.strictEqual(cache.latest, '2.4.0');
      assert.strictEqual(cache.checked_at, 1000);
    } finally {
      tmp.cleanup();
    }
  });

  it('stays silent when already up to date', () => {
    const { tmp, scriptDir } = setup('2.4.0');
    try {
      let captured = '';
      const result = cu.run({
        now: 1000, homeDir: tmp.dir, scriptDir, env: {},
        fetchLatest: () => '2.4.0',
        out: (s) => { captured += s; },
      });
      assert.strictEqual(result.action, 'up-to-date');
      assert.strictEqual(captured, '');
    } finally {
      tmp.cleanup();
    }
  });

  it('uses a fresh cache without calling the network', () => {
    const { tmp, scriptDir } = setup('2.3.3');
    try {
      const cachePath = path.join(tmp.dir, '.taketomarket', '.update-check.json');
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      fs.writeFileSync(cachePath, JSON.stringify({ checked_at: 5000, latest: '2.5.0' }));

      let fetchCalled = false;
      let captured = '';
      const result = cu.run({
        now: 5500, homeDir: tmp.dir, scriptDir, env: {},
        fetchLatest: () => { fetchCalled = true; return '9.9.9'; },
        out: (s) => { captured += s; },
      });

      assert.strictEqual(fetchCalled, false, 'network not hit when cache is fresh');
      assert.strictEqual(result.action, 'nudged');
      assert.ok(captured.includes('2.5.0'), 'used cached latest version');
    } finally {
      tmp.cleanup();
    }
  });

  it('records nudged_at and suppresses a back-to-back second fire (dual-install guard)', () => {
    const { tmp, scriptDir } = setup('2.3.3');
    try {
      const cachePath = path.join(tmp.dir, '.taketomarket', '.update-check.json');

      // First fire: cache fresh, outdated -> nudges and stamps nudged_at.
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      fs.writeFileSync(cachePath, JSON.stringify({ checked_at: 1000, latest: '2.4.0' }));
      let first = '';
      const r1 = cu.run({
        now: 1000, homeDir: tmp.dir, scriptDir, env: {},
        fetchLatest: () => { throw new Error('cache fresh, no fetch'); },
        out: (s) => { first += s; },
      });
      assert.strictEqual(r1.action, 'nudged');
      assert.ok(first.length > 0, 'first fire emits');
      const stamped = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      assert.strictEqual(stamped.nudged_at, 1000, 'nudged_at stamped');

      // Second fire 2s later (the other hook path): suppressed, no output.
      let second = '';
      const r2 = cu.run({
        now: 3000, homeDir: tmp.dir, scriptDir, env: {},
        fetchLatest: () => { throw new Error('cache fresh, no fetch'); },
        out: (s) => { second += s; },
      });
      assert.strictEqual(r2.action, 'nudge-suppressed');
      assert.strictEqual(second, '', 'second fire within cooldown is silent');

      // Much later (past cooldown): nudges again.
      let third = '';
      const r3 = cu.run({
        now: 1000 + cu.CHECK_INTERVAL_MS - 1, homeDir: tmp.dir, scriptDir, env: {},
        fetchLatest: () => { throw new Error('cache fresh, no fetch'); },
        out: (s) => { third += s; },
      });
      assert.strictEqual(r3.action, 'nudged');
      assert.ok(third.length > 0, 'fire past cooldown emits again');
    } finally {
      tmp.cleanup();
    }
  });

  it('is silent when opted out', () => {
    const { tmp, scriptDir } = setup('2.3.3');
    try {
      let captured = '';
      const result = cu.run({
        now: 1000, homeDir: tmp.dir, scriptDir,
        env: { TTM_NO_UPDATE_CHECK: '1' },
        fetchLatest: () => { throw new Error('should not be called'); },
        out: (s) => { captured += s; },
      });
      assert.strictEqual(result.action, 'opted-out');
      assert.strictEqual(captured, '');
    } finally {
      tmp.cleanup();
    }
  });

  it('is silent when offline and no cache exists', () => {
    const { tmp, scriptDir } = setup('2.3.3');
    try {
      let captured = '';
      const result = cu.run({
        now: 1000, homeDir: tmp.dir, scriptDir, env: {},
        fetchLatest: () => null, // simulate offline / timeout
        out: (s) => { captured += s; },
      });
      assert.strictEqual(result.action, 'no-latest');
      assert.strictEqual(captured, '');
    } finally {
      tmp.cleanup();
    }
  });

  it('returns no-version when the installed version cannot be resolved', () => {
    const tmp = createTempDir();
    try {
      const scriptDir = path.join(tmp.dir, 'bin');
      fs.mkdirSync(scriptDir, { recursive: true });
      const result = cu.run({
        now: 1000, homeDir: tmp.dir, scriptDir, env: {},
        fetchLatest: () => '2.4.0',
        out: () => {},
      });
      assert.strictEqual(result.action, 'no-version');
    } finally {
      tmp.cleanup();
    }
  });
});

describe('check-update: fail-silent contract (child process)', () => {
  it('exits 0 with empty stdout when opted out', () => {
    const tmp = createTempDir();
    try {
      const result = spawnSync('node', [SCRIPT], {
        env: { ...process.env, HOME: tmp.dir, TTM_NO_UPDATE_CHECK: '1' },
        timeout: 15000,
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, `exit 0 (stderr: ${result.stderr})`);
      assert.strictEqual(result.stdout, '', 'no output when opted out');
    } finally {
      tmp.cleanup();
    }
  });
});
