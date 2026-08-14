# Agent Activity Audit（TASK 计划）

[English](#english) · [简体中文](#chinese)

> **状态：已实现（v0.6.0，已归档）。** 本页是路线图条目 `Agent activity audit` 的详细设计（见 [roadmap.md](../zh-CN/roadmap.md)），按 `docs/plans/TASK_<name>.md` 六字段模板组织。目标版本：v0.6.0（已实现，待发布）。

---

## English

### Task Purpose

Give governance an **accountability layer**: an append-only, per-task audit trail so any past agent action can be reconstructed — "which agent did what, when, with what commands and what result". This is the core differentiator between a governance framework and a skill installer.

### Current Problem

- `.governance/validation.json` holds only the *latest* check snapshot — no history
- drift-check / AUDIT compare artifact existence and versions, never agent *behavior*
- A past incident (bad deletion, unexpected commit, secret exposure) cannot be reconstructed after the fact
- No data source for a future remote dashboard

### Proposed Solution

`.governance/activity.jsonl` — append-only JSON Lines, one entry per task end:

```json
{"ts":"2026-08-13T10:00:00Z","agent_id":"claude","task_id":"t-123","phase":"implement","action":"modify","files":["src/a.ts"],"commands":["npm test"],"result":"ok","summary":"add login endpoint"}
```

- Written by the generated **state-manager** sub-skill (extends its existing end-of-task duty); every task lifecycle writes exactly one line at completion
- **drift-check** gains an `activity-report` mode: aggregates the last N entries (per agent / per action / failed only)
- Classification: runtime output, **git-ignored** (consistent with ADR-0002 optional runtime outputs; aggregation is a read command, not a tracked file)
- `action` vocabulary (v1): `init / inspect / plan / implement / modify / delete / commit / release / audit / migrate`

### Affected Files

- `references/templates/sub-skills.md` — state-manager gains append duty; drift-check gains `activity-report` mode
- `references/policies/governance-files.policy.md` — `activity.jsonl` declared as git-ignored runtime output
- `docs/commands.md` / `docs/governance-model.md` / README — doc sync
- Validator: **unchanged** (runtime output, not a tracked artifact)

### Risks

- **Unbounded growth** — v1 accepts append-only growth; rotation (`activity-YYYYMM.jsonl` per month) deferred to v1.1
- **Secret leakage into logs** — summaries/commands must never contain secret material; redaction rule (mask tokens matching the secret-scan gate patterns) is mandatory
- **Multi-machine locality** — the log is per checkout; cross-machine aggregation is explicitly out of scope (the future dashboard consumes merged copies)

### Validation Method

- state-manager writes exactly one well-formed JSONL line per task end (schema assertion in tests)
- `activity-report` aggregates N entries and exits 0 (test)
- Redaction: a summary containing a secret-like token is masked before write (test)
- Regression: validator keeps 19 default checks — adding the runtime log must not change exit codes

---

## Chinese

### 任务目的

为治理体系补上**问责层**：每个任务一条追加式审计记录，任何一次 Agent 行为都能事后还原——"哪个 Agent 在何时、用什么命令、改了什么、结果如何"。这是治理框架与 skill 安装器之间的本质差异。

### 当前问题

- `.governance/validation.json` 只保留**最近一次**校验快照，没有历史
- drift-check / AUDIT 只比对工件存在性与版本，从不审计 Agent 的**行为**
- 事后无法还原历史事故（误删、意外提交、密钥暴露）
- 未来远程看板没有数据来源

### 提议方案

`.governance/activity.jsonl` —— 追加式 JSON Lines，每个任务结束写一行：

```json
{"ts":"2026-08-13T10:00:00Z","agent_id":"claude","task_id":"t-123","phase":"implement","action":"modify","files":["src/a.ts"],"commands":["npm test"],"result":"ok","summary":"add login endpoint"}
```

- 由生成的 **state-manager** 子技能负责写入（扩展其现有的"任务结束"职责）；每个任务生命周期恰好写一行
- **drift-check** 增加 `activity-report` 模式：聚合最近 N 条（按 Agent / 按动作 / 只看失败）
- 归类为运行期输出，**git-ignored**（与 ADR-0002 可选运行期输出一致；聚合是读命令，不是受跟踪文件）
- `action` 词表（v1）：`init / inspect / plan / implement / modify / delete / commit / release / audit / migrate`

### 受影响文件

- `references/templates/sub-skills.md` —— state-manager 增加追加职责；drift-check 增加 `activity-report` 模式
- `references/policies/governance-files.policy.md` —— 声明 `activity.jsonl` 为 git-ignored 运行期输出
- `docs/commands.md` / `docs/governance-model.md` / README —— 文档同步
- 校验器：**不变**（运行期输出，非受跟踪工件）

### 风险

- **无限增长** —— v1 接受追加式增长；轮转（按月 `activity-YYYYMM.jsonl`）推迟到 v1.1
- **密钥混入日志** —— summary/commands 绝不允许包含密钥材料；脱敏规则（按密钥扫描门禁的模式打码）为强制项
- **多机本地性** —— 日志是每个检出副本独立的；跨机聚合明确超出范围（未来看板消费合并副本）

### 验证方法

- state-manager 每个任务结束恰好写一行合法 JSONL（测试断言 schema）
- `activity-report` 聚合 N 条并退出码 0（测试）
- 脱敏：含密钥模式 token 的 summary 在写入前被打码（测试）
- 回归：校验器保持 19 项默认检查 —— 新增运行期日志不得改变退出码
