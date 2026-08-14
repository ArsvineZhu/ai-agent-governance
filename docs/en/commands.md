# Commands

[English](commands.md) · [简体中文](../zh-CN/commands.md) · [繁體中文](../zh-TW/commands.md)

All prompts below are chat prompts for AI coding agents, not shell commands. They follow the governance lifecycle: **Initialize → Develop → Maintain → Release**.

### Available Prompts

| Scenario | Prompt | Aliases |
| --- | --- | --- |
| New repository / first-time setup | `initialize project governance` | `initialize governance` · `setup project for AI agents` · `create AGENTS.md framework` |
| Planning a development task | `plan this task` | `create task plan` · `update development plan` · `check off milestone` · `mark task completed` |
| Existing governed repository maintenance | `audit governance` | `governance health check` · `fix governance drift` |
| Preparing a release | `release` | `publish version` · `create release` · `/release vX.Y.Z` |

Git Workflow Governance has no prompt of its own — it takes effect automatically as a runtime rule: `scripts/check-git-policy.js` runs before work starts and blocks direct commits/pushes on protected branches (see `.governance/git-policy.json`). Likewise `push` / `merge` are not prompts — they are confirmation-gated write operations: the agent states intent and waits for your explicit approval (see `docs/rules/git-policy.md`).

### Prompt Details

#### initialize project governance

Bootstraps the initial AI agent governance foundation for a repository (AGENTS.md, rules, feature registry, governance state, validation system, CI).

Workflow:

```
Repository inspection
→ Generate governance foundation
→ Create governance state
→ Configure agent rules
→ Setup validation
→ Setup CI
→ Report
```

Detailed output (full annotated tree): [bootstrap-output.md](bootstrap-output.md)

#### plan this task

Creates the development plan before a medium/large change (TASK file with Status, purpose, problem, solution, affected files, risks, validation).

Workflow:

```
Create docs/plans/TASK_<name>.md
→ Confirm with developer
→ Start implementation
```

On completion the same planner checks off the milestone and marks the task Completed.

#### audit governance

Maintains governance health: detects drift and keeps project knowledge synchronized.

Workflow:

```
Read current state
→ Detect drift
→ Validate artifacts
→ Apply minimal fixes
```

#### release

Creates a version release through human approval.

Workflow:

```
Analyze changes
→ SemVer proposal
→ Approval
→ Tag
→ GitHub Release
```

### Runtime Components

These components are automatically invoked by the lifecycle prompts. Users normally only interact with the lifecycle prompts above.

| Component | Prompts | Responsibility |
| --- | --- | --- |
| drift-check | `check governance drift` · `governance health report` · `is governance intact` | compares manifest against reality, reports drift; `activity-report` mode aggregates the audit trail |
| governance-validator | `governance check` · `verify governance` · `validate AGENTS` | runs the validator, records `validation.json` |
| ci-generator | `setup CI` · `add CI` · `create workflow` | generates the CI pipeline for the detected stack |
| repository-inspection | `inspect the repo` · `what is the stack` · `check environment` | inspects the environment, returns the stack report |
| state-manager | `update state` · `record progress` | persists progress into `.governance/state.json` |
| plan-manager | `plan this task` · `create task plan` · `update development plan` · `check off milestone` · `mark task completed` | creates TASK plans, checks off milestones, marks tasks completed |
| release-manager | `release` · `publish version` · `/release vX.Y.Z` | executes the approval-gated release flow |

### Execution Rules

Any prompt with an uncertain outcome (e.g. a release with an unclear breaking change) pauses and asks for clarification — never a silent guess.

---
