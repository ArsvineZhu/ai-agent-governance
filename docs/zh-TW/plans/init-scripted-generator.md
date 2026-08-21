# INIT Scripted Generator（TASK 計劃）

[English](../../en/plans/init-scripted-generator.md) · [简体中文](../../zh-CN/plans/init-scripted-generator.md) · [繁體中文](init-scripted-generator.md)

### 任務目的

把 INIT 生成邏輯固化為**確定性、可快照測試的腳本**，讓 100 次 INIT 產出逐位元組一致——這是 skill 規模化之前的可靠性前提。

### 當前問題

- INIT 由 LLM 按 SKILL.md 散文執行 → 產出隨執行、模型、Agent 漂移（措辭、順序、遺漏）
- 沒有快照測試；生成工件的迴歸由使用者發現，不由 CI 發現
- MIGRATE 依賴校驗器，但校驗器無法發現「存在但錯誤」的檔案
- 本 skill 的反虛構承諾（「絕不偽造內容」）目前只是提示詞級承諾，不是機器屬性

### 提議方案

`scripts/generate-governance.js` —— 零依賴 Node 生成器（與校驗器同一紀律）：

1. **消費** `references/templates/**` + 機器可讀的初始化規範（從 SKILL.md Phase 1 提煉為結構化資料，即 `references/init-spec.json`）
2. **輸入**：倉庫根、成熟度（L0–L3）、偵測事實（語言、套件管理員、CI 平台、文件根）——**判斷仍由人/Agent 做，寫檔案變為機械動作**
3. **輸出**：完整引導骨架（rules → AGENTS.md → 範本 → `.governance/` 狀態 → scripts 複製 → CI），佔位符由偵測事實機械解析
4. **SKILL.md 的 INIT 變為**：Agent 執行生成器 + 只處理確認閘門（依賴、git 身分、CI 推送）——負責「人工批准」部分，不負責「寫檔案」部分
5. **快照測試**：fixture 倉庫（L0 空倉庫 / L1 僅程式碼 / L3 已有文件）→ 斷言完整檔案樹 + 內容一致

分期交付：

- Phase A（v0.9.0）：靜態骨架 —— rules、AGENTS.md、CHANGELOG、README 引導、Feature 佔位策略 —— **已交付**
- Phase B：設定檔（.gitignore、.env.example、.gitmessage）、按棧/平台選擇 CI、`.governance/` 狀態檔案、腳本複製 —— **已交付**
- Phase C：結構適配（成熟度策略 L0/L1 全量、L2 增量、L3 僅稽核；既有文件根經 `--doc-root`）、子技能生成、建議性腳本 —— **已交付**

### 受影響檔案

- `scripts/generate-governance.js` + `references/init-spec.json` —— 新增
- `SKILL.md` Phase 1 —— 重寫為「執行生成器 + 處理閘門」
- `tests/run-tests.js` —— 快照 fixture 套件
- `docs/zh-TW/bootstrap-output.md` —— 輸出規格改由生成器為源

### 風險

- **單一事實來源漂移** —— spec 與 SKILL.md 散文不得分叉（規則：SKILL.md 引用 spec，不複述）
- **工作量大** —— 與全部 13 步完全對齊是大工程；分期（A → B → C）保證每版可發佈
- **範本佔位符** —— 範本保留 `{{...}}`；由生成器機械解析（確定性正來源於此）

### 驗證方法

- 相同 fixture 輸入兩次執行 → 逐位元組一致（確定性測試）
- fixture 快照：L0 / L1 / L3 期望檔案樹（快照測試）
- 全部 fixture 生成產物通過 `verify-governance.js` exit 0（端到端測試）
- SKILL.md 的 INIT 章節引用生成器而非複述步驟（文件斷言）
