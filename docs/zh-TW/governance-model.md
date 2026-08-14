# Governance Model

[English](../en/governance-model.md) · [简体中文](../zh-CN/governance-model.md) · [繁體中文](governance-model.md)

「治理即程式碼」背後的三層狀態模型：期望態 / 目前態 / 觀測態，以可進行版本控制的檔案存在於倉庫內。

### Spec / Status / Health

參照 Kubernetes 的 Spec / Status / Health 分層：

| 檔案 | 角色 | Git |
| --- | --- | --- |
| `manifest.json` | 期望態 —— 全部治理工件的唯一索引（路徑、`kind`、`type`、版本） | 提交 |
| `state.json` | 目前態 —— 成熟度、階段、Agent 身份、鎖、已完成/阻塞 | 提交 |
| `preflight.json` | 初始化寫入前的回滾快照 | 提交 |
| `generated/skills/` | 生成的 Agent 模組（drift-check、release-manager 等） | 提交 |
| `validation.json` | 觀測態 —— 最近一次校驗結果 | 忽略（執行時期輸出） |
| `drift-report.json` | 漂移報告 | 忽略（執行時期輸出） |

### 版本

- `schema_version` —— manifest 的資料格式版本
- `governance_version` —— 治理框架版本

兩者分離；升級框架版本不需要改 schema。

### 升級（MIGRATE）

當被治理專案的 `governance_version` 落後於 skill 版本時，AUDIT 只報告漂移、絕不自動升級。當使用者明確要求升級時，MIGRATE 流程執行：

1. 生成遷移清單 —— 校驗器 `--json` 的缺失工件 + 目標版本 CHANGELOG 的 Added/Changed 條目
2. 與使用者確認 —— 新增檔案、變更檔案、規則變化、行為變化
3. 執行 —— 複製新腳本/範本、更新規則、升 `governance_version`、CHANGELOG 記錄
4. 驗證 —— 校驗器退出碼為 0；失敗則保持原版本，不留下半遷移狀態

每個版本的 CHANGELOG 條目就是遷移依據；跨多個版本的遷移必須涵蓋中間版本的工件變化。

### 路徑解析

校驗器以 `manifest.json` 宣告的路徑為準（結構適配 —— 尊重既有文件佈局，不強制遷移）；否則使用內建預設項目。`type` 是用於分類與報告的治理語義中繼資料，不參與檔案系統校驗 —— 檔案系統判斷只看 `kind`（file/dir）。

### 執行時期輸出

`validation.json` 與 `drift-report.json` 由 AUDIT/發佈執行產生，被 git 忽略、不作為 required artifact：fresh checkout 沒有它們也必須通過 CI。

### 行為稽核（Activity Audit）

`.governance/activity.jsonl` —— 追加式 JSON Lines，每個任務結束時寫入一行（由生成的 state-manager 子技能寫入）：

- 欄位：`ts` / `agent_id` / `task_id` / `phase` / `action` / `files` / `commands` / `result` / `summary`
- `action` 詞表（v1）：`init / inspect / plan / implement / modify / delete / commit / release / audit / migrate`
- git 忽略的執行時期輸出；絕不覆寫；密鑰類 token 寫入前強制去識別化
- 由 drift-check 的 `activity-report` 模式以唯讀方式消費（按 Agent / 按動作 / 只看失敗）
