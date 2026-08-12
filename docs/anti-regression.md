# Anti-Regression System

[English](#english) · [简体中文](#chinese)

---

## English

Governance doesn't stop at bootstrap — it constrains every agent on every task, so a second AI (or a new teammate's AI) cannot destroy what a previous agent built. This page details the full anti-regression mechanisms (summary: README → Features → Anti-Regression System).

- **Auto-loaded entry points** — `AGENTS.md` / `CLAUDE.md` / `.cursorrules` are read automatically at session start; agents MUST read `docs/ARCHITECTURE.md`, `docs/features/` and the recent `CHANGELOG.md` before touching code
- **6-phase operating lifecycle** — every development task runs Understand → Plan → Implement → Validate → Synchronize → Report; medium/large changes require a `docs/plans/TASK_<name>.md` before any code; changing code without updating project knowledge is forbidden
- **Code modification / deletion protection** — touching existing code requires context analysis + ownership determination first; deletion needs a stated reason, a full reference search, a Feature Registry impact check and a migration plan ("looks unused" is never enough)
- **Change classification** — doc-only changes → no CHANGELOG entry; bug fix → `Fixed`; new capability → `Added`; architecture/behavioral/breaking → `Changed`
- **Governance file protection** — `AGENTS.md` / `CLAUDE.md` / `docs/rules/**` / `.governance/manifest.json` / `.governance/preflight.json` / `scripts/verify-governance.js` / `opencode.json` and CI configs are protected: changing them requires reason → CHANGELOG update → `governance_version` bump → validator run; permission/security/validation changes need explicit user confirmation (agents cannot un-limit themselves)
- **Rule priority** — conflicts resolve: System/Platform Safety > Explicit User Request > Governance Integrity > AGENTS.md > docs/rules/ > Existing Code Conventions; ordinary tasks can never implicitly bypass governance rules
- **Agent permission matrix** — read automatic; documentation creation automatic; code modification allowed but must be validated; code deletion / dependency changes / git commit require confirmation; git push is forbidden without user approval
- **Multi-agent locking** — `.governance/state.json` records `agent_id` / `task_id` / `locked`; agents never edit the same file in parallel, and resume (not re-run) from the recorded phase after crashes
- **Evidence & recovery** — every report item is ✅ / ⚠️ / ❌ against real command output (no fabricated "done"); `preflight.json` is a rollback snapshot; blocked steps are reported, never silently skipped

---

## Chinese

治理不止于搭骨架 —— 它约束每个 Agent 的每次任务，让后来者（新同事的 AI / 新的 Agent）无法破坏前人写好的代码。本页是防乱改机制的完整明细（摘要见 README → 特性 → 防乱改体系）。

- **入口文件自动加载** — `AGENTS.md` / `CLAUDE.md` / `.cursorrules` 每次会话开始自动读取；Agent 改代码前**必须**先读 `docs/ARCHITECTURE.md`、`docs/features/` 与最近的 `CHANGELOG.md`
- **六阶段操作生命周期** — 每个开发任务走 Understand → Plan → Implement → Validate → Synchronize → Report；中大型改动必须先建 `docs/plans/TASK_<name>.md` 再动代码；"只改代码不更新项目知识"被禁止
- **代码修改/删除保护** — 动已有代码先做上下文分析与归属判定；删除必须说明理由、搜索全部引用、检查 Feature Registry 影响并提供迁移方案（"看起来没用"不是删除理由）
- **CHANGELOG 变更分类** — 纯文档改动 → 不记；Bug 修复 → `Fixed`；新能力 → `Added`；架构/行为/破坏性变更 → `Changed`
- **治理文件保护** — `AGENTS.md` / `CLAUDE.md` / `docs/rules/**` / `.governance/manifest.json` / `.governance/preflight.json` / `scripts/verify-governance.js` / `opencode.json` 与 CI 配置受保护：修改须 说明原因 → 更新 CHANGELOG → 升 `governance_version` → 跑校验器；涉及权限/安全/校验步骤的修改必须用户明确确认（防止 Agent 自我解除限制）
- **规则优先级** — 冲突按序裁决：系统/平台安全 > 用户明确要求 > 治理完整性 > AGENTS.md > docs/rules/ > 既有代码约定；普通任务永远不能隐式绕过治理规则
- **Agent 权限矩阵** — 读取自动；建文档自动；改代码需验证；删代码 / 改依赖 / git commit 需确认；git push 未经用户同意禁止
- **多 Agent 锁** — `.governance/state.json` 记录 `agent_id` / `task_id` / `locked`；不得并行修改同一文件；崩溃后从记录的阶段续跑而非重跑
- **证据与恢复** — 每项报告基于真实命令输出，✅/⚠️/❌ 三态，禁止伪造"完成"；`preflight.json` 是回滚快照；阻塞项必须上报，不得静默跳过