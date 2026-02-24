// ProdStars v1.0 — Core Type Definitions
// Spec reference: PRODSTARS-SPEC.md

// ---------------------------------------------------------------------------
// Severity (§3.3, §4.2)
// ---------------------------------------------------------------------------

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export const SEVERITY_MULTIPLIERS: Record<Severity, number> = {
  critical: 3.0,
  high: 2.0,
  medium: 1.0,
  low: 0.5,
  info: 0.0,
};

// ---------------------------------------------------------------------------
// Operators (§3.5)
// ---------------------------------------------------------------------------

export type Operator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'not_contains'
  | 'matches'
  | 'not_matches'
  | 'exists'
  | 'not_exists';

/** Aliases that map to canonical operator names. */
export type OperatorAlias =
  | 'equals'
  | '=='
  | 'not_equals'
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'includes'
  | 'excludes'
  | 'regex'
  | 'not_regex';

export const OPERATOR_ALIASES: Record<OperatorAlias, Operator> = {
  equals: 'eq',
  '==': 'eq',
  not_equals: 'neq',
  '!=': 'neq',
  '>': 'gt',
  '>=': 'gte',
  '<': 'lt',
  '<=': 'lte',
  includes: 'contains',
  excludes: 'not_contains',
  regex: 'matches',
  not_regex: 'not_matches',
};

// ---------------------------------------------------------------------------
// Eval Methods (§3.4)
// ---------------------------------------------------------------------------

/** Core eval methods that all implementations MUST support. */
export type CoreEvalMethod =
  | 'env_var'
  | 'command'
  | 'file_exists'
  | 'file_contains'
  | 'port_open'
  | 'http_status'
  | 'semver'
  | 'manual'
  | 'custom';

/** Extended eval methods that implementations MAY support. */
export type ExtendedEvalMethod =
  | 'api_call'
  | 'dns_resolve'
  | 'cert_expiry'
  | 'container_image'
  | 'registry_check';

export type EvalMethod = CoreEvalMethod | ExtendedEvalMethod;

/** The `eval` block within a check definition (§3.3). */
export interface EvalDefinition {
  /** Eval method identifier. */
  method: EvalMethod;
  /** What to evaluate — interpretation depends on the method. */
  target?: string;
  /** Comparison operator (or alias). */
  operator?: Operator | OperatorAlias;
  /** Expected / comparison value. */
  value?: string;
  /** Timeout in seconds (for `custom` method). Default: 30. */
  timeout?: number;
}

// ---------------------------------------------------------------------------
// Check Weight (§3.3, §4.1)
// ---------------------------------------------------------------------------

export interface CheckWeight {
  /** Developer-assigned weight (1–10). Always present. */
  developer: number;
  /** Community consensus weight (1–10). Null until populated. */
  community: number | null;
}

// ---------------------------------------------------------------------------
// Remediation (§3.3)
// ---------------------------------------------------------------------------

export interface Remediation {
  /** Human-readable remediation summary. */
  summary: string;
  /** Copy-pastable fix commands. */
  commands?: string[];
  /** URL to relevant documentation. */
  docs_url?: string;
}

// ---------------------------------------------------------------------------
// Check (§3.3)
// ---------------------------------------------------------------------------

export interface Check {
  /** Unique check ID within the file. Format: <domain>-<nnn> */
  id: string;
  /** Human-readable check name. */
  name: string;
  /** What this check tests and why. */
  description?: string;
  /** Severity level. */
  severity: Severity;
  /** Developer and community weights. */
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
  /** CWE identifier (e.g., "CWE-798"). */
  cwe?: string;
  /** External reference URLs. */
  references?: string[];
}

// ---------------------------------------------------------------------------
// Domain (§3.2)
// ---------------------------------------------------------------------------

/** The six standard domain IDs. */
export type StandardDomainId =
  | 'environment'
  | 'authentication'
  | 'dependencies'
  | 'configuration'
  | 'data'
  | 'operations';

export interface Domain {
  /** Domain identifier. Standard IDs or custom `x-<org>-<name>` format. */
  id: string;
  /** Human-readable domain name. */
  name: string;
  /** Description of what this domain covers. */
  description?: string;
  /** Domain-level weight multiplier. Default: 1.0. */
  weight?: number;
  /** Checks belonging to this domain. */
  checks: Check[];
}

// ---------------------------------------------------------------------------
// Composition (§8.1)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Webhooks (§11.3)
// ---------------------------------------------------------------------------

export type WebhookEvent = 'eval_complete' | 'gate_failed';

export interface WebhookConfig {
  /** URL to POST results to. */
  url: string;
  /** Events that trigger the webhook. */
  events: WebhookEvent[];
  /** Auth token reference (e.g., "env:PRODSTARS_WEBHOOK_TOKEN"). */
  auth?: string;
}

// ---------------------------------------------------------------------------
// ProdStars Document — Top-level (§3.1)
// ---------------------------------------------------------------------------

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
  /** Global tags for filtering. */
  tags?: string[];
  /** Domain and check definitions. */
  domains: Domain[];
  /** Dependency composition entries. */
  compose?: ComposeEntry[];
  /** Webhook configurations. */
  webhooks?: WebhookConfig[];
}

// ---------------------------------------------------------------------------
// Deployer Overrides (§6.1)
// ---------------------------------------------------------------------------

export interface CheckOverride {
  /** Override the resolved weight. */
  weight?: number;
  /** Skip this check entirely. */
  skip?: boolean;
  /** Reason for skipping. */
  skip_reason?: string;
  /** Override/escalate severity. */
  severity?: Severity;
}

export interface DomainOverride {
  /** Override the domain weight multiplier. */
  weight?: number;
}

export interface OverridesDocument {
  /** Override schema version. Must be "prodstars-overrides/v1.0". */
  schema: string;
  /** Organization-level minimum rating threshold. */
  minimum_rating?: number;
  /** Per-check overrides, keyed by check ID. */
  check_overrides?: Record<string, CheckOverride>;
  /** Per-domain overrides, keyed by domain ID. */
  domain_overrides?: Record<string, DomainOverride>;
}

// ---------------------------------------------------------------------------
// Community Weights (§6.2)
// ---------------------------------------------------------------------------

export interface CommunityWeightsDocument {
  /** Community schema version. Must be "prodstars-community/v1.0". */
  schema: string;
  /** URL the community data was fetched from. */
  source?: string;
  /** ISO 8601 timestamp of when the data was fetched. */
  fetched?: string;
  /** Number of community ratings aggregated. */
  sample_size?: number;
  /** Community weight values, keyed by check ID. */
  weights: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Eval Result (runtime)
// ---------------------------------------------------------------------------

export type CheckStatus = 'pass' | 'fail' | 'skip' | 'error';

export interface EvalResult {
  /** The check ID that was evaluated. */
  check_id: string;
  /** Whether the check passed, failed, was skipped, or errored. */
  status: CheckStatus;
  /** Human-readable details about the result (secrets redacted). */
  details: string;
}

// ---------------------------------------------------------------------------
// Scoring Results (runtime, §4)
// ---------------------------------------------------------------------------

export interface CheckScoreResult {
  /** Check ID. */
  id: string;
  /** Check name. */
  name: string;
  /** Domain this check belongs to. */
  domain: string;
  /** Check severity. */
  severity: Severity;
  /** Evaluation status. */
  status: CheckStatus;
  /** The final resolved weight used for scoring. */
  resolved_weight: number;
  /** Points earned after applying weight, severity, and domain multipliers. */
  points_earned: number;
  /** Maximum points possible for this check. */
  points_possible: number;
  /** Human-readable details (secrets redacted). */
  details: string;
}

export interface DomainRating {
  /** Domain ID. */
  id: string;
  /** Domain display name. */
  name: string;
  /** Star rating for this domain (0.0–5.0). */
  stars: number;
  /** Rating label (e.g., "Exceptional", "Strong"). */
  label: string;
  /** Number of passing checks in this domain. */
  passed: number;
  /** Number of failing checks in this domain. */
  failed: number;
}

export interface TopRisk {
  /** Check ID. */
  id: string;
  /** Check name. */
  name: string;
  /** Check severity. */
  severity: Severity;
  /** Domain ID. */
  domain: string;
  /** Risk impact score (points lost by failing). */
  risk_impact: number;
  /** Remediation summary. */
  remediation_summary?: string;
  /** Remediation commands. */
  remediation_commands?: string[];
}

/** Star rating label per §4.4. */
export type RatingLabel =
  | 'Exceptional'
  | 'Strong'
  | 'Solid'
  | 'Acceptable'
  | 'Needs Work'
  | 'Poor'
  | 'Critical Issues'
  | 'Failing'
  | 'Not Ready';

export interface Rating {
  /** Computed star rating (0.0–5.0), after applying critical cap if needed. */
  stars: number;
  /** Star rating before critical check cap was applied. */
  stars_uncapped: number;
  /** Maximum possible stars (always 5.0). */
  max_stars: 5.0;
  /** Human-readable label for the rating. */
  label: RatingLabel;
  /** Whether the rating was capped due to a critical check failure. */
  capped: boolean;
  /** Reason for the cap, if applicable. */
  cap_reason?: string;
}

export interface EvalSummary {
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

export interface GateResult {
  /** The minimum rating threshold. */
  minimum_rating: number;
  /** Whether the gate passed (rating >= minimum). */
  passed: boolean;
}

/** Complete scoring result — the full output of an evaluation run. */
export interface ScoringResult {
  /** Spec schema version. */
  schema: string;
  /** Product identifier. */
  product: string;
  /** Product version. */
  version: string;
  /** ISO 8601 timestamp of when the evaluation ran. */
  evaluated_at: string;
  /** Overall star rating. */
  rating: Rating;
  /** Summary counts. */
  summary: EvalSummary;
  /** Per-domain ratings. */
  domains: DomainRating[];
  /** Top 5 failing checks by risk impact. */
  top_risks: TopRisk[];
  /** Per-check scoring details. */
  checks: CheckScoreResult[];
  /** Gate pass/fail result. */
  gate: GateResult;
}

// ---------------------------------------------------------------------------
// CLI Options (§7.2)
// ---------------------------------------------------------------------------

export type OutputFormat = 'terminal' | 'json' | 'markdown' | 'sarif' | 'badge';

export interface EvalOptions {
  /** Output format. Default: "terminal". */
  format?: OutputFormat;
  /** Exit non-zero if rating < this threshold. Overrides minimum_rating. */
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
  domains?: string[];
  /** Global timeout for all checks in seconds. Default: 300. */
  timeout?: number;
  /** Max concurrent check evaluations. Default: 4. */
  parallel?: number;
  /** Show details for passing checks too. */
  verbose?: boolean;
  /** Suppress terminal output; exit code only. */
  quiet?: boolean;
}

// ---------------------------------------------------------------------------
// Exit Codes (§7.4)
// ---------------------------------------------------------------------------

export enum ExitCode {
  /** All checks passed and rating meets threshold. */
  Success = 0,
  /** One or more checks failed or rating below threshold. */
  Failure = 1,
  /** PRODSTARS.md is missing or has syntax errors. */
  InvalidFile = 2,
  /** Evaluation error (timeout, permission denied, etc.). */
  EvalError = 3,
}
