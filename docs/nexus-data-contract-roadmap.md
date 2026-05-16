# Nexus Data Contract Roadmap

This roadmap exists because the current repo does not yet know the full real Nexus data model.

The next implementation phase must not guess detailed Nexus data. It should first discover, model and verify the minimum canonical data contract that Nexus needs to accept operator-run results safely.

## Core correction

```text
Do not implement Nexus result ingestion by guessing hidden Nexus data.
Do not treat a third-party runtime as the center of the design.
Treat Nexus as the integration owner.
Build an explicit Nexus data contract first.
```

## Current known data surfaces

The repo already has several local surfaces that can inform the contract:

```text
TaskPacket
RuntimeAdapterRequest
RuntimeAdapterResponse
RuntimeBridgeEvent
RuntimeArtifactRegistry
HardenedReviewReport
MemoryUpdatePacket
ContextUpdatePacket
ControlledWorkerManifest
```

These are useful, but they are not the same thing as the full real Nexus data model.

## Unknowns to resolve

Before implementing result ingestion, define these fields explicitly:

```text
Nexus run id / task id identity
request id ownership
source id / adapter id vocabulary
step id vocabulary
artifact reference model
artifact storage boundary
status vocabulary
blocked / failed / completed semantics
diagnostics vocabulary
operator notes boundary
memory/context carry-forward rules
what must never be stored
```

## Proposed sequence

```text
33. Nexus data contract discovery
34. Nexus canonical result envelope
35. Nexus result ingestion prototype
36. Shared result guard and fixtures
37. Code Agent / custom agent mapping
38. First runtime wiring decision PR
```

This replaces the previous 33-36 implementation order.

## 33. Nexus data contract discovery

Objective:

```text
Inventory all existing Nexus-facing types and samples.
Identify which fields are canonical, derived, temporary or UI-only.
Document unknowns without inventing data.
```

Expected output:

```text
docs/nexus-data-contract-inventory.md
```

Should include:

```text
existing type / file path
field name
field purpose
required / optional
source of truth
known sample value
risk / unknown note
```

Verification:

```bash
npm run build
npm run check:generated
```

## 34. Nexus canonical result envelope

Objective:

```text
Define the smallest stable result envelope Nexus can accept from an operator-run process.
```

Expected output:

```text
schemas/nexus-operator-result.schema.json optional
docs/nexus-operator-result-contract.md
samples/operator-run-results/nexus-completed.sample.json
samples/operator-run-results/nexus-blocked.sample.json
```

Minimum fields should be proposed only after discovery:

```text
packet_type
version
nexus_run_id or request_id
source
status
artifacts
notes
diagnostics
created_at
```

But exact field names should be finalized after item 33.

Verification:

```text
validate sample fixtures
reject missing identity fields
reject unknown status values
```

## 35. Nexus result ingestion prototype

Objective:

```text
Normalize a validated Nexus operator result into nexus.runtime_adapter_response.
```

Expected files:

```text
server/adapters/nexus-result-ingestion.ts
scripts/verify-nexus-result-ingest.ts
docs/nexus-result-ingestion.md
```

Expected behavior:

```text
completed result → accepted runtime adapter response
blocked result → failed runtime adapter response with step_blocked event
request identity mismatch → reject before state mutation
invalid artifact refs → reject before state mutation
```

Verification script:

```bash
npm run verify:nexus-result-ingest
```

## 36. Shared result guard and fixtures

Objective:

```text
Centralize reusable guard logic for operator-run result files.
```

Expected files:

```text
server/adapters/operator-result-guard.ts
scripts/verify-operator-result-guard.ts
docs/operator-result-guard.md
```

Guard should verify:

```text
packet_type
version
identity field
source field
status vocabulary
artifact array shape
artifact ref boundary
notes / diagnostics shape
created_at shape
```

Verification script:

```bash
npm run verify:operator-result-guard
```

## 37. Code Agent / custom agent mapping

Objective:

```text
Map code-agent or custom-agent output into the Nexus canonical result envelope instead of creating a separate primary format.
```

Expected behavior:

```text
agent-specific output
→ adapter mapping
→ Nexus canonical result envelope
→ shared guard
→ runtime adapter response
```

Expected files:

```text
server/adapters/code-agent-result-mapping.ts
scripts/verify-code-agent-result-mapping.ts
docs/code-agent-result-mapping.md
```

Verification script:

```bash
npm run verify:code-agent-result-mapping
```

## 38. First runtime wiring decision PR

Objective:

```text
Decide whether to wire direct runtime mode, operator-run ingestion only, or local controlled worker expansion first.
```

Decision inputs:

```text
nexus data contract inventory
canonical result envelope
Nexus result ingestion prototype
shared result guard
code-agent/custom-agent mapping
runtime security policy
UI runtime implementation state
```

Recommended default:

```text
Keep operator-run ingestion as the first real integration path.
Avoid direct runtime mode until the Nexus data contract has stable fixtures and guards.
```

## Structure changes to prepare

The repo should move toward this structure:

```text
schemas/
  nexus-operator-result.schema.json
samples/operator-run-results/
  nexus-completed.sample.json
  nexus-blocked.sample.json
server/adapters/
  nexus-result-ingestion.ts
  operator-result-guard.ts
  code-agent-result-mapping.ts
scripts/
  verify-nexus-result-ingest.ts
  verify-operator-result-guard.ts
  verify-code-agent-result-mapping.ts
docs/
  nexus-data-contract-inventory.md
  nexus-operator-result-contract.md
  nexus-result-ingestion.md
  operator-result-guard.md
  code-agent-result-mapping.md
```

## Migration rule

```text
Any existing third-party-specific roadmap item must become secondary to the Nexus canonical result envelope.
Third-party and custom-agent outputs should map into Nexus, not define Nexus.
```

## Acceptance criteria for this roadmap

This roadmap is complete when:

```text
Active backlog no longer requires guessing detailed Nexus data.
Nexus data discovery is the next implementation item.
The result ingestion path is framed around Nexus-owned contracts.
Third-party tools are treated as optional mappings, not the source of truth.
```
