import { describe, it, expect } from 'vitest';
import {
  SEVERITY_MULTIPLIERS,
  OPERATOR_ALIASES,
  ExitCode,
} from '../src/types.js';

describe('Smoke tests', () => {
  it('should import core types module without errors', () => {
    expect(SEVERITY_MULTIPLIERS).toBeDefined();
    expect(OPERATOR_ALIASES).toBeDefined();
  });

  it('should have correct severity multipliers per spec §4.2', () => {
    expect(SEVERITY_MULTIPLIERS.critical).toBe(3.0);
    expect(SEVERITY_MULTIPLIERS.high).toBe(2.0);
    expect(SEVERITY_MULTIPLIERS.medium).toBe(1.0);
    expect(SEVERITY_MULTIPLIERS.low).toBe(0.5);
    expect(SEVERITY_MULTIPLIERS.info).toBe(0.0);
  });

  it('should have correct operator alias mappings per spec §3.5', () => {
    expect(OPERATOR_ALIASES['equals']).toBe('eq');
    expect(OPERATOR_ALIASES['==']).toBe('eq');
    expect(OPERATOR_ALIASES['not_equals']).toBe('neq');
    expect(OPERATOR_ALIASES['!=']).toBe('neq');
    expect(OPERATOR_ALIASES['>']).toBe('gt');
    expect(OPERATOR_ALIASES['>=']).toBe('gte');
    expect(OPERATOR_ALIASES['<']).toBe('lt');
    expect(OPERATOR_ALIASES['<=']).toBe('lte');
    expect(OPERATOR_ALIASES['includes']).toBe('contains');
    expect(OPERATOR_ALIASES['excludes']).toBe('not_contains');
    expect(OPERATOR_ALIASES['regex']).toBe('matches');
    expect(OPERATOR_ALIASES['not_regex']).toBe('not_matches');
  });

  it('should have correct exit codes per spec §7.4', () => {
    expect(ExitCode.Success).toBe(0);
    expect(ExitCode.Failure).toBe(1);
    expect(ExitCode.InvalidFile).toBe(2);
    expect(ExitCode.EvalError).toBe(3);
  });
});
