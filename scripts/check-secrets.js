#!/usr/bin/env node
// Secret Scanning Gate — read-only, zero-dependency. Scans the STAGED diff
// (git diff --cached) for secret-like material. Mirrors check-git-policy.js.
// Usage: node scripts/check-secrets.js [--json]
// Exit 0 clean · Exit 1 on hits (file:line + pattern class reported, NEVER the secret itself).

const { spawnSync } = require("child_process");

const PATTERNS = [
  { name: "aws-access-key", re: /AKIA[0-9A-Z]{16}/ },
  { name: "github-pat", re: /(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/ },
  { name: "openai-style-key", re: /sk-[A-Za-z0-9]{20,}/ },
  { name: "private-key-header", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "credential-assignment", re: /(?:password|passwd|secret|token|api[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9_\-\.]{8,}/i },
  { name: "slack-token", re: /xox[bpsar]-[0-9]{10,}-[A-Za-z0-9-]+/ },
  { name: "generic-connection-string", re: /(?:mongodb|postgres|mysql|redis|amqp):\/\/[^:]+:[^@]+@/i },
];

const IGNORED_PATHS = /(^|\/)(\.env|\.env\.[^/]+)$/;

function stagedDiff() {
  const r = spawnSync("git", ["diff", "--cached", "--no-color", "-U0"], { encoding: "utf8" });
  if (r.status !== 0) return { error: String(r.stderr || "git diff failed") };
  return { out: String(r.stdout || "") };
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`Usage:
  check-secrets.js [--json]   Scan the staged diff for secret-like material (read-only)
Exit codes: 0 clean · 1 hits (reports file:line + pattern class, never the secret)`);
  process.exit(0);
}

const { out, error } = stagedDiff();
if (error) {
  console.error(`check-secrets: ${error}`);
  process.exit(1);
}

const hits = [];
let currentFile = null;
const lines = out.split("\n");

for (const line of lines) {
  if (line.startsWith("+++ ")) {
    currentFile = line.slice(4).trim().replace(/^[ab]\//, "");
    continue;
  }
  if (line.startsWith("--- ") || line.startsWith("@@") || line.startsWith("diff --git") || line.startsWith("index ")) {
    continue;
  }
  if (!line.startsWith("+") || line === "+" || line.length === 1) continue;
  if (IGNORED_PATHS.test(currentFile || "")) continue;

  const content = line.slice(1);
  for (const p of PATTERNS) {
    const m = content.match(p.re);
    if (m) {
      hits.push({ file: currentFile || "(unknown)", line: "staged-diff", pattern: p.name });
      break;
    }
  }
}

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify({ clean: hits.length === 0, hits }, null, 2) + "\n");
  process.exit(hits.length === 0 ? 0 : 1);
}

if (hits.length > 0) {
  console.error("check-secrets: BLOCKED — staged diff contains secret-like material:");
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}  [${h.pattern}]`);
  }
  console.error("Remove the material from the staged diff before committing.");
  process.exit(1);
}
console.log("check-secrets: clean");
process.exit(0);
