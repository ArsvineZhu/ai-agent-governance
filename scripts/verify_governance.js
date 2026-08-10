#!/usr/bin/env node
// Governance Validator — plain Node, no dependencies.
// Usage: node scripts/verify-governance.js [--json]
// Paths come from .governance/manifest.json when present (structure-adaptive);
// otherwise built-in defaults are used.
// Exit code 0 when every governance artifact exists, 1 otherwise.

const fs = require("fs");
const path = require("path");

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`Usage:
  verify-governance.js [options]

Options:
  --json       Output JSON report
  --help       Show help`);
  process.exit(0);
}

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, ".governance", "manifest.json");

// [name, relativePath, checker]
const DEFAULTS = [
  ["AGENTS.md", "AGENTS.md", isFile],
  ["CHANGELOG.md", "CHANGELOG.md", isFile],
  ["Architecture doc", "docs/ARCHITECTURE.md", isFile],
  ["Feature registry", "docs/features", isDir],
  ["Plans", "docs/plans", isDir],
  ["Rules", "docs/rules", isDir],
  [".gitignore", ".gitignore", isFile],
  [".env.example", ".env.example", isFile],
  ["CI workflow", null, hasCI],
  ["Validator self", "scripts/verify-governance.js", isFile],
  [".governance state dir", ".governance", isDir],
  [".governance manifest", ".governance/manifest.json", isFile],
  [".governance state", ".governance/state.json", isFile],
  [".governance validation", ".governance/validation.json", isFile],
  [".governance preflight", ".governance/preflight.json", isFile],
  ["Governance version", null, hasGovernanceVersion],
];

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function hasCI() {
  return (
    isFile(path.join(ROOT, ".github/workflows/ci.yml")) ||
    isFile(path.join(ROOT, ".github/workflows/ci.yaml")) ||
    isDir(path.join(ROOT, ".github/workflows")) ||
    isFile(path.join(ROOT, ".gitlab-ci.yml")) ||
    isFile(path.join(ROOT, ".circleci/config.yml"))
  );
}

function getGovernanceVersion() {
  try {
    const m = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    return typeof m.governance_version === "string" ? m.governance_version : null;
  } catch {
    return null;
  }
}

function hasGovernanceVersion() {
  return getGovernanceVersion() !== null;
}

function hasSchemaVersion() {
  try {
    const m = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    return typeof m.schema_version === "string" && m.schema_version.length > 0;
  } catch {
    return false;
  }
}

function checkReleaseMeta() {
  try {
    const m = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    const rel = m.release;
    if (rel === undefined || rel === null) return null; // not declared -> no check
    if (typeof rel !== "object") return false;
    return (
      typeof rel.version === "string" &&
      typeof rel.tag === "string" &&
      typeof rel.validated === "boolean"
    );
  } catch {
    return false;
  }
}

function loadManifestChecks() {
  try {
    const m = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    if (!Array.isArray(m.artifacts) || m.artifacts.length === 0) return null;
    return m.artifacts.map((a) => {
      const rel = path.normalize(a.path);
      const abs = path.join(ROOT, rel);
      return {
        name: a.name || rel,
        path: rel,
        ok: a.kind === "dir" ? isDir(abs) : isFile(abs),
      };
    });
  } catch {
    return null;
  }
}

const manifestChecks = loadManifestChecks();
const results = manifestChecks
  ? (() => {
      const checks = [
        ...manifestChecks,
        { name: "Manifest schema", path: "manifest.schema_version", ok: hasSchemaVersion() },
        { name: "Governance version", path: "manifest.governance_version", ok: hasGovernanceVersion() },
      ];
      const relOk = checkReleaseMeta();
      if (relOk !== null) {
        checks.push({ name: "Release metadata", path: "manifest.release", ok: relOk });
      }
      return checks;
    })()
  : DEFAULTS.map(([name, rel, check]) => {
      const target = rel === null ? null : path.join(ROOT, rel);
      const ok = rel === null ? check() : check(target);
      return { name, path: rel || "(auto)", ok };
    });

const missing = results.filter((r) => !r.ok);
const pass = results.length - missing.length;
const allOk = missing.length === 0;

if (process.argv.includes("--json")) {
  process.stdout.write(
    JSON.stringify(
      {
        root: ROOT,
        timestamp: new Date().toISOString(),
        mode: manifestChecks ? "manifest" : "defaults",
        governance_version: getGovernanceVersion(),
        total: results.length,
        passed: pass,
        failed: missing.length,
        passedAll: allOk,
        results,
      },
      null,
      2
    ) + "\n"
  );
} else {
  console.log(`mode: ${manifestChecks ? "manifest" : "defaults"}`);
  for (const r of results) {
    console.log(`${r.ok ? "✓" : "✗"} ${r.name}  (${r.path})`);
  }
  console.log(`\n${pass}/${results.length} checks passed.`);
  if (missing.length > 0) {
    console.log("Missing:");
    for (const m of missing) console.log(`  - ${m.name} (${m.path})`);
  }
}

process.exit(allOk ? 0 : 1);
