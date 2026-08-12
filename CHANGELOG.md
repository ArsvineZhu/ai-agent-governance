# Changelog

All notable changes to this project will be documented here.

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
