# Verification Contract

This document is the authoritative verification map for Nexus Capability OS.

It defines what the CI chain proves, which runtime boundaries are intentionally safe, and which checks must pass before a PR is merged.

## Current project state

```text
Adapter/runtime roadmap: 15/15 completed
Post-roadmap numbered block: 16-50 completed
Current phase: Milestone 1 — Capability Runtime Alpha
Authoritative local command: npm run build && npm run check:generated
```

## Milestone mode

The project no longer extends the numbered roadmap after item 50.

Current milestone sequence:

```text
Milestone 1 — Capability Runtime Alpha
Milestone 2 — Controlled Runtime Beta
Milestone 3 — Embedded Nexus Integration
Milestone 4 — External Runtime Mapping
```

Milestone 1 source documents:

```text
docs/post-50-milestone-plan.md
docs/milestone-1-capability-runtime-alpha.md
docs/alpha-release-checklist.md
docs/external-runtime-mapping-decision.md
```

## Capability Runtime Alpha contract

Alpha proves that the embedded Capability Runtime can run in local, read-only or controlled mode.

Alpha must show:

```text
skill selection
owning agent assignment
bounded sub-agent delegation
explicit tool grant
active context from selected notes
runtime events from dry-run or controlled loop
evaluation observation generation
memory note candidate generation
read-only UI decision visibility
```

Alpha excludes:

```text
live external execution
broad workspace mutation
full-context dumping
autonomous worker swarm
memory updates without source refs
persistent Nexus host API
```

## Verification layers

```text
install determinism
→ packet/schema validity
→ registry consistency
→ TypeScript correctness
→ skill-aware trial execution
→ adapter trial execution
→ local worker boundary behavior
→ minimum real worker slice behavior
→ controlled worker behavior
→ controlled worker runtime mapping
→ operator-run runtime mapping
→ external agent envelope behavior
→ Capability Runtime contract validation
→ Nexus handoff usability
→ Nexus runtime bridge event coverage
→ runtime adapter loop behavior
→ runtime adapter provider interface behavior
→ runtime event store + replay behavior
→ runtime artifact registry behavior
→ review report hardening behavior
→ memory/context packet hardening behavior
→ snapshot sync
→ tree data sync
→ production build
→ bundle budget
→ generated artifact drift guard
→ CI summary
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

Focused Alpha checks:

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

## What each check guarantees

| Check | Guarantee |
|---|---|
| `npm ci` | `package.json` and `package-lock.json` are synchronized and installation is reproducible. |
| `validate:packets` | Packet samples, runtime adapter samples and trial scenarios match their JSON schemas. |
| `audit:registry` | Registry files have required sections, no missing references and no duplicate ids. |
| `npx tsc --noEmit` | TypeScript is type-correct without emitting build files. |
| `trial:web-saas-skill` | The reference web SaaS scenario selects expected skills and produces review/memory/context outputs. |
| `trial:all-skills` | All current trial scenarios pass skill-aware assertions. |
| `trial:adapter` | Mock and HTTP adapter trial scenarios pass runtime job, artifact, review and memory/context continuity assertions. |
| `verify:local-worker` | The local HTTP worker starts, serves health, returns runtime adapter responses, and fails closed on invalid/unknown routes. |
| `verify:real-worker` | The minimum real worker slice uses only allowlisted artifact generation and produces runtime events without broad execution. |
| `verify:controlled-worker` | The manifest-driven controlled worker writes bounded artifacts and emits runtime adapter events. |
| `verify:controlled-worker-runtime` | Controlled worker responses map into Capability Runtime observations, events and artifacts. |
| `verify:operator-run-runtime` | Completed and blocked operator-run result files map into observations, runtime cycles and memory note candidates. |
| `verify:oh-adapter` | The OpenHands envelope adapter builds safe work requests and normalizes completed/blocked results without invoking the external runtime. |
| `verify:ca-adapter` | The code-agent envelope adapter builds safe work requests for supported agent kinds and normalizes completed/blocked results. |
| `verify:capability-runtime` | Capability Runtime fixtures, strict validators, invalid fixture smoke-tests and dry-run loop construction pass. |
| `verify:handoff` | Generated Nexus handoff packets are usable enough for a runtime to start work. |
| `verify:runtime-bridge` | Mock Nexus runtime events satisfy callback event and payload coverage expectations. |
| `verify:adapter-loop` | Runtime adapter request, mock response, initial event ingest, later callback ingest, runtime job state and Runner state behavior work together. |
| `verify:adapter-provider` | Runtime adapter provider registry, mock provider and hardened HTTP provider behavior work through the shared dispatch interface. |
| `verify:event-store` | Runtime events can be appended, replayed, deduped and summarized without re-dispatching runtime work. |
| `verify:artifacts` | Runtime artifact refs are collected into a registry, repeated artifacts are separated and artifact summaries stay traceable. |
| `verify:review-hardening` | Human evidence, runtime evidence, artifact-backed evidence, missing evidence, failed gates and release blockers are separated before release. |
| `verify:memory-context` | Hardened review buckets become bounded memory/context packets with accepted decisions, runtime blockers, artifact summaries, open questions, provider/job metadata and do-not-store policy. |
| `sync:trial-results` | Trial, handoff and runtime bridge snapshots are copied into `samples/*-results`. |
| `sync:tree` | Registry data regenerates `src/generated-tree-data.ts` and `src/data.ts`. |
| `check:bundle` | Production bundle stays within defined JS/CSS budgets. |
| `check:generated` | Generated tracked and untracked artifacts are committed and not drifting. |
| `summary:ci` | GitHub Actions gets a readable matrix summary of trial/handoff/runtime/bundle status. |

## Runtime adapter boundary

The runtime adapter boundary is the layer after `nexus.handoff_packet`.

```text
Capability OS / Nexus side
→ nexus.runtime_adapter_request
→ RuntimeAdapterProvider
→ mock/http/local/external worker envelope
→ nexus.runtime_adapter_response
→ runtime_bridge events
→ Runner state ingest
```

Living code path:

```text
src/runtimeAdapter.ts
src/runtimeAdapterProvider.ts
src/runtimeAdapters/mockRuntimeAdapterProvider.ts
src/runtimeAdapters/httpRuntimeAdapterProvider.ts
src/RuntimeAdapterPanel.tsx
scripts/verify-runtime-adapter-loop.ts
scripts/verify-runtime-adapter-provider.ts
```

## Capability Runtime boundary

Capability Runtime is the embedded skill-tool-agent layer.

Living code path:

```text
src/capabilityRuntimeContracts.ts
src/CapabilityRuntimePanel.tsx
src/controlledWorkerRuntimeMapping.ts
src/operatorRunRuntimeMapping.ts
scripts/verify-capability-runtime-contracts.ts
scripts/verify-controlled-worker-runtime-mapping.ts
scripts/verify-operator-run-runtime-mapping.ts
schemas/capability-runtime-contracts.schema.json
samples/capability-runtime/
samples/operator-run-results/
```

Guarantees:

```text
skill package shape is strict
explicit tool grant shape is strict
agent and sub-agent shapes are strict
active context comes from selected note refs
evaluation observations include evidence refs
runtime loop cycles include events and artifacts
controlled worker outputs map into runtime loop
operator-run results map into runtime loop and memory note candidates
invalid fixture/result shapes fail before mapping
```

## External runtime position

External runtime mapping is not the Alpha execution path.

Current decision:

```text
mapping pattern accepted
live external execution deferred
External Runtime Mapping moved to Milestone 4
Milestone 1 remains local/read-only/controlled
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

If `check:bundle` fails, prefer:

```text
lazy-load heavy views
split large registry payloads
avoid importing large JSON into the initial shell
reduce generated static payload size
```

Do not raise bundle limits unless the new size is intentional and justified.

## Healthy Alpha scenario definition

A Capability Runtime Alpha scenario is healthy when:

```text
Capability Runtime contract validation: pass
controlled worker runtime mapping: pass
operator-run runtime mapping: pass
runtime adapter loop: pass
runtime adapter provider: pass
review hardening: pass
memory/context hardening: pass
build: pass
generated artifact drift guard: pass
```

This means:

```text
The compiler can route the intent.
The handoff packet contains enough information for local/controlled runtime work.
The runtime adapter request/response/event ingest loop works.
The Capability Runtime can explain skill, agent, sub-agent, tool, context, observation and memory-note-candidate decisions.
Controlled and operator-run outputs can feed the local runtime loop through structured observations and artifacts.
The read-only UI can show runtime decisions without mutation controls.
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
CapabilityRuntimePanel is read-only and fixture-backed.
RuntimeLoopCycle is local/dry-run/controlled, not a persistent host subsystem.
Memory note candidates are generated but not merged into a persistent store.
Artifact lifecycle is still a Beta-grade work area.
Workspace boundary validation is still a Beta-grade work area.
Live external execution remains outside Alpha scope.
```

## Next integration milestone

```text
Milestone 1 — Capability Runtime Alpha
```
