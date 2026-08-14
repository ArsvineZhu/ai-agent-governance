# Secret Scanning Gate（TASK 计划）

[English](#english) · [简体中文](#chinese)

> **状态：已实现（v0.6.0，已归档）。** 本页是路线图条目 `Secret scanning gate` 的详细设计（见 [roadmap.md](../zh-CN/roadmap.md)），按 `docs/plans/TASK_<name>.md` 六字段模板组织。目标版本：v0.6.0（已实现，待发布）。

---

## English

### Task Purpose

Make the security baseline **machine-enforceable**: a read-only, zero-dependency gate that blocks commits containing secret-like material — mirroring the proven `scripts/check-git-policy.js` pattern.

### Current Problem

- `references/policies/security.policy.md` only *documents* rules; the pre-commit checklist is manual guidance the agent can skip
- The single most damaging governance failure — a leaked credential — currently has no automated gate
- `check-git-policy.js` / `check-lock.js` already prove the pattern: read-only script, exit code, validator + CI integration

### Proposed Solution

`scripts/check-secrets.js` (INIT copies it next to the validator):

- **Read-only** scan of `git diff --cached` (staged diff only)
- Conservative v1 pattern list: AWS `AKIA[0-9A-Z]{16}`, GitHub `ghp_` / `github_pat_`, OpenAI-style `sk-`, private-key headers (`-----BEGIN ... PRIVATE KEY-----`), `password=`/`token=` assignments in staged non-`.env` files
- Exit 0 clean / exit 1 on hits, reporting `file:line` + pattern class — **never printing the secret itself**
- No allowlist in v1 (false positives are better than silent leaks); an escape-hatch comment (`# nosecrets`) deferred to v1.1 if real demand appears

Integration (all mechanical):

- Validator default checks 19 → 20: requires `scripts/check-secrets.js` (file presence), same as the other two check scripts
- CI governance job runs it on every push/PR
- `references/policies/git.policy.md` pre-commit checklist: "run `node scripts/check-secrets.js`, exit 0 required before `git commit` confirmation"
- `references/templates/agents-md.template.md` — one-line mention in Git Write Policy

### Affected Files

- `scripts/check-secrets.js` — new script (this repo) + INIT copy step in SKILL.md Phase 1
- `scripts/verify_governance.js` — +1 default check
- `references/policies/git.policy.md` / `references/templates/agents-md.template.md` — policy sync
- `references/policies/governance-files.policy.md` — script added to protected-files list
- `tests/run-tests.js` — new cases

### Risks

- **False positives** blocking legit commits — mitigated by conservative patterns; when a user reports one, add a narrow pattern exception, never disable the gate
- **Pattern list maintenance** — v1 ships a fixed list; configurable patterns are out of scope
- **Performance** — staged-diff scan is negligible

### Validation Method

- Seeded fake secret in staged diff → exit 1 with `file:line` and pattern class (test)
- Clean staged diff → exit 0 (test)
- Output must **not** contain the secret token itself (test asserts the token string is absent from stdout)
- Validator fails when `check-secrets.js` is missing (regression update: 19 → 20)

---

## Chinese

### 任务目的

让安全基线**机器可执行**：只读、零依赖的门禁脚本，阻止包含密钥材料的提交——完全镜像已验证的 `scripts/check-git-policy.js` 模式。

### 当前问题

- `references/policies/security.policy.md` 只是**文档规则**；提交前清单是 Agent 可以跳过的口头约束
- 治理失败中最致命的一种——凭据泄漏——目前没有任何自动化门禁
- `check-git-policy.js` / `check-lock.js` 已证明该模式可行：只读脚本 + 退出码 + 校验器/CI 集成

### 提议方案

`scripts/check-secrets.js`（INIT 复制到项目，与校验器并列）：

- **只读**扫描 `git diff --cached`（仅暂存区）
- v1 保守模式表：AWS `AKIA[0-9A-Z]{16}`、GitHub `ghp_` / `github_pat_`、OpenAI 风格 `sk-`、私钥头（`-----BEGIN ... PRIVATE KEY-----`）、非 `.env` 文件中的 `password=`/`token=` 赋值
- 干净 → exit 0；命中 → exit 1，报告 `文件:行号` + 模式类别——**绝不打印密钥本身**
- v1 无白名单（误报好过静默泄漏）；逃生注释（`# nosecrets`）推迟到 v1.1（确有需求时）

集成（全部机械性）：

- 校验器默认检查 19 → 20：要求 `scripts/check-secrets.js` 存在（与另两个 check 脚本一致）
- CI 治理 job 每次 push/PR 运行
- `references/policies/git.policy.md` 提交前清单："`git commit` 确认前必须 `node scripts/check-secrets.js` 且 exit 0"
- `references/templates/agents-md.template.md` —— Git Write Policy 增加一行提及

### 受影响文件

- `scripts/check-secrets.js` —— 新脚本（本仓库）+ SKILL.md Phase 1 复制步骤
- `scripts/verify_governance.js` —— 默认检查 +1
- `references/policies/git.policy.md` / `references/templates/agents-md.template.md` —— 策略同步
- `references/policies/governance-files.policy.md` —— 脚本列入受保护文件清单
- `tests/run-tests.js` —— 新增用例

### 风险

- **误报**阻断正常提交 —— 用保守模式表缓解；收到误报反馈时加窄异常，**绝不关闸**
- **模式表维护** —— v1 固定清单；可配置模式超出范围
- **性能** —— 暂存区扫描可忽略

### 验证方法

- 暂存区植入假密钥 → exit 1，报告 `文件:行号` + 模式类别（测试）
- 干净暂存区 → exit 0（测试）
- 输出**不得**包含密钥本身（测试断言 stdout 中无该 token）
- 缺少 `check-secrets.js` 时校验器失败（回归更新：19 → 20）
