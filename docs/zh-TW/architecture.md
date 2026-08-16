# Architecture

[English](../en/architecture.md) · [简体中文](../zh-CN/architecture.md) · [繁體中文](architecture.md)

本頁承載 README 概要背後的內容：概念圖、執行模式、生命週期管線、倉庫佈局與設計原則。

### 概念圖

```
                  治理規範（Governance Specification）

                     .governance/
                     manifest.json

                          |
                          v

                  治理引擎（Governance Engine）

                     SKILL.md

                          |
         --------------------------------

         執行时契约（Agent Runtime Contract）

              AGENTS.md
              CLAUDE.md

                          |
                          v

                  编码 Agent（Coding Agents）
```

- `.governance/` — 機器可讀狀態：`manifest.json` = 期望態 · `state.json` = 目前態 · `validation.json` = 觀測態
- `SKILL.md` — 治理引擎：編排 INIT / AUDIT / RELEASE 並生成治理框架
- `AGENTS.md` + 適配層 — 每個 Agent 會話開始必讀的行為契約

### 執行模式

| 模式 | 觸發條件 | 行為 |
| --- | --- | --- |
| INIT | 新專案 / 無 `.governance/manifest.json` / 成熟度 L0-L1 | 完整引導 |
| AUDIT | 已有 manifest / 成熟度 L2-L3 / 使用者說"巡檢/健康檢查/治理偏差" | 唯讀巡檢 + 最小修補修復 |
| RELEASE | 使用者說"發佈 / release / publish"、或版本推進需求 | 前置檢查 → 版本同步 → 校驗 → tag → push → GitHub Release |

判定優先順序：**使用者明確指令 > manifest 存在性 > 成熟度**。AUDIT 不重建、不重構、不遷移，只輸出差距報告並套用最小修補。

### 生命週期管線

```
SKILL.md（策略层 + INIT/AUDIT 编排）
    |
    v
INIT — Inspect → Build → Validate → Report
    |
    v
生成的專案治理
    +-- AGENTS.md                  執行期規則源頭
    +-- docs/rules/                詳細策略（AGENTS.md 按章節 @ 引用）
    +-- .governance/state.json          机器狀態（成熟度 / 阶段 / 锁）
    +-- scripts/verify-governance.js  校驗閘門（退出码 = 通过/失败）
    |
    v
執行期 — Agent 模組校驗完整性、断点续跑、偵測漂移
    |
    v
AUDIT — 健康检查 + 最小补丁（不重建）
    |
    v
RELEASE — 前置检查 → 版本同步 → tag → push → GitHub Release
```

### 倉庫佈局

```
ai-agent-governance/
├── SKILL.md                    # 策略层 + INIT/AUDIT 编排
├── references/                 # 實作層（Agent 執行時輸入）
│   ├── templates/
│   │   ├── agents-md.template.md   # AGENTS.md 範本
│   │   ├── feature-doc.template.md # Feature 文件範本（含反虛構規則）
│   │   ├── sub-skills.md           # 生成的 Agent 模組（含 drift-check、release-manager、plan-manager）
│   │   ├── env-example.template.md # .env.example 範本（佔位符、按依賴裁剪）
│   │   ├── gitmessage.template.md  # .gitmessage.txt 範本（提交約定）
│   │   └── git-policy.template.md  # .governance/git-policy.json 範本（Git 工作流程策略）
│   ├── policies/
│   │   ├── lifecycle.policy.md / git.policy.md / security.policy.md / coding.policy.md / testing.policy.md
│   │   └── governance-files.policy.md   # 受保護檔案 + .governance Git 追蹤策略
│   └── workflows/
│       ├── ci.md               # CI 範本（能力偵測 + 降級）
│       └── release.md          # 發佈前置檢查 + 版本一致性
├── scripts/
│   ├── verify_governance.js    # 校驗引擎（manifest 驅動路徑 + governance_version）
│   ├── check-lock.js           # 多 Agent 鎖檢查（唯讀，exit 1 = 持鎖）
│   ├── check-git-policy.js     # Git 工作流程閘門（受保護分支 + directPush=false → exit 1）
│   ├── check-secrets.js        # 密鑰掃描閘門（暫存區掃描，絕不列印密鑰）
│   ├── check-doc-freshness.js   # 文件過時度（git log 日期，建議性，exit 0）
│   ├── check-doc-consistency.js # 文件間矛盾（建議性，exit 0）
│   ├── check-doc-parity.js      # 三語樹一致性（CI + 發佈前置）
│   ├── package-skill.sh         # 發佈載荷 tarball 打包
│   └── release-manager.js       # 發佈工具：plan（唯讀）+ execute（審批閘門）
├── docs/                       # 知識層（人類文件）
│   ├── glossary.md             # 三語術語對照表（共享）
│   ├── design-decisions/       # 架構決策記錄（共享，簡體單語）
│   ├── archive/                # 已完成計劃歸檔（共享，單語）
│   ├── en/                     # 英文樹
│   │   ├── architecture.md     # 本頁
│   │   ├── governance-model.md # Spec / Status / Health 狀態模型
│   │   ├── anti-regression.md  # 防亂改機制完整明細
│   │   ├── lifecycle.md        # Agent 六階段操作生命週期
│   │   ├── validator.md        # 校驗器用法與檢查項
│   │   ├── skill-discovery.md  # Agent 如何發現並觸發 skill
│   │   ├── commands.md         # 完整提示詞參考（使用者入口命令）
│   │   ├── bootstrap-output.md # 完整帶註解的初始化產物
│   │   ├── roadmap.md          # 待開發功能與狀態
│   │   └── plans/              # 設計計劃（TASK 格式）
│   ├── zh-CN/                  # 簡體中文樹（源語言）
│   └── zh-TW/                  # 繁體中文樹（臺灣）
├── README.md                   # 英文首頁（翻譯：docs/zh-CN/README.md、docs/zh-TW/README.md）
├── CONTRIBUTING.md             # 開發指南（翻譯：docs/zh-CN/CONTRIBUTING.md、docs/zh-TW/CONTRIBUTING.md）
└── tests/
    └── run-tests.js            # 驗證套件
```

### 設計原則

- **單一事實來源** — Skill 是初始化規範唯一源頭；生成後的 AGENTS.md 是執行期唯一源頭；細節在 `docs/rules/`
- **反虛構** — Feature 登記只記錄真實功能；空專案生成佔位範本，絕不虛構功能或路徑
- **結構適配** — 經 `manifest.json` 尊重既有文件佈局，不強制遷移
- **防竄改** — 治理策略變更需說明原因 + 更新 CHANGELOG + 升版本 + 跑校驗
