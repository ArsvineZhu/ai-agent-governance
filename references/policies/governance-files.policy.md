# 治理文件清单（单一事实源）

本文件是「治理文件保护」与 `.governance/` Git 跟踪策略的**唯一清单来源**。SKILL.md 的「治理文件保护」节、生成的 AGENTS.md（`references/templates/agents-md.template.md`）、`docs/rules/git-policy.md` 中的清单均以本文件为准；生成物必须内嵌同一份清单（目标项目不引用本仓库文件）。

## 受保护文件（修改需走「治理文件保护」流程）

防止 Agent 自我解除限制，修改以下文件必须：**说明原因 → 更新 CHANGELOG → 更新 `.governance/manifest.json` 的 `governance_version` → 运行 `scripts/verify-governance.js`**。涉及**权限/安全/删除保护/校验步骤**的修改必须用户**明确确认**；未经用户明确同意不得删除权限限制、不得放宽 Git Policy、不得移除校验步骤。

| 路径 | 性质 |
| --- | --- |
| `AGENTS.md` / `CLAUDE.md` | 行为规范入口 |
| `docs/rules/**` | 规则文件 |
| `.governance/manifest.json` | 治理工件清单（期望态） |
| `.governance/preflight.json` | 回滚快照 |
| `scripts/verify-governance.js` | 校验门禁 |
| `scripts/check-lock.js` | 锁检查 |
| `opencode.json` | Agent 配置 |
| `.github/workflows/**` | CI 配置 |

## .governance/ Git 跟踪策略

**Tracked governance state（validator required artifacts）**：

| 文件 | 性质 | Git |
| --- | --- | --- |
| `manifest.json` | 期望态（唯一索引） | 提交 |
| `state.json` | 治理状态（当前态） | 提交 |
| `preflight.json` | 回滚快照 | 提交 |
| `generated/skills/` | 治理产物 | 提交 |

**Runtime outputs（validator 不要求，git 忽略）**：

| 文件 | 性质 | Git |
| --- | --- | --- |
| `validation.json` | 临时观测结果 | 忽略 |
| `drift-report.json` | 运行报告 | 忽略 |
| `release-proposal.json` | Release Proposal 审批证据 | 忽略 |

`validation.json` / `drift-report.json` / `release-proposal.json` 由 AUDIT/RELEASE 产生，**不作为 required artifact**——fresh-checkout CI 必须无它们也通过。

## .governance/README.md 生成模板

INIT 生成 `.governance/` 目录时应同时生成 README.md：

```
# .governance

This directory stores AI Agent Governance state.

Tracked:
- manifest.json
- state.json
- generated/

Ignored:
- validation.json
- drift-report.json
- release-proposal.json

Do not delete manually.
```
