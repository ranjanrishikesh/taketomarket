'use strict';

const fs = require('fs');
const path = require('path');

// Relative path fragment. Always prepended with `cwd` in readConfig/writeConfig.
const CONFIG_RELATIVE_PATH = path.join('.taketomarket', 'CONFIG.md');

const DEFAULTS = {
  yolo: false,
  inline_education: true,
  landing_path: null,
  brand_path: '.taketomarket/brand',
};

function parseYamlFrontmatter(text) {
  if (!text.startsWith('---\n')) return {};
  const end = text.indexOf('\n---', 4);
  if (end < 0) return {};
  const yaml = text.slice(4, end);
  const out = {};
  for (const line of yaml.split('\n')) {
    const m = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (val === 'null' || val === '~' || val === '') val = null;
    else if (/^-?\d+$/.test(val)) val = parseInt(val, 10);
    out[m[1]] = val;
  }
  return out;
}

function serializeYamlFrontmatter(obj) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(obj)) {
    if (v === null) lines.push(`${k}: null`);
    else if (typeof v === 'boolean') lines.push(`${k}: ${v}`);
    else lines.push(`${k}: ${v}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function readConfig(cwd) {
  const p = path.join(cwd, CONFIG_RELATIVE_PATH);
  if (!fs.existsSync(p)) return { ...DEFAULTS };
  const body = fs.readFileSync(p, 'utf8');
  return { ...DEFAULTS, ...parseYamlFrontmatter(body) };
}

function writeConfig(cwd, cfg) {
  const dir = path.join(cwd, '.taketomarket');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const merged = { ...DEFAULTS, ...cfg };
  const text = serializeYamlFrontmatter(merged) + '\n\n# takeToMarket Config\n\nManaged by `/ttm-config`. Do not edit the frontmatter manually unless you know what you are doing.\n';
  fs.writeFileSync(path.join(cwd, CONFIG_RELATIVE_PATH), text);
}

function setConfig(cwd, key, value) {
  const cfg = readConfig(cwd);
  cfg[key] = value;
  writeConfig(cwd, cfg);
}

module.exports = { readConfig, writeConfig, setConfig, DEFAULTS };
