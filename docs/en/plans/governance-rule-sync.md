# Governance Rule Sync & Meta-Governance (TASK Plan)

[English](governance-rule-sync.md) · [简体中文](../../zh-CN/plans/governance-rule-sync.md) · [繁體中文](../../zh-TW/plans/governance-rule-sync.md)

**Target: both** — repo infrastructure (`AGENTS.md`, `package.json`, `tests/`, ADR, this plan) and skill payload (`scripts/check-doc-consistency.js`). Cross-domain sync obligations are listed under Affected Files; this plan is the first use of the Target field.

### Objective

Turn this repo's "lightweight governance" from a default state into a designed system: sync between the two domains (this repo / skill payload) is guaranteed by mechanical gates instead of manual effort; the split criterion for governance principles and a principles index become written-down; the "why no dogfooding" decision is frozen as an ADR instead of being re-argued every time.

### Current Problems

- Four shared rule clusters (consent clauses, protected-file concept, language policy, release path mapping) each express themselves in both domains, kept in sync by hand. Two incidents already: v0.5.1 protected-file summaries missed 3 entries; v0.9.1 consent exceptions fixed only 3 of 4 sync points, missing SKILL.md — only found in this session.
- The cost of an ungated payload boundary is now proven: the `_lib.js` refactor shipped a payload that broke every downstream project while 82/82 tests stayed green (reverted; payload gate added). But the same class of cross-domain inconsistency has no mechanical defence on the other rule clusters — the next incident is a matter of time.
- The split criterion for governance principles was never written down: why the permission matrix lives in SKILL.md while git-policy details live in references/policies/ can only be inferred from file roles; there is no principles index, so "which principles exist and where" is re-assembled every time.
- The "why no dogfooding" rationale is unrecorded and re-argued on every discussion; AGENTS.md dismisses it in one line ("skill distribution repository, lightweight governance"), which is not enough to carry the decision.

### Proposed Approach

Three progressive phases, ordered by necessity:

**P1 · Mechanical gate for shared rule clusters (required)**

- Extend `scripts/check-doc-consistency.js` with a `--gate` mode (same precedent as `check-plan-delivery.js`: advisory exit 0 by default, fail-closed with `--gate`).
- `--gate` covers only the two mechanically checkable clusters — consent and protected files; the other heuristics (version examples, links) stay advisory. **Precondition**: the existing protected_lists check false-positives on documents that merely *mention* the protection flow (this plan's first draft triggered 12 such findings simply by referring to it), so its trigger must be tightened before promotion to gate — require the full list only from documents that claim to *enumerate* it, not from those that reference the flow. The full list lives in `references/policies/governance-files.policy.md` (single source of truth).
- Consent-cluster assertion: each of the four sync points (`AGENTS.md` / `references/policies/git.policy.md` / `references/templates/agents-md.template.md` / `SKILL.md`) must declare Exception A, Exception B and "waive re-asking, never echoing".
- Key design — assert consistency over the sync points that EXIST: in skill-repo shape all 4 are checked; in governed-project shape only the 2 that exist (generated AGENTS.md + `docs/rules/git-policy.md`) are checked, missing points are skipped. So `--gate` remains meaningful inside governed projects rather than false-positiveing.
- `package.json`'s gate group gains `check-doc-consistency.js --gate`; the `--gate` run also prints the heuristic report, so `check:all` drops its existing duplicate invocation (the same script must not run twice). Note the script is on init-spec.json's copy list — a payload script change, handled through the governance-file-protection flow.

**P2 · Making things explicit (recommended)**

- Plan format gains a `Target: payload | repo-infra | both` field; when `Target=both` the plan must enumerate the sync points per domain. This plan is the first use.
- The impact-face check compares actual changes against the declared Target at task end: files changed outside the declared domain must be reported. Stays a human check, not fail-closed; mechanical advisory is deferred until real violations show up.
- The split criterion (judge rule) is written into AGENTS.md: SKILL.md policy layer = rules the skill executor must read on every run; references/policies/ = content artifacts for governed projects; AGENTS.md = rules for this repo. Test: would an agent executing a concrete task get it wrong without reading this?
- A principles index is added to AGENTS.md: each principle × (name | authoritative location | audience), pointers only, no restated content. The entry count is **established by an actual inventory**, never assumed — that inventory is the first step of P2 (SKILL.md's policy layer currently has 13 sections; principles from release.md, init-spec and lifecycle must be folded in, and the scope is settled during the inventory).

**P3 · ADR-0006 "why this repo does not dogfood" (recommended, written after P1/P2)**

- Three reasons: risk mismatch (the validator checks software-project risks; none of this repo's four real failure modes are covered); circular dependency (a producer's governance must not depend on its own product, or a product bug takes the governance down first); shape mismatch (no src/features objects; forcing them would create hollow artifacts, violating our own anti-fabrication rule).
- Consequence statement: this repo's governance = release flow + plans/archive + ADRs + tests + gates; `verify_governance.js` exiting 1 here is a feature, not a defect.

### Affected Files

- `scripts/check-doc-consistency.js` — gains `--gate` mode; payload script, handled through the governance-file-protection flow
- `package.json` — gate group gains the `--gate` step
- `tests/run-tests.js` — `--gate` tests (governed-project shape with missing sync points skipped; consent-cluster regression test)
- `AGENTS.md` — Target field definition, judge rule, principles index
- `docs/design-decisions/adr-0006-no-dogfooding.md` — new, the no-dogfooding decision record (shared, single-language 简体中文; the filename follows the existing lowercase numbered-slug ADR convention and must not use a wildcard — the delivery gate only resolves literal paths)
- `CHANGELOG.md` — Added (--gate) + Changed (protected-files promoted to gate)
- `docs/{en,zh-CN,zh-TW}/plans/governance-rule-sync.md` — this plan (trilingual)

Sync-group review (not a delivery declaration): this change adds no trigger words and changes no validator checks; per the sync-group rule, the user manual and validator docs are expected to need no update — confirm at implementation. Filenames are deliberately omitted here, because the delivery gate treats every backticked token inside the Affected Files section as a delivery declaration.

On delivery-gate semantics: this is an implementation plan (not a design-only one) and carries no `Status: design plan` marker, so `check-plan-delivery.js --gate` scans it. **Until P3 lands, the ADR file does not exist, so `--gate` exits 1 and blocks releases — that is the intended fail-closed behaviour**, not a defect; archival happens through the release flow once implementation is complete.

### Risks

- `--gate` widens `check-doc-consistency.js`'s job (advisory layer + partial gate mixed): mitigation — gate covers only the two mechanical clusters, heuristics stay advisory, both modes share the parsing code.
- Consent sync points false-positive after renames or path changes: mitigation — the sync-point list is a single constant at the top of the script.
- Principles index drifts as files move: mitigation — the gate asserts every index pointer resolves.
- The Target field only applies when a plan is actually written (this session's 13-file change never had one): mitigation — Target does not fix execution discipline, but it turns out-of-domain edits from an after-the-fact surprise into something visible in the plan.

### Validation Method

- Regression (consent cluster): remove the Exception-A marker from any one of the four sync points → `--gate` exits 1 and names the file; restore → exit 0.
- Governed-project shape: run `--gate` inside a Phase-C INIT output → missing sync points are skipped, no false positives.
- `npm run check` fully green (including the new gate step); the advisory mode without `--gate` stays exit 0 (advisory contract unchanged).
- Every principles-index pointer resolves (asserted by the gate, not by manual review).
- `adr-0006-no-dogfooding.md` exists under `docs/design-decisions/` with status Accepted; at that point every declaration in this plan resolves, `check-plan-delivery.js --gate` exits 0 for it, and releases are no longer blocked.

---
