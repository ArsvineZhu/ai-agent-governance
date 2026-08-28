# Removal Hygiene (TASK Plan)

[English](removal-hygiene.md) · [简体中文](../../zh-CN/plans/removal-hygiene.md) · [繁體中文](../../zh-TW/plans/removal-hygiene.md)

> **Status: design plan, not implemented.** Delivery verification (`scripts/check-plan-delivery.js`) skips design-only plans; this line is what marks it.

**Target: both** — `AGENTS.md` on the repo side; `SKILL.md` on the payload side. One rule, two landing points; the list is under Affected Files.

### Objective

Establish a document-change rule — when deleting or replacing content, the body keeps only the corrected wording; the reason for the deletion goes into the history layer (CHANGELOG or an ADR). The current-rule layer (rule and document bodies) states only what should be done.

### Current Problems

- After deleting some content, the body gains a negating footnote ("no longer shown", "removed", "we do not do this"), writing the act of deletion itself into the current rule.
- Instance from this session: diff had been removed from the confirmation flow, yet the plan body wrote "the full diff is not shown by default", cleared after being called out.
- The footnote's harm: it re-mentions a word that should not appear; it misleads later Agents into thinking the content is still relevant; a negating prohibition names the deleted content and invites curiosity instead.

### Proposed Approach

- The body states only what should be done: when a concept is removed, the body contains neither its name nor any trace that something used to be here.
- The body is self-sufficient: a reader who never saw the old version cannot tell something was deleted.
- History goes to its layer: the reason for the deletion goes into CHANGELOG or an ADR.
- Verdict criterion: searching the removed content's name across the repo, the body hit count must be zero; a hit means it was not removed cleanly.

### Affected Files

- `AGENTS.md` — Conventions gains a "removal hygiene" entry
- `SKILL.md` — the same entry added, constraining document maintenance in governed projects
- `docs/{en,zh-CN,zh-TW}/plans/removal-hygiene.md` — this plan (trilingual)

### Risks

- The verdict criterion may misfire: normal text can coincidentally use the removed word, in which case a human distinguishes a leftover footnote from an independent normal use.

### Validation Method

- Instance recheck: for this session's diff case, the body hit count is zero.
- Rule landed: AGENTS.md and SKILL.md each carry the entry.
- Gates: document parity and consistency checks pass.

---
