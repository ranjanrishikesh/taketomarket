'use strict';

const { describe, it, before, after, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { createTempDir } = require('./helpers.cjs');
const { cmdHealth, cmdInit } = require('../bin/lib/health.cjs');

/**
 * Reference files expected by health.cjs (duplicated here to avoid
 * coupling test assertions to the module's internal constant).
 */
const REFERENCE_FILES = [
  'POSITIONING.md', 'BRAND.md', 'ICP.md', 'CHANNELS.md', 'STATE.md',
  'CALENDAR.md', 'COMPETITORS.md', 'METRICS.md', 'LEARNINGS.md',
];

/**
 * Create a complete .taketomarket/ directory with CAMPAIGNS/ and all 9 reference files.
 * STATE.md gets valid frontmatter; other files get a heading.
 */
function createFullMarketing(baseDir) {
  const marketingDir = path.join(baseDir, '.taketomarket');
  const campaignsDir = path.join(marketingDir, 'CAMPAIGNS');
  fs.mkdirSync(campaignsDir, { recursive: true });
  for (const file of REFERENCE_FILES) {
    if (file === 'STATE.md') {
      fs.writeFileSync(path.join(marketingDir, file), '---\nstatus: active\n---\n# State\n');
    } else {
      fs.writeFileSync(path.join(marketingDir, file), `# ${file.replace('.md', '')}\n`);
    }
  }
  return marketingDir;
}

/**
 * Capture stdout.write calls and suppress actual output during a function call.
 * Returns the concatenated string written to stdout.
 */
function captureStdout(fn) {
  const chunks = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => { chunks.push(String(chunk)); return true; };
  try {
    fn();
  } finally {
    process.stdout.write = originalWrite;
  }
  return chunks.join('');
}

// ── Module exports ─────────────────────────────────────────────────────────

describe('health.cjs module exports', () => {
  it('exports cmdHealth and cmdInit as functions', () => {
    assert.strictEqual(typeof cmdHealth, 'function', 'cmdHealth is a function');
    assert.strictEqual(typeof cmdInit, 'function', 'cmdInit is a function');
  });
});

// ── cmdHealth basic mode ───────────────────────────────────────────────────

describe('cmdHealth basic mode', () => {

  describe('with complete .taketomarket/', () => {
    let tmp;
    let originalCwd;

    before(() => {
      tmp = createTempDir();
      createFullMarketing(tmp.dir);
      originalCwd = process.cwd;
      process.cwd = () => tmp.dir;
    });

    after(() => {
      process.cwd = originalCwd;
      tmp.cleanup();
    });

    it('reports healthy when all dirs and files exist', () => {
      const stdout = captureStdout(() => cmdHealth(false, false));
      const parsed = JSON.parse(stdout);
      assert.strictEqual(parsed.healthy, true, 'should be healthy');
      assert.ok(parsed.summary.includes('/'), 'summary contains slash (X/Y format)');
    });

    it('includes check entries for taketomarket_dir, campaigns_dir, and all ref files', () => {
      const stdout = captureStdout(() => cmdHealth(false, false));
      const parsed = JSON.parse(stdout);
      assert.ok(Array.isArray(parsed.checks), 'checks is an array');
      // 2 dirs + 9 ref files = 11 minimum
      assert.ok(parsed.checks.length >= 11, `expected >= 11 checks, got ${parsed.checks.length}`);
      const marketingCheck = parsed.checks.find(c => c.name === 'taketomarket_dir');
      assert.ok(marketingCheck, 'has taketomarket_dir check');
      assert.strictEqual(marketingCheck.status, 'pass', 'taketomarket_dir passes');
    });

    it('outputs raw summary string with HEALTHY', () => {
      const stdout = captureStdout(() => cmdHealth(true, false));
      assert.ok(stdout.includes('HEALTHY'), 'raw output contains HEALTHY');
    });
  });

  describe('with missing .taketomarket/', () => {
    let tmp;
    let originalCwd;

    before(() => {
      tmp = createTempDir();
      // No .taketomarket/ created -- empty temp dir
      originalCwd = process.cwd;
      process.cwd = () => tmp.dir;
    });

    after(() => {
      process.cwd = originalCwd;
      tmp.cleanup();
    });

    it('reports unhealthy when .taketomarket/ does not exist', () => {
      const stdout = captureStdout(() => cmdHealth(false, false));
      const parsed = JSON.parse(stdout);
      assert.strictEqual(parsed.healthy, false, 'should be unhealthy');
    });

    it('outputs UNHEALTHY in raw mode', () => {
      const stdout = captureStdout(() => cmdHealth(true, false));
      assert.ok(stdout.includes('UNHEALTHY'), 'raw output contains UNHEALTHY');
    });
  });

  describe('with partial .taketomarket/', () => {
    let tmp;
    let originalCwd;

    before(() => {
      tmp = createTempDir();
      // Create only .taketomarket/ dir (no CAMPAIGNS/, no ref files)
      fs.mkdirSync(path.join(tmp.dir, '.taketomarket'), { recursive: true });
      originalCwd = process.cwd;
      process.cwd = () => tmp.dir;
    });

    after(() => {
      process.cwd = originalCwd;
      tmp.cleanup();
    });

    it('reports unhealthy without CAMPAIGNS dir', () => {
      const stdout = captureStdout(() => cmdHealth(false, false));
      const parsed = JSON.parse(stdout);
      assert.strictEqual(parsed.healthy, false, 'should be unhealthy without CAMPAIGNS');
      const campaignsCheck = parsed.checks.find(c => c.name === 'campaigns_dir');
      assert.ok(campaignsCheck, 'has campaigns_dir check');
      assert.strictEqual(campaignsCheck.status, 'fail', 'campaigns_dir fails');
    });

    it('marks missing reference files as "missing" not "fail"', () => {
      const stdout = captureStdout(() => cmdHealth(false, false));
      const parsed = JSON.parse(stdout);
      const positioningCheck = parsed.checks.find(c => c.name === 'positioning_md');
      assert.ok(positioningCheck, 'has positioning_md check');
      assert.strictEqual(positioningCheck.status, 'missing', 'missing ref file uses "missing" status');
    });
  });
});

// ── cmdHealth full mode ────────────────────────────────────────────────────

describe('cmdHealth full mode', () => {

  describe('campaign state consistency', () => {
    let tmp;
    let originalCwd;

    before(() => {
      tmp = createTempDir();
      createFullMarketing(tmp.dir);
      // Create campaign with valid phase
      const campaignDir = path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'test-campaign');
      fs.mkdirSync(campaignDir, { recursive: true });
      fs.writeFileSync(
        path.join(campaignDir, 'STATE.md'),
        '---\nphase: created\n---\n# Campaign State\n'
      );
      originalCwd = process.cwd;
      process.cwd = () => tmp.dir;
    });

    after(() => {
      process.cwd = originalCwd;
      tmp.cleanup();
    });

    it('passes campaign state check for valid phase', () => {
      const stdout = captureStdout(() => cmdHealth(false, true));
      const parsed = JSON.parse(stdout);
      const check = parsed.checks.find(c => c.name === 'campaign_state_test-campaign');
      assert.ok(check, 'has campaign_state_test-campaign check');
      assert.strictEqual(check.status, 'pass', 'valid phase passes');
    });
  });

  describe('campaign with invalid phase', () => {
    let tmp;
    let originalCwd;

    before(() => {
      tmp = createTempDir();
      createFullMarketing(tmp.dir);
      // Create campaign with invalid phase
      const campaignDir = path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'bad-campaign');
      fs.mkdirSync(campaignDir, { recursive: true });
      fs.writeFileSync(
        path.join(campaignDir, 'STATE.md'),
        '---\nphase: invalid-phase\n---\n# Campaign State\n'
      );
      originalCwd = process.cwd;
      process.cwd = () => tmp.dir;
    });

    after(() => {
      process.cwd = originalCwd;
      tmp.cleanup();
    });

    it('fails campaign state check for invalid phase', () => {
      const stdout = captureStdout(() => cmdHealth(false, true));
      const parsed = JSON.parse(stdout);
      const check = parsed.checks.find(c => c.name && c.name.startsWith('campaign_state_'));
      assert.ok(check, 'has campaign_state_ check');
      assert.strictEqual(check.status, 'fail', 'invalid phase fails');
      assert.ok(check.detail.includes('invalid phase'), 'detail mentions invalid phase');
    });
  });

  describe('drift-log integrity', () => {
    let tmp;
    let originalCwd;

    before(() => {
      tmp = createTempDir();
      createFullMarketing(tmp.dir);
      originalCwd = process.cwd;
      process.cwd = () => tmp.dir;
    });

    after(() => {
      process.cwd = originalCwd;
      tmp.cleanup();
    });

    it('warns when no drift log exists', () => {
      const stdout = captureStdout(() => cmdHealth(false, true));
      const parsed = JSON.parse(stdout);
      const check = parsed.checks.find(c => c.name === 'drift_log_integrity');
      assert.ok(check, 'has drift_log_integrity check');
      assert.strictEqual(check.status, 'warn', 'missing drift log is a warning');
      assert.ok(check.detail.includes('no drift log yet'), 'detail says no drift log yet');
    });

    it('passes when drift log has single audit trail marker', () => {
      fs.writeFileSync(
        path.join(tmp.dir, '.taketomarket', 'DRIFT-LOG.md'),
        '# Drift Log\n\n<!-- Audit Trail -->\n| type | timestamp | source |\n'
      );
      const stdout = captureStdout(() => cmdHealth(false, true));
      const parsed = JSON.parse(stdout);
      const check = parsed.checks.find(c => c.name === 'drift_log_integrity');
      assert.ok(check, 'has drift_log_integrity check');
      assert.strictEqual(check.status, 'pass', 'single audit trail marker passes');
    });

    it('fails when drift log has duplicate audit trail markers', () => {
      fs.writeFileSync(
        path.join(tmp.dir, '.taketomarket', 'DRIFT-LOG.md'),
        '# Drift Log\n\n<!-- Audit Trail -->\n| type | timestamp | source |\n\n<!-- Audit Trail -->\n| type | timestamp | source |\n'
      );
      const stdout = captureStdout(() => cmdHealth(false, true));
      const parsed = JSON.parse(stdout);
      const check = parsed.checks.find(c => c.name === 'drift_log_integrity');
      assert.ok(check, 'has drift_log_integrity check');
      assert.strictEqual(check.status, 'fail', 'duplicate markers fail');
      assert.ok(check.detail.includes('duplicate'), 'detail mentions duplicate');
    });
  });

  describe('gate consistency', () => {
    let tmp;
    let originalCwd;

    before(() => {
      tmp = createTempDir();
      createFullMarketing(tmp.dir);
      originalCwd = process.cwd;
      process.cwd = () => tmp.dir;
    });

    after(() => {
      process.cwd = originalCwd;
      tmp.cleanup();
    });

    it('passes for valid gate values', () => {
      const campaignDir = path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'gated-campaign');
      fs.mkdirSync(campaignDir, { recursive: true });
      fs.writeFileSync(
        path.join(campaignDir, 'STATE.md'),
        '---\nphase: verified\ngate.positioning_check: pass\n---\n# Campaign\n'
      );
      const stdout = captureStdout(() => cmdHealth(false, true));
      const parsed = JSON.parse(stdout);
      const check = parsed.checks.find(c => c.name && c.name.startsWith('gate_consistency_'));
      assert.ok(check, 'has gate_consistency_ check');
      assert.strictEqual(check.status, 'pass', 'valid gate value passes');
    });

    it('fails for invalid gate values', () => {
      const campaignDir = path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'bad-gate-campaign');
      fs.mkdirSync(campaignDir, { recursive: true });
      fs.writeFileSync(
        path.join(campaignDir, 'STATE.md'),
        '---\nphase: verified\ngate.positioning_check: INVALID_VALUE\n---\n# Campaign\n'
      );
      const stdout = captureStdout(() => cmdHealth(false, true));
      const parsed = JSON.parse(stdout);
      const check = parsed.checks.find(c => c.name === 'gate_consistency_bad-gate-campaign');
      assert.ok(check, 'has gate_consistency_bad-gate-campaign check');
      assert.strictEqual(check.status, 'fail', 'invalid gate value fails');
      assert.ok(check.detail.includes('invalid gate'), 'detail mentions invalid gate');
    });
  });
});

// ── cmdInit ────────────────────────────────────────────────────────────────

describe('cmdInit', () => {

  describe('fully initialized', () => {
    let tmp;
    let originalCwd;

    before(() => {
      tmp = createTempDir();
      createFullMarketing(tmp.dir);
      originalCwd = process.cwd;
      process.cwd = () => tmp.dir;
    });

    after(() => {
      process.cwd = originalCwd;
      tmp.cleanup();
    });

    it('reports initialized when all reference files present', () => {
      const stdout = captureStdout(() => cmdInit(false));
      const parsed = JSON.parse(stdout);
      assert.strictEqual(parsed.initialized, true, 'should be initialized');
      assert.strictEqual(parsed.reference_files_count, 9, 'all 9 ref files counted');
      assert.strictEqual(parsed.total_expected, 9, 'total expected is 9');
    });

    it('outputs "initialized" in raw mode', () => {
      const stdout = captureStdout(() => cmdInit(true));
      assert.ok(stdout.includes('initialized'), 'raw output says initialized');
      // Must not say "not initialized"
      assert.ok(!stdout.startsWith('not'), 'raw output does not start with "not"');
    });
  });

  describe('not initialized', () => {
    let tmp;
    let originalCwd;

    before(() => {
      tmp = createTempDir();
      // No .taketomarket/ directory
      originalCwd = process.cwd;
      process.cwd = () => tmp.dir;
    });

    after(() => {
      process.cwd = originalCwd;
      tmp.cleanup();
    });

    it('reports not initialized when .taketomarket/ missing', () => {
      const stdout = captureStdout(() => cmdInit(false));
      const parsed = JSON.parse(stdout);
      assert.strictEqual(parsed.initialized, false, 'should not be initialized');
      assert.strictEqual(parsed.taketomarket_dir, false, 'taketomarket_dir is false');
    });

    it('outputs "not initialized" in raw mode', () => {
      const stdout = captureStdout(() => cmdInit(true));
      assert.ok(stdout.includes('not initialized'), 'raw output says not initialized');
    });
  });

  describe('partially initialized', () => {
    let tmp;
    let originalCwd;

    before(() => {
      tmp = createTempDir();
      // Create .taketomarket/ with only STATE.md (1 of 9 files)
      const marketingDir = path.join(tmp.dir, '.taketomarket');
      fs.mkdirSync(marketingDir, { recursive: true });
      fs.writeFileSync(path.join(marketingDir, 'STATE.md'), '---\nstatus: active\n---\n# State\n');
      originalCwd = process.cwd;
      process.cwd = () => tmp.dir;
    });

    after(() => {
      process.cwd = originalCwd;
      tmp.cleanup();
    });

    it('reports not initialized with incomplete reference files', () => {
      const stdout = captureStdout(() => cmdInit(false));
      const parsed = JSON.parse(stdout);
      assert.strictEqual(parsed.initialized, false, 'should not be initialized');
      assert.strictEqual(parsed.reference_files_count, 1, 'only 1 ref file found');
      assert.strictEqual(parsed.taketomarket_dir, true, 'taketomarket_dir exists');
    });
  });
});
