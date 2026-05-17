# Nexus Integration Guide

## Purpose

This guide explains how to integrate this repository's completed local capability execution kernel into the main Nexus product.

This repository is not the whole Nexus product. It provides the guarded local execution kernel that Nexus can call, embed, verify, and eventually replace or extend with broader Nexus services.

## Integration boundary

```text
Nexus owns product, marketplace, dispatcher, organization, billing, cloud/hybrid policy, and provider orchestration.
This repository owns the local capability execution kernel and its verification harness.
```

## What this kernel provides

```text
working vertical slice
shared execution contracts
artifact acceptance guard
runtime log
state flow
reason codes
deterministic local store snapshots
controlled local runner
operator action workflow
local identity and permission checks
alpha e2e verifier
minimal React review panel
verify-all chain
```

## Canonical entry points

### Runtime

```text
src/providerVerticalSlice.ts
```

Main exported function:

```ts
runProviderVerticalSlice(scenario, runner?)
```

Use this as the first integration target for Nexus-side invocation tests.

### Contracts

```text
src/contracts/verticalSliceContracts.ts
```

Important exported types:

```text
Scenario
ReasonCode
SliceState
HostRequest
ProviderRunRequest
NormalizedResult
ReviewDecision
ArtifactDisposition
AcceptedArtifact
SliceRunner
VerticalSliceResult
```

### Storage and records

```text
src/storage/storageContracts.ts
src/storage/localStore.ts
```

Important exports:

```text
LocalStore
StoredSliceRecord
StoreSnapshot
toStoredSliceRecord
InMemorySliceStore
FileSnapshotStore
```

### Runner

```text
src/runtime/controlledRunner.ts
```

Important export:

```text
ControlledLocalRunner
```

### Review actions

```text
src/review/reviewActions.ts
src/review/reviewContracts.ts
```

Important exports:

```text
runReviewAction
runReviewActionWithIdentity
ReviewAction
ReviewActionOutcome
```

### Local identity checks

```text
src/auth/localIdentity.ts
src/auth/permissionChecks.ts
```

Important exports:

```text
localAdminIdentity
localReviewerIdentity
canRunReviewAction
permissionReason
```

### UI component

```text
src/VerticalSliceReviewPanel.tsx
```

This panel is a local preview and should be treated as an embeddable diagnostic/review component, not the final Nexus UI.

## Required integration flow

Nexus should call the kernel through this order:

```text
1. Build a Nexus run request.
2. Map it to HostRequest / Scenario / SliceRunner input.
3. Run the local execution kernel.
4. Convert VerticalSliceResult into Nexus result envelope.
5. Persist StoredSliceRecord through Nexus storage boundary.
6. Surface review state through Nexus review UI.
7. Commit accepted artifacts only after Nexus review and disposition policy accepts them.
8. Keep reasonCode, stateHistory, runtime events, source refs, trace refs, and accepted artifact refs intact.
```

## Minimal integration adapter shape

Nexus should add an adapter around this kernel rather than importing UI internals directly.

Suggested Nexus-side shape:

```ts
type NexusKernelInput = {
  runId: string;
  objective: string;
  sourceRefs: string[];
  operatorRef?: string;
  runnerMode: 'local' | 'controlled-local';
};

type NexusKernelOutput = {
  status: string;
  reasonCode: string;
  stateHistory: string[];
  events: unknown[];
  acceptedArtifacts: unknown[];
  storedRecord: unknown;
};
```

Adapter responsibilities:

```text
translate Nexus request to kernel input
select runner
call runProviderVerticalSlice
call toStoredSliceRecord
map output to Nexus result envelope
never drop reasonCode
never drop sourceRefs
never drop traceRefs
never convert candidate artifact to accepted artifact outside review policy
```

## Nexus-owned responsibilities

Nexus must own these layers and should not move them into this repo:

```text
skill marketplace
skill install/use policy
hidden dispatcher
node selection and provider scoring
workflow step graph
organization/team layer
internal workspace and tenant isolation
usage metering
billing and credits
trust and reputation
cloud/hybrid run policy
production auth
long-term persistence
```

## Kernel-owned responsibilities

This repo should keep owning:

```text
local vertical slice behavior
local runner contract
local guard behavior
local reason codes
local state flow
local review action primitives
local deterministic snapshot verifier
local alpha e2e verifier
minimal review panel for diagnostics
```

## Required guard invariants

Nexus integration must preserve these invariants:

```text
accepted artifact requires source refs
accepted artifact requires review decision
accepted artifact requires artifact disposition
accepted artifact requires operator identity
accepted artifact requires permission check
accepted artifact must stay under allowed root
fallback creates no accepted provider artifact
blocked creates no accepted artifact
missing operator creates no accepted artifact
outside root creates no accepted artifact
```

## Required verification before integration merge

Run these in this repository before consuming the kernel in Nexus:

```bash
npm run verify:vs
npm run verify:vs-snapshot
npm run verify:store
npm run verify:runner
npm run verify:actions
npm run verify:perm-local
npm run verify:alpha-e2e
npm run verify:all
npm run build
```

## Required verification inside Nexus

Nexus should add its own integration verifier with these cases:

```text
Nexus request maps to kernel run
kernel output maps to Nexus result envelope
accepted artifact remains gated by Nexus review policy
fallback maps to Nexus fallback state
blocked maps to Nexus blocked state
reasonCode is preserved
stateHistory is preserved
runtime events are preserved
source refs and trace refs are preserved
stored record can be replayed
```

Suggested command name in Nexus:

```bash
npm run verify:capability-kernel-integration
```

## Data mapping table

| Kernel field | Nexus target | Rule |
| --- | --- | --- |
| status | Nexus result status | Preserve or map explicitly |
| reasonCode | Nexus reason code | Must preserve exactly |
| stateHistory | Nexus run state timeline | Preserve order |
| events | Nexus runtime events | Append, do not rewrite silently |
| acceptedArtifacts | Nexus accepted artifact refs | Only after review/disposition |
| sourceRefs | Nexus evidence/source refs | Required for stateful result |
| traceRefs | Nexus trace refs | Required for audit |
| StoredSliceRecord | Nexus run record | Persist or replay through Nexus store |

## Integration stages

### Stage 1 — Read-only kernel adapter

```text
Nexus calls kernel and displays result.
No Nexus artifact commit yet.
No marketplace dispatch yet.
```

Done when:

```text
Nexus can run happy, blocked, fallback paths and show reasonCode/stateHistory/events.
```

### Stage 2 — Nexus storage bridge

```text
Nexus persists StoredSliceRecord.
Nexus can replay stored local-kernel run records.
```

Done when:

```text
stored record replay verifier passes in Nexus.
```

### Stage 3 — Nexus review bridge

```text
Nexus operator action creates or maps ReviewDecision and ArtifactDisposition.
Accepted artifacts remain gated.
```

Done when:

```text
Nexus review verifier proves no artifact can be accepted without review, disposition, operator identity, and allowed root.
```

### Stage 4 — Dispatcher bridge

```text
Nexus dispatcher can select local execution kernel as a runner target.
Dispatcher remains hidden from user-facing flow.
```

Done when:

```text
Nexus dispatcher can route a run to local kernel and preserve output envelope.
```

### Stage 5 — Marketplace and compute bridge

```text
Nexus marketplace skill record can invoke this kernel through dispatcher policy.
Marketplace compute provider records can be evaluated without exposing raw node details to the user.
```

Done when:

```text
skill marketplace e2e run passes using local kernel as one eligible execution target.
```

## Anti-goals

Do not use this repository to implement:

```text
Nexus marketplace UI
billing system
cloud provider marketplace
production user accounts
organization management
distributed dispatcher
compute node onboarding
```

Those belong in the main Nexus product.

## Final handoff checklist

```text
[ ] Nexus adapter created
[ ] Nexus result envelope mapping complete
[ ] Nexus storage bridge complete
[ ] Nexus review bridge complete
[ ] Nexus dispatcher can select local kernel
[ ] Nexus e2e verifier passes
[ ] Kernel verify-all still passes
[ ] Integration guide linked from Nexus docs
```

## Stop condition for this repository

This repository is done when:

```text
local execution kernel verification passes
integration guide exists
Nexus-side work is clearly handed off to the main Nexus product
```

Further marketplace, dispatcher, billing, tenant, and compute-provider implementation should happen in the main Nexus codebase, not here.
