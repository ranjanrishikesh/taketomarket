'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { createTempDir } = require('./helpers.cjs');

const install = require('../install.js');

describe('install.js module exports', () => {
  it('can be required without triggering install', () => {
    assert.ok(install, 'module exports a truthy object');
  });

  it('exports all expected functions', () => {
    const expectedFns = [
      'validateInstall', 'copyDirSync', 'dirExists', 'fileExists', 'printResults',
      'registerPlugin', 'parseRuntimeChoices', 'buildRuntimeTargets', 'getInstalledRuntimes',
      'readSkillDescriptions', 'shouldProceed', 'getClaudeStatus', 'checkStatus',
      'confirmInstall', 'printInstallSummary', 'copyPackageBase', 'installSkillsForRuntime',
    ];
    for (const fn of expectedFns) {
      assert.strictEqual(typeof install[fn], 'function', `exports.${fn} is a function`);
    }
  });

  it('exports DIRS_TO_COPY as a non-empty array', () => {
    assert.ok(Array.isArray(install.DIRS_TO_COPY), 'DIRS_TO_COPY is an array');
    assert.ok(install.DIRS_TO_COPY.length > 0, 'DIRS_TO_COPY is not empty');
  });

  it('exports FILES_TO_COPY as a non-empty array', () => {
    assert.ok(Array.isArray(install.FILES_TO_COPY), 'FILES_TO_COPY is an array');
    assert.ok(install.FILES_TO_COPY.length > 0, 'FILES_TO_COPY is not empty');
  });
});

describe('install.js dirExists', () => {
  let tmp;

  before(() => {
    tmp = createTempDir();
  });

  after(() => {
    tmp.cleanup();
  });

  it('returns true for an existing directory', () => {
    assert.strictEqual(install.dirExists(tmp.dir), true);
  });

  it('returns false for a non-existent path', () => {
    assert.strictEqual(install.dirExists(path.join(tmp.dir, 'nope')), false);
  });
});

describe('install.js fileExists', () => {
  let tmp;
  let testFile;

  before(() => {
    tmp = createTempDir();
    testFile = path.join(tmp.dir, 'test-file.txt');
    fs.writeFileSync(testFile, 'hello');
  });

  after(() => {
    tmp.cleanup();
  });

  it('returns true for an existing file', () => {
    assert.strictEqual(install.fileExists(testFile), true);
  });

  it('returns false for a non-existent path', () => {
    assert.strictEqual(install.fileExists(path.join(tmp.dir, 'nope.txt')), false);
  });
});

describe('registerPlugin', () => {
  let tmp;

  before(() => { tmp = createTempDir(); });
  after(() => { tmp.cleanup(); });

  it('creates installed_plugins.json with correct structure', () => {
    const installPath = path.join(tmp.dir, 'plugin');
    const homeDir = tmp.dir;
    install.registerPlugin(installPath, '2.0.0', homeDir);

    const registryPath = path.join(homeDir, '.claude', 'plugins', 'installed_plugins.json');
    assert.ok(install.fileExists(registryPath), 'registry file created');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    assert.strictEqual(registry.version, 2, 'root version is 2');
    assert.ok(registry.plugins, 'has plugins object');
    const entry = registry.plugins['taketomarket@npm'];
    assert.ok(Array.isArray(entry) && entry.length === 1, 'entry is array of 1');
    assert.strictEqual(entry[0].scope, 'user');
    assert.strictEqual(entry[0].installPath, installPath);
    assert.strictEqual(entry[0].version, '2.0.0');
    assert.ok(entry[0].installedAt, 'installedAt set');
    assert.ok(entry[0].lastUpdated, 'lastUpdated set');
  });

  it('preserves existing plugins when upserting taketomarket entry', () => {
    const homeDir2 = path.join(tmp.dir, 'home2');
    fs.mkdirSync(path.join(homeDir2, '.claude', 'plugins'), { recursive: true });
    const registryPath = path.join(homeDir2, '.claude', 'plugins', 'installed_plugins.json');
    fs.writeFileSync(registryPath, JSON.stringify({
      version: 2,
      plugins: {
        'other-plugin@npm': [{ scope: 'user', installPath: '/some/path', version: '1.0.0',
          installedAt: '2026-01-01T00:00:00.000Z', lastUpdated: '2026-01-01T00:00:00.000Z', gitCommitSha: null }],
      },
    }));

    install.registerPlugin('/new/path', '2.0.0', homeDir2);
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    assert.ok(registry.plugins['other-plugin@npm'], 'existing plugin preserved');
    assert.ok(registry.plugins['taketomarket@npm'], 'new entry added');
  });

  it('preserves installedAt but updates lastUpdated on reinstall', () => {
    const homeDir3 = path.join(tmp.dir, 'home3');
    const installPath = path.join(homeDir3, 'plugin');
    install.registerPlugin(installPath, '2.0.0', homeDir3);
    const registryPath = path.join(homeDir3, '.claude', 'plugins', 'installed_plugins.json');
    const first = JSON.parse(fs.readFileSync(registryPath, 'utf8')).plugins['taketomarket@npm'][0];

    install.registerPlugin(installPath, '2.0.1', homeDir3);
    const second = JSON.parse(fs.readFileSync(registryPath, 'utf8')).plugins['taketomarket@npm'][0];

    assert.strictEqual(second.installedAt, first.installedAt, 'installedAt unchanged');
    assert.strictEqual(second.version, '2.0.1', 'version updated');
  });

  it('backs up corrupted JSON and recreates', () => {
    const homeDir4 = path.join(tmp.dir, 'home4');
    const pluginsDir = path.join(homeDir4, '.claude', 'plugins');
    fs.mkdirSync(pluginsDir, { recursive: true });
    const registryPath = path.join(pluginsDir, 'installed_plugins.json');
    fs.writeFileSync(registryPath, 'not valid json {{{');

    install.registerPlugin('/some/path', '2.0.0', homeDir4);

    assert.ok(install.fileExists(registryPath + '.bak'), 'backup created');
    assert.ok(install.fileExists(registryPath), 'registry recreated');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    assert.strictEqual(registry.version, 2);
  });
});

describe('parseRuntimeChoices', () => {
  it('parses single choice', () => {
    assert.deepStrictEqual(install.parseRuntimeChoices('1'), ['claude']);
  });

  it('parses comma-separated choices', () => {
    assert.deepStrictEqual(install.parseRuntimeChoices('1,3'), ['claude', 'cursor']);
  });

  it('parses "6" as all named runtimes', () => {
    const result = install.parseRuntimeChoices('6');
    assert.deepStrictEqual(result, ['claude', 'codex', 'cursor', 'windsurf', 'gemini']);
  });

  it('parses "7" as custom', () => {
    assert.deepStrictEqual(install.parseRuntimeChoices('7'), ['custom']);
  });

  it('returns null for empty input', () => {
    assert.strictEqual(install.parseRuntimeChoices(''), null);
  });

  it('returns null for out-of-range input', () => {
    assert.strictEqual(install.parseRuntimeChoices('8'), null);
  });

  it('returns null for non-numeric input', () => {
    assert.strictEqual(install.parseRuntimeChoices('abc'), null);
  });

  it('deduplicates choices', () => {
    assert.deepStrictEqual(install.parseRuntimeChoices('1,1'), ['claude']);
  });
});

describe('buildRuntimeTargets', () => {
  it('returns an object with expected keys', () => {
    const targets = install.buildRuntimeTargets('/fake/home');
    assert.ok(targets.claude, 'has claude');
    assert.ok(targets.codex, 'has codex');
    assert.ok(targets.cursor, 'has cursor');
    assert.ok(targets.windsurf, 'has windsurf');
    assert.ok(targets.gemini, 'has gemini');
  });

  it('claude target has correct skillsDir using provided homeDir', () => {
    const targets = install.buildRuntimeTargets('/test/home');
    assert.ok(targets.claude.skillsDir.startsWith('/test/home'), 'skillsDir uses homeDir');
    assert.ok(targets.claude.skillsDir.includes('.claude/skills'), 'claude uses .claude/skills');
  });

  it('each runtime has skillsDir and parentDir', () => {
    const targets = install.buildRuntimeTargets('/test/home');
    for (const name of ['claude', 'codex', 'cursor', 'windsurf', 'gemini']) {
      assert.ok(targets[name].skillsDir, `${name} has skillsDir`);
      assert.ok(targets[name].parentDir, `${name} has parentDir`);
    }
  });

  it('correct skillsDir paths for all runtimes', () => {
    const targets = install.buildRuntimeTargets('/home');
    assert.ok(targets.codex.skillsDir.includes('.codex/skills'));
    assert.ok(targets.cursor.skillsDir.includes('.cursor/skills'));
    assert.ok(targets.windsurf.skillsDir.includes('.codeium/windsurf/skills'));
    assert.ok(targets.gemini.skillsDir.includes('.gemini/skills'));
  });
});

describe('readSkillDescriptions', () => {
  let tmp;

  before(() => {
    tmp = createTempDir();
    const skills = ['ttm-init', 'ttm-produce'];
    for (const skill of skills) {
      const dir = path.join(tmp.dir, 'skills', skill);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'SKILL.md'),
        `---\nname: ${skill}\ndescription: >\n  Description for ${skill}.\n---\n`);
    }
  });

  after(() => { tmp.cleanup(); });

  it('returns array of {name, description} sorted by name', () => {
    const result = install.readSkillDescriptions(tmp.dir);
    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, 'ttm-init');
    assert.strictEqual(result[0].description, 'Description for ttm-init.');
    assert.strictEqual(result[1].name, 'ttm-produce');
  });

  it('skips dirs without SKILL.md', () => {
    fs.mkdirSync(path.join(tmp.dir, 'skills', 'not-a-skill'), { recursive: true });
    const result = install.readSkillDescriptions(tmp.dir);
    assert.ok(result.every(r => r.name !== 'not-a-skill'));
  });
});

describe('getInstalledRuntimes', () => {
  let tmp;

  before(() => {
    tmp = createTempDir();
    fs.mkdirSync(path.join(tmp.dir, '.claude'), { recursive: true });
  });

  after(() => { tmp.cleanup(); });

  it('detects claude when ~/.claude exists', () => {
    const result = install.getInstalledRuntimes(tmp.dir);
    assert.ok(result.includes('claude'));
  });

  it('does not include codex when ~/.codex missing', () => {
    const result = install.getInstalledRuntimes(tmp.dir);
    assert.ok(!result.includes('codex'));
  });
});

describe('shouldProceed (confirmInstall logic)', () => {
  it('returns true immediately when yesFlag is true', () => {
    assert.strictEqual(install.shouldProceed(true), true);
  });
});

describe('checkStatus', () => {
  let tmp;

  before(() => {
    tmp = createTempDir();
    const skillDir = path.join(tmp.dir, '.claude', 'skills', 'ttm-init');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: ttm-init\n---\n');
  });

  after(() => { tmp.cleanup(); });

  it('getClaudeStatus returns INSTALLED when ttm-init/SKILL.md exists', () => {
    const status = install.getClaudeStatus(tmp.dir);
    assert.strictEqual(status.installed, true);
    assert.ok(typeof status.skillCount === 'number', 'skillCount is a number');
  });

  it('getClaudeStatus returns NOT INSTALLED when skills dir missing', () => {
    const status = install.getClaudeStatus(path.join(tmp.dir, 'nonexistent'));
    assert.strictEqual(status.installed, false);
  });
});

describe('copyPackageBase', () => {
  let tmp;

  before(() => { tmp = createTempDir(); });
  after(() => { tmp.cleanup(); });

  it('copies workflows and templates to ~/.taketomarket/', () => {
    install.copyPackageBase(install.PACKAGE_ROOT, tmp.dir);
    const base = path.join(tmp.dir, '.taketomarket');
    assert.ok(install.dirExists(base), '.taketomarket created');
    assert.ok(install.dirExists(path.join(base, 'workflows')), 'workflows copied');
    assert.ok(install.dirExists(path.join(base, 'templates')), 'templates copied');
  });
});

describe('installSkillsForRuntime', () => {
  let tmp;

  before(() => { tmp = createTempDir(); });
  after(() => { tmp.cleanup(); });

  it('installs SKILL.md files and replaces ${CLAUDE_PLUGIN_ROOT}', () => {
    const skillsDir = path.join(tmp.dir, 'skills');
    const count = install.installSkillsForRuntime(skillsDir, install.PACKAGE_ROOT, tmp.dir);
    assert.ok(count > 0, 'installed at least one skill');

    // Check a skill was written
    const initSkill = path.join(skillsDir, 'ttm-init', 'SKILL.md');
    assert.ok(install.fileExists(initSkill), 'ttm-init/SKILL.md created');

    // Check ${CLAUDE_PLUGIN_ROOT} was replaced
    const content = fs.readFileSync(initSkill, 'utf8');
    assert.ok(!content.includes('${CLAUDE_PLUGIN_ROOT}'), 'CLAUDE_PLUGIN_ROOT replaced');
    assert.ok(content.includes('.taketomarket'), 'replaced with .taketomarket path');
  });
});

describe('printInstallSummary', () => {
  let tmp;
  let output;
  const origLog = console.log;

  before(() => {
    tmp = createTempDir();
    for (const [name, desc] of [['ttm-init', 'Set up workspace.'], ['ttm-produce', 'Run production.']]) {
      const dir = path.join(tmp.dir, 'skills', name);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'SKILL.md'),
        `---\nname: ${name}\ndescription: >\n  ${desc}\n---\n`);
    }
  });

  after(() => { tmp.cleanup(); console.log = origLog; });

  it('prints slash command list from packageRoot/skills/', () => {
    const lines = [];
    console.log = (...args) => lines.push(args.join(' '));
    install.printInstallSummary(tmp.dir);
    console.log = origLog;
    const joined = lines.join('\n');
    assert.ok(joined.includes('/ttm-init'), 'includes ttm-init');
    assert.ok(joined.includes('/ttm-produce'), 'includes ttm-produce');
    assert.ok(joined.includes('Set up workspace'), 'includes description');
  });
});
