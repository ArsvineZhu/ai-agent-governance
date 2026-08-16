# Validator

[English](validator.md) · [简体中文](../zh-CN/validator.md) · [繁體中文](../zh-TW/validator.md)

The governance validator is a zero-dependency plain-Node script generated into each governed project as `scripts/verify-governance.js` (source: this repo's `scripts/verify_governance.js`).

### Usage

```bash
node scripts/verify-governance.js          # human-readable report, exit code = pass/fail
node scripts/verify-governance.js --json   # machine-readable JSON report
node scripts/verify-governance.js --help   # usage
```

Exit code 0 when every governance artifact exists, 1 otherwise.

### Behavior

- **Manifest mode** — when `.governance/manifest.json` declares a non-empty `artifacts` array, paths are resolved from it (structure-adaptive). Adds checks: CHANGELOG format, Git policy, Manifest schema, Manifest artifacts valid (`kind` ∈ file/dir), Governance version, and Release metadata (only when a `release` field is declared).
- **Defaults mode** — without a manifest, built-in defaults are checked:

```
AGENTS.md / CHANGELOG.md / CHANGELOG format / docs/ARCHITECTURE.md / docs/features/ / docs/plans/ /
docs/rules/ / .gitignore / .env.example / CI workflow / scripts/verify-governance.js / scripts/check-lock.js /
scripts/check-git-policy.js / scripts/check-secrets.js / .governance/ directory / manifest.json / state.json /
preflight.json / git-policy.json / governance_version
```

- `validation.json` / `drift-report.json` are runtime outputs, NOT required artifacts — a fresh checkout passes without them.

### Governance badge (optional)

The CI governance job produces a shields.io `endpoint`-format artifact (`governance-badge.json`: `{ "schemaVersion": 1, "label": "governance", "message": "N/M", "color": "green|yellow|red" }`). Host it at a public URL of your choice and reference it in the README:

```markdown
[![Governance](https://img.shields.io/endpoint?url=<YOUR_HOSTED_URL>/governance-badge.json)](docs/validator.md)
```

`score` (passed/total, unweighted v1) in `--json` output is the composite the badge and future dashboards consume. Color thresholds: 100% green, ≥80% yellow, otherwise red.

### Report

Human mode prints `✓/✗ <name> (<path>)` per check plus `N/M checks passed.`. JSON mode returns `{ mode, governance_version, total, passed, failed, score (passed/total), passedAll, results[] }`. Governance checks must pass before a task can be declared done, and before RELEASE.

---
