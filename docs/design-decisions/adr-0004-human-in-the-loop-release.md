# ADR-0004: Human-in-the-loop release flow (Analyze → Proposal → Approval → Execute)

- Status: Accepted (Unreleased)
- Date: 2026

## Context

The original release flow asked the developer to confirm the target version, but version reasoning and approval semantics were implicit. As the release-manager sub-skill automates more of the pipeline, the risk profile changes: an AI that reasons alone about version impact can misjudge breaking changes or publish without genuine authorization.

## Decision

Formalize the release flow as a five-phase human-in-the-loop workflow:

```
Analyze → Release Proposal → Developer Approval → Create Git Tag → Create Release
```

- **Analyze (read-only)** — `scripts/release-manager.js plan` classifies changes (SemVer 2.0.0), outputs a Release Proposal (current / recommended / releaseType / reasons / releaseNotes / headSha), never writes.
- **Approval Gate** — the AI presents the proposal and waits for explicit developer confirmation; the approved proposal is recorded in `.governance/release-proposal.json` (git-ignored runtime output).
- **Execute (write)** — `scripts/release-manager.js execute --yes` re-verifies (clean tree + HEAD == proposal.headSha), then creates the annotated tag; push and GitHub Release follow with the approval covering the sequence.
- Uncertainty (Potential Breaking Change / Potential Feature) pauses the flow and requests clarification (exit code 2).
- 0.x versions never auto-bump to 1.0.0 — only an explicit developer request.

## Consequences

- No tag, push or release can happen without a recorded, explicit approval.
- Unexpected workspace/HEAD drift after approval but before the first write aborts the flow; version sync, archival and the release commit are expected in-flow changes — `execute` re-verifies against the refreshed `headSha` before tagging.
- Version judgment is deterministic and testable: classification rules and gates are covered by `tests/run-tests.js`.
- Permission model unchanged: analysis is automatic; every write operation still surfaces to the user.

---

# ADR-0004: Human-in-the-loop 发布流程（Analyze → Proposal → Approval → Execute）

- 状态：Accepted（Unreleased）
- 日期：2026

## 背景

原发布流程要求开发者确认目标版本，但版本推导理由与批准语义是隐式的。随着 release-manager 子技能自动化更多环节，风险结构改变：仅靠 AI 自行判断版本影响，可能误判 Breaking Change，或在未获真正授权时发布。

## 决策

将发布流程形式化为五阶段 Human-in-the-loop 工作流：

```
Analyze → Release Proposal → Developer Approval → Create Git Tag → Create Release
```

- **Analyze（只读）** — `scripts/release-manager.js plan` 按 SemVer 2.0.0 分类变更，输出 Release Proposal（current / recommended / releaseType / reasons / releaseNotes / headSha），永不写仓库。
- **Approval Gate（审批门禁）** — AI 展示 Proposal 并等待开发者明确确认；已批准的 Proposal 记录到 `.governance/release-proposal.json`（git 忽略的运行时输出）。
- **Execute（写）** — `scripts/release-manager.js execute --yes` 重新验证（工作区干净 + HEAD == proposal.headSha）后创建 annotated tag；push 与 GitHub Release 在批准覆盖下执行。
- 不确定性（Potential Breaking Change / Potential Feature）暂停流程并请求澄清（退出码 2）。
- 0.x 版本永不自动升 1.0.0 —— 仅开发者明确要求。

## 后果

- 没有记录在案的明确批准，任何 tag/push/release 都不会发生。
- 批准后、执行写操作前的工作区/HEAD 意外变化会中止流程；流程内的版本同步、归档与 release commit 是预期变化，`execute` 打 tag 前用刷新后的 `headSha` 重新验证。
- 版本判断确定化、可测试：分类规则与门禁由 `tests/run-tests.js` 覆盖。
- 权限模型不变：分析自动执行；每个写操作仍向用户显式呈现。