# Rule Capture（TASK 计划）

[English](rule-capture.md) · [简体中文](../../zh-CN/plans/rule-capture.md) · [繁體中文](../../zh-TW/plans/rule-capture.md)

### Task Purpose

Stop governance requirements from living only in conversation context. Every persistent requirement a developer states during a task must land in a rule file (`AGENTS.md` / `docs/rules/**`) before the task is declared done — so a new developer, a new machine or a fresh session inherits the same constraints instead of watching the agent "reasonably" break things again.

### Current Problem

Requirements stated in chat take effect immediately (the agent obeys them in-session) but are never written into the governance system. When the context ends they evaporate:

- This very session produced 5 stated requirements; only 3 were fully captured, 1 landed in the governed-project template but NOT in this repo's own AGENTS.md, and 1 (`prefer improving existing mechanisms over adding new ones`) was never written anywhere.
- The six-phase lifecycle synchronizes code → docs (CHANGELOG / Feature Registry / architecture), but has **no obligation covering "stated requirement → rule file"**.
- Result: governance looks implemented (the agent behaved correctly all session) yet is absent from the repository — the next agent has no idea.

A second, subtler problem: the agent cannot reliably tell a **persistent rule** from a **one-off instruction**. Auto-writing everything pollutes the rule base with one-off decisions (e.g. "commit it all in one commit" was bound to one specific pile of mixed changes); asking the developer to enumerate what to keep pushes the sorting work back and invites a dismissive "whatever".

### Proposed Solution

**AI pre-classifies, the developer adjudicates, one confirmation round per task, unconfirmed candidates leave a trace.**

1. **Collect during the task** — the agent records every requirement the developer states.
2. **Pre-classify at Phase 6** — the report carries a Rule Capture list with a verdict per item, not a question:
   - `[persistent]` + proposed target file/section
   - `[one-off]` + why it is bound to this task
   - `[unclear]` + explicit request for adjudication
3. **Developer adjudicates** — confirm or reclassify in one reply.
4. **Write** — confirmed persistent rules go into `AGENTS.md` / `docs/rules/**` through the governance-file protection flow (reason → CHANGELOG → validator run; the full protected-files list lives in `references/policies/governance-files.policy.md` as the single source of truth and is not repeated here). Writing is never silent and never unconfirmed: rule files are protected artifacts, and an agent writing its own constraints unsupervised is exactly what "agents cannot un-limit themselves" forbids.
5. **Leave a trace** — unconfirmed or unadjudicated candidates are written to `.governance/activity.jsonl` as `rules_pending`, so nothing silently disappears and drift-check can report "N candidate rules not yet captured".

**Classification criteria (goes into the rule text):**

| Signal | Verdict |
| --- | --- |
| Imperative + general behavior ("from now on", "always", "never again"); constrains a behavior pattern; has recurred | persistent rule |
| Bound to a concrete object ("this file", "this time"); contains scope limiters ("first", "for now", "just this once"); expires on completion | one-off instruction |
| Cannot be determined | unclear — developer adjudicates |

**Why not fully automatic:** rule files are governance-protected; permission/security/validation changes require explicit user confirmation. Also the cost is asymmetric — a missed rule costs one sentence to restate, a wrongly recorded rule is a permanent false constraint that nobody audits later.

### Affected Files

- `references/policies/lifecycle.policy.md` — Phase 5 gains a **rule capture** sync item; Phase 6 report gains a **Rule Capture list** section
- `references/templates/agents-md.template.md` — Phase 5 summary gains rule capture; Documentation Map classification notes that newly stated general requirements go to `docs/rules/**`
- `references/templates/sub-skills.md` — state-manager writes `rules_captured` / `rules_pending` into `.governance/activity.jsonl`; drift-check `activity-report` mode surfaces pending candidates
- `AGENTS.md` — this repo's own equivalent obligation (and back-fill of the two rules this session failed to capture)
- `CHANGELOG.md` — Added entry

### Risks

- **Report bloat** — every task ending with a rule list becomes noise for small changes; mitigation: small-tier tasks report only when a candidate exists, otherwise a single "no new rules" line
- **Misclassification** — the agent labels a one-off as persistent; mitigation: developer adjudicates before any write, and the criteria table biases ambiguity toward `unclear` rather than `persistent`
- **Protected-file friction** — every captured rule triggers the governance-file protection flow (CHANGELOG + validator); mitigation: batch all captured rules of one task into a single protected-file change
- **Pending pile-up** — `rules_pending` grows unbounded if the developer keeps deferring; mitigation: drift-check reports the count, making the debt visible

### Validation Method

- Fixture task with one persistent + one one-off requirement → Phase 6 report shows both with correct verdicts (dogfooding, manual)
- Confirmed rule appears in the target rule file + CHANGELOG entry exists (doc assertion)
- Unconfirmed candidate appears in `.governance/activity.jsonl` as `rules_pending` (test)
- drift-check `activity-report` mode reports pending candidate count (test)
- This session's two missed rules are back-filled into this repo's AGENTS.md (doc assertion)

---
