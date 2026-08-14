# Governance Score & Badge（TASK 计划）

[English](governance-score.md) · [简体中文](../../zh-CN/plans/governance-score.md) · [繁體中文](../../zh-TW/plans/governance-score.md)

### Task Purpose

Give every governed project a **shareable health metric**: a composite governance score from the validator, plus a badge story — so "is this repo governed?" has a one-glance answer, and the future remote dashboard gets a scoring basis.

### Current Problem

- `verify-governance.js --json` reports `passed / failed / total` but no single composite number
- No badge mechanism exists beyond the CI status badge (which says "CI passes", not "governance healthy")
- A planned remote dashboard (roadmap) has no numeric data model to consume

### Proposed Solution

1. **Score in validator** — `--json` output gains:

```json
{ "score": 0.95, "total": 20, "passed": 19, "failed": 1 }
```

`score = passed / total` (v1 unweighted; every check equal). Weighting (critical artifacts ×2) explicitly deferred — document why.

2. **Badge pipeline** — the CI governance job writes a shields.io `endpoint` JSON artifact:

```json
{ "schemaVersion": 1, "label": "governance", "message": "19/20", "color": "green" }
```

Hosting is the user's choice (Gist / GH Pages / repo file); the plan ships the artifact generation + README badge snippet, not a hosting service.

3. **This repo adopts it** — a `governance` badge on the README (hosted via the repo's own CI artifact), serving as the reference implementation.

### Affected Files

- `scripts/verify_governance.js` — `score` field (backward compatible: added, not changed)
- `references/workflows/ci.md` — badge-endpoint artifact step
- `docs/validator.md` / `docs/commands.md` / README — doc sync + reference badge
- `tests/run-tests.js` — score assertions (20/20 → 1.0, 19/20 → 0.95)

### Risks

- **Equal weighting misleads** — a missing AGENTS.md and a missing `.env.example` count the same; acceptable in v1 (documented), weighting deferred until dashboard
- **Hosting friction** — shields.io `endpoint` needs a public URL; mitigated by shipping only the artifact + instructions
- **Score semantics vs CI badge** — the governance badge must not be confused with CI status; label them distinctly

### Validation Method

- `--json` contains numeric `score = passed/total` (test)
- CI artifact step produces valid shields.io endpoint JSON (test)
- Backward compatibility: existing `--json` consumers only gain a field (regression: all existing tests pass unchanged)

---
