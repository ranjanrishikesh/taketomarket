'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Create an isolated temp directory for a test.
 * Returns { dir, cleanup } where cleanup() removes the directory.
 * @param {string} [prefix='ttm-test-'] - Prefix for temp directory name
 * @returns {{ dir: string, cleanup: () => void }}
 */
function createTempDir(prefix = 'ttm-test-') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  return {
    dir,
    cleanup() {
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

/**
 * Create a mock .marketing/ directory structure inside baseDir.
 * Includes STATE.md and POSITIONING.md matching real takeToMarket layout.
 * @param {string} baseDir - Directory to create .marketing/ inside
 * @returns {string} Path to the created .marketing/ directory
 */
function createMockMarketing(baseDir) {
  const marketingDir = path.join(baseDir, '.marketing');
  fs.mkdirSync(marketingDir, { recursive: true });
  fs.writeFileSync(
    path.join(marketingDir, 'STATE.md'),
    '---\nstatus: active\n---\n# Marketing State\n'
  );
  fs.writeFileSync(
    path.join(marketingDir, 'POSITIONING.md'),
    '# Positioning\n'
  );
  return marketingDir;
}

/**
 * Create a mock HOME directory with .claude/plugins/taketomarket/ structure.
 * Used by E2E tests to avoid modifying the real HOME directory.
 * @param {string} baseDir - Directory to use as mock HOME
 * @returns {string} The baseDir path (for use as HOME env override)
 */
function createMockHome(baseDir) {
  const claudeDir = path.join(baseDir, '.claude', 'plugins', 'taketomarket');
  fs.mkdirSync(claudeDir, { recursive: true });
  return baseDir;
}

module.exports = {
  createTempDir,
  createMockMarketing,
  createMockHome,
};
