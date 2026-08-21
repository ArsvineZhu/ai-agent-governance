#!/usr/bin/env node
// INIT Scripted Generator — deterministic, snapshot-testable governance scaffolding.
// Usage:
//   node scripts/generate-governance.js --target <dir> --project-name <name> [--phase A] [--dry-run] [--json]
//   node scripts/generate-governance.js --target <dir> --file <input.json>
// Exit 0: success · Exit 1: error · Exit 2: usage error

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const SKILL_DIR = path.resolve(__dirname, "..");
const SPEC_PATH = path.join(SKILL_DIR, "references", "init-spec.json");

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

function writeIfAbsent(filepath, content, opts) {
  const dir = path.dirname(filepath);
  fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(filepath) && !opts.force) {
    return { path: filepath, action: "skipped" };
  }
  fs.writeFileSync(filepath, content, "utf8");
  return { path: filepath, action: "created" };
}

function resolvePlaceholders(content, placeholders, inputs) {
  let result = content;
  for (const [key, inputKey] of Object.entries(placeholders)) {
    const val = inputs[inputKey] || "";
    result = result.split("{{" + key + "}}").join(val);
  }
  return result;
}

function copyFile(source, target, opts) {
  const content = fs.readFileSync(source, "utf8");
  return writeIfAbsent(target, content, opts);
}

// --- Built-in generators for "generated" type artifacts ---

function generateManifest(inputs, spec) {
  const version = inputs.governance_version || "0.9.0";
  const phaseOrder = ["A", "B", "C"];
  const maxIdx = phaseOrder.indexOf(inputs.phase || "A");
  const artifacts = spec.artifacts
    .filter((a) => phaseOrder.indexOf(a.phase) <= maxIdx)
    .map((a) => ({
      name: path.basename(a.path),
      path: a.path,
      kind: a.path.endsWith("/") ? "dir" : "file",
      type: a.source && a.source.startsWith("scripts/") ? "script"
        : a.path.startsWith(".governance/") ? "state"
        : a.path.startsWith(".github/") ? "ci"
        : a.path.startsWith("docs/rules/") ? "policy"
        : "documentation",
    }));
  return JSON.stringify({
    schema_version: "1.0",
    governance_version: version,
    release: { version, tag: "v" + version, validated: false },
    doc_root: inputs.doc_root || "docs",
    artifacts,
  }, null, 2) + "\n";
}

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

// --- Main ---

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    usage();
    process.exit(0);
  }

  function argVal(name) {
    const i = args.indexOf(name);
    return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
  }

  const target = argVal("--target");
  const projectName = argVal("--project-name");
  const phase = (argVal("--phase") || "A").toUpperCase();
  const dryRun = args.includes("--dry-run");
  const json = args.includes("--json");
  const file = argVal("--file");

  if (!target) { console.error("error: --target is required"); process.exit(2); }
  if (!projectName && !file) { console.error("error: --project-name is required (or use --file)"); process.exit(2); }

  let inputs;
  if (file) {
    inputs = readJSON(file);
  } else {
    inputs = { project_name: projectName };
  }
  inputs.phase = phase;
  inputs.governance_version = inputs.governance_version || "0.9.0";
  inputs.description = inputs.description || "";
  inputs.test_cmd = inputs.test_cmd || "npm test";
  inputs.lint_cmd = inputs.lint_cmd || "npm run lint";
  inputs.build_cmd = inputs.build_cmd || "npm run build";
  inputs.governance_cmd = inputs.governance_cmd || "npm run governance-check";
  inputs.convention = inputs.convention || "Conventional Commits";
  inputs.doc_root = inputs.doc_root || "docs";

  const spec = readJSON(SPEC_PATH);
  const phaseOrder = ["A", "B", "C"];
  const maxPhaseIdx = phaseOrder.indexOf(phase);
  if (maxPhaseIdx < 0) { console.error("error: --phase must be A, B, or C"); process.exit(2); }

  const artifacts = spec.artifacts.filter((a) => {
    const aPhaseIdx = phaseOrder.indexOf(a.phase);
    return aPhaseIdx >= 0 && aPhaseIdx <= maxPhaseIdx;
  });

  const results = [];
  const targetAbs = path.resolve(target);

  for (const art of artifacts) {
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
          result = copyFile(sourcePath, targetPath, { force: false });
        }
        break;
      }
      case "template": {
        const sourcePath = path.join(SKILL_DIR, art.source);
        if (!fs.existsSync(sourcePath)) {
          result = { path: art.path, action: "error", error: "source not found: " + art.source };
        } else {
          let raw = fs.readFileSync(sourcePath, "utf8");
          // Extract content between first ``` and last ``` (template code blocks)
          const first = raw.indexOf("```");
          const last = raw.lastIndexOf("```");
          if (first >= 0 && last > first) {
            const inner = raw.slice(first + 3, last);
            // Strip optional language tag on first line
            const lines = inner.split("\n");
            if (lines[0] && lines[0].trim().match(/^[a-z]+$/)) lines.shift();
            raw = lines.join("\n");
          }
          const resolved = resolvePlaceholders(raw, art.placeholders || {}, inputs);
          result = writeIfAbsent(targetPath, resolved, { force: false });
        }
        break;
      }
      case "static": {
        let content = art.content || "";
        content = resolvePlaceholders(content, {
          "GOVERNANCE_VERSION": "governance_version",
          "ONE_SENTENCE_DESCRIPTION": "description",
        }, inputs);
        result = writeIfAbsent(targetPath, content, { force: false });
        break;
      }
      case "generated": {
        let content;
        if (art.generator === "manifest") {
          content = generateManifest(inputs, spec);
        } else if (art.generator === "state") {
          content = generateState(inputs);
        } else {
          result = { path: art.path, action: "skipped", note: "generator '" + art.generator + "' not yet implemented (phase B/C)" };
          results.push(result);
          continue;
        }
        result = writeIfAbsent(targetPath, content, { force: false });
        break;
      }
      default:
        result = { path: art.path, action: "error", error: "unknown type: " + art.type };
    }
    results.push(result);
  }

  if (json) {
    process.stdout.write(JSON.stringify({ target: targetAbs, phase, results }, null, 2) + "\n");
  } else {
    const created = results.filter((r) => r.action === "created").length;
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
