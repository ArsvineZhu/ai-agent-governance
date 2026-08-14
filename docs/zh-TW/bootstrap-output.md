# Bootstrap Output

[English](../en/bootstrap-output.md) · [简体中文](../zh-CN/bootstrap-output.md) · [繁體中文](bootstrap-output.md)

一條 `initialize project governance` 指令生成的完整產物（帶註解目錄樹）。

```
my-project/
├── AGENTS.md                    執行期規則源頭
├── CLAUDE.md                    Agent 入口檔案（@AGENTS.md，按偵測到的工具生成）
├── CHANGELOG.md                 Keep a Changelog
├── README.md                    英文首頁（語言切換連結見檔案頂部）
├── .gitmessage.txt              提交訊息範本（倉庫級預設）
├── docs/
│   ├── README.zh-CN.md          簡體翻譯（源語言；純英文專案可省略，見語言政策）
│   ├── ARCHITECTURE.md          資料流 + ADR + 元件登記
│   ├── plans/                   開發計劃 + 任務範本
│   ├── features/                Feature 登记（只登记真实功能）
│   └── rules/                   lifecycle / git-policy / security / coding / testing
├── .env.example                 安全基線
├── .governance/                 manifest / state / preflight + generated/skills
├── scripts/verify-governance.js 校驗閘門（退出码 = 通过/失败）
└── .github/workflows/           CI 管线（能力偵測式，优雅降级）
```

同時生成 `.governance/generated/skills/` 下的 Agent 模組（含 drift-check、release-manager），把日常任務與發佈留在框架內。

- `AGENTS.md` — 每個 Agent 會話開始必讀的執行期規則源頭（細節在 `docs/rules/`，按章節 `@` 引用）
- `CLAUDE.md` / 適配層 — 按工具生成的入口檔案（`@AGENTS.md`）
- `.governance/` — 機器可讀治理狀態：`manifest.json`（期望態）· `state.json`（目前態）· `validation.json`（觀測態）
- `scripts/verify-governance.js` — 零依賴校驗閘門，CI 與 AUDIT 使用

已有專案只合併不覆蓋；既有文件佈局經 `.governance/manifest.json` 被尊重（結構適配）。
