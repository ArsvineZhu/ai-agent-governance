# AGENTS.md

Guidelines for agents working on the ai-agent-governance skill repo itself. This repo is a skill distribution repository (not a governed software project) — it uses lightweight governance: release flow + plans/archive + ADRs + tests.

## Before touching anything

- Read [SKILL.md](SKILL.md) — it is the product specification, not just a doc
- Read [CONTRIBUTING.md](CONTRIBUTING.md) and the relevant [docs/](docs/) page for the area you change

## Protected files (governance file protection)

Modifying `SKILL.md`, `references/policies/**`, `references/templates/**`, `references/workflows/release.md`, or any `scripts/*.js` requires: reason → CHANGELOG update (if behavioral) → run `npm test`. Never loosen permission limits or remove validation steps. Full protected-files list: `references/policies/governance-files.policy.md` (single source of truth); the above is a summary.

## Change classification (CHANGELOG)

- doc-only (typo, wording, formatting) → no CHANGELOG entry
- bug fix → `Fixed`; new capability → `Added`; architecture/behavior/breaking → `Changed`
- Plans are design docs in each language tree's `plans/` (`docs/<lang>/plans/`); completed plans are archived to `docs/archive/` (shared, single-language) at release, never deleted

## Validation (standard verification procedure)

Run the gate group (`npm run check`) before declaring any task done; run the full group (`npm run check:all`) before release. Record real output (never claim "should pass").

- **Gate layer (fail-closed, exit ≠ 0 blocks):**
  - `npm test` — 39 tests across all scripts (always)
  - `node scripts/check-doc-parity.js` — three language trees structurally parallel (after any `docs/` / root `README.md` / `CONTRIBUTING.md` edit)
- **Advisory layer (exit 0, report only):**
  - `node scripts/check-doc-freshness.js` — stale governance docs (periodic drift-check)
  - `node scripts/check-doc-consistency.js` — cross-document contradictions (periodic drift-check)
- `scripts/verify_governance.js` runs in default mode on this repo and fails by design (skill repo shape) — do not "fix" that by fabricating governance artifacts

## Conventions

- Language policy by audience: agent-facing files (`SKILL.md`, `references/**`, generated artifact bodies) are single-language - never add a second language section; developer-facing files are trilingual and split - the root keeps only the English landing files (`README.md`, `CONTRIBUTING.md`), translations live in their trees (`docs/zh-CN/`, `docs/zh-TW/`), and `docs/en/` holds the rest of the English docs; historical records (`docs/design-decisions/`, `docs/archive/`) are shared single-language 简体中文. 简体中文 is the canonical source; editing one language requires updating the other two in the same change. New terms must be added to `docs/glossary.md` first
- Install payload: the skill consists of `SKILL.md` + `references/` + `scripts/` + `LICENSE` only; `docs/`, `tests/`, `package.json`, `.github/`, README, CONTRIBUTING, CHANGELOG, AGENTS.md are repo infrastructure and must not be copied into skill installations
- Commit messages: Conventional Commits, in English
- Sync group: adding or modifying a sub-skill (in `references/templates/sub-skills.md`) or a check script requires updating, in the same change: `docs/{en,zh-CN,zh-TW}/commands.md` (prompts), `docs/{en,zh-CN,zh-TW}/validator.md` (if validator behavior), `CHANGELOG.md` (if behavioral) — `check-doc-consistency.js`'s prompt-sync check enforces the commands.md half
- Releases follow `references/workflows/release.md`: plan (read-only) → developer approval → tag → GitHub Release. No tag/push/release without explicit approval
- Roadmap horizons are re-baselined at each release (per the maintenance rule in `docs/en/roadmap.md`), not ad-hoc
