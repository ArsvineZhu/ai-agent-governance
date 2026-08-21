#!/usr/bin/env node
// INIT Scripted Generator — deterministic, snapshot-testable governance scaffolding.
// Usage:
//   node scripts/generate-governance.js --target <dir> --project-name <name> [--phase A|B|C] [--dry-run] [--json]
//   node scripts/generate-governance.js --target <dir> --file <input.json>
// Exit 0: success · Exit 1: error · Exit 2: usage error
//
// Determinism contract (per plan init-scripted-generator.md):
//   - Same inputs -> byte-identical outputs (no timestamps, no randomness)
//   - Existing files are SKIPPED, never overwritten (merge-not-overwrite is Phase C)
//   - The single source of truth for the artifact list is references/init-spec.json

const fs = require("fs");
const path = require("path");

const SKILL_DIR = path.resolve(__dirname, "..");
const SPEC_PATH = path.join(SKILL_DIR, "references", "init-spec.json");
const PHASE_ORDER = ["A", "B", "C"];
const LANG_TAGS = /^(json|bash|sh|yaml|yml|md|markdown|txt|javascript|js|typescript|ts|python|py|rust|go|java|cpp|c|toml|ini)$/;

function usage() {
  console.log(`Usage:
  generate-governance.js --target <dir> --project-name <name> [--phase A|B|C] [--dry-run] [--json]
  generate-governance.js --target <dir> --file <input.json>

Options:
  --target <dir>        Target project root (must exist or be created)
  --project-name <name> Project name for AGENTS.md heading
  --phase <A|B|C>       Phases to generate (default: A)
  --dry-run             List files that would be created, write nothing
  --json                Output file list as JSON
  --file <path>         Read inputs from JSON file
  --help                Show this help`);
}

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function argValue(args, name) {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
}

function writeIfAbsent(filepath, content) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  if (fs.existsSync(filepath)) {
    return { path: filepath, action: "skipped" };
  }
  fs.writeFileSync(filepath, content, "utf8");
  return { path: filepath, action: "created" };
}

function ensureDir(dirpath) {
  fs.mkdirSync(dirpath, { recursive: true });
  const keep = path.join(dirpath, ".gitkeep");
  const others = fs.readdirSync(dirpath).filter((f) => f !== ".gitkeep");
  if (!fs.existsSync(keep) && others.length === 0) {
    fs.writeFileSync(keep, "", "utf8");
  }
  return { path: dirpath, action: "created-dir" };
}

function resolvePlaceholders(content, placeholders, inputs) {
  let result = content;
  for (const [key, inputKey] of Object.entries(placeholders || {})) {
    const val = inputs[inputKey] || "";
    result = result.split("{{" + key + "}}").join(val);
  }
  return result;
}

// Extract the code block from a markdown template: content between the first and
// last ``` fences, with the optional language tag stripped (known tags only).
function extractCodeBlock(raw) {
  const first = raw.indexOf("```");
  const last = raw.lastIndexOf("```");
  if (first < 0 || last <= first) return raw;
  let inner = raw.slice(first + 3, last);
  const lines = inner.split("\n");
  if (lines[0] && LANG_TAGS.test(lines[0].trim())) lines.shift();
  return lines.join("\n");
}

function artifactType(artPath) {
  if (artPath === "AGENTS.md") return "policy";
  if (artPath.startsWith("docs/rules/")) return "policy";
  if (artPath === ".gitignore" || artPath === ".env.example" || artPath === ".gitmessage.txt") return "policy";
  if (artPath === ".governance" || artPath.startsWith(".governance/")) return "state";
  if (artPath.startsWith("scripts/")) return "script";
  if (artPath.startsWith(".github/")) return "ci";
  return "documentation";
}

// --- Built-in generators ---

const GITIGNORE_CONTENT = [
  "# Dependencies",
  "node_modules/",
  ".pnpm-store/",
  "",
  "# Environment & secrets (never commit real values)",
  ".env",
  ".env.*",
  "!.env.example",
  "*.key",
  "*.pem",
  "",
  "# Build output",
  "dist/",
  "build/",
  "coverage/",
  "",
  "# Governance runtime outputs (git-tracked: manifest/state/preflight/git-policy/sync-rules/generated)",
  ".governance/validation.json",
  ".governance/drift-report.json",
  ".governance/release-proposal.json",
  "",
  "# OS / editor",
  ".DS_Store",
  "Thumbs.db",
  ".idea/",
  ".vscode/",
  "",
].join("\n");

const PREFLIGHT_CONTENT = JSON.stringify({
  created_at: "",
  git_status_summary: "",
  existing_files: [],
  note: "Fill after Phase 0 inspection (rollback basis). Empty fields = not yet recorded.",
}, null, 2) + "\n";

function generateState(inputs) {
  return JSON.stringify({
    maturity: inputs.maturity || "LEVEL_0_EMPTY",
    phase: "completed",
    agent_id: "",
    task_id: "",
    task_start_sha: "",
    locked: null,
    completed: ["docs", "agents", "rules"],
    blocked: [],
  }, null, 2) + "\n";
}

function generateManifest(inputs, spec, entries) {
  const version = inputs.governance_version || "0.9.0";
  const manifest = {
    schema_version: "1.0",
    governance_version: version,
    doc_root: inputs.doc_root || "docs",
    artifacts: entries,
  };
  if (inputs.release_version) {
    manifest.release = {
      version: inputs.release_version,
      tag: "v" + inputs.release_version,
      validated: inputs.release_validated === true,
    };
  }
  return JSON.stringify(manifest, null, 2) + "\n";
}

// --- Main ---

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    usage();
    process.exit(0);
  }

  const target = argValue(args, "--target");
  const projectName = argValue(args, "--project-name");
  const phase = (argValue(args, "--phase") || "A").toUpperCase();
  const dryRun = args.includes("--dry-run");
  const json = args.includes("--json");
  const file = argValue(args, "--file");

  if (!target) { console.error("error: --target is required"); process.exit(2); }
  if (!projectName && !file) { console.error("error: --project-name is required (or use --file)"); process.exit(2); }

  const inputs = file ? readJSON(file) : { project_name: projectName };
  inputs.phase = phase;
  inputs.governance_version = inputs.governance_version || "0.9.0";
  inputs.description = inputs.description || "";
  inputs.project_name = inputs.project_name || projectName || "";
  inputs.test_cmd = inputs.test_cmd || "npm test";
  inputs.lint_cmd = inputs.lint_cmd || "npm run lint";
  inputs.build_cmd = inputs.build_cmd || "npm run build";
  inputs.governance_cmd = inputs.governance_cmd || "npm run governance-check";
  inputs.convention = inputs.convention || "Conventional Commits";
  inputs.doc_root = inputs.doc_root || "docs";

  const spec = readJSON(SPEC_PATH);
  const maxPhaseIdx = PHASE_ORDER.indexOf(phase);
  if (maxPhaseIdx < 0) { console.error("error: --phase must be A, B, or C"); process.exit(2); }

  const artifacts = spec.artifacts.filter((a) => {
    const idx = PHASE_ORDER.indexOf(a.phase);
    return idx >= 0 && idx <= maxPhaseIdx;
  });

  const targetAbs = path.resolve(target);
  const results = [];
  const commonPlaceholders = {
    "GOVERNANCE_VERSION": "governance_version",
    "ONE_SENTENCE_DESCRIPTION": "description",
    "PROJECT_NAME": "project_name",
  };

  for (const art of artifacts) {
    if (art.generator === "manifest") continue; // generated last, from actually-created artifacts
    const targetPath = path.join(targetAbs, art.path);
    if (dryRun) {
      results.push({ path: art.path, action: "would-create", type: art.type });
      continue;
    }
    let result;
    switch (art.type) {
      case "copy": {
        const sourcePath = path.join(SKILL_DIR, art.source);
        if (!fs.existsSync(sourcePath)) {
          result = { path: art.path, action: "error", error: "source not found: " + art.source };
        } else {
          result = writeIfAbsent(targetPath, fs.readFileSync(sourcePath, "utf8"));
        }
        break;
      }
      case "template": {
        const sourcePath = path.join(SKILL_DIR, art.source);
        if (!fs.existsSync(sourcePath)) {
          result = { path: art.path, action: "error", error: "source not found: " + art.source };
        } else {
          const raw = fs.readFileSync(sourcePath, "utf8");
          const body = extractCodeBlock(raw);
          result = writeIfAbsent(targetPath, resolvePlaceholders(body, art.placeholders, inputs));
        }
        break;
      }
      case "static": {
        const content = resolvePlaceholders(art.content || "", commonPlaceholders, inputs);
        result = writeIfAbsent(targetPath, content);
        break;
      }
      case "dir": {
        result = ensureDir(targetPath);
        break;
      }
      case "generated": {
        let content;
        if (art.generator === "state") content = generateState(inputs);
        else if (art.generator === "gitignore") content = GITIGNORE_CONTENT;
        else if (art.generator === "preflight") content = PREFLIGHT_CONTENT;
        else {
          result = { path: art.path, action: "skipped", note: "generator '" + art.generator + "' not yet implemented (phase C)" };
          results.push(result);
          continue;
        }
        result = writeIfAbsent(targetPath, content);
        break;
      }
      default:
        result = { path: art.path, action: "error", error: "unknown type: " + art.type };
    }
    results.push(result);
  }

  // Manifest is generated LAST, listing only artifacts that actually exist on disk
  // (skipped-because-exists counts as exists; error/stub do not).
  const manifestSpec = spec.artifacts.find((a) => a.generator === "manifest");
  if (manifestSpec) {
    const manifestIdx = PHASE_ORDER.indexOf(manifestSpec.phase);
    if (manifestIdx >= 0 && manifestIdx <= maxPhaseIdx) {
      const targetPath = path.join(targetAbs, manifestSpec.path);
      const entries = spec.artifacts
        .filter((a) => {
          const idx = PHASE_ORDER.indexOf(a.phase);
          return idx >= 0 && idx <= maxPhaseIdx && a !== manifestSpec;
        })
        .map((a) => {
          const isDir = a.path.endsWith("/");
          const p = isDir ? a.path.slice(0, -1) : a.path;
          return {
            name: a.name || path.basename(p),
            path: p,
            kind: isDir ? "dir" : "file",
            type: artifactType(p),
          };
        })
        .filter((e) => {
          if (dryRun) return true;
          const p = path.join(targetAbs, e.path);
          return fs.existsSync(p);
        });
      if (dryRun) {
        results.push({ path: manifestSpec.path, action: "would-create", type: "generated" });
      } else {
        results.push(writeIfAbsent(targetPath, generateManifest(inputs, spec, entries)));
      }
    }
  }

  if (json) {
    process.stdout.write(JSON.stringify({ target: targetAbs, phase, results }, null, 2) + "\n");
  } else {
    const created = results.filter((r) => r.action === "created" || r.action === "created-dir").length;
    const skipped = results.filter((r) => r.action === "skipped").length;
    const errors = results.filter((r) => r.action === "error").length;
    if (dryRun) {
      console.log("dry-run: " + results.length + " files would be created in " + targetAbs);
    } else {
      console.log("generated " + created + " files, " + skipped + " skipped, " + errors + " errors in " + targetAbs);
    }
    if (errors > 0) {
      results.filter((r) => r.action === "error").forEach((r) => console.error("  error: " + r.path + " — " + r.error));
    }
  }

  process.exit(results.some((r) => r.action === "error") ? 1 : 0);
}

main();
