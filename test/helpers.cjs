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
 * Create a mock .taketomarket/ directory structure inside baseDir.
 * Includes STATE.md and POSITIONING.md matching real takeToMarket layout.
 * @param {string} baseDir - Directory to create .taketomarket/ inside
 * @returns {string} Path to the created .taketomarket/ directory
 */
function createMockMarketing(baseDir) {
  const marketingDir = path.join(baseDir, '.taketomarket');
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

/**
 * Create a mock campaign directory with STATE.md inside .taketomarket/CAMPAIGNS/.
 * Assumes .taketomarket/ already exists (call createMockMarketing first or create manually).
 * @param {string} baseDir - Project root (with .taketomarket/ already created)
 * @param {string} slug - Campaign slug
 * @param {object} [opts] - Optional overrides
 * @param {string} [opts.phase='created'] - Campaign phase
 * @param {string} [opts.name] - Campaign name (defaults to 'Test Campaign <slug>')
 * @param {object} [opts.extraFields] - Additional frontmatter fields to include
 * @returns {string} Path to the created campaign directory
 */
function createMockCampaign(baseDir, slug, opts = {}) {
  const phase = opts.phase || 'created';
  const name = opts.name || `Test Campaign ${slug}`;
  const campaignDir = path.join(baseDir, '.taketomarket', 'CAMPAIGNS', slug);
  const assetsDir = path.join(campaignDir, 'ASSETS');
  fs.mkdirSync(assetsDir, { recursive: true });
  const timestamp = new Date().toISOString();
  const frontmatterLines = [
    '---',
    `campaign: ${slug}`,
    `name: ${name}`,
    `created: ${timestamp}`,
    `phase: ${phase}`,
    `last_updated: ${timestamp}`,
    `phase.created: ${timestamp}`,
  ];
  if (opts.extraFields) {
    for (const [key, value] of Object.entries(opts.extraFields)) {
      frontmatterLines.push(`${key}: ${value}`);
    }
  }
  frontmatterLines.push('---');
  frontmatterLines.push('');
  frontmatterLines.push(`# Campaign: ${name}`);
  const stateContent = frontmatterLines.join('\n');
  fs.writeFileSync(path.join(campaignDir, 'STATE.md'), stateContent);
  return campaignDir;
}

module.exports = {
  createTempDir,
  createMockMarketing,
  createMockHome,
  createMockCampaign,
};
