# Contributing

[English](#english) · [简体中文](#chinese)

---

## English

### Development

```bash
npm test        # or node tests/run-tests.js
```

The test suite covers: empty project (exit 1), full default structure (exit 0, 17 checks), custom doc root via manifest (manifest mode), missing governance_version (exit 1), `--json` output, `--help`, no legacy `.agent` leakage, optional `validation.json`, CHANGELOG format check, lock check (no state / unlocked / held), release planning (SemVer classification: docs/refactor → patch, CLI → minor, deleted API → major, uncertainty → clarification, `--file` input), and the approval gate (unapproved → no tag, approved → annotated tag). CI runs it on every push/PR.

### Where Things Live

| Path | Purpose |
| --- | --- |
| `SKILL.md` | the governance engine — policy layer + INIT/AUDIT orchestration |
| `references/` | implementation layer — agent runtime inputs: `templates/` (generation templates) · `policies/` (`*.policy.md` rules copied into governed `docs/rules/`) · `workflows/` (CI + release specs) |
| `scripts/verify_governance.js` | validator source, copied into governed projects |
| `scripts/release-manager.js` | release tool: `plan` (read-only) + `execute` (approval-gated) |
| `tests/run-tests.js` | test harness |
| `docs/` | knowledge layer — human documentation (architecture, governance model, anti-regression, lifecycle, validator, skill discovery, commands, bootstrap output, ADRs) |

**Where does a new file go?** If deleting the file would break agent execution (INIT/AUDIT/RELEASE read it) → `references/`. If it only helps humans understand, maintain or contribute → `docs/`.

### Changing Governance Artifacts

`SKILL.md`, `references/`, `scripts/` define the governance framework itself. Changes follow the release policy (see `references/workflows/release.md`):

1. Update `CHANGELOG.md` (classify: doc-only → none; fix → Fixed; feature → Added; breaking → Changed)
2. Bump `package.json` version (SemVer: breaking → MAJOR, feature → MINOR, fix → PATCH)
3. Keep version consistency: package.json · CHANGELOG · tag
4. Run `npm test` before pushing
5. Release only with the `release-manager` flow (preconditions → version sync → validate → tag → push → GitHub Release)

### Commit Conventions

Conventional Commits in English: `feat(scope): subject` / `fix(scope): subject`. Never commit generated runtime outputs (`.governance/validation.json`, `.governance/drift-report.json`, `.governance/release-proposal.json` are git-ignored).

---

## Chinese

### 开发

```bash
npm test        # 或 node tests/run-tests.js
```

测试套件覆盖：空项目（exit 1）、完整默认结构（exit 0，17 项检查）、自定义文档根经 manifest（manifest 模式）、缺 governance_version（exit 1）、`--json` 输出、`--help`、无 `.agent` 残留、`validation.json` 可选、CHANGELOG 格式检查、锁检查（无状态 / 未持锁 / 持锁）、发布规划（SemVer 分类：docs/重构 → patch、CLI 命令 → minor、删除公开 API → major、不确定性 → 澄清、`--file` 输入）与审批门禁（未批准 → 无 tag，批准 → 创建 annotated tag）。CI 每次 push/PR 运行。

### 各目录用途

| 路径 | 用途 |
| --- | --- |
| `SKILL.md` | 治理引擎 —— 策略层 + INIT/AUDIT 编排 |
| `references/` | 实现层 —— Agent 运行时输入：`templates/`（生成模板）· `policies/`（`*.policy.md` 规则，复制进被治理项目的 `docs/rules/`）· `workflows/`（CI + 发布规范） |
| `scripts/verify_governance.js` | 校验器源码，复制进被治理项目 |
| `scripts/release-manager.js` | 发布工具：`plan`（只读）+ `execute`（审批门禁） |
| `tests/run-tests.js` | 测试套件 |
| `docs/` | 知识层 —— 人类文档（架构、治理模型、防乱改、生命周期、校验器、skill discovery、命令、初始化产物、ADR） |

**新文件放哪里？** 如果删掉该文件会导致 Agent 无法执行（INIT/AUDIT/RELEASE 需要读它）→ `references/`；如果只是帮人理解、维护、贡献 → `docs/`。

### 修改治理工件

`SKILL.md`、`references/`、`scripts/` 定义治理框架本身。改动遵循发布策略（见 `references/workflows/release.md`）：

1. 更新 `CHANGELOG.md`（分类：纯文档 → 不记；修复 → Fixed；新能力 → Added；破坏性 → Changed）
2. 升 `package.json` 版本（SemVer：破坏性 → MAJOR，新能力 → MINOR，修复 → PATCH）
3. 保持版本一致：package.json · CHANGELOG · tag
4. push 前必须 `npm test`
5. 仅通过 `release-manager` 流程发布（前置检查 → 版本同步 → 校验 → tag → push → GitHub Release）

### 提交约定

英文 Conventional Commits：`feat(scope): subject` / `fix(scope): subject`。绝不提交生成的运行时输出（`.governance/validation.json`、`.governance/drift-report.json`、`.governance/release-proposal.json` 已被 git 忽略）。