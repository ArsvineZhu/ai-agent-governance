# Post-Review Remediation Backlog (TASK Plan)

[English](post-review-remediation.md) · [简体中文](../../zh-CN/plans/post-review-remediation.md) · [繁體中文](../../zh-TW/plans/post-review-remediation.md)

> **Status: design plan, not implemented.** Delivery verification (`scripts/check-plan-delivery.js`) skips design-only plans; this line is what marks it. This plan is the remediation backlog produced by the v0.10.0 deep review; no implementation has started.

**Target: both** — `scripts/` on the payload side (pre-existing script defects) and `docs/` on the repo side (archive dead links, doc counts). The hook items point at `references/templates/` and `references/init-spec.json` for a future reimplementation. List under Affected Files.

### Objective

Freeze the two kinds of backlog found by the v0.10.0 deep review (five domains: script logic / doc consistency / test coverage / governance artifacts / security) into a trackable list to drive later releases: **(1) pre-existing defects** — present before v0.9.1, not introduced this cycle; **(2) hook reimplementation backlog** — everything that must be done right if `.githooks/pre-commit` is ever re-done after its removal from v0.10.0.

### Scope boundary

This plan does **not** carry the release-blocking defects introduced this cycle (the 5th sync point `lifecycle.policy.md` missing from `CONSENT_SYNC_GROUPS`, the payload-template push contradiction, the `stash`/`pull` net loss, the vacuous tests, the `--doc-root` path traversal, `check-plan-delivery.js`'s own evidence holes, the protected-files cluster enforcing zero docs, CHANGELOG/roadmap/AGENTS.md count drift). Those are fixed immediately before the v0.10.0 release and are handled separately. Only **pre-existing defects** and the **hook B backlog** are recorded here.

### 1. Pre-existing defects (present before v0.9.1)

By file, each with line number and evidence.

1. `scripts/verify_governance.js:202` — `{ name: "Sync groups check", ok: isFile }` passes the function reference instead of calling it. The function object is always truthy, so the check is permanently a no-op and its `ok` field is dropped from JSON. Proven: deleting `scripts/check-sync.js` from a governed project still reports `7/7 passed`. SEVERE.
2. `scripts/check-sync.js:47` — the porcelain parser `/^..\s+(.+)$/` misses git-quoted paths (unicode/space filenames escaped under `core.quotepath`), and a rename's `->` leaks into the captured path. SEVERE.
3. `scripts/check-sync.js:47,:91` — untracked new files are collapsed to a parent directory (`?? docs/`), so a satisfied `require` is misreported as unsynced. Needs `--porcelain -uall`. GENERAL.
4. `scripts/check-lock.js:24` — only `null`/`undefined` release the lock; `locked: false` and `locked: ""` are treated as held, producing a self-contradictory `{"locked": true, "lock": false}`. GENERAL.
5. `scripts/check-lock.js:18`, `scripts/check-sync.js:21`, `scripts/check-git-policy.js:19` — `catch { return null }` collapses "file absent" and "JSON corrupt" into one branch, silently treating corrupt state as the safe outcome (a corrupt lock file admits a second agent; corrupt sync-rules disables the gate). Distinguish `ENOENT` from `SyntaxError` and fail closed on the latter. SEVERE.
6. `scripts/check-secrets.js:11-17` — only 5 patterns; misses Slack/Google/Stripe/Azure/JWT/base64/PEM bodies/punctuated passwords; the credential-assignment charclass excludes `/+=!@$%`; `.env` is skipped wholesale in IGNORED_PATHS (`git add -f .env` passes); `:59` reports `line: "staged-diff"` as a placeholder instead of a real line number. GENERAL.
7. `scripts/check-doc-consistency.js:110` — `mdFiles` compares `rel.startsWith("archive/")` against the Windows `path.relative` result `archive\a.md`, which never matches, so `docs/archive/` links are never scanned. GENERAL.
8. `docs/archive/` — because of #7's blind spot, 10 dead links are never reported: the language-tree back-links (`../../en/plans/...`) and `../roadmap.md` inside `sync-groups-mechanical-check.md`, `governed-project-sync-groups.md`, `review-manager.md`, `tiered-review-gate.md`. GENERAL.
9. `scripts/generate-governance.js:288` — `governance_version` is hardcoded to `"0.9.0"`, one release behind `package.json`. Every INIT-generated `.governance/manifest.json` self-reports 0.9.0; the release version-sync never updates it, so a v0.9.1-initialised project reports the old version. SEVERE (version consistency).

### 2. Hook reimplementation backlog (B plan — must be done right if re-done)

1. Add `.governance/consent.json` to the generated `.gitignore` and to the `.governance/` tracking table in `references/policies/governance-files.policy.md` — the template claims "git-ignored", the generated `.gitignore` does not contain it.
2. Fail-open → fail-closed — missing `consent.json` must exit 1, not the `[ -f ] || exit 0` silent pass (deleting the credential disables the check).
3. Verify the commit message — `consent.json` records a `message` field that the hook parses then discards; the message is the only field a human reads, and its deviation is unenforced.
4. Name `--no-verify` and `git config --unset core.hooksPath` in the vulnerabilities section — the template is honest about "cannot prevent full bypass" but never names these two direct verbs.
5. Fix space/unicode-filename false rejects — use `git -c core.quotePath=false diff --cached --name-only -z`; stop `tr -d ' '` from deleting spaces inside filenames and stop using comma as a separator.
6. Change extraction to fence-count — `generate-governance.js:86-94` slices first-to-last ```, so a second code block silently corrupts the hook.
7. Change the artifact type in `references/init-spec.json` from `documentation` to the correct category — a commit-gating hook classified as docs.
8. Put the generated `.githooks/pre-commit` into the governance-file-protection list — today only the template is protected; the hook generated into target projects is an ordinary file.
9. Test with a real shell — replace the tautological "JS re-implements the fingerprint logic" test with `sh -n` syntax checks plus real git commits (match / mismatch / missing credential).
10. Executable bit 755 — the generated artifact is currently mode 666, not executable on POSIX targets.

### 3. Validation method (per item, after fixing)

- Item 1: after deleting a governed project's `scripts/check-sync.js`, the validator must fail and retain the `ok` field.
- Items 2/3: staged changes with unicode, space, and rename filenames must be correctly matched/not-false-flagged by `check-sync.js`.
- Items 4/5: `locked:false`, `locked:""`, and corrupt `state.json` must be distinguishable; corrupt state fails closed.
- Item 6: verify blocking against known real secret shapes (Slack/Google/Stripe/JWT/PEM body/punctuated password/force-added `.env`).
- Items 7/8: after the fix, `docs/archive/` dead links must be reported by `npm run check` rather than silently green.
- Item 9: a freshly generated manifest's `governance_version` must match `package.json`; re-running INIT reports the current version instead of 0.9.0.
- Hook 1-10: once all land, verify with a real git-commit matrix in a real shell; `npm run check` and `npm run check:all` exit 0, test count raised with no tautological assertions.

### Affected Files

- scripts/verify_governance.js — item 1
- scripts/check-sync.js — items 2, 3, 5
- scripts/check-lock.js — items 4, 5
- scripts/check-git-policy.js — item 5
- scripts/check-secrets.js — item 6
- scripts/check-doc-consistency.js — item 7
- docs/archive — item 8 (dead-link content fix)
- references/templates/githooks-template.md — hook 1-10
- references/init-spec.json — hook 1, 7
- references/policies/governance-files.policy.md — hook 1, 8
- scripts/generate-governance.js — hook 6, item 9
- tests/run-tests.js — hook 9 and regression tests for items 1-6

### Risks

- **Large batch**: pre-existing defects span 7 scripts; a single pass is too broad — batch by severity with independent gates per batch.
- **Whether to redo the hook is open**: after the A removal, re-introducing the hook is itself undecided; this list is a "must do right if redone" constraint, not a commitment to restart it.
- **check-secrets pattern expansion**: new patterns risk false positives; verify with both positive and negative samples so ordinary text is not blocked as a secret.

---
