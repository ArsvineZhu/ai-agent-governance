# Knowledge Freshness Detection（TASK 計劃）

[English](../../en/plans/knowledge-freshness.md) · [简体中文](../../zh-CN/plans/knowledge-freshness.md) · [繁體中文](knowledge-freshness.md)

### 任務目的

把漂移偵測從**存在性**升級到**新鮮度**：標記相對程式碼活躍度已經過時的治理文件，在知識腐化變成技術債之前發現它。

### 當前問題

- drift-check 只比對聲明的工件是否存在 + `governance_version` —— 一份**存在但過時**的文件每次檢查都通過
- 程式碼每週在變，而 `docs/ARCHITECTURE.md` 幾個月沒動 → 知識在無聲腐爛
- 兩份必更文件（ARCHITECTURE.md、CHANGELOG）沒有任何過時訊號

### 提議方案

drift-check 增加 `freshness` 模式（僅報告，**絕不做閘門**）：

- 每份文件的過時度 = 距其**最後一次 git 提交**的天數 vs 同期程式碼活躍度（`src/` 等目錄的提交）
- **必須用 `git log -1 --format=%cs -- <文件>`，不能用檔案 mtime** —— 全新 clone 的所有 mtime 都等於檢出時間
- 閾值（建議性）：程式碼活躍而文件 30+ 天未提交 → `stale`；90+ 天 → `very stale`
- 結果寫入現有 `.governance/drift-report.json` 的 `"stale": ["docs/ARCHITECTURE.md", ...]` 欄位
- 兩份必更文件優先報告；feature 文件一併納入

### 受影響檔案

- `references/templates/sub-skills.md` —— drift-check 增加 `freshness` 模式
- `.governance/drift-report.json` schema —— 增加 `stale` 陣列（執行期輸出；僅 schema 說明）
- `docs/commands.md` —— 命令文件同步
- 校驗器：**不變**（建議性報告，不是檢查項）

### 風險

- **穩定專案誤報** —— 低提交量專案可能顯示過時；僅報告（不改變退出碼）可完全中和
- **git-log 與 mtime** —— 必須用提交日期；這是設計斷言，不是實作細節
- **檔案移動/重命名** —— 重新命名會重置 `git log -- <path>` 歷史；v1 接受，v1.1 可用 `--follow`

### 驗證方法

- 合成 git 歷史：文件 60 天未動 + 程式碼活躍 → 標記 `stale`（測試）
- 近期改動過的文件 → 不標記（測試）
- 全新 clone（mtime 全同）仍經 git log 算出正確過時度（測試）
- drift-report.json 含 `stale` 陣列；校驗器退出碼不變（迴歸）
