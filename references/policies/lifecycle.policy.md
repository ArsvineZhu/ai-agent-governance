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
- **Status**：Active / Completed（创建时为 Active）
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

完成后必须按标准验证序列执行并记录**真实输出**（不是"应该没问题"）。命令按 AGENTS.md 的 Development Commands 裸命令运行，输出摘录进任务报告。

**标准验证序列（按序执行）：**

1. **锁检查**（多 Agent 场景）—— `node scripts/check-lock.js`，exit 1 = 其他 Agent 持锁，等待或协调
2. **Git 策略门禁** —— `node scripts/check-git-policy.js`（受保护分支 + `directPush=false` → exit 1，先建分支）
3. **密钥扫描门禁** —— `node scripts/check-secrets.js`（暂存区密钥类内容 → exit 1，绝不打印密钥）
4. **治理校验器** —— `node scripts/verify-governance.js`（治理工件缺失 → exit 1）
5. **项目自身验证** —— 测试、静态检查、构建（按 AGENTS.md Development Commands）
6. **建议层（exit 0，仅报告，不阻断）** —— `node scripts/check-doc-freshness.js`（过时文档）与 `node scripts/check-doc-consistency.js`（文档间矛盾）；结果可写入 `.governance/drift-report.json`

**规则**：第 1-5 项为**门禁层**，任何一项 exit ≠ 0 即任务未完成，不得宣称完成；第 6 项仅产出报告，稳定项目允许显示过时/矛盾而不阻塞。门禁层全部通过 + 记录真实输出，才进入 Phase 5。

## Phase 5 — Synchronize Knowledge（同步知识）

完成后必须：
- 更新 CHANGELOG.md（已完成变更，[Unreleased]）
- 更新 Feature Registry（docs/features/，如涉及功能）
- 更新 Architecture Documentation（如架构变化）
- 更新 `docs/plans/DEVELOPMENT_PLAN.md`：勾选对应里程碑、更新状态标记与验收结果（如存在对应里程碑）；归档在发布（RELEASE）时统一执行（见发布流程）
- 已完成任务的 `TASK_<name>.md`：把文档顶部 `## Status` 更新为 `Completed` 并附完成日期；归档仍在发布（RELEASE）时统一执行
- **归档不翻译** —— 归档的计划（`docs/plans/archive/`）与 ADR 决策史保持项目约定语言原样，绝不翻译（见 SKILL.md 语言政策·历史记录不翻译）

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
