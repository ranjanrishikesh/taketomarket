'use strict';

// Tests for install.js injectSessionStartHook() — the npm/clone-path mechanism
// that registers the SessionStart update-check hook into ~/.claude/settings.json.
// Covers: fresh write, idempotency, merge into existing hooks, preservation of
// unrelated settings, corrupt-file recovery, and the command path shape.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createTempDir } = require('./helpers.cjs');

const install = require('../install.js');

function settingsPath(homeDir) {
  return path.join(homeDir, '.claude', 'settings.json');
}

function readSettings(homeDir) {
  return JSON.parse(fs.readFileSync(settingsPath(homeDir), 'utf8'));
}

function countOurHooks(settings) {
  let n = 0;
  for (const group of settings.hooks.SessionStart) {
    for (const h of group.hooks) {
      if (typeof h.command === 'string' && h.command.includes('check-update.cjs')) n++;
    }
  }
  return n;
}

describe('install: buildCheckUpdateCommand', () => {
  it('targets ~/.taketomarket/bin/check-update.cjs', () => {
    const cmd = install.buildCheckUpdateCommand('/home/alice');
    assert.ok(cmd.startsWith('node '), 'invokes node');
    assert.ok(
      cmd.includes(path.join('/home/alice', '.taketomarket', 'bin', 'check-update.cjs')),
      `command points at the shared base script; got: ${cmd}`
    );
  });
});

describe('install: buildCustomTarget', () => {
  it('expands a leading ~ and derives parentDir so a custom Claude path is detected', () => {
    const t = install.buildCustomTarget('~/.claude/skills', '/home/alice');
    assert.strictEqual(t.skillsDir, path.join('/home/alice', '.claude', 'skills'));
    // The main() gate matches parentDir === <home>/.claude — so this custom
    // path WILL get the update-check hook (the medium-sev finding).
    assert.strictEqual(t.parentDir, path.join('/home/alice', '.claude'));
    assert.strictEqual(t.label, 'Custom');
  });

  it('leaves a non-tilde absolute path intact and derives its parent', () => {
    const t = install.buildCustomTarget('/opt/agents/skills', '/home/alice');
    assert.strictEqual(t.skillsDir, '/opt/agents/skills');
    assert.strictEqual(t.parentDir, '/opt/agents');
  });

  it('does not expand a tilde embedded mid-path', () => {
    const t = install.buildCustomTarget('/srv/~backup/skills', '/home/alice');
    assert.strictEqual(t.skillsDir, '/srv/~backup/skills');
  });
});

describe('install: injectSessionStartHook', () => {
  it('creates settings.json with a SessionStart command hook when none exists', () => {
    const tmp = createTempDir();
    try {
      const added = install.injectSessionStartHook(tmp.dir);
      assert.strictEqual(added, true, 'reports a new hook was added');

      const settings = readSettings(tmp.dir);
      assert.ok(Array.isArray(settings.hooks.SessionStart), 'SessionStart is an array');
      assert.strictEqual(countOurHooks(settings), 1, 'exactly one update-check hook');

      const hook = settings.hooks.SessionStart[0].hooks[0];
      assert.strictEqual(hook.type, 'command');
      assert.ok(hook.command.includes('check-update.cjs'), 'command references the script');
    } finally {
      tmp.cleanup();
    }
  });

  it('is idempotent — second call adds nothing', () => {
    const tmp = createTempDir();
    try {
      assert.strictEqual(install.injectSessionStartHook(tmp.dir), true);
      assert.strictEqual(install.injectSessionStartHook(tmp.dir), false, 'second call is a no-op');

      const settings = readSettings(tmp.dir);
      assert.strictEqual(countOurHooks(settings), 1, 'no duplicate hook added');
    } finally {
      tmp.cleanup();
    }
  });

  it('preserves existing unrelated settings and hooks', () => {
    const tmp = createTempDir();
    try {
      const claudeDir = path.join(tmp.dir, '.claude');
      fs.mkdirSync(claudeDir, { recursive: true });
      const existing = {
        model: 'claude-opus-4-8',
        hooks: {
          SessionStart: [
            { hooks: [{ type: 'command', command: 'echo existing-session-hook' }] },
          ],
          PreToolUse: [
            { matcher: 'Bash', hooks: [{ type: 'command', command: 'echo pre' }] },
          ],
        },
      };
      fs.writeFileSync(settingsPath(tmp.dir), JSON.stringify(existing, null, 2));

      const added = install.injectSessionStartHook(tmp.dir);
      assert.strictEqual(added, true);

      const settings = readSettings(tmp.dir);
      assert.strictEqual(settings.model, 'claude-opus-4-8', 'unrelated top-level key preserved');
      assert.ok(
        settings.hooks.PreToolUse,
        'unrelated PreToolUse hook preserved'
      );
      assert.strictEqual(settings.hooks.SessionStart.length, 2, 'appended, did not replace');
      // The original session hook survives.
      const commands = settings.hooks.SessionStart.flatMap(g => g.hooks.map(h => h.command));
      assert.ok(commands.includes('echo existing-session-hook'), 'existing session hook retained');
      assert.strictEqual(countOurHooks(settings), 1, 'our hook added exactly once');
    } finally {
      tmp.cleanup();
    }
  });

  it('does not duplicate when our hook already present alongside others', () => {
    const tmp = createTempDir();
    try {
      install.injectSessionStartHook(tmp.dir); // first add
      // Add an unrelated hook, then call again — should still be a no-op for ours.
      const settings = readSettings(tmp.dir);
      settings.hooks.SessionStart.push({ hooks: [{ type: 'command', command: 'echo other' }] });
      fs.writeFileSync(settingsPath(tmp.dir), JSON.stringify(settings, null, 2));

      const added = install.injectSessionStartHook(tmp.dir);
      assert.strictEqual(added, false, 'no-op because ours is already present');
      assert.strictEqual(countOurHooks(readSettings(tmp.dir)), 1);
    } finally {
      tmp.cleanup();
    }
  });

  it('recovers from a corrupt settings.json by backing it up and recreating', () => {
    const tmp = createTempDir();
    try {
      const claudeDir = path.join(tmp.dir, '.claude');
      fs.mkdirSync(claudeDir, { recursive: true });
      fs.writeFileSync(settingsPath(tmp.dir), '{ this is not valid json');

      const added = install.injectSessionStartHook(tmp.dir);
      assert.strictEqual(added, true);
      assert.ok(fs.existsSync(settingsPath(tmp.dir) + '.bak'), 'corrupt file backed up to .bak');

      const settings = readSettings(tmp.dir);
      assert.strictEqual(countOurHooks(settings), 1, 'hook installed into fresh settings');
    } finally {
      tmp.cleanup();
    }
  });

  it('writes atomically — no leftover .tmp file', () => {
    const tmp = createTempDir();
    try {
      install.injectSessionStartHook(tmp.dir);
      assert.ok(!fs.existsSync(settingsPath(tmp.dir) + '.tmp'), 'no leftover .tmp file');
    } finally {
      tmp.cleanup();
    }
  });
});
