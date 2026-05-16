# OpenHands Real Integration Plan

This plan describes how to wire a real OpenHands runtime after the safe envelope adapter is already in place.

It does not implement direct runtime invocation. It defines prerequisites, handoff shape, result collection, failure modes and operator approval points.

## Current state

```text
OpenHands envelope adapter: implemented
Direct OpenHands runtime invocation: not implemented
Runtime security policy: implemented
Local controlled worker v2: implemented
```

## Integration principle

```text
OpenHands should be wired as an explicit operator-selected runtime, not as the default worker path.
```

## Prerequisites

Before direct OpenHands invocation is added, the following must be true:

```text
runtime security policy is merged
local controlled worker v2 is merged
operator can choose runtime mode explicitly
OpenHands work request envelope is generated and inspectable
OpenHands result normalization is already verified
failure behavior is documented
```

## Request handoff shape

The existing adapter should remain the source of truth:

```text
nexus.runtime_adapter_request
→ buildOpenHandsWorkRequest
→ nexus.openhands.work_request
→ operator-approved OpenHands runtime call
```

The work request must keep:

```text
workspace.secret_policy = do_not_send_secrets
safety.arbitrary_command_execution = false
safety.adapter_invokes_openhands = false until direct runtime mode is explicitly enabled
safety.requires_operator_runtime = true
```

## Runtime mode proposal

Add a new explicit mode later:

```text
openhands_envelope_only — current behavior
openhands_operator_run — future explicit operator-run mode
openhands_direct_run — future direct invocation mode, only after approval policy exists
```

The first real integration should start with:

```text
openhands_operator_run
```

This means the system prepares the envelope and expects an operator-managed runtime result file or callback.

## Expected result collection

A future OpenHands result collector should accept:

```text
status: completed | blocked
artifacts[]
notes[]
optional diagnostics[]
```

Then normalize with the existing adapter path:

```text
normalizeOpenHandsResult
→ nexus.runtime_adapter_response
→ runtime bridge events
→ artifact registry
→ review hardening
→ memory/context hardening
```

## Artifact expectations

OpenHands output should be mapped back to:

```text
artifact kind
artifact ref
artifact summary
step_id
```

Raw output should not be persisted into memory packets by default.

## Failure modes

```text
runtime unavailable → blocked result
missing artifact → blocked result
invalid result shape → reject and do not mutate Runner state
runtime timeout → blocked result with diagnostics
operator cancellation → blocked result
unexpected output path → reject or quarantine result
```

## Operator approval points

Operator approval is required before:

```text
sending a work request to OpenHands
allowing repository mutation
reading or writing outside the approved workspace
persisting new artifact classes
switching from operator-run to direct-run mode
```

## Verification plan

Future focused checks should cover:

```text
OpenHands envelope generation still passes
operator-run result file normalizes to runtime adapter response
blocked result normalizes to step_blocked
invalid result file is rejected
artifact refs stay bounded to approved workspace
memory/context packets persist only summaries and refs
```

Suggested future script:

```text
verify:openhands-runtime-plan
```

## Implementation steps

```text
1. Add an operator-run result file schema.
2. Add a result reader that validates shape and workspace bounds.
3. Add a dry-run fixture for completed and blocked results.
4. Normalize through existing OpenHands adapter.
5. Add focused verification.
6. Only then consider direct runtime invocation.
```

## Non-goals for first real integration

```text
Do not start with direct background execution.
Do not send secrets in work requests.
Do not bypass runtime adapter response validation.
Do not write outside approved workspace.
Do not persist raw runtime logs into memory/context packets.
```
