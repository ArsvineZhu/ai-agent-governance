# INIT Scripted Generator (TASK plan)

[English](init-scripted-generator.md) · [简体中文](../../zh-CN/plans/init-scripted-generator.md) · [繁體中文](../../zh-TW/plans/init-scripted-generator.md)

### Task Purpose

Freeze the INIT generation logic into a **deterministic, snapshot-testable script** so 100 INIT runs produce byte-identical output — the reliability precondition for scaling the skill.

### Current Problem

- INIT is executed by an LLM following SKILL.md prose → output drifts across runs, models and agents (wording, ordering, omission)
- No snapshot tests exist; regressions in generated artifacts are found by users, not CI
- MIGRATE relies on the validator, but the validator cannot catch *wrong-but-present* files
- The skill's own anti-fabrication guarantee ("never fake content") is currently a prompt-level promise, not a machine property

### Proposed Solution

`scripts/generate-governance.js` — zero-dependency Node generator (same discipline as the validator):

1. **Consumes** `references/templates/**` + a machine-readable init spec (extracted from SKILL.md Phase 1 as structured data or a `references/init-spec.json`)
2. **Inputs**: repo root, maturity level (L0–L3), detection facts (language, package manager, CI platform, doc root) — the *judgment* stays human/agent-driven, the *writing* becomes mechanical
3. **Outputs**: the full bootstrap skeleton (rules → AGENTS.md → templates → `.governance/` state → scripts copies → CI), placeholders resolved from the detection facts
4. **SKILL.md INIT becomes**: agent runs the generator + handles only the confirmation gates (dependencies, git identity, CI push) — the "human approval" part, not the "write files" part
5. **Snapshot tests**: fixture repos (L0 empty / L1 code-only / L3 with existing docs) → assert full file tree + content equality

Phased delivery:

- Phase A (v0.8.0): static skeleton — rules, AGENTS.md, CHANGELOG, README bootstrap, feature placeholder strategy
- Phase B (later): config files (.gitignore, .env.example, .gitmessage), CI selection, `.governance/` state files
- Phase C (later): structure-adaptive mode (existing doc roots, merge-not-overwrite), parity with all 13 Phase-1 steps

### Affected Files

- `scripts/generate-governance.js` + `references/init-spec.json` — new
- `SKILL.md` Phase 1 — rewritten as "run generator + handle gates"
- `tests/run-tests.js` — snapshot fixture suite
- `docs/en/bootstrap-output.md` — output spec sourced from the generator

### Risks

- **Single-source drift** — the spec and SKILL.md prose must not diverge (rule: SKILL.md references the spec, never restates it)
- **Large effort** — full parity with all 13 steps is big; phasing (A → B → C) keeps each release shippable
- **Template placeholders** — templates keep `{{...}}`; the generator resolves them mechanically (this is where determinism comes from)

### Validation Method

- Same fixture inputs → byte-identical outputs across two runs (determinism test)
- Fixture snapshots: L0 / L1 / L3 expected file trees (snapshot tests)
- Generated output passes `verify-governance.js` exit 0 for all fixtures (end-to-end test)
- SKILL.md INIT section references the generator, not restates steps (doc assertion)

---
