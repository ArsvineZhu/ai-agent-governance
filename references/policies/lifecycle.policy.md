# Agent Operating Lifecycle（规则详解）

AGENTS.md 只保留生命周期摘要，本文件是完整执行规范。所有 AI Agent 执行任何开发任务时必须遵循。

## 规模分级（按规则判定，不由 AI 自判）

| 规模 | 判定 | 流程 |
| --- | --- | --- |
| **小** | 单文件改动、<50 行、无公共接口/API/数据结构变更、纯文档/typo/格式 | 简化路径：Understand → Implement → Validate → Report（跳过 Plan 与 Synchronize；机械检查兜底） |
| **中** | 多文件、涉及功能/模块/规则变更，但不破坏公共接口 | 完整六阶段 + TASK 计划 |
| **大** | 公共接口/API/数据结构变更、跨模块重构、架构变化 | 完整六阶段 + TASK 计划 + 审查（review-manager，见 plans/review-manager.md） |

判定顺序：先看"是否破坏公共接口/API/数据结构"→ 再看"是否跨模块/涉及功能"→ 最后看改动量。边界模糊时**取更高级别**（宁完整不省略）。

## Phase 1 — Understand（理解）

开始前必须读取：
- AGENTS.md
- docs/ARCHITECTURE.md
- docs/features/（列目录发现全部功能）
- 最近 CHANGELOG.md

确认：当前系统结构、已存在功能、相关约束、相关 Feature 文档的 Modification Rules。

## Phase 2 — Plan（计划）

**中/大型**修改必须先创建 `docs/plans/TASK_<name>.md`，必须包含：
- **Status**：Active / Completed（创建时为 Active）
- **Task Purpose**：任务目的
- **Current Problem**：当前问题
- **Proposed Solution**：提议方案
- **Affected Files**：受影响文件（**基于引用搜索**——改公开接口/模块前先 `rg` 搜引用，搜到的引用文件必须入列；禁止凭印象列影响面）
- **Risks**：风险
- **Validation Method**：验证方式

**小型**改动（见"规模分级"）跳过本阶段，直接进入 Implement；报告中一句话说明规模判定即可，无需逐条理由。

## Phase 3 — Implement（实现）

- 遵循架构约束（docs/ARCHITECTURE.md）
- 不破坏已有功能
- 不随意改变目录结构
- 保持向后兼容
- 新增代码必须同步登记（见 New Code Registration）
- **引用搜索（改前必做）** —— 修改任何公开接口/函数/模块/文件**之前**（不仅是删除），先搜索谁引用它（`rg "<名称>"` 全仓 + 配置/动态调用/插件机制），引用到的文件**自动加入** Affected Files 清单；搜索不到的引用（如配置文件里按名字加载的模块）在报告中说明。影响面是**搜出来的，不是想出来的**。

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

**中/大型**改动完成后必须同步（**小型改动跳过本阶段**，见规模分级与 Change Classification）：

- **同步组对照（必做）** —— 读取 `.governance/sync-rules.json`（项目同步组声明），逐组对照本次实际改动：
  - watch 命中且 require 未更新 → ❌ 漏同步，补齐后才算完成
  - watch 未命中 → ⚠️ not-applicable（无同步义务），报告中标注即可
  - 逐组报告 ✅ 已同步 / ⚠️ 不适用（见 `references/templates/sync-rules.template.md` 生成规则）
- 更新 CHANGELOG.md（已完成变更，[Unreleased]；时机按 Change Classification 的更新时机规则）
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

**更新时机（主流做法：发布/合并前汇总，而非每个任务实时写）**：

- 小型改动：不写 CHANGELOG（发布时由 release 流程汇总）
- 中/大型改动：**任务完成时先在 [Unreleased] 记录**（这是合并前的一次性写入，不是每个任务强制）；或推迟到合并/发布前统一汇总
- 同一次发布的多项小改动：在发布前置检查（`changelog.required`）时由 Agent 汇总写入
- 判断标准：**CHANGELOG 反映的是"合并/发布边界"的变更，不是"每个 commit"的变更**

## Phase 6 — Report（报告）

最终输出：修改文件列表、新增功能列表、删除内容列表、验证结果、文档更新情况。

**影响面对照（必做）** —— 把实际改动文件（`git diff --name-only`）与任务开始时的 Affected Files 清单逐条对照：

- 清单里有但实际没改 → ❌ **漏文件**，补改或逐条说明不动的理由
- 实际改了但清单里没有 → ⚠️ **未预判改动**，说明原因（新发现的必要改动 / 偷懒的顺手改）
- 对照结果写入任务报告，逐条 ✅/❌/⚠️

## 禁止

- 只修改代码，不更新项目知识
- 未走完 6 阶段就宣称完成
- 伪造/跳过验证输出
