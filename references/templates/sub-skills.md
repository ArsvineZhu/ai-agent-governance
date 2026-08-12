# .governance/generated/skills/ 子技能（生成到目标项目 `.governance/generated/skills/<name>/SKILL.md`）

生成的子技能供**项目内的后续 Agent 开发任务**使用。生成后若项目用 opencode，写入 `opencode.json`：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "skills": { "paths": [".governance/generated/skills"] }
}
```

---

## 1. repository-inspection

````
---
name: repository-inspection
description: Use at the start of any task in this repo to inspect the environment. Loads project type, language, package manager, build tool, test framework, linter, git state, existing CI, and existing AI guidance files. Triggers on "inspect the repo", "what is the stack", "check environment".
---

# Repository Inspection

Run before creating or modifying anything. Use shell/glob/read tools, then fill and return this JSON:

{"projectType":"","language":"","packageManager":"","buildTool":"","testFramework":"","linter":"","gitRepo":true,"ci":"","existingDocs":[],"missingAutomation":[],"plannedChanges":[]}

Detection hints:
- package.json -> pnpm/npm/yarn (pnpm-lock.yaml / package-lock.json / yarn.lock)
- pyproject.toml -> uv/poetry/pip
- pom.xml -> Maven; build.gradle(.kts) -> Gradle; Cargo.toml -> Cargo; go.mod -> Go modules
- CI: .github/workflows / .gitlab-ci.yml / .circleci/config.yml / Jenkinsfile

Constraints:
- Never overwrite important files; merge or update existing.
- Never delete existing config without stating a reason.
- Output: JSON report above, plus the file(s) changed, if any.
````

---

## 2. ci-generator

````
---
name: ci-generator
description: Use when this repo needs CI configuration for its detected stack. Generates a GitHub Actions / GitLab CI pipeline matching the repository's package manager, test framework and build tool. Triggers on "setup CI", "add CI", "create workflow".
---

# CI Generator

Input (from repository-inspection):

{"language":"typescript","packageManager":"pnpm","test":"vitest","buildTool":"tsup","ci":"github-actions"}

Rules:
- Pipeline MUST include: install deps -> format check -> lint -> typecheck -> test -> build -> upload artifacts.
- Use the project package manager and lockfile; pin tool versions.
- If CI platform is unknown or permissions are missing -> report ⚠️ Blocked with the exact reason.
- Real config only; verify YAML validity.
````

---

## 3. governance-validator

````
---
name: governance-validator
description: Use to check that this repo's governance artifacts are intact before declaring a task complete. Runs scripts/verify-governance.js and records results into .governance/validation.json. Triggers on "governance check", "verify governance", "validate AGENTS".
---

# Governance Validator

Run: `node scripts/verify-governance.js` (or registered npm script `npm run governance-check`).

Path resolution: uses `.governance/manifest.json` artifacts when present (structure-adaptive), otherwise built-in defaults. Checks: AGENTS.md, CHANGELOG.md, ARCHITECTURE, features, plans, rules, .gitignore, .env.example, CI config, validator self, `.governance/` (dir, manifest.json, state.json, preflight.json), governance_version. `validation.json` / `drift-report.json` are runtime outputs and are NOT required.

Then update `.governance/validation.json`:

```json
{"timestamp":"<ISO>","mode":"manifest","total":0,"passed":0,"failed":0,"passedAll":false,"results":[]}
```

If any check fails -> report ❌ Failed with the missing items. Do NOT declare the task done until exit code is 0.
````

---

## 4. state-manager

````
---
name: state-manager
description: Use at the end of any agent task to persist progress into .governance/state.json. Tracks maturity, phase, agent identity, completed items and blocked items so later sessions resume correctly. Triggers on "update state", "record progress".
---

# State Manager

State machine: `understand → plan → implement → validate → synchronize → report`, plus terminal states `completed / blocked / failed`. Any phase failure → `blocked`/`failed`. On crash/recovery, read `phase` to find the resume point — never re-run completed items, never skip phases.

At the end of every task (or on interruption), update `.governance/state.json`:

```json
{"maturity":"","phase":"","agent_id":"","task_id":"","locked":null,"completed":[],"blocked":[],"updatedAt":"<ISO>"}
```

- `maturity`: LEVEL_0_EMPTY / LEVEL_1_PROTOTYPE / LEVEL_2_ACTIVE / LEVEL_3_PRODUCTION
- `phase`: one of the lifecycle phases above (understand / plan / implement / validate / synchronize / report / completed / blocked / failed)
- `agent_id` / `task_id`: identify the working agent; used for multi-agent locking
- `locked`: set while actively modifying a file; null when done
- `completed`: list of done items (docs, agents, rules, security, ci, state)
- `blocked`: external blockers with reason (e.g. "github_permission")

Multi-agent rule: before starting, run `node scripts/check-lock.js` (exit 1 = another agent holds `locked`) or read state.json — wait or coordinate, never edit the same file in parallel. Never remove a completed entry. If a previous run left state, resume from it instead of restarting.
````

---

## 5. drift-check

````
---
name: drift-check
description: Use to detect governance drift in this repo — compare declared artifacts in .governance/manifest.json against reality, check governance_version, and produce a health report. Triggers on "check governance drift", "governance health report", "is governance intact".
---

# Drift Check

1. Run: `node scripts/verify-governance.js --json`
2. Read `.governance/manifest.json`: `governance_version` + declared `artifacts`
3. Compute drift:
   - missing artifacts: declared in manifest but absent on disk (from validator results)
   - version drift: `governance_version` now vs last recorded in `.governance/validation.json`
4. Write `.governance/drift-report.json`:
   ```json
   {"timestamp":"<ISO>","governance_version":"<X>","missing":[],"versionDrift":false}
   ```
5. Propose minimal fixes only — no rebuild, no restructure, no migration. Governance-file changes require user confirmation (see Governance File Protection).
````

---

## 6. release-manager

````
---
name: release-manager
description: Use to cut a tagged release for this repo with a human-in-the-loop workflow. Analyzes the repository (git tags, version, git log/diff, API and user-visible changes), produces a Release Proposal (SemVer 2.0.0 classification), waits for explicit developer approval, then executes the release (annotated tag, push, GitHub Release) — never any write operation without approval. Triggers on "release", "publish version", "create release", "/release vX.Y.Z".
---

# Release Manager

Follow `references/workflows/release.md` (the single source of truth). Release lifecycle: Design → Implement → Validate → Release → Audit.

Core principle: AI analyzes and proposes; the developer authorizes; no release operation runs without explicit confirmation.

## release_requirements (all must pass)

- `git.require_clean_status`: `git status --porcelain` empty
- `tests.required`: test command exit 0
- `changelog.required`: CHANGELOG records the change
- `version.manifest_match_tag`: `package.json.version` == `CHANGELOG` top version == `manifest.governance_version` == tag `v<version>`
- `release.tag_required`: target tag does not exist yet (`git tag -l <tag>`)
- `release.proposal_approved`: a Release Proposal was generated and the developer explicitly approved it
- `validator.passed`: `node scripts/verify-governance.js` exit 0

Any failure → report ⚠️/❌ with the exact item; do NOT proceed.

## Phase 1 — Analyze

Inspect the repository: current tag/version, `git log` / `git diff` since the last release, file changes, API/interface changes, user-visible changes. Run the read-only analyzer:

`node scripts/release-manager.js plan --json '<{"current":"X.Y.Z","changes":[{"type":"...","description":"...","uncertain":false}]}>'`

It outputs the Release Proposal JSON (current / recommended / releaseType / reasons / releaseNotes / headSha) and NEVER writes. Exit code 2 → clarification required (see Uncertainty).

## Phase 2 — Version Decision (SemVer 2.0.0)

- **Major** only for real breaking changes (removed public API, breaking API change, removed config, CLI behavior breaking scripts, incompatible protocol/data format). Internal refactors, file moves, architecture changes never trigger Major.
- **Minor** only for backward-compatible, **user-perceivable** new capabilities (new user feature, public API, CLI command, config capability, or user-visible agent behavior). README/docs/tests/CI changes, refactors, perf/logging tweaks, and internal tooling/mechanism improvements (lock checks, content validation, template additions, flow ordering, internal flags) never trigger Minor.
- **Patch** for everything else (fixes, refactors, perf, docs, tests, config, dependency updates, internal tooling/mechanism improvements).
- NEVER decide by diff size, commit count, file count or added code volume.

## Phase 3 — Approval Gate

Show the developer:

```
Release Proposal

Current: vX.Y.Z
Recommended: vX.Y.Z
Reason: ...
Release Notes: ...

Proceed with release?
```

Wait for explicit confirmation. Write the approved proposal to `.governance/release-proposal.json` (git-ignored runtime output). Forbidden to proceed when: no confirmation, vague reply, unresolved breaking-change judgement, or the working tree changed.

## Phase 4 — Execute

Only after explicit approval:

1. Re-verify: `git status` clean AND `git rev-parse HEAD` equals the proposal `headSha`; any change → abort and re-run Analyze.
2. Sync versions: `package.json` → CHANGELOG (move `[Unreleased]` into `[X.Y.Z]`) → `.governance/manifest.json` (`governance_version` + `release` field).
3. Archive completed milestones (aggregated into `docs/plans/archive/vX.Y.Z.md`, one file per version) and completed `TASK_<name>.md` files (moved as individual files, original names). Keep the original entries, never delete. Unfinished milestones stay in `docs/plans/`.
4. Commit: `git add` (version sync + archive files only) → `git commit -m "release: vX.Y.Z - <summary>"`. Version changes and the archive MUST be in the same commit — the tag must point to a HEAD that contains them.
5. Run `node scripts/verify-governance.js`; exit code must be 0.
6. Refresh the proposal: update `headSha` to the new HEAD, write `.governance/release-proposal.json`.
7. `node scripts/release-manager.js execute --proposal .governance/release-proposal.json --yes` (creates the annotated tag; `--yes` is the recorded approval — without it the tool refuses all writes; it re-verifies clean tree + `headSha`).
8. `git push origin main` → `git push origin vX.Y.Z` — write operations, user confirmation required.
9. `gh release create vX.Y.Z --title "vX.Y.Z" --notes "<Release Notes>"`. gh missing/unauthenticated → ⚠️ Blocked with reason.
10. Set `manifest.release.validated` to `true`, re-run validator, record into `.governance/validation.json`.

## Uncertainty

If you cannot determine whether a change is breaking or a feature: mark it Potential Breaking Change / Potential Feature, request developer confirmation, pause the release. Never guess.

## 0.x versions

0.x.y still follows the rules above; breaking changes never auto-bump to 1.0.0 — only an explicit developer request may enter 1.0.0.

## Permissions

`plan` is read-only and may run automatically. Git tag, push, and `gh release create` are write operations — they run ONLY after an explicit developer approval (the approval covers this release's write sequence); state intent and wait for confirmation. Modifying `references/workflows/release.md` or manifest `release` fields follows the Governance File Protection flow.
````
