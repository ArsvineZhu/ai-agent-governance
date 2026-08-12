# Skill Lifecycle Management（TASK 计划）

[English](#english) · [简体中文](#chinese)

> **状态：设计计划，未实现。** 本页是路线图条目 `Skill lifecycle management` 的详细设计（见 [roadmap.md](../roadmap.md)），按 `docs/plans/TASK_<name>.md` 六字段模板组织。目标版本：v0.5.0。

---

## English

### Task Purpose

Govern the lifecycle of agent capabilities themselves — **INSTALL → UPDATE → ROLLBACK** — so a skill (including `ai-agent-governance` itself) becomes checkable, updatable and rollback-safe instead of a one-time installation. The governance object extends from agent behavior to agent capability.

Layer distinction:

```
ai-agent-governance
        |
        ├── manages target project governance state (.governance/)
        |
        └── is itself an installed skill (.agents/skills/ai-agent-governance/)
```

Skill updates operate on the **installation layer** (`~/.agents/skills/...`), not on `project/.governance`.

### Current Problem

- The lifecycle `INIT → Runtime → AUDIT → RELEASE` has no `UPDATE` stage
- Agent platforms (Claude Code / Codex / opencode) do not proactively check skill updates, scan versions, or maintain skill lifecycle
- Technically feasible (read local skill files, run git, query GitHub releases, modify local files) — but there is no mechanism for *when* to act
- Local vs remote version drift goes unnoticed (`local 0.3.1` vs `remote 0.3.2` is never compared)

### Proposed Solution

A dedicated **Skill Manager** at the installation layer. Do NOT implement it as `.governance/generated/skills/update-manager` — that layer manages the target project's governance sub-skills; skill self-updates live at a different level.

Architecture:

```
             Skill Registry (GitHub releases)
                      |
                      v
              .agents/skills
                      |
                      v
               Skill Manager
                  ├── check update
                  ├── install
                  └── rollback
                      |
                      v
      ai-agent-governance → Project Governance (.governance/)
```

#### 1. Version metadata

Add `version` to the SKILL.md frontmatter:

```yaml
---
name: ai-agent-governance
version: 0.3.3
---
```

Agents can then compare: `local: 0.3.3` vs `remote: 0.4.0` → update available.

#### 2. Capabilities

| Capability | Behavior |
| --- | --- |
| CHECK | current version · latest release · changelog |
| UPDATE | download new version → replace skill → verify |
| ROLLBACK | restore the previous version |

#### 3. Integration options

- **(a) Standalone skill** — `.agents/skills/skill-manager/` (recommended; installation-layer responsibility). Existing seed: [`ai-skill-manager`](https://github.com/Consciencieux/ai-skill-manager) (Issue #1).
- **(b) UPDATE mode inside `ai-agent-governance`** — `/update-skill ai-agent-governance`; operates on `~/.agents/skills/ai-agent-governance`, NOT on `project/.governance`.

#### 4. Update flow

```
Inspect (read local version from SKILL.md frontmatter)
→ Query upstream release
→ Compare versions
→ Backup current skill
→ Update
→ Verify
```

#### 5. Version roadmap

- **v0.3.x** — not implemented (stabilize governance model / release / CI first)
- **v0.5.0** — implement Skill Lifecycle Management (INSTALL → UPDATE → ROLLBACK)

### Affected Files

Planned (implementation phase):

- `SKILL.md` — frontmatter gains `version` (kept in sync with releases); option (b) additionally adds an UPDATE mode
- Standalone implementation lives in the separate `ai-skill-manager` repository (existing, Issue #1) — this repo's changes stay minimal
- `docs/roadmap.md` / `docs/architecture.md` — status and architecture updates
- `references/` — unchanged unless option (b) is chosen (new mode would reference the update flow)

### Risks

- Interrupted/corrupted update → pre-installed backup + rollback path required
- Automatic updates may introduce breaking changes → read changelog + user confirmation before update
- Concurrent updates when multiple agents share `.agents/skills` → serialization/locking
- Update may be incompatible with previously generated artifacts (`.governance` output, `references/` structure) → version compatibility statement + migration notes
- Rollback may desync from already-governed projects → document reconciliation steps

### Validation Method

- CHECK correctly reports local vs remote version differences (test with a simulated remote version)
- UPDATE full flow: download → backup → replace → verify (sandbox test)
- ROLLBACK restores the backed-up version
- Interrupted update (simulated) leaves no half-broken state
- SKILL.md frontmatter `version` matches the release tag (version consistency check)

---

## Chinese

### 任务目的

治理 Agent 能力本身的生命周期 —— **INSTALL → UPDATE → ROLLBACK** —— 让 skill（含 `ai-agent-governance` 自身）从"一次性安装"变为可检查、可更新、可回滚。治理对象从 Agent 行为扩展到 Agent 能力本身。

层级区分：

```
ai-agent-governance
        |
        ├── 管理目标项目治理状态（.governance/）
        |
        └── 自身也是一个被安装的 skill（.agents/skills/ai-agent-governance/）
```

skill 更新操作**安装层**（`~/.agents/skills/...`），而非 `project/.governance`。

### 当前问题

- 生命周期 `INIT → Runtime → AUDIT → RELEASE` 缺少 `UPDATE` 阶段
- Agent 平台（Claude Code / Codex / opencode）不会主动检查 skill 更新、扫描版本或维护 skill 生命周期
- 技术上可行（读取本地 skill 文件、执行 git、查询 GitHub release、修改本地文件）——但缺少"何时主动做"的机制
- 本地与远端版本漂移无感知（`local 0.3.1` vs `remote 0.3.2` 无人比较）

### 提议方案

在**安装层**增加独立的 **Skill Manager**。不要实现为 `.governance/generated/skills/update-manager` —— 该层管理目标项目的治理子技能；skill 自更新属于更高层级。

架构：

```
             Skill Registry（GitHub releases）
                      |
                      v
              .agents/skills
                      |
                      v
               Skill Manager
                  ├── check update（检查更新）
                  ├── install（安装）
                  └── rollback（回滚）
                      |
                      v
      ai-agent-governance → Project Governance（.governance/）
```

#### 1. 版本元数据

SKILL.md frontmatter 增加 `version`：

```yaml
---
name: ai-agent-governance
version: 0.3.3
---
```

Agent 即可比较：`local: 0.3.3` vs `remote: 0.4.0` → 有更新。

#### 2. 能力

| 能力 | 行为 |
| --- | --- |
| CHECK | 当前版本 · 最新 release · changelog |
| UPDATE | 下载新版本 → 替换 skill → 验证 |
| ROLLBACK | 恢复上一版本 |

#### 3. 集成方式

- **(a) 独立 skill** —— `.agents/skills/skill-manager/`（推荐；安装层职责）。已有种子：[`ai-skill-manager`](https://github.com/Consciencieux/ai-skill-manager)（Issue #1）。
- **(b) 集成进 `ai-agent-governance` 的 UPDATE 模式** —— `/update-skill ai-agent-governance`；操作对象是 `~/.agents/skills/ai-agent-governance`，而非 `project/.governance`。

#### 4. 更新流程

```
Inspect（读取 SKILL.md frontmatter 的本地版本）
→ 查询 upstream release
→ 比较版本
→ 备份当前 skill
→ 更新
→ 验证
```

#### 5. 版本路线

- **v0.3.x** —— 不做（优先稳定治理模型 / release / CI）
- **v0.5.0** —— 实现 Skill 生命周期管理（INSTALL → UPDATE → ROLLBACK）

### 受影响文件

计划（实现阶段）：

- `SKILL.md` —— frontmatter 增加 `version`（与发布保持同步）；若选方案 (b) 另增 UPDATE 模式
- 独立实现位于单独的 `ai-skill-manager` 仓库（已存在，Issue #1）——本仓库改动保持最小
- `docs/roadmap.md` / `docs/architecture.md` —— 状态与架构更新
- `references/` —— 除非选方案 (b)，否则不变（新模式将引用更新流程）

### 风险

- 更新中断/损坏 → 需要预置备份与回滚路径
- 自动更新可能引入破坏性变更 → 更新前读 changelog + 用户确认
- 多 Agent 共享 `.agents/skills` 时并发更新 → 串行化/加锁
- 更新可能与已生成产物不兼容（`.governance` 输出、`references/` 结构）→ 版本兼容声明 + 迁移说明
- 回滚后与已治理项目状态失配 → 记录对账步骤

### 验证方法

- CHECK 能正确报告本地 vs 远端版本差异（模拟远端版本测试）
- UPDATE 完整流程：下载 → 备份 → 替换 → 验证（沙箱测试）
- ROLLBACK 能恢复备份版本
- 模拟更新中断不留半损坏状态
- SKILL.md frontmatter `version` 与 release tag 一致（版本一致性检查）