'use strict';

const fs = require('fs');
const path = require('path');

function fileExists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function detectStack(cwd) {
  const stack = new Set();
  const pkgPath = path.join(cwd, 'package.json');
  if (fileExists(pkgPath)) {
    stack.add('node');
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
      for (const name of Object.keys(deps)) {
        if (['react', 'next', 'astro', 'svelte', 'vue', 'angular', 'remix', 'nuxt'].includes(name)) {
          stack.add(name);
        }
        if (name === 'typescript') stack.add('typescript');
        if (name === 'tailwindcss' || name === '@tailwindcss/postcss') stack.add('tailwind');
        if (name === 'express' || name === 'fastify' || name === 'koa') stack.add(name);
      }
    } catch {}
  }
  if (fileExists(path.join(cwd, 'pyproject.toml')) || fileExists(path.join(cwd, 'requirements.txt'))) {
    stack.add('python');
  }
  if (fileExists(path.join(cwd, 'go.mod'))) stack.add('go');
  if (fileExists(path.join(cwd, 'Cargo.toml'))) stack.add('rust');
  if (fileExists(path.join(cwd, 'Gemfile'))) stack.add('ruby');
  if (fileExists(path.join(cwd, 'composer.json'))) stack.add('php');
  return Array.from(stack);
}

function detectMonorepo(cwd) {
  if (fileExists(path.join(cwd, 'pnpm-workspace.yaml'))) return true;
  if (fileExists(path.join(cwd, 'turbo.json'))) return true;
  if (fileExists(path.join(cwd, 'nx.json'))) return true;
  if (fileExists(path.join(cwd, 'lerna.json'))) return true;
  const pkgPath = path.join(cwd, 'package.json');
  if (fileExists(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.workspaces) return true;
    } catch {}
  }
  const cargoPath = path.join(cwd, 'Cargo.toml');
  if (fileExists(cargoPath)) {
    try {
      const cargo = fs.readFileSync(cargoPath, 'utf8');
      if (/^\s*\[workspace\]/m.test(cargo)) return true;
    } catch {}
  }
  return false;
}

function detectFeatureCandidates(cwd) {
  const candidates = [];
  for (const base of ['src', 'app', 'lib', 'packages', 'apps', 'modules']) {
    const p = path.join(cwd, base);
    if (!fileExists(p)) continue;
    try {
      const entries = fs.readdirSync(p, { withFileTypes: true });
      for (const e of entries) {
        if (e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_')) {
          candidates.push(e.name);
        }
      }
    } catch {}
  }
  return Array.from(new Set(candidates));
}

function scanCodebase(cwd) {
  return {
    cwd,
    stack: detectStack(cwd),
    monorepo: detectMonorepo(cwd),
    featureCandidates: detectFeatureCandidates(cwd),
  };
}

module.exports = { scanCodebase, detectStack, detectMonorepo, detectFeatureCandidates };
