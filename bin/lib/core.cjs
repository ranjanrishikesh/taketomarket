/**
 * Core -- Shared output helpers and utility functions for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: fs, path.
 *
 * Exports: output, error, parseNamedArgs, safeReadFile, safeWriteFile,
 *          parseFrontmatter, serializeFrontmatter
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Output helpers ───────────────────────────────────────────────────────────

/**
 * Write result to stdout. JSON by default, raw string if --raw flag is set.
 * @param {object} result - Structured result object
 * @param {boolean} raw - Whether --raw flag was passed
 * @param {*} rawValue - Plain text value for raw mode
 */
function output(result, raw, rawValue) {
  if (raw && rawValue !== undefined) {
    process.stdout.write(String(rawValue) + '\n');
  } else {
    const json = JSON.stringify(result, null, 2);
    process.stdout.write(json + '\n');
  }
}

/**
 * Write error message to stderr and exit with code 1.
 * @param {string} message - Error description
 */
function error(message) {
  process.stderr.write('Error: ' + message + '\n');
  process.exit(1);
}

// ── Argument parsing ─────────────────────────────────────────────────────────

/**
 * Parse --key value pairs from an args array.
 * Skips --raw (handled globally by router).
 * @param {string[]} args - Array of CLI arguments
 * @returns {{ positional: string[], named: object }}
 */
function parseNamedArgs(args) {
  const positional = [];
  const named = {};
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--raw') {
      i++;
      continue;
    }
    if (arg.startsWith('--') && i + 1 < args.length) {
      const key = arg.slice(2);
      named[key] = args[i + 1];
      i += 2;
    } else {
      positional.push(arg);
      i++;
    }
  }
  return { positional, named };
}

// ── File helpers ─────────────────────────────────────────────────────────────

/**
 * Read a file safely. Returns null if file does not exist.
 * @param {string} filePath - Absolute or relative path
 * @returns {string|null}
 */
function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Write a file safely. Creates parent directories if needed.
 * @param {string} filePath - Absolute or relative path
 * @param {string} content - File content
 */
function safeWriteFile(filePath, content) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

// ── Frontmatter helpers ──────────────────────────────────────────────────────

/**
 * Parse YAML frontmatter from markdown content.
 * Handles simple key: value pairs (no nested objects needed for STATE.md).
 * Returns empty frontmatter object if no frontmatter found.
 * @param {string} content - Markdown content with optional frontmatter
 * @returns {{ frontmatter: object, body: string }}
 */
function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) {
    return { frontmatter: {}, body: content || '' };
  }
  // Normalize line endings before parsing (handles Windows \r\n)
  const normalized = content.replace(/\r\n/g, '\n');
  // Match the closing --- only when it occupies a full line (followed by \n or end-of-string)
  const endMatch = normalized.substring(3).search(/\n---(\n|$)/);
  if (endMatch === -1) {
    return { frontmatter: {}, body: content };
  }
  const endIndex = endMatch + 3; // adjust for the substring(3) offset
  const fmBlock = normalized.substring(4, endIndex).trim();
  const body = normalized.substring(endIndex + 4).trimStart();
  const frontmatter = {};
  for (const line of fmBlock.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    // Strip surrounding quotes and unescape escaped quotes for round-trip safety
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"');
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }
  return { frontmatter, body };
}

/**
 * Serialize frontmatter object and body back to markdown string.
 * @param {object} data - Frontmatter key-value pairs
 * @param {string} body - Markdown body
 * @returns {string}
 */
function serializeFrontmatter(data, body) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    const strVal = String(value);
    // Quote values that contain special YAML characters
    if (strVal.includes(':') || strVal.includes('#') || strVal.includes('"') ||
        strVal.includes('\n') || strVal.includes('\r') ||
        strVal.startsWith(' ') || strVal.endsWith(' ')) {
      lines.push(`${key}: "${strVal.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`);
    } else {
      lines.push(`${key}: ${strVal}`);
    }
  }
  lines.push('---');
  lines.push('');
  if (body) {
    lines.push(body);
  }
  return lines.join('\n');
}

module.exports = {
  output,
  error,
  parseNamedArgs,
  safeReadFile,
  safeWriteFile,
  parseFrontmatter,
  serializeFrontmatter,
};
