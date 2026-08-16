# Sync Groups Mechanical Check（TASK 计划）

[English](sync-groups-mechanical-check.md) · [简体中文](../../zh-CN/plans/sync-groups-mechanical-check.md) · [繁體中文](../../zh-TW/plans/sync-groups-mechanical-check.md)

### Task Purpose

Upgrade governed-project sync enforcement from checklist-driven (Layer 1) to **mechanically verified**: a read-only script that compares a task's actual change set against the declared sync groups and reports missed requires — so a forgotten sync is detected, not trusted.

### Current Problem

Layer 1 (`.governance/sync-rules.json` + Phase 5 checklist) upgrades reliability from memory-driven to list-driven, but the agent still executes the checklist itself. A tired LLM can mark ✅ without doing the work. The task boundary is the missing piece for a mechanical check — "what did this task change" must be definable.

### Proposed Solution

`scripts/check-sync.js` (INIT-copied, read-only, zero-dependency):

- **Change set** — `git diff --name-only <task-start-sha>..HEAD` plus unstaged/staged changes; the task-start SHA is recorded by state-manager into `.governance/state.json` at task begin (new field `task_start_sha`, written from `git rev-parse HEAD`)
- **Rule evaluation** — for each syncGroup in `.governance/sync-rules.json`: if any `watch` glob matches a changed path but no `require` path changed → report `unsynced: <group.name>` (exit 1 in gate mode, `--advisory` exit 0 otherwise)
- **Output** — human summary + `--json`; appends to `.governance/drift-report.json` under `sync`
- **Glob matcher** — prefix + `**` only (shared helper with any future consumers; no regex in v1)
- **Wire-in** — lifecycle Phase 5 end: `node scripts/check-sync.js` (gate mode) before declaring done; RELEASE precondition `sync.passed`

### Affected Files

- `scripts/check-sync.js` — new script + INIT copy list (SKILL.md step 11)
- `.governance/state.json` schema — `task_start_sha` field (written by state-manager at task begin)
- `references/templates/sub-skills.md` — state-manager records task_start_sha; lifecycle report references check-sync
- `references/policies/lifecycle.policy.md` — Phase 5 mandates check-sync (gate) after the checklist
- `references/workflows/release.md` — precondition `sync.passed`
- `scripts/verify-governance.js` — requires check-sync.js presence (validator default +1)
- `tests/run-tests.js` — sync detection tests

### Risks

- **Task boundary semantics** — task_start_sha is recorded when the agent starts; tasks spanning multiple commits or resuming from state.json must not reset the SHA mid-task (resume keeps the original SHA)
- **False positives on legit divergence** — e.g. a rules change deliberately not reflected in AGENTS.md yet; mitigated by `--advisory` mode + report, gate mode only at Phase 5 end / release
- **Glob edge cases** — directory vs file paths, `docs/features/` (dir) vs `docs/features/foo.md`; matcher must treat trailing `/` as prefix

### Validation Method

- Fixture: change `src/a.ts` without `docs/ARCHITECTURE.md` → exit 1 + `unsynced: api-architecture` (test)
- Fixture: change both → exit 0 (test)
- Resume scenario: state.json already has task_start_sha → not overwritten (test)
- Validator fails when check-sync.js missing (test)

---
