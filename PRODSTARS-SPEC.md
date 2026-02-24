# ProdStars Specification v1.0

**An Open Standard for Deployment Readiness Ratings**

> ProdStars is a machine-readable, human-friendly scorecard that product developers embed in their projects to surface deployment risks before execution. Agents, CI pipelines, and humans consume the same file to produce a star rating of operational readiness.

```
⭐⭐⭐⭐☆  4.2 / 5.0   my-project v2.1.0
```

---

## 1. Overview

### 1.1 Problem Statement

Software products ship with implicit assumptions about the environments they run in. Default credentials, unpatched runtimes, missing encryption, exposed ports, and misconfigured dependencies are discovered *after* deployment — often during an incident. No universal, developer-authored standard exists for communicating deployment expectations and rating readiness before execution.

### 1.2 Design Principles

1. **Developer-authored.** The people who build the product define the checks. They know the threat model.
2. **Community-weighted.** Real-world deployment experience adjusts severity through consensus scoring.
3. **Deployer-overridable.** Organizations apply their own risk appetite as a final layer.
4. **Agent-native.** The format is optimized for AI agents (Claude Code, Codex, Copilot, etc.) to parse and execute during build or deploy workflows.
5. **Human-readable.** The same file is scannable by a sysadmin, a CISO, or a teacher running a server for the first time.
6. **Zero-dependency evaluation.** The scoring algorithm is simple enough to implement in any language with no external libraries. A reference implementation fits in a single file.
7. **Composable.** Projects that depend on other projects inherit and merge their ProdStars files.

### 1.3 Goals

- Surface the top risks *before* deployment, not after an incident.
- Produce a star rating (0.0–5.0) for any deployment target.
- Be adoptable by a solo developer in under 30 minutes.
- Be implementable by an AI coding agent from this spec alone.

---

## 2. File Structure

### 2.1 File Location and Naming

The ProdStars file MUST be placed at the project root:

```
my-project/
├── PRODSTARS.md
├── README.md
├── src/
└── ...
```

The filename MUST be `PRODSTARS.md` (uppercase, no prefix).

Projects MAY include additional check definition files in a `.prodstars/` directory:

```
my-project/
├── PRODSTARS.md              # Primary scorecard
├── .prodstars/
│   ├── overrides.yaml        # Deployer-local overrides (gitignored)
│   ├── community.yaml        # Community weight snapshot
│   └── checks/
│       ├── auth.yaml         # Modular check definitions
│       ├── network.yaml
│       └── data.yaml
└── ...
```

### 2.2 Document Format

`PRODSTARS.md` is a Markdown file with a YAML frontmatter block. The frontmatter contains all machine-readable data. The Markdown body contains human-readable context, rationale, and remediation guidance.

```markdown
---
# === PRODSTARS FRONTMATTER (machine-readable) ===
schema: prodstars/v1.0
# ... (full structure defined in Section 3)
---

# ProdStars: My Project

Human-readable summary, rationale, and remediation details live here.
```

### 2.3 Encoding

- Files MUST be UTF-8 encoded.
- YAML frontmatter MUST be valid YAML 1.2.
- Line endings SHOULD be LF (`\n`).

---

## 3. Frontmatter Schema

### 3.1 Top-Level Fields

```yaml
---
schema: prodstars/v1.0                 # REQUIRED. Spec version.
product: "my-project"                  # REQUIRED. Product identifier.
version: "2.1.0"                       # REQUIRED. Product version this scorecard applies to.
maintainer: "org/repo"                 # RECOMMENDED. Maintainer identifier (GitHub org/repo, URL, or email).
license: "Apache-2.0"                  # RECOMMENDED. License of the scorecard itself.
updated: "2026-02-23"                  # REQUIRED. ISO 8601 date of last scorecard update.

# Minimum passing rating. Deployments below this trigger a blocking warning.
minimum_rating: 3.5                    # OPTIONAL. Default: 0.0 (no gate).

# Global tags for filtering and categorization.
tags:                                  # OPTIONAL.
  - web-application
  - database
  - self-hosted

# Check definitions.
domains: [...]                         # REQUIRED. See Section 3.2.
---
```

### 3.2 Domains

Checks are organized into **domains** — logical groupings of related concerns. ProdStars defines six standard domains. Projects MAY add custom domains.

```yaml
domains:
  - id: environment
    name: "Environment"
    description: "Host OS, runtime, and infrastructure readiness."
    weight: 1.0              # Domain-level weight multiplier. Default: 1.0
    checks: [...]            # See Section 3.3.

  - id: authentication
    name: "Authentication & Secrets"
    description: "Credential management, secret storage, and access control."
    weight: 1.0
    checks: [...]

  - id: dependencies
    name: "Dependencies"
    description: "Supply chain integrity, vulnerability status, and version hygiene."
    weight: 1.0
    checks: [...]

  - id: configuration
    name: "Configuration"
    description: "Application settings, hardening, and secure defaults."
    weight: 1.0
    checks: [...]

  - id: data
    name: "Data Handling"
    description: "Encryption, PII exposure, backup, and data lifecycle."
    weight: 1.0
    checks: [...]

  - id: operations
    name: "Operational Readiness"
    description: "Monitoring, logging, incident response, and rollback capability."
    weight: 1.0
    checks: [...]
```

**Standard Domain IDs:** `environment`, `authentication`, `dependencies`, `configuration`, `data`, `operations`

Custom domains MUST use a namespaced ID: `x-<org>-<name>` (e.g., `x-ncdpi-compliance`).

### 3.3 Checks

Each check is a single, testable assertion about the deployment environment.

```yaml
checks:
  - id: auth-001                          # REQUIRED. Unique within the file. Format: <domain>-<nnn>
    name: "Default credentials changed"   # REQUIRED. Human-readable name.
    description: >                        # RECOMMENDED. What and why.
      The default admin password must be changed before deployment.
      Default credentials are the #1 cause of compromise in self-hosted software.

    severity: critical                    # REQUIRED. One of: critical, high, medium, low, info
    weight:                               # REQUIRED.
      developer: 10                       #   Developer-assigned weight (1–10).
      community: null                     #   Community consensus weight (1–10). Null until populated.
    tags:                                 # OPTIONAL. Arbitrary tags for filtering.
      - owasp-top-10
      - cis-controls

    # === Evaluation Method ===
    eval:                                 # REQUIRED. How to evaluate this check.
      method: env_var                     #   See Section 3.4 for all methods.
      target: "ADMIN_PASSWORD"            #   What to evaluate (method-specific).
      operator: "neq"                     #   Comparison operator. See Section 3.5.
      value: "admin"                      #   Expected/comparison value.

    # === Result Mapping ===
    pass_score: 10                        # REQUIRED. Points awarded when check passes (0–10).
    fail_score: 0                         # OPTIONAL. Points awarded when check fails. Default: 0.
    skip_score: null                      # OPTIONAL. Points when check is skipped. Null = excluded from scoring.

    # === Remediation ===
    remediation:                          # RECOMMENDED.
      summary: "Set a strong, unique admin password via the ADMIN_PASSWORD environment variable."
      commands:                           # OPTIONAL. Copy-pastable fix commands.
        - 'export ADMIN_PASSWORD="$(openssl rand -base64 32)"'
      docs_url: "https://example.com/docs/security#credentials"   # OPTIONAL.

    # === Metadata ===
    cwe: "CWE-798"                        # OPTIONAL. CWE identifier.
    references:                           # OPTIONAL. External references.
      - "https://owasp.org/Top10/A07_2021/"
      - "NIST SP 800-63B"
```

### 3.4 Evaluation Methods

The `eval.method` field defines how the check is executed. Implementations MUST support all core methods. Implementations MAY support extended methods.

#### Core Methods

| Method | `target` | `operator` | `value` | Description |
|---|---|---|---|---|
| `env_var` | Variable name | Any comparator | Expected value | Check an environment variable. |
| `command` | Shell command | Any comparator | Expected output/exit code | Run a command and evaluate output. |
| `file_exists` | File path | `eq` (exists) / `neq` (absent) | `true` / `false` | Check if a file or directory exists. |
| `file_contains` | File path | `contains` / `not_contains` | Search string or regex | Search file contents. |
| `port_open` | `host:port` | `eq` / `neq` | `true` / `false` | Check if a TCP port is reachable. |
| `http_status` | URL | Any numeric comparator | Status code (e.g., `200`) | Make an HTTP request and check the status. |
| `semver` | Command or env var yielding version | `gte`, `lte`, `eq` | Semver string (e.g., `">=18.0.0"`) | Compare a semantic version. |
| `manual` | N/A | N/A | N/A | Human-verified. Prompts user for pass/fail/skip. |

#### Extended Methods (Optional)

| Method | Description |
|---|---|
| `api_call` | Call an API endpoint and evaluate the JSON response using a JSONPath expression. |
| `dns_resolve` | Verify a DNS record exists and matches an expected value. |
| `cert_expiry` | Check that a TLS certificate does not expire within N days. |
| `container_image` | Verify a container image digest, signature, or base image. |
| `registry_check` | Query a package registry (npm, PyPI, etc.) for vulnerability advisories. |
| `custom` | Execute a user-provided script. The script MUST exit 0 (pass) or non-zero (fail). |

#### The `custom` Method

```yaml
eval:
  method: custom
  target: ".prodstars/scripts/check-encryption.sh"    # Path relative to project root.
  timeout: 30                                          # OPTIONAL. Seconds. Default: 30.
```

Custom scripts MUST:
- Be executable (`chmod +x`).
- Exit `0` for pass, `1` for fail, `2` for skip.
- Write a single-line summary to `stdout` on failure (used in the report).
- Complete within the timeout.

### 3.5 Operators

| Operator | Aliases | Description |
|---|---|---|
| `eq` | `equals`, `==` | Equal to. |
| `neq` | `not_equals`, `!=` | Not equal to. |
| `gt` | `>` | Greater than (numeric or semver). |
| `gte` | `>=` | Greater than or equal to. |
| `lt` | `<` | Less than. |
| `lte` | `<=` | Less than or equal to. |
| `contains` | `includes` | String/file contains value. |
| `not_contains` | `excludes` | String/file does not contain value. |
| `matches` | `regex` | Value matches a regular expression (PCRE). |
| `not_matches` | `not_regex` | Value does not match a regular expression. |
| `exists` | | Target exists (for `file_exists`, `env_var`). Value ignored. |
| `not_exists` | | Target does not exist. |

---

## 4. Scoring Algorithm

### 4.1 Weight Resolution

Each check has a **resolved weight** determined by three layers (highest specificity wins):

```
resolved_weight = deployer_override ?? community_weight ?? developer_weight
```

- **Developer weight** (`weight.developer`): Set in `PRODSTARS.md`. Always present.
- **Community weight** (`weight.community`): Populated from community consensus data. May be null.
- **Deployer override**: Set in `.prodstars/overrides.yaml`. Takes precedence over all.

### 4.2 Severity Multipliers

Severity levels apply a multiplier to the resolved weight:

| Severity | Multiplier | Star Rating Impact |
|---|---|---|
| `critical` | 3.0 | Failing a critical check caps the rating at ⭐☆☆☆☆ (≤ 1.5). |
| `high` | 2.0 | — |
| `medium` | 1.0 | — |
| `low` | 0.5 | — |
| `info` | 0.0 | Informational only. Does not affect rating. |

### 4.3 Score Calculation

```
For each check i (excluding skipped and info):

  max_points_i = pass_score_i × resolved_weight_i × severity_multiplier_i × domain_weight_i
  earned_points_i = (pass ? pass_score_i : fail_score_i) × resolved_weight_i × severity_multiplier_i × domain_weight_i

Total max    = Σ max_points_i
Total earned = Σ earned_points_i

Percentage   = Total earned / Total max
Star rating  = round( Percentage × 5.0, 1 )       # One decimal place, 0.0–5.0
```

### 4.4 Star Display

Star ratings are displayed as a combination of visual stars and a numeric value:

| Rating Range | Visual | Label |
|---|---|---|
| 4.5–5.0 | ⭐⭐⭐⭐⭐ | Exceptional |
| 4.0–4.4 | ⭐⭐⭐⭐☆ | Strong |
| 3.5–3.9 | ⭐⭐⭐⭐☆ | Solid |
| 3.0–3.4 | ⭐⭐⭐☆☆ | Acceptable |
| 2.5–2.9 | ⭐⭐⭐☆☆ | Needs Work |
| 2.0–2.4 | ⭐⭐☆☆☆ | Poor |
| 1.5–1.9 | ⭐⭐☆☆☆ | Critical Issues |
| 1.0–1.4 | ⭐☆☆☆☆ | Failing |
| 0.0–0.9 | ⭐☆☆☆☆ | Not Ready |

**Half-star rendering:** Implementations SHOULD support half-star glyphs for display precision. A rating of 3.7 renders as ⭐⭐⭐✦☆ (where ✦ represents a half star). Implementations that cannot render half stars MUST round to the nearest full star for visual display while preserving the decimal rating numerically.

**Critical Check Override:** If ANY check with `severity: critical` fails, the rating is capped at **⭐☆☆☆☆ (1.5 max)** regardless of the calculated rating.

### 4.5 Risk Ranking

Checks are ranked by **risk impact** — the points lost by failing:

```
risk_impact_i = (pass_score_i - fail_score_i) × resolved_weight_i × severity_multiplier_i × domain_weight_i
```

The top 5 failing checks by `risk_impact` are reported as "Top Risks."

### 4.6 Domain Ratings

Each domain receives its own independent star rating using the same formula applied only to checks within that domain. Domain ratings are displayed in the breakdown section of the output.

---

## 5. Output Format

### 5.1 Terminal Output (Default)

When a ProdStars evaluation runs, the following MUST be printed to `stderr` (so it does not interfere with piped `stdout`):

```
╔══════════════════════════════════════════════════════════════╗
║  ⭐ PRODSTARS                                      v1.0    ║
╠══════════════════════════════════════════════════════════════╣
║  Product:   my-project v2.1.0                               ║
║  Evaluated: 2026-02-23T14:30:00Z                            ║
║  Checks:    18 passed · 3 failed · 1 skipped · 2 info      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║    ⭐⭐⭐☆☆  3.4 / 5.0   Acceptable                       ║
║                                                              ║
║    ⚠  Rating capped — 1 critical check failed               ║
║       (would be 4.2 without cap)                             ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  TOP RISKS                                                   ║
╠══════════════════════════════════════════════════════════════╣
║  ⛔ CRITICAL  auth-001   Default credentials unchanged       ║
║               → export ADMIN_PASSWORD="$(openssl rand ...)"  ║
║                                                              ║
║  🔴 HIGH      deps-003   3 CVEs in dependencies              ║
║               → npm audit fix --force                        ║
║                                                              ║
║  🔴 HIGH      config-002 Debug mode enabled in production    ║
║               → Set DEBUG=false in .env                      ║
║                                                              ║
║  🟡 MEDIUM    ops-001    No log aggregation configured       ║
║               → Configure LOG_ENDPOINT variable              ║
║                                                              ║
║  🟡 MEDIUM    data-004   Backups not verified in 30+ days    ║
║               → Run: ./scripts/verify-backup.sh              ║
╠══════════════════════════════════════════════════════════════╣
║  DOMAIN BREAKDOWN                                            ║
╠══════════════════════════════════════════════════════════════╣
║  Environment ........... ⭐⭐⭐⭐⭐  4.6  Exceptional       ║
║  Authentication ........ ⭐☆☆☆☆  1.5  Critical Issues      ║
║  Dependencies .......... ⭐⭐⭐☆☆  3.2  Acceptable          ║
║  Configuration ......... ⭐⭐⭐⭐☆  3.5  Solid               ║
║  Data Handling ......... ⭐⭐⭐⭐☆  3.9  Solid               ║
║  Operations ............ ⭐⭐⭐⭐☆  4.2  Strong              ║
╠══════════════════════════════════════════════════════════════╣
║  Minimum required: 3.5    Current: 3.4    GATE: ✘ BLOCKED   ║
║  Proceed anyway? [y/N]                                       ║
╚══════════════════════════════════════════════════════════════╝
```

### 5.2 JSON Output

When invoked with `--format json`, the tool MUST output a JSON document to `stdout`:

```json
{
  "schema": "prodstars/v1.0",
  "product": "my-project",
  "version": "2.1.0",
  "evaluated_at": "2026-02-23T14:30:00Z",
  "rating": {
    "stars": 3.4,
    "stars_uncapped": 4.2,
    "max_stars": 5.0,
    "label": "Acceptable",
    "capped": true,
    "cap_reason": "critical_check_failed"
  },
  "summary": {
    "total_checks": 24,
    "passed": 18,
    "failed": 3,
    "skipped": 1,
    "info": 2
  },
  "domains": [
    {
      "id": "environment",
      "name": "Environment",
      "stars": 4.6,
      "label": "Exceptional",
      "passed": 5,
      "failed": 0
    },
    {
      "id": "authentication",
      "name": "Authentication & Secrets",
      "stars": 1.5,
      "label": "Critical Issues",
      "passed": 1,
      "failed": 2
    }
  ],
  "top_risks": [
    {
      "id": "auth-001",
      "name": "Default credentials unchanged",
      "severity": "critical",
      "domain": "authentication",
      "risk_impact": 90.0,
      "remediation_summary": "Set a strong, unique admin password via ADMIN_PASSWORD.",
      "remediation_commands": ["export ADMIN_PASSWORD=\"$(openssl rand -base64 32)\""]
    }
  ],
  "checks": [
    {
      "id": "auth-001",
      "name": "Default credentials unchanged",
      "domain": "authentication",
      "severity": "critical",
      "status": "fail",
      "resolved_weight": 10,
      "points_earned": 0,
      "points_possible": 30.0,
      "details": "ADMIN_PASSWORD is set to default value."
    }
  ],
  "gate": {
    "minimum_rating": 3.5,
    "passed": false
  }
}
```

### 5.3 Markdown Output

When invoked with `--format markdown`, output a Markdown report suitable for inclusion in PRs, wikis, or documentation. The report follows the same structure as the terminal output, rendered as a Markdown document with star visuals and tables.

### 5.4 SARIF Output

When invoked with `--format sarif`, output a SARIF v2.1.0 document for integration with GitHub Code Scanning, Azure DevOps, and other SARIF-consuming tools. Each failing check maps to a SARIF `result`.

### 5.5 Badge Output

When invoked with `--format badge`, output an SVG badge suitable for embedding in READMEs:

```markdown
![ProdStars](https://img.shields.io/badge/ProdStars-⭐⭐⭐⭐☆_4.2-brightgreen)
```

The badge color MUST reflect the rating:

| Rating | Color |
|---|---|
| 4.0–5.0 | `brightgreen` |
| 3.0–3.9 | `yellow` |
| 2.0–2.9 | `orange` |
| 0.0–1.9 | `red` |

---

## 6. Overrides

### 6.1 Deployer Overrides

Organizations create `.prodstars/overrides.yaml` to adjust weights, disable checks, or set local thresholds. This file SHOULD be added to `.gitignore`.

```yaml
# .prodstars/overrides.yaml
schema: prodstars-overrides/v1.0
minimum_rating: 4.0                   # Organization requires higher threshold.

check_overrides:
  auth-001:
    weight: 10                        # Override resolved weight.
  ops-001:
    skip: true                        # Skip this check (e.g., handled by external system).
    skip_reason: "Logging managed by centralized SIEM."
  deps-003:
    severity: critical                # Escalate severity for this org.

domain_overrides:
  operations:
    weight: 2.0                       # This org values operational readiness more heavily.
```

### 6.2 Community Weights

Community weights are distributed as a standalone YAML file, published to a central registry or fetched via URL.

```yaml
# .prodstars/community.yaml
schema: prodstars-community/v1.0
source: "https://prodstars.dev/community/my-project/v2.1.0.yaml"
fetched: "2026-02-20T00:00:00Z"
sample_size: 342                      # Number of community ratings aggregated.

weights:
  auth-001: 9.8
  auth-002: 7.4
  deps-001: 6.1
  deps-003: 8.9
  config-002: 7.7
```

The evaluator fetches or reads this file and uses the values as `weight.community` in the resolution chain.

---

## 7. CLI Interface

### 7.1 Commands

The reference CLI tool is named **`pstar`**. All commands are also available via the long form `prodstars`.

```
pstar eval [options]              # Evaluate the current project.
pstar init [options]              # Scaffold a new PRODSTARS.md.
pstar add-check [options]         # Interactively add a check.
pstar validate                    # Validate PRODSTARS.md syntax.
pstar report [options]            # Generate a report without blocking.
pstar community fetch             # Fetch latest community weights.
pstar community submit            # Submit local weight feedback.
pstar badge [options]             # Generate a badge SVG or URL.
```

### 7.2 `eval` Options

```
--format <terminal|json|markdown|sarif|badge>
                                      Output format. Default: terminal.
--fail-under <rating>                 Exit non-zero if rating < threshold.
                                      Overrides minimum_rating in frontmatter.
--skip-manual                         Skip all manual checks.
--include-info                        Include info-level checks in output.
--no-prompt                           Do not prompt for proceed/cancel.
--override <path>                     Path to overrides file.
                                      Default: .prodstars/overrides.yaml.
--community <path|url>                Path or URL to community weights.
                                      Default: .prodstars/community.yaml.
--domain <id>                         Evaluate only checks in this domain.
                                      May be specified multiple times.
--timeout <seconds>                   Global timeout for all checks. Default: 300.
--parallel <n>                        Max concurrent check evaluations. Default: 4.
--verbose                             Show details for passing checks too.
--quiet                               Suppress terminal output; exit code only.
```

### 7.3 `init` Options

```
pstar init                            # Interactive scaffolding.
pstar init --detect                   # Auto-detect stack and generate checks.
pstar init --template <name>          # Use a predefined template.
                                      # Templates: node, python, docker, k8s, static
pstar init --from <url>               # Clone another project's PRODSTARS.md as a starting point.
```

When `--detect` is used, `pstar` inspects the project directory for:
- `package.json` → Node.js checks
- `requirements.txt` / `pyproject.toml` → Python checks
- `Dockerfile` → Container checks
- `docker-compose.yml` → Multi-service checks
- `.env.example` → Environment variable checks
- `go.mod`, `Cargo.toml`, `Gemfile`, etc.

### 7.4 Exit Codes

| Code | Meaning |
|---|---|
| `0` | All checks passed and rating meets threshold. |
| `1` | One or more checks failed or rating below threshold. |
| `2` | PRODSTARS.md is missing or has syntax errors. |
| `3` | Evaluation error (timeout, permission denied, etc.). |

### 7.5 CI/CD Integration

ProdStars is designed to run as a build step. Examples:

**GitHub Actions:**

```yaml
- name: ProdStars Evaluation
  run: npx pstar eval --format sarif --fail-under 3.5 --skip-manual --no-prompt > prodstars.sarif

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: prodstars.sarif
```

**GitHub Actions (Badge Comment on PR):**

```yaml
- name: ProdStars Rating
  run: |
    RATING=$(npx pstar eval --format json --no-prompt --skip-manual | jq -r '.rating.stars')
    echo "## ⭐ ProdStars Rating: ${RATING} / 5.0" >> $GITHUB_STEP_SUMMARY
```

**Pre-commit Hook:**

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/prodstars/pstar
    rev: v1.0.0
    hooks:
      - id: pstar-validate
        name: Validate PRODSTARS.md
```

**Docker Entrypoint:**

```dockerfile
COPY PRODSTARS.md /app/PRODSTARS.md
RUN npx pstar eval --no-prompt --fail-under 3.5 --skip-manual
```

**npm Scripts:**

```json
{
  "scripts": {
    "predeploy": "pstar eval --fail-under 4.0 --no-prompt --skip-manual",
    "deploy": "your-deploy-command"
  }
}
```

---

## 8. Composition

### 8.1 Dependency Inheritance

Projects that depend on other projects can inherit their ProdStars checks. The parent project references dependencies in its frontmatter:

```yaml
compose:
  - source: "node_modules/some-db-driver/PRODSTARS.md"
    prefix: "dep-somedb"              # Prefix applied to all inherited check IDs.
    weight: 0.5                       # Scale all inherited check weights by this factor.
    domains:                          # OPTIONAL. Only inherit specific domains.
      - authentication
      - data
  - source: "https://raw.githubusercontent.com/org/infra/main/PRODSTARS.md"
    prefix: "dep-infra"
    weight: 0.3
```

### 8.2 Merge Rules

1. Inherited checks are evaluated and scored as part of the parent project.
2. Inherited check IDs are prefixed to avoid collisions (`dep-somedb-auth-001`).
3. The `weight` factor on the compose entry scales all inherited weights.
4. Deployer overrides can target inherited checks by their prefixed ID.
5. Circular dependencies MUST be detected and cause a validation error.

---

## 9. Agent Integration

### 9.1 Agent Behavior Contract

AI coding agents that encounter a `PRODSTARS.md` file SHOULD:

1. **On `build` or `deploy` commands:** Automatically run `pstar eval` before executing.
2. **On scaffold/init:** Offer to generate a `PRODSTARS.md` using the project's stack.
3. **On failing evaluation:** Present the star rating, top risks, and remediation steps. Ask the user whether to proceed, fix, or abort.
4. **On `--no-prompt` mode in CI:** Respect the exit code without interaction.

### 9.2 Prompt Fragment

Agents MAY include the following system prompt fragment to enable ProdStars awareness:

```
When working in a project directory, check for the presence of PRODSTARS.md 
at the project root. If found, run `pstar eval --format json --no-prompt` 
before any build, deploy, or run command. If the rating is below the 
minimum_rating or any critical check fails, present the star rating and 
top risks to the user and ask for confirmation before proceeding. Parse 
the JSON output to provide actionable remediation guidance.
```

### 9.3 MCP Integration

ProdStars MAY expose an MCP (Model Context Protocol) server with the following tools:

| Tool | Description |
|---|---|
| `pstar_eval` | Evaluate the project and return the JSON result. |
| `pstar_check` | Run a single check by ID and return its status. |
| `pstar_remediate` | Return remediation steps for a specific failing check. |
| `pstar_init` | Scaffold a PRODSTARS.md for the current project. |

---

## 10. Security Considerations

### 10.1 Execution Sandboxing

The `command` and `custom` eval methods execute arbitrary code. Implementations MUST:

- Run checks with the minimum privileges required.
- Enforce the configured timeout (default: 30 seconds per check).
- Never execute checks fetched from `compose` remote sources without explicit user consent.
- Log all commands executed during evaluation.

### 10.2 Secret Handling

- Checks that evaluate environment variables MUST NOT log the *values* of those variables, only whether the check passed or failed.
- The JSON output MUST NOT include secret values. Check `details` fields MUST redact sensitive content (e.g., `"ADMIN_PASSWORD is set to '***'"`).
- The `overrides.yaml` file MAY contain organization-specific thresholds and SHOULD be gitignored.

### 10.3 Supply Chain

- Community weight files fetched from remote URLs MUST be verified against a checksum or signature.
- Remote `compose` sources MUST be pinned to a specific commit, tag, or content hash.
- The CLI SHOULD warn when community data is older than 90 days.

---

## 11. Extensibility

### 11.1 Custom Domains

Projects MAY define custom domains for industry-specific concerns:

```yaml
domains:
  - id: x-k12-compliance
    name: "K-12 Compliance"
    description: "Education sector regulatory and data protection requirements."
    weight: 1.5
    checks:
      - id: x-k12-compliance-001
        name: "FERPA data handling verified"
        severity: critical
        eval:
          method: manual
        pass_score: 10
        weight:
          developer: 10
          community: null
        remediation:
          summary: "Verify that all student PII is handled in compliance with FERPA."
          docs_url: "https://studentprivacy.ed.gov/"
```

### 11.2 Plugins

Implementations MAY support a plugin system for custom eval methods. Plugins are discovered in `node_modules` (npm), `site-packages` (pip), or `.prodstars/plugins/`.

A plugin MUST export a function with the signature:

```
evaluate(target: string, operator: string, value: string, options: object) → { passed: boolean, details: string }
```

### 11.3 Webhooks

Implementations MAY support posting evaluation results to a webhook URL for centralized tracking:

```yaml
# In PRODSTARS.md frontmatter or overrides.yaml
webhooks:
  - url: "https://security.example.com/api/prodstars"
    events: ["eval_complete", "gate_failed"]
    auth: "env:PRODSTARS_WEBHOOK_TOKEN"
```

---

## 12. Reference Checks Library

The following checks are provided as a starting point. Developers SHOULD select and customize checks relevant to their project.

### 12.1 Environment

| ID | Name | Method | Target | Operator | Value |
|---|---|---|---|---|---|
| `env-001` | Supported OS | `command` | `uname -s` | `matches` | `^(Linux\|Darwin)$` |
| `env-002` | Minimum disk space | `command` | `df -BG / \| tail -1 \| awk '{print $4}' \| tr -d 'G'` | `gte` | `10` |
| `env-003` | Node.js version | `semver` | `node --version` | `gte` | `18.0.0` |
| `env-004` | Python version | `semver` | `python3 --version` | `gte` | `3.10.0` |
| `env-005` | Container runtime | `command` | `docker --version` | `exists` | — |

### 12.2 Authentication & Secrets

| ID | Name | Method | Target | Operator | Value |
|---|---|---|---|---|---|
| `auth-001` | Default credentials changed | `env_var` | `ADMIN_PASSWORD` | `neq` | `admin` |
| `auth-002` | Secret manager configured | `env_var` | `SECRET_PROVIDER` | `exists` | — |
| `auth-003` | No hardcoded secrets | `command` | `grep -rn "password\s*=" src/ \| grep -v test` | `eq` | `` |
| `auth-004` | API keys not in source | `file_contains` | `.env.example` | `not_contains` | `sk-` |
| `auth-005` | MFA enforcement documented | `manual` | — | — | — |

### 12.3 Dependencies

| ID | Name | Method | Target | Operator | Value |
|---|---|---|---|---|---|
| `deps-001` | No critical CVEs | `command` | `npm audit --json \| jq '.metadata.vulnerabilities.critical'` | `eq` | `0` |
| `deps-002` | Lock file present | `file_exists` | `package-lock.json` | `eq` | `true` |
| `deps-003` | Dependencies pinned | `file_contains` | `package.json` | `not_matches` | `"\\^\\|~"` |
| `deps-004` | SBOM generated | `file_exists` | `sbom.json` | `eq` | `true` |

### 12.4 Configuration

| ID | Name | Method | Target | Operator | Value |
|---|---|---|---|---|---|
| `config-001` | Debug mode disabled | `env_var` | `DEBUG` | `neq` | `true` |
| `config-002` | HTTPS enforced | `env_var` | `FORCE_HTTPS` | `eq` | `true` |
| `config-003` | CORS restricted | `env_var` | `CORS_ORIGIN` | `neq` | `*` |
| `config-004` | Rate limiting enabled | `env_var` | `RATE_LIMIT_ENABLED` | `eq` | `true` |

### 12.5 Data Handling

| ID | Name | Method | Target | Operator | Value |
|---|---|---|---|---|---|
| `data-001` | Encryption at rest | `env_var` | `ENCRYPT_AT_REST` | `eq` | `true` |
| `data-002` | TLS certificate valid | `cert_expiry` | `$APP_DOMAIN:443` | `gte` | `30` |
| `data-003` | Backup configured | `env_var` | `BACKUP_SCHEDULE` | `exists` | — |
| `data-004` | PII fields documented | `file_exists` | `docs/pii-inventory.md` | `eq` | `true` |

### 12.6 Operations

| ID | Name | Method | Target | Operator | Value |
|---|---|---|---|---|---|
| `ops-001` | Log aggregation configured | `env_var` | `LOG_ENDPOINT` | `exists` | — |
| `ops-002` | Health check endpoint | `http_status` | `http://localhost:$PORT/health` | `eq` | `200` |
| `ops-003` | Rollback procedure documented | `file_exists` | `docs/rollback.md` | `eq` | `true` |
| `ops-004` | Monitoring alerts configured | `manual` | — | — | — |
| `ops-005` | Incident runbook exists | `file_exists` | `docs/incident-runbook.md` | `eq` | `true` |

---

## 13. Example: Complete PRODSTARS.md

```markdown
---
schema: prodstars/v1.0
product: "school-portal"
version: "3.2.1"
maintainer: "ncdpi/school-portal"
license: "MIT"
updated: "2026-02-23"
minimum_rating: 3.5
tags:
  - web-application
  - education
  - self-hosted

domains:
  - id: environment
    name: "Environment"
    description: "Host and runtime requirements."
    weight: 1.0
    checks:
      - id: env-001
        name: "Node.js 20+"
        description: "This application requires Node.js 20 or later."
        severity: high
        weight: { developer: 8, community: null }
        eval: { method: semver, target: "node --version", operator: gte, value: "20.0.0" }
        pass_score: 8
        remediation:
          summary: "Install Node.js 20 or later."
          commands: ["nvm install 20 && nvm use 20"]
          docs_url: "https://nodejs.org/"

      - id: env-002
        name: "PostgreSQL reachable"
        description: "The application database must be available."
        severity: critical
        weight: { developer: 10, community: null }
        eval: { method: command, target: "pg_isready -h $DB_HOST -p $DB_PORT", operator: eq, value: "0" }
        pass_score: 10
        remediation:
          summary: "Ensure PostgreSQL is running and DB_HOST/DB_PORT are set."

  - id: authentication
    name: "Authentication & Secrets"
    description: "Credential and access control checks."
    weight: 1.0
    checks:
      - id: auth-001
        name: "Default admin password changed"
        description: >
          The default admin password MUST be changed. This is the single most
          common attack vector for self-hosted education software.
        severity: critical
        weight: { developer: 10, community: null }
        eval: { method: env_var, target: "ADMIN_PASSWORD", operator: neq, value: "changeme" }
        pass_score: 10
        remediation:
          summary: "Set a unique admin password."
          commands: ['export ADMIN_PASSWORD="$(openssl rand -base64 32)"']
        cwe: "CWE-798"

      - id: auth-002
        name: "Session secret configured"
        severity: high
        weight: { developer: 9, community: null }
        eval: { method: env_var, target: "SESSION_SECRET", operator: exists }
        pass_score: 9
        remediation:
          summary: "Set SESSION_SECRET to a random 64-character string."

  - id: configuration
    name: "Configuration"
    description: "Application hardening and secure defaults."
    weight: 1.0
    checks:
      - id: config-001
        name: "Debug mode disabled"
        severity: high
        weight: { developer: 7, community: null }
        eval: { method: env_var, target: "NODE_ENV", operator: eq, value: "production" }
        pass_score: 7
        remediation:
          summary: "Set NODE_ENV=production for deployment."

      - id: config-002
        name: "HTTPS enforced"
        severity: high
        weight: { developer: 8, community: null }
        eval: { method: env_var, target: "FORCE_HTTPS", operator: eq, value: "true" }
        pass_score: 8
        remediation:
          summary: "Set FORCE_HTTPS=true to enforce TLS."

  - id: data
    name: "Data Handling"
    description: "Student data protection and encryption."
    weight: 1.2
    checks:
      - id: data-001
        name: "Encryption at rest enabled"
        severity: critical
        weight: { developer: 10, community: null }
        eval: { method: env_var, target: "ENCRYPT_AT_REST", operator: eq, value: "true" }
        pass_score: 10
        remediation:
          summary: "Enable database encryption: ENCRYPT_AT_REST=true"

      - id: data-002
        name: "Backup schedule configured"
        severity: high
        weight: { developer: 8, community: null }
        eval: { method: env_var, target: "BACKUP_CRON", operator: exists }
        pass_score: 8
        remediation:
          summary: "Set BACKUP_CRON to a valid cron expression (e.g., '0 2 * * *' for 2 AM daily)."

  - id: operations
    name: "Operational Readiness"
    description: "Monitoring, logging, and incident response."
    weight: 1.0
    checks:
      - id: ops-001
        name: "Health check endpoint"
        severity: medium
        weight: { developer: 6, community: null }
        eval: { method: http_status, target: "http://localhost:$PORT/health", operator: eq, value: "200" }
        pass_score: 6
        remediation:
          summary: "Ensure the application is running and /health returns 200."

      - id: ops-002
        name: "Incident runbook exists"
        severity: medium
        weight: { developer: 5, community: null }
        eval: { method: file_exists, target: "docs/incident-runbook.md", operator: eq, value: "true" }
        pass_score: 5
        remediation:
          summary: "Create docs/incident-runbook.md with escalation procedures."

  - id: x-k12-compliance
    name: "K-12 Compliance"
    description: "Education sector regulatory and data protection requirements."
    weight: 1.5
    checks:
      - id: x-k12-compliance-001
        name: "FERPA data handling plan"
        description: "A FERPA-compliant data handling plan must be in place."
        severity: critical
        weight: { developer: 10, community: null }
        eval: { method: file_exists, target: "docs/ferpa-compliance.md", operator: eq, value: "true" }
        pass_score: 10
        remediation:
          summary: "Create docs/ferpa-compliance.md documenting PII handling procedures."
          docs_url: "https://studentprivacy.ed.gov/"

      - id: x-k12-compliance-002
        name: "Student data encrypted at rest"
        severity: critical
        weight: { developer: 10, community: null }
        eval: { method: env_var, target: "ENCRYPT_STUDENT_DATA", operator: eq, value: "true" }
        pass_score: 10
        remediation:
          summary: "Enable student data encryption: ENCRYPT_STUDENT_DATA=true"

      - id: x-k12-compliance-003
        name: "Data retention policy documented"
        severity: high
        weight: { developer: 8, community: null }
        eval: { method: file_exists, target: "docs/data-retention-policy.md", operator: eq, value: "true" }
        pass_score: 8
        remediation:
          summary: "Document data retention and deletion schedules per district policy."
---

# ⭐ ProdStars: School Portal

This scorecard defines the deployment readiness criteria for School Portal v3.2.1,
a web application used by North Carolina public school districts.

## Why This Matters

School Portal handles student PII protected under FERPA. A misconfigured deployment
can expose sensitive data for thousands of students. This scorecard ensures that
every deployment meets minimum security and compliance standards.

**Minimum rating for production deployment: ⭐⭐⭐✦☆ (3.5)**

## Getting Started

1. Copy `.env.example` to `.env` and fill in all required values.
2. Run `pstar eval` to see your readiness rating.
3. Address any critical or high-severity findings before deploying.

## Domain Details

### Environment
The application requires Node.js 20+ and a reachable PostgreSQL instance.
These are non-negotiable runtime requirements.

### Authentication & Secrets
All default credentials must be changed. Session secrets must be configured
with cryptographically random values. Failure to change default credentials
is a critical finding that caps your rating at ⭐☆☆☆☆.

### Configuration
Debug mode must be off and HTTPS must be enforced in production.
These are standard hardening measures.

### Data Handling
Weighted at 1.2× due to the sensitivity of student data.
Encryption at rest is a critical requirement.

### Operations
Health checks and incident runbooks ensure the deployment is
observable and recoverable.

### K-12 Compliance
Weighted at 1.5× due to regulatory requirements. FERPA compliance
documentation and student data encryption are non-negotiable for
any deployment handling student records.

## Remediation Resources

- [Node.js Installation Guide](https://nodejs.org/)
- [PostgreSQL Setup](https://www.postgresql.org/docs/)
- [FERPA Compliance Guide](https://studentprivacy.ed.gov/)
- [School Portal Security Docs](https://github.com/ncdpi/school-portal/wiki/Security)
```

---

## 14. Governance

### 14.1 Specification Versioning

This specification follows Semantic Versioning:
- **Major** (v2.0): Breaking changes to the schema or scoring algorithm.
- **Minor** (v1.1): New optional fields, new eval methods, new output formats.
- **Patch** (v1.0.1): Clarifications, typo fixes, reference check updates.

### 14.2 Community Weight Governance

Community weights are aggregated from voluntary submissions. The aggregation method is a **trimmed mean** (removing the top and bottom 10% of submissions) to resist manipulation. A minimum sample size of 25 submissions is required before community weights are published.

### 14.3 Specification Stewardship

The ProdStars specification is maintained as an open source project. Changes follow an RFC (Request for Comments) process:

1. **Proposal**: Open a GitHub issue describing the change.
2. **RFC**: Submit a pull request with the proposed spec changes and rationale.
3. **Review**: 30-day public comment period.
4. **Decision**: Maintainers merge or close based on community feedback.

---

## 15. Implementation Checklist

For implementers building a ProdStars-compatible tool:

**Must Have (v1.0 Compliance)**

- [ ] Parse `PRODSTARS.md` YAML frontmatter.
- [ ] Support all six standard domains.
- [ ] Implement all core eval methods (`env_var`, `command`, `file_exists`, `file_contains`, `port_open`, `http_status`, `semver`, `manual`).
- [ ] Implement all operators.
- [ ] Calculate star ratings using the algorithm in Section 4.
- [ ] Apply severity multipliers and critical check rating cap.
- [ ] Display star visuals (full, half, empty).
- [ ] Produce terminal output matching Section 5.1.
- [ ] Produce JSON output matching Section 5.2.
- [ ] Support deployer overrides via `.prodstars/overrides.yaml`.
- [ ] Respect timeouts and exit codes.
- [ ] Redact secrets in output.
- [ ] `eval`, `init`, `validate` commands.

**Should Have**

- [ ] Community weight resolution.
- [ ] Composition / dependency inheritance.
- [ ] SARIF output.
- [ ] Markdown report output.
- [ ] Badge generation (SVG and shields.io URL).
- [ ] `add-check` interactive command.
- [ ] `pstar init --detect` auto-detection.
- [ ] Plugin system for custom eval methods.
- [ ] MCP server integration.
- [ ] Parallel check execution.
- [ ] Webhook support.

**Nice to Have**

- [ ] Extended eval methods (`api_call`, `dns_resolve`, `cert_expiry`, `container_image`, `registry_check`).
- [ ] Web dashboard for viewing historical ratings.
- [ ] IDE integration (VS Code extension, JetBrains plugin).
- [ ] `pstar diff` to compare ratings between versions.
- [ ] `pstar leaderboard` for multi-project organizations.
- [ ] GitHub App for automatic PR comments with rating.

---

## Appendix A: MIME Types

| File | MIME Type |
|---|---|
| `PRODSTARS.md` | `text/markdown` |
| `.prodstars/overrides.yaml` | `application/x-yaml` |
| `.prodstars/community.yaml` | `application/x-yaml` |
| JSON output | `application/json` |
| SARIF output | `application/sarif+json` |
| Badge output | `image/svg+xml` |

## Appendix B: Related Standards and Frameworks

- [NIST Cybersecurity Framework (CSF) 2.0](https://www.nist.gov/cyberframework)
- [CIS Controls v8](https://www.cisecurity.org/controls)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SSDF (Secure Software Development Framework)](https://csrc.nist.gov/Projects/ssdf)
- [SLSA (Supply-chain Levels for Software Artifacts)](https://slsa.dev/)
- [OpenSSF Scorecard](https://securityscorecards.dev/)
- [SARIF v2.1.0](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)

## Appendix C: Glossary

| Term | Definition |
|---|---|
| **Check** | A single, testable assertion about the deployment environment. |
| **Domain** | A logical grouping of related checks. |
| **Eval method** | The mechanism used to evaluate a check (e.g., `env_var`, `command`). |
| **Resolved weight** | The final weight used for scoring after applying the override hierarchy. |
| **Risk impact** | The scoring penalty of a failing check, used to rank top risks. |
| **Gate** | A minimum rating threshold that blocks deployment if not met. |
| **Composition** | The ability to inherit checks from dependency projects. |
| **Star rating** | The 0.0–5.0 score representing deployment readiness. |

## Appendix D: Star Rating Quick Reference

```
⭐⭐⭐⭐⭐  5.0  Perfect — every check passes.
⭐⭐⭐⭐✦  4.5  Exceptional — near-perfect, minor improvements possible.
⭐⭐⭐⭐☆  4.0  Strong — production-ready with minor gaps.
⭐⭐⭐✦☆  3.5  Solid — acceptable for production, some work needed.
⭐⭐⭐☆☆  3.0  Acceptable — functional but has notable gaps.
⭐⭐✦☆☆  2.5  Needs Work — significant issues to address.
⭐⭐☆☆☆  2.0  Poor — major risks present.
⭐✦☆☆☆  1.5  Critical Issues — critical checks failing (cap zone).
⭐☆☆☆☆  1.0  Failing — not suitable for production.
☆☆☆☆☆  0.0  Not Ready — no checks pass or scorecard is empty.
```

---

*ProdStars is an open standard. Contributions, feedback, and implementations are welcome.*

*"What's your star rating?" — Ship with confidence.*

*Specification authored 2026-02-23.*
