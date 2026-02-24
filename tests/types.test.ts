import { describe, it, expect } from "vitest";
import {
  OPERATOR_ALIAS_MAP,
  SEVERITY_MULTIPLIERS,
  STANDARD_DOMAIN_IDS,
  RATING_RANGES,
  CRITICAL_CAP_MAX_RATING,
  BADGE_COLOR_RANGES,
  ExitCode,
  type Operator,
  type OperatorAlias,
  type Severity,
  type CoreEvalMethod,
  type ExtendedEvalMethod,
  type EvalMethod,
  type Check,
  type Domain,
  type ProdStarsDocument,
  type OverridesFile,
  type CommunityWeightsFile,
  type Rating,
  type CheckResult,
  type EvaluationResult,
  type RatingLabel,
  type EvalResult,
  type ValidationError,
  type ParseResult,
  type ComposeEntry,
  type OutputFormat,
  type EvalOptions,
  type InitTemplate,
  type GateResult,
  type TopRisk,
  type DomainRating,
  type CheckSummary,
  type BadgeColor,
} from "../src/types.js";

// ---------------------------------------------------------------------------
// Operator alias map (spec §3.5)
// ---------------------------------------------------------------------------
describe("OPERATOR_ALIAS_MAP", () => {
  it("maps all aliases to canonical operators", () => {
    expect(OPERATOR_ALIAS_MAP["equals"]).toBe("eq");
    expect(OPERATOR_ALIAS_MAP["=="]).toBe("eq");
    expect(OPERATOR_ALIAS_MAP["not_equals"]).toBe("neq");
    expect(OPERATOR_ALIAS_MAP["!="]).toBe("neq");
    expect(OPERATOR_ALIAS_MAP[">"]).toBe("gt");
    expect(OPERATOR_ALIAS_MAP[">="]).toBe("gte");
    expect(OPERATOR_ALIAS_MAP["<"]).toBe("lt");
    expect(OPERATOR_ALIAS_MAP["<="]).toBe("lte");
    expect(OPERATOR_ALIAS_MAP["includes"]).toBe("contains");
    expect(OPERATOR_ALIAS_MAP["excludes"]).toBe("not_contains");
    expect(OPERATOR_ALIAS_MAP["regex"]).toBe("matches");
    expect(OPERATOR_ALIAS_MAP["not_regex"]).toBe("not_matches");
  });

  it("contains exactly 12 aliases", () => {
    expect(Object.keys(OPERATOR_ALIAS_MAP)).toHaveLength(12);
  });
});

// ---------------------------------------------------------------------------
// Severity multipliers (spec §4.2)
// ---------------------------------------------------------------------------
describe("SEVERITY_MULTIPLIERS", () => {
  it("has correct multiplier values per spec §4.2", () => {
    expect(SEVERITY_MULTIPLIERS.critical).toBe(3.0);
    expect(SEVERITY_MULTIPLIERS.high).toBe(2.0);
    expect(SEVERITY_MULTIPLIERS.medium).toBe(1.0);
    expect(SEVERITY_MULTIPLIERS.low).toBe(0.5);
    expect(SEVERITY_MULTIPLIERS.info).toBe(0.0);
  });

  it("covers all five severity levels", () => {
    expect(Object.keys(SEVERITY_MULTIPLIERS)).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// Standard domain IDs (spec §3.2)
// ---------------------------------------------------------------------------
describe("STANDARD_DOMAIN_IDS", () => {
  it("contains the six standard domains from spec §3.2", () => {
    expect(STANDARD_DOMAIN_IDS).toEqual([
      "environment",
      "authentication",
      "dependencies",
      "configuration",
      "data",
      "operations",
    ]);
  });

  it("has exactly 6 entries", () => {
    expect(STANDARD_DOMAIN_IDS).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// Rating ranges (spec §4.4)
// ---------------------------------------------------------------------------
describe("RATING_RANGES", () => {
  it("has 9 rating ranges", () => {
    expect(RATING_RANGES).toHaveLength(9);
  });

  it("ranges are in descending order", () => {
    for (let i = 1; i < RATING_RANGES.length; i++) {
      expect(RATING_RANGES[i].min).toBeLessThan(RATING_RANGES[i - 1].min);
    }
  });

  it("covers the full 0.0–5.0 range", () => {
    expect(RATING_RANGES[0].max).toBe(5.0);
    expect(RATING_RANGES[RATING_RANGES.length - 1].min).toBe(0.0);
  });

  it("maps correct labels per spec §4.4", () => {
    const labelMap = Object.fromEntries(
      RATING_RANGES.map((r) => [r.label, { min: r.min, max: r.max }])
    );
    expect(labelMap["Exceptional"]).toEqual({ min: 4.5, max: 5.0 });
    expect(labelMap["Strong"]).toEqual({ min: 4.0, max: 4.4 });
    expect(labelMap["Solid"]).toEqual({ min: 3.5, max: 3.9 });
    expect(labelMap["Acceptable"]).toEqual({ min: 3.0, max: 3.4 });
    expect(labelMap["Needs Work"]).toEqual({ min: 2.5, max: 2.9 });
    expect(labelMap["Poor"]).toEqual({ min: 2.0, max: 2.4 });
    expect(labelMap["Critical Issues"]).toEqual({ min: 1.5, max: 1.9 });
    expect(labelMap["Failing"]).toEqual({ min: 1.0, max: 1.4 });
    expect(labelMap["Not Ready"]).toEqual({ min: 0.0, max: 0.9 });
  });
});

// ---------------------------------------------------------------------------
// Critical cap constant (spec §4.4)
// ---------------------------------------------------------------------------
describe("CRITICAL_CAP_MAX_RATING", () => {
  it("is 1.5 per spec §4.4", () => {
    expect(CRITICAL_CAP_MAX_RATING).toBe(1.5);
  });
});

// ---------------------------------------------------------------------------
// Badge color ranges (spec §5.5)
// ---------------------------------------------------------------------------
describe("BADGE_COLOR_RANGES", () => {
  it("has 4 color ranges", () => {
    expect(BADGE_COLOR_RANGES).toHaveLength(4);
  });

  it("maps correct colors per spec §5.5", () => {
    const colorMap = Object.fromEntries(
      BADGE_COLOR_RANGES.map((r) => [r.color, { min: r.min, max: r.max }])
    );
    expect(colorMap["brightgreen"]).toEqual({ min: 4.0, max: 5.0 });
    expect(colorMap["yellow"]).toEqual({ min: 3.0, max: 3.9 });
    expect(colorMap["orange"]).toEqual({ min: 2.0, max: 2.9 });
    expect(colorMap["red"]).toEqual({ min: 0.0, max: 1.9 });
  });
});

// ---------------------------------------------------------------------------
// Exit codes (spec §7.4)
// ---------------------------------------------------------------------------
describe("ExitCode", () => {
  it("has correct numeric values per spec §7.4", () => {
    expect(ExitCode.Success).toBe(0);
    expect(ExitCode.ChecksFailed).toBe(1);
    expect(ExitCode.ParseError).toBe(2);
    expect(ExitCode.EvaluationError).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Type structural tests — verify the type shapes work at runtime
// ---------------------------------------------------------------------------
describe("Type structural validation", () => {
  it("creates a valid Check object", () => {
    const check: Check = {
      id: "auth-001",
      name: "Default credentials changed",
      severity: "critical",
      weight: { developer: 10, community: null },
      eval: {
        method: "env_var",
        target: "ADMIN_PASSWORD",
        operator: "neq",
        value: "admin",
      },
      pass_score: 10,
    };
    expect(check.id).toBe("auth-001");
    expect(check.severity).toBe("critical");
    expect(check.weight.developer).toBe(10);
    expect(check.weight.community).toBeNull();
    expect(check.eval.method).toBe("env_var");
    expect(check.fail_score).toBeUndefined();
  });

  it("creates a valid Check with all optional fields", () => {
    const check: Check = {
      id: "auth-001",
      name: "Default credentials changed",
      description: "Must change default password",
      severity: "critical",
      weight: { developer: 10, community: 9.8 },
      tags: ["owasp-top-10"],
      eval: {
        method: "env_var",
        target: "ADMIN_PASSWORD",
        operator: "neq",
        value: "admin",
      },
      pass_score: 10,
      fail_score: 0,
      skip_score: null,
      remediation: {
        summary: "Change the default password",
        commands: ['export ADMIN_PASSWORD="$(openssl rand -base64 32)"'],
        docs_url: "https://example.com/docs",
      },
      cwe: "CWE-798",
      references: ["https://owasp.org/Top10/A07_2021/"],
    };
    expect(check.tags).toEqual(["owasp-top-10"]);
    expect(check.remediation?.commands).toHaveLength(1);
    expect(check.cwe).toBe("CWE-798");
  });

  it("creates a valid Domain object", () => {
    const domain: Domain = {
      id: "authentication",
      name: "Authentication & Secrets",
      description: "Credential management checks",
      weight: 1.0,
      checks: [],
    };
    expect(domain.id).toBe("authentication");
    expect(domain.weight).toBe(1.0);
  });

  it("creates a valid ProdStarsDocument", () => {
    const doc: ProdStarsDocument = {
      schema: "prodstars/v1.0",
      product: "my-project",
      version: "2.1.0",
      updated: "2026-02-23",
      domains: [],
    };
    expect(doc.schema).toBe("prodstars/v1.0");
    expect(doc.minimum_rating).toBeUndefined();
    expect(doc.domains).toEqual([]);
  });

  it("creates a valid OverridesFile", () => {
    const overrides: OverridesFile = {
      schema: "prodstars-overrides/v1.0",
      minimum_rating: 4.0,
      check_overrides: {
        "auth-001": { weight: 10 },
        "ops-001": { skip: true, skip_reason: "Handled externally" },
        "deps-003": { severity: "critical" },
      },
      domain_overrides: {
        operations: { weight: 2.0 },
      },
    };
    expect(overrides.check_overrides?.["auth-001"]?.weight).toBe(10);
    expect(overrides.check_overrides?.["ops-001"]?.skip).toBe(true);
    expect(overrides.domain_overrides?.operations?.weight).toBe(2.0);
  });

  it("creates a valid CommunityWeightsFile", () => {
    const community: CommunityWeightsFile = {
      schema: "prodstars-community/v1.0",
      source: "https://prodstars.dev/community/my-project/v2.1.0.yaml",
      fetched: "2026-02-20T00:00:00Z",
      sample_size: 342,
      weights: {
        "auth-001": 9.8,
        "auth-002": 7.4,
        "deps-001": 6.1,
      },
    };
    expect(community.weights["auth-001"]).toBe(9.8);
    expect(community.sample_size).toBe(342);
  });

  it("creates a valid Rating object", () => {
    const rating: Rating = {
      stars: 3.4,
      stars_uncapped: 4.2,
      max_stars: 5.0,
      label: "Acceptable",
      capped: true,
      cap_reason: "critical_check_failed",
    };
    expect(rating.stars).toBe(3.4);
    expect(rating.capped).toBe(true);
  });

  it("creates a valid CheckResult", () => {
    const result: CheckResult = {
      id: "auth-001",
      name: "Default credentials unchanged",
      domain: "authentication",
      severity: "critical",
      status: "fail",
      resolved_weight: 10,
      points_earned: 0,
      points_possible: 30.0,
      details: "ADMIN_PASSWORD is set to default value.",
    };
    expect(result.status).toBe("fail");
    expect(result.points_earned).toBe(0);
  });

  it("creates a valid EvaluationResult", () => {
    const evalResult: EvaluationResult = {
      schema: "prodstars/v1.0",
      product: "my-project",
      version: "2.1.0",
      evaluated_at: "2026-02-23T14:30:00Z",
      rating: {
        stars: 4.2,
        stars_uncapped: 4.2,
        max_stars: 5.0,
        label: "Strong",
        capped: false,
      },
      summary: {
        total_checks: 10,
        passed: 8,
        failed: 1,
        skipped: 0,
        info: 1,
      },
      domains: [
        {
          id: "environment",
          name: "Environment",
          stars: 5.0,
          label: "Exceptional",
          passed: 3,
          failed: 0,
        },
      ],
      top_risks: [],
      checks: [],
      gate: {
        minimum_rating: 3.5,
        passed: true,
      },
    };
    expect(evalResult.rating.label).toBe("Strong");
    expect(evalResult.gate.passed).toBe(true);
  });

  it("creates a valid EvalResult (internal)", () => {
    const result: EvalResult = {
      passed: true,
      skipped: false,
      details: "Environment variable is set correctly.",
    };
    expect(result.passed).toBe(true);
    expect(result.skipped).toBe(false);
  });

  it("creates a valid ComposeEntry", () => {
    const entry: ComposeEntry = {
      source: "node_modules/some-db-driver/PRODSTARS.md",
      prefix: "dep-somedb",
      weight: 0.5,
      domains: ["authentication", "data"],
    };
    expect(entry.prefix).toBe("dep-somedb");
    expect(entry.domains).toHaveLength(2);
  });

  it("creates a valid ParseResult", () => {
    const result: ParseResult = {
      document: null,
      markdown: "",
      errors: [
        {
          path: "schema",
          message: "Required field 'schema' is missing",
          level: "error",
        },
      ],
    };
    expect(result.document).toBeNull();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].level).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// Eval method coverage — ensure all methods from spec §3.4 are typeable
// ---------------------------------------------------------------------------
describe("Eval method type coverage", () => {
  const coreMethodsFromSpec: CoreEvalMethod[] = [
    "env_var",
    "command",
    "file_exists",
    "file_contains",
    "port_open",
    "http_status",
    "semver",
    "manual",
    "custom",
  ];

  const extendedMethodsFromSpec: ExtendedEvalMethod[] = [
    "api_call",
    "dns_resolve",
    "cert_expiry",
    "container_image",
    "registry_check",
  ];

  it("includes all 9 core eval methods from spec §3.4", () => {
    expect(coreMethodsFromSpec).toHaveLength(9);
    // Verify each is assignable to EvalMethod
    const allMethods: EvalMethod[] = [...coreMethodsFromSpec];
    expect(allMethods).toHaveLength(9);
  });

  it("includes all 5 extended eval methods from spec §3.4", () => {
    expect(extendedMethodsFromSpec).toHaveLength(5);
    const allMethods: EvalMethod[] = [...extendedMethodsFromSpec];
    expect(allMethods).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// Operator type coverage — ensure all operators from spec §3.5 are typeable
// ---------------------------------------------------------------------------
describe("Operator type coverage", () => {
  const canonicalOps: Operator[] = [
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "contains",
    "not_contains",
    "matches",
    "not_matches",
    "exists",
    "not_exists",
  ];

  it("includes all 12 canonical operators from spec §3.5", () => {
    expect(canonicalOps).toHaveLength(12);
  });

  const aliases: OperatorAlias[] = [
    "equals",
    "==",
    "not_equals",
    "!=",
    ">",
    ">=",
    "<",
    "<=",
    "includes",
    "excludes",
    "regex",
    "not_regex",
  ];

  it("includes all 12 operator aliases from spec §3.5", () => {
    expect(aliases).toHaveLength(12);
  });
});

// ---------------------------------------------------------------------------
// Output format and CLI option coverage
// ---------------------------------------------------------------------------
describe("CLI types coverage", () => {
  it("supports all output formats from spec §5", () => {
    const formats: OutputFormat[] = [
      "terminal",
      "json",
      "markdown",
      "sarif",
      "badge",
    ];
    expect(formats).toHaveLength(5);
  });

  it("supports all init templates from spec §7.3", () => {
    const templates: InitTemplate[] = [
      "node",
      "python",
      "docker",
      "k8s",
      "static",
    ];
    expect(templates).toHaveLength(5);
  });

  it("supports all eval options from spec §7.2", () => {
    const opts: EvalOptions = {
      format: "terminal",
      fail_under: 3.5,
      skip_manual: true,
      include_info: false,
      no_prompt: true,
      override: ".prodstars/overrides.yaml",
      community: ".prodstars/community.yaml",
      domain: ["environment", "authentication"],
      timeout: 300,
      parallel: 4,
      verbose: false,
      quiet: false,
    };
    expect(opts.format).toBe("terminal");
    expect(opts.domain).toHaveLength(2);
  });
});
