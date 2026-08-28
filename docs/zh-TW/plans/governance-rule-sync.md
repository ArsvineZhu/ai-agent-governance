# 治理規則同步與元治理（TASK 計劃）

[English](../../en/plans/governance-rule-sync.md) · [简体中文](../../zh-CN/plans/governance-rule-sync.md) · [繁體中文](governance-rule-sync.md)

**Target：both** —— 本倉庫基礎設施（`AGENTS.md`、`package.json`、`tests/`、ADR、本計劃）與 skill 載荷（`scripts/check-doc-consistency.js`）。跨域同步義務見「受影響檔案」；本計劃是 Target 欄位的首個用例。

### 任務目的

把本倉庫的「輕量級治理」從預設狀態升級為**被設計的系統**：同一規則跨兩個域（本倉庫 / skill 載荷）的同步由機械閘門保障，而非靠人工找齊；治理原則的劃分標準與索引落成明文；「為何不狗糧」凍結為 ADR，不再每次口頭解釋。

### 當前問題

- 四個共享規則簇（consent 條款、受保護檔案概念、語言政策、發佈路徑映射）跨兩個域各自表達，同步靠人工。已有兩次事故史：v0.5.1 受保護檔案摘要漏 3 項；v0.9.1 consent 例外只修了 4 個同步點中的 3 個，漏掉 SKILL.md，本次會話才發現。
- 載荷邊界缺閘門的後果已實證：`_lib.js` 重構讓 82/82 全綠的測試套件放行了「下游全崩」的載荷（已 revert，已補 payload 閘門）。但同一類「跨域一致性」問題在其餘規則簇上沒有機械防線，下一次事故只是時間問題。
- 治理原則的劃分標準從未寫明：為什麼權限矩陣在 SKILL.md 而 git 策略細則在 references/policies/，只能靠讀檔案角色推斷；也沒有原則索引，「有哪些原則、各在哪」每次都要重拼。
- 「本倉庫為何不狗糧」沒有記錄，每次討論都要重新論證；AGENTS.md 只用一句話帶過（"skill distribution repository, lightweight governance"），不足以支撐決策。

### 提議方案

分三個遞進階段，按必要性排序：

**P1 · 共享規則簇機械閘門（必須）**

- 擴充 `scripts/check-doc-consistency.js`，新增 `--gate` 模式（沿用 `check-plan-delivery.js` 先例：預設 advisory exit 0，`--gate` 時 fail-closed）。
- gate 模式只包含兩個可機械判定的簇：consent 簇與受保護檔案簇；其餘啟發式檢查（版本示例、連結等）保持 advisory。**前置條件**：現有 protected_lists 檢查會對「僅順帶提到保護流程」的文件誤報（本計劃初稿即觸發 12 項，因為正文提到了治理檔案保護流程），升為 gate 前必須先收緊觸發條件——只對**聲稱列舉清單**的文件要求列全，不對引用流程的文件要求。完整清單見 `references/policies/governance-files.policy.md`（單一事實源）。
- consent 簇斷言：四個同步點（`AGENTS.md` / `references/policies/git.policy.md` / `references/templates/agents-md.template.md` / `SKILL.md`）每處必須聲明例外 A、例外 B、「只免追問不免回顯」三項。
- 關鍵設計——**對存在的同步點做一致性斷言**：skill 倉庫形態下檢查全部 4 處；被治理專案形態下只檢查存在的 2 處（生成的 AGENTS.md + `docs/rules/git-policy.md`），缺失的同步點自動跳過。這樣 `--gate` 在被治理專案裡同樣有意義，而不是誤報。
- `package.json` 的 gate 組接入 `check-doc-consistency.js --gate`；`--gate` 模式同時輸出啟發式報告，因此 `check:all` 移除原有的重複呼叫（同一腳本不得跑兩遍）。注意該腳本在 init-spec.json 的 copy 清單裡，屬載荷腳本，改動走治理檔案保護流程。

**P2 · 明示化（建議）**

- 計劃格式新增 `Target: payload | repo-infra | both` 欄位；`Target=both` 時必須列舉每個域的同步點。本計劃即為首例。
- 影響面核對（Impact-face check）收尾時用 Target 判斷越界：改了聲明域之外的檔案 → 報告說明。保持人工核對，不做 fail-closed；機械 advisory 留待實際違規出現後再硬化。
- 劃分標準（judge rule）寫入 AGENTS.md：SKILL.md 策略層 = 每次執行必須讀的 skill 執行者規則；references/policies/ = 被治理專案的內容工件；AGENTS.md = 本倉庫規則。判據：執行具體任務時，agent 不讀這條會不會做錯。
- 原則索引寫入 AGENTS.md：每條原則 ×（名稱 | 權威所在 | 適用對象），只做指標不複述內容。條目數**按實際清點**，不預設——清點是 P2 的第一步（SKILL.md 策略層現為 13 節，另需併入 release.md、init-spec、lifecycle 裡的原則，口徑在清點時確定）。

**P3 · ADR-0006「本倉庫為何不狗糧」（建議，P1/P2 完成後寫）**

- 三條理由：風險錯配（validator 校驗軟體專案風險，本倉庫四種真實失敗模式它一個不覆蓋）；循環依賴（生產者的治理不得依賴產品，否則產品 bug 先摧毀自己的治理）；形態錯配（無 src/features 對象，強上會製造空殼工件，違反自己的反虛構原則）。
- 後果聲明：本倉庫治理 = release flow + plans/archive + ADR + tests + 閘門；`verify_governance.js` 在此 exit 1 是特性不是缺陷。

### 受影響檔案

- `scripts/check-doc-consistency.js` —— 新增 `--gate` 模式；載荷腳本，走治理檔案保護流程
- `package.json` —— gate 組接入 `--gate` 步驟
- `tests/run-tests.js` —— `--gate` 模式測試（含被治理專案形態下同步點缺失自動跳過、consent 簇回歸測試）
- `AGENTS.md` —— Target 欄位定義、judge rule、原則索引
- `docs/design-decisions/adr-0006-no-dogfooding.md` —— 新增，不狗糧決策記錄（共享單語簡體中文；檔名沿用現有 ADR 的小寫編號加短橫線慣例，不得用萬用字元——交付閘門只認字面路徑）
- `CHANGELOG.md` —— Added（--gate）+ Changed（protected-files 升格為 gate）
- `docs/{en,zh-CN,zh-TW}/plans/governance-rule-sync.md` —— 本計劃（三語）

同步組複核（非交付聲明）：本次改動不新增提示詞、不改 validator 檢查項，按 sync group 規則核對後預期無需更新使用者手冊與校驗器文件；實施時確認。此處刻意不寫檔名——交付閘門會把「受影響檔案」區塊內的每個反引號 token 當作交付聲明。

關於交付閘門的語義：本計劃是實施計劃（非純設計計劃），不帶 `Status: design plan` 標記，因此 `check-plan-delivery.js --gate` 會掃描它。**在 P3 完成前，ADR 檔案尚不存在，`--gate` 會 exit 1 並擋住 release——這是預期的 fail-closed 行為**，不是缺陷；歸檔由 release 流程在實施完成後執行。

### 風險

- `--gate` 擴大 `check-doc-consistency.js` 職責（建議層 + 局部 gate 混合）：緩解——gate 只含兩個機械判定簇，啟發式檢查仍歸 advisory，兩個模式共享解析程式碼。
- consent 簇同步點在檔案重新命名或路徑調整後誤報：緩解——同步點清單集中為腳本頂部常數，單處維護。
- 原則索引隨檔案移動而漂移：緩解——gate 增加「索引指標必須解析」斷言。
- Target 欄位只在計劃被寫時生效（本會話 13 檔案大改動根本沒寫計劃）：緩解——Target 不解決執行紀律問題，但把越界從「事後驚訝」變成「計劃裡就可見」。

### 驗證方法

- 回歸驗證（consent 簇）：人為移除四個同步點任一一處的例外 A 標記 → `--gate` exit 1 並指名檔案；恢復後 exit 0。
- 被治理專案形態：Phase-C INIT 產物中跑 `--gate` → 缺失的同步點自動跳過，不誤報。
- `npm run check` 全綠（含新 gate 步驟）；不帶 `--gate` 的 advisory 模式保持 exit 0（建議層契約不變）。
- 原則索引的每個指標可解析（由 gate 斷言，而非人工核對）。
- `adr-0006-no-dogfooding.md` 存在於 `docs/design-decisions/`，狀態 Accepted；此時本計劃的全部聲明可解析，`check-plan-delivery.js --gate` 對本計劃 exit 0，release 不再被擋。

---
