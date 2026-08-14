# Bootstrap Output

[English](../en/bootstrap-output.md) · [简体中文](bootstrap-output.md) · [繁體中文](../zh-TW/bootstrap-output.md)

一条 `initialize project governance` 指令生成的完整产物（带注释目录树）。

```
my-project/
├── AGENTS.md                    运行期规则源头
├── CLAUDE.md                    Agent 入口文件（@AGENTS.md，按检测到的工具生成）
├── CHANGELOG.md                 Keep a Changelog
├── README.md                    英文主页（语言切换链接见文件顶部）
├── .gitmessage.txt              提交信息模板（仓库级默认）
├── docs/
│   ├── README.zh-CN.md          简体翻译（源语言；纯英文项目可省略，见语言政策）
│   ├── ARCHITECTURE.md          数据流 + ADR + 组件登记
│   ├── plans/                   开发计划 + 任务模板
│   ├── features/                Feature 登记（只登记真实功能）
│   └── rules/                   lifecycle / git-policy / security / coding / testing
├── .env.example                 安全基线
├── .governance/                 manifest / state / preflight + generated/skills
├── scripts/verify-governance.js 校验门禁（退出码 = 通过/失败）
└── .github/workflows/           CI 管线（能力检测式，优雅降级）
```

同时生成 `.governance/generated/skills/` 下的 Agent 模块（含 drift-check、release-manager），把日常任务与发布留在框架内。

- `AGENTS.md` — 每个 Agent 会话开始必读的运行时规则源头（细节在 `docs/rules/`，按章节 `@` 引用）
- `CLAUDE.md` / 适配层 — 按工具生成的入口文件（`@AGENTS.md`）
- `.governance/` — 机器可读治理状态：`manifest.json`（期望态）· `state.json`（当前态）· `validation.json`（观测态）
- `scripts/verify-governance.js` — 零依赖校验门禁，CI 与 AUDIT 使用

已有项目只合并不覆盖；既有文档布局经 `.governance/manifest.json` 被尊重（结构适配）。
