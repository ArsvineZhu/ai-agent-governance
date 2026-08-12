# Agent Operating Lifecycle（规则详解）

AGENTS.md 只保留生命周期摘要，本文件是完整执行规范。所有 AI Agent 执行任何开发任务时必须遵循。

## Phase 1 — Understand（理解）

开始前必须读取：
- AGENTS.md
- docs/ARCHITECTURE.md
- docs/features/（列目录发现全部功能）
- 最近 CHANGELOG.md

确认：当前系统结构、已存在功能、相关约束、相关 Feature 文档的 Modification Rules。

## Phase 2 — Plan（计划）

任何中大型修改必须先创建 `docs/plans/TASK_<name>.md`，必须包含：
- **Task Purpose**：任务目的
- **Current Problem**：当前问题
- **Proposed Solution**：提议方案
- **Affected Files**：受影响文件
- **Risks**：风险
- **Validation Method**：验证方式

小型改动（修 typo、单函数微调）可跳过本阶段，但必须在报告里说明跳过理由。

## Phase 3 — Implement（实现）

- 遵循架构约束（docs/ARCHITECTURE.md）
- 不破坏已有功能
- 不随意改变目录结构
- 保持向后兼容
- 新增代码必须同步登记（见 New Code Registration）

## Phase 4 — Validate（验证）

完成后必须执行：测试、静态检查、构建，并记录**真实输出**（不是"应该没问题"）。
命令按 AGENTS.md 的 Development Commands 裸命令运行，输出摘录进任务报告。

## Phase 5 — Synchronize Knowledge（同步知识）

完成后必须：
- 更新 CHANGELOG.md（已完成变更，[Unreleased]）
- 更新 Feature Registry（docs/features/，如涉及功能）
- 更新 Architecture Documentation（如架构变化）
- 更新 `docs/plans/DEVELOPMENT_PLAN.md`：勾选对应里程碑、更新状态标记与验收结果（如存在对应里程碑）

**Change Classification（CHANGELOG 何时写）**：

| 变更类型 | CHANGELOG 动作 |
| --- | --- |
| 仅文档/注释/typo | 不更新 |
| Bug 修复 | `Fixed` |
| 新能力 | `Added` |
| 架构/行为/破坏性变更 | `Changed` |

## Phase 6 — Report（报告）

最终输出：修改文件列表、新增功能列表、删除内容列表、验证结果、文档更新情况。

## 禁止

- 只修改代码，不更新项目知识
- 未走完 6 阶段就宣称完成
- 伪造/跳过验证输出
