# Productization Completion Plan

## Purpose

This document closes the planning gap between the current working vertical slice and a usable alpha product. It intentionally avoids creating new numbered milestones.

The goal is to finish the remaining work without opening an endless chain of follow-up plans.

## Current baseline

```text
Contract and milestone documentation phase is frozen.
Implementation backlog is active.
A working vertical slice already exists.
The slice has shared contracts, in-memory artifact registry, runtime log, state flow, reason codes, snapshot verification, demo script, and a minimal React review panel.
```

## Completion target

The system is complete for alpha when this is true:

```text
A controlled run can be created, executed through a real controlled adapter or mock fallback, reviewed by an operator, persisted, audited, and either committed as an accepted artifact or safely blocked/fallbacked with reason codes and trace records.
```

## Hard scope boundary

### In scope

```text
persistent local storage
controlled local adapter execution
operator action workflow
permission and auth boundary for local alpha
end-to-end persistence and adapter tests
documentation finalization
```

### Out of scope

```text
cloud marketplace
multi-tenant billing
real third-party provider credentials
production SSO
distributed coordination
long-term database scalability
new numbered milestone documents
```

## Work Package 1 — Persistent local storage

### Goal

Replace purely in-memory runtime records with deterministic local persistence while keeping in-memory behavior available for tests.

### Files to add or update

```text
src/storage/localStore.ts
src/storage/storageContracts.ts
src/providerVerticalSlice.ts
scripts/verify-storage-slice.ts
scripts/verify-all.mjs
package.json
```

### Implementation details

```text
Create LocalStore interface.
Create InMemoryStore implementation.
Create FileSnapshotStore implementation using deterministic JSON snapshots.
Persist host request records.
Persist run request records.
Persist normalized result records.
Persist review decision records.
Persist artifact disposition records.
Persist accepted artifact records.
Persist runtime log records.
```

### Done criteria

```text
happy path writes accepted artifact snapshot
blocked path writes blocked snapshot with reason code
fallback path writes fallback snapshot with reason code
re-running verifier produces deterministic snapshot shape
no accepted artifact is written before review and disposition
```

### Verification

```bash
npm run verify:storage-slice
npm run verify:vs
npm run verify:vs-snapshot
npm run build
```

## Work Package 2 — Controlled local adapter execution

### Goal

Move beyond pure mock execution by adding a controlled local adapter that can produce candidate output under strict boundaries.

### Files to add or update

```text
src/adapters/adapterContracts.ts
src/adapters/mockAdapter.ts
src/adapters/localControlledAdapter.ts
src/providerVerticalSlice.ts
scripts/verify-controlled-adapter-slice.ts
scripts/verify-all.mjs
package.json
```

### Implementation details

```text
Define Adapter interface.
Keep MockAdapter for deterministic tests.
Add LocalControlledAdapter that accepts bounded input and returns normalized candidate output.
No arbitrary command execution in alpha.
No workspace writes in alpha.
No direct accepted artifact creation.
Timeout and failure are represented as reason-coded normalized results.
Fallback is explicit.
```

### Done criteria

```text
mock adapter still passes all current vertical slice tests
local controlled adapter produces candidate normalized result
adapter failure maps to fallback or blocked result
adapter cannot create accepted artifact directly
adapter output goes through same review and disposition gates
```

### Verification

```bash
npm run verify:controlled-adapter-slice
npm run verify:vs
npm run verify:vs-snapshot
npm run build
```

## Work Package 3 — Operator action workflow

### Goal

Turn the minimal review panel into a real local alpha operator workflow.

### Files to add or update

```text
src/VerticalSliceReviewPanel.tsx
src/review/reviewActions.ts
src/review/reviewContracts.ts
src/providerVerticalSlice.ts
scripts/verify-review-actions.ts
scripts/verify-all.mjs
package.json
```

### Implementation details

```text
Expose accept_candidate action.
Expose reject_candidate action.
Expose request_changes action.
Expose use_fallback action.
Action creates review decision.
Action creates artifact disposition when applicable.
Action writes to local store.
Action updates visible state.
Accepted artifact can only appear after accept action and disposition.
```

### Done criteria

```text
operator can select a scenario in UI
operator can trigger accept/reject/request changes/fallback
UI shows final status, reason code, state history, event log, and accepted artifact count
review action verifier proves actions cannot bypass guards
```

### Verification

```bash
npm run verify-review-actions
npm run build
```

## Work Package 4 — Alpha permission and auth boundary

### Goal

Add a local alpha identity and permission boundary without pretending it is production auth.

### Files to add or update

```text
src/auth/localIdentity.ts
src/auth/permissionChecks.ts
src/providerVerticalSlice.ts
src/review/reviewActions.ts
scripts/verify-local-permissions.ts
scripts/verify-all.mjs
package.json
```

### Implementation details

```text
Define LocalOperatorIdentity.
Define allowed action list.
Require operator identity for review actions.
Require permission for accept action.
Require permission for fallback action.
Reject missing identity.
Reject identity without action permission.
Record operator ref in review decision and runtime log.
```

### Done criteria

```text
missing identity cannot accept artifact
identity without accept permission cannot accept artifact
valid local operator can accept after review and disposition
permission failure produces reason code
```

### Verification

```bash
npm run verify-local-permissions
npm run verify:vs
npm run build
```

## Work Package 5 — End-to-end alpha verifier

### Goal

Create one high-level alpha verifier that proves persistence, adapter, review actions, permission boundary, and artifact commit guards work together.

### Files to add or update

```text
scripts/verify-alpha-e2e.ts
scripts/verify-all.mjs
package.json
```

### Required paths

```text
happy accepted path
blocked missing source path
fallback selected path
reject path
request changes path
missing operator identity path
permission denied path
adapter failure path
artifact outside root path
storage snapshot replay path
```

### Done criteria

```text
alpha verifier passes all paths
verify-all includes alpha verifier
build passes
snapshot output is deterministic
```

### Verification

```bash
npm run verify-alpha-e2e
npm run verify:all
npm run build
```

## Work Package 6 — Documentation finalization

### Goal

Make the repository clear for future readers and prevent new planning loops.

### Files to update

```text
docs/current-status.md
docs/working-system-definition.md
docs/implementation-backlog-plan.md
docs/release-history-summary.md
README.md if present
```

### Done criteria

```text
current status states alpha completion level
working-system definition lists final commands
implementation backlog marks productization work packages complete
release history maps PRs to real changes
remaining work is explicitly out of scope rather than hidden backlog
```

## Final alpha done definition

The productization process is complete when all of the following pass:

```bash
npm run verify:vs
npm run verify:vs-snapshot
npm run verify:storage-slice
npm run verify:controlled-adapter-slice
npm run verify-review-actions
npm run verify-local-permissions
npm run verify-alpha-e2e
npm run verify:all
npm run build
```

And all of this is true:

```text
storage is deterministic
adapter output cannot bypass review
operator actions cannot bypass permissions
accepted artifacts require source refs, operator identity, permission, review decision, disposition, allowed root, and trace refs
fallback creates no accepted provider artifact
blocked creates no accepted artifact
UI can show and trigger local alpha review actions
status docs reflect reality
```

## Work that must not be added during this completion process

```text
new numbered milestones
cloud deployment
billing
marketplace
multi-tenant workspace model
production SSO
third-party provider credentials
distributed workers
```

If any of those becomes necessary, it must be explicitly treated as post-alpha work, not as hidden scope in this plan.

## Execution sequence

```text
PR A — persistent local storage
PR B — controlled local adapter execution
PR C — operator action workflow
PR D — local permission boundary
PR E — alpha e2e verifier
PR F — final documentation closure
```

## Stop condition

After PR F is merged and CI is green, this completion process is closed. Further work must be classified as post-alpha product expansion, not unfinished implementation backlog.
