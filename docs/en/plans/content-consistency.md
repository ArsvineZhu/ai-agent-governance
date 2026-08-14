# Content Consistency Check (TASK plan)

[English](content-consistency.md) · [简体中文](../../zh-CN/plans/content-consistency.md) · [繁體中文](../../zh-TW/plans/content-consistency.md)

### Task Purpose

Complete the drift-detection triad: drift-check currently covers **existence** (artifacts present?) and will cover **freshness** (docs stale?); the missing dimension is **consistency** — cross-document contradictions (stale version examples, fragmented protected-file lists, stale ADR statuses, expired roadmap targets, broken links, wrong numeric claims). These are mechanical to detect and recur constantly, yet no current mechanism catches them.

### Current Problem

Real incidents (found in this repo's own review, 2026-08-13):

1. Manifest/release examples still said `0.3.3` while the current version was `0.5.0` — INIT-generated projects would fail their first AUDIT with phantom version drift
2. The protected-files list drifted in 4 places vs. the single source of truth (`governance-files.policy.md`), missing `git-policy.json` / `check-lock.js` / `check-git-policy.js`
3. ADR-0004 status stayed `Accepted (Unreleased)` after the feature shipped in v0.4.0
4. Roadmap target `v0.5.0` was already released without the item — the same mistake this repo fixed once at v0.4.1, then re-made
5. Numeric claims (validator check count) must match the validator source

None of these are existence or freshness problems — they are **contradictions between documents**, and they are all mechanically detectable.

### Proposed Solution

drift-check gains a `consistency` mode (report-only; pairs with `freshness`, both land in `.governance/drift-report.json`):

Check classes (v1):

1. **Version-example sync** — grep docs/templates for `governance_version` / manifest example values; any that differ from the current declared version are flagged
2. **Protected-files list sync** — every protected-files summary must match the single source of truth (`docs/rules/governance-files.md` or the policy file); missing/extra entries flagged by path
3. **ADR status sync** — ADRs marked `Accepted (Unreleased)` whose feature appears in a released CHANGELOG section are flagged as stale
4. **Roadmap target validity** — unfinished items whose target version ≤ current version are flagged as expired targets
5. **Link validity** — relative markdown links in docs must resolve to real files
6. **Numeric claims** — documented counts (sub-skill count, validator check count, test count) must match the actual sources
7. **Trilingual tree parity** - developer-facing files only (the three trees `docs/en/`, `docs/zh-CN/`, `docs/zh-TW/`; entry-file mapping: English = root `README.md`/`CONTRIBUTING.md`, 简/繁 = in-tree `README.md`/`CONTRIBUTING.md`; agent-facing files and shared historical records are single-language by policy and are skipped): compare the same-named files across the three trees structurally - heading count/order per level, code-block count, table dimensions, list-item count; flag mismatches. Structural parity is NOT semantic parity (translation quality stays with the human/agent reviewer). **Already implemented standalone**: this repo ships `scripts/check-doc-parity.js` (CI + release precondition `docs.parity_passed`) guarding its own three trees; v0.7.0 folds this logic into drift-check's `consistency` mode for governed projects, avoiding duplicate development.

Report shape (appended to drift-report.json):

```json
{ "consistency": { "version_examples": ["SKILL.md:266"], "protected_lists": ["docs/anti-regression.md"], "adr_statuses": ["adr-0004"], "roadmap_targets": ["skill-lifecycle"], "broken_links": [], "numeric_claims": [] } }
```

### Affected Files

- `references/templates/sub-skills.md` — drift-check gains the `consistency` mode
- `.governance/drift-report.json` schema — `consistency` object (runtime output; schema note only)
- `docs/commands.md` — command doc sync
- Validator: **unchanged** (advisory report, not a gate; the checks are heuristic, not fail-closed)

### Risks

- **False positives** — heuristics (e.g. version-example grep) may hit intentional historical mentions (CHANGELOG entries, ADR-0001's legacy-path notes). Mitigation: exclude `CHANGELOG.md` and `docs/archive/` from scans; report as advisory only
- **Check scope creep** — each check class must stay mechanical (grep/parse/compare), never semantic judgment; semantic review stays with the agent
- **Overlap with validator content checks** — the validator's existing CHANGELOG-format check stays fail-closed; consistency checks are advisory and wider

### Validation Method

- Seeded drift fixture: stale version example + fragmented protected list + `Accepted (Unreleased)` ADR + expired roadmap target → all four flagged (test)
- Trilingual parity fixture: same-named files across the three trees with mismatched heading counts → flagged; matching → clean (test)
- Agent-facing files (`SKILL.md`, `references/**`) are skipped by the parity check (test)
- Clean fixture → empty consistency report (test)
- `CHANGELOG.md` and `docs/archive/` are excluded from version-example scanning (test)
- Validator exit codes unchanged (regression)

---
