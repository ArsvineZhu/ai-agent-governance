# Tiered Review Gate（TASK 計劃）

[English](../../en/plans/tiered-review-gate.md) · [简体中文](../../zh-CN/plans/tiered-review-gate.md) · [繁體中文](tiered-review-gate.md)

> **狀態：設計計劃，未實作。** 本頁是路線圖條目 `Tiered review gate` 的詳細設計（見 [roadmap.md](../roadmap.md)），按 `docs/plans/TASK_<name>.md` 六欄位範本組織。

### 任務目的

在 release/push 之前建立**分級審核閘門**：輕量級機械檢查總是自動跑（零 token、秒級），深度審查（review-manager）按變更風險等級選擇性觸發——把「審核」從「要麼全做要麼不做」變成按風險分級，既防遺漏又不騷擾。

### 當前問題

- 輕量級檢查（機械腳本組）**已實作且已接入**：release 前置（tests.required / docs.parity_passed / validator.passed）、push 前（check-secrets / check-git-policy）、任務完成前（npm run check）——但**分級決策邏輯缺失**
- 深度審查（review-manager，計劃中）成本高（多子代理、高 token），不能每次 push/release 都跑
- 目前沒有規則定義「什麼變更需要深度審查、什麼變更輕量級通過即可」——要麼靠主 Agent 臨場判斷（不可靠），要麼一刀切（要麼騷擾要麼漏審）
- 與專案已有權限模型的哲學不一致：權限矩陣是分級的（Read 自動 / 改程式碼驗證 / 刪除確認 / push 禁止），審核卻沒有分級

### 提議方案

在 release 流程的 Release Proposal 中加入**變更風險分級 + 審核建議**：

**分級規則（寫入 release.md 與 review-manager 計劃）：**

| 風險等級 | 變更類型 | 審核要求 |
| --- | --- | --- |
| 低 | docs/typo/版本號/連結修正/格式 | 輕量級閘門自動跑，通過即提交，不詢問 |
| 中 | 新功能/腳本邏輯/政策變更/範本變更 | 輕量級閘門 + Proposal 報告「建議深度審查」；使用者批准時決定是否先跑 review-manager |
| 高 | 安全/權限/刪除保護/治理檔案（SKILL.md、references/policies/**、scripts/*.js 的行為變更） | 必須先跑 review-manager，或使用者逐項明確確認，否則不發佈 |

**Proposal 增加一行**：

```
Risk level: low / medium / high
Review recommendation: none / suggested (review-manager) / required (review-manager or explicit approval)
```

**執行語義**：

- 輕量級（`npm run check` 閘門組 + release 前置檢查）**總是自動跑**——這是底線，零成本
- 低風險：輕量級通過 → 正常走批准 → 發佈
- 中風險：輕量級通過 → Proposal 註明建議 → **決定權在使用者批准時行使**（不每次 push 打斷，只在 release 決策時問一次）
- 高風險：輕量級通過後**必須先**跑 review-manager（聚焦 git diff 範圍，非全專案）或使用者逐項確認

**review-manager 範圍約束**（配套，解決 token 成本）：

- 審查範圍 = 本次 `git diff` 改動集 + 直接受影響檔案（被改腳本影響的測試、被改政策影響的生成物）
- **不是**全專案審查；全專案審查僅在使用者顯式要求時

### 受影響檔案

- `references/workflows/release.md` —— Proposal 增加風險等級 + 審核建議；分級規則表
- `docs/zh-CN/plans/review-manager.md`（三語）—— 補充「範圍 = git diff，非全專案」約束 + 分級觸發語義
- `references/templates/sub-skills.md` —— release-manager 子技能描述同步分級邏輯
- `docs/{en,zh-CN,zh-TW}/commands.md` —— release 提示詞詳情同步
- `CHANGELOG.md`

### 風險

- **分級判定依賴 AI 判斷** —— 「中/高」的邊界可能被 Agent 低估；用類型清單（高風險的明確列舉）而非自由裁量緩解
- **中風險的建議被使用者慣性跳過** —— 與方案 2（每次詢問）的失敗模式相同；在 Proposal 裡用醒目標註 + 預設勾選緩解
- **高風險定義過寬** —— scripts/*.js 行為變更全部列為高風險可能過度；v1 保守（寧高勿低），v1.1 再細化

### 驗證方法

- release.md 含分級規則表與 Proposal 新欄位（文件斷言）
- review-manager 計劃含「範圍 = git diff」約束（文件斷言）
- 模擬：低風險變更 Proposal 輸出 "risk: low, review: none"；高風險變更輸出 "risk: high, review: required"（人工驗證/狗糧）
- 輕量級閘門在 release 前置中不重複、不缺失（對照 release_requirements 表核對）
