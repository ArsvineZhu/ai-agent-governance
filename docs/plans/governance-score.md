# Governance Score & Badge（TASK 计划）

[English](#english) · [简体中文](#chinese)

> **状态：设计计划，未实现。** 本页是路线图条目 `Governance score & badge` 的详细设计（见 [roadmap.md](../roadmap.md)），按 `docs/plans/TASK_<name>.md` 六字段模板组织。目标版本：v0.7.0。

---

## English

### Task Purpose

Give every governed project a **shareable health metric**: a composite governance score from the validator, plus a badge story — so "is this repo governed?" has a one-glance answer, and the future remote dashboard gets a scoring basis.

### Current Problem

- `verify-governance.js --json` reports `passed / failed / total` but no single composite number
- No badge mechanism exists beyond the CI status badge (which says "CI passes", not "governance healthy")
- A planned remote dashboard (roadmap) has no numeric data model to consume

### Proposed Solution

1. **Score in validator** — `--json` output gains:

```json
{ "score": 0.95, "total": 20, "passed": 19, "failed": 1 }
```

`score = passed / total` (v1 unweighted; every check equal). Weighting (critical artifacts ×2) explicitly deferred — document why.

2. **Badge pipeline** — the CI governance job writes a shields.io `endpoint` JSON artifact:

```json
{ "schemaVersion": 1, "label": "governance", "message": "19/20", "color": "green" }
```

Hosting is the user's choice (Gist / GH Pages / repo file); the plan ships the artifact generation + README badge snippet, not a hosting service.

3. **This repo adopts it** — a `governance` badge on the README (hosted via the repo's own CI artifact), serving as the reference implementation.

### Affected Files

- `scripts/verify_governance.js` — `score` field (backward compatible: added, not changed)
- `references/workflows/ci.md` — badge-endpoint artifact step
- `docs/validator.md` / `docs/commands.md` / README — doc sync + reference badge
- `tests/run-tests.js` — score assertions (20/20 → 1.0, 19/20 → 0.95)

### Risks

- **Equal weighting misleads** — a missing AGENTS.md and a missing `.env.example` count the same; acceptable in v1 (documented), weighting deferred until dashboard
- **Hosting friction** — shields.io `endpoint` needs a public URL; mitigated by shipping only the artifact + instructions
- **Score semantics vs CI badge** — the governance badge must not be confused with CI status; label them distinctly

### Validation Method

- `--json` contains numeric `score = passed/total` (test)
- CI artifact step produces valid shields.io endpoint JSON (test)
- Backward compatibility: existing `--json` consumers only gain a field (regression: all existing tests pass unchanged)

---

## Chinese

### 任务目的

给每个被治理项目一个**可分享的健康指标**：校验器输出综合治理分 + 徽章链路——"这个仓库有没有被治理"一眼可知，未来远程看板也有了打分数据模型。

### 当前问题

- `verify-governance.js --json` 输出 `passed / failed / total`，但没有单一综合数字
- 除 CI 状态徽章外没有徽章机制（CI 徽章说的是"CI 通过"，不是"治理健康"）
- 规划中的远程看板（roadmap）没有可消费的数值数据模型

### 提议方案

1. **校验器输出分数** —— `--json` 增加：

```json
{ "score": 0.95, "total": 20, "passed": 19, "failed": 1 }
```

`score = passed / total`（v1 等权，每项一致）。加权（关键工件 ×2）明确推迟并说明原因。

2. **徽章管线** —— CI 治理 job 产出 shields.io `endpoint` JSON 工件：

```json
{ "schemaVersion": 1, "label": "governance", "message": "19/20", "color": "green" }
```

托管方式由用户自选（Gist / GH Pages / 仓库文件）；本计划只交付工件生成 + README 徽章片段，不交付托管服务。

3. **本仓库自己启用** —— README 挂 `governance` 徽章（由本仓库 CI 工件托管），作为参考实现。

### 受影响文件

- `scripts/verify_governance.js` —— 增加 `score` 字段（向后兼容：只增不改）
- `references/workflows/ci.md` —— badge endpoint 工件步骤
- `docs/validator.md` / `docs/commands.md` / README —— 文档同步 + 参考徽章
- `tests/run-tests.js` —— score 断言（20/20 → 1.0，19/20 → 0.95）

### 风险

- **等权误导** —— 缺 AGENTS.md 与缺 `.env.example` 同分；v1 接受（文档说明），加权推迟到看板
- **托管摩擦** —— shields.io `endpoint` 需要公网 URL；只交付工件 + 说明来缓解
- **与 CI 徽章混淆** —— 治理徽章必须与 CI 状态区分命名

### 验证方法

- `--json` 含数值 `score = passed/total`（测试）
- CI 工件步骤产出合法 shields.io endpoint JSON（测试）
- 向后兼容：现有 `--json` 消费方只多一个字段（回归：现有测试全部不变通过）
