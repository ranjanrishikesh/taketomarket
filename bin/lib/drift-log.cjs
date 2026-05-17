/**
 * Drift Log -- Append-only DRIFT-LOG.md operations for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: path, fs.
 * Depends on: ./core.cjs for output, error, safeReadFile, safeWriteFile
 *
 * Exports: cmdDriftLogAppend, cmdDriftLogDeprecation
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

// Allowlist for event types
const ALLOWED_EVENT_TYPES = new Set(['shift', 'audit', 'deviation']);

/**
 * Sanitize details text to prevent injection.
 * Strips backticks, all $ signs, newlines, pipe chars, and redirects.
 * @param {string} text - Raw details text
 * @returns {string} Sanitized text (max 200 chars)
 */
function sanitizeDetails(text) {
  if (!text) return '';
  return text
    .replace(/`/g, "'")
    .replace(/\$/g, '')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .replace(/\|/g, '-')
    .replace(/[<>]/g, '')
    .substring(0, 200)
    .trim();
}

/**
 * Resolve the DRIFT-LOG.md path and ensure it is inside the project root.
 * @returns {{ driftLogPath: string, projectRoot: string }}
 */
function resolveDriftLogPath() {
  const projectRoot = path.resolve(process.cwd());
  const driftLogPath = path.resolve(process.cwd(), '.taketomarket', 'DRIFT-LOG.md');
  if (!driftLogPath.startsWith(projectRoot)) {
    error('DRIFT-LOG.md path escapes project directory');
  }
  return { driftLogPath, projectRoot };
}

/**
 * Ensure DRIFT-LOG.md exists using TOCTOU-safe atomic creation.
 * @param {string} driftLogPath - Absolute path to DRIFT-LOG.md
 */
function ensureDriftLog(driftLogPath) {
  const timestamp = new Date().toISOString();
  const templatePath = path.resolve(__dirname, '..', '..', 'templates', 'drift-log.md');
  const template = safeReadFile(templatePath);
  const initialContent = template
    ? template.replace(/\[ISO_TIMESTAMP\]/g, timestamp)
    : [
        '# Positioning Drift Log',
        '',
        `**Created:** ${timestamp}`,
        '',
        'This file is **append-only**.',
        '',
        '## Audit Trail',
        '',
        '| Date | Event | Source | Details | Assets Affected |',
        '|------|-------|--------|---------|-----------------|',
        '<!-- NEW ENTRIES BELOW THIS LINE -->',
        '',
        '## Deprecation Backlog',
        '',
        '| Asset | Campaign | Old Positioning Element | Required Update | Deadline | Status |',
        '|-------|----------|------------------------|-----------------|----------|--------|',
        '<!-- DEPRECATION ENTRIES BELOW THIS LINE -->',
      ].join('\n');

  // Ensure .taketomarket directory exists
  const dir = path.dirname(driftLogPath);
  fs.mkdirSync(dir, { recursive: true });

  try {
    fs.writeFileSync(driftLogPath, initialContent, { flag: 'wx', encoding: 'utf-8' });
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
    // File already exists -- proceed to append
  }
}

/**
 * Append a drift event entry to .taketomarket/DRIFT-LOG.md.
 *
 * @param {string} eventType - Event type (shift, audit, deviation)
 * @param {string} source - Source command or campaign that triggered the event
 * @param {string} details - Details/summary text
 * @param {string|number} affectedCount - Number of assets affected
 * @param {boolean} raw - Whether to output raw string
 */
function cmdDriftLogAppend(eventType, source, details, affectedCount, raw) {
  if (!eventType || !eventType.trim()) error('event-type required for drift-log append');
  if (!source || !source.trim()) error('source required for drift-log append');

  // Validate event type against allowlist
  const eventLower = eventType.toLowerCase().trim();
  if (!ALLOWED_EVENT_TYPES.has(eventLower)) {
    error(`Unknown event type: ${eventType}. Allowed: ${[...ALLOWED_EVENT_TYPES].join(', ')}`);
  }

  // Sanitize inputs
  const safeSource = source.replace(/\|/g, '-').replace(/\n/g, '').replace(/[<>]/g, '').substring(0, 80);
  const safeDetails = sanitizeDetails(details || '');
  const safeAffected = parseInt(affectedCount, 10) || 0;

  const { driftLogPath } = resolveDriftLogPath();

  // TOCTOU defense: create if not exists
  ensureDriftLog(driftLogPath);

  // Read current content and append new entry
  const content = safeReadFile(driftLogPath);
  if (content === null) {
    error('Failed to read DRIFT-LOG.md');
  }

  const timestamp = new Date().toISOString();
  const newRow = `| ${timestamp} | ${eventLower} | ${safeSource} | ${safeDetails} | ${safeAffected} |`;

  // Find the Audit Trail marker and append after it
  const marker = '<!-- NEW ENTRIES BELOW THIS LINE -->';
  let updated;
  const markerCount = content.split(marker).length - 1;
  if (markerCount > 1) {
    error(`DRIFT-LOG.md has ${markerCount} occurrences of the Audit Trail marker. File may be corrupted.`);
  }
  if (markerCount === 1) {
    updated = content.replace(marker, marker + '\n' + newRow);
  } else {
    // Fallback: append at end of content
    updated = content.trimEnd() + '\n' + newRow + '\n';
  }

  safeWriteFile(driftLogPath, updated);

  output(
    { appended: true, event_type: eventLower, source: safeSource, timestamp },
    raw,
    'appended ' + eventLower + '=' + safeSource
  );
}

/**
 * Append a deprecation entry to .taketomarket/DRIFT-LOG.md Deprecation Backlog.
 *
 * @param {string} asset - Asset identifier
 * @param {string} campaign - Campaign slug
 * @param {string} oldElement - Old positioning element being deprecated
 * @param {string} requiredUpdate - Description of required update
 * @param {string} deadline - Deadline for the update (ISO date or description)
 * @param {boolean} raw - Whether to output raw string
 */
function cmdDriftLogDeprecation(asset, campaign, oldElement, requiredUpdate, deadline, raw) {
  if (!asset || !asset.trim()) error('asset required for drift-log deprecation');
  if (!campaign || !campaign.trim()) error('campaign required for drift-log deprecation');

  // Sanitize all inputs
  const safeAsset = (asset || '').replace(/\|/g, '-').replace(/\n/g, '').replace(/[<>]/g, '').substring(0, 80);
  const safeCampaign = (campaign || '').replace(/\|/g, '-').replace(/\n/g, '').replace(/[<>]/g, '').substring(0, 80);
  const safeOldElement = sanitizeDetails(oldElement || '');
  const safeUpdate = sanitizeDetails(requiredUpdate || '');
  const safeDeadline = (deadline || '').replace(/\|/g, '-').replace(/\n/g, '').replace(/[<>]/g, '').substring(0, 30);

  const { driftLogPath } = resolveDriftLogPath();

  // TOCTOU defense: create if not exists
  ensureDriftLog(driftLogPath);

  // Read current content and append deprecation entry
  const content = safeReadFile(driftLogPath);
  if (content === null) {
    error('Failed to read DRIFT-LOG.md');
  }

  const newRow = `| ${safeAsset} | ${safeCampaign} | ${safeOldElement} | ${safeUpdate} | ${safeDeadline} | pending |`;

  // Find the Deprecation Backlog marker and append after it
  const marker = '<!-- DEPRECATION ENTRIES BELOW THIS LINE -->';
  let updated;
  const markerCount = content.split(marker).length - 1;
  if (markerCount > 1) {
    error(`DRIFT-LOG.md has ${markerCount} occurrences of the Deprecation marker. File may be corrupted.`);
  }
  if (markerCount === 1) {
    updated = content.replace(marker, marker + '\n' + newRow);
  } else {
    // Fallback: append at end of content
    updated = content.trimEnd() + '\n' + newRow + '\n';
  }

  safeWriteFile(driftLogPath, updated);

  output(
    { appended: true, asset: safeAsset, deadline: safeDeadline },
    raw,
    'deprecation added'
  );
}

module.exports = {
  cmdDriftLogAppend,
  cmdDriftLogDeprecation,
};
