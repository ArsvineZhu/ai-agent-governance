# Review Manager (TASK plan)

[English](review-manager.md) · [简体中文](../../zh-CN/plans/review-manager.md) · [繁體中文](../../zh-TW/plans/review-manager.md)

> **Status: design plan, not implemented.** This page is the detailed design of the roadmap item `Review manager` (see [roadmap.md](../roadmap.md)), organized per the `docs/plans/TASK_<name>.md` six-field template. 

### Task Purpose

Standardize the multi-agent deep review into a fixed workflow: when the user says "review this", the agent dispatches parallel subagents, analyzes changes, finds problems and fixes them — instead of improvising. This is the standard capability for quality review of AI-written changes, and a shared need of both this repo and governed projects.

### Current Problem

- Real usage has proven the need: two human-initiated reviews found real problems (2 severe + 6 general + 6 trivial) — but that quality depended on the main agent's improvisation; no fixed workflow guarantees a minimum review quality every time
- Domains can be missed (e.g. only scripts checked, docs skipped), edge cases skipped, fixes incomplete
- The boundary with drift-check was confused once in conversation ("review" was verbally mapped to the consistency mode) — needs an explicit definition to prevent recurrence
- Existing sub-skills (drift-check etc.) are all mechanical checks for catching omissions; no sub-skill does deep problem-finding

### Proposed Solution

Add an 8th sub-skill: **review-manager**.

Triggers: `review this` · `review the changes` · `audit recent changes` · `review my changes` (中文: `审核一下` · `审核改动`)

Workflow (five steps):

1. **Determine scope**: `git diff <baseline>..HEAD` plus uncommitted changes; baseline defaults to the last review point (manually specified in v1, no auto-recording). **Scope constraint: review only the change set + directly affected files (tests affected by changed scripts, generated artifacts affected by changed policies), not the whole project — whole-project review only on explicit user request**
2. **Dispatch parallel subagents** (fixed 5 domains, one each; dynamic expansion not allowed in v1):
   - Script logic — correctness, edge cases, error handling
   - Doc consistency — three language trees, links, version examples, CHANGELOG reconciliation (invokes drift-check scripts as input)
   - Test coverage — fixture realism, assertion strength, flaky risk
   - Governance artifacts — policies, templates vs implementation, protected lists
   - Security — secrets, permission rules, sensitive data
3. **Summarize**: sorted by severity (severe/general/trivial), each with file path + line number + evidence
4. **Fix**: severe and general must be fixed; trivial items reported for the user to decide
5. **Gate verification**: after fixes, run `npm run check` (tests + parity) and record real output

**Boundary with drift-check (explicit, to prevent confusion)**:

| | review-manager | drift-check |
| --- | --- | --- |
| Layer | deep (multi-agent problem-finding) | mechanical (omission-catching) |
| Input | git diff + related project files | manifest + 8 script check classes |
| Output | severity-sorted issue list + fixes | drift-report.json |
| Trigger | `review this` | `check governance drift` |

Complementary: the review-manager's "doc consistency" subagent invokes drift-check scripts; no duplication.

Governed-project note: review-manager focuses on governance artifacts + recent changes; business-logic review scope is decided by the project's own conventions, not enforced.

### Affected Files

- `references/templates/sub-skills.md` — new section 8, review-manager
- `docs/{en,zh-CN,zh-TW}/commands.md` — triggers in the Available Prompts table + a Prompt Details section
- `SKILL.md` — Phase 1 step 13 sub-skill list gains review-manager
- `docs/{en,zh-CN,zh-TW}/architecture.md` — sub-skill inventory
- `CHANGELOG.md` — new sub-skill entry
- The prompt-sync check covers the new triggers automatically (existing mechanism, no extra work)

### Risks

- **Confusion with drift-check** — already happened once this session; mitigated by the boundary table above and fully separated triggers
- **Review depth explosion** — subagents expanding indefinitely; v1 fixes the 5-domain list, no dynamic expansion
- **Fixes introduce new problems** — step 5 mandates the gate group after fixing
- **Sub-skill count change** — 7 → 8; numeric claims ("7 sub-skills") must be updated, the consistency numeric check will flag it

### Validation Method

- sub-skills.md contains section 8 with complete triggers (doc assertion)
- commands.md in all three languages contains the new triggers (prompt-sync tests cover automatically)
- Actually run one review: 5 domain subagents dispatched, severity-sorted report produced (dogfooding)
- Sub-skill count claims updated (consistency numeric check passes)
