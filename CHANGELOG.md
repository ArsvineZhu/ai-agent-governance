# Changelog

All notable changes to this project will be documented here.

## [Unreleased]

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
- Test suite (5 tests: empty / default / custom-manifest / missing version / json output)
