# Sync Groups Mechanical Check（TASK 計劃）

[English](../../en/plans/sync-groups-mechanical-check.md) · [简体中文](../../zh-CN/plans/sync-groups-mechanical-check.md) · [繁體中文](sync-groups-mechanical-check.md)

> **狀態：設計計劃，未實作。** 本頁是路線圖條目 `Sync groups mechanical check` 的詳細設計（見 [roadmap.md](../roadmap.md)），按 `docs/plans/TASK_<name>.md` 六欄位範本組織。

### 任務目的

把被治理專案的同步強制從**清單驅動**（第一層）升級為**機械驗證**：唯讀腳本對照任務實際改動集與聲明的同步組，報告缺失的 require——讓漏同步被**發現**，而不是被信任。

### 當前問題

第一層（`.governance/sync-rules.json` + Phase 5 清單）把可靠性從記憶驅動升級為清單驅動，但清單仍由 Agent 自己執行。疲憊的 LLM 可以勾 ✅ 而不做。機械檢查缺的最後一個拼圖是**任務邊界**——「本次任務改了什麼」必須可定義。

### 提議方案

`scripts/check-sync.js`（INIT 複製、唯讀、零依賴）：

- **改動集** —— `git diff --name-only <task-start-sha>..HEAD` 加上未暫存/已暫存改動；task-start-sha 由 state-manager 在任務開始時寫入 `.governance/state.json`（新欄位 `task_start_sha`，取自 `git rev-parse HEAD`）
- **規則評估** —— 對 `.governance/sync-rules.json` 每個 syncGroup：任一 `watch` glob 命中改動路徑、但沒有任何 `require` 路徑改動 → 報告 `unsynced: <group.name>`（閘門模式 exit 1；`--advisory` 模式 exit 0）
- **輸出** —— 人類摘要 + `--json`；追加到 `.governance/drift-report.json` 的 `sync` 欄位
- **Glob 匹配器** —— 僅前綴 + `**`（與未來消費方共享輔助函式；v1 不用正規表示式）
- **接入** —— 生命週期 Phase 5 結束時：宣稱完成前跑 `node scripts/check-sync.js`（閘門模式）；RELEASE 前置 `sync.passed`

### 受影響檔案

- `scripts/check-sync.js` —— 新腳本 + INIT 複製清單（SKILL.md 第 11 步）
- `.governance/state.json` schema —— `task_start_sha` 欄位（state-manager 任務開始時寫入）
- `references/templates/sub-skills.md` —— state-manager 記錄 task_start_sha；生命週期報告引用 check-sync
- `references/policies/lifecycle.policy.md` —— Phase 5 在清單後強制 check-sync（閘門）
- `references/workflows/release.md` —— 前置 `sync.passed`
- `scripts/verify-governance.js` —— 要求 check-sync.js 存在（校驗器預設 +1）
- `tests/run-tests.js` —— 同步偵測測試

### 風險

- **任務邊界語義** —— task_start_sha 在任務開始時記錄；跨多 commit 或從 state.json 復原的任務不得中途重置 SHA（復原保留原 SHA）
- **合理分歧誤報** —— 如規則變更暫時不打算反映到 AGENTS.md；用 `--advisory` 模式 + 報告緩解，閘門模式只在 Phase 5 結束/發佈時
- **Glob 邊界** —— 目錄 vs 檔案路徑、`docs/features/`（目錄）vs `docs/features/foo.md`；匹配器把尾部 `/` 視為前綴

### 驗證方法

- Fixture：改 `src/a.ts` 不動 `docs/ARCHITECTURE.md` → exit 1 + `unsynced: api-architecture`（測試）
- Fixture：兩者都改 → exit 0（測試）
- 復原場景：state.json 已有 task_start_sha → 不覆寫（測試）
- 校驗器在 check-sync.js 缺失時失敗（測試）
