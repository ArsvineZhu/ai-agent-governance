# Review Manager（TASK 計劃）

[English](../../en/plans/review-manager.md) · [简体中文](../../zh-CN/plans/review-manager.md) · [繁體中文](review-manager.md)

> **狀態：設計計劃，未實作。** 本頁是路線圖條目 `Review manager` 的詳細設計（見 [roadmap.md](../roadmap.md)），按 `docs/plans/TASK_<name>.md` 六欄位範本組織。

### 任務目的

把「多智能體深度審查」固化為規範工作流程：使用者說「審核一下」時，Agent 不再靠臨場發揮，而是按固定程序派並行子代理、分析改動、找問題、修復。這是 AI 自改程式碼後品質回看的標配能力，也是本倉庫與被治理專案的共同剛需。

### 當前問題

- 使用者實際使用已驗證需求：兩次人工發起的審查分別發現 2 嚴重 + 6 一般 + 6 瑣碎真實問題——但這個效果依賴主 Agent 臨場狀態，**沒有固定的工作流程保證每次審查都有最低品質**
- 可能漏派領域（如只查腳本忘了查文件）、漏查邊界情況、修復不徹底
- 與 drift-check 的邊界在會話中被錯誤混淆過一次（「審核」被口頭對應到 consistency 模式）——需要明確定義，防止再次混淆
- 現有子技能（drift-check 等）全是**機械檢查**，負責防遺漏；**沒有任何子技能負責深度找問題**

### 提議方案

新增第 8 個子技能 **review-manager**（審核管理器）。

觸發詞：`審核一下` · `審核改動` · `review the changes` · `audit recent changes` · `review my changes`

工作流程（五步）：

1. **確定範圍**：`git diff <基線>..HEAD` + 未提交改動；基線預設上次審查點（手動指定，v1 不做自動記錄）。**範圍約束：只審改動集 + 直接受影響檔案（被改腳本影響的測試、被改政策影響的生成物），不做全專案審查——全專案審查僅在使用者顯式要求時**
2. **派並行子代理**（固定 5 個領域，每領域一個，v1 不允許動態擴充）：
   - 腳本邏輯 —— 正確性、邊界情況、錯誤處理
   - 文件一致性 —— 三語樹、連結、版本示例、CHANGELOG 對帳（呼叫 drift-check 腳本作為輸入）
   - 測試覆蓋 —— fixture 真實性、斷言強度、flaky 風險
   - 治理工件 —— 政策、範本與實作是否一致、受保護清單
   - 安全 —— 密鑰、權限規則、敏感資訊
3. **彙總**：按嚴重度排序（嚴重/一般/瑣碎），每條帶檔案路徑 + 行號 + 證據原文
4. **修復**：嚴重和一般必須修；瑣碎項報告後由使用者決定
5. **閘門驗證**：修復後跑 `npm run check`（測試 + parity），記錄真實輸出

**與 drift-check 的邊界（防混淆，明確定義）**：

| | review-manager | drift-check |
| --- | --- | --- |
| 層級 | 深度（多智能體找問題） | 機械（防遺漏） |
| 輸入 | git diff + 全專案相關檔案 | manifest + 8 類腳本檢查 |
| 產物 | 嚴重度排序的問題清單 + 修復 | drift-report.json |
| 觸發 | 「審核一下」 | `check governance drift` |

互補關係：review-manager 的「文件一致性」子代理**呼叫** drift-check 腳本，不重複實作。

被治理專案注意：review-manager 聚焦**治理工件 + 最近改動**；業務邏輯審查範圍由專案自身規範決定，不強制。

### 受影響檔案

- `references/templates/sub-skills.md` —— 新增第 8 節 review-manager
- `docs/{en,zh-CN,zh-TW}/commands.md` —— 觸發詞入可用提示詞表 + 提示詞詳情小節
- `SKILL.md` —— Phase 1 第 13 步子技能清單加入 review-manager
- `docs/{en,zh-CN,zh-TW}/architecture.md` —— 子技能清單
- `CHANGELOG.md` —— 新增子技能條目
- prompt-sync 檢查自動涵蓋新觸發詞（現有機制，無需額外改動）

### 風險

- **與 drift-check 混淆** —— 本會話已發生一次；用上表邊界定義 + 觸發詞完全分離緩解
- **審查深度失控** —— 子代理無限展開；v1 固定 5 領域清單，不允許動態擴充
- **修復引入新問題** —— 強制修復後跑閘門組（第 5 步）
- **子技能數量變化** —— 7 → 8，數值聲明（如「7 個子技能」）需同步更新，consistency 的數值檢查會提醒

### 驗證方法

- sub-skills.md 含第 8 節且觸發詞完整（文件斷言）
- commands.md 三語含新觸發詞（prompt-sync 測試自動涵蓋）
- 實際執行一次「審核一下」：派 5 領域子代理、輸出嚴重度排序報告（狗糧驗證）
- 子技能總數聲明更新（consistency 數值檢查通過）
