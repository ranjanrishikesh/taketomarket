/**
 * Campaign -- Per-campaign STATE.md init/read/update operations for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: path, fs.
 * Depends on: ./core.cjs for output, error, safeReadFile, safeWriteFile,
 *             parseFrontmatter, serializeFrontmatter
 *
 * Exports: cmdCampaignInit, cmdCampaignState, cmdCampaignUpdate
 */

'use strict';

const fs = require('fs');
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
 * Resolve and validate the campaign STATE.md path.
 * Security: re-sanitizes slug, uses path.resolve(), rejects paths escaping project root.
 * @param {string} slug - Campaign slug
 * @returns {string} Absolute path to CAMPAIGNS/<slug>/STATE.md
 */
function resolveCampaignStatePath(slug) {
  if (!slug || !slug.trim()) error('campaign slug required');
  // Re-sanitize slug (defense in depth -- caller may pass unsanitized input)
  const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const statePath = path.resolve(process.cwd(), '.marketing', 'CAMPAIGNS', safe, 'STATE.md');
  const projectRoot = path.resolve(process.cwd());
  if (!statePath.startsWith(projectRoot)) {
    error('campaign STATE.md path escapes project directory');
  }
  return statePath;
}

/**
 * Initialize a new campaign directory with STATE.md, RESEARCH.md, BRIEF.md, and ASSETS/.
 *
 * @param {string} slug - Campaign slug (URL-safe identifier)
 * @param {string} name - Human-readable campaign name
 * @param {boolean} raw - Whether to output raw string
 */
function cmdCampaignInit(slug, name, raw) {
  if (!slug || !slug.trim()) error('slug required for campaign init');
  if (!name || !name.trim()) error('name required for campaign init');

  // Re-sanitize slug (defense in depth)
  const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

  const campaignDir = path.resolve(process.cwd(), '.marketing', 'CAMPAIGNS', safe);
  const assetsDir = path.resolve(campaignDir, 'ASSETS');
  const statePath = path.resolve(campaignDir, 'STATE.md');

  // Security check: campaignDir must be inside project root
  const projectRoot = path.resolve(process.cwd());
  if (!campaignDir.startsWith(projectRoot)) {
    error('campaign directory path escapes project directory');
  }

  // Create CAMPAIGNS/<slug>/ASSETS/ (recursive creates all intermediate dirs)
  fs.mkdirSync(assetsDir, { recursive: true });

  const timestamp = new Date().toISOString();

  // Build STATE.md with flat dot-notation frontmatter (parseFrontmatter compatible)
  const stateContent = [
    '---',
    `campaign: ${safe}`,
    `name: ${name}`,
    `created: ${timestamp}`,
    'phase: created',
    `last_updated: ${timestamp}`,
    `phase.created: ${timestamp}`,
    'phase.researched: null',
    'phase.briefed: null',
    'phase.produced: null',
    'phase.verified: null',
    'phase.reviewed: null',
    'phase.fixed: null',
    'phase.shipped: null',
    'phase.measured: null',
    'phase.learned: null',
    'gate.positioning_check: null',
    'gate.outcome_metric: null',
    '---',
    '',
    `# Campaign: ${name}`,
    '',
    'Phase: created',
    `Next step: Run \`/ttm-research ${safe}\` to gather market intelligence.`,
    '',
  ].join('\n');

  safeWriteFile(statePath, stateContent);

  // Copy RESEARCH.md template
  const templateDir = path.resolve(__dirname, '..', '..', 'templates');
  const researchTemplatePath = path.resolve(templateDir, 'campaign-research.md');
  const researchTemplate = safeReadFile(researchTemplatePath);
  if (researchTemplate) {
    const researchContent = researchTemplate
      .replace(/\[SLUG\]/g, safe)
      .replace(/\[CAMPAIGN_NAME\]/g, name);
    safeWriteFile(path.resolve(campaignDir, 'RESEARCH.md'), researchContent);
  } else {
    // Fallback: write minimal placeholder if template not found
    safeWriteFile(
      path.resolve(campaignDir, 'RESEARCH.md'),
      `# Research: ${name}\n\n**Campaign:** ${safe}\n**Researched:** pending\n`
    );
  }

  // Copy BRIEF.md template
  const briefTemplatePath = path.resolve(templateDir, 'campaign-brief.md');
  const briefTemplate = safeReadFile(briefTemplatePath);
  if (briefTemplate) {
    const briefContent = briefTemplate
      .replace(/\[SLUG\]/g, safe)
      .replace(/\[CAMPAIGN_NAME\]/g, name);
    safeWriteFile(path.resolve(campaignDir, 'BRIEF.md'), briefContent);
  } else {
    // Fallback: write minimal placeholder if template not found
    safeWriteFile(
      path.resolve(campaignDir, 'BRIEF.md'),
      `# Campaign Brief: ${name}\n\n**Campaign:** ${safe}\n**Status:** pending\n`
    );
  }

  output({ created: true, slug: safe, name, path: statePath }, raw, safe);
}

/**
 * Read campaign STATE.md, parse frontmatter, output as JSON.
 * If STATE.md does not exist, outputs { exists: false, error: "..." }.
 *
 * @param {string} slug - Campaign slug
 * @param {boolean} raw - Whether to output raw string
 */
function cmdCampaignState(slug, raw) {
  const statePath = resolveCampaignStatePath(slug);
  const content = safeReadFile(statePath);
  if (content === null) {
    output(
      { exists: false, error: `Campaign STATE.md not found for slug: ${slug}` },
      raw,
      'not found'
    );
    return;
  }
  const { frontmatter, body } = parseFrontmatter(content);
  const result = { exists: true, ...frontmatter, body_preview: body.substring(0, 200) };
  output(result, raw, JSON.stringify(frontmatter));
}

/**
 * Update a single field in campaign STATE.md frontmatter.
 * Sets last_updated to current ISO timestamp.
 *
 * @param {string} slug - Campaign slug
 * @param {string} field - Frontmatter field name to update
 * @param {string} value - New value for the field
 * @param {boolean} raw - Whether to output raw string
 */
function cmdCampaignUpdate(slug, field, value, raw) {
  if (!field) error('field name required for campaign update');
  if (value === undefined || value === null) error('value required for campaign update');

  const statePath = resolveCampaignStatePath(slug);
  const content = safeReadFile(statePath);
  if (content === null) {
    error(`Campaign not found: ${slug} -- run /ttm-new-campaign first`);
  }
  const { frontmatter, body } = parseFrontmatter(content);
  const timestamp = new Date().toISOString();

  frontmatter[field] = value;
  frontmatter['last_updated'] = timestamp;

  const updated = serializeFrontmatter(frontmatter, body);
  safeWriteFile(statePath, updated);

  output({ updated: field, value, last_updated: timestamp }, raw, `${field}=${value}`);
}

module.exports = {
  cmdCampaignInit,
  cmdCampaignState,
  cmdCampaignUpdate,
};
