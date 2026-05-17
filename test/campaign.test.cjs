'use strict';

const { describe, it, before, after, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { createTempDir, createMockCampaign } = require('./helpers.cjs');
const campaign = require('../bin/lib/campaign.cjs');

// ---------------------------------------------------------------------------
// Sentinel error thrown by exitMock to halt execution after error() calls.
// Without this, mocked process.exit lets the function continue executing
// past the error() call, which can cause destructive side-effects
// (e.g., cmdCampaignArchive copying the entire CAMPAIGNS directory).
// ---------------------------------------------------------------------------
class ExitError extends Error {
  constructor(code) {
    super(`process.exit(${code})`);
    this.exitCode = code;
  }
}

// ---------------------------------------------------------------------------
// 1. Module exports
// ---------------------------------------------------------------------------

describe('campaign.cjs module exports', () => {
  it('exports all 6 expected functions', () => {
    const expected = [
      'cmdCampaignInit',
      'cmdCampaignState',
      'cmdCampaignUpdate',
      'cmdCampaignList',
      'cmdCampaignArchive',
      'cmdRepurposeManifest',
    ];
    for (const fn of expected) {
      assert.strictEqual(typeof campaign[fn], 'function', `exports.${fn} is a function`);
    }
  });
});

// ---------------------------------------------------------------------------
// Helpers: capture stdout JSON / raw output from mocked writes
// ---------------------------------------------------------------------------

function captureJson(stdoutMock) {
  const calls = stdoutMock.mock.calls;
  for (let i = calls.length - 1; i >= 0; i--) {
    const chunk = calls[i].arguments[0];
    if (typeof chunk === 'string') {
      try {
        return JSON.parse(chunk);
      } catch { /* not JSON, keep looking */ }
    }
  }
  return null;
}

function captureRaw(stdoutMock) {
  const calls = stdoutMock.mock.calls;
  for (let i = calls.length - 1; i >= 0; i--) {
    const chunk = calls[i].arguments[0];
    if (typeof chunk === 'string') return chunk;
  }
  return '';
}

/**
 * Assert that calling `fn` triggers the error() -> process.exit(1) path.
 * Uses ExitError sentinel thrown by the exit mock to cleanly halt execution.
 */
function assertExits(fn) {
  try {
    fn();
    // If we get here without ExitError, the function did not call error().
    // This is a test failure.
    assert.fail('Expected process.exit(1) to be called but function returned normally');
  } catch (e) {
    if (e instanceof ExitError) {
      assert.strictEqual(e.exitCode, 1, 'exit code is 1');
    } else {
      throw e; // re-throw unexpected errors
    }
  }
}

// ---------------------------------------------------------------------------
// 2. cmdCampaignInit
// ---------------------------------------------------------------------------

describe('cmdCampaignInit', () => {
  let tmp, originalCwd, stdoutMock, stderrMock, exitMock;

  before(() => {
    tmp = createTempDir();
    fs.mkdirSync(path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS'), { recursive: true });
    originalCwd = process.cwd;
    process.cwd = () => tmp.dir;
  });

  after(() => {
    process.cwd = originalCwd;
    tmp.cleanup();
  });

  beforeEach(() => {
    stdoutMock = mock.method(process.stdout, 'write', () => true);
    stderrMock = mock.method(process.stderr, 'write', () => true);
    // Default: no-op exit mock (for happy-path tests)
    exitMock = mock.method(process, 'exit', () => {});
  });

  afterEach(() => {
    stdoutMock.mock.restore();
    stderrMock.mock.restore();
    exitMock.mock.restore();
  });

  it('creates campaign directory structure with STATE.md, RESEARCH.md, BRIEF.md, ASSETS/', () => {
    campaign.cmdCampaignInit('test-camp', 'Test Campaign', false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(parsed.created, true);
    assert.strictEqual(parsed.slug, 'test-camp');
    const campDir = path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'test-camp');
    assert.ok(fs.existsSync(path.join(campDir, 'STATE.md')), 'STATE.md exists');
    assert.ok(fs.existsSync(path.join(campDir, 'RESEARCH.md')), 'RESEARCH.md exists');
    assert.ok(fs.existsSync(path.join(campDir, 'BRIEF.md')), 'BRIEF.md exists');
    assert.ok(fs.statSync(path.join(campDir, 'ASSETS')).isDirectory(), 'ASSETS/ is a directory');
  });

  it('outputs slug in raw mode', () => {
    campaign.cmdCampaignInit('raw-camp', 'Raw Campaign', true);
    const raw = captureRaw(stdoutMock);
    assert.ok(raw.includes('raw-camp'), 'raw output contains slug');
  });

  it('writes STATE.md with phase=created in frontmatter', () => {
    const content = fs.readFileSync(
      path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'test-camp', 'STATE.md'),
      'utf-8'
    );
    assert.ok(content.includes('phase: created'), 'contains phase: created');
    assert.ok(content.includes('campaign: test-camp'), 'contains campaign: test-camp');
  });

  it('sanitizes slug (strips non-alphanumeric except hyphens)', () => {
    campaign.cmdCampaignInit('Hello World!', 'Test', false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(parsed.slug, 'helloworld');
    assert.ok(
      fs.existsSync(path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'helloworld', 'STATE.md')),
      'sanitized directory created'
    );
  });

  it('errors when campaign already exists', () => {
    // Swap exit mock to throw sentinel for error tests
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdCampaignInit('test-camp', 'Duplicate', false));
  });

  it('errors on empty slug', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdCampaignInit('', 'Test', false));
  });

  it('errors on empty name', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdCampaignInit('valid-slug-err', '', false));
  });
});

// ---------------------------------------------------------------------------
// 3. cmdCampaignState
// ---------------------------------------------------------------------------

describe('cmdCampaignState', () => {
  let tmp, originalCwd, stdoutMock, stderrMock, exitMock;

  before(() => {
    tmp = createTempDir();
    fs.mkdirSync(path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS'), { recursive: true });
    createMockCampaign(tmp.dir, 'state-test', { phase: 'briefed' });
    originalCwd = process.cwd;
    process.cwd = () => tmp.dir;
  });

  after(() => {
    process.cwd = originalCwd;
    tmp.cleanup();
  });

  beforeEach(() => {
    stdoutMock = mock.method(process.stdout, 'write', () => true);
    stderrMock = mock.method(process.stderr, 'write', () => true);
    exitMock = mock.method(process, 'exit', () => {});
  });

  afterEach(() => {
    stdoutMock.mock.restore();
    stderrMock.mock.restore();
    exitMock.mock.restore();
  });

  it('reads campaign state and outputs frontmatter as JSON', () => {
    campaign.cmdCampaignState('state-test', false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(parsed.exists, true);
    assert.strictEqual(parsed.phase, 'briefed');
  });

  it('includes body_preview in output', () => {
    campaign.cmdCampaignState('state-test', false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(typeof parsed.body_preview, 'string');
  });

  it('reports not found for non-existent campaign', () => {
    campaign.cmdCampaignState('nonexistent', false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(parsed.exists, false);
  });

  it('outputs raw JSON string in raw mode', () => {
    campaign.cmdCampaignState('state-test', true);
    const raw = captureRaw(stdoutMock);
    assert.ok(typeof raw === 'string' && raw.length > 0, 'raw output is a non-empty string');
  });
});

// ---------------------------------------------------------------------------
// 4. cmdCampaignUpdate
// ---------------------------------------------------------------------------

describe('cmdCampaignUpdate', () => {
  let tmp, originalCwd, stdoutMock, stderrMock, exitMock;

  before(() => {
    tmp = createTempDir();
    fs.mkdirSync(path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS'), { recursive: true });
    createMockCampaign(tmp.dir, 'update-test', { phase: 'created' });
    originalCwd = process.cwd;
    process.cwd = () => tmp.dir;
  });

  after(() => {
    process.cwd = originalCwd;
    tmp.cleanup();
  });

  beforeEach(() => {
    stdoutMock = mock.method(process.stdout, 'write', () => true);
    stderrMock = mock.method(process.stderr, 'write', () => true);
    exitMock = mock.method(process, 'exit', () => {});
  });

  afterEach(() => {
    stdoutMock.mock.restore();
    stderrMock.mock.restore();
    exitMock.mock.restore();
  });

  it('updates a field in campaign STATE.md', () => {
    campaign.cmdCampaignUpdate('update-test', 'phase', 'produced', false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(parsed.updated, 'phase');
    assert.strictEqual(parsed.value, 'produced');
    const content = fs.readFileSync(
      path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'update-test', 'STATE.md'),
      'utf-8'
    );
    assert.ok(content.includes('phase: produced'), 'disk has updated phase');
  });

  it('sets last_updated timestamp', () => {
    campaign.cmdCampaignUpdate('update-test', 'name', 'Updated Name', false);
    const parsed = captureJson(stdoutMock);
    assert.ok(parsed.last_updated, 'last_updated is present');
    assert.match(parsed.last_updated, /^\d{4}-\d{2}-\d{2}T/, 'last_updated is ISO format');
  });

  it('rejects unknown field names', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdCampaignUpdate('update-test', 'bad_field', 'value', false));
  });

  it('accepts gate.* field updates', () => {
    campaign.cmdCampaignUpdate('update-test', 'gate.positioning_check', 'pass', false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(parsed.updated, 'gate.positioning_check');
  });

  it('errors on missing field', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdCampaignUpdate('update-test', '', 'val', false));
  });

  it('errors on missing value', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdCampaignUpdate('update-test', 'phase', '', false));
  });

  it('errors on non-existent campaign', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdCampaignUpdate('ghost', 'phase', 'created', false));
  });
});

// ---------------------------------------------------------------------------
// 5. cmdCampaignList
// ---------------------------------------------------------------------------

describe('cmdCampaignList', () => {
  let tmp, originalCwd, stdoutMock, stderrMock, exitMock;

  before(() => {
    tmp = createTempDir();
    fs.mkdirSync(path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS'), { recursive: true });
    createMockCampaign(tmp.dir, 'camp-active', { phase: 'produced' });
    createMockCampaign(tmp.dir, 'camp-shipped', {
      phase: 'shipped',
      extraFields: { 'phase.shipped': new Date().toISOString() },
    });
    createMockCampaign(tmp.dir, 'camp-created', { phase: 'created' });
    originalCwd = process.cwd;
    process.cwd = () => tmp.dir;
  });

  after(() => {
    process.cwd = originalCwd;
    tmp.cleanup();
  });

  beforeEach(() => {
    stdoutMock = mock.method(process.stdout, 'write', () => true);
    stderrMock = mock.method(process.stderr, 'write', () => true);
    exitMock = mock.method(process, 'exit', () => {});
  });

  afterEach(() => {
    stdoutMock.mock.restore();
    stderrMock.mock.restore();
    exitMock.mock.restore();
  });

  it('lists all campaigns with no filter', () => {
    campaign.cmdCampaignList('', '', false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(parsed.count, 3);
    assert.ok(Array.isArray(parsed.campaigns), 'campaigns is an array');
    assert.strictEqual(parsed.campaigns.length, 3);
  });

  it('filters to active campaigns with --active', () => {
    campaign.cmdCampaignList('--active', '', false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(parsed.count, 2);
  });

  it('outputs raw count string', () => {
    campaign.cmdCampaignList('', '', true);
    const raw = captureRaw(stdoutMock);
    assert.ok(raw.includes('3 campaigns'), 'raw output contains "3 campaigns"');
  });

  it('returns empty when no campaigns directory exists', () => {
    const emptyTmp = createTempDir();
    const savedCwd = process.cwd;
    process.cwd = () => emptyTmp.dir;
    try {
      campaign.cmdCampaignList('', '', false);
      const parsed = captureJson(stdoutMock);
      assert.strictEqual(parsed.count, 0);
    } finally {
      process.cwd = savedCwd;
      emptyTmp.cleanup();
    }
  });

  it('errors on mutually exclusive --active and --since', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdCampaignList('--active', '30d', false));
  });
});

// ---------------------------------------------------------------------------
// 6. cmdCampaignArchive
// ---------------------------------------------------------------------------

describe('cmdCampaignArchive', () => {
  let tmp, originalCwd, stdoutMock, stderrMock, exitMock;

  before(() => {
    tmp = createTempDir();
    fs.mkdirSync(path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS'), { recursive: true });
    originalCwd = process.cwd;
    process.cwd = () => tmp.dir;
  });

  after(() => {
    process.cwd = originalCwd;
    tmp.cleanup();
  });

  beforeEach(() => {
    stdoutMock = mock.method(process.stdout, 'write', () => true);
    stderrMock = mock.method(process.stderr, 'write', () => true);
    exitMock = mock.method(process, 'exit', () => {});
  });

  afterEach(() => {
    stdoutMock.mock.restore();
    stderrMock.mock.restore();
    exitMock.mock.restore();
  });

  it('archives a shipped campaign to ARCHIVE/', () => {
    createMockCampaign(tmp.dir, 'arch-test', { phase: 'shipped' });
    campaign.cmdCampaignArchive('arch-test', false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(parsed.archived, true);
    assert.ok(
      fs.existsSync(path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'ARCHIVE', 'arch-test', 'STATE.md')),
      'archived STATE.md exists'
    );
    assert.ok(
      !fs.existsSync(path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'arch-test')),
      'source directory removed'
    );
  });

  it('updates archived STATE.md with phase=archived', () => {
    const archivedState = fs.readFileSync(
      path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'ARCHIVE', 'arch-test', 'STATE.md'),
      'utf-8'
    );
    assert.ok(archivedState.includes('phase: archived'), 'contains phase: archived');
    assert.ok(archivedState.includes('archive.archived_at:'), 'contains archive.archived_at');
  });

  it('archives a learned campaign', () => {
    createMockCampaign(tmp.dir, 'learn-test', { phase: 'learned' });
    campaign.cmdCampaignArchive('learn-test', false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(parsed.archived, true);
  });

  it('errors when campaign is not shipped or learned', () => {
    createMockCampaign(tmp.dir, 'not-ready', { phase: 'created' });
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdCampaignArchive('not-ready', false));
  });

  it('errors on empty slug', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdCampaignArchive('', false));
  });

  it('errors when campaign does not exist', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdCampaignArchive('ghost-camp', false));
  });
});

// ---------------------------------------------------------------------------
// 7. cmdRepurposeManifest
// ---------------------------------------------------------------------------

describe('cmdRepurposeManifest', () => {
  let tmp, originalCwd, stdoutMock, stderrMock, exitMock;

  before(() => {
    tmp = createTempDir();
    fs.mkdirSync(path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS'), { recursive: true });
    createMockCampaign(tmp.dir, 'repurpose-test', { phase: 'produced' });
    originalCwd = process.cwd;
    process.cwd = () => tmp.dir;
  });

  after(() => {
    process.cwd = originalCwd;
    tmp.cleanup();
  });

  beforeEach(() => {
    stdoutMock = mock.method(process.stdout, 'write', () => true);
    stderrMock = mock.method(process.stderr, 'write', () => true);
    exitMock = mock.method(process, 'exit', () => {});
  });

  afterEach(() => {
    stdoutMock.mock.restore();
    stderrMock.mock.restore();
    exitMock.mock.restore();
  });

  it('creates MANIFEST.json and adds derivatives', () => {
    campaign.cmdRepurposeManifest('repurpose-test', 1, [
      { asset_id: 10, name: 'Twitter Thread', type: 'derivative', channel: 'twitter', file: 'twitter-thread.md' },
    ], false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(parsed.updated, true);
    assert.strictEqual(parsed.derivatives_added, 1);
    const manifestPath = path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'repurpose-test', 'MANIFEST.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.strictEqual(manifest.derivatives.length, 1);
    assert.strictEqual(manifest.derivatives[0].source_asset_id, 1);
  });

  it('appends to existing MANIFEST.json', () => {
    campaign.cmdRepurposeManifest('repurpose-test', 1, [
      { asset_id: 20, name: 'LinkedIn Post', type: 'derivative', channel: 'linkedin', file: 'linkedin-post.md' },
    ], false);
    const parsed = captureJson(stdoutMock);
    assert.strictEqual(parsed.updated, true);
    const manifestPath = path.join(tmp.dir, '.taketomarket', 'CAMPAIGNS', 'repurpose-test', 'MANIFEST.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.strictEqual(manifest.derivatives.length, 2);
  });

  it('errors on duplicate asset_id', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdRepurposeManifest('repurpose-test', 1, [
      { asset_id: 10, name: 'Duplicate', type: 'derivative', channel: 'twitter', file: 'dup.md' },
    ], false));
  });

  it('errors on missing slug', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdRepurposeManifest('', 1, [
      { asset_id: 30, name: 'X', type: 'derivative', channel: 'x', file: 'x.md' },
    ], false));
  });

  it('errors on missing sourceAssetId', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdRepurposeManifest('repurpose-test', null, [
      { asset_id: 30, name: 'X', type: 'derivative', channel: 'x', file: 'x.md' },
    ], false));
  });

  it('errors on empty derivatives array', () => {
    exitMock.mock.restore();
    exitMock = mock.method(process, 'exit', (code) => { throw new ExitError(code); });
    assertExits(() => campaign.cmdRepurposeManifest('repurpose-test', 1, [], false));
  });
});
