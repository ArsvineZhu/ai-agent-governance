# Roadmap

[English](../en/roadmap.md) · [简体中文](roadmap.md) · [繁體中文](../zh-TW/roadmap.md)

时间尺度：**已完成** / **近期** / **中期** / **远期**

### 已完成

- AGENTS.md 治理引导
- Feature 登记
- 治理校验器
- 发布工作流
- 多语言 CI 模板
- 多 Agent 锁强制 —— `scripts/check-lock.js`（只读锁检查；INIT 复制、校验器必查）
- 校验器内容检查 —— CHANGELOG 格式 + manifest `artifacts[].kind` 有效性
- Git 工作流治理 —— `.governance/git-policy.json` + `scripts/check-git-policy.js`（受保护分支、分支开发、禁止直推）
- Agent 行为审计 —— 追加式 .governance/activity.jsonl 逐任务审计轨迹 + drift-check `activity-report` 模式
- 密钥扫描门禁 —— scripts/check-secrets.js 阻止暂存区密钥类内容（校验器 20 项）

### 近期（v0.7.0）

- **知识新鲜度检测** —— drift-check `freshness` 模式：经 `git log` 提交日期标记过时治理文档（建议性，绝不做门禁）。目标版本：v0.7.0。设计：[plans/knowledge-freshness.md](plans/knowledge-freshness.md)
- **内容一致性检查** —— drift-check `consistency` 模式：标记文档间交叉矛盾（版本示例滞后、受保护清单分裂、ADR 状态过期、roadmap 目标过期、链接失效、数值声明错误）。目标版本：v0.7.0。设计：[plans/content-consistency.md](plans/content-consistency.md)
- **治理健康分与徽章** —— 校验器 `--json` 输出综合 `score`；CI 产出 shields.io 徽章 endpoint；本仓库率先启用作参考实现。目标版本：v0.7.0。设计：[plans/governance-score.md](plans/governance-score.md)
- **INIT 生成器脚本化** —— 确定性、可快照测试的 INIT 生成（`scripts/generate-governance.js`）；分 A → B → C 三期。目标版本：v0.7.0。设计：[plans/init-scripted-generator.md](plans/init-scripted-generator.md)

### 中期（v0.8.0+）

- **多 Agent 协调协议** —— 并发 Agent 之间的标准化协调（锁检查已交付；完整协议待真实多 Agent 使用场景）
- **远程治理看板** —— 被治理仓库的可观测性（依赖近期/中期的审计轨迹 + 健康分）
- **Skill 生命周期管理** —— 独立 [`ai-skill-manager`](https://github.com/Consciencieux/ai-skill-manager) skill（管理 .agents/skills/ 下所有 skill 的 INSTALL → UPDATE → ROLLBACK，含本 skill）。自 v0.6.0 顺延；当 v0.5.2 的版本同步步骤证明不够用时再重启。设计：[plans/skill-lifecycle-management.md](plans/skill-lifecycle-management.md)
- **monorepo 多治理域** —— 校验器多根解析 + 多 manifest（出现真实 monorepo 需求时再做）

### 远期

- **demo 示例仓库** —— 展示治理产物实际效果的真实示例项目（远期；在此之前本仓库仅作为*轻量治理*参考：发布流程 + plans/archive + ADR + 测试，**不是**完整的被治理软件项目——其 validator 默认模式必然失败属设计使然）
- **生态完善** —— IDE 扩展（治理感知的编辑器集成；真实用户需求出现时触发）+ Cursor 兼容实测（验证文档声明的 `.cursor/rules` 兼容性；机制变化或问题报告时触发）

说明：未实现功能的设计计划在各语言树的 `plans/`（如 `skill-lifecycle-management.md`）；已完成的 TASK 计划在发布时归档到 `docs/archive/`。被治理项目自身的开发计划由 INIT 生成在 `docs/plans/DEVELOPMENT_PLAN.md`。

**维护规则（每次发布滚动重排）：**

1. **完成时** —— 移到「已完成」，勾 `[x]`，去掉时间括号与版本目标（已完成项不带时间尺度）。其设计文档归档到 `docs/archive/`（共享区，单语）。
2. **时间尺度是相对的** —— 移出已完成项后，剩余项整体前移：中期 → 近期、远期 → 中期、超远期 → 远期（视需求）。版本目标随之重排。
3. **触发时机** —— 重排是发布流程的一部分（`release-manager` 归档计划时一并重排本 roadmap），不是随手改；否则时间标注会过期失真。
