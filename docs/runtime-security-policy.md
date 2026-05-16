# Runtime Security Policy

This policy defines the default safety boundary for Nexus Capability OS runtime work.

It applies to:

```text
local HTTP worker
minimum real worker slice
future local controlled worker v2
external agent adapter envelopes
runtime callback ingestion
artifact and memory/context handling
```

## Core principle

```text
Runtime work must be explicit, bounded, inspectable and reversible by default.
```

## Trust boundaries

```text
Capability OS UI and compiler: trusted to prepare packets.
Runtime adapter provider: trusted only after schema validation.
Local HTTP worker: semi-trusted boundary, must validate input and fail closed.
External agent runtimes: untrusted until their output is normalized and validated.
Memory/context packets: durable state, must receive summaries and references rather than raw payloads.
```

## Sensitive data handling

```text
Work request envelopes must not include credentials, tokens, private keys or unrelated personal data.
Operator-provided values that look sensitive should stay outside generated memory/context packets.
Runtime callbacks should be summarized before durable storage.
Adapter docs must state whether an integration needs credentials and where the operator configures them.
```

## Allowed worker actions

Default allowed action set:

```text
write_step_artifact
```

Expansion rule:

```text
Any new action must be named, documented, verified and intentionally wired into the worker.
```

New worker actions must define:

```text
action name
input shape
output shape
allowed output directory
runtime events produced
failure behavior
verification script
```

## Output directory policy

```text
Worker outputs must be written to a bounded directory.
Artifact refs must point to generated outputs, not arbitrary host paths.
Artifact summaries should be compact and safe to persist.
Generated files should be deterministic in tests when possible.
```

## Artifact policy

```text
Runtime artifacts should be referenced by artifact id/ref/kind/summary.
Raw artifact content should not be copied into memory packets by default.
Review and memory layers should use artifact summaries and refs.
```

## Callback policy

```text
Runtime callbacks must validate packet_type, request_id, job_id, provider_id and event list shape.
Duplicate callback events must be deduped.
Rejected callbacks must not mutate Runner state.
Callbacks should update job state through the event ingest path, not by bypassing it.
```

## External runtime policy

External runtime wiring must stay behind explicit operator choice.

Before direct external runtime invocation is added, the repo must have:

```text
runtime security policy merged
local controlled worker v2 merged or explicitly deferred
operator approval points documented
failure modes documented
response normalization documented
focused verification for the integration
```

External adapters must keep these defaults:

```text
adapter does not invoke the external runtime directly unless the operator selects that mode
work request envelope excludes sensitive values by default
result normalization validates completed and blocked outcomes
unrecognized output fails closed
```

## Operator approval points

Operator approval is required before:

```text
sending work to an external runtime
allowing repository mutation actions
enabling network-exposed development server mode
persisting new classes of runtime output
adding new worker actions beyond the current allowlist
```

## Default failure behavior

```text
Invalid request shape: reject with clear error.
Unknown route: reject with clear error.
Unknown provider: reject with clear error.
Invalid runtime response: reject with clear error.
Blocked external result: normalize to failed runtime adapter response with step_blocked event.
Missing artifact: keep blocker/open question rather than inventing evidence.
```

## Verification expectations

The following checks must remain part of the authoritative chain:

```bash
npm run verify:local-worker
npm run verify:real-worker
npm run verify:oh-adapter
npm run verify:ca-adapter
npm run verify:adapter-loop
npm run verify:adapter-provider
npm run verify:review-hardening
npm run verify:memory-context
```

## Current non-goals

```text
No unrestricted shell execution.
No automatic external runtime invocation.
No default repository mutation worker action.
No raw runtime log persistence into memory/context packets.
No network-exposed dev mode as the default.
```
