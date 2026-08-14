# Governance Model

[English](governance-model.md) · [简体中文](../zh-CN/governance-model.md) · [繁體中文](../zh-TW/governance-model.md)

The three-state model behind "Governance as Code": desired / current / observed state, tracked as version-controlled files inside the repository.

### Spec / Status / Health

A Kubernetes-like Spec / Status / Health split:

| File | Role | Git |
| --- | --- | --- |
| `manifest.json` | desired state — unique index of all governance artifacts (path, `kind`, `type`, version) | tracked |
| `state.json` | current state — maturity, phase, agent identity, locks, completed/blocked | tracked |
| `preflight.json` | rollback snapshot taken before INIT writes | tracked |
| `generated/skills/` | generated agent modules (drift-check, release-manager, ...) | tracked |
| `validation.json` | observed state — last validator run | ignored (runtime output) |
| `drift-report.json` | drift report | ignored (runtime output) |

### Versioning

- `schema_version` — the data format version of the manifest
- `governance_version` — the governance framework version

They are separate. Bumping the framework does not require a schema change.

### Upgrading (MIGRATE)

When a governed project's `governance_version` lags behind the skill version, AUDIT reports the drift but never auto-upgrades. On explicit user request, the MIGRATE flow applies:

1. Build the migration list — validator `--json` missing artifacts + the target versions' CHANGELOG Added/Changed entries
2. Confirm with the user — new files, changed files, rule changes, behavior changes
3. Apply — copy new scripts/templates, update rules, bump `governance_version`, record in CHANGELOG
4. Verify — validator exit 0; on failure keep the old version, no half-migrated state

Each version's CHANGELOG entries are the migration basis; multi-version jumps must cover intermediate artifact changes.

### Path Resolution

The validator resolves artifact paths from `manifest.json` when present (structure-adaptive — existing doc layouts are respected, no forced migration); otherwise built-in defaults are used. The `type` field is governance semantics for classification and reporting and does not participate in filesystem checks — only `kind` (file/dir) does.

### Runtime Outputs

`validation.json` and `drift-report.json` are produced by AUDIT/release runs. They are git-ignored and never required artifacts: a fresh checkout must pass CI without them.

### Activity Audit

`.governance/activity.jsonl` — append-only JSON Lines, one entry per task end (written by the generated state-manager sub-skill):

- Fields: `ts` / `agent_id` / `task_id` / `phase` / `action` / `files` / `commands` / `result` / `summary`
- `action` vocabulary (v1): `init / inspect / plan / implement / modify / delete / commit / release / audit / migrate`
- Git-ignored runtime output; never overwritten; secret-like tokens are redacted before writing
- Consumed read-only by drift-check's `activity-report` mode (per agent / per action / failed only)

---
