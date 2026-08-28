#!/usr/bin/env node
// PAYLOAD SCRIPT — copied standalone into governed projects (references/init-spec.json).
// Keep it self-contained: Node builtins only, never require() a sibling module.
// Git Policy Check — read-only. Verifies the current branch/state against .governance/git-policy.json.
// Usage: node scripts/check-git-policy.js [--json]
// Exit 0: safe to proceed. Exit 1: currently on a protected branch with directPush=false —
// create a feature branch (feature/agent-<date>-<summary>) before modifying/committing.

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const POLICY = path.join(process.cwd(), ".governance", "git-policy.json");

function readPolicy() {
  try {
    return JSON.parse(fs.readFileSync(POLICY, "utf8"));
  } catch {
    return null;
  }
}

function currentBranch() {
  const r = spawnSync("git", ["branch", "--show-current"], { encoding: "utf8" });
  if (r.status !== 0) return null;
  return String(r.stdout || "").trim() || null;
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`Usage:
  check-git-policy.js [--json]   Check current branch against .governance/git-policy.json (read-only)
Exit codes: 0 safe to proceed · 1 on a protected branch with directPush=false (create a feature branch first)`);
  process.exit(0);
}

const policy = readPolicy();
const branch = currentBranch();
const protectedBranches = policy && Array.isArray(policy.protectedBranches) ? policy.protectedBranches : [];
const directPush = policy ? !!policy.directPush : true;
const blocked = branch !== null && protectedBranches.includes(branch) && !directPush;

if (process.argv.includes("--json")) {
  process.stdout.write(
    JSON.stringify(
      {
        policyPresent: policy !== null,
        currentBranch: branch,
        protectedBranches,
        directPush,
        blocked,
      },
      null,
      2
    ) + "\n"
  );
  process.exit(blocked ? 1 : 0);
}

if (!policy) {
  console.log("no .governance/git-policy.json — policy absent, proceed");
  process.exit(0);
}
if (blocked) {
  console.error(
    `BLOCKED: current branch "${branch}" is protected and directPush=false — ` +
      `create a feature branch (feature/agent-<date>-<summary>) before modifying/committing`
  );
  process.exit(1);
}
console.log(`policy ok — branch "${branch || "(detached)"}" not blocked`);
process.exit(0);
