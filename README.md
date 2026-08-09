# ai-agent-governance

[![CI](https://github.com/Consciencieux/ai-agent-governance/actions/workflows/ci.yml/badge.svg)](https://github.com/Consciencieux/ai-agent-governance/actions/workflows/ci.yml)

一个用于 **AI Agent 软件治理体系** 的 Skill：项目初始化 + 长期维稳。以 opencode Skill 形式发布，但生成的治理体系（AGENTS.md / CLAUDE.md / rules / 子技能）**与具体 AI 工具无关**，Claude Code、Cursor、Codex 等均可使用。

An **AI Agent Software Governance** skill: project initialization + long-term maintenance. Distributed as an opencode skill, but the generated governance framework (AGENTS.md / CLAUDE.md / rules / sub-skills) is **tool-agnostic** — works with Claude Code, Cursor, Codex and any agent that reads AGENTS.md or SKILL.md.

在项目创建初期（或接管已有仓库）自动搭建：项目环境检测、AI 自动加载指南（AGENTS.md）、Agent 生命周期、功能资产登记（Feature Registry）、代码修改保护、CHANGELOG 流程、Git 权限模型、安全基线、CI 自动验证、机器可读治理状态（`.agent/`）与校验闭环。

Bootstraps at project creation (or retrofit): repository inspection, AGENTS.md, agent lifecycle, feature registry, code-modification protection, CHANGELOG workflow, Git permission model, security baseline, CI validation, machine-readable state (`.agent/`), and a validation loop.

---

## 特性 / Features

- **单一事实源** — SKILL 是初始化规范唯一源头；生成后的 AGENTS.md 是运行期唯一源头 / Single source of truth across init → runtime.
- **反虚构** — Feature Registry 只登记真实功能，空项目仅生成占位模板 / Anti-fabrication: no invented features, no fake paths.
- **防篡改** — 治理文件修改需说明原因 + 更新 CHANGELOG + 升版本 + 跑校验 / Governance self-protection with version bump.
- **成熟度适配** — L0 空仓库 → L3 生产项目，自动调整"创建/合并/审计"策略 / Maturity-adaptive (L0–L3).
- **结构适配** — `manifest.json` 声明实际路径，校验器按清单执行 / Structure-adaptive via manifest-driven validator.
- **可验证** — 自带零依赖校验脚本与测试套件 / Zero-dependency validator + test suite.
- **多 Agent 协作** — `.agent/state.json` 记录 `agent_id`/`task_id`/`locked`，防并行写冲突 / Multi-agent locking.

## 前置要求 / Prerequisites

- [opencode](https://opencode.ai)（或兼容 SKILL.md 格式的工具）
- Node.js ≥ 18（校验脚本 `scripts/verify_governance.js` 使用）

## 安装 / Install

```bash
# 全局安装（推荐）/ Global install (recommended)
git clone https://github.com/Consciencieux/ai-agent-governance ~/.config/opencode/skills/ai-agent-governance

# 项目级安装 / Project-level install
git clone https://github.com/Consciencieux/ai-agent-governance .opencode/skills/ai-agent-governance
```

或通过 `skills.paths` 指向克隆目录 / or point `skills.paths` at the clone:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "skills": { "paths": ["path/to/ai-agent-governance"] }
}
```

安装后重启 opencode。重启后对新建项目说"初始化项目治理体系"即可触发。

Restart opencode after installing, then in a new project say "initialize project governance".

## 双阶段定位 / Two-Phase Positioning

本 skill 不只做一次性初始化，还承担**长期治理**——项目从初始化进入运行期后，AI 参与的每一步都在治理框架内运行，并可持续巡检维护：

```
初始化阶段 INIT：新项目 → 一次性搭好治理骨架（本 skill）
    │
    ▼
长期运行期：日常任务由生成的 .agent/skills/ 子技能接管
   ├── governance-validator  每次任务完成前校验治理完整性
   ├── state-manager         跨会话断点续跑 + 多 Agent 锁
   ├── drift-check           检测治理偏差（缺失工件 / 版本漂移）
   └── repository-inspection / ci-generator
    │
    ▼
巡检阶段 AUDIT：随时以本 skill 对已治理项目做健康检查（最小补丁，不重建）

This skill is not one-shot only — it also supports long-term governance. After init, daily agent work runs inside the generated framework, with drift-check and the AUDIT mode for ongoing health checks (minimal fixes, no rebuild).
```

## 用法 / Usage

两种进入模式，Skill 自动判定（用户指令 > `.agent/manifest.json` 存在性 > 成熟度）：

```
INIT（初始化）— 新项目 / 尚无治理体系：
  Phase 0  Inspect   — 环境检测 + 成熟度判定 + preflight 快照
  Phase 1  Build     — rules/ → AGENTS.md → 文档 → 安全 → .agent → CI → 子技能
  Phase 2  Validate  — 运行 scripts/verify-governance.js，记录真实输出
  Phase 3  Report    — ✅/⚠️/❌ 完成度核对表 + 证据

AUDIT（巡检）— 已有治理体系的项目：
  读取 manifest → 运行校验器 --json → 治理健康报告 → 最小补丁修复 → 更新 validation/drift-report
```

单次运行内完成，上下文不足时允许**阶段化暂停**（"阶段一完成，回复『继续』"），凭 `.agent/state.json` 断点续跑。外部阻塞标 ⚠️ Blocked 并继续其余任务，终态为 INCOMPLETE/BLOCKED。

Runs in a single pass with optional phased pause; blocked items are reported as ⚠️ Blocked, never faked. Two entry modes (INIT / AUDIT) are auto-detected.

## 目录结构 / Structure

```
ai-agent-governance/
├── SKILL.md                    # 策略层 + 双模式编排 / policy + INIT/AUDIT orchestration
├── reference/
│   ├── agents-md.template.md   # AGENTS.md 模板
│   ├── feature-doc.template.md # Feature 文档模板（含反虚构规则）
│   ├── ci-workflows.md         # CI 模板（能力检测 + 降级）
│   ├── sub-skills.md           # 生成的 .agent/skills 五子技能（含 drift-check）
│   └── rules/                  # lifecycle / git-policy / security / coding / testing
├── scripts/
│   └── verify_governance.js    # 校验引擎（manifest 驱动路径 + governance_version）
└── test/
    └── run-tests.js            # 验证套件（empty / default / custom-manifest / json）
```

## 测试 / Testing

```bash
npm test        # 或 node test/run-tests.js
```

覆盖：空项目（exit 1）、完整默认结构（exit 0）、自定义文档根经 manifest（manifest 模式）、缺 governance_version（exit 1）、`--json` 输出。CI 已接入（`.github/workflows/ci.yml`）。

Covers: empty project, full default structure, custom doc root via manifest, missing governance_version, and `--json` output. CI runs it on every push/PR.

## License

暂未选择开源许可证（发布后请补充）。未授权许可时默认保留所有权利，使用前请与作者确认。

No license selected yet. Without an explicit license, all rights are reserved by default — please confirm with the author before use.
