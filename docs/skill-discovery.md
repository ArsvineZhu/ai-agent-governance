# Skill Discovery

[English](#english) · [简体中文](#chinese)

---

## English

This project is implemented as an AI agent skill. Different agents load it through their own skill/rule discovery mechanisms — the mechanics differ per agent, the contract does not.

### How It Works

```
installation directory (per agent: .agents/skills · .claude/skills · .opencode/skills · ...)
        |
        v
agent scans skill metadata (frontmatter: name + description)
        |
        v
user intent → description match (e.g. "initialize project governance")
        |
        v
SKILL.md loaded → workflow executes (INIT / AUDIT / RELEASE)
```

The frontmatter `description` is the matching key — it declares the trigger phrases the agent matches against. Users just type the prompt they want:

```text
initialize project governance
audit governance
release
```

Full prompt list and what each one does: [commands.md](commands.md)

### Per-Agent Notes

Install paths by agent:

| Location | Auto-discovered by | Best for |
| --- | --- | --- |
| `.agents/skills` | opencode + Claude-compatible agents | cross-agent sharing |
| `.claude/skills` | opencode, Claude Code | Claude Code ecosystem |
| `.opencode/skills` | opencode | opencode-only |
| `~/.config/opencode/skills` | opencode (global) | machine-wide for opencode |

- **Claude Code** — reads `.claude/skills/<name>/SKILL.md` and matches by metadata description.
- **opencode** — auto-scans `.opencode/skills`, `.claude/skills`, `.agents/skills` (project and global).
- **Cursor** — leans on `.cursor/rules` and agent rules; skill loading follows its own mechanism.
- **Codex / others** — depend on their skill-loading implementation; AGENTS.md-based agents apply the generated runtime contract regardless.

---

## Chinese

本项目以 AI Agent skill 形式实现。不同 Agent 通过各自的 skill/rule discovery 机制加载它 —— 各 Agent 的机制不同，契约一致。

### 工作原理

```
安装目录（按 Agent：.agents/skills · .claude/skills · .opencode/skills · ...）
        |
        v
Agent 扫描 skill 元数据（frontmatter：name + description）
        |
        v
用户意图 → description 匹配（如 "initialize project governance"）
        |
        v
加载 SKILL.md → 执行工作流（INIT / AUDIT / RELEASE）
```

frontmatter 的 `description` 是匹配的关键 —— 它声明了 Agent 用来匹配的触发短语。用户只需要输入想要的提示词：

```text
initialize project governance
audit governance
release
```

完整提示词列表及各自行为：[commands.md](commands.md)

### 各 Agent 差异

各 Agent 的安装路径：

| 位置 | 自动发现方 | 适合 |
| --- | --- | --- |
| `.agents/skills` | opencode 及 Claude 兼容 Agent | 跨 Agent 共享 |
| `.claude/skills` | opencode、Claude Code | Claude Code 生态 |
| `.opencode/skills` | opencode | 仅 opencode |
| `~/.config/opencode/skills` | opencode（全局） | 全机器 opencode 使用 |

- **Claude Code** — 读取 `.claude/skills/<name>/SKILL.md`，按元数据 description 匹配。
- **opencode** — 自动扫描 `.opencode/skills`、`.claude/skills`、`.agents/skills`（项目级与全局级）。
- **Cursor** — 依赖 `.cursor/rules` 与 Agent Rules；skill 加载遵循自身机制。
- **Codex / 其他** — 取决于各自 skill 加载实现；基于 AGENTS.md 的 Agent 无论机制如何都遵循生成的运行时契约。