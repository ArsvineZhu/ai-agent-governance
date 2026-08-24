#!/usr/bin/env node
// Sync Groups Mechanical Check — read-only, zero-dependency.
// Verifies a task's change set against .governance/sync-rules.json.
// Usage: node scripts/check-sync.js [--json] [--advisory] [--base <sha>]
// Exit 0: clean (or --advisory) · Exit 1: unsynced groups in gate mode.

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { argValue, readJSON } = require("./_lib.js");

const POLICY = path.join(process.cwd(), ".governance", "sync-rules.json");
const STATE = path.join(process.cwd(), ".governance", "state.json");

function globMatch(pattern, file) {
  if (pattern === file) return true;
  if (pattern.endsWith("/**")) {
    const prefix = pattern.slice(0, -3);
    if (prefix.endsWith("/")) {
      return file === prefix.slice(0, -1) || file.startsWith(prefix);
    }
    return file.startsWith(prefix + "/") || file === prefix;
  }
  return false;
}

function changedPaths(base) {
  const out = new Set();
  if (base) {
    const r = spawnSync("git", ["diff", "--name-only", base + "..HEAD"], { encoding: "utf8" });
    if (r.status === 0) {
      String(r.stdout || "").split("\n").filter(Boolean).forEach((p) => out.add(p));
    }
  }
  const r2 = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
  if (r2.status === 0) {
    String(r2.stdout || "").split("\n").forEach((line) => {
      const m = line.match(/^..\s+(.+)$/);
      if (m) out.add(m[1].trim());
    });
  }
  return Array.from(out);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("Usage:\n  check-sync.js [--json] [--advisory] [--base <sha>]\nCompare the task change set against .governance/sync-rules.json.\nExit 0: synced (or --advisory). Exit 1: unsynced groups (gate mode).");
  process.exit(0);
}

const policy = readJSON(POLICY);
if (!policy || !Array.isArray(policy.syncGroups)) {
  console.error("check-sync: no .governance/sync-rules.json - nothing to check");
  process.exit(0);
}

let base = argValue(process.argv, "--base");
if (!base) {
  const st = readJSON(STATE);
  base = st && st.task_start_sha ? st.task_start_sha : null;
}
if (!base) {
  const r = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  if (r.status === 0) base = String(r.stdout || "").trim() || null;
}
if (!base) {
  console.error("check-sync: cannot determine task-start SHA (no state.json task_start_sha, no --base, no git HEAD)");
  process.exit(1);
}

const changed = changedPaths(base);
const unsynced = [];
for (const g of policy.syncGroups) {
  const watch = g.watch || [];
  const require = g.require || [];
  const hit = watch.some((p) => changed.some((f) => globMatch(p, f)));
  if (!hit) continue;
  const synced = require.some((p) => changed.some((f) => globMatch(p, f)));
  if (!synced) unsynced.push({ group: g.name, watch, require });
}

const advisory = process.argv.includes("--advisory");
const json = process.argv.includes("--json");

// Append to .governance/drift-report.json under `sync` (runtime output, git-ignored,
// optional: never let a report-write failure change the check result).
try {
  const driftPath = path.join(process.cwd(), ".governance", "drift-report.json");
  const drift = fs.existsSync(driftPath) ? JSON.parse(fs.readFileSync(driftPath, "utf8")) : {};
  drift.sync = {
    base,
    clean: unsynced.length === 0,
    unsynced: unsynced.map((u) => u.group),
    checked_at: "",
  };
  fs.mkdirSync(path.dirname(driftPath), { recursive: true });
  fs.writeFileSync(driftPath, JSON.stringify(drift, null, 2) + "\n");
} catch (e) {
  if (process.env.DEBUG) console.error(`[DEBUG] Failed to update drift-report.json: ${e.message}`);
}

if (json) {
  process.stdout.write(JSON.stringify({ clean: unsynced.length === 0, base, unsynced }, null, 2) + "\n");
  process.exit(unsynced.length === 0 || advisory ? 0 : 1);
}

if (unsynced.length === 0) {
  console.log("check-sync: synced");
  process.exit(0);
}

console.error("check-sync: BLOCKED - unsynced groups:");
for (const u of unsynced) {
  console.error(`  ${u.group}  watch=${u.watch.join(",")}  require=${u.require.join(",")}`);
}
console.error("Update the required files for each unsynced group before declaring done.");
process.exit(advisory ? 0 : 1);
