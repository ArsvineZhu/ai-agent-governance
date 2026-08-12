# Governance Model

[English](#english) · [简体中文](#chinese)

---

## English

The three-state model behind "Governance as Code": desired / current / observed state, tracked as version-controlled files inside the repository.

### Spec / Status / Health

A Kubernetes-like Spec / Status / Health split:

| File | Role | Git |
| --- | --- | --- |
| `manifest.json` | desired state — unique index of all governance artifacts (path, `kind`, `type`, version) | tracked |
| `state.json` | current state — maturity, phase, agent identity, locks, completed/blocked | tracked |
| `preflight.json` | rollback snapshot taken before INIT writes | tracked |
| `generated/skills/` | generated agent modules (drift-check, release-manager, ...) | tracked |
| `validation.json` | observed state — last validator run | ignored (runtime output) |
| `drift-report.json` | drift report | ignored (runtime output) |

### Versioning

- `schema_version` — the data format version of the manifest
- `governance_version` — the governance framework version

They are separate. Bumping the framework does not require a schema change.

### Upgrading (MIGRATE)

When a governed project's `governance_version` lags behind the skill version, AUDIT reports the drift but never auto-upgrades. On explicit user request, the MIGRATE flow applies:

1. Build the migration list — validator `--json` missing artifacts + the target versions' CHANGELOG Added/Changed entries
2. Confirm with the user — new files, changed files, rule changes, behavior changes
3. Apply — copy new scripts/templates, update rules, bump `governance_version`, record in CHANGELOG
4. Verify — validator exit 0; on failure keep the old version, no half-migrated state

Each version's CHANGELOG entries are the migration basis; multi-version jumps must cover intermediate artifact changes.

### Path Resolution

The validator resolves artifact paths from `manifest.json` when present (structure-adaptive — existing doc layouts are respected, no forced migration); otherwise built-in defaults are used. The `type` field is governance semantics for classification and reporting and does not participate in filesystem checks — only `kind` (file/dir) does.

### Runtime Outputs

`validation.json` and `drift-report.json` are produced by AUDIT/release runs. They are git-ignored and never required artifacts: a fresh checkout must pass CI without them.

---

## Chinese

"治理即代码"背后的三层状态模型：期望态 / 当前态 / 观测态，以可版本控制的文件存在于仓库内。

### Spec / Status / Health

参照 Kubernetes 的 Spec / Status / Health 分层：

| 文件 | 角色 | Git |
| --- | --- | --- |
| `manifest.json` | 期望态 —— 全部治理工件的唯一索引（路径、`kind`、`type`、版本） | 提交 |
| `state.json` | 当前态 —— 成熟度、阶段、Agent 身份、锁、已完成/阻塞 | 提交 |
| `preflight.json` | 初始化写入前的回滚快照 | 提交 |
| `generated/skills/` | 生成的 Agent 模块（drift-check、release-manager 等） | 提交 |
| `validation.json` | 观测态 —— 最近一次校验结果 | 忽略（运行时输出） |
| `drift-report.json` | 漂移报告 | 忽略（运行时输出） |

### 版本

- `schema_version` —— manifest 的数据格式版本
- `governance_version` —— 治理框架版本

二者分离；升框架版本不需要改 schema。

### 升级（MIGRATE）

被治理项目的 `governance_version` 落后于 skill 版本时，AUDIT 只报告漂移、绝不自动升级。用户明确要求升级时，MIGRATE 流程执行：

1. 生成迁移清单 —— 校验器 `--json` 的缺失工件 + 目标版本 CHANGELOG 的 Added/Changed 条目
2. 与用户确认 —— 新增文件、变更文件、规则变化、行为变化
3. 执行 —— 复制新脚本/模板、更新规则、升 `governance_version`、CHANGELOG 记录
4. 验证 —— 校验器退出码 0；失败则保持原版本，不留半迁移状态

每个版本的 CHANGELOG 条目就是迁移依据；跨多个版本迁移必须覆盖中间版本的工件变化。

### 路径解析

校验器以 `manifest.json` 声明的路径为准（结构适配 —— 尊重既有文档布局，不强制迁移）；否则用内置默认项。`type` 是用于分类与报告的治理语义元数据，不参与文件系统校验 —— 文件系统判断只看 `kind`（file/dir）。

### 运行时输出

`validation.json` 与 `drift-report.json` 由 AUDIT/发布运行产生，被 git 忽略、不作为 required artifact：fresh checkout 无它们也必须通过 CI。