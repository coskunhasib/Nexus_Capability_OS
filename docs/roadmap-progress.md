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
5/15 completed
Current item: 6/15 — Event Store + Replay
Next item: 7/15 — Runtime Timeline UI
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
HTTP provider: hardened boundary implemented
Runtime adapter config panel: implemented
Runtime callback ingest: implemented
Runtime job state model: implemented
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
✅ 2/15 — Mock + HTTP provider hardening
✅ 3/15 — Runtime Adapter Config Panel
✅ 4/15 — Runtime Callback Ingest
✅ 5/15 — Job State Model
```

## Next recommended item

```text
PR #35 — Event Store + Replay
```

Why this is next:

```text
Runtime job state now exists in the core runtime adapter layer.
The next step is to store ordered runtime events separately and replay them deterministically.
```

Target:

```text
event store entries
source: adapter_response / callback
received_at
raw event log
ordered replay
duplicate tracking
replay summary
```

Expected files:

```text
src/runtimeEventStore.ts
scripts/verify-runtime-adapter-loop.ts
docs/verification-contract.md update
```

Expected NPM script:

```text
verify:adapter-loop
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

Status: done

```text
HTTP endpoint config
response validation at provider boundary
clear provider error mapping
basic timeout/retry policy
provider health check skeleton
```

### 3. Runtime Adapter Config Panel

Status: done

```text
provider selector
endpoint_url
healthcheck_url
timeout_ms
retry policy
priority
callback_url
idempotency_key
dry_run / mock / real mode
health check action
operator_notes
request/response export after configured dispatch
```

### 4. Runtime Callback Ingest

Status: done

```text
nexus.runtime_callback payload
callback validation boundary
append-later runtime event path
idempotent event application
manual callback simulation action
replay duplicate detection
```

### 5. Job State Model

Status: done

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
callback counters
seen_event_keys[]
```

Note:

```text
Core job state model is implemented and CI-covered.
Panel-level job state display/export is deferred to the smaller-file event/timeline UI work.
```

### 6. Event Store + Replay

Status: next

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
2. Mock + HTTP provider hardening — done
3. Runtime Adapter Config Panel — done
4. Runtime callback ingest — done
5. Job state model — done
6. Event store + replay — next
7. Event timeline UI
8. Artifact registry
9. Adapter trials
10. Local HTTP worker skeleton
11. Real worker vertical slice
12. OpenHands adapter
13. Codex / Claude Code adapter
14. Security / permissions
15. Observability / workspace / marketplace / commercial layers
```
