# Consent Policy Rewrite: One Confirmation Before Commit (TASK Plan)

[English](consent-policy-hardening.md) · [简体中文](../../zh-CN/plans/consent-policy-hardening.md) · [繁體中文](../../zh-TW/plans/consent-policy-hardening.md)

**Target: both** — five sync points: `AGENTS.md` on the repo side; `references/policies/git.policy.md` (authoritative detail), `references/policies/lifecycle.policy.md` (Phase 2 confirmation gate), `references/templates/agents-md.template.md` (governed-project template summary) and `SKILL.md` (permission matrix) on the payload side. Changing any one point requires syncing the other four; the sync-point list is under Affected Files.

### Objective

Clear the three-layer patch pile and rebuild the consent policy from "per-step confirmation + exception patches" into a single principle — **echo the full git command sequence before committing, and execute after one confirmation**. When the user says push, show the commands to run — the add file list, the commit message (type carried in the message prefix), the push target branch — and execute the whole sequence after the user confirms once. Plan approval is demoted to intent alignment; size tiering is demoted to deciding whether a plan document is written; the full diff is not shown by default. The policy was violated by its own author several times (real incidents this session); the rewrite's goal is to clear the old framework at once, leaving no patches.

### Current Problems

- Three layers of patches stacked: on top of the main rule "each git write op needs per-turn confirmation" sit the release-sequence exception (v0.9.1), then the explicit-user-instruction Exception A (this session), plus a missed sync point patched afterwards (SKILL.md exception two). The rule count keeps growing while the semantics fight each other.
- Two policies each define confirmation: the general-change policy confirms by "plan" (lifecycle Phase 2 gate), the git policy confirms by "operation" (commit once, push once). One task gets approved twice — first the plan, then the commit — which is exactly the root of the "why does push ask so many times" complaint.
- Exception A contradicts itself: the same paragraph holds both "that instruction IS the consent" and "take one confirmation". The executor (this session) picked the first half and ran the whole sequence without confirmation.
- Universal hard constraints are missing: after a mid-sequence failure the agent retried with a different approach on its own (real incident this session); commit messages need not be presented, enabling unilateral commit merging and unilateral message wording; a rejected push could be followed by a unilateral pull/rebase.
- The write-op list has gaps: restore and rm are unclassified; checkout is ungraded — putting it wholesale on the confirmation list clashes with the branch workflow (one extra confirmation per task start), yet switching branches while carrying uncommitted changes does carry overwrite risk.

### Proposed Approach

**Part 1: one confirmation before commit (core rewrite, all five sync points together)**

- The only confirmation point is the pre-commit command echo: after any task completes (regardless of size), before committing, echo the full git command sequence — which files to add, the commit message (one line per commit, type carried in the message prefix), the push target branch; the user confirms once, covering the whole sequence (add → commit → push).
- Plan approval is demoted to intent alignment: a medium/large task's Phase 2 plan approval aligns "what to change, how", and is no longer the commit confirmation.
- Size tiering is demoted: size only decides whether a TASK plan document is written, no longer whether the user gets a confirmation.
- This design dissolves two existing hazards: the confirmation point is bound to the command echo, so it does not depend on the hidden premise of "branch workflow + PR review"; size no longer decides whether to confirm, so the "small-task misclassification" backstop problem disappears.
- Release: a Proposal approved at the Approval Gate covers the whole sequence (kept as-is — it is already the model of presenting the full change to the user for approval).

**Part 2: universal hard constraints (apply to every kind of change)**

- The echo must be the full git command sequence: which files to stage, each commit's message, target remote/branch; the user confirms that sequence, and execution must not deviate from it.
- Mid-sequence failure clause: any step fails → stop and report; do not retry with a different approach, do not improvise a repair; re-confirm before continuing.
- Remote rejection clause: push rejected (non-fast-forward) → stop and report; do not pull/rebase and re-push on your own.
- Ambiguous-instruction examples: add the Chinese "提交一下" ambiguity, still falling under "ask first".

**Part 3: write-op list completion**

- Add restore and rm to the independent-confirmation list (destructive).
- Grade checkout: branch creation and clean-working-tree switches are automatic (consistent with the branch workflow); switching while carrying uncommitted changes needs confirmation.
- Amending an already-pushed commit counts as force push and needs its own confirmation.

**Part 4: gate and verification sync**

- Redesign the consent-cluster gate markers around the new policy's confirmation structure — one authorisation point (pre-commit command echo confirmation) plus two alignment points (plan-approval intent alignment, release Proposal approval) — expanding the sync points from four to five.
- New tests: existence assertions for the command-echo, failure and remote-rejection clauses plus the checkout grading note (to catch any of the five points missing them).
- Governed-project inheritance: template and rule changes are copied into downstream projects by INIT; the CHANGELOG entry states this.

**Part 5: commit-consistency hook (optional, off by default, repositioned)**

- The hook's position shifts from "authorisation check" to "content-consistency check" (verify the actual commit = the content of the command sequence the user confirmed), matching mainstream content-check hooks like husky/gitleaks.
- The credential .governance/consent.json (git-ignored) records the fingerprint of the commit the user confirmed (file list + commit message); the hook compares the actual commit against it and rejects on mismatch.
- Fragility: fingerprint comparison is a state comparison — if the agent changes a single line after the echo, the fingerprint no longer matches and the hook false-rejects; mainstream hooks run independently decidable checks (lint/secrets/format), not state comparisons. Evaluate this fragility before implementing.
- Honest boundary: the credential is written by the agent, so this prevents "the commit deviating from the confirmed command sequence", not "bypassing confirmation entirely"; off by default.

### Affected Files

- `AGENTS.md` — Git Operation Safety Protocol rewritten: one-confirmation-before-commit principle + universal hard constraints + write-list completion
- `references/policies/git.policy.md` — authoritative consent-scope detail rewritten
- `references/policies/lifecycle.policy.md` — Phase 2 confirmation gate reworded into intent alignment; size tiering repositioned
- `references/templates/agents-md.template.md` — Git Write Policy summary synced
- `SKILL.md` — permission matrix and consent scope rewritten in sync
- `scripts/check-doc-consistency.js` — consent-cluster markers redesigned
- `CHANGELOG.md` — Changed entry
- `tests/run-tests.js` — consent-related tests rewritten + new clause-existence tests + hook consistency-check tests
- `references/templates/githooks-template.md` — pre-commit hook template (Part 5)
- `references/init-spec.json` — hook generation declaration (Part 5)

### Risks

- The five points drift again: mitigated — the consent-cluster gate is fail-closed, so missing any point turns the gate red.
- Every task needs a pre-commit confirmation, which may feel heavy for frequent small changes: mitigated — small changes echo short commands, quick to scan.
- Large rewrite scope, many tests to rewrite: mitigated — implement in part order, Part 1 first, Part 5 independent and optional.
- New wording breaks the gate regexes into false positives: mitigated — implementation order is "verify regexes first, then edit text".
- Template changes propagate to all downstream governed projects: mitigated — the CHANGELOG entry states the behaviour change; it is an intentional rewrite, not an accident.

### Validation Method

- Five sync points consistent: the gate's new markers all pass; regression — removing any marker from any point turns the gate red and names it.
- Scenario drill (manual): every task must echo the full git commands and wait for confirmation before committing — a small typo change is no exception.
- Scenario drill (manual): commit fails → stop and report; push rejected → stop and report; neither may retry with a different approach nor pull/rebase on its own.
- New clauses present: all five points contain the command-echo, failure and remote-rejection clause keywords (asserted by the new tests).
- Hook consistency check: a commit deviating from the confirmed fingerprint is rejected (test); a matching commit is allowed (test).
- `npm run check` and `check:all` fully green; delivery gate passes.

---
