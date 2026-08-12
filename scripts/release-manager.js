#!/usr/bin/env node
// Release Manager — zero-dependency Node tool for the AI-assisted, human-approval-gated release flow.
// plan:    analyze change classifications, produce a Release Proposal (READ-ONLY, never writes).
// execute: create the annotated git tag AFTER developer approval (--yes), re-verifying state first.

const fs = require("fs");
const { spawnSync } = require("child_process");

const USAGE = `Usage:
  release-manager.js plan --json <input>          Analyze changes, propose a version (read-only)
  release-manager.js execute --proposal <file> [--yes] [--push]
Options:
  --json <input>     JSON: {"current":"X.Y.Z","changes":[{"type":"breaking|feature|fix|docs|refactor|test|ci|chore","description":"...","uncertain":false}]}
  --proposal <file>  Proposal JSON file produced by 'plan'
  --yes              Record of developer approval — REQUIRED for any write operation
  --push             Also push the tag (requires approval, network access)
  --help             Show help

Exit codes: 0 ok · 1 usage/input error · 2 clarification required · 3 not approved · 4 state check failed · 5 write failed`;

function fail(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

function argValue(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null;
}

// ---------- SemVer ----------

function parseVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v || "").trim());
  if (!m) return null;
  return { major: +m[1], minor: +m[2], patch: +m[3] };
}

function fmt(v) {
  return `${v.major}.${v.minor}.${v.patch}`;
}

function bump(v, type) {
  if (type === "major") return { major: v.major + 1, minor: 0, patch: 0 };
  if (type === "minor") return { major: v.major, minor: v.minor + 1, patch: 0 };
  return { major: v.major, minor: v.minor, patch: v.patch + 1 };
}

function getHeadSha() {
  const r = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  return r.status === 0 ? String(r.stdout || "").trim() || null : null;
}

// ---------- plan ----------

function classify(changes) {
  const c = { breaking: [], features: [], fixes: [], docs: [], other: [] };
  for (const ch of changes || []) {
    const t = String(ch.type || "other").toLowerCase();
    const item = { description: String(ch.description || ""), uncertain: !!ch.uncertain };
    if (t === "breaking") c.breaking.push(item);
    else if (t === "feature") c.features.push(item);
    else if (t === "fix") c.fixes.push(item);
    else if (t === "docs") c.docs.push(item);
    else c.other.push(item);
  }
  return c;
}

function buildNotes(c) {
  const lines = [];
  if (c.breaking.length) lines.push("### Breaking\n" + c.breaking.map((i) => "- " + i.description).join("\n"));
  if (c.features.length) lines.push("### Added\n" + c.features.map((i) => "- " + i.description).join("\n"));
  if (c.fixes.length) lines.push("### Fixed\n" + c.fixes.map((i) => "- " + i.description).join("\n"));
  if (c.docs.length) lines.push("### Docs\n" + c.docs.map((i) => "- " + i.description).join("\n"));
  if (c.other.length) lines.push("### Other\n" + c.other.map((i) => "- " + i.description).join("\n"));
  return lines.join("\n\n");
}

function decide(input) {
  const current = parseVersion(input.current);
  if (!current) fail("plan: invalid current version (expected X.Y.Z)", 1);
  const c = classify(input.changes);
  const uncertain = [...c.breaking, ...c.features].filter((i) => i.uncertain);
  if (uncertain.length > 0) {
    return {
      current: fmt(current),
      recommended: fmt(current),
      releaseType: "unknown",
      needsClarification: true,
      potential: uncertain.map((i) => i.description || "(no description)"),
      reasons: ["Potential Breaking Change / Potential Feature requires developer confirmation"],
      releaseNotes: "",
      headSha: getHeadSha(),
    };
  }
  let type = "patch";
  const reasons = [];
  if (c.breaking.length > 0) {
    type = "major";
    reasons.push(`${c.breaking.length} breaking change(s) — external/API/CLI/protocol impact`);
  } else if (c.features.length > 0) {
    type = "minor";
    reasons.push(`${c.features.length} backward-compatible new capability/capabilities`);
  } else {
    reasons.push("no breaking changes, no new capabilities — patch");
  }
  return {
    current: fmt(current),
    recommended: fmt(bump(current, type)),
    releaseType: type,
    needsClarification: false,
    reasons,
    releaseNotes: buildNotes(c),
    headSha: getHeadSha(),
  };
}

function plan(argv) {
  const raw = argValue(argv, "--json");
  if (!raw) fail("plan: --json <input> is required", 1);
  let input;
  try {
    input = JSON.parse(raw);
  } catch (e) {
    fail("plan: invalid --json input: " + e.message, 1);
  }
  const proposal = decide(input);
  process.stdout.write(JSON.stringify(proposal, null, 2) + "\n");
  process.exit(proposal.needsClarification ? 2 : 0);
}

// ---------- execute ----------

function git(args, cwd) {
  return spawnSync("git", args, { cwd, encoding: "utf8" });
}

function execute(argv) {
  const proposalPath = argValue(argv, "--proposal");
  if (!proposalPath) fail("execute: --proposal <file> is required", 3);
  let proposal;
  try {
    proposal = JSON.parse(fs.readFileSync(proposalPath, "utf8"));
  } catch (e) {
    fail("execute: cannot read proposal: " + e.message, 3);
  }
  if (!argv.includes("--yes")) {
    fail("execute: release NOT approved (no --yes) — no write operations performed", 3);
  }
  const ver = parseVersion(proposal.recommended);
  if (!ver) fail("execute: proposal has no valid recommended version", 3);
  const tag = "v" + fmt(ver);

  // Re-verify between approval and execution
  const st = git(["status", "--porcelain"]);
  if (st.status !== 0) fail("execute: not a git repository", 4);
  if (String(st.stdout || "").trim() !== "") fail("execute: working tree not clean — abort, re-run plan", 4);
  if (proposal.headSha) {
    const head = git(["rev-parse", "HEAD"]);
    if (String(head.stdout || "").trim() !== proposal.headSha) {
      fail("execute: HEAD changed since proposal — abort, re-analyze and re-approve", 4);
    }
  }
  const existing = git(["tag", "-l", tag]);
  if (String(existing.stdout || "").trim() !== "") fail(`execute: tag ${tag} already exists`, 4);

  const summary = proposal.summary || `Release ${fmt(ver)}`;
  const t = git(["tag", "-a", tag, "-m", `Release ${fmt(ver)}: ${summary}`]);
  if (t.status !== 0) fail("execute: git tag failed: " + t.stderr, 5);
  console.log(`tag ${tag} created (annotated)`);

  if (argv.includes("--push")) {
    const p = git(["push", "origin", tag]);
    if (p.status !== 0) fail("execute: git push failed: " + p.stderr, 5);
    console.log(`tag ${tag} pushed`);
  }
}

// ---------- main ----------

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(USAGE);
  process.exit(0);
}

const cmd = process.argv[2];
if (cmd === "plan") {
  plan(process.argv.slice(3));
} else if (cmd === "execute") {
  execute(process.argv.slice(3));
} else {
  fail(USAGE, 1);
}
