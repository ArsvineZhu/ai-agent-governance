# Architecture

[English](../en/architecture.md) · [简体中文](architecture.md) · [繁體中文](../zh-TW/architecture.md)

本页承载 README 概要背后的内容：概念图、运行模式、生命周期管线、仓库布局与设计原则。

### 概念图

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

- `.governance/` — 机器可读状态：`manifest.json` = 期望态 · `state.json` = 当前态 · `validation.json` = 观测态
- `SKILL.md` — 治理引擎：编排 INIT / AUDIT / RELEASE 并生成治理框架
- `AGENTS.md` + 适配层 — 每个 Agent 会话开始必读的行为契约

### 运行模式

| 模式 | 触发条件 | 行为 |
| --- | --- | --- |
| INIT | 新项目 / 无 `.governance/manifest.json` / 成熟度 L0-L1 | 完整引导 |
| AUDIT | 已有 manifest / 成熟度 L2-L3 / 用户说"巡检/健康检查/治理偏差" | 只读巡检 + 最小补丁修复 |
| RELEASE | 用户说"发布 / release / publish"、或版本推进需求 | 前置检查 → 版本同步 → 校验 → tag → push → GitHub Release |

判定优先级：**用户明确指令 > manifest 存在性 > 成熟度**。AUDIT 不重建、不重构、不迁移，只输出差距报告并应用最小补丁。

### 生命周期管线

```
SKILL.md（策略层 + INIT/AUDIT 编排）
    |
    v
INIT — Inspect → Build → Validate → Report
    |
    v
生成的项目治理
    +-- AGENTS.md                  运行期规则源头
    +-- docs/rules/                详细策略（AGENTS.md 按章节 @ 引用）
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

### 仓库布局

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
│   ├── check-secrets.js        # 密钥扫描门禁（暂存区扫描，绝不打印密钥）
│   └── release-manager.js      # 发布工具：plan（只读）+ execute（审批门禁）
├── docs/                       # 知识层（人类文档）
│   ├── glossary.md             # 三语术语对照表（共享）
│   ├── design-decisions/       # 架构决策记录（共享，简体单语）
│   ├── archive/                # 已完成计划归档（共享，单语）
│   ├── en/                     # 英文树
│   │   ├── architecture.md     # 本页
│   │   ├── governance-model.md # Spec / Status / Health 状态模型
│   │   ├── anti-regression.md  # 防乱改机制完整明细
│   │   ├── lifecycle.md        # Agent 六阶段操作生命周期
│   │   ├── validator.md        # 校验器用法与检查项
│   │   ├── skill-discovery.md  # Agent 如何发现并触发 skill
│   │   ├── commands.md         # 完整提示词参考（用户入口命令）
│   │   ├── bootstrap-output.md # 完整带注释的初始化产物
│   │   ├── roadmap.md          # 待开发功能与状态
│   │   └── plans/              # 设计计划（TASK 格式）
│   ├── zh-CN/                  # 简体中文树（源语言）
│   └── zh-TW/                  # 繁體中文树（台湾）
├── README.md                   # 英文主页（翻译：docs/zh-CN/README.md、docs/zh-TW/README.md）
├── CONTRIBUTING.md             # 开发指南（翻译：docs/zh-CN/CONTRIBUTING.md、docs/zh-TW/CONTRIBUTING.md）
└── tests/
    └── run-tests.js            # 验证套件
```

### 设计原则

- **单一事实源** — Skill 是初始化规范唯一源头；生成后的 AGENTS.md 是运行期唯一源头；细节在 `docs/rules/`
- **反虚构** — Feature 登记只记录真实功能；空项目生成占位模板，绝不虚构功能或路径
- **结构适配** — 经 `manifest.json` 尊重既有文档布局，不强制迁移
- **防篡改** — 治理策略变更需说明原因 + 更新 CHANGELOG + 升版本 + 跑校验
