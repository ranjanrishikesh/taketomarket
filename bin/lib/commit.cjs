/**
 * Commit -- Git commit helper for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: child_process.
 * Depends on: ./core.cjs for output, error
 *
 * Exports: cmdCommit
 */

'use strict';

const path = require('path');
const { execFileSync } = require('child_process');
const { output, error } = require('./core.cjs');

/**
 * Sanitize a commit message by stripping shell metacharacters.
 * Security: prevents shell injection via git commit -m.
 * Strips: backticks, $(), ${}, semicolons, pipes, newlines.
 *
 * @param {string} message - Raw commit message
 * @returns {string} Sanitized commit message
 */
function sanitizeMessage(message) {
  return message
    .replace(/`/g, ' ')
    .replace(/\$\(/g, ' ')
    .replace(/\$\{/g, ' ')
    .replace(/;/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Stage specific files and create a git commit.
 *
 * @param {string} message - Commit message (will be sanitized)
 * @param {string[]} files - Array of file paths to stage
 * @param {boolean} raw - Whether to output raw string
 */
function cmdCommit(message, files, raw) {
  if (!message || !message.trim()) {
    error('commit message required');
  }
  if (!files || files.length === 0) {
    error('at least one file required for commit');
  }

  const sanitized = sanitizeMessage(message);
  if (!sanitized) {
    error('commit message empty after sanitization');
  }

  // Validate file paths stay within project directory
  const projectRoot = path.resolve(process.cwd());
  for (const file of files) {
    const resolved = path.resolve(projectRoot, file);
    if (!resolved.startsWith(projectRoot + path.sep) && resolved !== projectRoot) {
      error(`file path escapes project directory: ${file}`);
    }
  }

  // Stage each file using execFileSync (array args, no shell injection)
  for (const file of files) {
    try {
      execFileSync('git', ['add', file], { stdio: 'pipe' });
    } catch (e) {
      error(`failed to stage file: ${file} -- ${e.message}`);
    }
  }

  // Commit using execFileSync (no shell, message passed as argument)
  try {
    execFileSync('git', ['commit', '-m', sanitized], { stdio: 'pipe' });
  } catch (e) {
    error(`git commit failed: ${e.message}`);
  }

  // Get short SHA
  let sha = 'unknown';
  try {
    sha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { stdio: 'pipe' })
      .toString()
      .trim();
  } catch {
    // Non-critical -- commit succeeded
  }

  output(
    { committed: true, message: sanitized, files, sha },
    raw,
    sha
  );
}

module.exports = {
  cmdCommit,
};
