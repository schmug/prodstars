// Tests for core type definitions (P0-T06)
// These validate that the types are structurally correct, constants are accurate,
// and that the exported types match the ProdStars spec.

import { describe, it, expect } from 'vitest';
import {
  SEVERITY_MULTIPLIERS,
  OPERATOR_ALIASES,
  ExitCode,
  type Severity,
  type Operator,
  type OperatorAlias,
  type CoreEvalMethod,
  type ExtendedEvalMethod,
  type EvalDefinition,
  type Check,
  type CheckWeight,
  type Domain,
  type ProdStarsDocument,
  type OverridesDocument,
  type CommunityWeightsDocument,
  type Rating,
  type RatingLabel,
  type ScoringResult,
  type EvalOptions,
  type OutputFormat,
  type CheckStatus,
  type EvalResult,
  type ComposeEntry,
  type WebhookEvent,
} from '../src/types.js';

// ---------------------------------------------------------------------------
// Severity Multipliers (§4.2)
// ---------------------------------------------------------------------------
describe('SEVERITY_MULTIPLIERS', () => {
  it('maps critical to 3.0', () => {
    expect(SEVERITY_MULTIPLIERS.critical).toBe(3.0);
  });

  it('maps high to 2.0', () => {
    expect(SEVERITY_MULTIPLIERS.high).toBe(2.0);
  });

  it('maps medium to 1.0', () => {
    expect(SEVERITY_MULTIPLIERS.medium).toBe(1.0);
  });

  it('maps low to 0.5', () => {
    expect(SEVERITY_MULTIPLIERS.low).toBe(0.5);
  });

  it('maps info to 0.0', () => {
    expect(SEVERITY_MULTIPLIERS.info).toBe(0.0);
  });

  it('covers all five severity levels', () => {
    const keys = Object.keys(SEVERITY_MULTIPLIERS);
    expect(keys).toHaveLength(5);
    expect(keys).toEqual(
      expect.arrayContaining(['critical', 'high', 'medium', 'low', 'info']),
    );
  });
});

// ---------------------------------------------------------------------------
// Operator Aliases (§3.5)
// ---------------------------------------------------------------------------
describe('OPERATOR_ALIASES', () => {
  it('resolves "equals" to "eq"', () => {
    expect(OPERATOR_ALIASES.equals).toBe('eq');
  });

  it('resolves "==" to "eq"', () => {
    expect(OPERATOR_ALIASES['==']).toBe('eq');
  });

  it('resolves "not_equals" to "neq"', () => {
    expect(OPERATOR_ALIASES.not_equals).toBe('neq');
  });

  it('resolves "!=" to "neq"', () => {
    expect(OPERATOR_ALIASES['!=']).toBe('neq');
  });

  it('resolves ">" to "gt"', () => {
    expect(OPERATOR_ALIASES['>']).toBe('gt');
  });

  it('resolves ">=" to "gte"', () => {
    expect(OPERATOR_ALIASES['>=']).toBe('gte');
  });

  it('resolves "<" to "lt"', () => {
    expect(OPERATOR_ALIASES['<']).toBe('lt');
  });

  it('resolves "<=" to "lte"', () => {
    expect(OPERATOR_ALIASES['<=']).toBe('lte');
  });

  it('resolves "includes" to "contains"', () => {
    expect(OPERATOR_ALIASES.includes).toBe('contains');
  });

  it('resolves "excludes" to "not_contains"', () => {
    expect(OPERATOR_ALIASES.excludes).toBe('not_contains');
  });

  it('resolves "regex" to "matches"', () => {
    expect(OPERATOR_ALIASES.regex).toBe('matches');
  });

  it('resolves "not_regex" to "not_matches"', () => {
    expect(OPERATOR_ALIASES.not_regex).toBe('not_matches');
  });

  it('has 12 alias entries', () => {
    expect(Object.keys(OPERATOR_ALIASES)).toHaveLength(12);
  });
});

// ---------------------------------------------------------------------------
// Exit Codes (§7.4)
// ---------------------------------------------------------------------------
describe('ExitCode', () => {
  it('Success is 0', () => {
    expect(ExitCode.Success).toBe(0);
  });

  it('Failure is 1', () => {
    expect(ExitCode.Failure).toBe(1);
  });

  it('InvalidFile is 2', () => {
    expect(ExitCode.InvalidFile).toBe(2);
  });

  it('EvalError is 3', () => {
    expect(ExitCode.EvalError).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Type-level structural tests (compile-time + runtime shape checks)
// ---------------------------------------------------------------------------
describe('type structures', () => {
  it('can construct a minimal valid Check', () => {
    const check: Check = {
      id: 'auth-001',
      name: 'Default credentials changed',
      severity: 'critical',
      weight: { developer: 10, community: null },
      eval: { method: 'env_var', target: 'ADMIN_PASSWORD', operator: 'neq', value: 'admin' },
      pass_score: 10,
    };
    expect(check.id).toBe('auth-001');
    expect(check.severity).toBe('critical');
    expect(check.weight.developer).toBe(10);
    expect(check.weight.community).toBeNull();
    expect(check.eval.method).toBe('env_var');
    expect(check.pass_score).toBe(10);
    // optional fields default to undefined
    expect(check.fail_score).toBeUndefined();
    expect(check.skip_score).toBeUndefined();
    expect(check.remediation).toBeUndefined();
  });

  it('can construct a Check with all optional fields', () => {
    const check: Check = {
      id: 'auth-001',
      name: 'Default credentials changed',
      description: 'Must change default password.',
      severity: 'critical',
      weight: { developer: 10, community: 9.8 },
      tags: ['owasp-top-10', 'cis-controls'],
      eval: { method: 'env_var', target: 'ADMIN_PASSWORD', operator: 'neq', value: 'admin' },
      pass_score: 10,
      fail_score: 0,
      skip_score: null,
      remediation: {
        summary: 'Set a strong admin password.',
        commands: ['export ADMIN_PASSWORD="$(openssl rand -base64 32)"'],
        docs_url: 'https://example.com/docs',
      },
      cwe: 'CWE-798',
      references: ['https://owasp.org/Top10/A07_2021/'],
    };
    expect(check.tags).toHaveLength(2);
    expect(check.remediation?.commands).toHaveLength(1);
    expect(check.cwe).toBe('CWE-798');
  });

  it('can construct a Domain with checks', () => {
    const domain: Domain = {
      id: 'authentication',
      name: 'Authentication & Secrets',
      description: 'Credential management, secret storage, and access control.',
      weight: 1.0,
      checks: [
        {
          id: 'auth-001',
          name: 'Default credentials changed',
          severity: 'critical',
          weight: { developer: 10, community: null },
          eval: { method: 'env_var', target: 'ADMIN_PASSWORD', operator: 'neq', value: 'admin' },
          pass_score: 10,
        },
      ],
    };
    expect(domain.id).toBe('authentication');
    expect(domain.checks).toHaveLength(1);
    expect(domain.weight).toBe(1.0);
  });

  it('can construct a minimal ProdStarsDocument', () => {
    const doc: ProdStarsDocument = {
      schema: 'prodstars/v1.0',
      product: 'my-project',
      version: '2.1.0',
      updated: '2026-02-23',
      domains: [],
    };
    expect(doc.schema).toBe('prodstars/v1.0');
    expect(doc.minimum_rating).toBeUndefined();
    expect(doc.compose).toBeUndefined();
  });

  it('can construct a ProdStarsDocument with compose and webhooks', () => {
    const doc: ProdStarsDocument = {
      schema: 'prodstars/v1.0',
      product: 'my-project',
      version: '2.1.0',
      updated: '2026-02-23',
      maintainer: 'org/repo',
      license: 'Apache-2.0',
      minimum_rating: 3.5,
      tags: ['web-application'],
      domains: [],
      compose: [
        { source: 'node_modules/lib/PRODSTARS.md', prefix: 'dep-lib', weight: 0.5 },
      ],
      webhooks: [
        { url: 'https://example.com/hook', events: ['eval_complete', 'gate_failed'], auth: 'env:TOKEN' },
      ],
    };
    expect(doc.compose).toHaveLength(1);
    expect(doc.webhooks).toHaveLength(1);
    expect(doc.minimum_rating).toBe(3.5);
  });

  it('can construct an OverridesDocument', () => {
    const overrides: OverridesDocument = {
      schema: 'prodstars-overrides/v1.0',
      minimum_rating: 4.0,
      check_overrides: {
        'auth-001': { weight: 10 },
        'ops-001': { skip: true, skip_reason: 'Handled externally.' },
        'deps-003': { severity: 'critical' },
      },
      domain_overrides: {
        operations: { weight: 2.0 },
      },
    };
    expect(overrides.schema).toBe('prodstars-overrides/v1.0');
    expect(overrides.check_overrides?.['ops-001']?.skip).toBe(true);
    expect(overrides.domain_overrides?.operations?.weight).toBe(2.0);
  });

  it('can construct a CommunityWeightsDocument', () => {
    const community: CommunityWeightsDocument = {
      schema: 'prodstars-community/v1.0',
      source: 'https://prodstars.dev/community/my-project/v2.1.0.yaml',
      fetched: '2026-02-20T00:00:00Z',
      sample_size: 342,
      weights: {
        'auth-001': 9.8,
        'auth-002': 7.4,
      },
    };
    expect(community.weights['auth-001']).toBe(9.8);
    expect(community.sample_size).toBe(342);
  });

  it('can construct a Rating object', () => {
    const rating: Rating = {
      stars: 1.5,
      stars_uncapped: 4.2,
      max_stars: 5.0,
      label: 'Critical Issues',
      capped: true,
      cap_reason: 'critical_check_failed',
    };
    expect(rating.stars).toBe(1.5);
    expect(rating.capped).toBe(true);
    expect(rating.max_stars).toBe(5.0);
  });

  it('can construct EvalOptions with all fields', () => {
    const opts: EvalOptions = {
      format: 'json',
      fail_under: 3.5,
      skip_manual: true,
      include_info: false,
      no_prompt: true,
      override: '.prodstars/overrides.yaml',
      community: '.prodstars/community.yaml',
      domains: ['authentication', 'data'],
      timeout: 300,
      parallel: 4,
      verbose: false,
      quiet: false,
    };
    expect(opts.format).toBe('json');
    expect(opts.domains).toHaveLength(2);
  });

  it('can construct an EvalResult', () => {
    const result: EvalResult = {
      check_id: 'auth-001',
      status: 'fail',
      details: 'ADMIN_PASSWORD is set to default value.',
    };
    expect(result.status).toBe('fail');
  });
});

// ---------------------------------------------------------------------------
// Compile-time type assertions (these fail at compile time, not runtime)
// ---------------------------------------------------------------------------
describe('compile-time type safety', () => {
  it('Severity is a union of five values', () => {
    const severities: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
    expect(severities).toHaveLength(5);
  });

  it('Operator covers all 12 canonical operators', () => {
    const operators: Operator[] = [
      'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
      'contains', 'not_contains', 'matches', 'not_matches',
      'exists', 'not_exists',
    ];
    expect(operators).toHaveLength(12);
  });

  it('CoreEvalMethod covers all 9 core methods', () => {
    const methods: CoreEvalMethod[] = [
      'env_var', 'command', 'file_exists', 'file_contains',
      'port_open', 'http_status', 'semver', 'manual', 'custom',
    ];
    expect(methods).toHaveLength(9);
  });

  it('ExtendedEvalMethod covers all 5 extended methods', () => {
    const methods: ExtendedEvalMethod[] = [
      'api_call', 'dns_resolve', 'cert_expiry', 'container_image', 'registry_check',
    ];
    expect(methods).toHaveLength(5);
  });

  it('OutputFormat covers all 5 formats', () => {
    const formats: OutputFormat[] = ['terminal', 'json', 'markdown', 'sarif', 'badge'];
    expect(formats).toHaveLength(5);
  });

  it('CheckStatus covers all 4 statuses', () => {
    const statuses: CheckStatus[] = ['pass', 'fail', 'skip', 'error'];
    expect(statuses).toHaveLength(4);
  });

  it('RatingLabel covers all 9 labels per spec §4.4', () => {
    const labels: RatingLabel[] = [
      'Exceptional', 'Strong', 'Solid', 'Acceptable',
      'Needs Work', 'Poor', 'Critical Issues', 'Failing', 'Not Ready',
    ];
    expect(labels).toHaveLength(9);
  });

  it('WebhookEvent covers both events', () => {
    const events: WebhookEvent[] = ['eval_complete', 'gate_failed'];
    expect(events).toHaveLength(2);
  });
});
