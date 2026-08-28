# 審查後備積壓（TASK 計劃）

[English](../../en/plans/post-review-remediation.md) · [简体中文](../../zh-CN/plans/post-review-remediation.md) · [繁體中文](post-review-remediation.md)

> **狀態：設計計劃，未實作。** 交付對帳（`scripts/check-plan-delivery.js`）跳過純設計計劃；本行即標記。本計劃是 v0.10.0 深度審查的後備積壓清單，尚未開始實作。

**Target：both** —— 載荷側 `scripts/`（既有腳本缺陷）與倉庫側 `docs/`（歸檔死鏈、文件計數）。鉤子待辦指向未來重新實作時涉及的 `references/templates/` 與 `references/init-spec.json`。清單見「受影響檔案」。

### 任務目的

把 v0.10.0 深度審查（五個領域：腳本邏輯 / 文件一致性 / 測試覆蓋 / 治理工件 / 安全）發現的兩類待辦固定為可追蹤清單，作為後續版本的工作藍圖：**（一）既有缺陷**——v0.9.1 之前就已存在、非本版本引入；**（二）鉤子重新實作待辦**——`.githooks/pre-commit` 撤出 v0.10.0 後，未來若要重做，必須做對的全部要點。

### 邊界說明

本計劃**不承載**本版本引入的發布阻斷項（第 5 同步點 `lifecycle.policy.md` 未接入 `CONSENT_SYNC_GROUPS`、載荷模板 push 權限矛盾、`stash`/`pull` 淨損失、空轉測試、`--doc-root` 路徑穿越、`check-plan-delivery.js` 自身的證據空洞、protected-files 集群強制 0 文件、CHANGELOG/roadmap/AGENTS.md 計數漂移）。這些屬於 v0.10.0 發布前立即修復，另行處理。此處只記錄**既有缺陷**與**鉤子 B 待辦**兩類。

### 一、既有缺陷（v0.9.1 前已存在）

按檔案列出，每條帶行號與證據。

1. `scripts/verify_governance.js:202` —— `{ name: "Sync groups check", ok: isFile }` 傳入函數引用而非呼叫結果。函數物件恆真，該檢查**永久空過**，且 JSON 結果的 `ok` 欄位被 `JSON.stringify` 丟棄。實證：從被治理專案刪除 `scripts/check-sync.js`，validator 仍報 `7/7 passed`。SEVERE。
2. `scripts/check-sync.js:47` —— porcelain 解析 `/^..\s+(.+)$/` 遇 git 引號路徑（`core.quotepath` 預設開啟，中文/空格檔名被轉義）靜默漏檢；rename 行的 `->` 混入捕獲路徑。SEVERE。
3. `scripts/check-sync.js:47,:91` —— 未跟蹤新檔案被 git 折疊為父目錄名（`?? docs/`），導致已滿足的 `require` 被誤判為未同步。需 `--porcelain -uall`。GENERAL。
4. `scripts/check-lock.js:24` —— 僅 `null`/`undefined` 釋放鎖，`locked: false` 與 `locked: ""` 被當作鎖持有；JSON 輸出 `{"locked": true, "lock": false}` 自相矛盾。GENERAL。
5. `scripts/check-lock.js:18`、`scripts/check-sync.js:21`、`scripts/check-git-policy.js:19` —— `catch { return null }` 把「檔案不存在」與「JSON 損壞」合併為同一分支，損壞時靜默按安全態處理（鎖檔案損壞放行第二 agent；sync-rules 損壞禁用門禁）。應區分 `ENOENT` 與 `SyntaxError`，後者 fail-closed。SEVERE。
6. `scripts/check-secrets.js:11-17` —— 僅 5 個模式；漏 Slack/Google/Stripe/Azure/JWT/base64/PEM 主體/帶標點密碼；credential 賦值的字元類排除 `/+=!@$%`；`.env` 在 IGNORED_PATHS 中被整體跳過（`git add -f .env` 通過）；`:59` 報 `line: "staged-diff"` 佔位符而非真實行號。GENERAL。
7. `scripts/check-doc-consistency.js:110` —— `mdFiles` 用 `rel.startsWith("archive/")` 判定，與 Windows 的 `path.relative` 結果 `archive\a.md` 永不相等，`docs/archive/` 的連結永不掃描。GENERAL。
8. `docs/archive/` —— 因第 7 條的盲點，10 個死鏈從未被報告：`sync-groups-mechanical-check.md`、`governed-project-sync-groups.md`、`review-manager.md`、`tiered-review-gate.md` 內指向語言樹的返回連結（`../../en/plans/...`）及 `../roadmap.md` 均不解析。GENERAL。
9. `scripts/generate-governance.js:288` —— `governance_version` 硬編碼為 `"0.9.0"`，比 `package.json` 落後一個版本。每次 INIT 生成的 `.governance/manifest.json` 都自報 0.9.0；release 版同步流程不更新它，因此由 v0.9.1 初始化的專案各自報到舊版本。SEVERE（版本一致性）。

### 二、鉤子重新實作待辦（B 方案，撤出後若要重做必須做對）

1. `.governance/consent.json` 加入生成的 `.gitignore` 與 `references/policies/governance-files.policy.md` 的 `.governance/` 追蹤表——模板宣稱「git-ignored」，生成的 `.gitignore` 卻沒有它。
2. fail-open 改為 fail-closed——`consent.json` 缺失時 exit 1 報錯，而非 `[ -f ] || exit 0` 靜默放行（刪除憑據即禁用檢查）。
3. 校驗 commit message——`consent.json` 已記錄 `message` 欄位，現鉤子解析後丟棄；message 是用戶實際讀取的唯一欄位，偏離未被約束。
4. 「脆弱性」章節註明 `--no-verify` 與 `git config --unset core.hooksPath` 兩條繞過路徑——目前模板誠實說明「不能防完全繞過」，但未點名這兩個最直接的動詞。
5. 修復空格/中文檔名假拒——改 `git -c core.quotePath=false diff --cached --name-only -z`；不用 `tr -d ' '` 刪除檔名內部空格、不用逗號作分隔符。
6. 提取邏輯改 fence-count——`generate-governance.js:86-94` 從首個 ``` 切到末個 ```，模板加第二個程式碼區塊即靜默破壞鉤子。
7. `references/init-spec.json` 的 artifact type 從 `documentation` 改為正確類別——提交門控鉤子被歸類為文件。
8. 生成的 `.githooks/pre-commit` 納入 governance-file-protection 保護清單——目前只有模板受保護，生成進目標專案的鉤子是普通檔案。
9. 測試用真 sh 執行——廢除「JS 重寫指紋邏輯」的恆真測試，改為 `sh -n` 語法校驗 + 真實 git 提交（匹配/不匹配/缺憑據）驗證。
10. 可執行位 755——生成產物當前 mode 666，POSIX 目標下不可執行。

### 三、驗證方法（修復後逐項對照）

- 第 1 條：刪除被治理專案 `scripts/check-sync.js` 後 validator 必須報失敗並保留 `ok` 欄位。
- 第 2/3 條：構造中文、空格、rename 檔名的暫存改動，`check-sync.js` 必須正確命中/不誤報 watch 組。
- 第 4/5 條：`locked:false`、`locked:""`、損壞 state.json 各自的行為須可區分，損壞態 fail-closed。
- 第 6 條：對已知真實密鑰形狀（Slack/Google/Stripe/JWT/PEM 主體/帶標點密碼/force-added `.env`）逐一驗證阻斷。
- 第 7/8 條：修復後 `docs/archive/` 死鏈須被 `npm run check` 報出（而非靜默綠）。
- 第 9 條：新生成的 manifest 的 `governance_version` 須與 `package.json` 一致；重跑 INIT 後的 manifest 報當前版本而非 0.9.0。
- 鉤子 1-10：全部落地後，在真 sh 環境用真實 git 提交矩陣驗證；`npm run check` 與 `npm run check:all` exit 0，測試數上調且無恆真斷言。

### 受影響檔案

- scripts/verify_governance.js —— 第 1 條
- scripts/check-sync.js —— 第 2、3、5 條
- scripts/check-lock.js —— 第 4、5 條
- scripts/check-git-policy.js —— 第 5 條
- scripts/check-secrets.js —— 第 6 條
- scripts/check-doc-consistency.js —— 第 7 條
- docs/archive —— 第 8 條（死鏈內容修正）
- references/templates/githooks-template.md —— 鉤子 1-10
- references/init-spec.json —— 鉤子 1、7
- references/policies/governance-files.policy.md —— 鉤子 1、8
- scripts/generate-governance.js —— 鉤子 6、第 9 條
- tests/run-tests.js —— 鉤子 9 及第 1-6 條迴歸測試

### 風險

- **批次過大**：既有缺陷橫跨 7 個腳本，一次修復面廣；建議按 SEVERE 優先分批，每批獨立跑門禁。
- **鉤子是否重做未定**：A 方案撤出後，是否值得重新引入鉤子本身是開放問題；本清單是「若重做則必須做對」的約束，不是重啟鉤子的承諾。
- **check-secrets 模式擴展**：新增模式有誤報風險，需配真實樣本與陰性樣本雙向驗證，避免把普通文本當秘密阻斷。

---
