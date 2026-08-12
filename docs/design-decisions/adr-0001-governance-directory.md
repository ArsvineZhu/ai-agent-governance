# ADR-0001: `.governance/` replaces legacy `.agent/` state directory

- Status: Accepted (v0.3.1)
- Date: 2026

## Context

The original bootstrap used `.agent/` as the machine-readable governance state directory. Two problems emerged:

1. `.agents/` (plural) is the standard skill-installation layer across agents (e.g. `.agents/skills/...`). `.agent/` (singular) was constantly confused with it.
2. `.agent/` suggested "the agent's directory", implying agent ownership of the repo, rather than a governance state layer.

## Decision

Use `.governance/` as the governance state directory (manifest / state / validation / preflight / generated skills). Legacy `.agent/` semantics are removed from runtime behavior; the name only survives in CHANGELOG history.

## Consequences

- Unambiguous: `.agents/` = installation, `.governance/` = state, `AGENTS.md` = behavioral contract.
- Fresh projects get the new layout; the validator is `.governance`-only and leaves no `.agent` directory.

---

# ADR-0001: 用 `.governance/` 取代旧的 `.agent/` 状态目录

- 状态：Accepted（v0.3.1）
- 日期：2026

## 背景

最初的引导使用 `.agent/` 作为机器可读的治理状态目录。出现两个问题：

1. `.agents/`（复数）是跨 Agent 的标准 skill 安装层（如 `.agents/skills/...`），`.agent/`（单数）与它持续混淆。
2. `.agent/` 暗示"Agent 的目录"，即 Agent 拥有仓库，而非治理状态层。

## 决策

用 `.governance/` 作为治理状态目录（manifest / state / validation / preflight / 生成的子技能）。旧 `.agent/` 语义从运行期行为中移除，仅存于 CHANGELOG 历史。

## 后果

- 语义清晰：`.agents/` = 安装层，`.governance/` = 状态层，`AGENTS.md` = 行为契约。
- 新项目获得新布局；校验器只认 `.governance`，不产生 `.agent` 目录。