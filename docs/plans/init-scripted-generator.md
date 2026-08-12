# INIT Scripted Generator（TASK 计划）

[English](#english) · [简体中文](#chinese)

> **状态：设计计划，未实现。** 本页是路线图条目 `INIT scripted generator` 的详细设计（见 [roadmap.md](../roadmap.md)），按 `docs/plans/TASK_<name>.md` 六字段模板组织。目标版本：v0.8.0（从远期提前的战略可靠性项）。

---

## English

### Task Purpose

Freeze the INIT generation logic into a **deterministic, snapshot-testable script** so 100 INIT runs produce byte-identical output — the reliability precondition for scaling the skill.

### Current Problem

- INIT is executed by an LLM following SKILL.md prose → output drifts across runs, models and agents (wording, ordering, omission)
- No snapshot tests exist; regressions in generated artifacts are found by users, not CI
- MIGRATE relies on the validator, but the validator cannot catch *wrong-but-present* files
- The skill's own anti-fabrication guarantee ("never fake content") is currently a prompt-level promise, not a machine property

### Proposed Solution

`scripts/generate-governance.js` — zero-dependency Node generator (same discipline as the validator):

1. **Consumes** `references/templates/**` + a machine-readable init spec (extracted from SKILL.md Phase 1 as structured data or a `references/init-spec.json`)
2. **Inputs**: repo root, maturity level (L0–L3), detection facts (language, package manager, CI platform, doc root) — the *judgment* stays human/agent-driven, the *writing* becomes mechanical
3. **Outputs**: the full bootstrap skeleton (rules → AGENTS.md → templates → `.governance/` state → scripts copies → CI), placeholders resolved from the detection facts
4. **SKILL.md INIT becomes**: agent runs the generator + handles only the confirmation gates (dependencies, git identity, CI push) — the "human approval" part, not the "write files" part
5. **Snapshot tests**: fixture repos (L0 empty / L1 code-only / L3 with existing docs) → assert full file tree + content equality

Phased delivery:

- Phase A (v0.8.0): static skeleton — rules, AGENTS.md, CHANGELOG, README bootstrap, feature placeholder strategy
- Phase B (later): config files (.gitignore, .env.example, .gitmessage), CI selection, `.governance/` state files
- Phase C (later): structure-adaptive mode (existing doc roots, merge-not-overwrite), parity with all 13 Phase-1 steps

### Affected Files

- `scripts/generate-governance.js` + `references/init-spec.json` — new
- `SKILL.md` Phase 1 — rewritten as "run generator + handle gates"
- `tests/run-tests.js` — snapshot fixture suite
- `docs/bootstrap-output.md` — output spec sourced from the generator

### Risks

- **Single-source drift** — the spec and SKILL.md prose must not diverge (rule: SKILL.md references the spec, never restates it)
- **Large effort** — full parity with all 13 steps is big; phasing (A → B → C) keeps each release shippable
- **Template placeholders** — templates keep `{{...}}`; the generator resolves them mechanically (this is where determinism comes from)

### Validation Method

- Same fixture inputs → byte-identical outputs across two runs (determinism test)
- Fixture snapshots: L0 / L1 / L3 expected file trees (snapshot tests)
- Generated output passes `verify-governance.js` exit 0 for all fixtures (end-to-end test)
- SKILL.md INIT section references the generator, not restates steps (doc assertion)

---

## Chinese

### 任务目的

把 INIT 生成逻辑固化为**确定性、可快照测试的脚本**，让 100 次 INIT 产出逐字节一致——这是 skill 规模化之前的可靠性前提。

### 当前问题

- INIT 由 LLM 按 SKILL.md 散文执行 → 产出随运行、模型、Agent 漂移（措辞、顺序、遗漏）
- 没有快照测试；生成工件的回归由用户发现，不由 CI 发现
- MIGRATE 依赖校验器，但校验器无法发现"存在但错误"的文件
- 本 skill 的反虚构承诺（"绝不伪造内容"）目前只是提示词级承诺，不是机器属性

### 提议方案

`scripts/generate-governance.js` —— 零依赖 Node 生成器（与校验器同一纪律）：

1. **消费** `references/templates/**` + 机器可读的初始化规范（从 SKILL.md Phase 1 提炼为结构化数据，即 `references/init-spec.json`）
2. **输入**：仓库根、成熟度（L0–L3）、检测事实（语言、包管理器、CI 平台、文档根）——**判断仍由人/Agent 做，写文件变为机械动作**
3. **输出**：完整引导骨架（rules → AGENTS.md → 模板 → `.governance/` 状态 → scripts 复制 → CI），占位符由检测事实机械解析
4. **SKILL.md 的 INIT 变为**：Agent 运行生成器 + 只处理确认门禁（依赖、git 身份、CI 推送）——负责"人工批准"部分，不负责"写文件"部分
5. **快照测试**：fixture 仓库（L0 空仓库 / L1 仅代码 / L3 已有文档）→ 断言完整文件树 + 内容一致

分期交付：

- Phase A（v0.8.0）：静态骨架 —— rules、AGENTS.md、CHANGELOG、README 引导、Feature 占位策略
- Phase B（后续）：配置文件（.gitignore、.env.example、.gitmessage）、CI 选择、`.governance/` 状态文件
- Phase C（后续）：结构自适应模式（既有文档根、合并不覆盖），与全部 13 步 Phase 1 对齐

### 受影响文件

- `scripts/generate-governance.js` + `references/init-spec.json` —— 新增
- `SKILL.md` Phase 1 —— 重写为"运行生成器 + 处理门禁"
- `tests/run-tests.js` —— 快照 fixture 套件
- `docs/bootstrap-output.md` —— 输出规格改由生成器为源

### 风险

- **单一事实源漂移** —— spec 与 SKILL.md 散文不得分叉（规则：SKILL.md 引用 spec，不复述）
- **工作量大** —— 与全部 13 步完全对齐是大工程；分期（A → B → C）保证每版可发布
- **模板占位符** —— 模板保留 `{{...}}`；由生成器机械解析（确定性正来源于此）

### 验证方法

- 相同 fixture 输入两次运行 → 逐字节一致（确定性测试）
- fixture 快照：L0 / L1 / L3 期望文件树（快照测试）
- 全部 fixture 生成产物通过 `verify-governance.js` exit 0（端到端测试）
- SKILL.md 的 INIT 章节引用生成器而非复述步骤（文档断言）
