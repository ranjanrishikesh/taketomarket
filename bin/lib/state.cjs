/**
 * State -- STATE.md read/update operations for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: path.
 * Depends on: ./core.cjs for output, error, safeReadFile, safeWriteFile,
 *             parseFrontmatter, serializeFrontmatter
 *
 * Exports: cmdStateRead, cmdStateUpdate
 */

'use strict';

const path = require('path');
const {
  output,
  error,
  safeReadFile,
  safeWriteFile,
  parseFrontmatter,
  serializeFrontmatter,
} = require('./core.cjs');

/**
 * Resolve and validate the STATE.md path.
 * Security: uses path.resolve() and rejects paths containing '..' after resolution.
 * @returns {string} Absolute path to .taketomarket/STATE.md
 */
function resolveStatePath() {
  const statePath = path.resolve(process.cwd(), '.taketomarket', 'STATE.md');
  // Reject paths that escape the project directory
  const projectRoot = path.resolve(process.cwd());
  if (!statePath.startsWith(projectRoot)) {
    error('STATE.md path escapes project directory');
  }
  return statePath;
}

/**
 * Read .taketomarket/STATE.md, parse frontmatter, output as JSON.
 * If STATE.md does not exist, outputs { exists: false, error: "..." }.
 *
 * @param {boolean} raw - Whether to output raw string
 */
function cmdStateRead(raw) {
  const statePath = resolveStatePath();
  const content = safeReadFile(statePath);
  if (content === null) {
    output({ exists: false, error: 'STATE.md not found' }, raw, 'STATE.md not found');
    return;
  }
  const { frontmatter, body } = parseFrontmatter(content);
  const result = {
    exists: true,
    ...frontmatter,
    body_preview: body.substring(0, 200),
  };
  output(result, raw, JSON.stringify(frontmatter));
}

/**
 * Update a single field in STATE.md frontmatter.
 * Sets last_updated to current ISO timestamp.
 *
 * @param {string} field - Frontmatter field name to update
 * @param {string} value - New value for the field
 * @param {boolean} raw - Whether to output raw string
 */
function cmdStateUpdate(field, value, raw) {
  if (!field) error('field name required for state update');
  if (value === undefined || value === null) error('value required for state update');

  const statePath = resolveStatePath();
  const content = safeReadFile(statePath);
  if (content === null) {
    error('STATE.md not found -- run /ttm-init first');
  }
  const { frontmatter, body } = parseFrontmatter(content);
  const timestamp = new Date().toISOString();

  frontmatter[field] = value;
  frontmatter['last_updated'] = timestamp;

  const updated = serializeFrontmatter(frontmatter, body);
  safeWriteFile(statePath, updated);

  output(
    { updated: field, value, last_updated: timestamp },
    raw,
    `${field}=${value}`
  );
}

module.exports = {
  cmdStateRead,
  cmdStateUpdate,
};
