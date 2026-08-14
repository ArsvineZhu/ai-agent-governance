# 貢獻指南

[English](../../CONTRIBUTING.md) · [简体中文](../zh-CN/CONTRIBUTING.md) · [繁體中文](CONTRIBUTING.md)

## 開發

```bash
npm test        # 或 node tests/run-tests.js
```

測試套件涵蓋：空專案（exit 1）、完整預設結構（exit 0，20 項檢查）、自訂文件根經 manifest（manifest 模式）、缺 governance_version（exit 1）、`--json` 輸出、`--help`、無 `.agent` 殘留、`validation.json` 可選、CHANGELOG 格式檢查、鎖檢查（無狀態 / 未持鎖 / 持鎖）、Git 策略檢查（非法策略 / 受保護分支阻止 / 特性分支通過）、密鑰掃描（命中 exit 1 且不洩漏 token / 乾淨 exit 0 / 缺閘門使校驗器失敗）、發佈規劃（SemVer 分類：docs/重構 → patch、CLI 命令 → minor、刪除公開 API → major、不確定性 → 澄清、`--file` 輸入）與審批閘門（未批准 → 無 tag，批准 → 建立 annotated tag）。CI 每次 push/PR 執行。

## 各目錄用途

| 路徑 | 用途 |
| --- | --- |
| `SKILL.md` | 治理引擎 —— 策略層 + INIT/AUDIT 編排 |
| `references/` | 實作層 —— Agent 執行時輸入：`templates/`（生成範本）· `policies/`（`*.policy.md` 規則，複製進被治理專案的 `docs/rules/`）· `workflows/`（CI + 發佈規範） |
| `scripts/verify_governance.js` | 校驗器原始碼，複製進被治理專案 |
| `scripts/release-manager.js` | 發佈工具：`plan`（唯讀）+ `execute`（審批閘門） |
| `tests/run-tests.js` | 測試套件 |
| `docs/en/` `docs/zh-CN/` `docs/zh-TW/` | 知識層 —— 人類文件，每種語言一棵目錄樹 |
| `docs/glossary.md` | 三語術語對照表（術語的單一事實來源） |

**新檔案放哪裡？** 如果刪掉該檔案會導致 Agent 無法執行（INIT/AUDIT/RELEASE 需要讀它）→ `references/`；如果只是幫人理解、維護、貢獻 → `docs/<語言>/`。

## 語言政策（按受眾）

- **Agent 面向的檔案一律單語** —— `SKILL.md`、`AGENTS.md`、`references/**` 以及生成產物的正文（AGENTS.md、rules、子技能）絕不攜帶第二語言段落。慣例：本 skill 自身的執行文件（`SKILL.md`、`references/policies`、`references/workflows`）用中文；自動載入的 Agent 指引（`AGENTS.md`、生成範本正文）用英文。
- **開發者面向的檔案三語且拆分** -- 根目錄只保留英文首頁（`README.md`、`CONTRIBUTING.md`）；簡體/繁體翻譯下沉到各自語言樹（`docs/zh-CN/README.md`、`docs/zh-TW/README.md`…）。**簡體中文（zh-CN）是源語言** -- 修改從簡體發起，再同步到英文與繁體中文（臺灣用語）。改一種語言必須**在同一次改動裡同步另兩種**。一致性映射：英文入口檔案即根目錄 `README.md`/`CONTRIBUTING.md`（不在 `docs/en/` 下重複）。
- **術語** —— 引入新術語前先查 `docs/glossary.md`，缺漏則補三語條目；所有檔案保持同一譯法。

## 修改治理工件

`SKILL.md`、`references/`、`scripts/` 定義治理框架本身。改動遵循發佈策略（見 `references/workflows/release.md`）：

1. 更新 `CHANGELOG.md`（分類：純文件 → 不記；修復 → Fixed；新能力 → Added；破壞性 → Changed）
2. 升 `package.json` 版本（SemVer：破壞性 → MAJOR，新能力 → MINOR，修復 → PATCH）
3. 保持版本一致：package.json · CHANGELOG · tag
4. push 前必須 `npm test`
5. 僅透過 `release-manager` 流程發佈（前置檢查 → 版本同步 → 校驗 → tag → push → GitHub Release）

## 提交約定

英文 Conventional Commits：`feat(scope): subject` / `fix(scope): subject`。絕不提交生成的執行時輸出（`.governance/validation.json`、`.governance/drift-report.json`、`.governance/release-proposal.json` 已被 git 忽略）。
