# OpenHands Operator-Run Result Ingestion

This document describes the operator-run result ingestion path for OpenHands-style results.

The integration accepts a small result file provided by the operator and normalizes it through the existing OpenHands adapter response path.

## Boundary

```text
operator-provided result file
→ validate OpenHands operator-run result shape
→ validate request_id match
→ normalizeOpenHandsOperatorRunResult
→ normalizeOpenHandsResult
→ nexus.runtime_adapter_response
```

## Living code path

```text
server/adapters/openhands-result-ingestion.ts
scripts/verify-openhands-result-ingest.ts
samples/operator-run-results/openhands-completed.sample.json
samples/operator-run-results/openhands-blocked.sample.json
```

NPM script:

```bash
npm run verify:oh-result-ingest
```

## Result file shape

```text
packet_type: nexus.openhands.operator_run_result
version: 0.1
request_id
source_adapter: openhands
operator_run_id
status: completed | blocked
artifacts[]
notes[]
diagnostics[] optional
created_at
```

Artifact shape:

```text
step_id
kind
ref
summary
```

## Verification coverage

The focused verifier checks:

```text
completed fixture shape is valid
blocked fixture shape is valid
completed fixture normalizes to runtime adapter response
blocked fixture normalizes to runtime adapter response
completed result is accepted
completed result emits artifact refs
blocked result becomes failed response with step_blocked event
request_id mismatch is rejected
```

## Safety boundary

```text
No external runtime is invoked by this ingestion path.
No commands are executed.
The result file must match the expected shape.
request_id must match the runtime adapter request.
Invalid results fail before runtime state mutation.
```

## Current limitation

This path proves operator-run result normalization only. It does not yet provide a shared result-file guard for all adapter types; that is planned as item 35.
