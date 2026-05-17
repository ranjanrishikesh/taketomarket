/**
 * Deviation -- Append-only deviation log operations for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: path, fs.
 * Depends on: ./core.cjs for output, error, safeReadFile, safeWriteFile
 *
 * Exports: cmdDeviationAppend
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
  output,
  error,
  safeReadFile,
  safeWriteFile,
} = require('./core.cjs');

// Allowlists for validation
const ALLOWED_GATES = new Set([
  'positioning_drift', 'claim_accuracy', 'voice_drift',
  'outcome_alignment', 'funnel_integrity', 'utm_hygiene',
  'compliance', 'competitor_collision', 'icp_fit',
  'format_correctness',
]);

const ALLOWED_RESULTS = new Set(['accepted', 'correct', 'escalated']);

/**
 * Sanitize justification text to prevent injection.
 * Strips backticks, all $ signs, newlines, pipe chars, and redirects.
 * @param {string} text - Raw justification
 * @returns {string} Sanitized text (max 100 chars)
 */
function sanitizeJustification(text) {
  if (!text) return '';
  return text
    .replace(/`/g, "'")
    .replace(/\$/g, '')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .replace(/\|/g, '-')
    .replace(/[<>]/g, '')
    .substring(0, 100)
    .trim();
}

/**
 * Append a deviation entry to a campaign's DEVIATIONS.md.
 *
 * @param {string} slug - Campaign slug
 * @param {string} gate - Gate name (must be in ALLOWED_GATES)
 * @param {string} result - Deviation result (accepted, correct, escalated)
 * @param {string} justification - User justification text
 * @param {string} asset - Asset filename
 * @param {boolean} raw - Whether to output raw string
 * @param {object} [extra] - Additional named fields: gate_id, tier, finding, action, run
 */
function cmdDeviationAppend(slug, gate, result, justification, asset, raw, extra) {
  if (!slug || !slug.trim()) error('slug required for deviation append');
  if (!gate || !gate.trim()) error('gate required for deviation append');
  if (!result || !result.trim()) error('result required for deviation append');
  if (!asset || !asset.trim()) error('asset required for deviation append');

  // Validate slug via path.resolve to prevent traversal
  const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const projectRoot = path.resolve(process.cwd());
  const campaignDir = path.resolve(projectRoot, '.taketomarket', 'CAMPAIGNS', safe);
  if (!campaignDir.startsWith(projectRoot)) {
    error('campaign path escapes project directory');
  }

  // Validate gate name against allowlist
  const gateLower = gate.toLowerCase().trim();
  if (!ALLOWED_GATES.has(gateLower)) {
    error(`Unknown gate: ${gate}. Allowed: ${[...ALLOWED_GATES].join(', ')}`);
  }

  // Validate result against allowlist
  const resultLower = result.toLowerCase().trim();
  if (!ALLOWED_RESULTS.has(resultLower)) {
    error(`Unknown result: ${result}. Allowed: ${[...ALLOWED_RESULTS].join(', ')}`);
  }

  const deviationsPath = path.resolve(campaignDir, 'DEVIATIONS.md');
  const safeAsset = asset.replace(/\|/g, '-').replace(/\n/g, '').substring(0, 80);
  const safeJustification = sanitizeJustification(justification || '');
  const timestamp = new Date().toISOString();

  // Atomically create DEVIATIONS.md if it does not exist (prevents TOCTOU race)
  const templatePath = path.resolve(__dirname, '..', '..', 'templates', 'deviation-log.md');
  const template = safeReadFile(templatePath);
  const initialContent = template
    ? template.replace(/\[SLUG\]/g, safe).replace(/\[ISO_TIMESTAMP\]/g, timestamp)
    : [
        '# Deviation Log',
        '',
        `**Campaign:** ${safe}`,
        `**Created:** ${timestamp}`,
        '',
        '| Timestamp | Gate | Tier | Result | Asset | Finding | Action | Justification | Verify Run |',
        '|-----------|------|------|--------|-------|---------|--------|---------------|------------|',
        '<!-- NEW ENTRIES BELOW THIS LINE -->',
      ].join('\n');
  try {
    fs.writeFileSync(deviationsPath, initialContent, { flag: 'wx', encoding: 'utf-8' });
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
    // File already exists -- proceed to append
  }

  // Read current content and append new entry
  const content = safeReadFile(deviationsPath);
  if (content === null) {
    error(`Failed to read DEVIATIONS.md for campaign: ${safe}`);
  }

  // Build table row entry
  const opts = extra || {};
  const tierMap = {
    positioning_drift: 'T1', claim_accuracy: 'T1', voice_drift: 'T2',
    outcome_alignment: 'T1', funnel_integrity: 'T2', utm_hygiene: 'T2',
    compliance: 'T2', competitor_collision: 'T2', icp_fit: 'T2',
    format_correctness: 'T2',
  };
  const tier = (opts.tier || tierMap[gateLower] || 'T2').toString().substring(0, 10);
  const actionMap = { accepted: 'Accept+log', correct: 'Correct', escalated: 'Escalate' };
  const action = sanitizeJustification(opts.action || '') || actionMap[resultLower] || resultLower;
  const finding = sanitizeJustification(opts.finding || '') || '--';
  const run = (opts.run || '--').toString().replace(/\|/g, '-').substring(0, 20);

  const newRow = `| ${timestamp} | ${gateLower} | ${tier} | ${resultLower} | ${safeAsset} | ${finding} | ${action} | ${safeJustification} | ${run} |`;

  // Append after the last line of content
  const updated = content.trimEnd() + '\n' + newRow + '\n';
  safeWriteFile(deviationsPath, updated);

  output(
    { appended: true, gate: gateLower, result: resultLower, asset: safeAsset, timestamp },
    raw,
    `appended ${gateLower}=${resultLower}`
  );
}

module.exports = {
  cmdDeviationAppend,
};
