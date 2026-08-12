# Commands

[English](#english) · [简体中文](#chinese)

---

## English

All prompts below are chat prompts for AI coding agents, not shell commands. They follow the governance lifecycle: **Initialize → Maintain → Release**.

### Available Prompts

| Scenario | Prompt | Aliases |
| --- | --- | --- |
| New repository / first-time setup | `initialize project governance` | `initialize governance` · `setup project for AI agents` · `create AGENTS.md framework` |
| Existing governed repository maintenance | `audit governance` | `governance health check` · `fix governance drift` |
| Preparing a release | `release` | `publish version` · `create release` · `/release vX.Y.Z` |

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

| Component | Responsibility |
| --- | --- |
| drift-check | compares manifest against reality, reports drift |
| governance-validator | runs the validator, records `validation.json` |
| ci-generator | generates the CI pipeline for the detected stack |
| repository-inspection | inspects the environment, returns the stack report |
| state-manager | persists progress into `.governance/state.json` |
| release-manager | executes the approval-gated release flow |

### Execution Rules

Any prompt with an uncertain outcome (e.g. a release with an unclear breaking change) pauses and asks for clarification — never a silent guess.

---

## Chinese

以下全部是**给 AI 编码 Agent 的聊天提示语 —— 不是 shell 命令**。它们遵循治理生命周期：**初始化 → 持续维护 → 发布**。

### 可用提示词

| 使用场景 | 提示词 | 别名 |
| --- | --- | --- |
| 新仓库 / 首次接入 | `initialize project governance` | `initialize governance` · `setup project for AI agents` · `create AGENTS.md framework` |
| 已有治理仓库的持续维护 | `audit governance` | `governance health check` · `fix governance drift` |
| 准备发布版本 | `release` | `publish version` · `create release` · `/release vX.Y.Z` |

### 提示词详情

#### initialize project governance

为仓库引导（bootstrap）初始 AI Agent 治理地基（AGENTS.md、规则、Feature 登记、治理状态、校验系统、CI）。

执行流程：

```
仓库检测
→ 生成治理地基
→ 创建治理状态
→ 配置 Agent 规则
→ 创建校验系统
→ 配置 CI
→ 报告
```

详细输出（完整带注释目录树）：[bootstrap-output.md](bootstrap-output.md)

#### audit governance

持续维护治理健康：检测漂移并保持项目知识同步。

执行流程：

```
读取当前状态
→ 检测漂移
→ 校验工件
→ 应用最小补丁
```

#### release

通过人工批准创建版本发布。

执行流程：

```
分析变更
→ SemVer Proposal
→ 批准
→ tag
→ GitHub Release
```

### 运行时组件

这些组件由生命周期提示词自动触发，用户通常只需要使用上面的生命周期提示词。

| 组件 | 职责 |
| --- | --- |
| drift-check | 将 manifest 与现实比对，报告漂移 |
| governance-validator | 运行校验器，记录 `validation.json` |
| ci-generator | 为检测到的技术栈生成 CI 管线 |
| repository-inspection | 检测环境，返回技术栈报告 |
| state-manager | 把进度持久化到 `.governance/state.json` |
| release-manager | 执行带审批门禁的发布流程 |

### 执行规则

任何结果不确定的提示词（如发布时 Breaking Change 判断不清）都会暂停并请求澄清 —— 绝不静默猜测。