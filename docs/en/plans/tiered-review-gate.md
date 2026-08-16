# Tiered Review Gate (TASK plan)

[English](tiered-review-gate.md) · [简体中文](../../zh-CN/plans/tiered-review-gate.md) · [繁體中文](../../zh-TW/plans/tiered-review-gate.md)

> **Status: design plan, not implemented.** This page is the detailed design of the roadmap item `Tiered review gate` (see [roadmap.md](../roadmap.md)), organized per the `docs/plans/TASK_<name>.md` six-field template. 

### Task Purpose

Establish a tiered review gate before release/push: the lightweight mechanical checks always run automatically (zero tokens, seconds), while deep review (review-manager) is triggered selectively by change risk level — turning review from "all or nothing" into risk-tiered, catching omissions without nagging.

### Current Problem

- The lightweight checks (mechanical scripts) are implemented and wired in: release preconditions (tests.required / docs.parity_passed / validator.passed), pre-push (check-secrets / check-git-policy), before-task-done (`npm run check`) — but the tiering decision logic is missing
- Deep review (review-manager, planned) is expensive (multi-subagent, high tokens); it cannot run on every push/release
- No rule defines which changes need deep review and which pass on lightweight alone — either improvisation (unreliable) or one-size-fits-all (nagging or missing)
- Inconsistent with the existing permission model philosophy: permissions are tiered (Read automatic / code change validated / delete confirmed / push forbidden), review is not

### Proposed Solution

Add change-risk tiering + review recommendation to the Release Proposal in the release flow:

**Tiering rules (written into release.md and the review-manager plan):**

| Risk level | Change types | Review requirement |
| --- | --- | --- |
| low | docs/typo/version numbers/link fixes/formatting | lightweight gate runs automatically; pass = commit, no asking |
| medium | new features/script logic/policy changes/template changes | lightweight gate + Proposal notes "deep review suggested"; the user decides during approval whether to run review-manager first |
| high | security/permissions/deletion protection/governance files (SKILL.md, references/policies/**, behavioral changes to scripts/*.js) | review-manager required first, or item-by-item explicit user confirmation, otherwise no release |

**Proposal gains a line:**

```
Risk level: low / medium / high
Review recommendation: none / suggested (review-manager) / required (review-manager or explicit approval)
```

**Execution semantics:**

- Lightweight (`npm run check` gate group + release preconditions) always runs automatically — the baseline, zero cost
- Low risk: lightweight passes → normal approval → release
- Medium risk: lightweight passes → Proposal notes the suggestion → the decision is exercised by the user at approval time (asked once at release, not on every push)
- High risk: after lightweight passes, review-manager must run first (scoped to the git diff, not the whole project) or the user confirms item by item

**review-manager scope constraint (companion, solves token cost):**

- Review scope = the current `git diff` change set + directly affected files (tests affected by changed scripts, generated artifacts affected by changed policies)
- NOT a whole-project review; whole-project review only on explicit user request

### Affected Files

- `references/workflows/release.md` — Proposal gains risk level + review recommendation; tiering rules table
- `docs/zh-CN/plans/review-manager.md` (three languages) — add the "scope = git diff, not whole project" constraint + tiered trigger semantics
- `references/templates/sub-skills.md` — release-manager sub-skill description synced with the tiering logic
- `docs/{en,zh-CN,zh-TW}/commands.md` — release prompt details synced
- `CHANGELOG.md`

### Risks

- **Tiering judgment relies on the AI** — the medium/high boundary can be underestimated by the agent; mitigated by an explicit type list for high risk rather than free discretion
- **Medium-risk suggestions skipped by user inertia** — same failure mode as "ask every time"; mitigated by prominent marking + default-checked in the Proposal
- **High-risk definition too broad** — treating all scripts/*.js behavioral changes as high risk may over-trigger; v1 stays conservative (better high than low), v1.1 refines

### Validation Method

- release.md contains the tiering rules table and the new Proposal fields (doc assertion)
- review-manager plan contains the "scope = git diff" constraint (doc assertion)
- Simulate: a low-risk change Proposal outputs "risk: low, review: none"; a high-risk change outputs "risk: high, review: required" (manual verification / dogfooding)
- Lightweight gates in release preconditions are neither duplicated nor missing (checked against the release_requirements table)
