# Content Consistency Check（TASK 计划）

[English](#english) · [简体中文](#chinese)

> **状态：设计计划，未实现。** 本页是路线图条目 `Content consistency check` 的详细设计（见 [roadmap.md](../roadmap.md)），按 `docs/plans/TASK_<name>.md` 六字段模板组织。目标版本：v0.7.0。

---

## English

### Task Purpose

Complete the drift-detection triad: drift-check currently covers **existence** (artifacts present?) and will cover **freshness** (docs stale?); the missing dimension is **consistency** — cross-document contradictions (stale version examples, fragmented protected-file lists, stale ADR statuses, expired roadmap targets, broken links, wrong numeric claims). These are mechanical to detect and recur constantly, yet no current mechanism catches them.

### Current Problem

Real incidents (found in this repo's own review, 2026-08-13):

1. Manifest/release examples still said `0.3.3` while the current version was `0.5.0` — INIT-generated projects would fail their first AUDIT with phantom version drift
2. The protected-files list drifted in 4 places vs. the single source of truth (`governance-files.policy.md`), missing `git-policy.json` / `check-lock.js` / `check-git-policy.js`
3. ADR-0004 status stayed `Accepted (Unreleased)` after the feature shipped in v0.4.0
4. Roadmap target `v0.5.0` was already released without the item — the same mistake this repo fixed once at v0.4.1, then re-made
5. Numeric claims (validator check count) must match the validator source

None of these are existence or freshness problems — they are **contradictions between documents**, and they are all mechanically detectable.

### Proposed Solution

drift-check gains a `consistency` mode (report-only; pairs with `freshness`, both land in `.governance/drift-report.json`):

Check classes (v1):

1. **Version-example sync** — grep docs/templates for `governance_version` / manifest example values; any that differ from the current declared version are flagged
2. **Protected-files list sync** — every protected-files summary must match the single source of truth (`docs/rules/governance-files.md` or the policy file); missing/extra entries flagged by path
3. **ADR status sync** — ADRs marked `Accepted (Unreleased)` whose feature appears in a released CHANGELOG section are flagged as stale
4. **Roadmap target validity** — unfinished items whose target version ≤ current version are flagged as expired targets
5. **Link validity** — relative markdown links in docs must resolve to real files
6. **Numeric claims** — documented counts (sub-skill count, validator check count, test count) must match the actual sources

Report shape (appended to drift-report.json):

```json
{ "consistency": { "version_examples": ["SKILL.md:266"], "protected_lists": ["docs/anti-regression.md"], "adr_statuses": ["adr-0004"], "roadmap_targets": ["skill-lifecycle"], "broken_links": [], "numeric_claims": [] } }
```

### Affected Files

- `references/templates/sub-skills.md` — drift-check gains the `consistency` mode
- `.governance/drift-report.json` schema — `consistency` object (runtime output; schema note only)
- `docs/commands.md` — command doc sync
- Validator: **unchanged** (advisory report, not a gate; the checks are heuristic, not fail-closed)

### Risks

- **False positives** — heuristics (e.g. version-example grep) may hit intentional historical mentions (CHANGELOG entries, ADR-0001's legacy-path notes). Mitigation: exclude `CHANGELOG.md` and `docs/plans/archive/` from scans; report as advisory only
- **Check scope creep** — each check class must stay mechanical (grep/parse/compare), never semantic judgment; semantic review stays with the agent
- **Overlap with validator content checks** — the validator's existing CHANGELOG-format check stays fail-closed; consistency checks are advisory and wider

### Validation Method

- Seeded drift fixture: stale version example + fragmented protected list + `Accepted (Unreleased)` ADR + expired roadmap target → all four flagged (test)
- Clean fixture → empty consistency report (test)
- `CHANGELOG.md` and `docs/plans/archive/` are excluded from version-example scanning (test)
- Validator exit codes unchanged (regression)

---

## Chinese

### 任务目的

补全漂移检测三合一：drift-check 现在管**存在性**（工件在不在？），将来管**时效性**（文档过没过时？）；缺的维度是**一致性**——文档之间的交叉矛盾（版本示例滞后、受保护清单分裂、ADR 状态过期、roadmap 目标过期、链接失效、数值声明错误）。这些问题全是机械可查的、且反复出现，但目前没有任何机制能抓到。

### 当前问题

真实事故（本仓库 2026-08-13 自查发现）：

1. manifest/release 示例还写着 `0.3.3`，当前版本已是 `0.5.0` —— 照此 INIT 的项目首次 AUDIT 就会报幽灵版本漂移
2. 受保护文件清单在 4 处与单一事实源（`governance-files.policy.md`）漂移，漏了 `git-policy.json` / `check-lock.js` / `check-git-policy.js`
3. ADR-0004 状态停在 `Accepted (Unreleased)`，而功能早在 v0.4.0 已发布
4. roadmap 目标 `v0.5.0` 已发布却不含该项 —— 本仓库在 v0.4.1 修过同样的错，之后又犯
5. 数值声明（校验器检查项数）必须与校验器源码一致

这些既不是存在性问题也不是时效性问题——是**文档之间的矛盾**，且全部可机械检测。

### 提议方案

drift-check 增加 `consistency` 模式（仅报告；与 `freshness` 成对，都写入 `.governance/drift-report.json`）：

检查类别（v1）：

1. **版本示例同步** —— grep 文档/模板中的 `governance_version` / manifest 示例值；与当前声明版本不符的标记
2. **受保护文件清单同步** —— 各处受保护文件摘要必须与单一事实源（`docs/rules/governance-files.md` 或对应 policy 文件）一致；缺项/多出按路径标记
3. **ADR 状态同步** —— 状态为 `Accepted (Unreleased)` 但功能已出现在已发布 CHANGELOG 章节的 ADR 标记为过期
4. **Roadmap 目标有效性** —— 未完成项的目标版本 ≤ 当前版本的标记为目标过期
5. **链接有效性** —— 文档中的相对 markdown 链接必须能解析到真实文件
6. **数值声明** —— 文档中的计数（子技能数、校验器检查项数、测试数）必须与实际来源一致

报告形态（追加进 drift-report.json）：

```json
{ "consistency": { "version_examples": ["SKILL.md:266"], "protected_lists": ["docs/anti-regression.md"], "adr_statuses": ["adr-0004"], "roadmap_targets": ["skill-lifecycle"], "broken_links": [], "numeric_claims": [] } }
```

### 受影响文件

- `references/templates/sub-skills.md` —— drift-check 增加 `consistency` 模式
- `.governance/drift-report.json` schema —— `consistency` 对象（运行期输出；仅 schema 说明）
- `docs/commands.md` —— 命令文档同步
- 校验器：**不变**（建议性报告，不是门禁；这些检查是启发式的，不 fail-closed）

### 风险

- **误报** —— 启发式（如版本示例 grep）可能命中有意的历史提及（CHANGELOG 条目、ADR-0001 的旧路径说明）。缓解：扫描排除 `CHANGELOG.md` 与 `docs/plans/archive/`；仅建议性报告
- **检查范围膨胀** —— 每类检查必须保持机械（grep/解析/比对），绝不做语义判断；语义审查留给 Agent
- **与校验器内容检查重叠** —— 校验器现有的 CHANGELOG 格式检查保持 fail-closed；一致性检查是建议性的、范围更广

### 验证方法

- 播种漂移 fixture：版本示例滞后 + 受保护清单分裂 + `Accepted (Unreleased)` ADR + roadmap 目标过期 → 四类全部标记（测试）
- 干净 fixture → 一致性报告为空（测试）
- `CHANGELOG.md` 与 `docs/plans/archive/` 被版本示例扫描排除（测试）
- 校验器退出码不变（回归）
