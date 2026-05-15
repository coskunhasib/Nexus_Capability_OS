# Roadmap Progress

This file is the living implementation tracker for Nexus Capability OS.

Rule:

```text
After each completed PR, update this file:
- move completed item to Done
- update Current state
- update Next recommended item
- reorder Remaining roadmap if needed
```

## Current state

```text
Trial-ready core: strong
Nexus handoff contract: implemented
Runtime bridge contract: implemented
Runtime adapter request/response contract: implemented
Mock adapter-driven Runner loop: implemented
Runtime adapter loop CI verification: implemented
Real external worker execution: not implemented yet
```

## Done

```text
✅ Capability registry
✅ Skill registry
✅ Skill research reviews
✅ Skill-aware Runner
✅ Skill-aware Review / Memory / Context
✅ 5 automatic skill trials
✅ Trial Results Dashboard
✅ Nexus Handoff usability verification
✅ Nexus Runtime Bridge verification
✅ Runtime Bridge dashboard
✅ Snapshot sync completeness
✅ CI workflow cleanup
✅ View code splitting
✅ Bundle budget guard
✅ Deterministic npm ci install
✅ Generated artifact drift guard
✅ Untracked generated artifact guard
✅ CI summary
✅ Verification contract documentation
✅ Runtime adapter request/response schemas
✅ Runtime adapter request/response samples
✅ Runtime adapter boundary validation
✅ Mock Runtime Adapter helper
✅ Runtime Adapter Panel in Runner
✅ Adapter request → response → events → Runner state ingest
✅ Runtime adapter loop verification
```

## Next recommended item

```text
PR #30 — Add runtime adapter provider interface
```

Why this is next:

```text
The adapter loop works, but it is still directly coupled to runMockRuntimeAdapter().
Before adding HTTP/OpenHands/Codex/Claude Code adapters, the adapter boundary needs a provider interface.
```

Target shape:

```ts
export type RuntimeAdapterProvider = {
  id: string;
  label: string;
  mode: 'mock' | 'http' | 'external';
  dispatch(request: RuntimeAdapterRequest): Promise<RuntimeAdapterResponse>;
};
```

Minimum providers:

```text
mock provider
http provider skeleton
```

Expected files:

```text
src/runtimeAdapterProvider.ts
src/runtimeAdapters/mockRuntimeAdapterProvider.ts
src/runtimeAdapters/httpRuntimeAdapterProvider.ts
scripts/verify-runtime-adapter-provider.ts
docs/verification-contract.md update
```

Expected NPM script:

```text
verify:adapter-provider
```

## Remaining roadmap

### 1. Adapter Provider Interface

Status: next

```text
RuntimeAdapterProvider interface
mock provider
http provider skeleton
provider verification script
```

### 2. HTTP Runtime Adapter

Status: pending

```text
runtime_adapter_request
→ HTTP POST
→ runtime_adapter_response
→ runtime_bridge events
→ Runner ingest
```

Needed:

```text
endpoint_url
auth mode
timeout
retry policy
provider id
```

### 3. Runtime Adapter Config Panel

Status: pending

```text
provider
endpoint
timeout
priority
callback url
idempotency key
dry_run / mock / real mode
```

### 4. Runtime Callback Ingest

Status: pending

Current behavior:

```text
response contains events directly
Runner ingests those events immediately
```

Target behavior:

```text
dispatch
→ accepted
→ later callback: step_started
→ later callback: gate_checked
→ later callback: artifact_created
→ later callback: step_completed
```

### 5. Job State Model

Status: pending

Needed model:

```text
job_id
request_id
provider_id
target_worker
status
started_at
last_event_at
events[]
artifacts[]
errors[]
```

### 6. Event Store + Replay

Status: pending

```text
events[]
timeline
raw event log
event replay
```

### 7. Runtime Timeline UI

Status: pending

```text
request created
adapter accepted
step started
gate checked
artifact created
step completed
blocked
failed
```

### 8. Artifact Registry / Artifact Refs

Status: pending

```text
artifact_id
kind
uri/ref
created_by
step_id
checksum optional
summary
metadata
```

### 9. Review Report Hardening

Status: pending

Separate:

```text
human-entered evidence
runtime-reported evidence
artifact-backed evidence
missing evidence
failed gates
release blockers
```

### 10. Memory / Context Packet Hardening

Status: pending

Include:

```text
accepted decisions
runtime blockers
artifact summaries
open questions
next run context
provider/job metadata
```

### 11. Adapter Trials

Status: pending

New trial layer:

```text
adapter_trial
```

Expected checks:

```text
provider selection
request generation
dispatch
response handling
event ingest
artifact refs
review output
memory/context output
```

### 12. Local HTTP Worker Server Skeleton

Status: pending

Endpoints:

```text
POST /runtime/dispatch
POST /runtime/callbacks
GET /runtime/jobs/:job_id
```

### 13. Minimum Real Worker Vertical Slice

Status: pending

```text
web-saas-mvp trial
→ compiler
→ task packet
→ adapter request
→ local HTTP worker
→ worker fake file artifact produces
→ callback event returns
→ Runner ingest
→ review report
```

### 14. OpenHands Adapter

Status: pending

```text
runtime_adapter_request
→ OpenHands task/session
→ repo/context input
→ OpenHands execution
→ files/tests/logs
→ runtime_bridge events
→ artifact refs
```

### 15. Codex / Claude Code Adapter

Status: pending

```text
same RuntimeAdapterProvider interface
different provider implementation
```

### 16. Local Agent Worker Adapter

Status: pending

```text
local LLM
shell worker
Python worker
CAD/script worker
browser worker
file worker
```

### 17. Security / Permissions Model

Status: pending

```text
read files
write files
run shell
network access
repo access
secrets access
artifact upload
callback permission
```

### 18. Error / Retry / Timeout Policy

Status: pending

```text
timeout
worker unavailable
invalid response
schema mismatch
partial event stream
duplicate callback
stale job
retryable error
non-retryable error
```

### 19. Idempotency + Duplicate Event Handling

Status: pending

```text
event_id
idempotency_key
dedupe policy
last_processed_event
event ordering
```

### 20. Observability / Eval Dashboard

Status: pending

```text
success rate
failed gates
missing evidence trend
adapter latency
worker failure rate
artifact count
trial pass/fail history
```

### 21. Workspace / Team Layer

Status: later

```text
workspace
project
team members
roles
permissions
runs
jobs
artifacts
history
```

### 22. Marketplace / Capability Pack Catalog

Status: later

```text
pack select
provider select
trial run
result compare
```

### 23. Commercial Packaging

Status: later

```text
local plan
cloud plan
team plan
enterprise/self-hosted
adapter marketplace
capability pack marketplace
```

## Current priority stack

```text
1. Adapter Provider Interface
2. Mock + HTTP provider
3. Provider verification
4. Runtime callback ingest
5. Job state model
6. Event timeline UI
7. Artifact registry
8. Adapter trials
9. Local HTTP worker skeleton
10. Real worker vertical slice
11. OpenHands adapter
12. Codex / Claude Code adapter
13. Security / permissions
14. Observability
15. Workspace / marketplace / commercial layers
```
