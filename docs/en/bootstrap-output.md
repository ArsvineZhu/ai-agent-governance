# Bootstrap Output

[English](bootstrap-output.md) · [简体中文](../zh-CN/bootstrap-output.md) · [繁體中文](../zh-TW/bootstrap-output.md)

What one `initialize project governance` prompt produces — the complete annotated tree.

```
my-project/
├── AGENTS.md                    runtime rule source
├── CLAUDE.md                    agent entry file (@AGENTS.md), per detected tool
├── CHANGELOG.md                 Keep a Changelog
├── README.md                    English landing (language switcher links at top)
├── .gitmessage.txt              commit message template (repo default)
├── docs/
│   ├── README.zh-CN.md          简体中文 translation (source language; omitted for English-only projects, per language policy)
│   ├── ARCHITECTURE.md          data flow + ADR + component registry
│   ├── plans/                   development plan + task templates
│   ├── features/                feature registry (real features only)
│   └── rules/                   lifecycle / git-policy / security / coding / testing
├── .env.example                 security baseline
├── .governance/                 manifest / state / preflight / git-policy / sync-rules + generated/skills
├── scripts/verify-governance.js validation gate (exit code = pass/fail)
└── .github/workflows/           CI pipeline (capability-detected, degrades gracefully)
```

Plus generated agent modules under `.governance/generated/skills/` (incl. drift-check, release-manager) that keep daily agent work and releases inside the framework.

- `AGENTS.md` — the runtime rule source every agent reads at session start (details in `docs/rules/`, referenced via `@`)
- `CLAUDE.md` / adapters — per-tool entry files (`@AGENTS.md`)
- `.governance/` — machine-readable governance state: `manifest.json` (desired) · `state.json` (current) · `validation.json` (observed)
- `scripts/verify-governance.js` — zero-dependency validation gate used by CI and AUDIT

Existing projects are merged, never overwritten; existing doc layouts are respected via `.governance/manifest.json` (structure-adaptive).

---
