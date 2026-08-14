# Validator

[English](../en/validator.md) · [简体中文](validator.md) · [繁體中文](../zh-TW/validator.md)

治理校验器是零依赖的纯 Node 脚本，INIT 时生成到每个被治理项目 `scripts/verify-governance.js`（源头：本仓库 `scripts/verify_governance.js`）。

### 用法

```bash
node scripts/verify-governance.js          # 人类可读报告，退出码 = 通过/失败
node scripts/verify-governance.js --json   # 机器可读 JSON 报告
node scripts/verify-governance.js --help   # 用法
```

全部治理工件存在时退出码 0，否则 1。

### 行为

- **manifest 模式** — `.governance/manifest.json` 声明了非空 `artifacts` 数组时，路径以它为准（结构适配）。追加检查：CHANGELOG format、Git policy、Manifest schema、Manifest artifacts valid（`kind` ∈ file/dir）、Governance version、Release metadata（仅当声明了 `release` 字段时）。
- **默认模式** — 无 manifest 时检查内置默认项：

```
AGENTS.md / CHANGELOG.md / CHANGELOG format / docs/ARCHITECTURE.md / docs/features/ / docs/plans/ /
docs/rules/ / .gitignore / .env.example / CI workflow / scripts/verify-governance.js / scripts/check-lock.js /
scripts/check-git-policy.js / scripts/check-secrets.js / .governance/ 目录 / manifest.json / state.json /
preflight.json / git-policy.json / governance_version
```

- `validation.json` / `drift-report.json` 是运行时输出，不是 required artifact —— fresh checkout 无它们也能通过。

### 报告

人类模式逐项打印 `✓/✗ <名称> (<路径>)` 及 `N/M checks passed.`。JSON 模式返回 `{ mode, governance_version, total, passed, failed, passedAll, results[] }`。治理检查必须在宣称任务完成前、以及 RELEASE 前通过。
