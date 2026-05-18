'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { detectInstallMethod, readSentinel, isTakeToMarketRoot } = require('../bin/lib/install-detect.cjs');

function tmpDir(prefix = 'ttm-install-detect-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function makePluginRoot(dir, opts = {}) {
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'taketomarket', version: opts.version || '2.3.0' }));
  if (opts.withGit) fs.mkdirSync(path.join(dir, '.git'));
  return dir;
}

function makeSentinel(homeDir, method, source) {
  fs.mkdirSync(path.join(homeDir, '.taketomarket'), { recursive: true });
  fs.writeFileSync(
    path.join(homeDir, '.taketomarket', '.install-method'),
    JSON.stringify({ method, source, version: '2.3.0' }),
  );
}

function withEnv(overrides, fn) {
  const prev = {};
  for (const k of Object.keys(overrides)) {
    prev[k] = process.env[k];
    if (overrides[k] === undefined) delete process.env[k];
    else process.env[k] = overrides[k];
  }
  try {
    return fn();
  } finally {
    for (const k of Object.keys(prev)) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  }
}

test('returns shape { method, root, source } with valid method enum', () => {
  const home = tmpDir('ttm-home-');
  const result = withEnv(
    { CLAUDE_PLUGIN_ROOT: undefined, HOME: home },
    () => detectInstallMethod()
  );
  assert.ok(['clone', 'npm', 'plugin', 'unknown'].includes(result.method));
  assert.ok(result.root === null || typeof result.root === 'string');
  assert.ok(['sentinel', 'heuristic'].includes(result.source));
});

test('sentinel takes precedence over heuristic', () => {
  const home = tmpDir('ttm-home-');
  makeSentinel(home, 'clone', '/path/to/source');
  const result = withEnv({ CLAUDE_PLUGIN_ROOT: undefined, HOME: home }, () => detectInstallMethod());
  assert.strictEqual(result.method, 'clone');
  assert.strictEqual(result.source, 'sentinel');
  assert.strictEqual(result.root, '/path/to/source');
});

test('sentinel reports npm method correctly', () => {
  const home = tmpDir('ttm-home-');
  makeSentinel(home, 'npm', '/usr/local/lib/node_modules/taketomarket');
  const result = withEnv({ CLAUDE_PLUGIN_ROOT: undefined, HOME: home }, () => detectInstallMethod());
  assert.strictEqual(result.method, 'npm');
  assert.strictEqual(result.source, 'sentinel');
});

test('malformed sentinel falls through to heuristic', () => {
  const home = tmpDir('ttm-home-');
  fs.mkdirSync(path.join(home, '.taketomarket'));
  fs.writeFileSync(path.join(home, '.taketomarket', '.install-method'), 'not json{');
  const result = withEnv({ CLAUDE_PLUGIN_ROOT: undefined, HOME: home }, () => detectInstallMethod());
  assert.strictEqual(result.source, 'heuristic');
  assert.strictEqual(result.method, 'unknown');
});

test('heuristic: CLAUDE_PLUGIN_ROOT with .git/ + valid pkg returns clone', () => {
  const home = tmpDir('ttm-home-');
  const root = makePluginRoot(tmpDir('ttm-root-'), { withGit: true });
  const result = withEnv({ CLAUDE_PLUGIN_ROOT: root, HOME: home }, () => detectInstallMethod());
  assert.strictEqual(result.method, 'clone');
  assert.strictEqual(result.root, root);
  assert.strictEqual(result.source, 'heuristic');
});

test('heuristic: CLAUDE_PLUGIN_ROOT without .git/ + valid pkg returns npm', () => {
  const home = tmpDir('ttm-home-');
  const root = makePluginRoot(tmpDir('ttm-root-'));
  const result = withEnv({ CLAUDE_PLUGIN_ROOT: root, HOME: home }, () => detectInstallMethod());
  assert.strictEqual(result.method, 'npm');
  assert.strictEqual(result.root, root);
});

test('heuristic: CLAUDE_PLUGIN_ROOT without taketomarket package.json is ignored', () => {
  const home = tmpDir('ttm-home-');
  const fakeRoot = tmpDir('ttm-fake-');
  fs.writeFileSync(path.join(fakeRoot, 'package.json'), JSON.stringify({ name: 'something-else' }));
  const result = withEnv({ CLAUDE_PLUGIN_ROOT: fakeRoot, HOME: home }, () => detectInstallMethod());
  assert.strictEqual(result.method, 'unknown');
  assert.strictEqual(result.root, null);
});

test('heuristic: no candidate returns unknown', () => {
  const home = tmpDir('ttm-home-');
  const result = withEnv(
    { CLAUDE_PLUGIN_ROOT: undefined, HOME: home },
    () => detectInstallMethod()
  );
  assert.strictEqual(result.method, 'unknown');
  assert.strictEqual(result.root, null);
});

test('readSentinel returns null when file missing', () => {
  const home = tmpDir('ttm-home-');
  assert.strictEqual(readSentinel(home), null);
});

test('isTakeToMarketRoot rejects directories without matching package.json name', () => {
  const dir = tmpDir('ttm-root-');
  assert.strictEqual(isTakeToMarketRoot(dir), false);
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'other' }));
  assert.strictEqual(isTakeToMarketRoot(dir), false);
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'taketomarket' }));
  assert.strictEqual(isTakeToMarketRoot(dir), true);
});
