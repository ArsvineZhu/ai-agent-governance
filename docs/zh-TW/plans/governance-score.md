# Governance Score & Badge（TASK 計劃）

[English](../../en/plans/governance-score.md) · [简体中文](../../zh-CN/plans/governance-score.md) · [繁體中文](governance-score.md)

### 任務目的

給每個被治理專案一個**可分享的健康指標**：校驗器輸出綜合治理分 + 徽章鏈路——「這個倉庫有沒有被治理」一眼可知，未來遠端看板也有了打分資料模型。

### 當前問題

- `verify-governance.js --json` 輸出 `passed / failed / total`，但沒有單一綜合數字
- 除 CI 狀態徽章外沒有徽章機制（CI 徽章說的是「CI 通過」，不是「治理健康」）
- 規劃中的遠端看板（roadmap）沒有可消費的數值資料模型

### 提議方案

1. **校驗器輸出分數** —— `--json` 增加：

```json
{ "score": 0.95, "total": 20, "passed": 19, "failed": 1 }
```

`score = passed / total`（v1 等權，每項一致）。加權（關鍵工件 ×2）明確延後並說明原因。

2. **徽章管線** —— CI 治理 job 產出 shields.io `endpoint` JSON 工件：

```json
{ "schemaVersion": 1, "label": "governance", "message": "19/20", "color": "green" }
```

託管方式由使用者自選（Gist / GH Pages / 倉庫檔案）；本計劃只交付工件生成 + README 徽章片段，不交付託管服務。

3. **本倉庫自己啟用** —— README 掛 `governance` 徽章（由本倉庫 CI 工件託管），作為參考實作。

### 受影響檔案

- `scripts/verify_governance.js` —— 增加 `score` 欄位（向後相容：只增不改）
- `references/workflows/ci.md` —— badge endpoint 工件步驟
- `docs/validator.md` / `docs/commands.md` / README —— 文件同步 + 參考徽章
- `tests/run-tests.js` —— score 斷言（20/20 → 1.0，19/20 → 0.95）

### 風險

- **等權誤導** —— 缺 AGENTS.md 與缺 `.env.example` 同分；v1 接受（文件說明），加權延後到看板
- **託管摩擦** —— shields.io `endpoint` 需要公網 URL；只交付工件 + 說明來緩解
- **與 CI 徽章混淆** —— 治理徽章必須與 CI 狀態區分命名

### 驗證方法

- `--json` 含數值 `score = passed/total`（測試）
- CI 工件步驟產出合法 shields.io endpoint JSON（測試）
- 向後相容：現有 `--json` 消費方只多一個欄位（迴歸：現有測試全部不變通過）
