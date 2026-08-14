# Roadmap

[English](../en/roadmap.md) · [简体中文](../zh-CN/roadmap.md) · [繁體中文](roadmap.md)

時間尺度：**已完成** / **近期** / **中期** / **遠期**

### 已完成

- AGENTS.md 治理引導
- Feature 登記
- 治理校驗器
- 發佈工作流程
- 多語言 CI 範本
- 多 Agent 鎖強制 —— `scripts/check-lock.js`（唯讀鎖檢查；INIT 複製、校驗器必查）
- 校驗器內容檢查 —— CHANGELOG 格式 + manifest `artifacts[].kind` 有效性
- Git 工作流程治理 —— `.governance/git-policy.json` + `scripts/check-git-policy.js`（受保護分支、分支開發、禁止直推）
- Agent 行為稽核 —— 追加式 .governance/activity.jsonl 逐任務稽核軌跡 + drift-check `activity-report` 模式
- 密鑰掃描閘門 —— scripts/check-secrets.js 阻止暫存區密鑰類內容（校驗器 20 項）

### 近期（v0.7.0）

- **知識新鮮度偵測** —— drift-check `freshness` 模式：經 `git log` 提交日期標記過時治理文件（建議性，絕不做閘門）。目標版本：v0.7.0。設計：[plans/knowledge-freshness.md](plans/knowledge-freshness.md)
- **內容一致性檢查** —— drift-check `consistency` 模式：標記文件間交叉矛盾（版本示例滯後、受保護清單分裂、ADR 狀態過期、roadmap 目標過期、連結失效、數值聲明錯誤）。目標版本：v0.7.0。設計：[plans/content-consistency.md](plans/content-consistency.md)
- **治理健康分與徽章** —— 校驗器 `--json` 輸出綜合 `score`；CI 產出 shields.io 徽章 endpoint；本倉庫率先啟用作參考實作。目標版本：v0.7.0。設計：[plans/governance-score.md](plans/governance-score.md)
- **INIT 生成器腳本化** —— 確定性、可快照測試的 INIT 生成（`scripts/generate-governance.js`）；分 A → B → C 三期。目標版本：v0.7.0。設計：[plans/init-scripted-generator.md](plans/init-scripted-generator.md)

### 中期（v0.8.0+）

- **多 Agent 協調協定** —— 並發 Agent 之間的標準化協調（鎖檢查已交付；完整協定待真實多 Agent 使用場景）
- **遠端治理看板** —— 被治理倉庫的可觀測性（依賴近期/中期的稽核軌跡 + 健康分）
- **Skill 生命週期管理** —— 獨立 [`ai-skill-manager`](https://github.com/Consciencieux/ai-skill-manager) skill（管理 .agents/skills/ 下所有 skill 的 INSTALL → UPDATE → ROLLBACK，含本 skill）。自 v0.6.0 順延；當 v0.5.2 的版本同步步驟證明不夠用時再重啟。設計：[plans/skill-lifecycle-management.md](plans/skill-lifecycle-management.md)
- **monorepo 多治理域** —— 校驗器多根解析 + 多 manifest（出現真實 monorepo 需求時再做）

### 遠期

- **demo 示例倉庫** —— 展示治理產物實際效果的真實示例專案（遠期；在此之前本倉庫僅作為*輕量治理*參考：發佈流程 + plans/archive + ADR + 測試，**不是**完整的被治理軟體專案——其 validator 預設模式必然失敗屬設計使然）
- **生態完善** —— IDE 擴充（治理感知的編輯器整合；真實使用者需求出現時觸發）+ Cursor 相容實測（驗證文件聲明的 `.cursor/rules` 相容性；機制變化或問題報告時觸發）

說明：未實現功能的設計計劃在各語言樹的 `plans/`（如 `skill-lifecycle-management.md`）；已完成的 TASK 計劃在發佈時歸檔到 `docs/archive/`。被治理專案自身的開發計劃由 INIT 生成在 `docs/plans/DEVELOPMENT_PLAN.md`。

**維護規則（每次發佈滾動重排）：**

1. **完成時** —— 移到「已完成」，勾 `[x]`，去掉時間括號與版本目標（已完成項不帶時間尺度）。其設計文件歸檔到 `docs/archive/`（共享區，單語）。
2. **時間尺度是相對的** —— 移出已完成項後，剩餘項整體前移：中期 → 近期、遠期 → 中期、超遠期 → 遠期（視需求）。版本目標隨之重排。
3. **觸發時機** —— 重排是發佈流程的一部分（`release-manager` 歸檔計劃時一併重排本 roadmap），不是隨手改；否則時間標註會過期失真。
