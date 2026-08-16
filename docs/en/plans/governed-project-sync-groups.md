# Governed-Project Sync Groups（TASK 计划）

[English](governed-project-sync-groups.md) · [简体中文](../../zh-CN/plans/governed-project-sync-groups.md) · [繁體中文](../../zh-TW/plans/governed-project-sync-groups.md)

### Task Purpose

Turn implicit sync rules into an explicit, checkable declaration so agents in governed projects stop dropping cross-file updates as the project grows. The skill repo itself has hard-coded sync checks (prompt-sync in `check-doc-consistency.js`); governed projects need the declarative, project-specific equivalent.

### Current Problem

Governed-project sync today is pure rule text (lifecycle Phase 5, New Code Registration, CHANGELOG classification) with zero mechanical enforcement. The validator checks artifact *existence*, not content *sync*. As files grow, the probability of a missed sync (changed API without ARCHITECTURE.md, new feature without Feature Registry, rule change without AGENTS.md summary) approaches certainty. The skill repo itself missed a sync once (commands.md triggers) — governed projects have no equivalent safety net at all.

### Proposed Solution

**Layer 1: declared sync groups + lifecycle enforcement (this plan).**

INIT generates `.governance/sync-rules.json`:

```json
{
  "syncGroups": [
    { "name": "api-architecture", "watch": ["src/**", "lib/**"], "require": ["docs/ARCHITECTURE.md", "CHANGELOG.md"] },
    { "name": "rules-summary", "watch": ["docs/rules/**"], "require": ["AGENTS.md"] },
    { "name": "feature-registry", "watch": ["src/**"], "require": ["docs/features/"] }
  ]
}
```

- `watch` — glob patterns whose changes trigger the group
- `require` — files that must also change in the same task

Lifecycle Phase 5 (Synchronize) becomes checklist-driven: the agent reads `sync-rules.json`, evaluates every group against its own change set, updates all required files, and reports each group as ✅ synced / ⚠️ not-applicable (no watch hit) in the task report. No watch hit = no sync obligation; watch hit with missing require = task not done.

Defaults are conservative and project-convention-extensible (the project adds its own groups; the mechanism is generic).

### Affected Files

- `SKILL.md` — Phase 1 generates `.governance/sync-rules.json`; Phase 5 section references it
- `references/policies/lifecycle.policy.md` — Phase 5 rewritten as checklist-driven sync
- `references/templates/` — a `sync-rules.template.json` (or inline JSON in SKILL.md) + report format in sub-skills.md (state-manager/plan-manager report section)
- `references/policies/governance-files.policy.md` — sync-rules.json declared as tracked state
- `docs/{en,zh-CN,zh-TW}/` — bootstrap-output.md (generated artifact), commands.md (report wording), CHANGELOG

### Risks

- **Over-sync** — conservative defaults may demand updates that were not actually needed; mitigated by the report form (⚠️ with reason) and project-editable rules
- **Glob semantics** — `src/**` style globs need a minimal matcher; keep to prefix/`**` only in v1, no regex
- **LLM still executes it** — this is a checklist, not a compiler; it upgrades reliability from memory-driven to list-driven, full mechanical verification is Layer 2 (see sync-groups-mechanical-check plan)

### Validation Method

- INIT generates `.governance/sync-rules.json` with the default groups (test assertion)
- Lifecycle policy Phase 5 references the declaration and mandates per-group ✅/⚠️ reporting (doc assertion)
- `governance-files.policy.md` includes `sync-rules.json` in tracked state (doc assertion)
- bootstrap-output.md shows the generated file (doc assertion)

---
