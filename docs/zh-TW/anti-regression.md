# Anti-Regression System

[English](../en/anti-regression.md) · [简体中文](../zh-CN/anti-regression.md) · [繁體中文](anti-regression.md)

治理不只是搭骨架 —— 它約束每個 Agent 的每次任務，讓後來者（新同事的 AI / 新的 Agent）無法破壞前人寫好的程式碼。本頁是防亂改機制的完整明細（摘要見 README → 功能 → 防亂改體系）。

- **入口檔案自動載入** — `AGENTS.md` / `CLAUDE.md` / `.cursor/rules/` 每次工作階段開始時自動讀取；Agent 改程式碼前**必須**先讀 `docs/ARCHITECTURE.md`、`docs/features/` 與最近的 `CHANGELOG.md`
- **六階段操作生命週期** — 每個開發任務依序走 Understand → Plan → Implement → Validate → Synchronize → Report；中大型變更必須先建立 `docs/plans/TASK_<name>.md` 再動程式碼；「只改程式碼不更新專案知識」被禁止
- **程式碼修改/刪除保護** — 動既有程式碼前先做上下文分析與歸屬判定；刪除必須說明理由、搜尋全部引用、檢查 Feature Registry 影響並提供遷移方案（「看起來沒用」不是刪除理由）
- **CHANGELOG 變更分類** — 純文件變更 → 不記錄；Bug 修復 → `Fixed`；新能力 → `Added`；架構/行為/破壞性變更 → `Changed`
- **治理檔案保護** — `AGENTS.md` / `CLAUDE.md` / `docs/rules/** / docs/plans/archive/` / `.governance/manifest.json` / `.governance/preflight.json` / `.governance/git-policy.json` / `.governance/sync-rules.json` / `scripts/verify-governance.js` / `scripts/check-lock.js` / `scripts/check-git-policy.js` / `scripts/check-secrets.js / scripts/check-sync.js` / `opencode.json` 與 CI 設定（`.github/workflows/**`）受保護：修改須說明原因 → 更新 CHANGELOG → 升 `governance_version` → 執行校驗器；涉及權限/安全/校驗步驟的修改必須由使用者明確確認（防止 Agent 自我解除限制）
- **規則優先級** — 衝突依序裁決：系統/平台安全 > 使用者明確要求 > 治理完整性 > AGENTS.md > docs/rules/ > 既有程式碼慣例；一般任務永遠不能隱式繞過治理規則
- **Agent 權限矩陣** — 讀取自動；建立文件自動；改程式碼需驗證；刪程式碼 / 改相依性 / git commit 需確認；git push 未經使用者同意禁止
- **多 Agent 鎖** — `.governance/state.json` 記錄 `agent_id` / `task_id` / `locked`；不得並行修改同一檔案；當機後從記錄的階段續跑而非重跑
- **證據與復原** — 每項報告基於真實命令輸出，✅/⚠️/❌ 三態，禁止偽造「完成」；`preflight.json` 是回滾快照；阻塞項目必須上報，不得靜默略過
