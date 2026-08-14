# Knowledge Freshness Detection（TASK 计划）

[English](knowledge-freshness.md) · [简体中文](../../zh-CN/plans/knowledge-freshness.md) · [繁體中文](../../zh-TW/plans/knowledge-freshness.md)

### Task Purpose

Upgrade drift detection from **existence** to **freshness**: flag governance docs that went stale relative to code activity, so knowledge decay is caught before it becomes technical debt.

### Current Problem

- drift-check compares declared artifacts against reality + `governance_version` — a doc that *exists* but is *outdated* passes every check
- Code changes weekly while `docs/ARCHITECTURE.md` goes untouched for months → knowledge silently rots
- The two mandatory docs (ARCHITECTURE.md, CHANGELOG) have no staleness signal

### Proposed Solution

drift-check gains a `freshness` mode (report-only, **never** a gate):

- Staleness per doc = days since its **last git commit** vs. code activity (commits touching `src/` etc. in the same window)
- **Use `git log -1 --format=%cs -- <doc>`**, not filesystem mtime — fresh clones have all mtimes equal to checkout time
- Thresholds (advisory): no commits to the doc in 30+ days while code is active → `stale`; 90+ days → `very stale`
- Output lands in the existing `.governance/drift-report.json` as `"stale": ["docs/ARCHITECTURE.md", ...]`
- Mandatory-doc pair is reported first; feature docs included

### Affected Files

- `references/templates/sub-skills.md` — drift-check gains `freshness` mode
- `.governance/drift-report.json` schema — `stale` array (runtime output; schema note only)
- `docs/commands.md` — command doc sync
- Validator: **unchanged** (advisory report, not a check)

### Risks

- **Stable projects false-flag** — low commit volume projects may show stale docs; advisory-only (no exit-code failure) neutralizes this
- **git-log vs mtime** — must use commit dates; a design assertion, not an implementation detail
- **File moves/renames** — doc renames reset `git log -- <path>` history; v1 accepts this, v1.1 can use `--follow`

### Validation Method

- Synthetic git history: doc untouched 60 days + active code → `stale` flagged (test)
- Recently-touched doc → not flagged (test)
- Fresh clone (all mtimes equal) still computes correct staleness via git log (test)
- drift-report.json contains the `stale` array; validator exit codes unchanged (regression)

---
