#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// ── Constants ────────────────────────────────────────────────────────────────

const PACKAGE_ROOT = __dirname;
const VERSION = require('./package.json').version;

const DIRS_TO_COPY = [
  '.claude-plugin',
  'skills',
  'workflows',
  'templates',
  'references',
  'playbooks',
  'gates',
  'bin',
  'agents',
  'hooks',
];

const FILES_TO_COPY = [
  'settings.json',
];

// ── Runtime Selection ─────────────────────────────────────────────────────────

const RUNTIME_MENU = ['claude', 'codex', 'cursor', 'windsurf', 'gemini', 'agents'];

/**
 * Parse user input from the runtime selection prompt.
 * @param {string} input - Raw user input (e.g., '1,3' or '6')
 * @returns {string[]|null} Array of runtime names, or null if invalid
 */
function parseRuntimeChoices(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed === '7') return [...RUNTIME_MENU];
  if (trimmed === '8') return ['custom'];

  const parts = trimmed.split(',').map(s => s.trim());
  const names = new Set();
  for (const part of parts) {
    const n = parseInt(part, 10);
    if (isNaN(n) || n < 1 || n > 8) return null;
    if (n === 7) return [...RUNTIME_MENU];
    if (n === 8) return ['custom'];
    names.add(RUNTIME_MENU[n - 1]);
  }
  return [...names];
}

/**
 * Build the install target map for all known runtimes.
 * @param {string} [homeDir] - Home directory (injectable for tests)
 * @returns {Object.<string, {label, skillsDir, parentDir}>}
 */
function buildRuntimeTargets(homeDir = os.homedir()) {
  return {
    claude: {
      label: 'Claude Code',
      skillsDir: path.join(homeDir, '.claude', 'skills'),
      parentDir: path.join(homeDir, '.claude'),
    },
    codex: {
      label: 'Codex (OpenAI)',
      skillsDir: path.join(homeDir, '.codex', 'skills'),
      parentDir: path.join(homeDir, '.codex'),
    },
    cursor: {
      label: 'Cursor',
      skillsDir: path.join(homeDir, '.cursor', 'skills'),
      parentDir: path.join(homeDir, '.cursor'),
    },
    windsurf: {
      label: 'Windsurf',
      skillsDir: path.join(homeDir, '.codeium', 'windsurf', 'skills'),
      parentDir: path.join(homeDir, '.codeium'),
    },
    gemini: {
      label: 'Gemini CLI',
      skillsDir: path.join(homeDir, '.gemini', 'skills'),
      parentDir: path.join(homeDir, '.gemini'),
    },
    agents: {
      label: 'All runtimes (~/.agents/skills/ — universal)',
      skillsDir: path.join(homeDir, '.agents', 'skills'),
      parentDir: path.join(homeDir, '.agents'),
    },
  };
}

/**
 * Interactively ask user which runtimes to install to.
 * Falls back to auto-detect when stdin is not a TTY or --runtime flag is set.
 * @param {string[]} args - process.argv slice
 * @param {string} [homeDir]
 * @returns {Promise<Array<{label, dir, parentDir, register, partial}>>}
 */
async function promptRuntimeSelection(args, homeDir = os.homedir()) {
  // Legacy --runtime flag: bypass interactive prompt
  const runtimeIdx = args.indexOf('--runtime');
  if (runtimeIdx !== -1 && runtimeIdx + 1 < args.length) {
    const name = args[runtimeIdx + 1].toLowerCase();
    const allTargets = buildRuntimeTargets(homeDir);
    if (!allTargets[name] && name !== 'custom') {
      console.warn(`Warning: Unknown runtime "${name}". Defaulting to claude.`);
      return [allTargets.claude];
    }
    return name === 'custom' ? [] : [allTargets[name]];
  }

  // Non-TTY fallback: auto-detect installed runtimes
  if (!process.stdin.isTTY) {
    const detected = getInstalledRuntimes(homeDir);
    const allTargets = buildRuntimeTargets(homeDir);
    if (detected.length === 0) {
      console.log('Note: No known runtimes detected. Defaulting to Claude Code.');
      return [allTargets.claude];
    }
    console.log(`Note: Non-interactive mode. Auto-detected: ${detected.join(', ')}`);
    return detected.map(name => allTargets[name]);
  }

  // Interactive prompt
  const { createInterface } = require('node:readline');
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const ask = (question) => new Promise(resolve => rl.question(question, resolve));

  console.log('');
  console.log('Which AI coding tool(s) are you using? (select all that apply)');
  console.log('');
  console.log('  1. Claude Code');
  console.log('  2. Codex (OpenAI)');
  console.log('  3. Cursor');
  console.log('  4. Windsurf');
  console.log('  5. Gemini CLI');
  console.log('  6. All runtimes via ~/.agents/skills/ (universal — works for Codex, Cursor, Windsurf, Gemini)');
  console.log('  7. All of the above');
  console.log('  8. Let me type a custom path');
  console.log('');

  let choices = null;
  let attempts = 0;
  while (choices === null && attempts < 2) {
    const input = await ask('Your choice (comma-separated, e.g. 1,3): ');
    choices = parseRuntimeChoices(input);
    if (choices === null) {
      console.log('Invalid input. Please enter numbers 1-8 separated by commas.');
      attempts++;
    }
  }

  if (choices === null) {
    rl.close();
    console.error('Invalid input after 2 attempts. Exiting.');
    console.log('Something went wrong? File an issue: https://github.com/ranjanrishikesh/taketomarket/issues');
    process.exit(1);
  }

  let customPath = null;
  if (choices.includes('custom')) {
    customPath = await ask('Enter install path: ');
    customPath = customPath.trim();
    if (!customPath) {
      rl.close();
      console.error('Custom path cannot be empty.');
      process.exit(1);
    }
  }

  rl.close();

  const allTargets = buildRuntimeTargets(homeDir);
  const result = [];
  for (const name of choices) {
    if (name === 'custom') {
      result.push(buildCustomTarget(customPath, homeDir));
    } else {
      result.push(allTargets[name]);
    }
  }
  return result;
}

/**
 * Build an install target for a user-typed custom path. Expands a leading `~`
 * to the home dir (so a literal `~/.claude/skills` does not create a stray `~`
 * directory) and derives parentDir from the path so the Claude-target gate in
 * main() can recognise a custom path that lands under ~/.claude and still wire
 * the SessionStart update-check hook.
 * @param {string} customPath
 * @param {string} [homeDir]
 * @returns {{label: string, skillsDir: string, parentDir: string}}
 */
function buildCustomTarget(customPath, homeDir = os.homedir()) {
  const expanded = customPath.replace(/^~(?=$|[/\\])/, homeDir);
  return { label: 'Custom', skillsDir: expanded, parentDir: path.dirname(expanded) };
}

// ── Runtime detection ────────────────────────────────────────────────────────

/**
 * Detect target runtime from CLI args or environment sniffing.
 * Priority: --runtime flag > .claude/ dir > .codex/ dir > default claude
 * @param {string[]} args - CLI arguments
 * @returns {string} 'claude' or 'codex'
 */
function detectRuntime(args) {
  // Check --runtime flag
  const runtimeIdx = args.indexOf('--runtime');
  if (runtimeIdx !== -1 && runtimeIdx + 1 < args.length) {
    const value = args[runtimeIdx + 1].toLowerCase();
    if (value === 'claude' || value === 'codex') {
      return value;
    }
    console.warn(`Warning: Unknown runtime "${args[runtimeIdx + 1]}". Defaulting to claude.`);
    return 'claude';
  }

  // Check for .claude/ directory
  if (dirExists(path.join(os.homedir(), '.claude'))) {
    return 'claude';
  }

  // Check for .codex/ directory
  if (dirExists(path.join(os.homedir(), '.codex'))) {
    return 'codex';
  }

  // Default
  console.log('Note: Defaulting to Claude Code. Use --runtime codex if using Codex.');
  return 'claude';
}

// ── File helpers ─────────────────────────────────────────────────────────────

/**
 * Check if a path exists and is a directory.
 * @param {string} p - Path to check
 * @returns {boolean}
 */
function dirExists(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a path exists and is a file.
 * @param {string} p - Path to check
 * @returns {boolean}
 */
function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * Recursively copy a directory. Skips symlinks with a warning.
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isSymbolicLink()) {
      console.warn(`  Warning: Skipping symlink ${entry.name}`);
      continue;
    }

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ── Package Base & Per-Runtime Skill Install ──────────────────────────────────

const PACKAGE_BASE_DIRS = ['workflows', 'templates', 'references', 'playbooks', 'gates', 'bin', 'agents', 'hooks'];
const PACKAGE_BASE_FILES = ['settings.json', 'package.json'];

/**
 * Classify how this installer was invoked so /ttm-update can pick the right upgrade path later.
 * Returns 'clone' if the source tree is a git checkout, 'npm' if it lives inside node_modules
 * or the npm cache, 'plugin' if it's the Claude Code plugin cache, else 'unknown'.
 * @param {string} packageRoot
 * @returns {'clone'|'npm'|'plugin'|'unknown'}
 */
function classifyInstallMethod(packageRoot) {
  if (dirExists(path.join(packageRoot, '.git'))) return 'clone';
  if (packageRoot.includes(path.sep + 'node_modules' + path.sep)) return 'npm';
  if (packageRoot.includes(path.sep + '.npm' + path.sep)) return 'npm';
  if (packageRoot.includes(path.sep + 'claude-plugins-official' + path.sep)) return 'plugin';
  return 'unknown';
}

/**
 * Write the install-method sentinel so /ttm-update can read it without re-deriving from copied files.
 * @param {string} destDir - ~/.taketomarket/
 * @param {string} packageRoot
 */
function writeInstallSentinel(destDir, packageRoot) {
  const sentinel = {
    method: classifyInstallMethod(packageRoot),
    source: packageRoot,
    version: VERSION,
    installed_at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(destDir, '.install-method'), JSON.stringify(sentinel, null, 2) + '\n');
}

/**
 * Copy non-skill package files to ~/.taketomarket/ (shared across all runtimes).
 * @param {string} packageRoot - Source npm package root
 * @param {string} [homeDir]
 */
function copyPackageBase(packageRoot, homeDir = os.homedir()) {
  const dest = path.join(homeDir, '.taketomarket');
  fs.mkdirSync(dest, { recursive: true });

  for (const dir of PACKAGE_BASE_DIRS) {
    const src = path.join(packageRoot, dir);
    if (dirExists(src)) {
      copyDirSync(src, path.join(dest, dir));
    }
  }

  for (const file of PACKAGE_BASE_FILES) {
    const src = path.join(packageRoot, file);
    if (fileExists(src)) {
      fs.copyFileSync(src, path.join(dest, file));
    }
  }

  writeInstallSentinel(dest, packageRoot);
}

/**
 * Install individual skills into a runtime's skills directory.
 * Replaces ${CLAUDE_PLUGIN_ROOT} in SKILL.md with absolute path to ~/.taketomarket.
 * @param {string} skillsDir - Runtime's skills base dir (e.g. ~/.claude/skills/)
 * @param {string} packageRoot - Source npm package root
 * @param {string} [homeDir]
 * @returns {number} Number of skills installed
 */
function installSkillsForRuntime(skillsDir, packageRoot, homeDir = os.homedir()) {
  const packageBase = path.join(homeDir, '.taketomarket');
  const srcSkillsDir = path.join(packageRoot, 'skills');
  if (!dirExists(srcSkillsDir)) return 0;

  fs.mkdirSync(skillsDir, { recursive: true });

  let count = 0;
  const entries = fs.readdirSync(srcSkillsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillMdSrc = path.join(srcSkillsDir, entry.name, 'SKILL.md');
    if (!fileExists(skillMdSrc)) continue;

    let content = fs.readFileSync(skillMdSrc, 'utf8');
    content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, packageBase);

    const destSkillDir = path.join(skillsDir, entry.name);
    fs.mkdirSync(destSkillDir, { recursive: true });
    fs.writeFileSync(path.join(destSkillDir, 'SKILL.md'), content, 'utf8');
    count++;
  }
  return count;
}

// ── Plugin Registration ───────────────────────────────────────────────────────

/**
 * Register taketomarket in Claude Code's installed_plugins.json.
 * Preserves existing plugins. Atomic write (tmp → rename).
 * @param {string} installPath - Absolute path to the installed plugin directory
 * @param {string} version - Plugin version string (e.g., '2.0.0')
 * @param {string} [homeDir] - Home directory (defaults to os.homedir(); injectable for tests)
 */
function registerPlugin(installPath, version, homeDir = os.homedir()) {
  const registryPath = path.join(homeDir, '.claude', 'plugins', 'installed_plugins.json');
  const pluginsDir = path.dirname(registryPath);

  let registry = { version: 2, plugins: {} };
  if (fileExists(registryPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      registry = parsed;
      if (!registry.plugins) registry.plugins = {};
      if (!registry.version) registry.version = 2;
    } catch {
      fs.renameSync(registryPath, registryPath + '.bak');
      console.warn('  Warning: installed_plugins.json was corrupted. Backed up to .bak and recreated.');
      registry = { version: 2, plugins: {} };
    }
  }

  const now = new Date().toISOString();
  const existing = (registry.plugins['taketomarket@npm'] || [])[0];

  registry.plugins['taketomarket@npm'] = [{
    scope: 'user',
    installPath,
    version,
    installedAt: existing?.installedAt ?? now,
    lastUpdated: now,
    gitCommitSha: null,
  }];

  const tmpPath = registryPath + '.tmp';
  fs.mkdirSync(pluginsDir, { recursive: true });
  fs.writeFileSync(tmpPath, JSON.stringify(registry, null, 2) + '\n', 'utf8');
  fs.renameSync(tmpPath, registryPath);

  console.log('  Registered in installed_plugins.json');
}

// ── Update-check Hook Injection (Claude Code only) ─────────────────────────────

const CHECK_UPDATE_SCRIPT_REL = path.join('.taketomarket', 'bin', 'check-update.cjs');
const CHECK_UPDATE_MARKER = 'check-update.cjs';

/**
 * Build the shell command Claude Code runs at SessionStart. Uses the absolute
 * resolved path (no shell-expansion assumptions) into the shared package base.
 * @param {string} homeDir
 * @returns {string}
 */
function buildCheckUpdateCommand(homeDir) {
  return `node "${path.join(homeDir, CHECK_UPDATE_SCRIPT_REL)}"`;
}

/**
 * Inject the takeToMarket update-check hook into ~/.claude/settings.json as a
 * SessionStart command hook. This is the npm/clone-path equivalent of the
 * plugin-path hooks/hooks.json (plugin installs auto-discover that file; npm and
 * git-clone installs do not, so we register the hook in the user's settings).
 *
 * Idempotent (skips if any SessionStart command already references
 * check-update.cjs), atomic (tmp -> rename), and preserves all existing hooks
 * and settings. Claude Code only.
 *
 * @param {string} [homeDir]
 * @returns {boolean} true if the hook was newly added, false if already present
 */
function injectSessionStartHook(homeDir = os.homedir()) {
  const settingsPath = path.join(homeDir, '.claude', 'settings.json');
  const settingsDir = path.dirname(settingsPath);
  const command = buildCheckUpdateCommand(homeDir);

  let settings = {};
  if (fileExists(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (!settings || typeof settings !== 'object') settings = {};
    } catch {
      fs.renameSync(settingsPath, settingsPath + '.bak');
      console.warn('  Warning: ~/.claude/settings.json was corrupted. Backed up to .bak and recreated.');
      settings = {};
    }
  }

  if (!settings.hooks || typeof settings.hooks !== 'object') settings.hooks = {};
  if (!Array.isArray(settings.hooks.SessionStart)) settings.hooks.SessionStart = [];

  const already = settings.hooks.SessionStart.some(group =>
    group && Array.isArray(group.hooks) && group.hooks.some(h =>
      h && typeof h.command === 'string' && h.command.includes(CHECK_UPDATE_MARKER)
    )
  );
  if (already) {
    console.log('  Update-check hook already present in ~/.claude/settings.json');
    return false;
  }

  settings.hooks.SessionStart.push({
    hooks: [{ type: 'command', command }],
  });

  const tmpPath = settingsPath + '.tmp';
  fs.mkdirSync(settingsDir, { recursive: true });
  fs.writeFileSync(tmpPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
  fs.renameSync(tmpPath, settingsPath);

  console.log('  Installed update-check hook -> ~/.claude/settings.json (SessionStart)');
  return true;
}

// ── Skill Introspection ───────────────────────────────────────────────────────

/**
 * Read skill names and descriptions from skills/ subdirectory of packageRoot.
 * Parses the first content line of the 'description:' YAML frontmatter field.
 * @param {string} packageRoot - Root of the npm package (use PACKAGE_ROOT in production)
 * @returns {Array<{name: string, description: string}>} Sorted by name
 */
function readSkillDescriptions(packageRoot) {
  const skillsDir = path.join(packageRoot, 'skills');
  if (!dirExists(skillsDir)) return [];

  const results = [];
  try {
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
      if (!fileExists(skillFile)) continue;

      const content = fs.readFileSync(skillFile, 'utf8');
      const descMatch = content.match(/^description:\s*>\s*\n((?:[ \t]+.+\n?)+)/m);
      let description = '';
      if (descMatch) {
        description = descMatch[1].split('\n')[0].trim().replace(/\.$/, '') + '.';
      } else {
        const inlineMatch = content.match(/^description:\s*(.+)$/m);
        if (inlineMatch) description = inlineMatch[1].trim();
      }

      results.push({ name: entry.name, description });
    }
  } catch {
    // ignore — skills dir may be empty or unreadable
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Print slash commands available after install. Reads from npm package source.
 * @param {string} [packageRoot] - Root of npm package (defaults to PACKAGE_ROOT = __dirname)
 */
function printInstallSummary(packageRoot = PACKAGE_ROOT) {
  const skills = readSkillDescriptions(packageRoot);
  console.log('');
  console.log(`Installation complete! ${skills.length} skills installed.`);
  console.log('');
  console.log('Available commands:');
  for (const { name, description } of skills) {
    const cmd = `/${name}`.padEnd(30);
    console.log(`  ${cmd} ${description}`);
  }
  console.log('');
  console.log('Quick start: open any project in Claude Code and run /ttm-init');
}

/**
 * Detect which known runtimes are installed by checking their parent directories.
 * @param {string} [homeDir]
 * @returns {string[]} Names of detected runtimes (subset of RUNTIME_MENU)
 */
function getInstalledRuntimes(homeDir = os.homedir()) {
  const targets = buildRuntimeTargets(homeDir);
  return RUNTIME_MENU.filter(name => {
    const t = targets[name];
    return t.parentDir && dirExists(t.parentDir);
  });
}

// ── Status & Confirmation ─────────────────────────────────────────────────────

/**
 * Used by confirmInstall — extracted for testability.
 * @param {boolean} yesFlag
 * @returns {boolean} true if yesFlag is set (no prompt needed)
 */
function shouldProceed(yesFlag) {
  return yesFlag === true || !process.stdin.isTTY;
}

/**
 * Read Claude Code install status for the checkStatus output.
 * @param {string} [homeDir]
 * @returns {{ installed: boolean, skillCount: number, dir: string }}
 */
function getClaudeStatus(homeDir = os.homedir()) {
  const skillsDir = path.join(homeDir, '.claude', 'skills');
  const probeSkill = path.join(skillsDir, 'ttm-init', 'SKILL.md');
  const installed = fileExists(probeSkill);
  if (!installed) return { installed: false, skillCount: 0, dir: skillsDir };

  let skillCount = 0;
  try {
    skillCount = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(e => e.isDirectory() && e.name.startsWith('ttm-') && fileExists(path.join(skillsDir, e.name, 'SKILL.md')))
      .length;
  } catch { /* ignore */ }

  return { installed: true, skillCount, dir: skillsDir };
}

/**
 * Print install status for all known runtimes and exit.
 * @param {string} version
 * @param {string} [homeDir]
 */
function checkStatus(version, homeDir = os.homedir()) {
  const targets = buildRuntimeTargets(homeDir);
  console.log('');
  console.log(`takeToMarket v${version}`);
  console.log('');

  const claude = getClaudeStatus(homeDir);
  if (claude.installed) {
    console.log(`Claude Code: INSTALLED (${claude.skillCount} skills at ${claude.dir.replace(homeDir, '~')})`);
  } else {
    console.log('Claude Code: NOT INSTALLED');
  }

  for (const name of ['codex', 'cursor', 'windsurf', 'gemini']) {
    const t = targets[name];
    const label = t.label.padEnd(12);
    if (t.skillsDir && dirExists(t.skillsDir)) {
      console.log(`${label} INSTALLED (${t.skillsDir.replace(homeDir, '~')})`);
    } else {
      console.log(`${label} NOT INSTALLED`);
    }
  }

  console.log('');
  console.log('Run `npx taketomarket` to install or reinstall.');
  process.exit(0);
}

/**
 * Interactively confirm install. Skipped when yesFlag is true.
 * @param {Array<{label, dir}>} targets
 * @param {string} version
 * @param {boolean} yesFlag
 * @returns {Promise<boolean>}
 */
async function confirmInstall(targets, version, yesFlag) {
  if (shouldProceed(yesFlag)) return true;

  const { createInterface } = require('node:readline');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(resolve => rl.question(q, resolve));

  console.log('');
  console.log(`takeToMarket v${version} — Marketing OS for AI coding tools`);
  console.log('');
  console.log('This will install to:');
  for (const t of targets) {
    const shortDir = t.skillsDir.replace(os.homedir(), '~');
    console.log(`  ${shortDir.padEnd(45)} (${t.label})`);
  }
  console.log('');

  const answer = await ask('Proceed? [Y/n]: ');
  rl.close();

  const trimmed = answer.trim().toLowerCase();
  if (trimmed === 'n') {
    console.log('Installation cancelled.');
    process.exit(0);
  }
  return true;
}

// ── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate an installation directory has all required components.
 * @param {string} targetDir - Directory to validate
 * @returns {Array<{name: string, status: string}>} Validation results
 */
function validateInstall(targetDir) {
  const results = [];

  // Check each required directory
  for (const dir of DIRS_TO_COPY) {
    results.push({
      name: dir,
      status: dirExists(path.join(targetDir, dir)) ? 'pass' : 'fail',
    });
  }

  // Check plugin.json exists
  results.push({
    name: 'plugin.json',
    status: fileExists(path.join(targetDir, '.claude-plugin', 'plugin.json')) ? 'pass' : 'fail',
  });

  // Check at least 5 SKILL.md files exist under skills/
  const skillsDir = path.join(targetDir, 'skills');
  let skillCount = 0;
  if (dirExists(skillsDir)) {
    try {
      const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true });
      for (const entry of skillDirs) {
        if (entry.isDirectory()) {
          const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
          if (fileExists(skillFile)) {
            skillCount++;
          }
        }
      }
    } catch {
      // ignore
    }
  }
  results.push({
    name: `skills (${skillCount} SKILL.md files)`,
    status: skillCount >= 5 ? 'pass' : 'fail',
  });

  return results;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--version') || args.includes('-v')) {
    process.stdout.write(`${VERSION}\n`);
    process.exit(0);
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
takeToMarket installer

Usage: npx taketomarket [options]

Options:
  --runtime <claude|codex>  Target a specific runtime, skip interactive prompt
  --check                   Show install status without installing
  --yes, -y                 Skip confirmation prompt (for CI/scripted use)
  --dry-run                 Validate source package without writing files
  --version, -v             Print version
  --help, -h                Show this help message
`);
    process.exit(0);
  }

  if (args.includes('--check')) {
    checkStatus(VERSION);
    // checkStatus calls process.exit(0)
  }

  if (args.includes('--dry-run')) {
    console.log('');
    console.log(`takeToMarket installer v${VERSION}`);
    console.log('[DRY RUN] Validating source package...');
    console.log('');
    const results = validateInstall(PACKAGE_ROOT);
    printResults(results);
    console.log('');
    console.log('[DRY RUN] No files written.');
    process.exit(0);
  }

  console.log('');
  console.log(`takeToMarket installer v${VERSION}`);

  const yesFlag = args.includes('--yes') || args.includes('-y');

  // Runtime selection
  const targets = await promptRuntimeSelection(args);

  if (targets.length === 0) {
    console.log('No runtimes selected. Exiting.');
    process.exit(0);
  }

  // Confirmation
  await confirmInstall(targets, VERSION, yesFlag);

  // Copy shared package files once
  console.log('');
  console.log('Copying package files to ~/.taketomarket/...');
  copyPackageBase(PACKAGE_ROOT);

  // Install loop
  const results = [];
  for (const target of targets) {
    console.log('');
    console.log(`Installing skills to ${target.label}...`);

    if (target.parentDir && !dirExists(target.parentDir)) {
      console.warn(`  Warning: ${target.label} not detected (${target.parentDir} not found). Installing anyway.`);
    }

    try {
      const count = installSkillsForRuntime(target.skillsDir, PACKAGE_ROOT);
      console.log(`  Installed ${count} skills → ${target.skillsDir.replace(os.homedir(), '~')}`);
      results.push({ target, success: true });
    } catch (err) {
      console.error(`  Error: ${err.message}`);
      results.push({ target, success: false, reason: err.message });
    }
  }

  // Register the SessionStart update-check hook (Claude Code only).
  const claudeParent = path.join(os.homedir(), '.claude');
  const claudeTargeted = targets.some(t => t.parentDir === claudeParent);
  if (claudeTargeted) {
    console.log('');
    try {
      injectSessionStartHook();
    } catch (err) {
      console.warn(`  Warning: could not install update-check hook: ${err.message}`);
    }
  }

  // Summary
  const successes = results.filter(r => r.success);
  const failures = results.filter(r => !r.success);

  if (successes.length > 0) {
    printInstallSummary();
  }

  if (failures.length > 0) {
    console.log('');
    console.log('Failed runtimes:');
    for (const f of failures) {
      console.log(`  ${f.target.label}: ${f.reason}`);
    }
    console.log('');
    console.log('Something went wrong? File an issue: https://github.com/ranjanrishikesh/taketomarket/issues');
  }

  process.exit(failures.length === results.length ? 1 : 0);
}

/**
 * Print validation results as a table.
 * @param {Array<{name: string, status: string}>} results
 */
function printResults(results) {
  console.log('Validation:');
  for (const r of results) {
    const label = r.status === 'pass' ? '[PASS]' : '[FAIL]';
    console.log(`  ${label} ${r.name}`);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(`Fatal: ${err.message}`);
    console.log('Something went wrong? File an issue: https://github.com/ranjanrishikesh/taketomarket/issues');
    process.exit(1);
  });
}

module.exports = {
  main,
  validateInstall,
  copyDirSync,
  dirExists,
  fileExists,
  printResults,
  DIRS_TO_COPY,
  FILES_TO_COPY,
  PACKAGE_BASE_DIRS,
  PACKAGE_BASE_FILES,
  registerPlugin,
  parseRuntimeChoices,
  buildRuntimeTargets,
  getInstalledRuntimes,
  readSkillDescriptions,
  shouldProceed,
  getClaudeStatus,
  checkStatus,
  confirmInstall,
  printInstallSummary,
  copyPackageBase,
  installSkillsForRuntime,
  classifyInstallMethod,
  writeInstallSentinel,
  injectSessionStartHook,
  buildCheckUpdateCommand,
  buildCustomTarget,
  PACKAGE_ROOT,
};
