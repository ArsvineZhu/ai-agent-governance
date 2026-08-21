# AGENTS.md

Guidelines for agents working on the ai-agent-governance skill repo itself. This repo is a skill distribution repository (not a governed software project) — it uses lightweight governance: release flow + plans/archive + ADRs + tests.

## Repository architecture (what each directory is FOR)

| Path | Role | Reader | Language |
| --- | --- | --- | --- |
| `SKILL.md` | Skill entry point / product spec | agents (skill users) | single |
| `references/` | **Skill body — the only place skill behavior lives.** Policies, templates, workflows that get copied into governed projects or define how the skill acts. | agents (skill users) | single |
| `scripts/` | Skill runtime scripts (validator, checks, generators, release tool) — part of the install payload | agents/CI | code |
| `LICENSE` | MIT license — part of the install payload | installers | — |
| `docs/` | **User/developer manual. NOT part of the skill payload.** Explains how to use the skill (trigger words in `commands.md`), design plans (`plans/`), roadmap, glossary. | users/developers | trilingual |
| `tests/`, `package.json`, `.github/`, `CHANGELOG.md`, `CONTRIBUTING.md`, `README.md`, `AGENTS.md` | Repo infrastructure: CI, release flow, change log, contributor guide | repo maintainers | per file |

Hard rules that follow from this:

- **Changing skill behavior = editing `references/` only** (+ `SKILL.md` if a pointer/entry changes + `CHANGELOG.md` if behavioral). Done. Docs edits never change what the skill does.
- **`docs/` edits are a documentation duty, not the feature.** When a sub-skill gains/changes trigger words, syncing them into `docs/{en,zh-CN,zh-TW}/commands.md` exists so USERS can learn how to invoke the skill — it serves the manual, not the skill. The skill works with or without it.
- **Never restate skill content into `docs/`.** Docs reference the skill (file + section pointer), they do not copy workflows, step lists, or full trigger inventories.
- **Classification judge rule** — ask "who reads this and does it change the skill?" Skill behavior (modes, lifecycle, templates, policies, validator checks, trigger definitions) → `references/`, single-language. Developer/user docs (how to install, how to invoke, design history, roadmap, glossary) → `docs/`, trilingual. A `docs/` page may summarize a skill concept but must point to the skill source rather than re-specify it.

## Before touching anything

- **Read `docs/en/architecture.md` — Repository Layout section** — it is the mandatory map of what each directory is FOR. The layout gate (`npm run check` → `docs:layout`) fails CI if this tree drifts from `references/` + `scripts/`, so keeping it read-and-current is enforced, not optional.
- Read [SKILL.md](SKILL.md) — it is the product specification, not just a doc
- Read [CONTRIBUTING.md](CONTRIBUTING.md) and the relevant [docs/](docs/) page for the area you change

## Protected files (governance file protection)

Modifying `SKILL.md`, `references/policies/**`, `references/templates/**`, `references/workflows/release.md`, or any `scripts/*.js` requires: reason → CHANGELOG update (if behavioral) → run `npm test`. Never loosen permission limits or remove validation steps. Full protected-files list: `references/policies/governance-files.policy.md` (single source of truth); the above is a summary.

## Change classification (CHANGELOG)

- doc-only (typo, wording, formatting) → no CHANGELOG entry
- bug fix → `Fixed`; new capability → `Added`; architecture/behavior/breaking → `Changed`
- CHANGELOG is written at merge/release boundaries (per the release flow), not per commit
- Small changes (single file, no public-interface change) skip the full lifecycle and CHANGELOG entry; medium/large changes follow the full six-phase lifecycle (per `references/policies/lifecycle.policy.md` scope tiers)
- Plans are design docs in each language tree's `plans/` (`docs/<lang>/plans/`); completed plans are archived to `docs/archive/` (shared, single-language) at release, never deleted

## Validation (standard verification procedure)

Run the gate group (`npm run check`) before declaring any task done; run the full group (`npm run check:all`) before release. Record real output (never claim "should pass").

- **Impact-face check** — before touching any public interface/module/file, search its references first (`rg "<name>"`); found files enter the Affected Files list. At task end, compare actual changed files (`git diff --name-only`) against that list: listed-but-unchanged → fix or justify; changed-but-not-listed → explain (or revert if it was a lazy side-edit).

- **Gate layer (fail-closed, exit ≠ 0 blocks):**
  - `npm test` — 55 tests across all scripts (always)
  - `node scripts/check-doc-parity.js` — three language trees structurally parallel (after any `docs/` / root `README.md` / `CONTRIBUTING.md` edit)
  - `node scripts/check-layout-sync.js` — `docs/{en,zh-CN,zh-TW}/architecture.md` Repository Layout must list every file under `references/` + `scripts/` (after any `references/` / `scripts/` / `architecture.md` edit)
- **Advisory layer (exit 0, report only):**
  - `node scripts/check-doc-freshness.js` — stale governance docs (periodic drift-check)
  - `node scripts/check-doc-consistency.js` — cross-document contradictions (periodic drift-check)
- `scripts/verify_governance.js` runs in default mode on this repo and fails by design (skill repo shape) — do not "fix" that by fabricating governance artifacts

## Conventions

- Language policy by audience: agent-facing files (`SKILL.md`, `references/**`, generated artifact bodies) are single-language - never add a second language section; developer-facing files are trilingual and split - the root keeps only the English landing files (`README.md`, `CONTRIBUTING.md`), translations live in their trees (`docs/zh-CN/`, `docs/zh-TW/`), and `docs/en/` holds the rest of the English docs; historical records (`docs/design-decisions/`, `docs/archive/`) are shared single-language 简体中文. 简体中文 is the canonical source; editing one language requires updating the other two in the same change. New terms must be added to `docs/glossary.md` first
- Install payload: the skill consists of `SKILL.md` + `references/` + `scripts/` + `LICENSE` only; `docs/`, `tests/`, `package.json`, `.github/`, README, CONTRIBUTING, CHANGELOG, AGENTS.md are repo infrastructure and must not be copied into skill installations
- Commit messages: Conventional Commits, in English
- Sync group: adding or modifying a sub-skill (in `references/templates/sub-skills.md`) or a check script requires updating, in the same change: `docs/{en,zh-CN,zh-TW}/commands.md` (trigger words — user manual duty, see Repository architecture), `docs/{en,zh-CN,zh-TW}/validator.md` (if validator behavior), `CHANGELOG.md` (if behavioral) — `check-doc-consistency.js`'s prompt-sync check enforces the commands.md half
- Releases follow `references/workflows/release.md`: plan (read-only) → developer approval → tag → GitHub Release. No tag/push/release without explicit approval. **Path mapping for THIS repo** — `release.md` is payload written for governed projects (`docs/plans/` → `docs/plans/archive/`, milestones in `DEVELOPMENT_PLAN.md`); this repo's equivalents are: plans in the three language trees (`docs/{en,zh-CN,zh-TW}/plans/`) → archived to `docs/archive/` (shared, single-language); no `DEVELOPMENT_PLAN.md` — milestone tracking lives in `docs/en/roadmap.md`. Follow release.md's steps, substitute these paths.
- Roadmap horizons are re-baselined at each release (per the maintenance rule in `docs/en/roadmap.md`), not ad-hoc

## Git Operation Safety Protocol (HIGHEST PRIORITY)

Read-only git ops (`status`/`log`/`diff`/`show`/`fetch`/`remote`/`branch`) are free. All write ops (`add`/`commit`/`push`/`merge`/`rebase`/`reset`/`stash`/`revert`/`clean`/`pull`) are **forbidden without explicit consent**. Consent is **turn-scoped** — a prior "确认" does not carry over; each write op needs its own fresh confirmation. Echo the exact command before running it. When in doubt, ask first.
