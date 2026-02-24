// =============================================================================
// ProdStars v1.0 — Core Type Definitions
// Spec reference: PRODSTARS-SPEC.md
// =============================================================================

// -----------------------------------------------------------------------------
// §3.5 — Operators
// -----------------------------------------------------------------------------

/** Core comparison operators as defined in spec §3.5. */
export type Operator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "not_contains"
  | "matches"
  | "not_matches"
  | "exists"
  | "not_exists";

/** Operator aliases that resolve to canonical Operator values (spec §3.5). */
export type OperatorAlias =
  | "equals"
  | "=="
  | "not_equals"
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "includes"
  | "excludes"
  | "regex"
  | "not_regex";

/** Union of canonical operators and their aliases. */
export type OperatorInput = Operator | OperatorAlias;

/** Maps every alias to its canonical operator (spec §3.5). */
export const OPERATOR_ALIAS_MAP: Record<OperatorAlias, Operator> = {
  equals: "eq",
  "==": "eq",
  not_equals: "neq",
  "!=": "neq",
  ">": "gt",
  ">=": "gte",
  "<": "lt",
  "<=": "lte",
  includes: "contains",
  excludes: "not_contains",
  regex: "matches",
  not_regex: "not_matches",
};

// -----------------------------------------------------------------------------
// §4.2 — Severity
// -----------------------------------------------------------------------------

/** Check severity levels (spec §4.2). */
export type Severity = "critical" | "high" | "medium" | "low" | "info";

/** Maps severity to its scoring multiplier (spec §4.2). */
export const SEVERITY_MULTIPLIERS: Record<Severity, number> = {
  critical: 3.0,
  high: 2.0,
  medium: 1.0,
  low: 0.5,
  info: 0.0,
};

// -----------------------------------------------------------------------------
// §3.4 — Eval Methods
// -----------------------------------------------------------------------------

/** Core eval methods that implementations MUST support (spec §3.4). */
export type CoreEvalMethod =
  | "env_var"
  | "command"
  | "file_exists"
  | "file_contains"
  | "port_open"
  | "http_status"
  | "semver"
  | "manual"
  | "custom";

/** Extended eval methods that implementations MAY support (spec §3.4). */
export type ExtendedEvalMethod =
  | "api_call"
  | "dns_resolve"
  | "cert_expiry"
  | "container_image"
  | "registry_check";

/** All recognized eval methods. */
export type EvalMethod = CoreEvalMethod | ExtendedEvalMethod;

/** Eval definition attached to a check (spec §3.3, §3.4). */
export interface EvalDefinition {
  /** How to evaluate this check. */
  method: EvalMethod;
  /** What to evaluate — interpretation depends on method. */
  target?: string;
  /** Comparison operator. */
  operator?: OperatorInput;
  /** Expected / comparison value. */
  value?: string;
  /** Timeout in seconds for `custom` method (spec §3.4). Default: 30. */
  timeout?: number;
}

// -----------------------------------------------------------------------------
// §3.3 — Remediation
// -----------------------------------------------------------------------------

/** Remediation guidance attached to a check (spec §3.3). */
export interface Remediation {
  /** Human-readable remediation summary. */
  summary: string;
  /** Copy-pastable fix commands. */
  commands?: string[];
  /** Link to documentation. */
  docs_url?: string;
}

// -----------------------------------------------------------------------------
// §3.3 — Check Weight
// -----------------------------------------------------------------------------

/** Weight definition for a check (spec §3.3, §4.1). */
export interface CheckWeight {
  /** Developer-assigned weight (1–10). Always present. */
  developer: number;
  /** Community consensus weight (1–10). Null until populated. */
  community: number | null;
}

// -----------------------------------------------------------------------------
// §3.3 — Check
// -----------------------------------------------------------------------------

/** A single testable assertion about the deployment environment (spec §3.3). */
export interface Check {
  /** Unique within the file. Format: <domain>-<nnn> */
  id: string;
  /** Human-readable name. */
  name: string;
  /** What this check verifies and why. */
  description?: string;
  /** Severity level. */
  severity: Severity;
  /** Developer + community weights. */
  weight: CheckWeight;
  /** Arbitrary tags for filtering. */
  tags?: string[];
  /** How to evaluate this check. */
  eval: EvalDefinition;
  /** Points awarded when check passes (0–10). */
  pass_score: number;
  /** Points awarded when check fails. Default: 0. */
  fail_score?: number;
  /** Points when check is skipped. Null = excluded from scoring. */
  skip_score?: number | null;
  /** Remediation guidance. */
  remediation?: Remediation;
  /** CWE identifier. */
  cwe?: string;
  /** External references (URLs, standards). */
  references?: string[];
}

// -----------------------------------------------------------------------------
// §3.2 — Domain
// -----------------------------------------------------------------------------

/** Standard domain IDs defined by the spec (spec §3.2). */
export type StandardDomainId =
  | "environment"
  | "authentication"
  | "dependencies"
  | "configuration"
  | "data"
  | "operations";

/** All standard domain IDs. */
export const STANDARD_DOMAIN_IDS: readonly StandardDomainId[] = [
  "environment",
  "authentication",
  "dependencies",
  "configuration",
  "data",
  "operations",
] as const;

/** A logical grouping of related checks (spec §3.2). */
export interface Domain {
  /** Domain identifier. Standard IDs or custom `x-<org>-<name>`. */
  id: string;
  /** Human-readable domain name. */
  name: string;
  /** Description of domain scope. */
  description?: string;
  /** Domain-level weight multiplier. Default: 1.0. */
  weight?: number;
  /** Checks within this domain. */
  checks: Check[];
}

// -----------------------------------------------------------------------------
// §8.1 — Composition
// -----------------------------------------------------------------------------

/** A dependency reference for inheriting checks from another project (spec §8.1). */
export interface ComposeEntry {
  /** Path or URL to the dependency's PRODSTARS.md. */
  source: string;
  /** Prefix applied to all inherited check IDs. */
  prefix: string;
  /** Scale factor for all inherited check weights. */
  weight?: number;
  /** Only inherit checks from these domains. */
  domains?: string[];
}

// -----------------------------------------------------------------------------
// §11.3 — Webhooks
// -----------------------------------------------------------------------------

/** Webhook configuration for posting evaluation results (spec §11.3). */
export interface WebhookConfig {
  /** Webhook endpoint URL. */
  url: string;
  /** Events that trigger the webhook. */
  events: string[];
  /** Auth token reference (e.g., "env:PRODSTARS_WEBHOOK_TOKEN"). */
  auth?: string;
}

// -----------------------------------------------------------------------------
// §3.1 — ProdStars Document (top-level)
// -----------------------------------------------------------------------------

/** The complete parsed ProdStars document (spec §3.1). */
export interface ProdStarsDocument {
  /** Spec version. Must be "prodstars/v1.0". */
  schema: string;
  /** Product identifier. */
  product: string;
  /** Product version this scorecard applies to. */
  version: string;
  /** Maintainer identifier (GitHub org/repo, URL, or email). */
  maintainer?: string;
  /** License of the scorecard itself. */
  license?: string;
  /** ISO 8601 date of last scorecard update. */
  updated: string;
  /** Minimum passing rating. Default: 0.0. */
  minimum_rating?: number;
  /** Global tags for filtering and categorization. */
  tags?: string[];
  /** Check definitions organized by domain. */
  domains: Domain[];
  /** Dependency inheritance entries. */
  compose?: ComposeEntry[];
  /** Webhook configurations. */
  webhooks?: WebhookConfig[];
}

// -----------------------------------------------------------------------------
// §6.1 — Deployer Overrides
// -----------------------------------------------------------------------------

/** Per-check overrides a deployer can set (spec §6.1). */
export interface CheckOverride {
  /** Override resolved weight. */
  weight?: number;
  /** Skip this check. */
  skip?: boolean;
  /** Reason for skipping. */
  skip_reason?: string;
  /** Escalate or de-escalate severity. */
  severity?: Severity;
}

/** Per-domain overrides a deployer can set (spec §6.1). */
export interface DomainOverride {
  /** Override domain weight multiplier. */
  weight?: number;
}

/** Deployer overrides file structure (spec §6.1). */
export interface OverridesFile {
  /** Override file schema version. */
  schema: string;
  /** Organization-level minimum rating threshold. */
  minimum_rating?: number;
  /** Check-level overrides keyed by check ID. */
  check_overrides?: Record<string, CheckOverride>;
  /** Domain-level overrides keyed by domain ID. */
  domain_overrides?: Record<string, DomainOverride>;
}

// -----------------------------------------------------------------------------
// §6.2 — Community Weights
// -----------------------------------------------------------------------------

/** Community weights file structure (spec §6.2). */
export interface CommunityWeightsFile {
  /** Community weights schema version. */
  schema: string;
  /** Source URL where weights were fetched from. */
  source?: string;
  /** ISO 8601 timestamp of when weights were fetched. */
  fetched?: string;
  /** Number of community ratings aggregated. */
  sample_size?: number;
  /** Weight values keyed by check ID. */
  weights: Record<string, number>;
}

// -----------------------------------------------------------------------------
// §4 — Scoring Results
// -----------------------------------------------------------------------------

/** Status of a single check after evaluation. */
export type CheckStatus = "pass" | "fail" | "skip" | "error";

/** Result of evaluating a single check. */
export interface CheckResult {
  /** Check ID. */
  id: string;
  /** Human-readable check name. */
  name: string;
  /** Domain this check belongs to. */
  domain: string;
  /** Severity level. */
  severity: Severity;
  /** Evaluation outcome. */
  status: CheckStatus;
  /** The weight used for scoring after override resolution (spec §4.1). */
  resolved_weight: number;
  /** Points earned for this check. */
  points_earned: number;
  /** Maximum possible points for this check. */
  points_possible: number;
  /** Human-readable detail about the check result. Secrets MUST be redacted. */
  details?: string;
}

// -----------------------------------------------------------------------------
// §4.4 — Star Rating Labels
// -----------------------------------------------------------------------------

/** Star rating label as defined in spec §4.4. */
export type RatingLabel =
  | "Exceptional"
  | "Strong"
  | "Solid"
  | "Acceptable"
  | "Needs Work"
  | "Poor"
  | "Critical Issues"
  | "Failing"
  | "Not Ready";

// -----------------------------------------------------------------------------
// §4.3, §4.4, §4.5 — Rating
// -----------------------------------------------------------------------------

/** The computed star rating and metadata (spec §4.3, §4.4, §5.2). */
export interface Rating {
  /** Star rating (0.0–5.0, one decimal place). */
  stars: number;
  /** Star rating before critical-check cap is applied. */
  stars_uncapped: number;
  /** Maximum possible stars (always 5.0). */
  max_stars: 5.0;
  /** Human-readable label for the rating. */
  label: RatingLabel;
  /** Whether the rating was capped due to critical check failure. */
  capped: boolean;
  /** Reason for the cap, if any. */
  cap_reason?: string;
}

// -----------------------------------------------------------------------------
// §5.2 — Check Summary
// -----------------------------------------------------------------------------

/** Summary counts of check results (spec §5.2). */
export interface CheckSummary {
  /** Total number of checks evaluated. */
  total_checks: number;
  /** Number of checks that passed. */
  passed: number;
  /** Number of checks that failed. */
  failed: number;
  /** Number of checks that were skipped. */
  skipped: number;
  /** Number of info-level checks. */
  info: number;
}

// -----------------------------------------------------------------------------
// §4.6 — Domain Rating
// -----------------------------------------------------------------------------

/** Rating computed for a single domain (spec §4.6). */
export interface DomainRating {
  /** Domain ID. */
  id: string;
  /** Domain human-readable name. */
  name: string;
  /** Domain star rating (0.0–5.0). */
  stars: number;
  /** Domain rating label. */
  label: RatingLabel;
  /** Number of checks that passed in this domain. */
  passed: number;
  /** Number of checks that failed in this domain. */
  failed: number;
}

// -----------------------------------------------------------------------------
// §4.5 — Top Risk
// -----------------------------------------------------------------------------

/** A failing check ranked by risk impact (spec §4.5). */
export interface TopRisk {
  /** Check ID. */
  id: string;
  /** Check name. */
  name: string;
  /** Severity level. */
  severity: Severity;
  /** Domain ID this check belongs to. */
  domain: string;
  /** Points lost by failing this check. */
  risk_impact: number;
  /** Remediation summary. */
  remediation_summary?: string;
  /** Remediation commands. */
  remediation_commands?: string[];
}

// -----------------------------------------------------------------------------
// §4.9 — Gate
// -----------------------------------------------------------------------------

/** Gate check result — whether the rating meets the minimum threshold (spec §4.9, §5.2). */
export interface GateResult {
  /** Minimum rating required. */
  minimum_rating: number;
  /** Whether the gate passed. */
  passed: boolean;
}

// -----------------------------------------------------------------------------
// §5.2 — Evaluation Result (complete JSON output)
// -----------------------------------------------------------------------------

/** The complete evaluation result matching JSON output format (spec §5.2). */
export interface EvaluationResult {
  /** Spec version. */
  schema: string;
  /** Product name. */
  product: string;
  /** Product version. */
  version: string;
  /** ISO 8601 timestamp of evaluation. */
  evaluated_at: string;
  /** Computed rating. */
  rating: Rating;
  /** Check summary counts. */
  summary: CheckSummary;
  /** Per-domain ratings. */
  domains: DomainRating[];
  /** Top failing checks by risk impact (up to 5). */
  top_risks: TopRisk[];
  /** Results for every evaluated check. */
  checks: CheckResult[];
  /** Gate result. */
  gate: GateResult;
}

// -----------------------------------------------------------------------------
// §7.2 — CLI Eval Options
// -----------------------------------------------------------------------------

/** Output format options (spec §5, §7.2). */
export type OutputFormat = "terminal" | "json" | "markdown" | "sarif" | "badge";

/** Options for the `pstar eval` command (spec §7.2). */
export interface EvalOptions {
  /** Output format. Default: "terminal". */
  format?: OutputFormat;
  /** Exit non-zero if rating < threshold. Overrides minimum_rating. */
  fail_under?: number;
  /** Skip all manual checks. */
  skip_manual?: boolean;
  /** Include info-level checks in output. */
  include_info?: boolean;
  /** Do not prompt for proceed/cancel. */
  no_prompt?: boolean;
  /** Path to overrides file. Default: ".prodstars/overrides.yaml". */
  override?: string;
  /** Path or URL to community weights. Default: ".prodstars/community.yaml". */
  community?: string;
  /** Evaluate only checks in these domains. */
  domain?: string[];
  /** Global timeout for all checks in seconds. Default: 300. */
  timeout?: number;
  /** Max concurrent check evaluations. Default: 4. */
  parallel?: number;
  /** Show details for passing checks too. */
  verbose?: boolean;
  /** Suppress terminal output; exit code only. */
  quiet?: boolean;
}

// -----------------------------------------------------------------------------
// §7.3 — CLI Init Options
// -----------------------------------------------------------------------------

/** Predefined init templates (spec §7.3). */
export type InitTemplate = "node" | "python" | "docker" | "k8s" | "static";

/** Options for the `pstar init` command (spec §7.3). */
export interface InitOptions {
  /** Auto-detect stack and generate checks. */
  detect?: boolean;
  /** Use a predefined template. */
  template?: InitTemplate;
  /** Clone another project's PRODSTARS.md as a starting point. */
  from?: string;
}

// -----------------------------------------------------------------------------
// §7.4 — Exit Codes
// -----------------------------------------------------------------------------

/** CLI exit codes (spec §7.4). */
export enum ExitCode {
  /** All checks passed and rating meets threshold. */
  Success = 0,
  /** One or more checks failed or rating below threshold. */
  ChecksFailed = 1,
  /** PRODSTARS.md is missing or has syntax errors. */
  ParseError = 2,
  /** Evaluation error (timeout, permission denied, etc.). */
  EvaluationError = 3,
}

// -----------------------------------------------------------------------------
// Eval method result (internal)
// -----------------------------------------------------------------------------

/** Result returned by an individual eval method handler. */
export interface EvalResult {
  /** Whether the check passed. */
  passed: boolean;
  /** Whether the check was skipped. */
  skipped: boolean;
  /** Human-readable detail (secrets MUST be redacted). */
  details: string;
}

// -----------------------------------------------------------------------------
// §4.4 — Star Display Constants
// -----------------------------------------------------------------------------

/** Star rating range to label mapping (spec §4.4). */
export interface RatingRange {
  /** Minimum rating (inclusive). */
  min: number;
  /** Maximum rating (inclusive). */
  max: number;
  /** Label for this range. */
  label: RatingLabel;
}

/** Star rating ranges and their labels (spec §4.4). */
export const RATING_RANGES: readonly RatingRange[] = [
  { min: 4.5, max: 5.0, label: "Exceptional" },
  { min: 4.0, max: 4.4, label: "Strong" },
  { min: 3.5, max: 3.9, label: "Solid" },
  { min: 3.0, max: 3.4, label: "Acceptable" },
  { min: 2.5, max: 2.9, label: "Needs Work" },
  { min: 2.0, max: 2.4, label: "Poor" },
  { min: 1.5, max: 1.9, label: "Critical Issues" },
  { min: 1.0, max: 1.4, label: "Failing" },
  { min: 0.0, max: 0.9, label: "Not Ready" },
] as const;

/** Maximum star rating a critical-failure evaluation can receive (spec §4.4). */
export const CRITICAL_CAP_MAX_RATING = 1.5;

// -----------------------------------------------------------------------------
// §5.5 — Badge Colors
// -----------------------------------------------------------------------------

/** Badge color based on rating (spec §5.5). */
export type BadgeColor = "brightgreen" | "yellow" | "orange" | "red";

/** Rating-to-badge-color mapping (spec §5.5). */
export interface BadgeColorRange {
  min: number;
  max: number;
  color: BadgeColor;
}

export const BADGE_COLOR_RANGES: readonly BadgeColorRange[] = [
  { min: 4.0, max: 5.0, color: "brightgreen" },
  { min: 3.0, max: 3.9, color: "yellow" },
  { min: 2.0, max: 2.9, color: "orange" },
  { min: 0.0, max: 1.9, color: "red" },
] as const;

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

/** A validation error found during parsing. */
export interface ValidationError {
  /** Dot-path to the field with the error (e.g., "domains[0].checks[2].eval.method"). */
  path: string;
  /** Human-readable error message. */
  message: string;
  /** Severity of the validation issue. */
  level: "error" | "warning";
}

/** Result of parsing and validating a PRODSTARS.md file. */
export interface ParseResult {
  /** The parsed document, if parsing succeeded. */
  document: ProdStarsDocument | null;
  /** The markdown body below the frontmatter. */
  markdown: string;
  /** Validation errors and warnings found during parsing. */
  errors: ValidationError[];
}
