# Agent Dispatch Wave 1 (Operators)

Date: 2026-02-25
Manager branch baseline: `codex/prodstars-agent-manager`

This wave starts the next ready parallel tasks after recovery of `P2-T02` and `P4-T08`.

## Shared instructions for all agents

- Base your work on `codex/prodstars-agent-manager` (not `main`).
- Implement one task only.
- Do not edit `TASKS.md` (manager-owned).
- Do not modify `package.json` or `package-lock.json`.
- Keep the patch scoped to task deliverables and tests.
- Include a short handoff summary with files changed and tests run.

## Task 1: P2-T03 (String Operators)

- Suggested branch: `codex/p2-t03-string-operators`
- Task row: `P2-T03` in `/Users/cory/prodstars/TASKS.md`
- Spec references: `PRODSTARS-SPEC.md` §3.5 (operators)
- Deliverables:
  - `/Users/cory/prodstars/src/operators/string.ts`
  - `/Users/cory/prodstars/tests/operators/string.test.ts`

### Prompt

```md
Implement TASK: P2-T03 from /Users/cory/prodstars/TASKS.md.

Task: Implement string operators — `contains` / `not_contains` (with aliases `includes` / `excludes`).

Spec references:
- /Users/cory/prodstars/PRODSTARS-SPEC.md §3.5 (operators)

Deliverables (required):
- /Users/cory/prodstars/src/operators/string.ts
- /Users/cory/prodstars/tests/operators/string.test.ts

Constraints:
- Do not edit TASKS.md (manager-owned).
- Do not modify package-lock.json/package.json.
- Keep the patch scoped to this task only.
- Include unit tests covering normal cases and edge cases (undefined/null/empty strings, case-sensitivity, substring behavior).

Handoff format:
- Task ID:
- Spec sections implemented:
- Files changed:
- Tests run (or not run + reason):
- Known limitations:
```

## Task 2: P2-T04 (Regex Operators)

- Suggested branch: `codex/p2-t04-regex-operators`
- Task row: `P2-T04` in `/Users/cory/prodstars/TASKS.md`
- Spec references: `PRODSTARS-SPEC.md` §3.5 (operators)
- Deliverables:
  - `/Users/cory/prodstars/src/operators/regex.ts`
  - `/Users/cory/prodstars/tests/operators/regex.test.ts`

### Prompt

```md
Implement TASK: P2-T04 from /Users/cory/prodstars/TASKS.md.

Task: Implement regex operators — `matches` / `not_matches` (PCRE-compatible via JS RegExp).

Spec references:
- /Users/cory/prodstars/PRODSTARS-SPEC.md §3.5 (operators)

Deliverables (required):
- /Users/cory/prodstars/src/operators/regex.ts
- /Users/cory/prodstars/tests/operators/regex.test.ts

Constraints:
- Do not edit TASKS.md (manager-owned).
- Do not modify package-lock.json/package.json.
- Keep the patch scoped to this task only.
- Include unit tests covering valid patterns, invalid patterns, anchors, case sensitivity, and undefined/null inputs.

Handoff format:
- Task ID:
- Spec sections implemented:
- Files changed:
- Tests run (or not run + reason):
- Known limitations:
```

## Task 3: P2-T05 (Existence Operators)

- Suggested branch: `codex/p2-t05-existence-operators`
- Task row: `P2-T05` in `/Users/cory/prodstars/TASKS.md`
- Spec references: `PRODSTARS-SPEC.md` §3.5 (operators)
- Deliverables:
  - `/Users/cory/prodstars/src/operators/existence.ts`
  - `/Users/cory/prodstars/tests/operators/existence.test.ts`

### Prompt

```md
Implement TASK: P2-T05 from /Users/cory/prodstars/TASKS.md.

Task: Implement existence operators — `exists` / `not_exists`.

Spec references:
- /Users/cory/prodstars/PRODSTARS-SPEC.md §3.5 (operators)

Deliverables (required):
- /Users/cory/prodstars/src/operators/existence.ts
- /Users/cory/prodstars/tests/operators/existence.test.ts

Constraints:
- Do not edit TASKS.md (manager-owned).
- Do not modify package-lock.json/package.json.
- Keep the patch scoped to this task only.
- Include unit tests covering undefined/null/empty string values and consistent boolean semantics.

Handoff format:
- Task ID:
- Spec sections implemented:
- Files changed:
- Tests run (or not run + reason):
- Known limitations:
```
