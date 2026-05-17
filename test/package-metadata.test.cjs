'use strict';

// Manifest field guard for package.json — Phase 15 D-15.
// Asserts every field/value required by Phase 15 (PKG-01..07) is present and well-formed.
// Catches accidental regressions during publish prep (Phase 16) or future edits.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const pkg = require('../package.json');
const REPO_ROOT = path.resolve(__dirname, '..');

describe('package.json metadata (PKG-01..07 + D-04)', () => {
  it('has repository field in canonical object form pointing at GitHub repo (PKG-01, D-02)', () => {
    assert.ok(pkg.repository, 'repository field exists');
    assert.strictEqual(typeof pkg.repository, 'object', 'repository is object form (not string)');
    assert.strictEqual(pkg.repository.type, 'git');
    assert.strictEqual(
      pkg.repository.url,
      'git+https://github.com/ranjanrishikesh/taketomarket.git'
    );
  });

  it('has homepage field pointing at the repo README (PKG-02, D-01)', () => {
    assert.strictEqual(
      pkg.homepage,
      'https://github.com/ranjanrishikesh/taketomarket#readme'
    );
  });

  it('has bugs.url field pointing at the repo issue tracker (PKG-03, D-01)', () => {
    assert.ok(pkg.bugs, 'bugs field exists');
    assert.strictEqual(
      pkg.bugs.url,
      'https://github.com/ranjanrishikesh/taketomarket/issues'
    );
  });

  it('has author field with name + email (PKG-04, D-03)', () => {
    assert.strictEqual(
      pkg.author,
      'Rishikesh Ranjan <59333266+ranjanrishikesh@users.noreply.github.com>'
    );
  });

  it('files[] includes agents/ — PKG-05 bug fix', () => {
    assert.ok(Array.isArray(pkg.files), 'files is an array');
    assert.ok(
      pkg.files.includes('agents/'),
      `files[] must include 'agents/' (PKG-05 bug fix); got: ${JSON.stringify(pkg.files)}`
    );
  });

  it('files[] includes LICENSE for explicitness (D-06)', () => {
    assert.ok(
      pkg.files.includes('LICENSE'),
      `files[] should include 'LICENSE' for explicitness; got: ${JSON.stringify(pkg.files)}`
    );
  });

  it('keywords array contains the 12 required terms (PKG-06, D-04)', () => {
    assert.ok(Array.isArray(pkg.keywords), 'keywords is an array');
    assert.ok(
      pkg.keywords.length >= 12,
      `keywords.length must be >= 12, got ${pkg.keywords.length}`
    );
    const required = [
      'claude-code', 'codex', 'marketing', 'campaigns', 'agent-skills',
      'gtm', 'growth', 'positioning', 'content-marketing',
      'marketing-automation', 'ai-agents', 'spec-driven',
    ];
    for (const term of required) {
      assert.ok(
        pkg.keywords.includes(term),
        `keywords[] must include '${term}'; got: ${JSON.stringify(pkg.keywords)}`
      );
    }
  });

  it('license field is MIT (PKG-07)', () => {
    assert.strictEqual(pkg.license, 'MIT');
  });

  it('LICENSE file exists at repo root with MIT header and contributors copyright (PKG-07, D-08)', () => {
    const licensePath = path.join(REPO_ROOT, 'LICENSE');
    assert.ok(fs.existsSync(licensePath), 'LICENSE file exists at repo root');
    const content = fs.readFileSync(licensePath, 'utf-8');
    assert.ok(content.includes('MIT License'), 'LICENSE contains "MIT License" header');
    assert.ok(
      content.includes('takeToMarket Contributors'),
      'LICENSE contains "takeToMarket Contributors" copyright (D-08 unchanged)'
    );
  });

  it('version is a valid semver (Phase 16 bumped 0.1.0 → 1.0.0)', () => {
    assert.match(pkg.version, /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/);
  });

  it('zero runtime dependencies (CLAUDE.md constraint preserved)', () => {
    assert.strictEqual(
      pkg.dependencies,
      undefined,
      'dependencies must not be set (zero-dep constraint)'
    );
    assert.strictEqual(
      pkg.peerDependencies,
      undefined,
      'peerDependencies must not be set'
    );
  });
});
