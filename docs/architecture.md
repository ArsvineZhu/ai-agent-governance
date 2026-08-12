# Architecture

[English](#english) · [简体中文](#chinese)

---

## English

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
│   │   ├── sub-skills.md           # generated agent modules (incl. drift-check, release-manager)
│   │   ├── env-example.template.md # .env.example template (placeholders, dependency-trimmed)
│   │   └── gitmessage.template.md  # .gitmessage.txt template (commit conventions)
│   ├── policies/
│   │   ├── lifecycle.policy.md / git.policy.md / security.policy.md / coding.policy.md / testing.policy.md
│   │   └── governance-files.policy.md   # protected files + .governance git-tracking policy
│   └── workflows/
│       ├── ci.md               # CI templates (capability detection + degradation)
│       └── release.md          # release preconditions + version consistency
├── scripts/
│   ├── verify_governance.js    # validator (manifest-driven paths + governance_version)
│   ├── check-lock.js           # multi-agent lock check (read-only, exit 1 = lock held)
│   └── release-manager.js      # plan (read-only) + execute (approval-gated) release tool
├── docs/                       # knowledge layer (human documentation)
│   ├── architecture.md         # this page
│   ├── governance-model.md     # Spec / Status / Health state model
│   ├── anti-regression.md      # anti-regression mechanisms in full
│   ├── lifecycle.md            # 6-phase agent operating lifecycle
│   ├── validator.md            # validator usage and checks
│   ├── skill-discovery.md      # how agents discover and trigger the skill
│   ├── commands.md             # full prompt reference (user-facing commands)
│   ├── bootstrap-output.md     # complete annotated initialization output
│   ├── roadmap.md              # planned features and status
│   ├── plans/                  # design plans (e.g. git-workflow-governance, unimplemented)
│   └── design-decisions/       # architecture decision records
├── CONTRIBUTING.md             # development guide
└── tests/
    └── run-tests.js            # test suite
```

### Design Principles

- **Single source of truth** — the skill is the init-spec source; the generated AGENTS.md is the runtime source; details live in `docs/rules/`
- **Anti-fabrication** — the feature registry only registers real features; empty projects get placeholder templates, never fake paths
- **Structure-adaptive** — existing doc layouts are respected via `manifest.json`, no forced migration
- **Self-protection** — governance policy changes require reason + CHANGELOG + version bump + validator run

---

## Chinese

本页承载 README 概要背后的内容：概念图、运行模式、生命周期管线、仓库布局与设计原则。

### 概念图

```
                  治理规范（Governance Specification）

                     .governance/
                     manifest.json

                          |
                          v

                  治理引擎（Governance Engine）

                     SKILL.md

                          |
         --------------------------------

         运行时契约（Agent Runtime Contract）

              AGENTS.md
              CLAUDE.md

                          |
                          v

                  编码 Agent（Coding Agents）
```

- `.governance/` — 机器可读状态：`manifest.json` = 期望态 · `state.json` = 当前态 · `validation.json` = 观测态
- `SKILL.md` — 治理引擎：编排 INIT / AUDIT / RELEASE 并生成治理框架
- `AGENTS.md` + 适配层 — 每个 Agent 会话开始必读的行为契约

### 运行模式

| 模式 | 触发条件 | 行为 |
| --- | --- | --- |
| INIT | 新项目 / 无 `.governance/manifest.json` / 成熟度 L0-L1 | 完整引导 |
| AUDIT | 已有 manifest / 成熟度 L2-L3 / 用户说"巡检/健康检查/治理偏差" | 只读巡检 + 最小补丁修复 |
| RELEASE | 用户说"发布 / release / publish"、或版本推进需求 | 前置检查 → 版本同步 → 校验 → tag → push → GitHub Release |

判定优先级：**用户明确指令 > manifest 存在性 > 成熟度**。AUDIT 不重建、不重构、不迁移，只输出差距报告并应用最小补丁。

### 生命周期管线

```
SKILL.md（策略层 + INIT/AUDIT 编排）
    |
    v
INIT — Inspect → Build → Validate → Report
    |
    v
生成的项目治理
    +-- AGENTS.md                  运行期规则源头
    +-- docs/rules/                详细策略（AGENTS.md 按章节 @ 引用）
    +-- .governance/state.json          机器状态（成熟度 / 阶段 / 锁）
    +-- scripts/verify-governance.js  校验门禁（退出码 = 通过/失败）
    |
    v
运行期 — Agent 模块校验完整性、断点续跑、检测漂移
    |
    v
AUDIT — 健康检查 + 最小补丁（不重建）
    |
    v
RELEASE — 前置检查 → 版本同步 → tag → push → GitHub Release
```

### 仓库布局

```
ai-agent-governance/
├── SKILL.md                    # 策略层 + INIT/AUDIT 编排
├── references/                 # 实现层（Agent 运行时输入）
│   ├── templates/
│   │   ├── agents-md.template.md   # AGENTS.md 模板
│   │   ├── feature-doc.template.md # Feature 文档模板（含反虚构规则）
│   │   ├── sub-skills.md           # 生成的 Agent 模块（含 drift-check、release-manager）
│   │   ├── env-example.template.md # .env.example 模板（占位符、按依赖裁剪）
│   │   └── gitmessage.template.md  # .gitmessage.txt 模板（提交约定）
│   ├── policies/
│   │   ├── lifecycle.policy.md / git.policy.md / security.policy.md / coding.policy.md / testing.policy.md
│   │   └── governance-files.policy.md   # 受保护文件 + .governance Git 跟踪策略
│   └── workflows/
│       ├── ci.md               # CI 模板（能力检测 + 降级）
│       └── release.md          # 发布前置检查 + 版本一致性
├── scripts/
│   ├── verify_governance.js    # 校验引擎（manifest 驱动路径 + governance_version）
│   ├── check-lock.js           # 多 Agent 锁检查（只读，exit 1 = 持锁）
│   └── release-manager.js      # 发布工具：plan（只读）+ execute（审批门禁）
├── docs/                       # 知识层（人类文档）
│   ├── architecture.md         # 本页
│   ├── governance-model.md     # Spec / Status / Health 状态模型
│   ├── anti-regression.md      # 防乱改机制完整明细
│   ├── lifecycle.md            # Agent 六阶段操作生命周期
│   ├── validator.md            # 校验器用法与检查项
│   ├── skill-discovery.md      # Agent 如何发现并触发 skill
│   ├── commands.md             # 完整提示词参考（用户入口命令）
│   ├── bootstrap-output.md     # 完整带注释的初始化产物
│   ├── roadmap.md              # 待开发功能与状态
│   ├── plans/                  # 设计计划（如 git-workflow-governance，未实现）
│   └── design-decisions/       # 架构决策记录（ADR）
├── CONTRIBUTING.md             # 开发指南
└── tests/
    └── run-tests.js            # 验证套件
```

### 设计原则

- **单一事实源** — Skill 是初始化规范唯一源头；生成后的 AGENTS.md 是运行期唯一源头；细节在 `docs/rules/`
- **反虚构** — Feature 登记只记录真实功能；空项目生成占位模板，绝不虚构功能或路径
- **结构适配** — 经 `manifest.json` 尊重既有文档布局，不强制迁移
- **防篡改** — 治理策略变更需说明原因 + 更新 CHANGELOG + 升版本 + 跑校验