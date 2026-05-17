/**
 * Campaign -- Per-campaign STATE.md init/read/update/archive operations for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: path, fs.
 * Depends on: ./core.cjs for output, error, safeReadFile, safeWriteFile,
 *             parseFrontmatter, serializeFrontmatter
 *
 * Exports: cmdCampaignInit, cmdCampaignState, cmdCampaignUpdate, cmdCampaignList, cmdCampaignArchive
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
  if (!safe) error('campaign slug must contain at least one alphanumeric character after sanitization');
  const statePath = path.resolve(process.cwd(), '.taketomarket', 'CAMPAIGNS', safe, 'STATE.md');
  const projectRoot = path.resolve(process.cwd());
  if (!statePath.startsWith(projectRoot + path.sep)) {
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
  if (!safe) error('campaign slug must contain at least one alphanumeric character after sanitization');

  const campaignDir = path.resolve(process.cwd(), '.taketomarket', 'CAMPAIGNS', safe);
  const assetsDir = path.resolve(campaignDir, 'ASSETS');
  const statePath = path.resolve(campaignDir, 'STATE.md');

  // Security check: campaignDir must be inside project root
  const projectRoot = path.resolve(process.cwd());
  if (!campaignDir.startsWith(projectRoot + path.sep)) {
    error('campaign directory path escapes project directory');
  }

  // Create CAMPAIGNS/<slug>/ASSETS/ (recursive creates all intermediate dirs)
  fs.mkdirSync(assetsDir, { recursive: true });

  const timestamp = new Date().toISOString();

  // Build STATE.md via serializeFrontmatter to safely handle special chars in name (CR-01)
  const frontmatterObj = {
    campaign: safe,
    name: name,
    created: timestamp,
    phase: 'created',
    last_updated: timestamp,
    'phase.created': timestamp,
    'phase.researched': 'null',
    'phase.briefed': 'null',
    'phase.produced': 'null',
    'phase.verified': 'null',
    'phase.reviewed': 'null',
    'phase.fixed': 'null',
    'phase.shipped': 'null',
    'phase.measured': 'null',
    'phase.learned': 'null',
    'gate.positioning_check': 'null',
    'gate.outcome_metric': 'null',
    'gate.positioning_drift': 'null',
    'gate.claim_accuracy': 'null',
    'gate.voice_drift': 'null',
    'gate.outcome_alignment': 'null',
    'gate.funnel_integrity': 'null',
    'gate.utm_hygiene': 'null',
    'gate.compliance': 'null',
    'gate.competitor_collision': 'null',
    'gate.icp_fit': 'null',
    'gate.format_correctness': 'null',
    'verify.run_count': 'null',
    'verify.last_run': 'null',
    'verify.overall_result': 'null',
    'review.run_count': 'null',
    'review.last_run': 'null',
    'review.overall_result': 'null',
    'fix.run_count': 'null',
    'fix.last_run': 'null',
    'fix.overall_result': 'null',
    'ship.status': 'null',
    'ship.shipped_at': 'null',
    'ship.checklist_result': 'null',
  };
  const bodyContent = `\n# Campaign: ${name}\n\nPhase: created\nNext step: Run \`/ttm-research ${safe}\` to gather market intelligence.\n`;
  const stateContent = serializeFrontmatter(frontmatterObj, bodyContent);

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
  // Phase 7: Archive tracking
  'archive.archived_at', 'archive.learnings_extracted',
  // Phase 7: Cancel tracking
  'cancel.cancelled_at', 'cancel.reason',
  // Phase 9: Measurement tracking
  'measure.run_count', 'measure.last_run', 'measure.outcome_result',
  'measure.outcome_delta', 'measure.analytics_source',
  // Phase 9: Learn tracking
  'learn.run_count', 'learn.last_run', 'learn.lessons_extracted',
  'learn.edits_proposed', 'learn.edits_applied',
  'current_campaign',
]);

function cmdCampaignUpdate(slug, field, value, raw) {
  if (!field) error('field name required for campaign update');
  if (value === undefined || value === null || value === '') {
    error('value required for campaign update -- use "null" string to clear a field');
  }
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
  // Enforce mutual exclusion of filter flags and --since early (WR-01)
  if (filter && sinceArg) {
    error('--active/--shipped-since-last-audit and --since are mutually exclusive');
  }

  const campaignsDir = path.resolve(process.cwd(), '.taketomarket', 'CAMPAIGNS');

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

    const driftLogPath = path.resolve(process.cwd(), '.taketomarket', 'DRIFT-LOG.md');
    const driftLogContent = safeReadFile(driftLogPath);
    if (driftLogContent) {
      // Find last audit event timestamp in the Audit Trail table
      const lines = driftLogContent.split('\n');
      for (const line of lines) {
        if (line.includes('| audit |') || line.includes('| audit|')) {
          // Parse pipe-delimited columns by position rather than first-match regex
          // Expected columns: ['', event_type, timestamp, source, details, affected, '']
          const cols = line.split('|').map(c => c.trim());
          if (cols.length >= 6) {
            const ts = cols[2];
            if (ts && ts.match(/^\d{4}-\d{2}-\d{2}T/)) {
              if (!lastAuditTimestamp || ts > lastAuditTimestamp) {
                lastAuditTimestamp = ts;
              }
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

/**
 * Archive a shipped campaign: move directory to ARCHIVE/, update state.
 * Only campaigns with phase='shipped' or phase='learned' can be archived (per D-08).
 * Uses cpSync + rmSync for cross-filesystem safety (per Pitfall 1).
 *
 * @param {string} slug - Campaign slug
 * @param {boolean} raw - Whether to output raw string
 */
function cmdCampaignArchive(slug, raw) {
  if (!slug || !slug.trim()) error('campaign slug required for archive');

  const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!safe) error('campaign slug must contain at least one alphanumeric character after sanitization');
  const projectRoot = path.resolve(process.cwd());
  const srcDir = path.resolve(projectRoot, '.taketomarket', 'CAMPAIGNS', safe);
  const destDir = path.resolve(projectRoot, '.taketomarket', 'CAMPAIGNS', 'ARCHIVE', safe);

  // Security check: both paths must be inside project root
  if (!srcDir.startsWith(projectRoot + path.sep)) {
    error('source path escapes project directory');
  }
  if (!destDir.startsWith(projectRoot + path.sep)) {
    error('destination path escapes project directory');
  }

  // Validate source exists
  try {
    if (!fs.statSync(srcDir).isDirectory()) {
      error(`Campaign not found: ${safe}`);
    }
  } catch {
    error(`Campaign not found: ${safe}`);
  }

  // Validate destination does NOT exist (irreversibility per D-10)
  try {
    fs.statSync(destDir);
    error(`Archive destination already exists: ${safe}. Cannot overwrite archived campaign.`);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      // Re-throw unexpected errors (permissions, etc.) rather than silently proceeding
      throw e;
    }
    // ENOENT is expected -- destination does not exist, safe to proceed
  }

  // Read and validate STATE.md -- only shipped campaigns can be archived
  const statePath = path.resolve(srcDir, 'STATE.md');
  const content = safeReadFile(statePath);
  if (content === null) {
    error(`Campaign STATE.md not found for: ${safe}`);
  }
  const { frontmatter, body } = parseFrontmatter(content);
  if (frontmatter.phase !== 'shipped' && frontmatter.phase !== 'learned') {
    error('Only shipped or learned campaigns can be archived. Current phase: ' + frontmatter.phase);
  }

  // Create ARCHIVE/ directory
  fs.mkdirSync(path.dirname(destDir), { recursive: true });

  // Copy directory (cross-filesystem safe)
  fs.cpSync(srcDir, destDir, { recursive: true });

  // Verify destination exists and STATE.md was copied before removing source
  try {
    if (!fs.statSync(destDir).isDirectory()) {
      error('Archive copy verification failed: destination is not a directory');
    }
  } catch {
    error('Archive copy verification failed: destination directory not found');
  }
  const destStatePath = path.resolve(destDir, 'STATE.md');
  try {
    if (!fs.statSync(destStatePath).isFile()) {
      error('Archive copy verification failed: STATE.md not found in destination');
    }
  } catch {
    error('Archive copy verification failed: STATE.md not found in destination');
  }

  // Remove source
  fs.rmSync(srcDir, { recursive: true, force: true });

  // Update STATE.md in archived location
  const timestamp = new Date().toISOString();
  frontmatter.phase = 'archived';
  frontmatter['archive.archived_at'] = timestamp;
  frontmatter['last_updated'] = timestamp;

  const updatedContent = serializeFrontmatter(frontmatter, body);
  fs.writeFileSync(destStatePath, updatedContent, 'utf-8');

  output({ archived: true, slug: safe, dest: destDir }, raw, 'archived ' + safe);
}

/**
 * Add repurpose derivative entries to an existing campaign MANIFEST.json.
 * Each derivative gets a `source_asset_id` field linking back to the source asset.
 *
 * @param {string} slug - Campaign slug
 * @param {number} sourceAssetId - The asset_id of the source asset being repurposed
 * @param {Array<{asset_id: number, name: string, type: string, channel: string, file: string}>} derivatives - Derivative asset entries
 * @param {boolean} raw - Whether to output raw string
 */
function cmdRepurposeManifest(slug, sourceAssetId, derivatives, raw) {
  if (!slug || !slug.trim()) error('campaign slug required for repurpose-manifest');
  if (sourceAssetId === undefined || sourceAssetId === null) {
    error('source-asset-id required for repurpose-manifest');
  }
  if (!Array.isArray(derivatives) || derivatives.length === 0) {
    error('derivatives array required (non-empty) for repurpose-manifest');
  }

  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!safeSlug) error('campaign slug must contain at least one alphanumeric character after sanitization');
  const projectRoot = path.resolve(process.cwd());
  const manifestPath = path.resolve(projectRoot, '.taketomarket', 'CAMPAIGNS', safeSlug, 'MANIFEST.json');

  // Security: path must stay within project root (T-10-12)
  if (!manifestPath.startsWith(projectRoot + path.sep)) {
    error('MANIFEST.json path escapes project directory');
  }

  // Read existing manifest or create a new one
  let manifest;
  const existing = safeReadFile(manifestPath);
  if (existing !== null) {
    try {
      manifest = JSON.parse(existing);
    } catch (e) {
      error('Failed to parse existing MANIFEST.json: ' + e.message);
    }
  } else {
    // No existing manifest -- create a minimal one
    manifest = {
      campaign: safeSlug,
      produced_at: new Date().toISOString(),
      hero: null,
      derivatives: [],
      total_assets: 0,
    };
  }

  // Ensure derivatives array exists
  if (!Array.isArray(manifest.derivatives)) {
    manifest.derivatives = [];
  }

  // Validate and append each derivative with source_asset_id
  const numericSourceId = Number(sourceAssetId);
  if (isNaN(numericSourceId)) {
    error('source-asset-id must be a number');
  }

  // Check for duplicate asset_id entries (WR-06)
  const existingIds = new Set(manifest.derivatives.map(d => Number(d.asset_id)));

  for (const d of derivatives) {
    if (!d.asset_id || !d.name || !d.channel || !d.file) {
      error('Each derivative must have asset_id, name, channel, and file fields');
    }
    const numId = Number(d.asset_id);
    if (existingIds.has(numId)) {
      error(`Duplicate asset_id ${d.asset_id} -- already exists in MANIFEST.json`);
    }
    existingIds.add(numId);
    manifest.derivatives.push({
      asset_id: Number(d.asset_id),
      name: d.name,
      type: d.type || 'derivative',
      channel: d.channel,
      file: d.file,
      source_asset_id: numericSourceId,
      derived_from: numericSourceId,
    });
  }

  // Update total_assets count
  const heroCount = manifest.hero ? 1 : 0;
  manifest.total_assets = heroCount + manifest.derivatives.length;

  // Write updated manifest
  safeWriteFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  output(
    { updated: true, slug: safeSlug, derivatives_added: derivatives.length, total_assets: manifest.total_assets },
    raw,
    derivatives.length + ' derivatives added'
  );
}

module.exports = {
  cmdCampaignInit,
  cmdCampaignState,
  cmdCampaignUpdate,
  cmdCampaignList,
  cmdCampaignArchive,
  cmdRepurposeManifest,
};
