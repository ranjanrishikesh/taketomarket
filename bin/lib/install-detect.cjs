'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const SENTINEL_FILENAME = '.install-method';

function readSentinel(homeDir = os.homedir()) {
  const sentinelPath = path.join(homeDir, '.taketomarket', SENTINEL_FILENAME);
  if (!fs.existsSync(sentinelPath)) return null;
  try {
    const raw = fs.readFileSync(sentinelPath, 'utf8').trim();
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.method === 'string') return parsed;
  } catch (_) {
    // Fall through to heuristic.
  }
  return null;
}

function isTakeToMarketRoot(dir) {
  try {
    const pkgPath = path.join(dir, 'package.json');
    if (!fs.existsSync(pkgPath)) return false;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg && pkg.name === 'taketomarket';
  } catch (_) {
    return false;
  }
}

function findPluginRoot() {
  if (process.env.CLAUDE_PLUGIN_ROOT && isTakeToMarketRoot(process.env.CLAUDE_PLUGIN_ROOT)) {
    return process.env.CLAUDE_PLUGIN_ROOT;
  }
  const candidate = path.join(
    process.env.HOME || os.homedir(),
    '.claude',
    'plugins',
    'cache',
    'claude-plugins-official',
    'taketomarket',
  );
  if (isTakeToMarketRoot(candidate)) return candidate;
  return null;
}

function detectInstallMethod() {
  const sentinel = readSentinel();
  if (sentinel) {
    return { method: sentinel.method, root: sentinel.source || null, source: 'sentinel' };
  }
  const root = findPluginRoot();
  if (!root) return { method: 'unknown', root: null, source: 'heuristic' };
  if (fs.existsSync(path.join(root, '.git'))) {
    return { method: 'clone', root, source: 'heuristic' };
  }
  return { method: 'npm', root, source: 'heuristic' };
}

module.exports = { detectInstallMethod, findPluginRoot, readSentinel, isTakeToMarketRoot, SENTINEL_FILENAME };
