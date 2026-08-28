#!/usr/bin/env node
// PAYLOAD SCRIPT — copied standalone into governed projects (references/init-spec.json).
// Keep it self-contained: Node builtins only, never require() a sibling module.
// Lock Check — read-only. Verifies no other agent holds a lock in .governance/state.json.
// Usage: node scripts/check-lock.js [--json]
// Exit 0: no lock held (or no state yet). Exit 1: a lock is held — wait or coordinate,
// do NOT modify the same files in parallel (SKILL.md: Multi-agent coordination).

const fs = require("fs");
const path = require("path");

const STATE = path.join(process.cwd(), ".governance", "state.json");

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE, "utf8"));
  } catch {
    return null;
  }
}

function lockedValue(state) {
  if (!state) return null;
  return state.locked === null || state.locked === undefined ? null : state.locked;
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`Usage:
  check-lock.js [--json]   Check .governance/state.json for a held lock (read-only)
Exit codes: 0 no lock held · 1 lock held by another agent`);
  process.exit(0);
}

const state = readState();
const lock = lockedValue(state);

if (process.argv.includes("--json")) {
  process.stdout.write(
    JSON.stringify({ locked: lock !== null, lock, agentId: state ? state.agent_id : null, taskId: state ? state.task_id : null }, null, 2) + "\n"
  );
  process.exit(lock !== null ? 1 : 0);
}

if (!state) {
  console.log("no .governance/state.json — no lock held");
  process.exit(0);
}
if (lock === null) {
  console.log("no lock held");
  process.exit(0);
}

console.error(
  `LOCK HELD by ${typeof lock === "string" ? lock : JSON.stringify(lock)}` +
    ` (agent_id: ${state.agent_id || "?"}, task_id: ${state.task_id || "?"})` +
    ` — wait or coordinate; do NOT modify the same files in parallel`
);
process.exit(1);
