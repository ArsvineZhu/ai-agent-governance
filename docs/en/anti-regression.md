# Anti-Regression System

[English](anti-regression.md) · [简体中文](../zh-CN/anti-regression.md) · [繁體中文](../zh-TW/anti-regression.md)

Governance doesn't stop at bootstrap — it constrains every agent on every task, so a second AI (or a new teammate's AI) cannot destroy what a previous agent built. This page details the full anti-regression mechanisms (summary: README → Features → Anti-Regression System).

- **Auto-loaded entry points** — `AGENTS.md` / `CLAUDE.md` / `.cursor/rules/` are read automatically at session start; agents MUST read `docs/ARCHITECTURE.md`, `docs/features/` and the recent `CHANGELOG.md` before touching code
- **6-phase operating lifecycle** — every development task runs Understand → Plan → Implement → Validate → Synchronize → Report; medium/large changes require a `docs/plans/TASK_<name>.md` before any code; changing code without updating project knowledge is forbidden
- **Code modification / deletion protection** — touching existing code requires context analysis + ownership determination first; deletion needs a stated reason, a full reference search, a Feature Registry impact check and a migration plan ("looks unused" is never enough)
- **Change classification** — doc-only changes → no CHANGELOG entry; bug fix → `Fixed`; new capability → `Added`; architecture/behavioral/breaking → `Changed`
- **Governance file protection** — `AGENTS.md` / `CLAUDE.md` / `docs/rules/**` / `.governance/manifest.json` / `.governance/preflight.json` / `.governance/git-policy.json` / `.governance/sync-rules.json` / `scripts/verify-governance.js` / `scripts/check-lock.js` / `scripts/check-git-policy.js` / `scripts/check-secrets.js` / `opencode.json` and CI configs (`.github/workflows/**`) are protected: changing them requires reason → CHANGELOG update → `governance_version` bump → validator run; permission/security/validation changes need explicit user confirmation (agents cannot un-limit themselves)
- **Rule priority** — conflicts resolve: System/Platform Safety > Explicit User Request > Governance Integrity > AGENTS.md > docs/rules/ > Existing Code Conventions; ordinary tasks can never implicitly bypass governance rules
- **Agent permission matrix** — read automatic; documentation creation automatic; code modification allowed but must be validated; code deletion / dependency changes / git commit require confirmation; git push is forbidden without user approval
- **Multi-agent locking** — `.governance/state.json` records `agent_id` / `task_id` / `locked`; agents never edit the same file in parallel, and resume (not re-run) from the recorded phase after crashes
- **Evidence & recovery** — every report item is ✅ / ⚠️ / ❌ against real command output (no fabricated "done"); `preflight.json` is a rollback snapshot; blocked steps are reported, never silently skipped

---
