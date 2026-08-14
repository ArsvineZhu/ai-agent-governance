# Agent Operating Lifecycle

[English](../en/lifecycle.md) · [简体中文](../zh-CN/lifecycle.md) · [繁體中文](lifecycle.md)

被治理專案中任何 Agent 執行的每個開發任務都必須遵循六階段生命週期（摘要見 AGENTS.md；本頁為完整規範）。

### 六階段

**階段 1 —— Understand（理解）**。先讀 AGENTS.md、docs/ARCHITECTURE.md、docs/features/（列出目錄以發現全部功能）與最近的 CHANGELOG.md。確認：目前系統結構、已存在的功能、相關約束、受影響 Feature 文件的 Modification Rules。

**階段 2 —— Plan（計劃）**。任何中大型修改都必須先建立 `docs/plans/TASK_<name>.md`，包含：

- Status（Active / Completed —— 建立時為 Active）
- Task Purpose（任務目的）
- Current Problem（目前的問題）
- Proposed Solution（提議方案）
- Affected Files（受影響的檔案）
- Risks（風險）
- Validation Method（驗證方式）

小型變更（修 typo、單一函式微調）可略過本階段，但必須在報告中說明略過的理由。

**階段 3 —— Implement（實作）**。遵循 docs/ARCHITECTURE.md 的約束；不破壞既有功能；不隨意變更目錄結構；保持向後相容；新增模組必須登記（New Code Registration）。

**階段 4 —— Validate（驗證）**。用 AGENTS.md 的裸命令執行測試、靜態檢查、型別檢查與建置，記錄**真實輸出**（不是「應該沒問題」）。

**階段 5 —— Synchronize（同步知識）**。更新 CHANGELOG.md（已完成變更）、Feature 登記（docs/features/）、架構文件（如有變化），勾選 `docs/plans/DEVELOPMENT_PLAN.md` 中的對應里程碑（如存在），並把已完成的 `TASK_<name>.md` 的 `## Status` 更新為 `Completed`。歸檔在發佈（RELEASE）時統一執行，不在本階段。

**階段 6 —— Report（報告）**。最終輸出：修改檔案列表、新增功能列表、刪除內容列表、驗證結果、文件更新情況。

### 變更分類（何時寫 CHANGELOG）

| 變更類型 | CHANGELOG 動作 |
| --- | --- |
| 僅文件/註解/typo | 不更新 |
| Bug 修復 | `Fixed` |
| 新能力 | `Added` |
| 架構/行為/破壞性變更 | `Changed` |

### 成熟度等級（INIT 策略）

| 等級 | 判定 | 策略 |
| --- | --- | --- |
| L0 空倉庫 | 只有 README/無原始碼 | 建立完整治理骨架 |
| L1 原型 | 有少量原始碼，無測試/CI/文件體系 | 完整骨架 + 接管現有檔案（合併不覆蓋） |
| L2 活躍開發 | 有原始碼 + 測試 + 部分 CI/文件 | 增量補齊缺口，只建立缺失項目 |
| L3 生產專案 | 大量檔案 + 已有規範 | 稽核模式：差距報告 + 最小修補 |

### Definition of Done

程式碼 + 測試 + 全部品質閘門 + CHANGELOG + 文件同步，缺一不可，否則不算完成。

### 禁止

- 只修改程式碼，不更新專案知識
- 未走完 6 階段就宣稱完成
- 偽造/略過驗證輸出
