# Changelog

All notable changes to this project will be documented here.

## [Unreleased]

### Added

- **Impact-face check** — before touching any public interface/module/file, agents must search its references (`rg`) and include found files in the Affected Files plan (Phase 2/3); at task end, Phase 6 compares actual changed files against the planned list (listed-but-unchanged → fix or justify; changed-but-not-listed → explain). Mitigates AI "skipped file" lapses; wired into lifecycle.policy.md, agents-md.template.md, AGENTS.md
- **Review manager sub-skill (implemented)** — 8th sub-skill template in `sub-skills.md`: multi-agent deep review of a change set (5 fixed review domains: correctness, consistency, security, performance, maintainability), severity-ranked findings, review scope = the planned `git diff` change set; wired into `commands.md` (Runtime Components prompt), `SKILL.md` sub-skill list, and `architecture.md`
- **Sync groups L2 mechanical check** — `scripts/check-sync.js` (zero-dependency, read-only): compares the task change set (commits since `state.json` `task_start_sha` plus uncommitted changes) against `.governance/sync-rules.json`; watch hit without require file = BLOCKED (exit 1), `--advisory` downgrades to exit 0, `--json` for CI; wired into `verify_governance.js` default and manifest check lists
- **Repository layout sync gate** — `scripts/check-layout-sync.js` (fail-closed, part of `npm run check`): verifies the Repository Layout tree in all three `docs/{en,zh-CN,zh-TW}/architecture.md` lists every file under `references/` + `scripts/`. Prevents the regression where skill files are added but the architecture doc (and any agent relying on it) goes stale; wired into the gate group so CI blocks instead of relying on agent diligence. AGENTS.md now mandates reading the layout before touching anything.
- **Developer docs reclassified (skill content out of docs)** — `docs/{en,zh-CN,zh-TW}/architecture.md` trimmed to repository layout only (concept map / operating modes / lifecycle pipeline / design principles moved to the skill body in `SKILL.md` / `references/`); `lifecycle.md` / `governance-model.md` / `anti-regression.md` reduced to developer summaries that point to the skill sources; `validator.md` keeps usage and defers the check list to `scripts/verify_governance.js`. The rule is now explicit in AGENTS.md: skill behavior lives only in `references/`; docs may summarize but must reference, never restate.
- **INIT scripted generator** — `scripts/generate-governance.js` (zero-dependency, deterministic): Phase A static skeleton (5 rules, AGENTS.md with resolved placeholders, CHANGELOG, README bootstrap, features/plans/ARCHITECTURE skeletons) + Phase B config/state/scripts (.gitignore, .env.example, .gitmessage, .governance/ state files with valid JSON, 5 scripts); reads `references/init-spec.json` (single source of truth); `--dry-run`/`--json`/`--phase A|B|C`; existing files skipped never overwritten; manifest generated last listing only artifacts that exist on disk, release field omitted for fresh INIT; e2e-tested (Phase B output passes verify-governance.js, byte-identical determinism on full trees)

### Changed

- **Scope-tiered lifecycle** — small changes (single file, <50 lines, no public-interface change) run Understand → Implement → Validate → Report only (skip Plan/Synchronize); medium/large run the full six-phase lifecycle with a TASK plan. Aligns with mainstream practice (tier by size, not one-size-fits-all)
- **CHANGELOG timing** — written at merge/release boundaries (per release flow), not per commit/task; small changes carry no entry
- **Tiered review gate** — release Proposal now carries `Risk level` (low/medium/high) + `Review recommendation` (none/suggested/required); high-risk changes (security/permissions/deletion protection/governance files) require review-manager or item-by-item confirmation; lightweight gates always run
- **Governed-project sync groups (L1)** — INIT generates `.governance/sync-rules.json` (declarative watch/require groups); Phase 5 mandates group-by-group reconciliation (watch hit + require missing = task not done); added to protected-files lists across all sync points (caught by the consistency check)
- **Review manager v2 — dual mode** — the 8th sub-skill now splits into lightweight (existing triggers: `review this` / `review the changes` / `audit recent changes` / `review my changes` / `审核一下`: 5 fixed domains, severity-sorted, fix + gates) and full audit (new triggers: `deep review` / `full review` / `audit everything` / `全面审查` / `彻底审查` / `逐行审查`: exhaustive change-set enumeration, line-by-line read of every changed file, dev-plan cross-reference, execution-level verification, distrust of gates, evidence-form report). Fixes the v1 gap where a review of just-written code could miss everything (confirmation bias + trusted-but-false gate results).

## [0.8.0] - 2026-08-16

### Added

- **Governance score** — `verify-governance.js --json` outputs `score` (passed/total, unweighted v1); CI produces a shields.io `governance-badge.json` endpoint artifact (green ≥100% / yellow ≥80% / red otherwise)
- **Doc freshness check** — `scripts/check-doc-freshness.js` flags stale governance docs via `git log` commit dates (30d stale / 90d very stale, code-activity-aware; advisory only, exit 0 always); drift-check sub-skill template gains the `freshness` mode; results appended to `.governance/drift-report.json`
- **Doc consistency check** — `scripts/check-doc-consistency.js` flags cross-document contradictions (stale version examples, fragmented protected-file lists, stale ADR statuses, expired roadmap targets, broken links, wrong numeric claims; trilingual tree parity delegated to `check-doc-parity.js`); advisory only, exit 0 always; drift-check sub-skill template gains the `consistency` mode; results appended to `.governance/drift-report.json`
- **Standard verification procedure** — `npm run check` (gate group: tests + doc parity) and `npm run check:all` (gates + advisory freshness/consistency); lifecycle Phase 4 defines the governed-project validation sequence (lock → git policy → secrets → validator → test/lint/build → advisory)
- **Prompt-sync check** — `check-doc-consistency.js` now verifies every sub-skill trigger in `sub-skills.md` appears in all three `commands.md` (prevents new sub-skills/modes from silently missing their prompts); AGENTS.md documents the sync group (sub-skills → commands.md/validator.md/CHANGELOG in one change)
- **Roadmap decoupled from version numbers** — roadmap/README use time horizons only (near/mid/long-term), no `Target: vX.Y.Z` fields; versions are decided by actual delivery at release time (SemVer), not by plan commitments
- **5 new plan docs** — review-manager (8th sub-skill, multi-agent deep review), tiered-review-gate (risk-tiered release review), governed-project sync groups (L1 declarative + L2 mechanical check); commands.md prompt coverage completed (all 23 sub-skill triggers documented)

### Fixed

- Stale version examples in `SKILL.md` (0.5.1 → 0.7.1), missing `check-secrets.js` in anti-regression and agents-md.template protected-file lists — caught by the new consistency check during development
- INIT copy list now includes the advisory scripts (`check-doc-freshness.js`, `check-doc-consistency.js`; `check-doc-parity.js` on multi-language trees); drift-check template consistency mode no longer references scripts the governed project lacks
- `check-doc-consistency.js`: semantic version compare for roadmap targets (string compare misjudged v0.10.0 < v0.9.0); manifest `release.version` included in version-example scan; parity delegated check reports "unavailable"/"error" instead of falsely claiming pass; validator filename fallback (`verify-governance.js`)
- `check-doc-freshness.js`: ghost paths (in git history but not on disk) are skipped

## [0.7.1] - 2026-08-14

### Fixed

- `scripts/package-skill.sh` - builds the release payload tarball (`dist/ai-agent-governance-skill.tar.gz`, version-stable name) containing only `SKILL.md` + `references/` + `scripts/` + `LICENSE`; `.gitignore` ignores `dist/`
- Install payload defined in `SKILL.md` (the file every installing agent must read); README install sections rewritten with tarball-first flow; release flow gains step 10 (package + upload the payload asset with content verification)

## [0.7.0] - 2026-08-14

### Added

- `docs/glossary.md` - trilingual terminology table (single source of truth for term renderings)
- ADR-0005: trilingual split documentation (supersedes ADR-0003's single-file bilingual layout for developer-facing files)
- `scripts/check-doc-parity.js` - read-only structural parity check for the three language trees (heading/code-block/table/list signatures); wired into CI, `npm run docs:parity`, and the release precondition `docs.parity_passed`; covered by 3 tests
- Install payload defined - the skill is `SKILL.md` + `references/` + `scripts/` + `LICENSE` only; docs/tests/package.json/.github/README/CONTRIBUTING/CHANGELOG/AGENTS.md are repo infrastructure and must not be copied into skill installations (README, skill-discovery, AGENTS.md)

### Changed

- **Trilingual documentation split (ADR-0005)** - developer-facing docs split into three language trees (`docs/en/` + `docs/zh-CN/` canonical + `docs/zh-TW/` Taiwan usage); the root keeps only the English landing files (`README.md`, `CONTRIBUTING.md`), translations live in their trees; ADR decision history (`docs/design-decisions/`) and completed-plan archives (`docs/archive/`) moved to a shared single-language (简体中文) space; three trees are fully parallel
- **Governed-project language policy** - INIT now generates a split README by default (root `README.md` English landing + `docs/README.zh-CN.md` translation); language-variant files never pile up in the project root; multi-language doc trees only on explicit project convention; historical records (archives, ADRs) are never translated; glossary optional for multilingual projects; draft-exception rule (stable docs sync same-commit, in-flight drafts may defer until push/release)

### Fixed

- Archive files converted to single-language 简体中文 (were bilingual frozen copies); zh-TW code-block/comment translations completed; architecture/roadmap stale path references fixed; glossary expanded with high-frequency terms
- `check-doc-parity.js` boundary fixes - table signatures flush correctly after headings/code fences; missing trees/entry files reported gracefully instead of crashing

## [0.6.0] - 2026-08-13

### Added

- **Agent activity audit** — `.governance/activity.jsonl` append-only per-task audit trail (written by state-manager; `action` vocabulary v1; secret redaction mandatory); drift-check gains `activity-report` mode (per agent / per action / failed only)
- **Secret scanning gate** — `scripts/check-secrets.js` read-only staged-diff scanner (AWS/GitHub/OpenAI-style/private-key/credential-assignment patterns; reports `file:line` + pattern class, never the secret); validator default checks 19 → 20; mandatory pre-commit step in git policy

### Changed

- `activity.jsonl` declared as git-ignored runtime output; `scripts/check-secrets.js` added to the protected-files list

### Tests

- Test suite 23 → 26 (secret hit exit 1 without leaking token, clean diff exit 0, missing check-secrets validator failure)

## [0.5.2] - 2026-08-13

### Added

- SKILL.md frontmatter gains `version` (synced with releases) and update-check triggers (`check skill update` / `update this skill`): the agent reads the local version, compares against the latest GitHub release, and reports the CHANGELOG delta — never auto-updates
- Version consistency rule extended to five places: package.json · CHANGELOG · manifest `governance_version` · SKILL.md frontmatter `version` · tag

## [0.5.1] - 2026-08-13

### Fixed

- Synced stale version examples (0.3.3 → 0.5.1) in SKILL.md manifest example and `references/workflows/release.md`
- Added 3 missing protected files (`.governance/git-policy.json`, `scripts/check-lock.js`, `scripts/check-git-policy.js`) to 4 summary lists (SKILL.md governance protection, docs/anti-regression.md, agents-md.template.md, git.policy.md)
- Fixed stale ADR-0004 status (`Accepted (Unreleased)` → `Accepted (v0.4.0)`) and expired skill-lifecycle target version (v0.5.0 → v0.6.0)

### Docs

- Added 6 feature plan docs (agent-activity-audit / secret-scanning-gate / knowledge-freshness / governance-score / init-scripted-generator / content-consistency), reordered roadmap with time horizons (near/mid/long/very-long-term) and added the rolling re-baseline maintenance rule

## [0.5.0] - 2026-08-12

### Added

- **Git Workflow Governance** — INIT generates `.governance/git-policy.json` (protected branches, no direct push, require review, no force push) and `scripts/check-git-policy.js` (read-only gate: blocked on protected branch when `directPush=false`); branch-based development (`feature/agent-<date>-<summary>`) with small-change exemption
- `references/templates/git-policy.template.md` — git policy template + field semantics + generation rules
- Validator default checks 17 → 19: adds Git policy (JSON valid + field types) and `scripts/check-git-policy.js`; manifest mode adds the Git policy check (12 total)
- `git-policy.json` / `check-git-policy.js` added to the protected-files list and tracked `.governance` state

### Changed

- `references/policies/git.policy.md` gains the Branch Workflow section; `references/templates/agents-md.template.md` gains the Git Workflow Governance summary
- New 7th generated sub-skill `plan-manager` (TASK creation, milestone check-off, completion marking; archiving stays in release-manager) — sub-skills template, SKILL.md Phase 1, commands.md runtime components
- MIGRATE flow: explicit upgrade path for governed projects whose `governance_version` lags (migration list = validator missing artifacts + CHANGELOG entries; user-confirmed, never auto-upgrade; verified by validator exit 0) — SKILL.md AUDIT section, governance-model.md

### Tests

- Test suite 20 → 23: invalid git-policy exits 1, protected branch blocked exits 1, feature branch passes exits 0

## [0.4.1] - 2026-08-12

### Added

- `references/templates/env-example.template.md` and `references/templates/gitmessage.template.md` — INIT now generates `.env.example` / `.gitmessage.txt` from concrete templates instead of ad-hoc
- CI templates: full GitLab CI pipeline (format / lint / test / build / governance), docs-only project pipeline (markdownlint + link check), `dependabot.yml` template in `references/workflows/ci.md`
- `scripts/release-manager.js plan --file <path>` — read JSON input from a file (avoids shell quoting issues)
- `scripts/check-lock.js` — read-only multi-agent lock check for `.governance/state.json` (exit 1 = another agent holds a lock); INIT now copies it next to the validator, and the validator checks for it

### Fixed

- `state.json` example in SKILL.md used `phase: "CI_SETUP"`, inconsistent with the six-phase state machine — corrected to a valid lifecycle phase
- Roadmap targets updated: Skill lifecycle management moved to v0.5.0 (v0.4.0 shipped without it)

### Changed

- Validator default checks 15 → 17: adds CHANGELOG format (Keep a Changelog version section) and `scripts/check-lock.js`; manifest mode adds CHANGELOG format and manifest `artifacts[].kind` validity
- Lifecycle Phase 5 archive rule (two-phase): completion checks off milestones in `DEVELOPMENT_PLAN.md` and marks the TASK `Status` as Completed; RELEASE archives the version's completed milestones (aggregated into `docs/plans/archive/vX.Y.Z.md`) and completed `TASK_<name>.md` files (moved as individual files); original entries preserved, never deleted; unfinished items stay in `docs/plans/`
- Fixed release flow ordering: version sync + plan archival now precede the release commit; the annotated tag is created AFTER the commit (tag points to a HEAD containing version and archive changes); proposal `headSha` is refreshed before execute
- Refined SemVer Minor rule: Minor requires a **user-perceivable** new capability; internal tooling/mechanism improvements (lock checks, content validation, template additions, flow ordering, internal flags) are Patch
- Roadmap gains two planned items: multi-agent lock enforcement, validator content checks
- Test suite extended 15 → 20 (lock check ×3, CHANGELOG format, `--file` plan input)

## [0.4.0] - 2026-08-12

### Added

- Human-in-the-loop release flow: Analyze → Release Proposal → Developer Approval → Create Git Tag → Create Release (proposal + approval gate formalized in `references/workflows/release.md`)
- `scripts/release-manager.js` — zero-dependency release tool: `plan` (read-only SemVer 2.0.0 classification + Release Proposal) and `execute` (approval-gated annotated tag creation with pre-execution re-verification of clean tree and HEAD)
- SemVer 2.0.0 version-decision rules: Major only for real breaking changes (external/API/CLI/protocol impact), Minor only for backward-compatible capabilities, Patch otherwise; forbidden heuristics (diff size / commit count / file count / code volume)
- 0.x rule: breaking changes never auto-bump to 1.0.0 — only an explicit developer request
- `release.proposal_approved` precondition; `release-proposal.json` recorded as git-ignored runtime approval evidence (ADR-0004)

### Changed

- `release-manager` sub-skill template rewritten around the approval-gated flow; `git tag` moved to the confirmation-required list in `references/policies/git.policy.md`
- Lifecycle Phase 5 (Synchronize) now mandates updating `docs/plans/DEVELOPMENT_PLAN.md` (milestone check-off / status / acceptance) when a corresponding milestone exists (`references/policies/lifecycle.policy.md`, `references/templates/agents-md.template.md`)

### Tests

- Test suite extended 8 → 15: SemVer classification (docs → patch, refactor → patch, CLI command → minor, deleted API → major), clarification request (exit 2), unapproved execute creates no tag, approved execute creates annotated tag

## [0.3.3] - 2026-08-10

### Added

- INIT generates a basic bilingual `README.md` (English first, then 简体中文, anchor-switched via `[English](#english) · [简体中文](#chinese)`) when the project has none; existing READMEs are only merged with the index/badge, never overwritten
- CI templates expanded to Node/TS, Python, Rust, Go, Java (Maven), and C++ (CMake/CTest), each with an explicit format step (Prettier / ruff format / cargo fmt / gofmt / spotless:check / clang-format)
- C++ INIT generates a `.clang-format` style baseline (Attach braces, 4-space indent, 120-col) consumed by CI's `clang-format --dry-run`
- Java CI requires spotless in `pom.xml` (google-java-format) — INIT writes the plugin; Node/TS and Python documented as optional-config (Prettier default / ruff default)

## [0.3.2] - 2026-08-10

### Fixed

- Validator no longer requires `.governance/validation.json`: it is a git-ignored runtime output, so fresh-checkout CI passes without it (default checks 16 → 15)
- Restored separation between tracked governance state (`manifest.json` / `state.json` / `preflight.json` / `generated/`) and runtime outputs (`validation.json` / `drift-report.json`)
- Updated documentation and tests to reflect runtime output semantics (absent → OK, present → OK)

## [0.3.1] - 2026-08-10

### Fixed

- Aligned manifest version examples with the v0.3.1 release.
- Removed remaining runtime ambiguity around legacy `.agent` paths.
- Added regression test ensuring the governance runtime only uses `.governance`.

### Tests

- All tests passing (7/7).

## [0.3.0] - 2026-08-10

### Added

- RELEASE governance mode, completing the lifecycle: INIT → Runtime → AUDIT → RELEASE
- Generated `release-manager` sub-skill (enforces preconditions, version-synced, transactional release)
- Centralized release policy (`references/workflows/release.md`): release requirements, version consistency rules, release workflow, transactional guarantee
- Optional `release` metadata in `manifest.json` (`version` / `tag` / `validated`)

### Changed

- Validator validates release metadata when declared (Release metadata check in manifest mode)
- Updated documentation: Governance Flow, architecture diagrams, feature overview, Roadmap

### Lifecycle

AI Agent Governance now supports:

```
INIT → Runtime → AUDIT → RELEASE
```

## [0.2.0] - 2026-08-10

### Changed

- Rename governance state directory from `.agent/` to `.governance/` to avoid confusion with the `.agents/` skill installation directory
- Move generated agent modules to `.governance/generated/skills/` (clear separation from the `.agents/skills` install layer)
- Rename `reference/` → `references/`, `test/` → `tests/` for ecosystem consistency
- Strengthen `manifest.json` as the single desired-state index: artifacts gain a semantic `type` (policy / documentation / script / ci / state) alongside the filesystem `kind`; `type` is documentation metadata and does not affect filesystem validation
- Add `schema_version` to `manifest.json` (data-format version) distinct from `governance_version` (framework version)
- Track `.governance/manifest.json`, `state.json`, `generated/` in git (Governance as Code); ignore only runtime outputs (`validation.json`, `drift-report.json`)
- Add `references/policies/governance-files.policy.md` as the single source for protected files and `.governance/` git-tracking policy
- Align SKILL.md Phase 2 check list with the validator's default checks (validator is the source of truth)
- Add `--help` to `verify-governance.js`; INIT now generates `.governance/README.md`
- Test suite now covers `--help` (6 tests)

### Migration

- Existing `.governance/skills` directories should migrate to `.governance/generated/skills`.
- Existing `.agent/` state directories should migrate to `.governance/` (manifest keeps `governance_version`; add `schema_version: "1.0"`).

## [0.1.0] - 2026-08-10

### Added

- AI Agent governance framework (SKILL.md-based, tool-agnostic)
- One-instruction INIT workflow: Inspect → Build → Validate → Report
- AGENTS.md generation with `@`-referenced rule files
- Rule system templates: lifecycle / git-policy / security / coding / testing
- Architecture doc + ADR + component registry template
- Feature registry with anti-fabrication placeholder strategy
- Git permission model (push forbidden, delete/dependency/commit require confirmation)
- Zero-dependency governance validator (`scripts/verify-governance.js`, manifest-driven paths)
- Audit workflow: health check + drift detection + minimal fixes
- Machine-readable `.agent/` state (manifest / state / validation / preflight)
- Capability-detected CI templates with graceful degradation
- Generated agent modules (repository-inspection / ci-generator / governance-validator / state-manager / drift-check)
- Test suite (6 tests: empty / default / custom-manifest / missing version / json output / help)
