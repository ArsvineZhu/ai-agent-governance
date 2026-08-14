# Agent Operating Lifecycle

[English](lifecycle.md) · [简体中文](../zh-CN/lifecycle.md) · [繁體中文](../zh-TW/lifecycle.md)

Every development task performed by any agent in a governed project MUST follow this six-phase lifecycle (summary lives in AGENTS.md; this is the full spec).

### The Six Phases

**Phase 1 — Understand.** Read AGENTS.md, docs/ARCHITECTURE.md, docs/features/ (list the directory to discover all features), and the recent CHANGELOG.md. Confirm: current system structure, existing features, relevant constraints, and the Modification Rules of affected feature docs.

**Phase 2 — Plan.** Medium/large changes MUST first create `docs/plans/TASK_<name>.md` with:

- Status (Active / Completed — Active on creation)
- Task Purpose
- Current Problem
- Proposed Solution
- Affected Files
- Risks
- Validation Method

Small changes (typo, single-function tweak) may skip planning but must state the reason in the report.

**Phase 3 — Implement.** Follow docs/ARCHITECTURE.md constraints; do not break existing features; do not change directory structure casually; keep backward compatibility; register new modules (New Code Registration).

**Phase 4 — Validate.** Run tests, lint, typecheck and build with the bare commands from AGENTS.md; record REAL output (never "should be fine").

**Phase 5 — Synchronize.** Update CHANGELOG.md (completed changes), the Feature Registry (docs/features/), Architecture docs if changed, check off the corresponding milestone in docs/plans/DEVELOPMENT_PLAN.md (if one exists), and set the completed TASK_<name>.md Status to Completed. Archiving happens at RELEASE, not here.

**Phase 6 — Report.** Final output: modified files, new features, deleted content, validation results, doc updates.

### Change Classification (when CHANGELOG is written)

| Change | CHANGELOG action |
| --- | --- |
| doc-only / comment / typo | no entry |
| bug fix | `Fixed` |
| new capability | `Added` |
| architecture / behavior / breaking | `Changed` |

### Maturity Levels (INIT strategy)

| Level | Judgement | Strategy |
| --- | --- | --- |
| L0 empty repo | README only / no source | full governance skeleton |
| L1 prototype | some source, no tests/CI/docs system | full skeleton + adopt existing files (merge, never overwrite) |
| L2 active | source + tests + partial CI/docs | incremental — only create missing items |
| L3 production | many files + existing conventions | audit mode — gap report + minimal patches only |

### Definition of Done

Code + tests + all quality gates + CHANGELOG + docs sync. Anything missing = not done.

### Forbidden

- Changing code without updating project knowledge
- Declaring completion before all six phases
- Faking or skipping validation output

---
