'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { createTempDir } = require('./helpers.cjs');

const install = require('../install.js');

describe('install.js module exports', () => {
  it('can be required without triggering install', () => {
    assert.ok(install, 'module exports a truthy object');
  });

  it('exports all expected functions', () => {
    const expectedFns = [
      'detectRuntime',
      'validateInstall',
      'copyDirSync',
      'dirExists',
      'fileExists',
      'printResults',
    ];
    for (const fn of expectedFns) {
      assert.strictEqual(typeof install[fn], 'function', `exports.${fn} is a function`);
    }
  });

  it('exports DIRS_TO_COPY as a non-empty array', () => {
    assert.ok(Array.isArray(install.DIRS_TO_COPY), 'DIRS_TO_COPY is an array');
    assert.ok(install.DIRS_TO_COPY.length > 0, 'DIRS_TO_COPY is not empty');
  });

  it('exports FILES_TO_COPY as a non-empty array', () => {
    assert.ok(Array.isArray(install.FILES_TO_COPY), 'FILES_TO_COPY is an array');
    assert.ok(install.FILES_TO_COPY.length > 0, 'FILES_TO_COPY is not empty');
  });
});

describe('install.js dirExists', () => {
  let tmp;

  before(() => {
    tmp = createTempDir();
  });

  after(() => {
    tmp.cleanup();
  });

  it('returns true for an existing directory', () => {
    assert.strictEqual(install.dirExists(tmp.dir), true);
  });

  it('returns false for a non-existent path', () => {
    assert.strictEqual(install.dirExists(path.join(tmp.dir, 'nope')), false);
  });
});

describe('install.js fileExists', () => {
  let tmp;
  let testFile;

  before(() => {
    tmp = createTempDir();
    testFile = path.join(tmp.dir, 'test-file.txt');
    fs.writeFileSync(testFile, 'hello');
  });

  after(() => {
    tmp.cleanup();
  });

  it('returns true for an existing file', () => {
    assert.strictEqual(install.fileExists(testFile), true);
  });

  it('returns false for a non-existent path', () => {
    assert.strictEqual(install.fileExists(path.join(tmp.dir, 'nope.txt')), false);
  });
});
