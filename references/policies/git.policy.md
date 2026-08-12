# Git Write Policy（分层权限）

本文件定义 AI Agent 的 Git 操作边界。写入 AGENTS.md 摘要 + 本文件详解。

## 允许自动执行（无需确认）

- `git status`
- `git diff`
- `git log`
- `git fetch`
- `git add <specific file>`（仅暂存**明确指定**的文件）

**暂存前检查（每次 add 前必须）**：
- `git status` —— 确认只暂存预期文件
- `git check-ignore <file>` —— 确认 `.env`、`*.pem`、密钥等已被忽略
- `git diff --cached --name-only` —— add 后复核暂存清单无敏感文件
- 发现敏感文件入暂存 → 立即 `git restore --staged` 并报告

## 需要确认（必须先向用户说明意图并等待明确同意）

- `git add .` / `git add -A`（全量暂存，必须先检查 `git status` 与 `.gitignore`，确认无 `.env`/密钥/构建产物）
- `git commit`
- `git push`
- `git tag`（创建/删除 tag；发布流程中须先经 Approval Gate，见 `references/workflows/release.md`）
- `git reset` / `git rebase` / `git revert`
- `git merge`
- `git stash`
- `git clean` / 任何破坏性命令

## 禁止自动执行

- `git push` 严禁在无人确认下执行
- `git add .` 严禁在未检查 `.gitignore` 时执行（防止暂存 `.env`、`secret.pem`）

## Mandatory Pre-commit Checklist

push/PR 前必须确认：
- [ ] CHANGELOG.md 已更新（未更新禁止 push）
- [ ] 测试/静态检查/构建已通过并记录输出
- [ ] 无敏感信息（密钥、token）进入提交
- [ ] 无无关文件被 `git add`（检查 `git status` / `git diff --cached`）

## 首次提交前

检查 git 身份已配置：`user.name` / `user.email`。
未配置 → ⚠️ Blocked，提示用户配置，不擅自设置。

## 提交信息约定

按项目约定（默认 Conventional Commits）：
`<type>(<scope>): <subject>`，如 `feat(auth): add login endpoint`。
语言遵循项目 Commit Message Language 约定。

## 治理文件保护

修改 `AGENTS.md`、`CLAUDE.md`、`docs/rules/**`、`.governance/manifest.json`、`.governance/preflight.json`、`scripts/verify-governance.js`、`opencode.json`、CI 配置（`.github/workflows/**`、`.gitlab-ci.yml`）需要特殊权限（清单以 `references/policies/governance-files.policy.md` 为准）：
说明原因 → 更新 CHANGELOG → **更新 `.governance/manifest.json` 的 `governance_version`** → 运行 `scripts/verify-governance.js`。
涉及权限/安全/删除保护/校验步骤的修改必须用户明确确认。
未经用户明确同意不得放宽权限限制或移除校验步骤。普通业务任务不得隐式触发本流程。
