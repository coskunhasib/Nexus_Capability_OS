# Verification Contract

This document is the authoritative verification map for Nexus Capability OS.

It defines what the CI chain proves, which runtime boundaries are intentionally safe, and which checks must pass before a PR is merged.

## Current roadmap state

```text
Adapter/runtime roadmap: 15/15 completed
Current phase: post-roadmap hardening
Authoritative local command: npm run build && npm run check:generated
```

## Verification layers

```text
install determinism
→ packet/schema validity
→ registry consistency
→ TypeScript correctness
→ skill-aware trial execution
→ adapter trial execution
→ Nexus handoff usability
→ Nexus runtime bridge event coverage
→ runtime adapter request/response contract validity
→ runtime adapter loop behavior
→ runtime adapter provider interface behavior
→ HTTP provider hardening behavior
→ local HTTP worker boundary behavior
→ minimum real worker slice behavior
→ external agent envelope behavior
→ runtime callback ingest behavior
→ runtime job state model behavior
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

Focused checks:

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
| `verify:real-worker` | The minimum real worker slice uses only allowlisted artifact generation and produces runtime events without arbitrary command execution. |
| `verify:oh-adapter` | The OpenHands envelope adapter builds safe work requests and normalizes completed/blocked results without invoking the external runtime. |
| `verify:ca-adapter` | The code-agent envelope adapter builds safe work requests for supported agent kinds and normalizes completed/blocked results. |
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
→ mock/http/local/external worker
→ nexus.runtime_adapter_response
→ runtime_bridge events
→ Runner state ingest
```

Contracts:

```text
schemas/runtime-adapter-request.schema.json
schemas/runtime-adapter-response.schema.json
samples/packets/runtime-adapter-request.sample.json
samples/packets/runtime-adapter-response.sample.json
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

## Local worker boundary

The local HTTP worker is the first out-of-process worker boundary.

```text
GET /health
POST /runtime/adapter
```

Living code path:

```text
server/local-http-worker.ts
server/run-local-http-worker.ts
scripts/verify-local-http-worker.ts
docs/local-http-worker.md
```

Guarantees:

```text
health endpoint returns worker metadata
valid runtime adapter requests return runtime adapter responses
invalid request bodies return INVALID_RUNTIME_ADAPTER_REQUEST
unknown endpoints return NOT_FOUND
dispatch.mode=real routes to the minimum real worker slice
dispatch.mode=mock and dry_run route to the mock runtime adapter
```

## Minimum real worker slice

The minimum real worker slice proves safe real-work output without granting arbitrary execution.

Living code path:

```text
server/real-worker-actions.ts
scripts/verify-real-worker-slice.ts
docs/real-worker-slice.md
```

Guarantees:

```text
only write_step_artifact is allowlisted
artifacts are written into a bounded output directory
artifact payloads mark arbitrary_command_execution=false
runtime events include step_started, gate_checked, artifact_created and step_completed
gate evidence is generated from artifact refs
```

## External agent envelope boundary

External agent adapters are envelope/normalization layers only.

They do not launch external agents, execute shell commands, mutate repositories, call remote services or send secrets.

Living code path:

```text
server/adapters/openhands-adapter.ts
server/adapters/code-agent-adapter.ts
scripts/verify-oh-adapter.ts
scripts/verify-ca-adapter.ts
docs/openhands-adapter.md
docs/code-agent-adapter.md
```

Guarantees:

```text
work requests carry secret_policy=do_not_send_secrets
adapter safety flags forbid arbitrary command execution
adapter safety flags state the adapter does not invoke the external agent directly
expected artifacts are derived from work-order expected outputs
completed results normalize to accepted runtime adapter responses
blocked results normalize to failed runtime adapter responses with step_blocked events
```

## Memory / context packet hardening

The memory/context hardening boundary is the layer after hardened review reports.

```text
TaskPacket
+ HardenedReviewReport
+ optional RuntimeJobState
+ optional RuntimeArtifactRegistry
→ nexus.memory_update_packet v0.2
→ nexus.context_update_packet v0.2
```

Living code path:

```text
src/memoryContextHardening.ts
docs/memory-context-hardening.md
scripts/verify-memory-context-hardening.ts
```

Guarantees:

```text
passed human evidence becomes accepted decisions
passed runtime evidence becomes accepted decisions
artifact-backed evidence becomes summary/ref decisions
release blockers become compact runtime blocker memory
release blockers become open next-run questions
artifact refs are stored as summary/ref only
provider/job metadata is kept for traceability only
do-not-store policy excludes raw runtime events, raw callback payloads, raw artifact payloads, secrets, irrelevant personal data and full transcripts
next-run context is bounded by maxContextItems
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

## Healthy scenario definition

A scenario is considered healthy only when all relevant layers pass:

```text
Trial result: pass
Nexus handoff usability: pass
Nexus runtime bridge: pass
Runtime adapter loop: pass
Runtime adapter provider: pass
Adapter trials: pass
Local worker boundary: pass
Real worker slice: pass
External agent envelope checks: pass
Review hardening: pass
Memory/context hardening: pass
```

This means:

```text
The compiler can route the intent.
The handoff packet contains enough information for a runtime to start work.
The runtime adapter request/response/event ingest loop works end-to-end inside Runner.
The adapter dispatch boundary can swap mock/http/local/external providers without changing Runner core logic.
The HTTP provider fails closed when remote worker output is invalid.
The local worker exposes a real HTTP boundary.
The minimum real worker can create bounded artifacts and runtime events safely.
External agent adapters can package work and normalize results without directly invoking agents.
The hardened review report can feed memory/context packets without storing raw runtime or callback payloads.
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
The external agent adapters are envelope/normalization layers only.
The minimum real worker writes bounded artifacts but does not yet perform repository mutations.
The local worker has no persistent job queue yet.
The Runtime Adapter Panel job-state export/display is still a UI polish item.
The default dev command is local-only: vite --port=3000.
```

## Next integration milestone

```text
final roadmap verification
→ post-roadmap backlog
→ runtime security policy
→ local controlled worker v2
→ external runtime wiring decision
→ UI/runtime adapter polish
```