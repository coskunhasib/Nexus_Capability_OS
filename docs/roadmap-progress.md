# Roadmap Progress

This file is the living implementation tracker for Nexus Capability OS.

Rule:

```text
After each completed PR, update this file:
- move completed item to Done
- update Current state
- update Next recommended item
- reorder Remaining roadmap if needed
- report progress as X/15 completed
```

## Roadmap progress

```text
1/15 completed
Current item: 2/15 — Mock + HTTP provider hardening
Next item: 3/15 — Runtime Adapter Config Panel
```

## Current state

```text
Trial-ready core: strong
Nexus handoff contract: implemented
Runtime bridge contract: implemented
Runtime adapter request/response contract: implemented
Mock adapter-driven Runner loop: implemented
Runtime adapter loop CI verification: implemented
Runtime adapter provider interface: implemented
Mock provider: implemented
HTTP provider skeleton: implemented
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
✅ 1/15 — Adapter Provider Interface
```

## Next recommended item

```text
PR #31 — Mock + HTTP provider hardening
```

Why this is next:

```text
The provider interface now exists and Runner dispatches through it.
The next step is to make the HTTP provider more useful without jumping straight into OpenHands/Codex.
```

Target:

```text
HTTP endpoint config object
request/response schema guard at provider boundary
clear HTTP error mapping
timeout/retry policy baseline
provider health check skeleton
```

Expected files:

```text
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

Status: done

```text
RuntimeAdapterProvider interface
mock provider
http provider skeleton
provider verification script
Runner dispatch through selected provider
```

### 2. Mock + HTTP provider hardening

Status: next

```text
HTTP endpoint config
request/response validation at provider boundary
clear error mapping
basic timeout/retry policy
provider health check skeleton
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

### Later backlog

```text
Local Agent Worker Adapter
Security / Permissions Model
Error / Retry / Timeout Policy expansion
Idempotency + Duplicate Event Handling
Observability / Eval Dashboard
Workspace / Team Layer
Marketplace / Capability Pack Catalog
Commercial Packaging
```

## Current priority stack

```text
1. Adapter Provider Interface — done
2. Mock + HTTP provider hardening — next
3. Runtime Adapter Config Panel
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
