'use strict';

const { describe, it, before, after, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { createTempDir, createMockMarketing } = require('./helpers.cjs');
const { cmdStateRead, cmdStateUpdate } = require('../bin/lib/state.cjs');

describe('state.cjs', () => {
  let tmp, originalCwd, stdoutMock, stderrMock, exitMock;

  before(() => {
    tmp = createTempDir('ttm-state-test-');
    createMockMarketing(tmp.dir);
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

  describe('module exports', () => {
    it('exports cmdStateRead and cmdStateUpdate as functions', () => {
      assert.strictEqual(typeof cmdStateRead, 'function');
      assert.strictEqual(typeof cmdStateUpdate, 'function');
    });
  });

  describe('cmdStateRead', () => {
    it('reads STATE.md and outputs frontmatter as JSON', () => {
      cmdStateRead(false);
      const written = stdoutMock.mock.calls[0].arguments[0];
      const parsed = JSON.parse(written);
      assert.strictEqual(parsed.exists, true);
      assert.strictEqual(parsed.status, 'active');
    });

    it('includes body_preview in output', () => {
      cmdStateRead(false);
      const written = stdoutMock.mock.calls[0].arguments[0];
      const parsed = JSON.parse(written);
      assert.strictEqual(typeof parsed.body_preview, 'string');
      assert.ok(parsed.body_preview.includes('Marketing State'));
    });

    it('outputs raw JSON string when raw=true', () => {
      cmdStateRead(true);
      const written = stdoutMock.mock.calls[0].arguments[0];
      assert.strictEqual(typeof written, 'string');
      // raw mode outputs the stringified frontmatter (not the full result object)
      assert.ok(written.length > 0);
    });

    it('reports not found when STATE.md does not exist', () => {
      const statePath = path.join(tmp.dir, '.taketomarket', 'STATE.md');
      const backupPath = statePath + '.bak';
      try {
        fs.renameSync(statePath, backupPath);
        cmdStateRead(false);
        const written = stdoutMock.mock.calls[0].arguments[0];
        const parsed = JSON.parse(written);
        assert.strictEqual(parsed.exists, false);
        assert.ok(parsed.error.includes('not found'));
      } finally {
        fs.renameSync(backupPath, statePath);
      }
    });
  });

  describe('cmdStateUpdate', () => {
    it('updates a field in STATE.md frontmatter', () => {
      cmdStateUpdate('campaign_count', '5', false);
      const written = stdoutMock.mock.calls[0].arguments[0];
      const parsed = JSON.parse(written);
      assert.strictEqual(parsed.updated, 'campaign_count');
      assert.strictEqual(parsed.value, '5');

      // Verify on disk
      const content = fs.readFileSync(
        path.join(tmp.dir, '.taketomarket', 'STATE.md'),
        'utf-8'
      );
      assert.ok(content.includes('campaign_count: 5'));
    });

    it('sets last_updated timestamp on update', () => {
      cmdStateUpdate('foo', 'bar', false);
      const written = stdoutMock.mock.calls[0].arguments[0];
      const parsed = JSON.parse(written);
      assert.ok(parsed.last_updated);
      assert.match(parsed.last_updated, /^\d{4}-\d{2}-\d{2}T/);
    });

    it('preserves existing frontmatter fields on update', () => {
      const contentBefore = fs.readFileSync(
        path.join(tmp.dir, '.taketomarket', 'STATE.md'),
        'utf-8'
      );
      assert.ok(contentBefore.includes('status: active'));

      cmdStateUpdate('new_field', 'new_value', false);

      const contentAfter = fs.readFileSync(
        path.join(tmp.dir, '.taketomarket', 'STATE.md'),
        'utf-8'
      );
      assert.ok(contentAfter.includes('status: active'));
      assert.ok(contentAfter.includes('new_field: new_value'));
    });

    it('errors on missing field name', () => {
      cmdStateUpdate('', 'val', false);
      assert.ok(exitMock.mock.calls.length >= 1);
    });

    it('errors on missing value', () => {
      cmdStateUpdate('field', undefined, false);
      assert.ok(exitMock.mock.calls.length >= 1);
    });

    it('errors when STATE.md does not exist', () => {
      const statePath = path.join(tmp.dir, '.taketomarket', 'STATE.md');
      const backupPath = statePath + '.bak';
      try {
        fs.renameSync(statePath, backupPath);
        cmdStateUpdate('x', 'y', false);
        assert.ok(exitMock.mock.calls.length >= 1);
      } finally {
        fs.renameSync(backupPath, statePath);
      }
    });
  });
});
