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
];

const FILES_TO_COPY = [
  'settings.json',
];

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

function main() {
  const args = process.argv.slice(2);

  // Check for --version / -v (D-10, D-11) — short-circuit BEFORE detectRuntime/validation.
  if (args.includes('--version') || args.includes('-v')) {
    process.stdout.write(`${VERSION}\n`);
    process.exit(0);
  }

  // Check for --help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
takeToMarket installer

Usage: npx taketomarket [options]

Options:
  --runtime <claude|codex>  Target runtime (default: auto-detect)
  --dry-run                 Validate source without writing files
  --help, -h                Show this help message
`);
    process.exit(0);
  }

  const DRY_RUN = args.includes('--dry-run');
  const runtime = detectRuntime(args);

  // Compute target directory using path.resolve for safety (T-10-01)
  const runtimeDir = runtime === 'codex' ? '.codex' : '.claude';
  const targetDir = path.resolve(os.homedir(), runtimeDir, 'plugins', 'taketomarket');

  // Verify targetDir is within home directory (T-10-01, T-10-03)
  const homeDir = os.homedir();
  if (!targetDir.startsWith(homeDir + path.sep)) {
    console.error('Error: Target directory resolves outside home directory. Aborting.');
    process.exit(1);
  }

  console.log('');
  console.log(`takeToMarket installer v${VERSION}`);
  console.log(`Runtime: ${runtime}`);
  console.log(`Target: ${targetDir}`);
  console.log('');

  if (DRY_RUN) {
    // Validate source completeness without writing
    console.log('[DRY RUN] Validating source package...');
    console.log('');
    const results = validateInstall(PACKAGE_ROOT);
    printResults(results);
    console.log('');
    console.log('[DRY RUN] No files written.');
    process.exit(0);
  }

  // Check for existing installation — remove stale files before copying (CR-02)
  if (dirExists(targetDir)) {
    console.log('Existing installation found. Removing before reinstall...');
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log('');
  }

  // Copy directories
  for (const dir of DIRS_TO_COPY) {
    const srcDir = path.join(PACKAGE_ROOT, dir);
    if (dirExists(srcDir)) {
      console.log(`  Copying ${dir}/`);
      copyDirSync(srcDir, path.join(targetDir, dir));
    } else {
      console.log(`  Skipping ${dir}/ (not found in package)`);
    }
  }

  // Copy individual files
  for (const file of FILES_TO_COPY) {
    const srcFile = path.join(PACKAGE_ROOT, file);
    if (fileExists(srcFile)) {
      console.log(`  Copying ${file}`);
      const destFile = path.join(targetDir, file);
      fs.mkdirSync(path.dirname(destFile), { recursive: true });
      fs.copyFileSync(srcFile, destFile);
    } else {
      console.log(`  Skipping ${file} (not found in package)`);
    }
  }

  console.log('');

  // Validate
  const results = validateInstall(targetDir);
  printResults(results);

  const failures = results.filter(r => r.status === 'fail');
  console.log('');

  if (failures.length > 0) {
    console.log('Installation incomplete. Some components missing.');
    process.exit(1);
  }

  console.log('Installation complete!');
  console.log('');
  console.log('Quick start:');
  console.log('  1. Open a project directory');
  console.log('  2. Run /ttm-init to set up your marketing workspace');
  console.log('  3. Run /ttm-new-campaign <name> to start your first campaign');
  console.log('');
  console.log('Documentation: https://github.com/ranjanrishikesh/takeToMarket#readme');
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
  main();
}

module.exports = {
  main,
  detectRuntime,
  validateInstall,
  copyDirSync,
  dirExists,
  fileExists,
  printResults,
  DIRS_TO_COPY,
  FILES_TO_COPY,
};
