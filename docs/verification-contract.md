# Verification Contract

This document defines what the repository verification chain guarantees and what should be run locally before changing registry, trial, handoff, runtime bridge or UI code.

## Verification layers

```text
install determinism
→ packet/schema validity
→ registry consistency
→ TypeScript correctness
→ skill-aware trial execution
→ Nexus handoff usability
→ Nexus runtime bridge event coverage
→ runtime adapter request/response contract validity
→ runtime adapter loop behavior
→ runtime adapter provider interface behavior
→ HTTP provider hardening behavior
→ runtime adapter operator config surface
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

`npm run build` has a `prebuild` lifecycle that runs the product-level generated checks:

```text
npm run audit:registry
npm run validate:packets
npm run trial:web-saas-skill
npm run trial:all-skills
npm run verify:handoff
npm run verify:runtime-bridge
npm run verify:adapter-loop
npm run verify:adapter-provider
npm run sync:trial-results
npm run sync:tree
```

`npm run build` also has a `postbuild` lifecycle:

```text
npm run check:bundle
```

## Local verification

Before opening a PR, run:

```bash
npm ci
npm run build
npm run check:generated
```

For faster focused checks:

```bash
npm run validate:packets
npm run audit:registry
npm run trial:all-skills
npm run verify:handoff
npm run verify:runtime-bridge
npm run verify:adapter-loop
npm run verify:adapter-provider
npm run check:bundle
```

## What each check guarantees

| Check | Guarantee |
|---|---|
| `npm ci` | `package.json` and `package-lock.json` are synchronized and installation is reproducible. |
| `validate:packets` | Packet samples, runtime adapter request/response samples and trial scenarios match their JSON schemas. |
| `audit:registry` | Registry files have required sections, no missing references and no duplicate ids. |
| `npx tsc --noEmit` | TypeScript is type-correct without emitting build files. |
| `trial:web-saas-skill` | The reference web SaaS scenario selects expected skills and produces review/memory/context outputs. |
| `trial:all-skills` | All current trial scenarios pass skill-aware assertions. |
| `verify:handoff` | Generated Nexus handoff packets are usable enough for a runtime to start work. |
| `verify:runtime-bridge` | Mock Nexus runtime events satisfy callback event and payload coverage expectations. |
| `verify:adapter-loop` | Runtime adapter request, mock response, event stream and Runner ingest behavior work together. |
| `verify:adapter-provider` | Runtime adapter provider registry, mock provider and hardened HTTP provider behavior work through the shared dispatch interface. |
| `sync:trial-results` | Trial, handoff and runtime bridge snapshots are copied into `samples/*-results`. |
| `sync:tree` | Registry data regenerates `src/generated-tree-data.ts` and `src/data.ts`. |
| `check:bundle` | Production bundle stays within defined JS/CSS budgets. |
| `check:generated` | Generated tracked and untracked artifacts are committed and not drifting. |
| `summary:ci` | GitHub Actions gets a readable matrix summary of trial/handoff/runtime/bundle status. |

## Runtime adapter boundary

The runtime adapter boundary is the next layer after `nexus.handoff_packet`.

```text
Capability OS / Nexus side
→ nexus.runtime_adapter_request
→ RuntimeAdapterProvider
→ mock/http/external worker
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

The provider interface guarantees:

```text
Runner can dispatch through a selected provider instead of calling mock runtime code directly.
Mock provider uses the in-process adapter.
HTTP provider defines the endpoint boundary for real local or remote workers.
Provider registry rejects unknown provider ids clearly.
HTTP provider rejects missing endpoint_url clearly.
```

The HTTP provider hardening guarantees:

```text
explicit provider error codes
timeout boundary
retry policy for retryable HTTP statuses
invalid JSON rejection
invalid runtime_adapter_response shape rejection
healthy / unconfigured / unreachable / failed health check status
optional auth bearer header
```

The Runtime Adapter Panel now exposes operator-controlled config:

```text
provider selector
dispatch mode selector
endpoint_url
healthcheck_url
auth token boundary
timeout_ms
retry max/delay/statuses
target_worker
priority
callback_url
idempotency_key
operator_notes
health check action
configured request export
configured response export
```

The request carries:

```text
request_id
handoff_packet
dispatch mode
target_worker
priority
idempotency_key
callback_url
timeout_seconds
operator_notes
```

The response carries:

```text
request_id
accepted/status
job metadata
initial runtime bridge events
optional error object
```

The loop verification guarantees:

```text
request packet_type is correct
response accepted path works
step_started / gate_checked / artifact_created / step_completed are emitted
Runner status is updated from events
gate evidence is ingested
artifact refs are produced
empty work_order reject path returns EMPTY_WORK_ORDER
```

## Generated artifacts

The following paths are generated and guarded:

```text
src/generated-tree-data.ts
src/data.ts
samples/trial-results
samples/handoff-results
samples/runtime-bridge-results
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

## Trial and Nexus runtime contract

A scenario is considered healthy only when all five layers pass:

```text
Trial result: pass
Nexus handoff usability: pass
Nexus runtime bridge: pass
Runtime adapter loop: pass
Runtime adapter provider: pass
```

This means:

```text
The compiler can route the intent.
The handoff packet contains enough information for Nexus/runtime to start work.
The mock runtime can emit expected callback events and payloads.
The adapter request/response/event ingest loop works end-to-end inside Runner.
The adapter dispatch boundary can swap mock/http/external providers without changing Runner core logic.
The HTTP provider fails closed when remote worker output is invalid.
The operator can configure dispatch metadata before sending a runtime adapter request.
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

## Current known limitation

The runtime adapter provider layer still uses mock behavior and a hardened HTTP boundary. The Runtime Adapter Panel now makes that boundary configurable, but it still does not execute a real external agent by itself.

The next integration milestone is:

```text
nexus.runtime_adapter_request
→ runtime callback ingest
→ real HTTP runtime adapter endpoint
→ real worker execution
→ nexus.runtime_adapter_response
→ runtime_bridge events
→ gate evidence + artifact refs
→ review report + memory/context packets
```
