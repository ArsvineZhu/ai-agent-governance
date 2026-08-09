# AI Agent Governance

[![CI](https://github.com/Consciencieux/ai-agent-governance/actions/workflows/ci.yml/badge.svg)](https://github.com/Consciencieux/ai-agent-governance/actions/workflows/ci.yml)

[English](#english) · [简体中文](#chinese)

Governance infrastructure for AI coding agents.

---

## English

**AI Agent Governance** — infrastructure for reliable AI coding agents.

A framework for initializing, maintaining, and auditing software project governance. Implemented as a SKILL.md-based governance workflow, it works with any AGENTS.md-compatible agent.

### Why

AI coding agents can modify code quickly, but they lack long-term project memory, ownership boundaries, and governance discipline.

This project adds:

- **persistent project knowledge** — AGENTS.md, architecture docs, feature registry, CHANGELOG
- **safe modification rules** — code-modification/deletion protection, Git permission model
- **validation gates** — a validator that fails closed when governance is missing
- **drift detection** — catch governance decay before it becomes technical debt

### Features

- **Single source of truth** — the skill is the init-spec source; the generated AGENTS.md is the runtime source.
- **Anti-fabrication** — the feature registry only registers real features; empty projects get placeholder templates, never invented features or fake paths.
- **Self-protection** — governance policy changes require reason + CHANGELOG + version bump + validator run.
- **Maturity-adaptive** — adjusts the create/merge/audit strategy automatically. L0 Empty repository · L1 Early development · L2 Active project · L3 Production system.
- **Structure-adaptive** — `manifest.json` declares real paths; the validator follows them, so existing doc layouts are respected.
- **Verifiable** — validator with zero external npm dependencies, plus a test suite.
- **Multi-agent** — `.agent/state.json` prepares `agent_id`/`task_id`/`locked` state tracking for multi-agent coordination.

### Quick Start

```bash
git clone https://github.com/Consciencieux/ai-agent-governance
# configure it with your preferred agent (see Supported Agents), then:
```

In your AI coding agent's chat session, run:

Claude Code:
> initialize project governance

opencode:
> initialize project governance

For an already-governed project, run a health check instead:

Claude Code:
> audit governance

opencode:
> audit governance

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

### How It Works

Two entry modes, auto-detected:

- **INIT** — new project: build the governance skeleton once.
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

Compatible with Claude Code, Cursor, Codex, opencode, and other AGENTS.md-compatible coding agents.

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

**AI Agent 治理** —— 面向可靠 AI 编码 Agent 的基础设施。

用于初始化、维护与审计软件项目治理的框架。基于 SKILL.md 的治理工作流实现，兼容任何读取 AGENTS.md 的 Agent。

### 为什么需要

AI 编码 Agent 能快速改代码，但缺乏长期项目记忆、归属边界与治理纪律。

本项目提供：

- **持久项目知识** — AGENTS.md、架构文档、Feature 登记、CHANGELOG
- **安全修改规则** — 代码修改/删除保护、Git 权限模型
- **验证门禁** — 治理缺失即失败的校验器
- **漂移检测** — 在治理腐化变成技术债之前发现

### 特性

- **单一事实源** — Skill 是初始化规范唯一源头；生成后的 AGENTS.md 是运行期唯一源头
- **反虚构** — Feature 登记只记录真实功能；空项目生成占位模板，绝不虚构功能或路径
- **防篡改** — 治理策略变更需说明原因 + 更新 CHANGELOG + 升版本 + 跑校验
- **成熟度适配** — 自动调整"创建/合并/审计"策略。L0 空仓库 · L1 早期开发 · L2 活跃项目 · L3 生产系统
- **结构适配** — `manifest.json` 声明实际路径，校验器按清单执行，尊重既有文档布局
- **可验证** — 校验器零外部 npm 依赖 + 测试套件
- **多 Agent 协作** — `.agent/state.json` 提供 `agent_id`/`task_id`/`locked` 状态跟踪，为多 Agent 协调做准备

### 快速开始

```bash
git clone https://github.com/Consciencieux/ai-agent-governance
# 配置到你的 Agent（见"支持的 Agent"），然后：
```

在你的 AI 编码 Agent 会话中运行：

Claude Code:
> initialize project governance

opencode:
> initialize project governance

已治理的项目，改用巡检：

Claude Code:
> audit governance

opencode:
> audit governance

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

### 工作原理

两种进入模式，自动判定：

- **INIT（初始化）** — 新项目：一次性搭好治理骨架。
  `Inspect → Build → Validate → Report`（基于真实证据，✅/⚠️/❌ 完成度核对表）。
- **运行期** — 日常任务在生成的框架内运行：生成的 Agent 模块校验治理完整性、跨崩溃断点续跑、检测漂移。
- **AUDIT（巡检）** — 随时对已治理项目做健康检查：读 manifest → 跑校验器 `--json` → 治理健康报告 → 最小补丁（不重建、不重构）。

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

兼容 Claude Code、Cursor、Codex、opencode 及其他兼容 AGENTS.md 的编码 Agent。

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
