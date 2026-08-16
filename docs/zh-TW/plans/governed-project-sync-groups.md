# Governed-Project Sync Groups（TASK 計劃）

[English](../../en/plans/governed-project-sync-groups.md) · [简体中文](../../zh-CN/plans/governed-project-sync-groups.md) · [繁體中文](governed-project-sync-groups.md)

> **狀態：設計計劃，未實作。** 本頁是路線圖條目 `Governed-project sync groups` 的詳細設計（見 [roadmap.md](../roadmap.md)），按 `docs/plans/TASK_<name>.md` 六欄位範本組織。

### 任務目的

把隱式同步規則變成**顯式、可對照的聲明**，讓被治理專案的 Agent 不再隨檔案增長而漏同步。本 skill 倉庫自身有硬編碼的同步檢查（`check-doc-consistency.js` 的 prompt-sync）；被治理專案需要**聲明式、專案專屬**的等價物。

### 當前問題

被治理專案的同步目前是純規則文本（生命週期 Phase 5、New Code Registration、CHANGELOG 分類），零機械強制。校驗器查工件**存在性**，不查內容**同步**。檔案越多，漏同步的機率（改了 API 不動 ARCHITECTURE、新功能不登 Feature Registry、規則變更不同步 AGENTS.md 摘要）趨近必然。本倉庫自己都漏過一次（commands.md 觸發詞）——被治理專案連等價的安全網都沒有。

### 提議方案

**第一層：聲明式同步組 + 生命週期強制（本計劃）。**

INIT 生成 `.governance/sync-rules.json`：

```json
{
  "syncGroups": [
    { "name": "api-architecture", "watch": ["src/**", "lib/**"], "require": ["docs/ARCHITECTURE.md", "CHANGELOG.md"] },
    { "name": "rules-summary", "watch": ["docs/rules/**"], "require": ["AGENTS.md"] },
    { "name": "feature-registry", "watch": ["src/**"], "require": ["docs/features/"] }
  ]
}
```

- `watch` —— 觸發同步組的 glob 模式
- `require` —— 同任務必須一併改動的檔案

生命週期 Phase 5（Synchronize）改為**清單驅動**：Agent 讀取 `sync-rules.json`，對照自己的改動集逐組評估，更新所有 require 檔案，並在任務報告裡逐組標註 ✅ 已同步 / ⚠️ 不適用（無 watch 命中）。無 watch 命中 = 無同步義務；watch 命中但 require 缺失 = 任務未完成。

預設組保守、專案可擴展（專案添加自己的組；機制通用）。

### 受影響檔案

- `SKILL.md` —— Phase 1 生成 `.governance/sync-rules.json`；Phase 5 章節引用它
- `references/policies/lifecycle.policy.md` —— Phase 5 重寫為清單驅動同步
- `references/templates/` —— 新增 `sync-rules.template.json`（或 SKILL.md 內嵌 JSON）+ sub-skills.md 報告格式（state-manager/plan-manager 報告節）
- `references/policies/governance-files.policy.md` —— sync-rules.json 聲明為受追蹤狀態
- `docs/{en,zh-CN,zh-TW}/` —— bootstrap-output.md（生成工件）、commands.md（報告措辭）、CHANGELOG

### 風險

- **過度同步** —— 保守預設可能要求實際不需要的更新；用報告形式（⚠️ 附原因）與專案可編輯規則緩解
- **Glob 語義** —— `src/**` 類 glob 需要最小匹配器；v1 只用前綴/`**`，不上正規表示式
- **LLM 仍執行** —— 這是清單不是編譯器；把可靠性從記憶驅動升級為清單驅動，完全機械驗證屬第二層（見 sync-groups-mechanical-check 計劃）

### 驗證方法

- INIT 生成帶預設組的 `.governance/sync-rules.json`（測試斷言）
- 生命週期 policy Phase 5 引用聲明並強制逐組 ✅/⚠️ 報告（文件斷言）
- `governance-files.policy.md` 把 `sync-rules.json` 列入受追蹤狀態（文件斷言）
- bootstrap-output.md 展示生成檔案（文件斷言）
