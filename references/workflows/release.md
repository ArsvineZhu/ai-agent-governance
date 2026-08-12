# Release Policy（发布策略 —— 单一事实源）

Release 是治理生命周期（Design → Implement → Validate → Release → Audit）的一环。本文件定义发布前置检查、**AI 辅助的 Human-in-the-loop 发布流程**、SemVer 2.0.0 版本判定规则与版本一致性规则；执行由生成的 `release-manager` 子技能（`.governance/generated/skills/release-manager`）负责，本 skill 的 RELEASE 模式负责编排与校验。

核心原则：**AI 负责分析与建议，开发者负责最终授权；未经过明确确认，不允许执行任何发布操作。**

## 发布流程总览（Human-in-the-Loop）

```
Analyze
   |
   v
Release Proposal
   |
   v
Developer Approval
   |
   v
Create Git Tag
   |
   v
Create Release
```

AI 仅在前两阶段自动行动（分析 + 提案，只读）；任何写操作（tag / push / gh release）都必须先获得开发者明确批准。

## release_requirements（前置检查全通过才允许发布）

| 检查 | 要求 | 失败处理 |
| --- | --- | --- |
| `git.require_clean_status` | 工作区干净（`git status --porcelain` 为空） | ⚠️ Blocked，先提交或清理 |
| `tests.required` | 测试通过（`npm test` 等，退出码 0） | ❌ 停止发布 |
| `changelog.required` | CHANGELOG 已记录本次变更 | ⚠️ Blocked |
| `version.manifest_match_tag` | package.json / CHANGELOG / `.governance/manifest.json` 的 `governance_version` 与 tag 一致 | ❌ 停止发布 |
| `release.tag_required` | 目标 tag 尚不存在（`git tag -l <tag>` 为空） | ⚠️ Blocked，tag 已存在 |
| `release.proposal_approved` | Release Proposal 已生成（`scripts/release-manager.js plan`）且开发者已**明确批准** | ⚠️ Blocked，等待批准 |
| `validator.passed` | `scripts/verify-governance.js` 退出码 0 | ❌ 停止发布 |

## 版本一致性规则

同一版本四处必须一致：

- `package.json` 的 `version`
- `CHANGELOG.md` 顶部版本节
- `.governance/manifest.json` 的 `governance_version`
- Git tag `v<version>`

SemVer：MAJOR.MINOR.PATCH —— 破坏性 → MAJOR，新能力 → MINOR，修复 → PATCH。

## Phase 1：Analyze（分析）

AI 首先分析当前仓库状态，包括：

- 当前 Git tag / 当前版本号（`git tag -l`、package.json）
- `git log` 与 `git diff`（自上次发布以来的变更）
- 文件变化、API/interface 变化、用户可见功能变化

然后运行只读分析工具生成 Proposal：

```bash
node scripts/release-manager.js plan --json '{"current":"X.Y.Z","changes":[{"type":"breaking|feature|fix|docs|refactor|test|ci|chore","description":"...","uncertain":false}]}'
```

`plan` 只读、永不写仓库；输出 JSON Proposal（含 `current` / `recommended` / `releaseType` / `reasons` / `releaseNotes` / `headSha`）。退出码 2 = 需要澄清（见不确定性处理）。

## Phase 2：Version Decision（SemVer 2.0.0）

版本判断严格遵循 SemVer 2.0.0，优先级从高到低：

### Major —— 仅当存在真实 Breaking Change

包括：

- 删除公开 API
- 修改公开 API 导致旧调用失效
- 删除公开配置
- 修改 CLI 行为导致已有脚本失效
- 修改公开协议或数据格式导致不兼容

规则：

- Breaking Change 必须影响**外部用户或开发者**。
- 内部重构不属于 Breaking Change。
- 文件移动、代码重构、架构调整不能触发 Major。

### Minor —— 仅当增加向后兼容的新能力

包括：

- 新增用户功能
- 新增公开 API
- 新增 CLI 命令
- 新增配置能力
- 新增 Agent 能力

以下**不得**触发 Minor（归入 Patch）：

- README 修改、文档增加、测试增加、CI 修改
- 重构、性能优化、日志优化、类型注释增加

### Patch —— 其余全部

包括：Bug 修复、重构、性能优化、文档更新、测试调整、配置调整、依赖更新。

### 禁止的启发式判断

禁止根据以下因素判断版本：

- diff 行数
- commit 数量
- 修改文件数量
- 新增代码数量

代码规模不代表版本影响范围。

## Phase 3：Approval Gate（审批门禁）

生成 Release Proposal 后，必须**等待开发者确认**。AI 必须展示：

```
Release Proposal

Current:
vX.Y.Z

Recommended:
vX.Y.Z

Reason:
...

Release Notes:
...

Proceed with release?
```

批准后把 Proposal 记录到 `.governance/release-proposal.json`（运行时输出，git 忽略，非 required artifact）作为审批证据。

以下情况**禁止**自动执行：

- 未收到确认
- 用户回复含糊
- 存在未解决的 Breaking Change 判断
- 工作区状态发生变化

## Phase 4：Release Execution（执行）

开发者确认后，AI 执行：

1. **再次检查仓库状态**：`git status`、`git rev-parse HEAD`。要求工作区干净、HEAD 与 Proposal 中 `headSha` 一致；若检测到变化 → **停止执行并重新分析版本**（重新走 Phase 1-3）。
2. **创建 annotated tag**：

   ```bash
   node scripts/release-manager.js execute --proposal .governance/release-proposal.json --yes
   ```

   `--yes` 是开发者批准的记录标记；**没有 `--yes` 该工具拒绝一切写操作**（等价于手工 `git tag -a vX.Y.Z -m "Release vX.Y.Z: <summary>"`）。
3. **推送 tag**：`git push origin vX.Y.Z`（推 main 与推 tag 均需用户确认，见权限）。
4. **创建 Release**：GitHub 项目执行 `gh release create vX.Y.Z --title "vX.Y.Z" --notes "<Release Notes>"`（gh 未登录/未安装 → ⚠️ Blocked，提示用户）。
5. **版本同步**：更新 `package.json` → CHANGELOG（`[Unreleased]` 移入 `[X.Y.Z]`）→ `.governance/manifest.json` 的 `governance_version` 与 `release` 字段 → 提交 `release: vX.Y.Z - <summary>`。
6. **校验**：运行 `scripts/verify-governance.js`，退出码必须为 0。
7. **更新状态**：把 `.governance/manifest.json` 的 `release.validated` 置为 `true`，重新校验并记录到 `validation.json`。

## 安全规则

### 禁止自动发布

AI 不得自动创建 tag、自动 push tag、自动创建 release，除非：

- 已生成 Release Proposal
- 开发者已明确批准

### 发布前重新验证

Approval 与 Execute 之间必须重新检查：

- git HEAD（与 Proposal `headSha` 比对）
- git status（工作区干净）
- version state（版本一致）

任一发生变化 → **取消当前 release 流程**，重新分析。

## 不确定性处理

如果 AI 无法确定是否 Breaking Change、是否属于新功能：

1. 标记为 **Potential Breaking Change / Potential Feature**
2. 请求开发者确认
3. 暂停 release（`plan` 退出码 2，`releaseType: "unknown"`）

不得自行猜测。

## 0.x 版本规则

对于 `0.x.y` 版本：

- 仍然按照上述规则判断 Major / Minor / Patch。
- Breaking Change **不自动升级到 1.0.0**。
- 只有开发者明确要求稳定版本发布时，才允许进入 1.0.0。

## 事务性（Transactional Guarantee）

发布操作必须**事务化**，任何失败都不得留下半完成状态：

- 任何前置检查失败 → 在**创建 tag 之前**中止，不触碰仓库（不 commit、不 tag、不 push）。
- Approval 与 Execute 之间工作区/HEAD 变化 → 取消流程，重新 plan。
- 进入写操作后必须连续完成；任一步失败立即停止，报告 ⚠️/❌ 与已完成/未完成清单。
- tag 已创建但 GitHub Release 创建失败 → **不删除 tag、不强制重来**；报告 ⚠️ Blocked，说明差异（tag 已推、release 待建），由用户决定补建 release 或清理。
- 恢复：依据 `.governance/validation.json` 与 `git log` 判断已完成步骤，仅重做未完成部分。

## 权限

- 分析（`plan`）为只读操作，可自动执行。
- Git tag / push / gh release create 均为**写操作**：仅在 Proposal 已生成且开发者**明确批准**后执行（批准覆盖本次 release 序列的全部写操作）；任何写操作执行前仍须向用户说明。
- 修改 `references/workflows/release.md`、manifest 的 `release` 字段走「治理文件保护」流程。

## manifest release 字段

```json
{
  "release": {
    "version": "0.3.3",
    "tag": "v0.3.3",
    "validated": false
  }
}
```

- `version`：治理框架版本（与 `governance_version` 一致）
- `tag`：Git tag 名（`v<version>`）
- `validated`：发布后是否已通过校验（发布完成后置 `true`）