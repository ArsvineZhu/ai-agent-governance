# Architecture

[English](architecture.md) · [简体中文](../zh-CN/architecture.md) · [繁體中文](../zh-TW/architecture.md)

This page carries what the README summarizes: the concept map, operating modes, lifecycle pipeline, repository layout and design principles.

### Concept Map

```
                  Governance Specification

                    .governance/
                    manifest.json

                         |
                         v

                Governance Engine

                    SKILL.md

                         |
        --------------------------------

        Agent Runtime Contract

             AGENTS.md
             CLAUDE.md

                         |
                         v

                 Coding Agents
```

- `.governance/` — machine-readable state: `manifest.json` = desired · `state.json` = current · `validation.json` = observed
- `SKILL.md` — the governance engine: orchestrates INIT / AUDIT / RELEASE and generates the framework
- `AGENTS.md` + adapters — the behavioral contract every agent reads at session start

### Operating Modes

| Mode | Trigger | Behavior |
| --- | --- | --- |
| INIT | new project / no `.governance/manifest.json` / maturity L0-L1 | full bootstrap |
| AUDIT | existing manifest / maturity L2-L3 / "audit / health check / drift" | read-only inspection + minimal fixes |
| RELEASE | "release / publish" / version bump | preconditions → version sync → validate → tag → push → GitHub Release |

Priority: explicit user instruction > manifest presence > maturity. AUDIT never rebuilds, restructures or migrates; it reports the gap and applies minimal patches.

### Lifecycle Pipeline

```
SKILL.md (policy + INIT/AUDIT orchestration)
    |
    v
INIT — Inspect → Build → Validate → Report
    |
    v
Generated Project Governance
    +-- AGENTS.md                   runtime rule source
    +-- docs/rules/                 detailed policies (referenced from AGENTS.md)
    +-- .governance/state.json           machine state (maturity / phase / locks)
    +-- scripts/verify-governance.js  validation gate (exit code = pass/fail)
    |
    v
Runtime — agent modules validate integrity, resume sessions, check drift
    |
    v
AUDIT — health check + minimal fixes (no rebuild)
    |
    v
RELEASE — preconditions → version sync → tag → push → GitHub Release
```

### Repository Layout

```
ai-agent-governance/
├── SKILL.md                    # policy + INIT/AUDIT orchestration
├── references/                 # implementation layer (agent runtime inputs)
│   ├── templates/
│   │   ├── agents-md.template.md   # AGENTS.md template
│   │   ├── feature-doc.template.md # feature doc template (anti-fabrication rules)
│   │   ├── sub-skills.md           # generated agent modules (incl. drift-check, release-manager, plan-manager)
│   │   ├── env-example.template.md # .env.example template (placeholders, dependency-trimmed)
│   │   ├── gitmessage.template.md  # .gitmessage.txt template (commit conventions)
│   │   └── git-policy.template.md  # .governance/git-policy.json template (Git workflow policy)
│   ├── policies/
│   │   ├── lifecycle.policy.md / git.policy.md / security.policy.md / coding.policy.md / testing.policy.md
│   │   └── governance-files.policy.md   # protected files + .governance git-tracking policy
│   └── workflows/
│       ├── ci.md               # CI templates (capability detection + degradation)
│       └── release.md          # release preconditions + version consistency
├── scripts/
│   ├── verify_governance.js    # validator (manifest-driven paths + governance_version)
│   ├── check-lock.js           # multi-agent lock check (read-only, exit 1 = lock held)
│   ├── check-git-policy.js     # Git workflow gate (protected branch + directPush=false → exit 1)
│   ├── check-secrets.js        # secret scan gate (staged diff, never prints the secret)
│   ├── check-doc-freshness.js   # doc staleness (git log dates, advisory, exit 0)
│   ├── check-doc-consistency.js # cross-doc contradictions (advisory, exit 0)
│   ├── check-doc-parity.js      # trilingual tree parity (CI + release precondition)
│   ├── package-skill.sh         # release payload tarball packaging
│   └── release-manager.js       # plan (read-only) + execute (approval-gated) release tool
├── docs/                       # knowledge layer (human documentation)
│   ├── glossary.md             # trilingual terminology table (shared)
│   ├── design-decisions/       # architecture decision records (shared, single-language 简体中文)
│   ├── archive/                # completed plan archives (shared, single-language)
│   ├── en/                     # English tree
│   │   ├── architecture.md     # this page
│   │   ├── governance-model.md # Spec / Status / Health state model
│   │   ├── anti-regression.md  # anti-regression mechanisms in full
│   │   ├── lifecycle.md        # 6-phase agent operating lifecycle
│   │   ├── validator.md        # validator usage and checks
│   │   ├── skill-discovery.md  # how agents discover and trigger the skill
│   │   ├── commands.md         # full prompt reference (user-facing commands)
│   │   ├── bootstrap-output.md # complete annotated initialization output
│   │   ├── roadmap.md          # planned features and status
│   │   └── plans/              # design plans (TASK format)
│   ├── zh-CN/                  # 简体中文 tree (canonical source)
│   └── zh-TW/                  # 繁體中文 tree (Taiwan)
├── README.md                   # English landing (translations: docs/zh-CN/README.md, docs/zh-TW/README.md)
├── CONTRIBUTING.md             # development guide (translations: docs/zh-CN/CONTRIBUTING.md, docs/zh-TW/CONTRIBUTING.md)
└── tests/
    └── run-tests.js            # test suite
```

### Design Principles

- **Single source of truth** — the skill is the init-spec source; the generated AGENTS.md is the runtime source; details live in `docs/rules/`
- **Anti-fabrication** — the feature registry only registers real features; empty projects get placeholder templates, never fake paths
- **Structure-adaptive** — existing doc layouts are respected via `manifest.json`, no forced migration
- **Self-protection** — governance policy changes require reason + CHANGELOG + version bump + validator run

---
