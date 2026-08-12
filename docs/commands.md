# Commands

[English](#english) · [简体中文](#chinese)

---

## English

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
| drift-check | `check governance drift` · `governance health report` · `is governance intact` | compares manifest against reality, reports drift |
| governance-validator | `governance check` · `verify governance` · `validate AGENTS` | runs the validator, records `validation.json` |
| ci-generator | `setup CI` · `add CI` · `create workflow` | generates the CI pipeline for the detected stack |
| repository-inspection | `inspect the repo` · `what is the stack` · `check environment` | inspects the environment, returns the stack report |
| state-manager | `update state` · `record progress` | persists progress into `.governance/state.json` |
| plan-manager | `plan this task` · `create task plan` · `update development plan` · `check off milestone` · `mark task completed` | creates TASK plans, checks off milestones, marks tasks completed |
| release-manager | `release` · `publish version` · `/release vX.Y.Z` | executes the approval-gated release flow |

### Execution Rules

Any prompt with an uncertain outcome (e.g. a release with an unclear breaking change) pauses and asks for clarification — never a silent guess.

---

## Chinese

以下全部是**给 AI 编码 Agent 的聊天提示语 —— 不是 shell 命令**。它们遵循治理生命周期：**初始化 → 开发 → 持续维护 → 发布**。

### 可用提示词

| 使用场景 | 提示词 | 别名 |
| --- | --- | --- |
| 新仓库 / 首次接入 | `initialize project governance` | `initialize governance` · `setup project for AI agents` · `create AGENTS.md framework` |
| 开发任务写计划 | `plan this task` | `create task plan` · `update development plan` · `check off milestone` · `mark task completed` |
| 已有治理仓库的持续维护 | `audit governance` | `governance health check` · `fix governance drift` |
| 准备发布版本 | `release` | `publish version` · `create release` · `/release vX.Y.Z` |

Git 工作流治理没有独立提示词 —— 它作为运行期规则自动生效：任务开始前自动运行 `scripts/check-git-policy.js`，在受保护分支上阻止直接提交/推送（见 `.governance/git-policy.json`）。同理 `push` / `merge` 也不是提示词 —— 它们是需确认的写操作：Agent 会说明意图并等待你的明确批准（见 `docs/rules/git-policy.md`）。

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

#### plan this task

在中大型修改前创建开发计划（TASK 文档：Status、目的、问题、方案、受影响文件、风险、验证）。

执行流程：

```
创建 docs/plans/TASK_<name>.md
→ 与开发者确认
→ 开始实现
```

完成后同一计划器会勾选里程碑并把任务标记为 Completed。

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

| 组件 | 提示词 | 职责 |
| --- | --- | --- |
| drift-check | `check governance drift` · `governance health report` · `is governance intact` | 将 manifest 与现实比对，报告漂移 |
| governance-validator | `governance check` · `verify governance` · `validate AGENTS` | 运行校验器，记录 `validation.json` |
| ci-generator | `setup CI` · `add CI` · `create workflow` | 为检测到的技术栈生成 CI 管线 |
| repository-inspection | `inspect the repo` · `what is the stack` · `check environment` | 检测环境，返回技术栈报告 |
| state-manager | `update state` · `record progress` | 把进度持久化到 `.governance/state.json` |
| plan-manager | `plan this task` · `create task plan` · `update development plan` · `check off milestone` · `mark task completed` | 创建 TASK 计划、勾选里程碑、标记任务完成 |
| release-manager | `release` · `publish version` · `/release vX.Y.Z` | 执行带审批门禁的发布流程 |

### 执行规则

任何结果不确定的提示词（如发布时 Breaking Change 判断不清）都会暂停并请求澄清 —— 绝不静默猜测。