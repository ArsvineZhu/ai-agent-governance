# AI Agent Governance

> Treat AI agent behavior as repository infrastructure.  
> 将 AI Agent 行为作为仓库基础设施进行版本控制和生命周期管理。

[![CI](https://github.com/Consciencieux/ai-agent-governance/actions/workflows/ci.yml/badge.svg)](https://github.com/Consciencieux/ai-agent-governance/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Consciencieux/ai-agent-governance)](https://github.com/Consciencieux/ai-agent-governance/releases)

[English](#english) · [简体中文](#chinese)

---

## English

**One command bootstraps a complete AI coding agent environment for your repository — AGENTS.md, rules, feature registry, CI and validator — then keeps it validated and maintained for the whole project lifecycle.**

### Why?

AI coding agents can generate and modify code quickly, but they do not automatically inherit a project's engineering context, architectural constraints, or long-term maintenance mechanisms.

Every new project still requires developers to set up by hand:

- AGENTS.md
- CHANGELOG.md
- Architecture docs
- Feature registry
- Coding rules
- Git workflow
- CI checks
- Security baseline

These rules usually live only in documentation or chat context — and decay with time, team and agent turnover.

This project turns these capabilities into repository-level infrastructure: it bootstraps the governance system on day one and continuously validates, maintains and prevents drift across the whole project lifecycle.

### The Solution

The generated artifacts are repository infrastructure, not static templates — tracked like code (`manifest.json` desired state · `state.json` current state · `validation.json` observed state) and validated continuously by drift detection, validation gates, anti-regression and release lifecycle.

**Initialize first, govern continuously.**

| Existing approach | Limitation |
| --- | --- |
| Prompt packs (CLAUDE.md) | instruction only — no validation, no lifecycle |
| AGENTS.md templates | static bootstrap — no maintenance |
| CI rules | code only |
| Enterprise AI governance | outside the repository |
| **AI Agent Governance** | **one-command bootstrap + lifecycle validation + drift prevention, as repo infrastructure** |

### Install

This is an AI agent skill, not a CLI — install it where your coding agent discovers skills:

```
.agents/skills/ai-agent-governance/SKILL.md
```

```bash
git clone https://github.com/Consciencieux/ai-agent-governance
# copy or symlink the ai-agent-governance skill directory
# into your agent skill location
```

The skill is discovered through each agent's native skill/rule discovery mechanism. Agent-specific install paths (`.claude/skills`, `.opencode/skills`, ...): [docs/skill-discovery.md](docs/skill-discovery.md)

### Quick Start

**This is a chat prompt, not a shell command.** In your AI coding agent chat, ask:

```text
initialize project governance
```

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
├── CLAUDE.md
├── CHANGELOG.md
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── plans/
│   ├── features/
│   └── rules/
├── .env.example
├── .governance/
├── scripts/
└── .github/workflows/
```

One prompt — your project now has a complete governance environment, ready for any AGENTS.md-compatible agent. See the full generated file set: [docs/bootstrap-output.md](docs/bootstrap-output.md).

All available prompts (audit, release, drift check, ...) and what they do: [docs/commands.md](docs/commands.md).

### Core Capabilities

#### Bootstrap & Runtime Governance

- **Governance bootstrap** — one INIT builds the skeleton: repository inspection → rules → AGENTS.md → feature registry → CI → validator → state
- **Runtime governance** — the generated AGENTS.md + per-tool adapters govern every session; multi-language CI with format baselines (Node/TS, Python, Rust, Go, Java, C++)
- **Structural adaptivity** — maturity-adaptive strategy (L0 empty repo → L3 production), merge-only, no forced migration

#### Drift Detection & Validation

- **Drift detection** — `drift-check` compares manifest against reality and reports governance decay
- **Validation gates** — a zero-dependency validator fails CI when governance artifacts are missing

#### Anti-Regression

Unlike static rule files, AI Agent Governance continuously protects project knowledge from drift:

- **Lifecycle enforcement** — every change follows Understand → Plan → Implement → Validate → Synchronize → Report
- **Protected governance** — governance files cannot be weakened silently (reason → CHANGELOG → version bump → validator run)
- **Evidence-based reporting** — status is based on real validation output, never fabricated

Full mechanisms (permission matrix, deletion protection, rule priority, multi-agent locking): [docs/anti-regression.md](docs/anti-regression.md)

#### Git Workflow Governance

Guards the place where an agent can do the most irreversible damage — Git operations:

- **Protected branches** — `.governance/git-policy.json` blocks direct pushes to `main`/`master` (`directPush: false`, `allowForcePush: false`)
- **Branch-based development** — agents check the policy, create `feature/agent-<date>-<summary>`, and merge via PR with human approval
- **Controlled rollback** — revert/reset/restore stay the tools, governed by confirmation gates

#### Release Lifecycle

Releases run as a human-in-the-loop flow — **the AI proposes, the developer approves**:

```
Analyze changes → Generate SemVer proposal → Developer approval → Create tag → GitHub Release
```

- **Analyze** — `release-manager` inspects git history and change classifications (SemVer 2.0.0), produces a Release Proposal (current / recommended / release type / reasons / Release Notes) — read-only
- **Approve** — explicit developer confirmation before any write operation; uncertainty (Potential Breaking Change) pauses the flow and requests clarification
- **Execute** — after approval: annotated tag → push → GitHub Release, with synchronized versions. Spec: [references/workflows/release.md](references/workflows/release.md)

### Supported Agents

Claude Code · Cursor · Codex · opencode — and other AGENTS.md-based agents. The core is tool-neutral; compatibility comes from per-tool adapters (CLAUDE.md, .cursor/rules, copilot-instructions.md, opencode.json).

### Documentation

- [docs/skill-discovery.md](docs/skill-discovery.md) — how agents discover and trigger the skill
- [docs/commands.md](docs/commands.md) — user-facing prompts + runtime components
- [docs/bootstrap-output.md](docs/bootstrap-output.md) — complete annotated initialization output
- [docs/governance-model.md](docs/governance-model.md) — the Spec / Status / Health state model
- [docs/architecture.md](docs/architecture.md) — concept map, operating modes, lifecycle pipeline, repository layout, design principles
- [docs/anti-regression.md](docs/anti-regression.md) — anti-regression mechanisms in full
- [docs/lifecycle.md](docs/lifecycle.md) — the 6-phase agent operating lifecycle
- [docs/validator.md](docs/validator.md) — validator usage and checks
- [docs/design-decisions/](docs/design-decisions/) — architecture decision records
- [docs/roadmap.md](docs/roadmap.md) — planned features and status
- [CONTRIBUTING.md](CONTRIBUTING.md) — development guide
- [CHANGELOG.md](CHANGELOG.md) — release history

### Roadmap

- [x] AGENTS.md governance bootstrap
- [x] Feature registry
- [x] Governance validator
- [x] Release workflow
- [x] Multi-language CI templates
- [x] Multi-agent lock enforcement
- [x] Validator content checks
- [x] Git workflow governance
- [ ] Skill lifecycle management *(near-term, v0.5.0)*
- [ ] Agent activity audit *(near-term, v0.6.0)*
- [ ] Secret scanning gate *(near-term, v0.6.0)*
- [ ] Knowledge freshness detection *(mid-term, v0.7.0)*
- [ ] Governance score & badge *(mid-term, v0.7.0)*
- [ ] INIT scripted generator *(mid-term, v0.8.0)*
- [ ] Multi-agent coordination protocol *(long-term)*
- [ ] Remote governance dashboard *(long-term)*
- [ ] Monorepo multi-governance domains *(long-term)*
- [ ] Demo repository *(very long-term)*
- [ ] Ecosystem polish: IDE extension + Cursor compatibility testing *(very long-term)*

Status details and design docs: [docs/roadmap.md](docs/roadmap.md)

### License

[MIT](LICENSE) © 2026 Consciencieux

---

## Chinese

**一条命令为你的仓库搭建完整的 AI 编码 Agent 工程环境 —— AGENTS.md、规则、Feature 登记、CI 与校验器 —— 并在整个项目生命周期中持续校验与维护。**

### 为什么需要

AI 编码 Agent 能快速生成和修改代码，但它不会自动拥有项目的工程上下文、架构约束和长期维护机制。

每个新项目开始时，开发者仍然需要手动建立：

- AGENTS.md
- CHANGELOG.md
- 架构文档
- Feature 登记
- 编码规范
- Git 工作流
- CI 检查
- 安全基线

这些规则通常只存在于文档或聊天上下文中，容易随着时间、人员和 Agent 更替而失效。

本 Skill 将这些治理能力转化为仓库级基础设施：第一天自动搭建治理体系，并在项目整个生命周期中持续验证、维护和防止漂移。

### 解决方案

生成的产物是仓库基础设施，而非静态模板 —— 像代码一样被跟踪（`manifest.json` 期望态 · `state.json` 当前态 · `validation.json` 观测态），并由漂移检测、验证门禁、防乱改与发布生命周期持续校验。

**先初始化，再持续治理（Initialize first, govern continuously）。**

| 现有方案 | 局限 |
| --- | --- |
| Prompt 包（CLAUDE.md） | 仅指令 —— 无校验、无生命周期 |
| AGENTS.md 模板 | 一次性静态引导 —— 无人维护 |
| CI 规则 | 只管代码 |
| 企业级 AI 治理 | 在仓库之外 |
| **AI Agent Governance** | **一键引导 + 生命周期校验 + 漂移防护，作为仓库基础设施** |

### 安装

这是 AI Agent skill，不是 CLI —— 把它放到你的编码 Agent 能发现 skill 的位置：

```
.agents/skills/ai-agent-governance/SKILL.md
```

```bash
git clone https://github.com/Consciencieux/ai-agent-governance
# 将 ai-agent-governance skill 目录复制或软链到你的 Agent skill 位置
```

skill 通过各 Agent 原生的 skill/rule discovery 机制被发现。按 Agent 的安装路径（`.claude/skills`、`.opencode/skills` 等）：[docs/skill-discovery.md](docs/skill-discovery.md)

### 快速开始

**这是聊天提示语（chat prompt），不是 shell 命令。** 在你的 AI 编码 Agent 聊天窗口里说：

```text
initialize project governance
```

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
├── CLAUDE.md
├── CHANGELOG.md
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── plans/
│   ├── features/
│   └── rules/
├── .env.example
├── .governance/
├── scripts/
└── .github/workflows/
```

一句话 —— 你的项目就拥有完整治理环境，任何兼容 AGENTS.md 的 Agent 都能直接使用。完整生成文件集见 [docs/bootstrap-output.md](docs/bootstrap-output.md)。

全部可用提示词（巡检、发布、漂移检查等）及其行为：[docs/commands.md](docs/commands.md)。

### 核心能力（Core Capabilities）

#### 引导与运行期治理（Bootstrap & Runtime Governance）

- **治理引导（Governance bootstrap）** — 一次 INIT 搭好骨架：仓库检测 → 规则 → AGENTS.md → Feature 登记 → CI → 校验器 → 状态
- **运行期治理（Runtime governance）** — 生成的 AGENTS.md + 按工具生成的适配层约束每个会话；多语言 CI + 格式基线（Node/TS、Python、Rust、Go、Java、C++）
- **结构适配（Structural adaptivity）** — 成熟度自适应策略（L0 空仓库 → L3 生产），只合并不迁移

#### 漂移检测与验证（Drift Detection & Validation）

- **漂移检测（Drift detection）** — `drift-check` 将 manifest 与现实比对，报告治理腐化
- **验证门禁（Validation gates）** — 零依赖校验器在治理工件缺失时让 CI 失败

#### 防乱改（Anti-Regression）

与静态规则文件不同，AI Agent Governance 持续保护项目知识不漂移，让后续使用的 Agent 或开发者不会破坏已有治理成果：

- **生命周期强制** — 每次变更都遵循 Understand → Plan → Implement → Validate → Synchronize → Report
- **受保护治理** — 治理文件无法被静默削弱（说明原因 → CHANGELOG → 升版本 → 跑校验器）
- **基于证据的报告** — 状态基于真实校验输出，绝不伪造

完整机制（权限矩阵、删除保护、规则优先级、多 Agent 锁）：[docs/anti-regression.md](docs/anti-regression.md)

#### Git 工作流治理（Git Workflow Governance）

守卫 Agent 最易造成不可逆损害的地方 —— Git 操作：

- **受保护分支** —— `.governance/git-policy.json` 阻止直推 `main`/`master`（`directPush: false`、`allowForcePush: false`）
- **分支开发** —— Agent 检查策略、创建 `feature/agent-<日期>-<摘要>`、经 PR 人工批准后合入
- **受控回滚** —— revert/reset/restore 仍是工具，由确认门禁治理

#### 发布生命周期（Release Lifecycle）

发布走 Human-in-the-loop 流程 —— **AI 提议，人确认**：

```
分析变更 → 生成 SemVer Proposal → 开发者批准 → 创建 tag → GitHub Release
```

- **分析** — `release-manager` 检查 git 历史与变更分类（SemVer 2.0.0），产出 Release Proposal（当前版本 / 推荐版本 / 发布类型 / 理由 / Release Notes）—— 只读
- **批准** — 任何写操作前开发者必须明确确认；不确定性（Potential Breaking Change）暂停流程并请求澄清
- **执行** — 批准后执行：annotated tag → push → GitHub Release，版本一致（synchronized versions）。规范：[references/workflows/release.md](references/workflows/release.md)

### 支持的 Agent

Claude Code · Cursor · Codex · opencode —— 以及其他基于 AGENTS.md 的 Agent。内核与工具无关；兼容性来自按工具生成的适配层（CLAUDE.md、.cursor/rules、copilot-instructions.md、opencode.json）。

### 文档

- [docs/skill-discovery.md](docs/skill-discovery.md) — Agent 如何发现并触发 skill
- [docs/commands.md](docs/commands.md) — 用户提示词 + 运行时组件
- [docs/bootstrap-output.md](docs/bootstrap-output.md) — 完整带注释的初始化产物
- [docs/governance-model.md](docs/governance-model.md) — Spec / Status / Health 状态模型
- [docs/architecture.md](docs/architecture.md) — 概念图、运行模式、生命周期管线、仓库布局、设计原则
- [docs/anti-regression.md](docs/anti-regression.md) — 防乱改机制完整明细
- [docs/lifecycle.md](docs/lifecycle.md) — Agent 六阶段操作生命周期
- [docs/validator.md](docs/validator.md) — 校验器用法与检查项
- [docs/design-decisions/](docs/design-decisions/) — 架构决策记录（ADR）
- [docs/roadmap.md](docs/roadmap.md) — 待开发功能与状态
- [CONTRIBUTING.md](CONTRIBUTING.md) — 开发指南
- [CHANGELOG.md](CHANGELOG.md) — 发布历史

### Roadmap

- [x] AGENTS.md 治理引导
- [x] Feature 登记
- [x] 治理校验器
- [x] 发布工作流
- [x] 多语言 CI 模板
- [x] 多 Agent 锁强制
- [x] 校验器内容检查
- [x] Git 工作流治理
- [ ] Skill 生命周期管理（*近期，v0.5.0*）
- [ ] Agent 行为审计（*近期，v0.6.0*）
- [ ] 密钥扫描门禁（*近期，v0.6.0*）
- [ ] 知识新鲜度检测（*中期，v0.7.0*）
- [ ] 治理健康分与徽章（*中期，v0.7.0*）
- [ ] INIT 生成器脚本化（*中期，v0.8.0*）
- [ ] 多 Agent 协调协议（*远期*）
- [ ] 远程治理看板（*远期*）
- [ ] monorepo 多治理域（*远期*）
- [ ] demo 示例仓库（*超远期*）
- [ ] 生态完善：IDE 扩展 + Cursor 兼容实测（*超远期*）

状态详情与设计文档：[docs/roadmap.md](docs/roadmap.md)

### License

[MIT](LICENSE) © 2026 Consciencieux