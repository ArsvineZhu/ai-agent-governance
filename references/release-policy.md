# Release Policy（发布策略 —— 单一事实源）

Release 是治理生命周期（Design → Implement → Validate → Release → Audit）的一环。本文件定义发布前置检查、流程与版本一致性规则；执行由生成的 `release-manager` 子技能（`.governance/generated/skills/release-manager`）负责，本 skill 的 RELEASE 模式负责编排与校验。

## release_requirements（前置检查全通过才允许发布）

| 检查 | 要求 | 失败处理 |
| --- | --- | --- |
| `git.require_clean_status` | 工作区干净（`git status --porcelain` 为空） | ⚠️ Blocked，先提交或清理 |
| `tests.required` | 测试通过（`npm test` 等，退出码 0） | ❌ 停止发布 |
| `changelog.required` | CHANGELOG 已记录本次变更 | ⚠️ Blocked |
| `version.manifest_match_tag` | package.json / CHANGELOG / `.governance/manifest.json` 的 `governance_version` 与 tag 一致 | ❌ 停止发布 |
| `release.tag_required` | 目标 tag 尚不存在（`git tag -l <tag>` 为空） | ⚠️ Blocked，tag 已存在 |
| `validator.passed` | `scripts/verify-governance.js` 退出码 0 | ❌ 停止发布 |

## 版本一致性规则

同一版本四处必须一致：

- `package.json` 的 `version`
- `CHANGELOG.md` 顶部版本节
- `.governance/manifest.json` 的 `governance_version`
- Git tag `v<version>`

SemVer：MAJOR.MINOR.PATCH —— 破坏性 → MAJOR，新能力 → MINOR，修复 → PATCH。

## Release 流程

```
/release vX.Y.Z
```

1. **前置检查**：运行上表全部检查项；任一失败 → 输出 ⚠️/❌ 清单并停止。
2. **确认目标版本**：与用户确认版本号（默认按 SemVer 推算）。
3. **更新版本**：`package.json` → CHANGELOG（`[Unreleased]` 移入 `[X.Y.Z]`）→ `.governance/manifest.json` 的 `governance_version` 与 `release` 字段。
4. **校验**：运行 `scripts/verify-governance.js`，退出码必须为 0。
5. **提交**：`git add`（仅相关文件）→ `git commit -m "release: vX.Y.Z - <summary>"`。
6. **打 tag**：`git tag vX.Y.Z` → `git push origin main` → `git push origin vX.Y.Z`。
7. **创建 GitHub Release**：`gh release create vX.Y.Z --title "vX.Y.Z" --notes "<CHANGELOG 摘要>"`（gh 未登录/未安装 → ⚠️ Blocked，提示用户）。
8. **更新状态**：把 `.governance/manifest.json` 的 `release.validated` 置为 `true`，重新校验并记录到 `validation.json`。

## 事务性（Transactional Guarantee）

发布操作必须**事务化**，任何失败都不得留下半完成状态：

- 任何前置检查失败 → 在**创建 tag 之前**中止，不触碰仓库（不 commit、不 tag、不 push）。
- 进入写操作后必须连续完成；任一步失败立即停止，报告 ⚠️/❌ 与已完成/未完成清单。
- tag 已创建但 GitHub Release 创建失败 → **不删除 tag、不强制重来**；报告 ⚠️ Blocked，说明差异（tag 已推、release 待建），由用户决定补建 release 或清理。
- 恢复：依据 `.governance/validation.json` 与 `git log` 判断已完成步骤，仅重做未完成部分。

## 权限

- Git tag / push / gh release create 均为**写操作**，执行前必须向用户说明并等待确认。
- 修改 `release-policy.md`、manifest 的 `release` 字段走「治理文件保护」流程。

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
