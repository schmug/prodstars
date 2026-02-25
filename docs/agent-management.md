# ProdStars Agent Management Workflow

Last updated: 2026-02-25

This repository uses a manager-led workflow for parallel agent implementation against `PRODSTARS-SPEC.md` and `TASKS.md`.

## Goals

- Keep agent work parallel and task-scoped.
- Avoid merge conflicts from status tracking churn.
- Recover useful work from stale or noisy agent branches via selective intake.

## Governance

### `TASKS.md` ownership

- `TASKS.md` is manager-owned.
- Implementation agents must not edit `TASKS.md`.
- The manager updates task state markers (`IN PROGRESS`, `DONE`) after intake/merge decisions.

### Agent branch contract

- One task per branch (`P<phase>-T<nn>`).
- Branch should contain only task deliverables and tests.
- No unrelated edits to `TASKS.md`, `package-lock.json`, or manifest/config files unless the task explicitly requires them.
- Agent handoff must include:
  - task ID
  - spec section(s)
  - files changed
  - tests run (or why not run)
  - known limitations

## Intake Rule (Selective Import)

Always review agent branches against their merge-base with `main`, not `main..branch`.

1. Identify the claimed task ID.
2. Compute merge-base with `main`.
3. Compare changed files to the task deliverables in `TASKS.md`.
4. Build a whitelist of accepted files.
5. Import only whitelisted files into the manager branch.
6. Ignore agent-side `TASKS.md` updates and unrelated churn.
7. Run validation when toolchain is available.
8. Update `TASKS.md` centrally.

## Scheduling Defaults

- Initial WIP limit: 3 concurrent implementation agents.
- Increase to 5 only after local test tooling is installed and manager validation throughput is stable.

### Selection order

1. Ready tasks only (dependencies satisfied on `main` or manager integration branch).
2. Must-have critical path before should-have/nice-to-have.
3. Prefer disjoint file areas.
4. Keep one active task per module family unless file-disjoint.

## Agent Prompt Template (Manager-Sent)

Use this as the dispatch prompt body for each task.

```md
Implement TASK: <P#-T##> from /Users/cory/prodstars/TASKS.md.

Spec references:
- <section refs from /Users/cory/prodstars/PRODSTARS-SPEC.md>

Deliverables (required):
- <path>
- <path>

Constraints:
- Do not edit TASKS.md (manager-owned).
- Do not modify package-lock.json/package.json unless this task explicitly requires it.
- Keep the patch scoped to this task only.
- Include unit/integration tests required by TASKS.md.

Handoff format:
- Task ID:
- Spec sections implemented:
- Files changed:
- Tests run (or not run + reason):
- Known limitations:
```

## Recovery Snapshot (2026-02-25)

### Recovered into manager branch (`codex/prodstars-agent-manager`)

- `P2-T02` from `origin/claude/github-issue-task-tracking-WVKNp`
  - Imported: `src/operators/numeric.ts`, `tests/operators/numeric.test.ts`
  - Ignored: `TASKS.md`
  - Status: locally validated (`npm test` pass, 2026-02-25)
- `P4-T08` from `origin/claude/mark-task-in-progress-1njJ3`
  - Imported: `src/scoring/labels.ts`, `tests/scoring/labels.test.ts`
  - Ignored: `TASKS.md`, `package.json`, `package-lock.json`
  - Status: locally validated (`npm test` pass, 2026-02-25)

### Branch inventory classification (current snapshot)

- `origin/claude/atomic-spec-tasks-wKz7E`: already merged
- `origin/claude/mark-task-in-progress-aL5tP`: already merged
- `origin/claude/mark-task-in-progress-UpX69`: superseded/duplicate (P0-T03)
- `origin/claude/mark-task-in-progress-C7vzm`: superseded/duplicate (P0-T03)
- `origin/claude/mark-task-progress-2GVXC`: superseded/duplicate (P0-T06)
- `origin/claude/mark-task-progress-eN5WA`: superseded/duplicate (P0-T06)
- `origin/claude/mark-task-in-progress-UXwLc`: superseded/duplicate (P2-T01 present on `main`)
- `origin/claude/github-issue-task-tracking-WVKNp`: recovered/superseded after selective intake
- `origin/claude/mark-task-in-progress-1njJ3`: recovered/superseded after selective intake

## Immediate Next Queue (Post-Recovery)

Parallel wave:

- `P2-T03` string operators
- `P2-T04` regex operators
- `P2-T05` existence operators

Then:

- `P2-T06` operator registry

Independent scoring lane (if review bandwidth permits):

- `P4-T01` weight resolution
- `P4-T02` severity multipliers

## Local Validation Status (Current)

Local dependencies are installed on the manager branch and `npm test` passes.

- Command: `npm test`
- Result: `5` test files passed, `178` tests passed (includes recovered `P2-T02` and `P4-T08`)
