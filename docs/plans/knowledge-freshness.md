# Knowledge Freshness Detection（TASK 计划）

[English](#english) · [简体中文](#chinese)

> **状态：设计计划，未实现。** 本页是路线图条目 `Knowledge freshness detection` 的详细设计（见 [roadmap.md](../roadmap.md)），按 `docs/plans/TASK_<name>.md` 六字段模板组织。目标版本：v0.7.0。

---

## English

### Task Purpose

Upgrade drift detection from **existence** to **freshness**: flag governance docs that went stale relative to code activity, so knowledge decay is caught before it becomes technical debt.

### Current Problem

- drift-check compares declared artifacts against reality + `governance_version` — a doc that *exists* but is *outdated* passes every check
- Code changes weekly while `docs/ARCHITECTURE.md` goes untouched for months → knowledge silently rots
- The two mandatory docs (ARCHITECTURE.md, CHANGELOG) have no staleness signal

### Proposed Solution

drift-check gains a `freshness` mode (report-only, **never** a gate):

- Staleness per doc = days since its **last git commit** vs. code activity (commits touching `src/` etc. in the same window)
- **Use `git log -1 --format=%cs -- <doc>`**, not filesystem mtime — fresh clones have all mtimes equal to checkout time
- Thresholds (advisory): no commits to the doc in 30+ days while code is active → `stale`; 90+ days → `very stale`
- Output lands in the existing `.governance/drift-report.json` as `"stale": ["docs/ARCHITECTURE.md", ...]`
- Mandatory-doc pair is reported first; feature docs included

### Affected Files

- `references/templates/sub-skills.md` — drift-check gains `freshness` mode
- `.governance/drift-report.json` schema — `stale` array (runtime output; schema note only)
- `docs/commands.md` — command doc sync
- Validator: **unchanged** (advisory report, not a check)

### Risks

- **Stable projects false-flag** — low commit volume projects may show stale docs; advisory-only (no exit-code failure) neutralizes this
- **git-log vs mtime** — must use commit dates; a design assertion, not an implementation detail
- **File moves/renames** — doc renames reset `git log -- <path>` history; v1 accepts this, v1.1 can use `--follow`

### Validation Method

- Synthetic git history: doc untouched 60 days + active code → `stale` flagged (test)
- Recently-touched doc → not flagged (test)
- Fresh clone (all mtimes equal) still computes correct staleness via git log (test)
- drift-report.json contains the `stale` array; validator exit codes unchanged (regression)

---

## Chinese

### 任务目的

把漂移检测从**存在性**升级到**新鲜度**：标记相对代码活跃度已经过时的治理文档，在知识腐化变成技术债之前发现它。

### 当前问题

- drift-check 只比对声明的工件是否存在 + `governance_version` —— 一份**存在但过时**的文档每次检查都通过
- 代码每周在变，而 `docs/ARCHITECTURE.md` 几个月没动 → 知识在无声腐烂
- 两份必更文档（ARCHITECTURE.md、CHANGELOG）没有任何过时信号

### 提议方案

drift-check 增加 `freshness` 模式（仅报告，**绝不做门禁**）：

- 每份文档的过时度 = 距其**最后一次 git 提交**的天数 vs 同期代码活跃度（`src/` 等目录的提交）
- **必须用 `git log -1 --format=%cs -- <文档>`，不能用文件 mtime** —— 全新 clone 的所有 mtime 都等于检出时间
- 阈值（建议性）：代码活跃而文档 30+ 天未提交 → `stale`；90+ 天 → `very stale`
- 结果写入现有 `.governance/drift-report.json` 的 `"stale": ["docs/ARCHITECTURE.md", ...]` 字段
- 两份必更文档优先报告；feature 文档一并纳入

### 受影响文件

- `references/templates/sub-skills.md` —— drift-check 增加 `freshness` 模式
- `.governance/drift-report.json` schema —— 增加 `stale` 数组（运行期输出；仅 schema 说明）
- `docs/commands.md` —— 命令文档同步
- 校验器：**不变**（建议性报告，不是检查项）

### 风险

- **稳定项目误报** —— 低提交量项目可能显示过时；仅报告（不改变退出码）可完全中和
- **git-log 与 mtime** —— 必须用提交日期；这是设计断言，不是实现细节
- **文件移动/重命名** —— 重命名会重置 `git log -- <path>` 历史；v1 接受，v1.1 可用 `--follow`

### 验证方法

- 合成 git 历史：文档 60 天未动 + 代码活跃 → 标记 `stale`（测试）
- 近期改动过的文档 → 不标记（测试）
- 全新 clone（mtime 全同）仍经 git log 算出正确过时度（测试）
- drift-report.json 含 `stale` 数组；校验器退出码不变（回归）
