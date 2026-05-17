'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { scanCodebase } = require('../bin/lib/codebase-scan.cjs');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ttm-scan-'));
}

test('detects Node.js project from package.json', () => {
  const d = tmpDir();
  fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify({
    name: 'foo', version: '1.0.0', dependencies: { react: '^18.0.0' },
  }));
  const result = scanCodebase(d);
  assert.ok(result.stack.includes('node'));
  assert.ok(result.stack.includes('react'));
});

test('detects Python project from pyproject.toml', () => {
  const d = tmpDir();
  fs.writeFileSync(path.join(d, 'pyproject.toml'), '[project]\nname = "bar"\n');
  const result = scanCodebase(d);
  assert.ok(result.stack.includes('python'));
});

test('detects Go project from go.mod', () => {
  const d = tmpDir();
  fs.writeFileSync(path.join(d, 'go.mod'), 'module example.com/foo\ngo 1.21\n');
  const result = scanCodebase(d);
  assert.ok(result.stack.includes('go'));
});

test('detects monorepo from pnpm-workspace.yaml', () => {
  const d = tmpDir();
  fs.writeFileSync(path.join(d, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"\n');
  const result = scanCodebase(d);
  assert.strictEqual(result.monorepo, true);
});

test('returns feature-area candidates from top-level dirs', () => {
  const d = tmpDir();
  fs.mkdirSync(path.join(d, 'src'));
  fs.mkdirSync(path.join(d, 'src', 'auth'));
  fs.mkdirSync(path.join(d, 'src', 'billing'));
  fs.mkdirSync(path.join(d, 'src', 'dashboard'));
  const result = scanCodebase(d);
  assert.ok(result.featureCandidates.includes('auth'));
  assert.ok(result.featureCandidates.includes('billing'));
});
