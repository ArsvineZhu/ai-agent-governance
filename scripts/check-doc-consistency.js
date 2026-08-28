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
//   8. consent-cluster sync   — every EXISTING consent sync point must declare the same
//      markers (Exception A, Exception B, echo-never-waived); missing points are skipped,
//      so both this repo (4 points) and governed projects (2 points) are covered.
//   9. principles-index pointers — every file referenced by the AGENTS.md governance
//      principles index must exist (the index is pointers-only, so a moved file silently
//      turns it into a lie unless this is checked).
//
// Modes: default = advisory, ALWAYS exit 0 (heuristics, not a gate).
//        --gate  = fail-closed on the mechanically checkable clusters ONLY (#2 and #8,
//                  after #2's trigger tightening); the other heuristics still report
//                  but never affect the exit code.
// Usage: node scripts/check-doc-consistency.js [--json] [--gate]

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const DOCS = path.join(ROOT, "docs");

// Consent sync points — the same rule is expressed in several files across both domains
// (this repo vs governed projects). Each GROUP holds the equivalent paths in each domain;
// a group is checked when AT LEAST ONE of its paths exists, and every present path in the
// group must declare all markers. In the skill repo the repo-side paths exist; in a
// governed project the generated ones (AGENTS.md, docs/rules/git-policy.md) exist.
const CONSENT_SYNC_GROUPS = [
  ["AGENTS.md"],
  ["references/policies/git.policy.md", "docs/rules/git-policy.md"],
  ["references/templates/agents-md.template.md"],
  ["SKILL.md"],
];
const CONSENT_MARKERS = [
  // Definition-title match, not bare keyword: "例外 A" also appears in *reference* lines
  // ("此时适用下方例外 A。"), so a keyword-only regex would treat a leftover reference as a
  // live definition (a false negative — the definition can be deleted while the reference
  // stays). A definition is marked by an em-dash heading: "Exception A —" / "例外 A ——".
  { name: "Exception A (explicit user instruction covers minimal sequence)", re: /Exception A\s*\u2014|例外 A\s*\u2014\u2014|例外一\s*\u2014\u2014/ },
  { name: "Exception B (release sequence)", re: /Exception B\s*\u2014|例外 B\s*\u2014\u2014|例外二\s*\u2014\u2014/ },
  { name: "echo never waived (waive re-asking, never echoing)", re: /never\s*\*\*\s*(?:re)?echo\w*|never echoing|不免除.*回显/ },
];

// #2 trigger tightening: a document is only held to the full protected-files list when it
// CLAIMS to enumerate one. Mere mentions of the protection flow (e.g. "this change follows
// the governance-file-protection flow") are references, not lists. Detection of the claim:
// an explicit enumerating phrase (below/following/如下/如表 …) present alongside the
// protection-floor mention. The single-source-of-truth pointer already exempts deferrals.
const CLAIMS_PROTECTED_LIST = /(?:以下|下表|下面是|以下为|如下).{0,20}(?:清单|列表|文件)|(?:受保护|protected).{0,20}(?:清单|列表|list).{0,12}(?:如下|以下是|如下表|is|are|为)|(?:following|list(?:ed)? below|protected files? (?:include|are|listed)|清单如下|清单为|list is:)/i;

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
  const gate = process.argv.includes("--gate");
  const issues = { version_examples: [], protected_lists: [], adr_statuses: [], broken_links: [], numeric_claims: [], prompt_sync: [] };
  const gateIssues = [];
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
      const mentionsFlow = /治理文件保护|Governance File Protection|Governance file protection/i.test(c);
      if (mentionsFlow) {
        // Summaries that defer to the single source of truth are exempt by design
        if (/单一事实源|single source of truth|完整清单见|完整清单以/i.test(c)) continue;
        // Trigger tightening (P1 precondition): only documents that CLAIM to enumerate
        // the list are held to its completeness — the flow mention and the enumeration
        // claim may appear in different places, so each is tested independently.
        if (!CLAIMS_PROTECTED_LIST.test(c)) continue;
        for (const p of protectedPaths) {
          if (!c.includes(p)) gateIssues.push({ kind: "protected_lists", item: `${f}: missing ${p}` });
        }
      }
    }
  }

  // ---- 8. consent-cluster sync (gate class) ----
  // Assert markers over every sync GROUP that has at least one present path; groups with
  // no existing path in this shape (e.g. the skill-entry group in a governed project) are
  // skipped — absence of the whole domain, not a drift.
  for (const group of CONSENT_SYNC_GROUPS) {
    const present = group.filter((rel) => fs.existsSync(path.join(ROOT, rel)));
    if (present.length === 0) continue;
    for (const rel of present) {
      const c = readFile(path.join(ROOT, rel));
      if (!c) continue;
      for (const m of CONSENT_MARKERS) {
        if (!m.re.test(c)) {
          gateIssues.push({ kind: "consent_cluster", item: `${rel}: missing marker ${m.name}` });
        }
      }
    }
  }

  // ---- 9. principles-index pointers (gate class) ----
  // The AGENTS.md index is pointers-only by design, so a moved or renamed source silently
  // turns each row into a false claim. Assert every referenced file exists. Runs only where
  // the index exists (this repo); governed projects have no such index and are skipped.
  const agentsDoc = readFile(path.join(ROOT, "AGENTS.md"));
  if (agentsDoc && /Governance principles index/i.test(agentsDoc)) {
    const bt = String.fromCharCode(96);
    const fileRe = new RegExp(bt + "([^" + bt + "]+)" + bt, "g");
    for (const line of agentsDoc.split("\n")) {
      if (!line.startsWith("| ") || line.startsWith("| ---") || line.startsWith("| Principle")) continue;
      const cells = line.split("|").map((s) => s.trim());
      const source = cells[2] || "";
      let fm;
      fileRe.lastIndex = 0;
      while ((fm = fileRe.exec(source))) {
        const target = fm[1].trim();
        if (!/[/.]/.test(target)) continue; // not a path
        if (!fs.existsSync(path.join(ROOT, target))) {
          gateIssues.push({ kind: "principles_index", item: `AGENTS.md index points at missing ${target}` });
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

  const report = { timestamp: new Date().toISOString(), version, issues, parity: parityPass, gate, gatePass: gateIssues.length === 0, gateIssues };

  // Append to drift-report.json if present (runtime output, optional)
  try {
    const driftPath = path.join(ROOT, ".governance", "drift-report.json");
    const drift = JSON.parse(readFile(driftPath));
    drift.consistency = issues;
    drift.consistencyGate = { gate, pass: gateIssues.length === 0, issues: gateIssues };
    fs.writeFileSync(driftPath, JSON.stringify(drift, null, 2) + "\n");
  } catch (e) {
    if (process.env.DEBUG) console.error(`[DEBUG] drift-report.json not updated: ${e.message}`);
  }

  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    if (gateIssues.length > 0) {
      console.log("✗ gate checks failed:");
      for (const g of gateIssues) console.log(`  - ${g.kind}: ${g.item}`);
    }
    const total = Object.values(issues).reduce((n, a) => n + (Array.isArray(a) ? a.length : 0), 0);
    for (const [k, v] of Object.entries(issues)) {
      if (Array.isArray(v) && v.length) {
        console.log(`✗ ${k}:`);
        for (const i of v.slice(0, 5)) console.log(`  - ${i}`);
      }
    }
    if (total === 0 && gateIssues.length === 0) console.log("✓ no consistency issues");
  }
  // advisory mode ALWAYS exits 0; --gate exits 1 only when a gate-class cluster failed
  process.exit(gate && gateIssues.length > 0 ? 1 : 0);
}

main();
