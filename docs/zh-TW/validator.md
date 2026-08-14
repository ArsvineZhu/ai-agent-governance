# Validator

[English](../en/validator.md) · [简体中文](../zh-CN/validator.md) · [繁體中文](validator.md)

治理校驗器是零相依性的純 Node 腳本，INIT 時生成到每個被治理專案的 `scripts/verify-governance.js`（源頭：本倉庫 `scripts/verify_governance.js`）。

### 用法

```bash
node scripts/verify-governance.js          # 人類可讀報告，退出碼 = 通過/失敗
node scripts/verify-governance.js --json   # 機器可讀 JSON 報告
node scripts/verify-governance.js --help   # 用法
```

全部治理工件存在時退出碼為 0，否則為 1。

### 行為

- **manifest 模式** — 當 `.governance/manifest.json` 宣告了非空 `artifacts` 陣列時，路徑以它為準（結構適配）。追加檢查：CHANGELOG format、Git policy、Manifest schema、Manifest artifacts valid（`kind` ∈ file/dir）、Governance version、Release metadata（僅當宣告了 `release` 欄位時）。
- **預設模式** — 沒有 manifest 時檢查內建預設項目：

```
AGENTS.md / CHANGELOG.md / CHANGELOG format / docs/ARCHITECTURE.md / docs/features/ / docs/plans/ /
docs/rules/ / .gitignore / .env.example / CI workflow / scripts/verify-governance.js / scripts/check-lock.js /
scripts/check-git-policy.js / scripts/check-secrets.js / .governance/ 目錄 / manifest.json / state.json /
preflight.json / git-policy.json / governance_version
```

- `validation.json` / `drift-report.json` 是執行時期輸出，不是 required artifact —— fresh checkout 沒有它們也能通過。

### 報告

人類可讀模式逐項列印 `✓/✗ <名稱> (<路徑>)` 及 `N/M checks passed.`。JSON 模式回傳 `{ mode, governance_version, total, passed, failed, passedAll, results[] }`。治理檢查必須在宣稱任務完成前、以及 RELEASE 前通過。
