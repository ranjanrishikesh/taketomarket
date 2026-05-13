'use strict';

// E2E install tests — invokes install.js as a real child process against an isolated HOME.
// Per CONTEXT.md D-01 (separate from install.test.cjs) and D-04/D-05 (execFileSync, not require).
// Closes TEST-09 (full install flow) and TEST-10 (--dry-run validation).
//
// Platform note: tests use $HOME override (POSIX). Windows uses $USERPROFILE for os.homedir() —
// these tests are not expected to run on Windows in v1.1 (CI is Linux/macOS only).

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createTempDir, createMockHome } = require('./helpers.cjs');

const install = require('../install.js');
const PROJECT_ROOT = path.resolve(__dirname, '..');
const INSTALL_JS = path.join(PROJECT_ROOT, 'install.js');

// ── Local helpers (per D-16: stay inside the test file, NOT in helpers.cjs) ──

/**
 * Run install.js as a child process and capture stdout/stderr/exit.
 * Uses spawnSync (NOT execFileSync) so stderr is captured on BOTH success and
 * non-zero exit paths — execFileSync drops stderr on the success return value.
 * Argument-array form per T-14-01 (no shell-string concatenation).
 *
 * @param {string[]} args - CLI args passed after install.js
 * @param {object} env - Full env object (caller must include process.env spread + HOME override)
 * @returns {{ stdout: string, stderr: string, status: number }}
 */
function runInstall(args, env) {
  const result = spawnSync('node', [INSTALL_JS, ...args], {
    env,
    cwd: PROJECT_ROOT,
    timeout: 30000,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error) {
    throw result.error; // Surface spawn-level failures (ENOENT, timeout, etc.)
  }
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    status: typeof result.status === 'number' ? result.status : 1,
  };
}

/**
 * Build env object with isolated HOME pointing at the given temp dir.
 * Spreads process.env so PATH and Node infra remain intact.
 * @param {string} tmpDir
 * @returns {object}
 */
function envWithHome(tmpDir) {
  return { ...process.env, HOME: tmpDir };
}

// ── Scenario 1: claude happy path (D-11.a) ───────────────────────────────────

describe('install-e2e: claude happy path', () => {
  let tmp;

  before(() => {
    tmp = createTempDir('ttm-e2e-claude-');
  });

  after(() => {
    tmp.cleanup();
  });

  it('exits 0, prints banner, and copies all DIRS_TO_COPY + FILES_TO_COPY to ~/.claude/plugins/taketomarket/', () => {
    const result = runInstall(['--runtime', 'claude'], envWithHome(tmp.dir));

    assert.strictEqual(result.status, 0, `install should exit 0 (stderr: ${result.stderr})`);
    assert.ok(
      result.stdout.includes('takeToMarket installer'),
      'stdout contains banner "takeToMarket installer"'
    );
    assert.ok(
      result.stdout.includes('Installing to Claude Code'),
      'stdout contains "Installing to Claude Code"'
    );
    assert.ok(
      result.stdout.includes('Installation complete!'),
      'stdout contains "Installation complete!"'
    );

    const targetDir = path.join(tmp.dir, '.claude', 'plugins', 'taketomarket');

    for (const d of install.DIRS_TO_COPY) {
      assert.strictEqual(
        install.dirExists(path.join(targetDir, d)),
        true,
        `DIRS_TO_COPY entry "${d}" exists at target`
      );
    }
    for (const f of install.FILES_TO_COPY) {
      assert.strictEqual(
        install.fileExists(path.join(targetDir, f)),
        true,
        `FILES_TO_COPY entry "${f}" exists at target`
      );
    }

    // Spot-check files (D-13)
    assert.strictEqual(
      install.fileExists(path.join(targetDir, 'bin', 'ttm-tools.cjs')),
      true,
      'spot-check: bin/ttm-tools.cjs exists at target'
    );
    assert.strictEqual(
      install.fileExists(path.join(targetDir, 'skills', 'ttm-init', 'SKILL.md')),
      true,
      'spot-check: skills/ttm-init/SKILL.md exists at target'
    );
  });
});

// ── Scenario 2: codex happy path (D-11.b) ────────────────────────────────────

describe('install-e2e: codex happy path', () => {
  let tmp;

  before(() => {
    tmp = createTempDir('ttm-e2e-codex-');
  });

  after(() => {
    tmp.cleanup();
  });

  it('exits 0, prints "Runtime: codex", and copies all files to ~/.codex/plugins/taketomarket/', () => {
    const result = runInstall(['--runtime', 'codex'], envWithHome(tmp.dir));

    assert.strictEqual(result.status, 0, `install should exit 0 (stderr: ${result.stderr})`);
    assert.ok(
      result.stdout.includes('Installing to Codex (OpenAI)'),
      'stdout contains "Installing to Codex (OpenAI)"'
    );
    assert.ok(
      result.stdout.includes('Installation complete!'),
      'stdout contains "Installation complete!"'
    );

    const targetDir = path.join(tmp.dir, '.codex', 'plugins', 'taketomarket');

    for (const d of install.DIRS_TO_COPY) {
      assert.strictEqual(
        install.dirExists(path.join(targetDir, d)),
        true,
        `DIRS_TO_COPY entry "${d}" exists at codex target`
      );
    }
    for (const f of install.FILES_TO_COPY) {
      assert.strictEqual(
        install.fileExists(path.join(targetDir, f)),
        true,
        `FILES_TO_COPY entry "${f}" exists at codex target`
      );
    }

    // Spot-check files (D-13)
    assert.strictEqual(
      install.fileExists(path.join(targetDir, 'bin', 'ttm-tools.cjs')),
      true,
      'spot-check: bin/ttm-tools.cjs exists at codex target'
    );
    assert.strictEqual(
      install.fileExists(path.join(targetDir, 'skills', 'ttm-init', 'SKILL.md')),
      true,
      'spot-check: skills/ttm-init/SKILL.md exists at codex target'
    );
  });
});

// ── Scenario 3: auto-detect runtime from .claude/ (D-11.c) ───────────────────

describe('install-e2e: auto-detect runtime from .claude/', () => {
  let tmp;

  before(() => {
    tmp = createTempDir('ttm-e2e-autodetect-');
    // Pre-create .claude/plugins/taketomarket/ as the auto-detect signal.
    createMockHome(tmp.dir);
  });

  after(() => {
    tmp.cleanup();
  });

  it('detects claude runtime from existing .claude/ dir when no --runtime flag passed', () => {
    const result = runInstall([], envWithHome(tmp.dir));

    assert.strictEqual(result.status, 0, `install should exit 0 (stderr: ${result.stderr})`);
    assert.ok(
      result.stdout.includes('Installing to Claude Code'),
      'stdout contains "Installing to Claude Code" (auto-detected)'
    );

    const targetDir = path.join(tmp.dir, '.claude', 'plugins', 'taketomarket');
    assert.strictEqual(
      install.dirExists(path.join(targetDir, 'bin')),
      true,
      'bin/ exists at claude auto-detected target (sanity check)'
    );
  });
});

// ── Scenario 4: --dry-run on clean HOME (D-11.d, TEST-10) ────────────────────

describe('install-e2e: --dry-run on clean HOME', () => {
  let tmp;

  before(() => {
    tmp = createTempDir('ttm-e2e-dryrun-clean-');
  });

  after(() => {
    tmp.cleanup();
  });

  it('prints dry-run banners and does NOT create the target directory', () => {
    const result = runInstall(['--dry-run', '--runtime', 'claude'], envWithHome(tmp.dir));

    assert.strictEqual(result.status, 0, `dry-run should exit 0 (stderr: ${result.stderr})`);
    assert.ok(
      result.stdout.includes('[DRY RUN] Validating source package...'),
      'stdout contains "[DRY RUN] Validating source package..."'
    );
    assert.ok(
      result.stdout.includes('[DRY RUN] No files written.'),
      'stdout contains "[DRY RUN] No files written."'
    );
    assert.ok(
      result.stdout.includes('[PASS]'),
      'stdout contains at least one "[PASS]" validation row'
    );

    // Core D-14 assertion: target dir was NOT created.
    const targetDir = path.join(tmp.dir, '.claude', 'plugins', 'taketomarket');
    assert.strictEqual(
      install.dirExists(targetDir),
      false,
      'target dir does NOT exist after dry-run on clean HOME'
    );
  });
});

// ── Scenario 5: --dry-run after a real install (D-11.e) ──────────────────────

describe('install-e2e: --dry-run after a real install', () => {
  let tmp;

  before(() => {
    tmp = createTempDir('ttm-e2e-dryrun-installed-');
  });

  after(() => {
    tmp.cleanup();
  });

  it('preserves the prior install and reports validation passes against the source package', () => {
    // First: real install
    const installResult = runInstall(['--runtime', 'claude'], envWithHome(tmp.dir));
    assert.strictEqual(
      installResult.status,
      0,
      `prerequisite install should exit 0 (stderr: ${installResult.stderr})`
    );

    const targetDir = path.join(tmp.dir, '.claude', 'plugins', 'taketomarket');
    assert.strictEqual(
      install.dirExists(targetDir),
      true,
      'target dir exists after first real install'
    );

    // Second: dry-run on installed HOME
    const dryResult = runInstall(['--dry-run', '--runtime', 'claude'], envWithHome(tmp.dir));

    assert.strictEqual(dryResult.status, 0, `dry-run should exit 0 (stderr: ${dryResult.stderr})`);
    assert.ok(
      dryResult.stdout.includes('[DRY RUN] No files written.'),
      'stdout contains "[DRY RUN] No files written."'
    );
    assert.ok(
      dryResult.stdout.includes('[PASS]'),
      'stdout contains "[PASS]" rows (validation against source package)'
    );

    // Read-only proof: prior install still intact after dry-run.
    assert.strictEqual(
      install.dirExists(targetDir),
      true,
      'target dir still exists after dry-run (dry-run is read-only)'
    );
    assert.strictEqual(
      install.fileExists(path.join(targetDir, 'bin', 'ttm-tools.cjs')),
      true,
      'spot-check file from prior install still present after dry-run'
    );
  });
});

// ── Scenario 6: unknown --runtime arg (D-11.f) ───────────────────────────────

describe('install-e2e: unknown --runtime arg defaults to claude with warning', () => {
  let tmp;

  before(() => {
    tmp = createTempDir('ttm-e2e-unknown-runtime-');
  });

  after(() => {
    tmp.cleanup();
  });

  it('warns about unknown runtime, defaults to claude, and completes install', () => {
    const result = runInstall(['--runtime', 'banana'], envWithHome(tmp.dir));

    assert.strictEqual(
      result.status,
      0,
      `install should exit 0 even with unknown runtime (stderr: ${result.stderr})`
    );

    // console.warn writes to stderr in Node — assert against stderr.
    // Substring match without trailing period for assertion robustness.
    assert.ok(
      result.stderr.includes('Warning: Unknown runtime "banana"'),
      `stderr contains unknown runtime warning (got stderr: ${JSON.stringify(result.stderr)})`
    );
    assert.ok(
      result.stdout.includes('Installing to Claude Code'),
      'stdout contains "Installing to Claude Code" (defaulted from unknown)'
    );

    const targetDir = path.join(tmp.dir, '.claude', 'plugins', 'taketomarket');
    assert.strictEqual(
      install.dirExists(targetDir),
      true,
      'claude target dir exists after unknown-runtime fallback install'
    );
  });
});

// ── Scenario 7: --version flag short-circuit (D-14, CLI-01) ──────────────────

describe('install-e2e: --version flag prints version and exits without writing', () => {
  let tmp;

  before(() => {
    tmp = createTempDir('ttm-e2e-version-');
  });

  after(() => {
    tmp.cleanup();
  });

  it('prints exactly the package version + newline, exits 0, and creates no target directory', () => {
    const expectedVersion = require('../package.json').version;
    const result = runInstall(['--version'], envWithHome(tmp.dir));

    assert.strictEqual(result.status, 0, `--version should exit 0 (stderr: ${result.stderr})`);
    assert.strictEqual(
      result.stdout,
      `${expectedVersion}\n`,
      `stdout should be exactly "${expectedVersion}\\n", got ${JSON.stringify(result.stdout)}`
    );

    // Short-circuit proof: no target dir created on either runtime.
    const claudeTarget = path.join(tmp.dir, '.claude', 'plugins', 'taketomarket');
    const codexTarget = path.join(tmp.dir, '.codex', 'plugins', 'taketomarket');
    assert.strictEqual(install.dirExists(claudeTarget), false, '.claude target NOT created');
    assert.strictEqual(install.dirExists(codexTarget), false, '.codex target NOT created');
  });

  it('-v short form prints the same version + newline and exits 0', () => {
    const expectedVersion = require('../package.json').version;
    const result = runInstall(['-v'], envWithHome(tmp.dir));

    assert.strictEqual(result.status, 0, `-v should exit 0 (stderr: ${result.stderr})`);
    assert.strictEqual(
      result.stdout,
      `${expectedVersion}\n`,
      `-v stdout should be exactly "${expectedVersion}\\n", got ${JSON.stringify(result.stdout)}`
    );
  });
});

// ── Scenario 8: install banner contains version (D-14, CLI-02) ───────────────

describe('install-e2e: install banner contains version string', () => {
  let tmp;

  before(() => {
    tmp = createTempDir('ttm-e2e-banner-');
  });

  after(() => {
    tmp.cleanup();
  });

  it('stdout contains "takeToMarket installer vX.Y.Z" matching package.json version', () => {
    const expectedVersion = require('../package.json').version;
    const result = runInstall(['--runtime', 'claude'], envWithHome(tmp.dir));

    assert.strictEqual(result.status, 0, `install should exit 0 (stderr: ${result.stderr})`);
    assert.ok(
      result.stdout.includes(`takeToMarket installer v${expectedVersion}`),
      `stdout should contain "takeToMarket installer v${expectedVersion}", got: ${result.stdout.slice(0, 200)}`
    );
  });
});
