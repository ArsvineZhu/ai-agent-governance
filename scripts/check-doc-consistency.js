#!/usr/bin/env node
// PAYLOAD SCRIPT — copied standalone into governed projects (references/init-spec.json).
// Keep it self-contained: Node builtins only, never require() a sibling module.
// Doc Consistency Check — read-only. Detects cross-document contradictions:
//   1. version-example sync   — examples of governance_version/manifest values vs current
//   2. protected-files sync   — summary lists vs the single source of truth
//   3. ADR status sync        — "Accepted (Unreleased)" ADRs whose feature already shipped
//   4. link validity          — relative markdown links must resolve
//   5. numeric claims         — documented counts (sub-skills, validator checks, tests)
//   6. prompt sync            - sub-skill triggers must appear in all three commands.md
//   7. trilingual tree parity — delegated to scripts/check-doc-parity.js
// Advisory only — exit code is ALWAYS 0 (heuristics, not a fail-closed gate).
// Usage: node scripts/check-doc-consistency.js [--json]

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const DOCS = path.join(ROOT, "docs");

function walk(dir, base = dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, base));
    else if (e.name.endsWith(".md")) out.push(path.relative(base, p));
  }
  return out.sort();
}

function readFile(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function currentVersion() {
  try {
    return JSON.parse(readFile(path.join(ROOT, "package.json"))).version;
  } catch {
    return null;
  }
}

function mdFiles() {
  const out = [];
  const top = ["README.md", "CONTRIBUTING.md", "SKILL.md", "AGENTS.md"];
  for (const f of top) if (fs.existsSync(path.join(ROOT, f))) out.push(f);
  if (fs.existsSync(DOCS)) {
    for (const lang of ["en", "zh-CN", "zh-TW"]) {
      const dir = path.join(DOCS, lang);
      if (fs.existsSync(dir)) for (const rel of walk(dir)) out.push(path.join("docs", lang, rel));
    }
    for (const rel of walk(DOCS)) {
      if (rel.startsWith("design-decisions/") || rel.startsWith("archive/")) {
        out.push(path.join("docs", rel));
      }
    }
  }
  return out;
}

function main() {
  const json = process.argv.includes("--json");
  const issues = { version_examples: [], protected_lists: [], adr_statuses: [], broken_links: [], numeric_claims: [], prompt_sync: [] };
  const version = currentVersion();

  // ---- 1. version-example sync ----
  if (version) {
    const files = mdFiles().filter((f) => !f.startsWith("CHANGELOG") && !f.startsWith("docs/archive/"));
    for (const f of files) {
      const c = readFile(path.join(ROOT, f));
      if (!c) continue;
      const re = /(?:governance_version|"version")["']?\s*[:=]\s*["']?(\d+\.\d+\.\d+)/g;
      let m;
      while ((m = re.exec(c))) {
        if (m[1] !== version) issues.version_examples.push(`${f}:${m[1]} != ${version}`);
      }
    }
  }

  // ---- 2. protected-files sync ----
  // Single source of truth: references/policies/governance-files.policy.md table.
  const policy = readFile(path.join(ROOT, "references", "policies", "governance-files.policy.md")) || "";
  const protectedPaths = [];
  const tableRe = /^\|\s*`([^`]+)`\s*\|/gm;
  let tm;
  while ((tm = tableRe.exec(policy))) {
    const p = tm[1].replace(/\*\*/g, "").split("/")[0];
    if (p === "AGENTS.md" || p === "CLAUDE.md" || p.startsWith("docs") || p.startsWith(".governance") || p.startsWith("scripts") || p === "opencode.json" || p.startsWith(".github")) {
      protectedPaths.push(tm[1]);
    }
  }
  if (protectedPaths.length > 0) {
    const summaries = mdFiles().filter((f) => f !== "CHANGELOG.md" && !f.startsWith("docs/archive/"));
    for (const f of summaries) {
      const c = readFile(path.join(ROOT, f));
      if (!c) continue;
      if (f.includes("governance-files.policy.md") || f.includes("adr-000")) continue;
      if (/治理文件保护|Governance File Protection|Governance file protection/i.test(c)) {
        // Summaries that defer to the single source of truth are exempt by design
        if (/单一事实源|single source of truth|完整清单见|完整清单以/i.test(c)) continue;
        for (const p of protectedPaths) {
          if (!c.includes(p)) issues.protected_lists.push(`${f}: missing ${p}`);
        }
      }
    }
  }

  // ---- 3. ADR status sync ----
  const changelog = readFile(path.join(ROOT, "CHANGELOG.md")) || "";
  const releasedVersions = [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)].map((m) => m[1]);
  const adrDir = path.join(DOCS, "design-decisions");
  if (fs.existsSync(adrDir)) {
    for (const f of walk(adrDir)) {
      const c = readFile(path.join(adrDir, f));
      if (!c) continue;
      if (/Unreleased|未发布/i.test(c) && !/Status: (Proposed|Superseded|Deprecated)/.test(c)) {
        if (releasedVersions.length > 0) issues.adr_statuses.push(`${f}: marked Unreleased but releases exist`);
      }
    }
  }

  // ---- 4. link validity ----
  const linkFiles = mdFiles();
  for (const f of linkFiles) {
    const c = readFile(path.join(ROOT, f));
    if (!c) continue;
    const re = /\[[^\]]*\]\(([^)#]+)(?:#[^)]*)?\)/g;
    let m;
    while ((m = re.exec(c))) {
      const t = m[1];
      if (t.startsWith("http") || t.startsWith("mailto")) continue;
      if (!fs.existsSync(path.resolve(path.dirname(path.join(ROOT, f)), t))) {
        issues.broken_links.push(`${f} -> ${t}`);
      }
    }
  }

  // ---- 5. numeric claims ----
  // validator check count: docs must claim the same count as the DEFAULTS array
  const validator = readFile(path.join(ROOT, "scripts", "verify_governance.js")) || readFile(path.join(ROOT, "scripts", "verify-governance.js")) || "";
  const defaultArr = validator.match(/const DEFAULTS = \[([\s\S]*?)\n\];/);
  const defaultCount = defaultArr ? (defaultArr[1].match(/^\s*\["/gm) || []).length : 0;
  const claimRe = /(\d+)\s*(?:checks|项检查|项)/g;
  if (defaultCount > 0) {
    for (const f of ["README.md", "CONTRIBUTING.md"]) {
      const c = readFile(path.join(ROOT, f));
      if (!c) continue;
      let m;
      while ((m = claimRe.exec(c))) {
        if (parseInt(m[1]) !== defaultCount) issues.numeric_claims.push(`${f}: claims ${m[1]} checks, source has ${defaultCount}`);
      }
    }
  }

  // ---- 6. prompt sync (sub-skill triggers must appear in commands.md) ----
  const subSkills = readFile(path.join(ROOT, "references", "templates", "sub-skills.md")) || "";
  const triggers = new Set();
  for (const line of subSkills.split("\n")) {
    if (!line.includes("Triggers on")) continue;
    const rest = line.split("Triggers on ")[1] || "";
    const quoted = rest.match(/"([^"]+)"/g) || [];
    for (const q of quoted) triggers.add(q.slice(1, -1));
  }
  if (triggers.size > 0) {
    for (const lang of ["en", "zh-CN", "zh-TW"]) {
      const cmd = readFile(path.join(DOCS, lang, "commands.md")) || "";
      if (!cmd) continue;
      for (const t of triggers) {
        if (!cmd.includes("`" + t + "`")) issues.prompt_sync.push(`${lang}/commands.md missing trigger \`${t}\``);
      }
    }
  }

  // ---- 7. trilingual tree parity (delegate) ----
  const parityScript = path.join(ROOT, "scripts", "check-doc-parity.js");
  let parityPass = "unavailable"; // never claim a pass we could not verify
  if (fs.existsSync(parityScript)) {
    const parity = spawnSync(process.execPath, [parityScript, "--json"], { cwd: ROOT, encoding: "utf8" });
    try {
      const p = JSON.parse(parity.stdout);
      parityPass = p.pass;
      if (!p.pass) issues.trilingual_trees = p.issues;
    } catch {
      parityPass = "error";
    }
  }

  const report = { timestamp: new Date().toISOString(), version, issues, parity: parityPass };

  // Append to drift-report.json if present (runtime output, optional)
  try {
    const driftPath = path.join(ROOT, ".governance", "drift-report.json");
    const drift = JSON.parse(readFile(driftPath));
    drift.consistency = issues;
    fs.writeFileSync(driftPath, JSON.stringify(drift, null, 2) + "\n");
  } catch (e) {
    if (process.env.DEBUG) console.error(`[DEBUG] drift-report.json not updated: ${e.message}`);
  }

  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    const total = Object.values(issues).reduce((n, a) => n + (Array.isArray(a) ? a.length : 0), 0);
    for (const [k, v] of Object.entries(issues)) {
      if (Array.isArray(v) && v.length) {
        console.log(`✗ ${k}:`);
        for (const i of v.slice(0, 5)) console.log(`  - ${i}`);
      }
    }
    if (total === 0) console.log("✓ no consistency issues");
  }
  // ALWAYS exit 0 — advisory only
  process.exit(0);
}

main();
