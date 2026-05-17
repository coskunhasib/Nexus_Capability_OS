# Verification Contract

This document is the authoritative verification map for Nexus Capability OS.

## Current project state

```text
Adapter/runtime roadmap: 15/15 completed
Post-roadmap numbered block: 16-50 completed
Milestone 1 — Capability Runtime Alpha: planned and released as notes
Current phase: Milestone 2 — Controlled Runtime Beta
Authoritative local command: npm run build && npm run check:generated
```

## Milestone mode

The project no longer extends the numbered roadmap after item 50.

```text
Milestone 1 — Capability Runtime Alpha
Milestone 2 — Controlled Runtime Beta
Milestone 3 — Embedded Nexus Integration
Milestone 4 — External Runtime Mapping
```

Current Beta documents:

```text
docs/milestone-2-controlled-runtime-beta.md
docs/beta-release-checklist.md
docs/controlled-runtime-beta-release-notes.md
docs/beta-closure-plan.md
```

## Controlled Runtime Beta contract

Beta proves that local controlled execution outputs can be validated, traced and mapped without making external live execution the default path.

Beta must show:

```text
Alpha gates remain green
artifact lifecycle is explicit
workspace boundary checks are deterministic
note flow preserves source refs and lineage
multi-skill controlled fixture works
decision gates are explicit
focused Beta checks are wired into package scripts and prebuild
```

Beta excludes:

```text
live external execution by default
implicit network write access
raw logs as notes
broad file mutation
hidden tool permissions
production Nexus deployment requirement
```

## CI command contract

GitHub Actions currently runs:

```text
npm ci
npm run validate:packets
npm run audit:registry
npx tsc --noEmit
npm run build
npm run check:generated
npm run summary:ci
```

`npm run build` has a `prebuild` lifecycle that runs the product-level checks:

```text
npm run audit:registry
npm run validate:packets
npm run trial:web-saas-skill
npm run trial:all-skills
npm run trial:adapter
npm run verify:local-worker
npm run verify:real-worker
npm run verify:controlled-worker
npm run verify:controlled-worker-runtime
npm run verify:operator-run-runtime
npm run verify:artifact-lifecycle
npm run verify:workspace-boundary
npm run verify:note-flow
npm run verify:multi-skill-controlled-runtime
npm run verify:decision-gate
npm run verify:oh-adapter
npm run verify:ca-adapter
npm run verify:capability-runtime
npm run verify:handoff
npm run verify:runtime-bridge
npm run verify:adapter-loop
npm run verify:adapter-provider
npm run verify:event-store
npm run verify:artifacts
npm run verify:review-hardening
npm run verify:memory-context
npm run sync:trial-results
npm run sync:tree
```

`npm run build` also has a `postbuild` lifecycle:

```text
npm run check:bundle
```

## Local verification

Before opening or merging a PR, run:

```bash
npm ci
npm run build
npm run check:generated
```

Focused Beta checks:

```bash
npm run verify:artifact-lifecycle
npm run verify:workspace-boundary
npm run verify:note-flow
npm run verify:multi-skill-controlled-runtime
npm run verify:decision-gate
```

Carry-over Alpha checks:

```bash
npm run verify:capability-runtime
npm run verify:controlled-worker
npm run verify:controlled-worker-runtime
npm run verify:operator-run-runtime
```

Focused general checks:

```bash
npm run validate:packets
npm run audit:registry
npm run trial:all-skills
npm run trial:adapter
npm run verify:local-worker
npm run verify:real-worker
npm run verify:oh-adapter
npm run verify:ca-adapter
npm run verify:handoff
npm run verify:runtime-bridge
npm run verify:adapter-loop
npm run verify:adapter-provider
npm run verify:event-store
npm run verify:artifacts
npm run verify:review-hardening
npm run verify:memory-context
npm run check:bundle
npm run check:generated
```

## What each Beta check guarantees

| Check | Guarantee |
|---|---|
| `verify:artifact-lifecycle` | Artifact records have lifecycle status, source refs and valid transitions. |
| `verify:workspace-boundary` | Workspace reads, writes and artifact outputs are evaluated deterministically against explicit boundaries. |
| `verify:note-flow` | Note create/update/merge/retire operations preserve source refs and lineage. |
| `verify:multi-skill-controlled-runtime` | At least two skills can feed a controlled local runtime fixture and map events/artifacts into the loop. |
| `verify:decision-gate` | Gate states are explicit; granted/denied decisions require trace fields. |

## What each carry-over check guarantees

| Check | Guarantee |
|---|---|
| `verify:capability-runtime` | Capability Runtime fixtures, strict validators, invalid fixture smoke-tests and dry-run loop construction pass. |
| `verify:controlled-worker` | The manifest-driven controlled worker writes bounded artifacts and emits runtime adapter events. |
| `verify:controlled-worker-runtime` | Controlled worker responses map into Capability Runtime observations, events and artifacts. |
| `verify:operator-run-runtime` | Completed and blocked operator-run result files map into observations, runtime cycles and note candidates. |
| `verify:local-worker` | The local HTTP worker starts, serves health, returns runtime adapter responses, and fails closed on invalid/unknown routes. |
| `verify:real-worker` | The minimum real worker slice uses only allowlisted artifact generation and produces runtime events without broad execution. |
| `verify:oh-adapter` | The OpenHands envelope adapter builds safe work requests and normalizes completed/blocked results without invoking the external runtime. |
| `verify:ca-adapter` | The code-agent envelope adapter builds safe work requests for supported agent kinds and normalizes completed/blocked results. |
| `verify:handoff` | Generated Nexus handoff packets are usable enough for local or controlled runtime work. |
| `verify:runtime-bridge` | Mock runtime events satisfy callback event and payload coverage expectations. |
| `verify:adapter-loop` | Runtime request, response, callback ingest, job state and Runner state behavior work together. |
| `verify:adapter-provider` | Mock and HTTP provider behavior work through the shared dispatch interface. |
| `verify:event-store` | Runtime events can be appended, replayed, deduped and summarized. |
| `verify:artifacts` | Runtime artifact refs are collected into a registry and remain traceable. |
| `verify:review-hardening` | Evidence, missing evidence, failed gates and blockers are separated before release. |
| `verify:memory-context` | Review buckets become bounded memory/context packets with source refs and do-not-store policy. |

## Living code paths

Capability Runtime:

```text
src/capabilityRuntimeContracts.ts
src/CapabilityRuntimePanel.tsx
src/controlledWorkerRuntimeMapping.ts
src/operatorRunRuntimeMapping.ts
samples/capability-runtime/
samples/operator-run-results/
```

Controlled Runtime Beta:

```text
src/artifactLifecycle.ts
src/workspaceBoundary.ts
src/noteFlow.ts
src/decisionGate.ts
samples/controlled-runtime/
scripts/verify-artifact-lifecycle.ts
scripts/verify-workspace-boundary.ts
scripts/verify-note-flow.ts
scripts/verify-multi-skill-controlled-runtime.ts
scripts/verify-decision-gate.ts
```

Runtime adapter:

```text
src/runtimeAdapter.ts
src/runtimeAdapterProvider.ts
src/runtimeAdapters/mockRuntimeAdapterProvider.ts
src/runtimeAdapters/httpRuntimeAdapterProvider.ts
src/RuntimeAdapterPanel.tsx
scripts/verify-runtime-adapter-loop.ts
scripts/verify-runtime-adapter-provider.ts
```

## External runtime position

Current decision:

```text
mapping pattern accepted
live external execution deferred
External Runtime Mapping moved to Milestone 4
Milestone 2 remains local/controlled by default
```

## Generated artifacts

The following paths are generated and guarded:

```text
src/generated-tree-data.ts
src/data.ts
samples/trial-results
samples/handoff-results
samples/runtime-bridge-results
samples/adapter-trial-results
```

If `check:generated` fails, run:

```bash
npm run prebuild
npm run check:generated
```

Then commit the generated changes.

## Bundle budget

Current budget limits:

```text
initial index JS <= 300 kB
largest JS chunk <= 500 kB
total JS <= 1200 kB
total CSS <= 80 kB
```

Do not raise bundle limits unless the new size is intentional and justified.

## Healthy Beta scenario definition

A Controlled Runtime Beta scenario is healthy when:

```text
Alpha carry-over checks pass
artifact lifecycle passes
workspace boundary passes
note flow passes
multi-skill controlled runtime passes
decision gate passes
runtime adapter loop passes
review hardening passes
memory/context hardening passes
build passes
generated artifact drift guard passes
```

This means:

```text
The compiler can route the intent.
The handoff packet contains enough information for local/controlled work.
The runtime adapter request/response/event ingest loop works.
Controlled and operator-run outputs can feed the local runtime loop through structured observations and artifacts.
Artifacts, workspace boundaries, notes and decision gates are each verified by focused checks.
```

## Failure policy

Do not bypass a failing verification step by weakening the guard first.

Preferred order:

```text
1. Read the failing output.
2. Identify whether the product output is stale, missing or invalid.
3. Regenerate artifacts when needed.
4. Commit the generated result.
5. Only change guard logic if the guard is demonstrably checking the wrong thing.
```

## Current known limitations

```text
RuntimeLoopCycle is local/dry-run/controlled, not a persistent host subsystem.
Memory note candidates and note flows are verified but not yet backed by a persistent store.
Artifact lifecycle is policy-level, not full storage automation.
Workspace boundary rules are deterministic policy checks, not a complete OS sandbox.
Live external execution remains outside Beta scope.
```

## Next integration milestone

```text
Milestone 3 — Embedded Nexus Integration
```