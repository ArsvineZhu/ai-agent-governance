# AI Agent Governance

[![CI](https://github.com/Consciencieux/ai-agent-governance/actions/workflows/ci.yml/badge.svg)](https://github.com/Consciencieux/ai-agent-governance/actions/workflows/ci.yml)

[English](#english) · [简体中文](#chinese)

Bootstrap a complete governance system for AI coding agents — then keep it healthy throughout the project lifecycle.

---

## English

**AI Agent Governance** — a one-command workflow to bootstrap a complete software engineering governance environment for AI coding agents on day one, then maintain it through validation and audit workflows.

Designed for the AGENTS.md ecosystem, compatible with Claude Code, Cursor, Codex, opencode, and other coding agents.

### Why

AI coding agents are powerful, but every new project starts without context.

Developers repeatedly need to create, by hand:

- AGENTS.md
- Architecture docs
- Feature registry
- Coding rules
- Git policies
- CI checks
- Security baseline

This skill bootstraps these governance foundations **automatically** on day one — then keeps them healthy for the rest of the project lifecycle.

### Quick Start

In your AI coding agent's chat session, run:

> initialize project governance

Works with: Claude Code · Cursor · Codex · opencode

**Before:**

```
my-project/
├── src/
└── package.json
```

**After:**

```
my-project/
├── AGENTS.md
├── CHANGELOG.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── plans/
│   ├── features/
│   └── rules/
├── .agent/
├── scripts/
└── .github/workflows/
```

One prompt, and your project has a complete governance environment: AGENTS.md, rule system, feature registry, Git policy, CI validation, and security baseline — ready for any AGENTS.md-compatible agent.

Already governed? Run a health check instead:

> audit governance

### What INIT Builds

One prompt produces a complete governance environment:

```
my-project/
├── AGENTS.md                    runtime rule source
├── CLAUDE.md                    agent entry file (@AGENTS.md), per detected tool
├── CHANGELOG.md                 Keep a Changelog
├── docs/
│   ├── ARCHITECTURE.md          data flow + ADR + component registry
│   ├── plans/                   development plan + task templates
│   ├── features/                feature registry (real features only)
│   └── rules/                   lifecycle / git-policy / security / coding / testing
├── .env.example                 security baseline
├── .agent/                      manifest / state / validation / preflight
├── scripts/verify-governance.js validation gate (exit code = pass/fail)
└── .github/workflows/           CI pipeline (capability-detected, degrades gracefully)
```

Plus generated agent modules under `.agent/skills/` (incl. drift-check) that keep daily agent work inside the framework.

### Features

**Bootstrap — governance in one prompt:**

- **Single-prompt initialization** — build the complete governance skeleton from one instruction
- **Repository inspection** — detects language, package manager, build tool, test framework, and project maturity before touching anything
- **AGENTS.md generation** — the runtime rule source, concise and tool-agnostic
- **Rule system generation** — lifecycle / Git policy / security / coding / testing rules, referenced from AGENTS.md
- **Validation setup** — installs a governance validation command into the project (zero dependencies)

**Long-term — keep it healthy:**

- **Validation gates** — prevent governance drift through automated checks
- **Drift detection** — catch governance decay before it becomes technical debt
- **Audit mode** — health-check any governed project, apply minimal fixes (no rebuild, no restructure)
- **Maturity-adaptive** — adjusts create/merge/audit strategy: L0 empty repo · L1 early development · L2 active project · L3 production system
- **Multi-agent state** — `.agent/state.json` tracks `agent_id` / `task_id` / `locked` for coordination

**Design principles:**

- **Single source of truth** — the skill is the init-spec source; the generated AGENTS.md is the runtime source
- **Anti-fabrication** — the feature registry only registers real features; empty projects get placeholder templates, never fake paths
- **Structure-adaptive** — existing doc layouts are respected via `manifest.json`, no forced migration
- **Self-protection** — governance policy changes require reason + CHANGELOG + version bump + validator run

### Governance as Code

Instead of keeping AI rules in chat history, this project stores governance as version-controlled files inside the repository — `manifest.json`, `validation.json`, versioned rules, and a verifiable validator. Everything is reviewable, diffable, and auditable like code.

### How It Works

The workflow **starts with INIT** — it creates the governance foundation. Runtime and AUDIT extend it:

- **INIT (primary)** — new project: build the governance skeleton once.
  `Inspect → Build → Validate → Report` (evidence-based, ✅/⚠️/❌ completion checklist).
- **Runtime** — daily tasks run inside the generated framework: the generated agent modules validate governance integrity, resume sessions across crashes, and check for drift.
- **AUDIT** — revisit any governed project for a health check: read manifest → run validator `--json` → governance health report → minimal fixes (no rebuild, no restructure).

Runs in a single pass with an optional phased pause; blocked items are reported as ⚠️ Blocked, never faked.

### Repository Structure

```
ai-agent-governance/
├── SKILL.md                    # policy + INIT/AUDIT orchestration
├── reference/
│   ├── agents-md.template.md   # AGENTS.md template
│   ├── feature-doc.template.md # feature doc template (anti-fabrication rules)
│   ├── ci-workflows.md         # CI templates (capability detection + degradation)
│   ├── sub-skills.md           # generated agent modules (incl. drift-check)
│   └── rules/                  # lifecycle / git-policy / security / coding / testing
├── scripts/
│   └── verify_governance.js    # validator (manifest-driven paths + governance_version)
└── test/
    └── run-tests.js            # test suite (empty / default / custom-manifest / json)
```

### Governance Flow

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
    +-- .agent/state.json           machine state (maturity / phase / locks)
    +-- scripts/verify-governance.js  validation gate (exit code = pass/fail)
    |
    v
Runtime — agent modules validate integrity, resume sessions, check drift
    |
    v
AUDIT — health check + minimal fixes (no rebuild)
```

### Supported Agents

Compatible with Claude Code, Cursor, Codex, opencode, and other AGENTS.md-based coding agents.

### Development

```bash
npm test        # or node test/run-tests.js
```

Covers: empty project, full default structure, custom doc root via manifest, missing governance_version, and `--json` output. CI runs it on every push/PR.

### Roadmap

- [x] AGENTS.md governance bootstrap
- [x] Feature registry
- [x] Governance validator
- [ ] IDE extension
- [ ] Multi-agent coordination protocol
- [ ] Remote governance dashboard

### License

[MIT](LICENSE) © 2026 Consciencieux

---

## Chinese

**AI Agent 治理** —— 一键为 AI 编码 Agent 建立完整治理体系，并在项目生命周期中持续维护。

为 AGENTS.md 生态设计，兼容 Claude Code、Cursor、Codex、opencode 及其他读取 AGENTS.md 的编码 Agent。

### 为什么需要

AI 编码 Agent 能力很强，但每个新项目都是从零开始、没有上下文。

开发者每次都要手动创建：

- AGENTS.md
- 架构文档
- Feature 登记
- 编码规范
- Git 规范
- CI 检查
- 安全基线

本 Skill 在第一天**自动**搭建好这些治理地基 —— 并在项目整个生命周期里持续维护它们。

### 快速开始

在你的 AI 编码 Agent 会话中运行：

> initialize project governance

支持：Claude Code · Cursor · Codex · opencode

**之前：**

```
my-project/
├── src/
└── package.json
```

**之后：**

```
my-project/
├── AGENTS.md
├── CHANGELOG.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── plans/
│   ├── features/
│   └── rules/
├── .agent/
├── scripts/
└── .github/workflows/
```

一条指令，项目就拥有了完整治理环境：AGENTS.md、规则体系、Feature 登记、Git 规范、CI 校验、安全基线 —— 任何兼容 AGENTS.md 的 Agent 都能直接使用。

已有治理体系？改用巡检：

> audit governance

### 初始化产物

一条指令生成完整治理环境：

```
my-project/
├── AGENTS.md                    运行期规则源头
├── CLAUDE.md                    Agent 入口文件（@AGENTS.md，按检测到的工具生成）
├── CHANGELOG.md                 Keep a Changelog
├── docs/
│   ├── ARCHITECTURE.md          数据流 + ADR + 组件登记
│   ├── plans/                   开发计划 + 任务模板
│   ├── features/                Feature 登记（只登记真实功能）
│   └── rules/                   lifecycle / git-policy / security / coding / testing
├── .env.example                 安全基线
├── .agent/                      manifest / state / validation / preflight
├── scripts/verify-governance.js 校验门禁（退出码 = 通过/失败）
└── .github/workflows/           CI 管线（能力检测式，优雅降级）
```

同时生成 `.agent/skills/` 下的 Agent 模块（含 drift-check），接管日常任务的持续巡检。

### 特性

**初始化 —— 一条指令建立治理：**

- **一键初始化** — 单条指令搭好完整治理骨架
- **仓库检测** — 动手前先识别语言、包管理器、构建工具、测试框架与项目成熟度
- **AGENTS.md 生成** — 运行期规则源头，精简且与工具无关
- **规则体系生成** — lifecycle / Git 规范 / 安全 / 编码 / 测试规则，AGENTS.md 按章节 `@` 引用
- **校验搭建** — 安装治理校验命令（零依赖校验器）

**长期维护 —— 持续保鲜：**

- **验证门禁** — 通过自动化检查阻止治理漂移
- **漂移检测** — 在治理腐化变成技术债之前发现
- **AUDIT 巡检** — 随时健康检查已治理项目，最小补丁修复（不重建、不重构）
- **成熟度适配** — 自动调整"创建/合并/审计"策略：L0 空仓库 · L1 早期开发 · L2 活跃项目 · L3 生产系统
- **多 Agent 状态** — `.agent/state.json` 跟踪 `agent_id` / `task_id` / `locked`，为协作做准备

**设计原则：**

- **单一事实源** — Skill 是初始化规范唯一源头；生成后的 AGENTS.md 是运行期唯一源头
- **反虚构** — Feature 登记只记录真实功能；空项目生成占位模板，绝不虚构功能或路径
- **结构适配** — 经 `manifest.json` 尊重既有文档布局，不强制迁移
- **防篡改** — 治理策略变更需说明原因 + 更新 CHANGELOG + 升版本 + 跑校验

### Governance as Code（治理即代码）

不再依赖聊天记录保存 AI 行为规则，而是将治理体系作为仓库内可版本控制的代码资产 —— `manifest.json`、`validation.json`、带版本的规则文件与可验证的校验器。一切如代码一样可评审、可 diff、可审计。

### 工作原理

流程**从 INIT 开始** —— 它建立治理地基；运行期与 AUDIT 在此基础上延伸：

- **INIT（主流程）** — 新项目：一次性搭好治理骨架。
  `Inspect → Build → Validate → Report`（基于真实证据，✅/⚠️/❌ 完成度核对表）。
- **运行期** — 日常任务在生成的框架内运行：生成的 Agent 模块校验治理完整性、跨崩溃断点续跑、检测漂移。
- **AUDIT** — 随时对已治理项目做健康检查：读 manifest → 跑校验器 `--json` → 治理健康报告 → 最小补丁（不重建、不重构）。

单次运行内完成，上下文不足时允许**阶段化暂停**；外部阻塞标 ⚠️ Blocked，绝不伪造完成。

### 仓库结构

```
ai-agent-governance/
├── SKILL.md                    # 策略层 + INIT/AUDIT 编排
├── reference/
│   ├── agents-md.template.md   # AGENTS.md 模板
│   ├── feature-doc.template.md # Feature 文档模板（含反虚构规则）
│   ├── ci-workflows.md         # CI 模板（能力检测 + 降级）
│   ├── sub-skills.md           # 生成的 Agent 模块（含 drift-check）
│   └── rules/                  # lifecycle / git-policy / security / coding / testing
├── scripts/
│   └── verify_governance.js    # 校验引擎（manifest 驱动路径 + governance_version）
└── test/
    └── run-tests.js            # 验证套件（empty / default / custom-manifest / json）
```

### 治理流程

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
    +-- .agent/state.json          机器状态（成熟度 / 阶段 / 锁）
    +-- scripts/verify-governance.js  校验门禁（退出码 = 通过/失败）
    |
    v
运行期 — Agent 模块校验完整性、断点续跑、检测漂移
    |
    v
AUDIT — 健康检查 + 最小补丁（不重建）
```

### 支持的 Agent

兼容 Claude Code、Cursor、Codex、opencode 及其他基于 AGENTS.md 的编码 Agent。

### 开发

```bash
npm test        # 或 node test/run-tests.js
```

覆盖：空项目（exit 1）、完整默认结构（exit 0）、自定义文档根经 manifest（manifest 模式）、缺 governance_version（exit 1）、`--json` 输出。CI 已接入。

### Roadmap

- [x] AGENTS.md 治理引导
- [x] Feature 登记
- [x] 治理校验器
- [ ] IDE 扩展
- [ ] 多 Agent 协调协议
- [ ] 远程治理看板

### License

[MIT](LICENSE) © 2026 Consciencieux
