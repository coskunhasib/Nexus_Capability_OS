# Implementation Backlog Plan

## Decision

```text
Do not open new numbered milestones for the next work.
Contract and documentation phase is frozen.
Implementation phase is active.
```

## Current baseline

```text
PR #103 introduced the first working vertical slice.
PR #104 connected the slice to shared contracts, artifact registry, runtime log, and stronger guard checks.
PR #105 added runner abstraction, state history, state validation, and demo script.
PR #106 simplified verify scripts and added release/status documentation.
PR #107 connected the vertical slice to the existing React sidebar through a review panel.
PR #108 added reason codes and deterministic snapshot verification.
```

## Completed workstreams

```text
[x] A — canonical vertical slice cleanup
[x] B — shared contracts starter
[x] C — in-memory artifact registry integration
[x] D — runtime log integration
[x] E — stronger guard tests
[x] F — runner abstraction inside vertical slice
[x] G — state flow binding and validation
[x] H — demo script and minimal UI review panel
[x] I — repository hygiene and working-system docs
[x] J — reason-code taxonomy and deterministic snapshot verifier
```

## Active implementation files

```text
src/providerVerticalSlice.ts
src/contracts/verticalSliceContracts.ts
src/runtime/artifactRegistry.ts
src/runtime/runtimeLog.ts
src/runtime/stateFlow.ts
src/VerticalSliceReviewPanel.tsx
scripts/verify-vslice.ts
scripts/verify-vslice-snapshot.ts
scripts/run-vslice-demo.ts
scripts/verify-all.mjs
```

## Active verification commands

```bash
npm run verify:vs
npm run verify:vs-snapshot
npm run demo:vs
npm run verify:all
npm run build
```

## Working-system definition

```text
A candidate artifact becomes an accepted artifact only when source refs, operator decision, artifact disposition, trace refs, and allowed artifact root checks all pass.
Blocked, rejected, change-requested, fallback, missing-operator, missing-disposition, and outside-root paths create zero accepted artifacts.
```

## Remaining real work

```text
persistent storage beyond in-memory snapshots
real controlled provider adapter execution beyond mock runner
production authentication and authorization
full operator workflow beyond minimal sidebar panel
```

## Rule

```text
No new numbered milestone documents.
Continue implementation from this backlog only when adding real runtime behavior.
```
