# Consent 政策重寫：提交前一次確認（TASK 計劃）

[English](../../en/plans/consent-policy-hardening.md) · [简体中文](../../zh-CN/plans/consent-policy-hardening.md) · [繁體中文](consent-policy-hardening.md)

**Target：both** —— 五個同步點：本倉庫側 `AGENTS.md`；載荷側 `references/policies/git.policy.md`（權威詳解）、`references/policies/lifecycle.policy.md`（Phase 2 確認門）、`references/templates/agents-md.template.md`（被治理專案模板摘要）、`SKILL.md`（權限矩陣）。改任何一處必須同步其餘四處，同步點清單見「受影響檔案」。

### 任務目的

清除三層補丁屎山，把確認政策從「每步確認 + 例外補丁」重構為單一原則——**提交前回顯完整 git 命令序列，確認一次後執行**。使用者說 push 後，展示將要執行的 add 檔案清單、commit 訊息（類型含在訊息前綴）、push 目標分支，使用者確認一次即執行完。計劃批准降級為意圖對齊；規模分級降級為決定是否寫計劃文件；完整 diff 不預設展示。政策曾被其作者多次違反（本會話真實事故），重寫目標是一次清掉舊框架，不留補丁。

### 當前問題

- 三層補丁疊床架屋：主規則「每次 Git 寫入操作當輪獨立確認」之上，先打 release 序列例外（v0.9.1），再打使用者顯式指令例外 A（本會話），還發生過漏改同步點後補（SKILL.md 例外二）。規則總數在增長，語義在互相打架。
- 兩個政策各自規定確認：一般更改政策按「計劃」確認（lifecycle Phase 2 確認門），Git 政策按「操作」確認（commit 一次、push 一次）。同一任務使用者要批兩次——先批計劃、再批提交，這正是「push 點這麼多確認」抱怨的根源。
- 例外 A 語義自相矛盾：同一段既有 "that instruction IS the consent" 又有 "take one confirmation"。本會話執行者選了前半句，跳過確認直接執行整個序列。
- 通用硬約束缺失：序列中途失敗後 agent 擅自改方式重試（本會話真實事故）、提交訊息不呈現導致擅自合併提交與擅自定訊息、push 被拒後可能擅自 pull/rebase。
- 寫入操作清單有缺口：restore、rm 未歸類；checkout 未分級——一刀切會與分支工作流程衝突（每個任務建分支多一次確認），但攜帶未提交改動切換確有覆蓋風險。

### 提議方案

**方案一：提交前一次確認（核心重寫，五個同步點同步改）**

- 唯一確認點 = 提交前命令回顯：任何任務（無論規模）完成後、提交前，回顯完整 git 命令序列——add 暫存哪些檔案、commit 訊息（多提交則逐條列出，類型含在訊息前綴）、push 目標分支；使用者確認一次，覆蓋整個序列（add → commit → push）。
- 計劃批准降級為意圖對齊：中/大型任務的 Phase 2 計劃批准只對齊「改什麼、怎麼改」，不再是提交確認。
- 規模分級降級：規模只決定「要不要寫 TASK 計劃文件」，不再決定「要不要給使用者確認」。
- 此設計消解兩個既有隱患：確認點與命令回顯綁定，不依賴「分支工作流程 + PR 審批」這個隱藏前提；規模不再決定要不要確認，「小型誤判」的兜底問題消失。
- release：Proposal 在 Approval Gate 批准後覆蓋整個序列（保留現狀——它本來就是把完整變更呈現給使用者批准的模型）。

**方案二：通用硬約束（無論哪類改動都適用）**

- 回顯必須是完整的 git 命令序列：暫存哪些檔案、每個提交的訊息、目標 remote/branch；使用者確認的是該序列，執行不得偏離。
- 序列中途失敗條款：任一步失敗 → 停止並報告，不得改用其他方式重試、不得即興修補，重新取得確認後繼續。
- 遠端拒絕條款：push 被拒（non-fast-forward）→ 停止並報告，不得擅自 pull/rebase 後再推。
- 歧義指令判例：加「提交一下」這類中文歧義例子，仍歸「先問」。

**方案三：寫入操作清單補全**

- restore、rm 補入獨立確認清單（有破壞性）。
- checkout 分級：建分支與乾淨工作區切換歸自動（與分支工作流程一致）；攜帶未提交改動切換需確認。
- amend 已推送的提交視同 force push，需獨立確認。

**方案四：閘門與驗證同步**

- consent 簇閘門標記重設計：按新政策的確認結構——一個授權點（提交前命令回顯確認）加兩個對齊點（計劃批准意圖對齊、release Proposal 批准）——重寫標記正則，同步點從四處擴為五處。
- 新增測試：命令回顯、失敗、遠端拒絕條款與 checkout 分級標註的存在性斷言（防止五處漏改）。
- 被治理專案側繼承：模板與規則改動隨 INIT 複製到下游專案，CHANGELOG 說明。

**方案五：提交一致性 hook（可選，預設不啟用，定位修正）**

- hook 定位從「授權校驗」改為「內容一致性校驗」（校驗實際提交 = 使用者確認過的命令序列對應的內容），與主流 husky/gitleaks 一類的內容校驗一致。
- 憑證 .governance/consent.json（git-ignored）記錄使用者確認過的提交指紋（檔案清單 + commit 訊息），hook 比對實際提交與指紋，不符即拒絕。
- 脆弱性：指紋比對是狀態比對——agent 回顯後哪怕改一行，指紋就對不上，hook 誤拒；主流 hook 做獨立可判檢查（lint/密鑰/格式），不做狀態比對。實施前須評估此脆弱性。
- 邊界誠實：憑證由 agent 寫入，防「提交偏離已確認的命令序列」，不防「完全繞過確認」；預設不啟用。

### 受影響檔案

- `AGENTS.md` —— Git Operation Safety Protocol 重寫：提交前一次確認原則 + 通用硬約束 + 寫入清單補全
- `references/policies/git.policy.md` —— 確認範圍權威詳解重寫
- `references/policies/lifecycle.policy.md` —— Phase 2 確認門改寫為意圖對齊；規模分級重定位
- `references/templates/agents-md.template.md` —— Git Write Policy 摘要同步
- `SKILL.md` —— 權限矩陣與確認範圍同步重寫
- `scripts/check-doc-consistency.js` —— consent 簇標記重設計
- `CHANGELOG.md` —— Changed 條目
- `tests/run-tests.js` —— consent 相關測試重寫 + 新條款存在性測試 + hook 一致性校驗測試
- `references/templates/githooks-template.md` —— pre-commit 鉤子模板（方案五）
- `references/init-spec.json` —— hook 生成聲明（方案五）

### 風險

- 五處語義漂移：緩解——consent 簇閘門 fail-closed，漏改任一處 gate 紅。
- 每個任務都要提交前確認，高頻小改動可能覺得繁瑣：緩解——小改動回顯的命令短、掃一眼即過。
- 重構範圍大、測試重寫多：緩解——按方案順序實施，方案一核心先行，方案五獨立可選。
- 新措辭破壞閘門正則造成假陽性：緩解——實施順序是「先驗證正則匹配再改文本」。
- 模板改動影響所有下游被治理專案：緩解——CHANGELOG 寫明行為變化，屬有意重構而非意外。

### 驗證方法

- 五個同步點語義一致：gate 新標記全過；回歸驗證——人為移除任一處標記 → gate 紅並指名。
- 場景演練（人工）：任何任務提交前都須回顯完整 git 命令等確認——小型 typo 改動也不例外。
- 場景演練（人工）：commit 失敗 → 停止報告；push 被拒 → 停止報告；均不得擅自改方式重試或 pull/rebase。
- 新條款存在性：五處均含命令回顯、失敗、遠端拒絕條款關鍵詞（由新增測試斷言）。
- hook 一致性校驗：實際提交偏離已確認的指紋時 commit 被拒（測試）；一致時放行（測試）。
- `npm run check` 與 `check:all` 全綠；交付對賬 gate 通過。

---
