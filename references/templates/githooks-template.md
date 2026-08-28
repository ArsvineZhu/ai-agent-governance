# .githooks/pre-commit 模板（提交一致性钩子）

INIT 或安装时复制为 `<project>/.githooks/pre-commit`，并执行 `git config core.hooksPath .githooks` 使其生效。**默认不启用**——启用需显式配置，见「生成规则」。

## 定位：内容一致性校验，不是授权校验

本钩子校验「实际暂存内容 == 用户确认过的命令序列对应的内容」，与 husky/gitleaks 一类内容检查一致。它**不是**授权机制——凭证由 Agent 写入（记录用户确认那一刻的文件清单与提交消息），Agent 可以自行改写凭证并通过钩子；它防的是「实际提交偏离已确认的命令序列」，**不防**「完全绕过确认私自提交」。

## 脆弱性（已知，接受为权衡）

- 凭证指纹比对是**状态比对**：Agent 确认后、提交前若改动任何内容，指纹将失配，钩子会**误拒**（拒绝是安全方向，但会阻塞合法提交）。
- 确认后改动属于「偏离已确认序列」，此时应重新向用户确认并更新凭证——钩子误拒实际上强制了这个流程。
- 主流 hook 做独立可判检查（lint/密钥/格式），本钩子是状态比对，误报率高于主流。

## 启用方式（默认不启用）

启用：`git config core.hooksPath .githooks`（配置后钩子被 git 执行）。停用：`git config --unset core.hooksPath`。

## 钩子内容（复制到 `.githooks/pre-commit`）

```sh
#!/bin/sh
# 提交一致性钩子：校验实际暂存内容 == 用户确认过的命令序列指纹（文件清单部分）。
# 凭证：.governance/consent.json（git-ignored，记录确认时刻的文件清单与提交消息）。
# 启用：git config core.hooksPath .githooks（默认不启用）。
# 边界：凭证由 Agent 写入，防"实际提交偏离已确认序列"，不防"完全绕过确认"。
set -e

CONSENT_FILE=".governance/consent.json"
[ -f "$CONSENT_FILE" ] || exit 0

CONFIRMED=$(tr -d ' \r' < "$CONSENT_FILE" | grep -o '"staged":\[[^]]*\]' | sed 's/"staged":\[//;s/\]//' | tr ',' '\n' | sed 's/"//g' | sort)
NOW=$(git diff --cached --name-only | sort)

[ "$CONFIRMED" = "$NOW" ] || {
  echo "pre-commit: staged files differ from the confirmed sequence."
  echo "Re-confirm with the user and update .governance/consent.json."
  exit 1
}
```

## 生成规则

- 默认**不启用**：INIT 仅复制本模板；启用需显式 `git config core.hooksPath .githooks`，且此前必须确认 `scripts/check-secrets.js` 退出码 0 与「一次确认 per 变更集」规则已执行。
- `.githooks/pre-commit` 与 `.governance/consent.json` 的写入均非 INIT 自动行为——启用力由项目管理员决策。
- 提交消息的一致性校验（commit-msg 钩子，校验消息属于确认过的消息列表）：非本模板自动产物，需手动启用——预留给项目实施后按需扩展。
- 修改本模板属于治理文件变更（走「治理文件保护」流程），并同步更新 `docs/rules/git-policy.md` 的对应描述。
