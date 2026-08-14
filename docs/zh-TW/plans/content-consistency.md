# Content Consistency Check（TASK 計劃）

[English](../../en/plans/content-consistency.md) · [简体中文](../../zh-CN/plans/content-consistency.md) · [繁體中文](content-consistency.md)

### 任務目的

補全漂移偵測三合一：drift-check 現在管**存在性**（工件在不在？），將來管**時效性**（文件過沒過時？）；缺的維度是**一致性**——文件之間的交叉矛盾（版本示例滯後、受保護清單分裂、ADR 狀態過期、roadmap 目標過期、連結失效、數值聲明錯誤）。這些問題全是機械可查的、且反覆出現，但目前沒有任何機制能抓到。

### 當前問題

真實事故（本倉庫 2026-08-13 自查發現）：

1. manifest/release 示例還寫著 `0.3.3`，當前版本已是 `0.5.0` —— 照此 INIT 的專案首次 AUDIT 就會報幽靈版本漂移
2. 受保護檔案清單在 4 處與單一事實來源（`governance-files.policy.md`）漂移，漏了 `git-policy.json` / `check-lock.js` / `check-git-policy.js`
3. ADR-0004 狀態停在 `Accepted (Unreleased)`，而功能早在 v0.4.0 已發佈
4. roadmap 目標 `v0.5.0` 已發佈卻不含該項 —— 本倉庫在 v0.4.1 修過同樣的錯，之後又犯
5. 數值聲明（校驗器檢查項數）必須與校驗器原始碼一致

這些既不是存在性問題也不是時效性問題——是**文件之間的矛盾**，且全部可機械偵測。

### 提議方案

drift-check 增加 `consistency` 模式（僅報告；與 `freshness` 成對，都寫入 `.governance/drift-report.json`）：

檢查類別（v1）：

1. **版本示例同步** —— grep 文件/範本中的 `governance_version` / manifest 示例值；與當前聲明版本不符的標記
2. **受保護檔案清單同步** —— 各處受保護檔案摘要必須與單一事實來源（`docs/rules/governance-files.md` 或對應 policy 檔案）一致；缺項/多出按路徑標記
3. **ADR 狀態同步** —— 狀態為 `Accepted (Unreleased)` 但功能已出現在已發佈 CHANGELOG 章節的 ADR 標記為過期
4. **Roadmap 目標有效性** —— 未完成項的目標版本 ≤ 當前版本的標記為目標過期
5. **連結有效性** —— 文件中的相對 markdown 連結必須能解析到真實檔案
6. **數值聲明** —— 文件中的計數（子技能數、校驗器檢查項數、測試數）必須與實際來源一致
7. **多語言結構一致性（三樹）** -- 開發者面向檔案（三棵目錄樹 `docs/en/`、`docs/zh-CN/`、`docs/zh-TW/`，入口檔案映射：英文=根 `README.md`/`CONTRIBUTING.md`，簡/繁=各樹內 `README.md`/`CONTRIBUTING.md`；Agent 面向檔案與共享區歷史記錄按政策為單語，直接跳過）：對每棵樹的同名檔案做結構比對--各層級標題數量與順序、程式碼區塊數量、表格行列數、列表項數量；不一致即標記。結構性同步 ≠ 語義性同步（翻譯品質仍由人/Agent 複核）

報告形態（追加進 drift-report.json）：

```json
{ "consistency": { "version_examples": ["SKILL.md:266"], "protected_lists": ["docs/anti-regression.md"], "adr_statuses": ["adr-0004"], "roadmap_targets": ["skill-lifecycle"], "broken_links": [], "numeric_claims": [] } }
```

### 受影響檔案

- `references/templates/sub-skills.md` —— drift-check 增加 `consistency` 模式
- `.governance/drift-report.json` schema —— `consistency` 物件（執行期輸出；僅 schema 說明）
- `docs/commands.md` —— 命令文件同步
- 校驗器：**不變**（建議性報告，不是閘門；這些檢查是啟發式的，不 fail-closed）

### 風險

- **誤報** —— 啟發式（如版本示例 grep）可能命中有意的歷史提及（CHANGELOG 條目、ADR-0001 的舊路徑說明）。緩解：掃描排除 `CHANGELOG.md` 與 `docs/archive/`；僅建議性報告
- **檢查範圍膨脹** —— 每類檢查必須保持機械（grep/解析/比對），絕不做語義判斷；語義審查留給 Agent
- **與校驗器內容檢查重疊** —— 校驗器現有的 CHANGELOG 格式檢查保持 fail-closed；一致性檢查是建議性的、範圍更廣

### 驗證方法

- 播種漂移 fixture：版本示例滯後 + 受保護清單分裂 + `Accepted (Unreleased)` ADR + roadmap 目標過期 → 四類全部標記（測試）
- 多語言一致性 fixture：三棵樹同名檔案標題數量不一致 → 標記；一致 → 乾淨（測試）
- Agent 面向檔案（`SKILL.md`、`references/**`）被一致性檢查跳過（測試）
- 乾淨 fixture → 一致性報告為空（測試）
- `CHANGELOG.md` 與 `docs/archive/` 被版本示例掃描排除（測試）
- 校驗器退出碼不變（迴歸）
