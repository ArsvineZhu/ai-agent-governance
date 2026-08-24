#!/usr/bin/env node
// Shared utilities for governance scripts — zero-dependency, Node.js built-ins only.
// Import via: const { argValue, readJSON, readFileSafe, walk } = require("./_lib.js");

const fs = require("fs");
const path = require("path");

/**
 * Extract a value from an argument array (e.g., process.argv.slice(2)).
 * @param {string[]} argv - Argument array to search
 * @param {string} name - Argument name (e.g., "--target")
 * @returns {string|null} - Value following the argument, or null if not found
 */
function argValue(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null;
}

/**
 * Read and parse a JSON file. Returns null on any error.
 * @param {string} p - Absolute path to the JSON file
 * @returns {any|null} - Parsed JSON or null
 */
function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    if (process.env.DEBUG) console.error(`[DEBUG] Failed to read JSON: ${p}`);
    return null;
  }
}

/**
 * Read a file as UTF-8 string. Returns null on any error.
 * @param {string} p - Absolute path to the file
 * @returns {string|null} - File content or null
 */
function readFileSafe(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    if (process.env.DEBUG) console.error(`[DEBUG] Failed to read file: ${p}`);
    return null;
  }
}

/**
 * Recursively walk a directory, returning relative paths of .md files.
 * @param {string} dir - Directory to walk
 * @param {string} base - Base directory for relative paths (defaults to dir)
 * @returns {string[]} - Sorted array of relative paths
 */
function walk(dir, base = dir) {
  const out = [];
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) out.push(...walk(p, base));
      else if (e.name.endsWith(".md")) out.push(path.relative(base, p));
    }
  } catch {
    if (process.env.DEBUG) console.error(`[DEBUG] Failed to walk directory: ${dir}`);
  }
  return out.sort();
}

/**
 * Check if a path exists and is a file.
 * @param {string} p - Absolute path
 * @returns {boolean}
 */
function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * Check if a path exists and is a directory.
 * @param {string} p - Absolute path
 * @returns {boolean}
 */
function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Ensure a directory exists, creating it if necessary.
 * @param {string} dirpath - Absolute path to the directory
 * @returns {{ path: string, action: string }} - Result with path and action taken
 */
function ensureDir(dirpath) {
  const existedBefore = fs.existsSync(dirpath);
  fs.mkdirSync(dirpath, { recursive: true });
  const keep = path.join(dirpath, ".gitkeep");
  const others = fs.readdirSync(dirpath).filter((f) => f !== ".gitkeep");
  let wroteKeep = false;
  if (!fs.existsSync(keep) && others.length === 0) {
    fs.writeFileSync(keep, "", "utf8");
    wroteKeep = true;
  }
  return { path: dirpath, action: existedBefore && !wroteKeep ? "skipped" : "created-dir" };
}

/**
 * Write a file only if it doesn't already exist.
 * @param {string} filepath - Absolute path to the file
 * @param {string} content - Content to write
 * @returns {{ path: string, action: string }} - Result with path and action taken
 */
function writeIfAbsent(filepath, content) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  if (fs.existsSync(filepath)) {
    return { path: filepath, action: "skipped" };
  }
  fs.writeFileSync(filepath, content, "utf8");
  return { path: filepath, action: "created" };
}

module.exports = {
  argValue,
  readJSON,
  readFileSafe,
  walk,
  isFile,
  isDir,
  ensureDir,
  writeIfAbsent,
};
