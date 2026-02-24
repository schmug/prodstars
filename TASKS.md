# ProdStars Implementation — Atomic Task Breakdown

This document breaks the [ProdStars Specification v1.0](./PRODSTARS-SPEC.md) into atomic, dependency-ordered tasks suitable for agent and subagent implementation. Each task is self-contained, testable, and produces a concrete deliverable.

---

## Legend

- **ID**: Unique task identifier (`P<phase>-T<task>`)
- **Depends**: Task IDs that must complete first
- **Tier**: `must-have` | `should-have` | `nice-to-have` (maps to spec §15)
- **Deliverable**: Concrete output the task produces

---

## Phase 0: Project Scaffolding

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P0-T01 | **Initialize Node.js project** — `npm init`, set `"type": "module"`, configure `tsconfig.json` with strict mode, set up `src/` directory structure. 🚧 **IN PROGRESS** (agent: claude/mark-task-in-progress-aL5tP) | — | must-have | `package.json`, `tsconfig.json`, `src/index.ts` |
| P0-T02 | **Set up build toolchain** — Configure TypeScript compilation, add `build` and `dev` scripts. No bundler needed (CLI tool). | P0-T01 | must-have | Working `npm run build` producing `dist/` |
| P0-T03 | **Set up test framework** — Install and configure Vitest (or Jest). Create `tests/` directory with a smoke test. | P0-T01 | must-have | `vitest.config.ts`, passing smoke test |
| P0-T04 | **Set up linting** — Configure ESLint + Prettier for TypeScript. | P0-T01 | must-have | `.eslintrc`, `.prettierrc`, passing lint |
| P0-T05 | **Create CLI entry point** — Set up `bin/pstar` executable entry, wire up `commander` (or `yargs`) for command routing. Register stub commands: `eval`, `init`, `validate`. | P0-T02 | must-have | `npx pstar --help` prints usage |
| P0-T06 | **Define core type definitions** — Create TypeScript interfaces/types for: `ProdStarsDocument`, `Domain`, `Check`, `EvalMethod`, `Operator`, `Severity`, `Rating`, `Override`, `CommunityWeights`. | P0-T01 | must-have | `src/types.ts` with all core types |

---

## Phase 1: File Parsing

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P1-T01 | **Parse YAML frontmatter from PRODSTARS.md** — Read a `PRODSTARS.md` file, split frontmatter (between `---` delimiters) from markdown body. Use `gray-matter` or `yaml` library. Return raw parsed YAML object + markdown string. | P0-T06 | must-have | `src/parser/frontmatter.ts`, unit tests |
| P1-T02 | **Validate top-level schema fields** — Validate `schema`, `product`, `version`, `updated` (required). Validate `maintainer`, `license`, `minimum_rating`, `tags` (optional). Return structured errors for missing/invalid fields. | P1-T01 | must-have | `src/parser/validate-schema.ts`, unit tests |
| P1-T03 | **Parse domain definitions** — Parse the `domains` array. Validate each domain has `id`, `name`, `checks`. Validate standard domain IDs (`environment`, `authentication`, `dependencies`, `configuration`, `data`, `operations`). Validate custom domain IDs match `x-<org>-<name>` pattern. | P1-T02 | must-have | `src/parser/parse-domains.ts`, unit tests |
| P1-T04 | **Parse check definitions** — Parse each check within a domain. Validate required fields: `id`, `name`, `severity`, `weight.developer`, `eval`, `pass_score`. Validate optional fields: `description`, `tags`, `fail_score`, `skip_score`, `remediation`, `cwe`, `references`. Validate check ID uniqueness across the file. | P1-T03 | must-have | `src/parser/parse-checks.ts`, unit tests |
| P1-T05 | **Parse eval method definitions** — Parse `eval.method`, `eval.target`, `eval.operator`, `eval.value`. Validate method is one of the known core/extended methods. Validate operator is a known operator or alias. Resolve operator aliases (`equals` → `eq`, `>=` → `gte`, etc.). | P1-T04 | must-have | `src/parser/parse-eval.ts`, unit tests |
| P1-T06 | **Build complete document model** — Combine all parsers into a single `parseDocument(filePath)` function that returns a fully typed `ProdStarsDocument` or a list of validation errors. | P1-T01, P1-T02, P1-T03, P1-T04, P1-T05 | must-have | `src/parser/index.ts`, integration test with example from spec §13 |
| P1-T07 | **Locate PRODSTARS.md automatically** — Implement file discovery: look for `PRODSTARS.md` in CWD, then walk up parent directories. Error if not found. | P1-T06 | must-have | `src/parser/locate.ts`, unit tests |

---

## Phase 2: Operators

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P2-T01 | **Implement equality operators** — `eq` / `neq` with alias resolution. String comparison. | P0-T06 | must-have | `src/operators/equality.ts`, unit tests |
| P2-T02 | **Implement numeric comparison operators** — `gt`, `gte`, `lt`, `lte` for numeric values. | P0-T06 | must-have | `src/operators/numeric.ts`, unit tests |
| P2-T03 | **Implement string operators** — `contains` / `not_contains` (with aliases `includes` / `excludes`). | P0-T06 | must-have | `src/operators/string.ts`, unit tests |
| P2-T04 | **Implement regex operators** — `matches` / `not_matches` (PCRE-compatible via JS RegExp). | P0-T06 | must-have | `src/operators/regex.ts`, unit tests |
| P2-T05 | **Implement existence operators** — `exists` / `not_exists`. | P0-T06 | must-have | `src/operators/existence.ts`, unit tests |
| P2-T06 | **Build operator registry** — Central `evaluate(actual, operator, expected)` function that dispatches to the correct operator implementation. Resolve all aliases. | P2-T01, P2-T02, P2-T03, P2-T04, P2-T05 | must-have | `src/operators/index.ts`, unit tests covering all aliases |

---

## Phase 3: Core Eval Methods

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P3-T01 | **Implement `env_var` eval method** — Read an environment variable by name, apply operator against expected value. Respect `exists`/`not_exists` operators. Never log the variable value (security). | P2-T06 | must-have | `src/eval/env-var.ts`, unit tests |
| P3-T02 | **Implement `command` eval method** — Execute a shell command, capture stdout and exit code. Apply operator to stdout (string comparison) or exit code (numeric). Enforce per-check timeout (default 30s). | P2-T06 | must-have | `src/eval/command.ts`, unit tests |
| P3-T03 | **Implement `file_exists` eval method** — Check if a file or directory exists at the given path (relative to project root). | P2-T06 | must-have | `src/eval/file-exists.ts`, unit tests |
| P3-T04 | **Implement `file_contains` eval method** — Read a file's contents and apply `contains`/`not_contains`/`matches`/`not_matches` operator against the value. | P2-T06 | must-have | `src/eval/file-contains.ts`, unit tests |
| P3-T05 | **Implement `port_open` eval method** — Attempt a TCP connection to `host:port`. Apply operator (`eq`/`neq`) against `true`/`false`. Timeout after configurable seconds. | P2-T06 | must-have | `src/eval/port-open.ts`, unit tests |
| P3-T06 | **Implement `http_status` eval method** — Make an HTTP(S) GET request to a URL. Compare the response status code using the operator. Handle timeouts and connection errors gracefully. | P2-T06 | must-have | `src/eval/http-status.ts`, unit tests |
| P3-T07 | **Implement `semver` eval method** — Execute command or read env var to get a version string. Parse it as semver. Apply semver-aware comparison (`gte`, `lte`, `eq`). Handle `v` prefix stripping. | P2-T06 | must-have | `src/eval/semver.ts`, unit tests |
| P3-T08 | **Implement `manual` eval method** — Prompt the user for pass/fail/skip input. In `--no-prompt` mode, default to skip. In `--skip-manual` mode, skip without prompting. | P2-T06 | must-have | `src/eval/manual.ts`, unit tests |
| P3-T09 | **Implement `custom` eval method** — Execute a user-provided script. Check it's executable. Map exit codes: 0=pass, 1=fail, 2=skip. Capture stdout on failure as details. Enforce timeout. | P2-T06 | must-have | `src/eval/custom.ts`, unit tests |
| P3-T10 | **Build eval method registry** — Central `runEval(check, options)` function that dispatches to the correct eval method. Return `{ passed: boolean, skipped: boolean, details: string }`. | P3-T01 through P3-T09 | must-have | `src/eval/index.ts`, unit tests |

---

## Phase 4: Scoring Engine

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P4-T01 | **Implement weight resolution** — Given a check, resolve its weight: `deployer_override ?? community_weight ?? developer_weight`. Accept optional override and community maps. | P0-T06 | must-have | `src/scoring/weight-resolution.ts`, unit tests |
| P4-T02 | **Implement severity multipliers** — Map severity strings to multipliers: critical=3.0, high=2.0, medium=1.0, low=0.5, info=0.0. | P0-T06 | must-have | `src/scoring/severity.ts`, unit tests |
| P4-T03 | **Implement per-check score calculation** — Compute `max_points` and `earned_points` per check using: `score × resolved_weight × severity_multiplier × domain_weight`. Exclude skipped and info checks. | P4-T01, P4-T02 | must-have | `src/scoring/check-score.ts`, unit tests |
| P4-T04 | **Implement total score aggregation** — Sum all `max_points` and `earned_points`. Calculate percentage. Compute star rating: `round(percentage × 5.0, 1)`. | P4-T03 | must-have | `src/scoring/aggregate.ts`, unit tests |
| P4-T05 | **Implement critical check cap** — If any check with `severity: critical` failed, cap the star rating at 1.5 max. Track the uncapped rating separately. | P4-T04 | must-have | `src/scoring/critical-cap.ts`, unit tests |
| P4-T06 | **Implement domain-level ratings** — Calculate independent star rating per domain using the same formula, scoped to checks within that domain. | P4-T04 | must-have | `src/scoring/domain-ratings.ts`, unit tests |
| P4-T07 | **Implement risk ranking** — Compute `risk_impact` for each failing check: `(pass_score - fail_score) × resolved_weight × severity_multiplier × domain_weight`. Sort descending. Return top 5. | P4-T03 | must-have | `src/scoring/risk-ranking.ts`, unit tests |
| P4-T08 | **Implement star label mapping** — Map star rating ranges to labels: 4.5-5.0=Exceptional, 4.0-4.4=Strong, etc. per spec §4.4. | P0-T06 | must-have | `src/scoring/labels.ts`, unit tests |
| P4-T09 | **Implement gate check** — Compare computed rating against `minimum_rating`. Return `{ passed: boolean, minimum: number, actual: number }`. | P4-T05 | must-have | `src/scoring/gate.ts`, unit tests |
| P4-T10 | **Build scoring orchestrator** — Combine all scoring functions. Accept a `ProdStarsDocument` + check results + overrides + community weights. Return a complete `ScoringResult` object. | P4-T01 through P4-T09 | must-have | `src/scoring/index.ts`, integration tests |

---

## Phase 5: Overrides & Community Weights

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P5-T01 | **Parse deployer overrides file** — Read and validate `.prodstars/overrides.yaml`. Parse `schema`, `minimum_rating`, `check_overrides`, `domain_overrides`. | P1-T01 | must-have | `src/overrides/parse-overrides.ts`, unit tests |
| P5-T02 | **Apply check-level overrides** — For each check override: apply weight override, skip flag (with reason), severity escalation/de-escalation. | P5-T01 | must-have | `src/overrides/apply-check-overrides.ts`, unit tests |
| P5-T03 | **Apply domain-level overrides** — For each domain override: apply domain weight multiplier. | P5-T01 | must-have | `src/overrides/apply-domain-overrides.ts`, unit tests |
| P5-T04 | **Parse community weights file** — Read `.prodstars/community.yaml`. Validate schema, extract weight map. | P1-T01 | should-have | `src/community/parse-community.ts`, unit tests |
| P5-T05 | **Integrate community weights into weight resolution** — Feed parsed community weights into the weight resolution chain. | P5-T04, P4-T01 | should-have | Updated `src/scoring/weight-resolution.ts`, unit tests |

---

## Phase 6: Output Formatters

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P6-T01 | **Implement star visual renderer** — Render star rating as visual string: full stars (⭐), half stars (✦), empty stars (☆). Support both half-star and rounded modes. | P4-T08 | must-have | `src/output/stars.ts`, unit tests |
| P6-T02 | **Implement terminal output formatter** — Render the full terminal box layout per spec §5.1. Include: header, product info, check summary, star rating, cap warning, top risks with remediation, domain breakdown, gate status. Print to stderr. | P6-T01, P4-T10 | must-have | `src/output/terminal.ts`, snapshot tests |
| P6-T03 | **Implement JSON output formatter** — Produce the JSON structure per spec §5.2. Include all fields: schema, product, version, evaluated_at, rating, summary, domains, top_risks, checks, gate. Redact secrets in details fields. Output to stdout. | P4-T10 | must-have | `src/output/json.ts`, unit tests |
| P6-T04 | **Implement secret redaction** — Scan check `details` strings for potential secret values. Replace env var values with `'***'`. Never expose raw secret values in any output. | P0-T06 | must-have | `src/output/redact.ts`, unit tests |
| P6-T05 | **Implement Markdown report formatter** — Render a Markdown document with star visuals, tables for domain breakdown, and top risks section. Suitable for PR comments. | P6-T01, P4-T10 | should-have | `src/output/markdown.ts`, snapshot tests |
| P6-T06 | **Implement SARIF output formatter** — Produce a SARIF v2.1.0 document. Map each failing check to a SARIF `result` with rule ID, severity, message, and remediation. | P4-T10 | should-have | `src/output/sarif.ts`, unit tests against SARIF schema |
| P6-T07 | **Implement badge output** — Generate shields.io badge URL with correct color mapping: 4.0-5.0=brightgreen, 3.0-3.9=yellow, 2.0-2.9=orange, 0.0-1.9=red. Optionally generate SVG directly. | P4-T10 | should-have | `src/output/badge.ts`, unit tests |

---

## Phase 7: CLI Commands

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P7-T01 | **Implement `pstar validate` command** — Parse `PRODSTARS.md`, report all validation errors, exit with code 0 (valid) or 2 (errors). | P1-T06, P1-T07, P0-T05 | must-have | `src/commands/validate.ts`, integration tests |
| P7-T02 | **Implement `pstar eval` command — core flow** — Wire up: locate file → parse → run eval methods → score → format output. Support `--format`, `--fail-under`, `--skip-manual`, `--no-prompt`, `--timeout`. Exit code per spec §7.4. | P1-T06, P3-T10, P4-T10, P6-T02, P6-T03, P5-T01 | must-have | `src/commands/eval.ts`, integration tests |
| P7-T03 | **Implement `pstar eval` — override and community flags** — Support `--override <path>` and `--community <path|url>` flags. Load and apply overrides. | P7-T02, P5-T02, P5-T03 | must-have | Updated `src/commands/eval.ts`, integration tests |
| P7-T04 | **Implement `pstar eval` — domain filtering** — Support `--domain <id>` flag (repeatable). Evaluate only checks in specified domains. | P7-T02 | must-have | Updated `src/commands/eval.ts`, unit tests |
| P7-T05 | **Implement `pstar eval` — parallel execution** — Support `--parallel <n>` flag. Run up to N check evaluations concurrently. Default: 4. | P7-T02 | should-have | Updated `src/commands/eval.ts`, unit tests |
| P7-T06 | **Implement `pstar eval` — verbose and quiet modes** — `--verbose` shows passing checks too. `--quiet` suppresses terminal output, exit code only. | P7-T02 | must-have | Updated `src/commands/eval.ts`, unit tests |
| P7-T07 | **Implement `pstar init` — interactive scaffolding** — Prompt user for product name, version, maintainer. Generate a minimal `PRODSTARS.md` with the standard 6 domains and example checks. | P0-T05 | must-have | `src/commands/init.ts`, integration tests |
| P7-T08 | **Implement `pstar init --detect`** — Scan project directory for stack indicators (`package.json`, `requirements.txt`, `Dockerfile`, `docker-compose.yml`, `.env.example`, `go.mod`, `Cargo.toml`, `Gemfile`). Generate relevant checks. | P7-T07 | should-have | Updated `src/commands/init.ts`, unit tests |
| P7-T09 | **Implement `pstar init --template <name>`** — Support predefined templates: `node`, `python`, `docker`, `k8s`, `static`. Each template includes relevant domain checks. | P7-T07 | should-have | `src/templates/`, unit tests |
| P7-T10 | **Implement `pstar init --from <url>`** — Clone another project's `PRODSTARS.md` as a starting point. Fetch remote file, adapt product metadata. | P7-T07 | should-have | Updated `src/commands/init.ts`, unit tests |
| P7-T11 | **Implement `pstar report` command** — Generate a report without blocking (no gate enforcement). Support all `--format` options. | P7-T02 | should-have | `src/commands/report.ts`, integration tests |
| P7-T12 | **Implement `pstar add-check` command** — Interactive wizard to define a new check: pick domain, enter ID/name/severity, pick eval method, define target/operator/value, set weight, add remediation. Append to `PRODSTARS.md` frontmatter. | P1-T06, P0-T05 | should-have | `src/commands/add-check.ts`, integration tests |
| P7-T13 | **Implement `pstar badge` command** — Generate badge SVG or shields.io URL. Support `--output <file>` for SVG. | P6-T07 | should-have | `src/commands/badge.ts`, unit tests |
| P7-T14 | **Implement `pstar community fetch`** — Fetch community weights from a URL. Save to `.prodstars/community.yaml`. Warn if data is >90 days old. | P5-T04 | should-have | `src/commands/community.ts`, unit tests |
| P7-T15 | **Implement `pstar community submit`** — Submit local weight feedback to the community registry endpoint. | P5-T04 | should-have | Updated `src/commands/community.ts`, unit tests |

---

## Phase 8: Composition

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P8-T01 | **Parse `compose` section in frontmatter** — Parse `compose` entries with `source`, `prefix`, `weight`, `domains` fields. Validate structure. | P1-T06 | should-have | `src/compose/parse-compose.ts`, unit tests |
| P8-T02 | **Resolve local compose sources** — Load `PRODSTARS.md` from local file paths (e.g., `node_modules/pkg/PRODSTARS.md`). Parse and extract checks. | P8-T01, P1-T06 | should-have | `src/compose/resolve-local.ts`, unit tests |
| P8-T03 | **Resolve remote compose sources** — Fetch `PRODSTARS.md` from URLs. Require pinned commit/tag/hash. Require explicit user consent for remote execution. | P8-T01, P1-T06 | should-have | `src/compose/resolve-remote.ts`, unit tests |
| P8-T04 | **Apply prefix and weight to inherited checks** — Prefix inherited check IDs (e.g., `dep-somedb-auth-001`). Scale all inherited weights by the compose entry's `weight` factor. | P8-T02, P8-T03 | should-have | `src/compose/merge-checks.ts`, unit tests |
| P8-T05 | **Detect circular dependencies** — Build a dependency graph from compose sources. Detect and report cycles. Return validation error. | P8-T02, P8-T03 | should-have | `src/compose/cycle-detection.ts`, unit tests |
| P8-T06 | **Filter composed domains** — When `compose.domains` is specified, only inherit checks from those domains. | P8-T04 | should-have | Updated `src/compose/merge-checks.ts`, unit tests |

---

## Phase 9: Security Hardening

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P9-T01 | **Implement command execution sandboxing** — Run `command` and `custom` evals with minimum privileges. Enforce timeout. Log all commands executed. Never execute remote-sourced scripts without consent. | P3-T02, P3-T09 | must-have | `src/security/sandbox.ts`, unit tests |
| P9-T02 | **Implement secret redaction across all outputs** — Ensure no env var values leak into JSON `details`, terminal output, or any other format. Scan for common secret patterns. | P6-T04 | must-have | Updated `src/output/redact.ts`, integration tests |
| P9-T03 | **Implement community file verification** — Verify checksum/signature on community weight files fetched from remote URLs. | P5-T04 | should-have | `src/security/verify-community.ts`, unit tests |
| P9-T04 | **Implement remote compose pinning enforcement** — Validate that remote compose sources are pinned to a specific commit, tag, or content hash. Reject unpinned URLs. | P8-T03 | should-have | `src/security/verify-compose-pin.ts`, unit tests |

---

## Phase 10: Extended Eval Methods (Nice-to-Have)

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P10-T01 | **Implement `api_call` eval method** — Make HTTP request to API endpoint. Evaluate JSON response using JSONPath expression. | P2-T06 | nice-to-have | `src/eval/api-call.ts`, unit tests |
| P10-T02 | **Implement `dns_resolve` eval method** — Resolve DNS record. Compare against expected value. | P2-T06 | nice-to-have | `src/eval/dns-resolve.ts`, unit tests |
| P10-T03 | **Implement `cert_expiry` eval method** — Connect to TLS endpoint. Check certificate expiry is ≥ N days from now. | P2-T06 | nice-to-have | `src/eval/cert-expiry.ts`, unit tests |
| P10-T04 | **Implement `container_image` eval method** — Verify container image digest, signature, or base image. | P2-T06 | nice-to-have | `src/eval/container-image.ts`, unit tests |
| P10-T05 | **Implement `registry_check` eval method** — Query npm/PyPI/etc. for vulnerability advisories on a package. | P2-T06 | nice-to-have | `src/eval/registry-check.ts`, unit tests |

---

## Phase 11: Agent & MCP Integration

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P11-T01 | **Implement MCP server — `pstar_eval` tool** — Expose `pstar eval --format json` as an MCP tool. Return structured JSON result. | P7-T02 | should-have | `src/mcp/server.ts`, `src/mcp/eval-tool.ts` |
| P11-T02 | **Implement MCP server — `pstar_check` tool** — Run a single check by ID. Return its status and details. | P3-T10, P11-T01 | should-have | `src/mcp/check-tool.ts`, unit tests |
| P11-T03 | **Implement MCP server — `pstar_remediate` tool** — Return remediation steps for a specific failing check ID. | P11-T01 | should-have | `src/mcp/remediate-tool.ts`, unit tests |
| P11-T04 | **Implement MCP server — `pstar_init` tool** — Scaffold a `PRODSTARS.md` for the current project via MCP. | P7-T07, P11-T01 | should-have | `src/mcp/init-tool.ts`, unit tests |
| P11-T05 | **Create agent prompt fragment** — Write the recommended system prompt fragment (spec §9.2) as a distributable text file. | — | should-have | `src/agent/prompt-fragment.txt` |

---

## Phase 12: Plugins & Webhooks

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P12-T01 | **Implement plugin discovery** — Scan `node_modules`, `.prodstars/plugins/` for ProdStars plugins. Plugins export `evaluate(target, operator, value, options) → { passed, details }`. | P3-T10 | should-have | `src/plugins/discover.ts`, unit tests |
| P12-T02 | **Implement plugin execution** — Load discovered plugins. Register custom eval methods. Route checks with custom methods to the plugin. | P12-T01 | should-have | `src/plugins/execute.ts`, unit tests |
| P12-T03 | **Implement webhook support** — Parse `webhooks` config from frontmatter or overrides. POST evaluation results to configured URLs on `eval_complete` / `gate_failed` events. Support auth via env var reference. | P7-T02 | should-have | `src/webhooks/send.ts`, unit tests |

---

## Phase 13: CI/CD & Distribution

| ID | Task | Depends | Tier | Deliverable |
|---|---|---|---|---|
| P13-T01 | **Create npm package configuration** — Configure `package.json` for publishing: `bin` entry, `files` whitelist, `engines`, `keywords`, `repository`. | P0-T05 | must-have | Updated `package.json` |
| P13-T02 | **Create GitHub Actions workflow for CI** — Lint, test, build on push/PR. | P0-T03, P0-T04 | must-have | `.github/workflows/ci.yml` |
| P13-T03 | **Create GitHub Actions example for consumers** — Provide copy-paste workflow examples per spec §7.5: eval+SARIF upload, badge PR comment, pre-commit hook config. | P7-T02 | should-have | `examples/github-actions/` |
| P13-T04 | **Create Docker entrypoint example** — Provide example Dockerfile snippet per spec §7.5. | P7-T02 | should-have | `examples/docker/` |
| P13-T05 | **Write README** — Document installation, quick start, CLI usage, configuration, and linking to the spec. | P7-T02 | must-have | Updated `README.md` |

---

## Dependency Graph (Simplified)

```
P0 (Scaffolding)
 ├── P1 (Parsing) ──────────────────────────────┐
 ├── P2 (Operators) ────────────────────────────┤
 │    └── P3 (Eval Methods) ────────────────────┤
 │         └── P10 (Extended Eval Methods)      │
 ├── P0-T06 (Types) ────────────────────────────┤
 │    └── P4 (Scoring Engine) ──────────────────┤
 │         ├── P6 (Output Formatters) ──────────┤
 │         │    └── P7 (CLI Commands) ──────────┤
 │         │         ├── P11 (MCP Integration)  │
 │         │         └── P13 (CI/CD)            │
 │         └── P5 (Overrides) ──────────────────┘
 ├── P8 (Composition) ── depends on P1
 ├── P9 (Security) ── cross-cutting, depends on P3, P5, P6, P8
 └── P12 (Plugins & Webhooks) ── depends on P3, P7
```

---

## Task Count Summary

| Phase | Must-Have | Should-Have | Nice-to-Have | Total |
|---|---|---|---|---|
| P0: Scaffolding | 6 | 0 | 0 | 6 |
| P1: Parsing | 7 | 0 | 0 | 7 |
| P2: Operators | 6 | 0 | 0 | 6 |
| P3: Eval Methods | 10 | 0 | 0 | 10 |
| P4: Scoring Engine | 10 | 0 | 0 | 10 |
| P5: Overrides | 3 | 2 | 0 | 5 |
| P6: Output Formatters | 4 | 3 | 0 | 7 |
| P7: CLI Commands | 7 | 8 | 0 | 15 |
| P8: Composition | 0 | 6 | 0 | 6 |
| P9: Security | 2 | 2 | 0 | 4 |
| P10: Extended Eval | 0 | 0 | 5 | 5 |
| P11: MCP Integration | 0 | 5 | 0 | 5 |
| P12: Plugins & Webhooks | 0 | 3 | 0 | 3 |
| P13: CI/CD & Distribution | 2 | 2 | 0 | 4* |
| **Total** | **57** | **31** | **5** | **93** |

\* P13-T05 (README) is must-have.

---

## Recommended Implementation Order

**Critical path (must-have, in order):**

1. P0-T01 → P0-T06 → P0-T02 → P0-T03 → P0-T04 → P0-T05
2. P1-T01 → P1-T02 → P1-T03 → P1-T04 → P1-T05 → P1-T06 → P1-T07
3. P2-T01 through P2-T05 (parallel) → P2-T06
4. P3-T01 through P3-T09 (parallel after P2-T06) → P3-T10
5. P4-T01 + P4-T02 + P4-T08 (parallel) → P4-T03 → P4-T04 → P4-T05 + P4-T06 + P4-T07 (parallel) → P4-T09 → P4-T10
6. P5-T01 → P5-T02 + P5-T03 (parallel)
7. P6-T04 → P6-T01 → P6-T02 + P6-T03 (parallel)
8. P7-T01, P7-T07 (parallel) → P7-T02 → P7-T03 + P7-T04 + P7-T06 (parallel)
9. P9-T01 + P9-T02
10. P13-T01 + P13-T02 + P13-T05

**After must-haves**: P5-T04/T05, P6-T05/T06/T07, P7-T05/T08-T15, P8, P9-T03/T04, P11, P12, P13-T03/T04

**Last**: P10 (extended eval methods)
