/**
 * Campaign -- Per-campaign STATE.md init/read/update operations for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: path, fs.
 * Depends on: ./core.cjs for output, error, safeReadFile, safeWriteFile,
 *             parseFrontmatter, serializeFrontmatter
 *
 * Exports: cmdCampaignInit, cmdCampaignState, cmdCampaignUpdate, cmdCampaignList
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
    'gate.positioning_drift: null',
    'gate.claim_accuracy: null',
    'gate.voice_drift: null',
    'gate.outcome_alignment: null',
    'gate.funnel_integrity: null',
    'gate.utm_hygiene: null',
    'gate.compliance: null',
    'gate.competitor_collision: null',
    'gate.icp_fit: null',
    'gate.format_correctness: null',
    'verify.run_count: null',
    'verify.last_run: null',
    'verify.overall_result: null',
    'review.run_count: null',
    'review.last_run: null',
    'review.overall_result: null',
    'fix.run_count: null',
    'fix.last_run: null',
    'fix.overall_result: null',
    'ship.status: null',
    'ship.shipped_at: null',
    'ship.checklist_result: null',
    '---',
    '',
    `# Campaign: ${name}`,
    '',
    'Phase: created',
    `Next step: Run \`/ttm-research ${safe}\` to gather market intelligence.`,
    '',
  ].join('\n');

  // TOCTOU-safe creation: wx flag fails atomically if file already exists
  try {
    fs.writeFileSync(statePath, stateContent, { flag: 'wx', encoding: 'utf-8' });
  } catch (e) {
    if (e.code === 'EEXIST') {
      error(`Campaign already exists: ${safe}. Delete the directory first or use a different slug.`);
    }
    throw e;
  }

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
  const safe = slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '') : '';
  const content = safeReadFile(statePath);
  if (content === null) {
    output(
      { exists: false, error: `Campaign STATE.md not found for slug: ${safe}` },
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
const ALLOWED_FIELDS = new Set([
  'phase', 'name', 'last_updated',
  'phase.created', 'phase.researched', 'phase.briefed', 'phase.produced',
  'phase.verified', 'phase.reviewed', 'phase.fixed', 'phase.shipped',
  'phase.measured', 'phase.learned',
  'gate.positioning_check', 'gate.outcome_metric',
  // Phase 4: Per-gate verification results (GATE-01 through GATE-10)
  'gate.positioning_drift', 'gate.claim_accuracy', 'gate.voice_drift',
  'gate.outcome_alignment', 'gate.funnel_integrity', 'gate.utm_hygiene',
  'gate.compliance', 'gate.competitor_collision', 'gate.icp_fit',
  'gate.format_correctness',
  // Phase 4: Verification run metadata
  'verify.run_count', 'verify.last_run', 'verify.overall_result',
  // Phase 5: Review tracking
  'review.run_count', 'review.last_run', 'review.overall_result',
  // Phase 5: Fix tracking
  'fix.run_count', 'fix.last_run', 'fix.overall_result',
  // Phase 5: Ship tracking
  'ship.status', 'ship.shipped_at', 'ship.checklist_result',
  'current_campaign',
]);

function cmdCampaignUpdate(slug, field, value, raw) {
  if (!field) error('field name required for campaign update');
  if (value === undefined || value === null) error('value required for campaign update');
  if (!ALLOWED_FIELDS.has(field)) {
    error(`Unknown state field: ${field}. Allowed: ${[...ALLOWED_FIELDS].join(', ')}`);
  }

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

// Active campaign phases for filtering
const ACTIVE_PHASES = new Set(['briefed', 'produced', 'verified', 'reviewed', 'shipped']);

/**
 * List campaigns with optional filtering.
 *
 * @param {string} filter - Filter flag: '--active', '--shipped-since-last-audit', or ''
 * @param {string} sinceArg - Time window filter e.g. '30d', '90d'
 * @param {boolean} raw - Whether to output raw string
 */
function cmdCampaignList(filter, sinceArg, raw) {
  const campaignsDir = path.resolve(process.cwd(), '.marketing', 'CAMPAIGNS');

  // If no campaigns directory, return empty
  let entries;
  try {
    entries = fs.readdirSync(campaignsDir, { withFileTypes: true });
  } catch {
    output({ campaigns: [], count: 0 }, raw, '0 campaigns');
    return;
  }

  // Read all campaign STATE.md files
  const projectRoot = path.resolve(process.cwd());
  const campaigns = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const statePath = path.resolve(campaignsDir, entry.name, 'STATE.md');
    // Security: reject paths that escape the project root (e.g., via symlinks)
    if (!statePath.startsWith(projectRoot + path.sep)) continue;
    const content = safeReadFile(statePath);
    if (content === null) continue;
    const { frontmatter } = parseFrontmatter(content);
    campaigns.push({ slug: entry.name, ...frontmatter });
  }

  let filtered = campaigns;

  if (filter === '--active') {
    // Filter to campaigns in active phases
    filtered = campaigns.filter(c => ACTIVE_PHASES.has(c.phase));
  } else if (filter === '--shipped-since-last-audit') {
    // Filter to campaigns shipped since last audit event in DRIFT-LOG.md
    const shippedCampaigns = campaigns.filter(c => c['phase.shipped'] && c['phase.shipped'] !== 'null');
    let lastAuditTimestamp = null;

    const driftLogPath = path.resolve(process.cwd(), '.marketing', 'DRIFT-LOG.md');
    const driftLogContent = safeReadFile(driftLogPath);
    if (driftLogContent) {
      // Find last audit event timestamp in the Audit Trail table
      const lines = driftLogContent.split('\n');
      for (const line of lines) {
        if (line.includes('| audit |') || line.includes('| audit|')) {
          const match = line.match(/\|\s*(\d{4}-\d{2}-\d{2}T[^\s|]+)\s*\|/);
          if (match) {
            const ts = match[1];
            if (!lastAuditTimestamp || ts > lastAuditTimestamp) {
              lastAuditTimestamp = ts;
            }
          }
        }
      }
    }

    if (lastAuditTimestamp) {
      filtered = shippedCampaigns.filter(c => {
        const shipped = Date.parse(c['phase.shipped']);
        const audit   = Date.parse(lastAuditTimestamp);
        return !isNaN(shipped) && !isNaN(audit) && shipped > audit;
      });
    } else {
      // No prior audit -- include all shipped campaigns
      filtered = shippedCampaigns;
    }
  } else if (sinceArg && sinceArg.match(/^\d+d$/)) {
    // Parse days and calculate cutoff date
    const days = parseInt(sinceArg, 10);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    filtered = campaigns.filter(c => {
      if (c.phase === 'archived') return false;
      const ts = c.last_updated || c['phase.produced'];
      if (!ts || ts === 'null') return false;
      const tsMs    = Date.parse(ts);
      const cutMs   = Date.parse(cutoff);
      return !isNaN(tsMs) && !isNaN(cutMs) && tsMs > cutMs;
    });
  }

  output({ campaigns: filtered, count: filtered.length }, raw, filtered.length + ' campaigns');
}

module.exports = {
  cmdCampaignInit,
  cmdCampaignState,
  cmdCampaignUpdate,
  cmdCampaignList,
};
