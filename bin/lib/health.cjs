/**
 * Health -- Directory integrity validation for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: fs, path.
 * Depends on: ./core.cjs for output, error, safeReadFile, parseFrontmatter
 *
 * Exports: cmdHealth, cmdInit
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { output, safeReadFile, parseFrontmatter } = require('./core.cjs');

/**
 * Expected reference files in .taketomarket/ directory.
 */
const REFERENCE_FILES = [
  'POSITIONING.md',
  'BRAND.md',
  'ICP.md',
  'CHANNELS.md',
  'STATE.md',
  'CALENDAR.md',
  'COMPETITORS.md',
  'METRICS.md',
  'LEARNINGS.md',
];

/**
 * Valid campaign phases for state consistency checking.
 */
const VALID_PHASES = new Set([
  'created', 'researched', 'briefed', 'produced', 'verified',
  'reviewed', 'fixed', 'shipped', 'measured', 'learned',
  'archived', 'cancelled',
]);

/**
 * Check if a path exists and is a directory.
 * @param {string} p - Path to check
 * @returns {boolean}
 */
function dirExists(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a path exists and is a file.
 * @param {string} p - Path to check
 * @returns {boolean}
 */
function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * Check campaign STATE.md consistency for all campaigns.
 * @param {string} campaignsDir - Path to CAMPAIGNS/ directory
 * @returns {Array} Array of check objects
 */
function checkCampaignStateConsistency(campaignsDir) {
  const checks = [];
  let entries;
  try {
    entries = fs.readdirSync(campaignsDir, { withFileTypes: true });
  } catch {
    return checks;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'ARCHIVE') continue;
    const statePath = path.resolve(campaignsDir, entry.name, 'STATE.md');
    const content = safeReadFile(statePath);
    if (content === null) {
      checks.push({
        name: `campaign_state_${entry.name}`,
        status: 'fail',
        path: `.taketomarket/CAMPAIGNS/${entry.name}/STATE.md`,
        detail: 'STATE.md missing',
      });
      continue;
    }
    const { frontmatter } = parseFrontmatter(content);
    if (!frontmatter.phase || !VALID_PHASES.has(frontmatter.phase)) {
      checks.push({
        name: `campaign_state_${entry.name}`,
        status: 'fail',
        path: `.taketomarket/CAMPAIGNS/${entry.name}/STATE.md`,
        detail: `invalid phase: ${frontmatter.phase || 'undefined'}`,
      });
    } else {
      checks.push({
        name: `campaign_state_${entry.name}`,
        status: 'pass',
        path: `.taketomarket/CAMPAIGNS/${entry.name}/STATE.md`,
      });
    }
  }
  return checks;
}

/**
 * Check reference file staleness based on mtime.
 * @param {string} marketingDir - Path to .taketomarket/ directory
 * @param {number} thresholdDays - Days threshold for staleness warning (default 90)
 * @returns {Array} Array of check objects
 */
function checkReferenceStaleness(marketingDir, thresholdDays) {
  if (!thresholdDays) thresholdDays = 90;
  const checks = [];
  const now = Date.now();
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;

  for (const file of REFERENCE_FILES) {
    const filePath = path.resolve(marketingDir, file);
    try {
      const stat = fs.statSync(filePath);
      const ageMs = now - stat.mtimeMs;
      const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
      if (ageMs > thresholdMs) {
        checks.push({
          name: `staleness_${file.toLowerCase().replace('.md', '')}`,
          status: 'warn',
          path: `.taketomarket/${file}`,
          detail: `not updated in ${ageDays} days`,
        });
      } else {
        checks.push({
          name: `staleness_${file.toLowerCase().replace('.md', '')}`,
          status: 'pass',
          path: `.taketomarket/${file}`,
        });
      }
    } catch {
      // File doesn't exist -- skip (already covered by basic health check)
    }
  }
  return checks;
}

/**
 * Check campaign velocity -- detect stuck campaigns.
 * @param {string} campaignsDir - Path to CAMPAIGNS/ directory
 * @param {number} thresholdDays - Days threshold for stuck warning (default 14)
 * @returns {Array} Array of check objects
 */
function checkCampaignVelocity(campaignsDir, thresholdDays) {
  if (!thresholdDays) thresholdDays = 14;
  const checks = [];
  const now = Date.now();
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;

  let entries;
  try {
    entries = fs.readdirSync(campaignsDir, { withFileTypes: true });
  } catch {
    return checks;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'ARCHIVE') continue;
    const statePath = path.resolve(campaignsDir, entry.name, 'STATE.md');
    const content = safeReadFile(statePath);
    if (content === null) continue;
    const { frontmatter } = parseFrontmatter(content);
    const lastUpdated = frontmatter['last_updated'];
    if (!lastUpdated || lastUpdated === 'null') continue;
    const lastMs = Date.parse(lastUpdated);
    if (isNaN(lastMs)) continue;
    const ageMs = now - lastMs;
    const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
    if (ageMs > thresholdMs) {
      checks.push({
        name: `velocity_${entry.name}`,
        status: 'warn',
        path: `.taketomarket/CAMPAIGNS/${entry.name}/STATE.md`,
        detail: `stuck in ${frontmatter.phase} for ${ageDays} days`,
      });
    } else {
      checks.push({
        name: `velocity_${entry.name}`,
        status: 'pass',
        path: `.taketomarket/CAMPAIGNS/${entry.name}/STATE.md`,
      });
    }
  }
  return checks;
}

/**
 * Check DRIFT-LOG.md structural integrity.
 * @param {string} marketingDir - Path to .taketomarket/ directory
 * @returns {Array} Array of check objects
 */
function checkDriftLogIntegrity(marketingDir) {
  const checks = [];
  const driftLogPath = path.resolve(marketingDir, 'DRIFT-LOG.md');
  const content = safeReadFile(driftLogPath);

  if (content === null) {
    checks.push({
      name: 'drift_log_integrity',
      status: 'warn',
      path: '.taketomarket/DRIFT-LOG.md',
      detail: 'no drift log yet',
    });
    return checks;
  }

  const markerCount = (content.match(/<!-- Audit Trail -->/g) || []).length;
  if (markerCount === 0) {
    checks.push({
      name: 'drift_log_integrity',
      status: 'fail',
      path: '.taketomarket/DRIFT-LOG.md',
      detail: 'missing audit trail marker',
    });
  } else if (markerCount > 1) {
    checks.push({
      name: 'drift_log_integrity',
      status: 'fail',
      path: '.taketomarket/DRIFT-LOG.md',
      detail: 'duplicate audit trail markers',
    });
  } else {
    checks.push({
      name: 'drift_log_integrity',
      status: 'pass',
      path: '.taketomarket/DRIFT-LOG.md',
    });
  }
  return checks;
}

/**
 * Check gate result consistency for campaigns with verification results.
 * @param {string} campaignsDir - Path to CAMPAIGNS/ directory
 * @returns {Array} Array of check objects
 */
function checkGateConsistency(campaignsDir) {
  const checks = [];
  const validGateValues = new Set(['null', 'pass', 'warn', 'fail', 'fix_needed', 'accepted']);

  let entries;
  try {
    entries = fs.readdirSync(campaignsDir, { withFileTypes: true });
  } catch {
    return checks;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'ARCHIVE') continue;
    const statePath = path.resolve(campaignsDir, entry.name, 'STATE.md');
    const content = safeReadFile(statePath);
    if (content === null) continue;
    const { frontmatter } = parseFrontmatter(content);

    const invalidGates = [];
    for (const [key, value] of Object.entries(frontmatter)) {
      if (key.startsWith('gate.') && value && !validGateValues.has(value)) {
        invalidGates.push(`${key}=${value}`);
      }
    }

    if (invalidGates.length > 0) {
      checks.push({
        name: `gate_consistency_${entry.name}`,
        status: 'fail',
        path: `.taketomarket/CAMPAIGNS/${entry.name}/STATE.md`,
        detail: `invalid gate values: ${invalidGates.join(', ')}`,
      });
    } else {
      checks.push({
        name: `gate_consistency_${entry.name}`,
        status: 'pass',
        path: `.taketomarket/CAMPAIGNS/${entry.name}/STATE.md`,
      });
    }
  }
  return checks;
}

/**
 * Validate .taketomarket/ directory structure.
 *
 * Checks:
 * 1. .taketomarket/ directory exists
 * 2. .taketomarket/CAMPAIGNS/ directory exists
 * 3. Each expected reference file exists
 * 4. STATE.md has valid frontmatter (parseable)
 *
 * When full=true, runs extended checks:
 * 5. Campaign state consistency
 * 6. Reference file staleness
 * 7. Campaign velocity
 * 8. DRIFT-LOG integrity
 * 9. Gate result consistency
 *
 * healthy = true when .taketomarket/ and CAMPAIGNS/ both exist and no 'fail' checks.
 * Reference files use "missing" status (expected before /ttm-init runs).
 *
 * @param {boolean} raw - Whether to output raw summary string
 * @param {boolean} full - Whether to run extended audit checks
 */
function cmdHealth(raw, full) {
  const marketingDir = path.resolve(process.cwd(), '.taketomarket');
  const campaignsDir = path.resolve(marketingDir, 'CAMPAIGNS');
  const checks = [];

  // Check .taketomarket/ directory
  const marketingExists = dirExists(marketingDir);
  checks.push({
    name: 'taketomarket_dir',
    status: marketingExists ? 'pass' : 'fail',
    path: '.taketomarket/',
  });

  // Check CAMPAIGNS/ directory
  const campaignsExists = dirExists(campaignsDir);
  checks.push({
    name: 'campaigns_dir',
    status: campaignsExists ? 'pass' : 'fail',
    path: '.taketomarket/CAMPAIGNS/',
  });

  // Check each reference file
  for (const file of REFERENCE_FILES) {
    const filePath = path.resolve(marketingDir, file);
    const name = file.toLowerCase().replace('.md', '_md');
    if (fileExists(filePath)) {
      // Extra validation for STATE.md -- check frontmatter is parseable
      if (file === 'STATE.md') {
        const content = safeReadFile(filePath);
        const { frontmatter } = parseFrontmatter(content || '');
        const isValid = Object.keys(frontmatter).length > 0;
        checks.push({
          name,
          status: isValid ? 'pass' : 'fail',
          path: `.taketomarket/${file}`,
          detail: isValid ? undefined : 'frontmatter unparseable',
        });
      } else {
        checks.push({ name, status: 'pass', path: `.taketomarket/${file}` });
      }
    } else {
      checks.push({ name, status: 'missing', path: `.taketomarket/${file}` });
    }
  }

  // Extended checks when --full flag is passed
  if (full && campaignsExists) {
    const stateChecks = checkCampaignStateConsistency(campaignsDir);
    checks.push(...stateChecks);

    const stalenessChecks = checkReferenceStaleness(marketingDir);
    checks.push(...stalenessChecks);

    const velocityChecks = checkCampaignVelocity(campaignsDir);
    checks.push(...velocityChecks);

    const driftChecks = checkDriftLogIntegrity(marketingDir);
    checks.push(...driftChecks);

    const gateChecks = checkGateConsistency(campaignsDir);
    checks.push(...gateChecks);
  }

  const passed = checks.filter(c => c.status === 'pass').length;
  const total = checks.length;
  const failures = checks.filter(c => c.status === 'fail').length;
  // healthy = marketing dir + campaigns dir both exist and no failures
  const healthy = marketingExists && campaignsExists && failures === 0;

  const result = {
    healthy,
    checks,
    summary: `${passed}/${total} checks passed`,
  };

  if (raw) {
    const label = healthy ? 'HEALTHY' : 'UNHEALTHY';
    const issues = failures;
    if (healthy) {
      output(result, true, `${label}: ${passed}/${total} checks passed`);
    } else {
      output(result, true, `${label}: ${issues} issue(s) found`);
    }
  } else {
    output(result, false);
  }
}

/**
 * Lightweight init check.
 * Returns: { initialized, taketomarket_dir, reference_files_count, total_expected }
 *
 * @param {boolean} raw - Whether to output raw summary string
 */
function cmdInit(raw) {
  const marketingDir = path.resolve(process.cwd(), '.taketomarket');
  const marketingExists = dirExists(marketingDir);

  let refCount = 0;
  if (marketingExists) {
    for (const file of REFERENCE_FILES) {
      if (fileExists(path.resolve(marketingDir, file))) {
        refCount++;
      }
    }
  }

  const totalExpected = REFERENCE_FILES.length;
  const initialized = marketingExists && refCount >= totalExpected;

  const result = {
    initialized,
    taketomarket_dir: marketingExists,
    reference_files_count: refCount,
    total_expected: totalExpected,
  };

  output(result, raw, initialized ? 'initialized' : 'not initialized');
}

module.exports = {
  cmdHealth,
  cmdInit,
};
