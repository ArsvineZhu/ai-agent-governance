# Architecture

[English](../en/architecture.md) · [简体中文](../zh-CN/architecture.md) · [繁體中文](architecture.md)

本頁承載 README 概要背後的內容：概念圖、執行模式、生命週期管線、倉庫佈局與設計原則。

### 概念圖

```
                  治理规范（Governance Specification）

                     .governance/
                     manifest.json

                          |
                          v

                  治理引擎（Governance Engine）

                     SKILL.md

                          |
         --------------------------------

         运行时契约（Agent Runtime Contract）

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
    +-- .governance/state.json          机器状态（成熟度 / 阶段 / 锁）
    +-- scripts/verify-governance.js  校验门禁（退出码 = 通过/失败）
    |
    v
运行期 — Agent 模块校验完整性、断点续跑、检测漂移
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
├── references/                 # 实现层（Agent 运行时输入）
│   ├── templates/
│   │   ├── agents-md.template.md   # AGENTS.md 模板
│   │   ├── feature-doc.template.md # Feature 文档模板（含反虚构规则）
│   │   ├── sub-skills.md           # 生成的 Agent 模块（含 drift-check、release-manager、plan-manager）
│   │   ├── env-example.template.md # .env.example 模板（占位符、按依赖裁剪）
│   │   ├── gitmessage.template.md  # .gitmessage.txt 模板（提交约定）
│   │   └── git-policy.template.md  # .governance/git-policy.json 模板（Git 工作流策略）
│   ├── policies/
│   │   ├── lifecycle.policy.md / git.policy.md / security.policy.md / coding.policy.md / testing.policy.md
│   │   └── governance-files.policy.md   # 受保护文件 + .governance Git 跟踪策略
│   └── workflows/
│       ├── ci.md               # CI 模板（能力检测 + 降级）
│       └── release.md          # 发布前置检查 + 版本一致性
├── scripts/
│   ├── verify_governance.js    # 校验引擎（manifest 驱动路径 + governance_version）
│   ├── check-lock.js           # 多 Agent 锁检查（只读，exit 1 = 持锁）
│   ├── check-git-policy.js     # Git 工作流门禁（受保护分支 + directPush=false → exit 1）
│   ├── check-secrets.js        # 密鑰掃描閘門（暫存區掃描，絕不列印密鑰）
│   └── release-manager.js      # 发布工具：plan（只读）+ execute（审批门禁）
├── docs/                       # 知識層（人類文件）
│   ├── glossary.md             # 三語術語對照表（共享）
│   ├── design-decisions/       # 架構決策記錄（共享，簡體單語）
│   ├── archive/                # 已完成計劃歸檔（共享，單語）
│   ├── en/                     # 英文樹
│   │   ├── architecture.md     # 本页
│   │   ├── governance-model.md # Spec / Status / Health 状态模型
│   │   ├── anti-regression.md  # 防乱改机制完整明细
│   │   ├── lifecycle.md        # Agent 六阶段操作生命周期
│   │   ├── validator.md        # 校验器用法与检查项
│   │   ├── skill-discovery.md  # Agent 如何发现并触发 skill
│   │   ├── commands.md         # 完整提示词参考（用户入口命令）
│   │   ├── bootstrap-output.md # 完整带注释的初始化产物
│   │   ├── roadmap.md          # 待开发功能与状态
│   │   └── plans/              # 設計計劃（TASK 格式）
│   ├── zh-CN/                  # 简体中文树（源语言）
│   └── zh-TW/                  # 繁體中文树（台湾）
├── README.md                   # 英文主页（另有 README.zh-CN.md / README.zh-TW.md）
├── CONTRIBUTING.md             # 开发指南（另有 CONTRIBUTING.zh-CN.md / CONTRIBUTING.zh-TW.md）
└── tests/
    └── run-tests.js            # 验证套件
```

### 設計原則

- **單一事實來源** — Skill 是初始化規範唯一源頭；生成後的 AGENTS.md 是執行期唯一源頭；細節在 `docs/rules/`
- **反虛構** — Feature 登記只記錄真實功能；空專案生成佔位範本，絕不虛構功能或路徑
- **結構適配** — 經 `manifest.json` 尊重既有文件佈局，不強制遷移
- **防竄改** — 治理策略變更需說明原因 + 更新 CHANGELOG + 升版本 + 跑校驗
