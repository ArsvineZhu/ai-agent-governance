# Agent Operating Lifecycle

[English](#english) · [简体中文](#chinese)

---

## English

Every development task performed by any agent in a governed project MUST follow this six-phase lifecycle (summary lives in AGENTS.md; this is the full spec).

### The Six Phases

**Phase 1 — Understand.** Read AGENTS.md, docs/ARCHITECTURE.md, docs/features/ (list the directory to discover all features), and the recent CHANGELOG.md. Confirm: current system structure, existing features, relevant constraints, and the Modification Rules of affected feature docs.

**Phase 2 — Plan.** Medium/large changes MUST first create `docs/plans/TASK_<name>.md` with:

- Status (Active / Completed — Active on creation)
- Task Purpose
- Current Problem
- Proposed Solution
- Affected Files
- Risks
- Validation Method

Small changes (typo, single-function tweak) may skip planning but must state the reason in the report.

**Phase 3 — Implement.** Follow docs/ARCHITECTURE.md constraints; do not break existing features; do not change directory structure casually; keep backward compatibility; register new modules (New Code Registration).

**Phase 4 — Validate.** Run tests, lint, typecheck and build with the bare commands from AGENTS.md; record REAL output (never "should be fine").

**Phase 5 — Synchronize.** Update CHANGELOG.md (completed changes), the Feature Registry (docs/features/), Architecture docs if changed, check off the corresponding milestone in docs/plans/DEVELOPMENT_PLAN.md (if one exists), and set the completed TASK_<name>.md Status to Completed. Archiving happens at RELEASE, not here.

**Phase 6 — Report.** Final output: modified files, new features, deleted content, validation results, doc updates.

### Change Classification (when CHANGELOG is written)

| Change | CHANGELOG action |
| --- | --- |
| doc-only / comment / typo | no entry |
| bug fix | `Fixed` |
| new capability | `Added` |
| architecture / behavior / breaking | `Changed` |

### Maturity Levels (INIT strategy)

| Level | Judgement | Strategy |
| --- | --- | --- |
| L0 empty repo | README only / no source | full governance skeleton |
| L1 prototype | some source, no tests/CI/docs system | full skeleton + adopt existing files (merge, never overwrite) |
| L2 active | source + tests + partial CI/docs | incremental — only create missing items |
| L3 production | many files + existing conventions | audit mode — gap report + minimal patches only |

### Definition of Done

Code + tests + all quality gates + CHANGELOG + docs sync. Anything missing = not done.

### Forbidden

- Changing code without updating project knowledge
- Declaring completion before all six phases
- Faking or skipping validation output

---

## Chinese

被治理项目中任何 Agent 执行的每个开发任务都必须遵循六阶段生命周期（摘要见 AGENTS.md；本页为完整规范）。

### 六阶段

**阶段 1 —— Understand（理解）**。先读 AGENTS.md、docs/ARCHITECTURE.md、docs/features/（列目录发现全部功能）与最近的 CHANGELOG.md。确认：当前系统结构、已存在功能、相关约束、受影响 Feature 文档的 Modification Rules。

**阶段 2 —— Plan（计划）**。任何中大型修改必须先创建 `docs/plans/TASK_<name>.md`，包含：

- Status（Active / Completed —— 创建时为 Active）
- Task Purpose（任务目的）
- Current Problem（当前问题）
- Proposed Solution（提议方案）
- Affected Files（受影响文件）
- Risks（风险）
- Validation Method（验证方式）

小型改动（修 typo、单函数微调）可跳过本阶段，但必须在报告里说明跳过理由。

**阶段 3 —— Implement（实现）**。遵循 docs/ARCHITECTURE.md 约束；不破坏已有功能；不随意改变目录结构；保持向后兼容；新增模块必须登记（New Code Registration）。

**阶段 4 —— Validate（验证）**。用 AGENTS.md 的裸命令跑测试、静态检查、类型检查与构建，记录**真实输出**（不是"应该没问题"）。

**阶段 5 —— Synchronize（同步知识）**。更新 CHANGELOG.md（已完成变更）、Feature 登记（docs/features/）、架构文档（如有变化），勾选 `docs/plans/DEVELOPMENT_PLAN.md` 中对应里程碑（如存在），并把已完成 `TASK_<name>.md` 的 `## Status` 更新为 `Completed`。归档在发布（RELEASE）时统一执行，不在本阶段。

**阶段 6 —— Report（报告）**。最终输出：修改文件列表、新增功能列表、删除内容列表、验证结果、文档更新情况。

### 变更分类（何时写 CHANGELOG）

| 变更类型 | CHANGELOG 动作 |
| --- | --- |
| 仅文档/注释/typo | 不更新 |
| Bug 修复 | `Fixed` |
| 新能力 | `Added` |
| 架构/行为/破坏性变更 | `Changed` |

### 成熟度等级（INIT 策略）

| 等级 | 判定 | 策略 |
| --- | --- | --- |
| L0 空仓库 | 只有 README/无源码 | 创建完整治理骨架 |
| L1 原型 | 有少量源码，无测试/CI/文档体系 | 完整骨架 + 接管现有文件（合并不覆盖） |
| L2 活跃开发 | 有源码 + 测试 + 部分 CI/文档 | 增量补齐缺口，只创建缺失项 |
| L3 生产项目 | 大量文件 + 已有规范 | 审计模式：差距报告 + 最小补丁 |

### Definition of Done

代码 + 测试 + 全部质量门禁 + CHANGELOG + 文档同步，缺一不算完成。

### 禁止

- 只修改代码，不更新项目知识
- 未走完 6 阶段就宣称完成
- 伪造/跳过验证输出