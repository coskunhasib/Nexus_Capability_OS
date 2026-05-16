# Code Agent Real Integration Plan

This plan describes how to wire real code-agent runtimes after the safe code-agent envelope adapter is already in place.

It does not implement direct runtime invocation. It defines prerequisites, handoff shape, result collection, failure modes and operator approval points.

## Current state

```text
Code agent envelope adapter: implemented
Supported envelope agent kinds: codex, claude-code
Direct runtime invocation: not implemented
Runtime security policy: implemented
Local controlled worker v2: implemented
```

## Integration principle

```text
Code-agent runtimes should be selected explicitly by the operator and should not become the default worker path.
```

## Prerequisites

Before direct invocation is added, the following must be true:

```text
runtime security policy is merged
local controlled worker v2 is merged
operator can choose the target agent kind explicitly
code-agent work request envelope is generated and inspectable
completed and blocked result normalization is verified
failure behavior is documented
```

## Request handoff shape

The existing adapter should remain the source of truth:

```text
nexus.runtime_adapter_request
→ buildCodeAgentWorkRequest
→ nexus.code_agent.work_request
→ operator-approved code-agent runtime call
```

The work request must keep:

```text
workspace.secret_policy = do_not_send_secrets
safety.arbitrary_command_execution = false
safety.adapter_invokes_agent = false until direct runtime mode is explicitly enabled
safety.requires_operator_runtime = true
```

## Runtime mode proposal

Add explicit modes later:

```text
code_agent_envelope_only — current behavior
code_agent_operator_run — future explicit operator-run mode
code_agent_direct_run — future direct invocation mode, only after approval policy exists
```

The first real integration should start with:

```text
code_agent_operator_run
```

This means the system prepares the envelope and expects an operator-managed runtime result file or callback.

## Agent kind selection

The adapter already supports explicit agent kinds:

```text
codex
claude-code
```

Future UI/runtime config should expose this as a deliberate choice rather than hidden routing.

## Expected result collection

A future result collector should accept:

```text
agent_kind
status: completed | blocked
artifacts[]
notes[]
optional diagnostics[]
```

Then normalize through the existing adapter path:

```text
normalizeCodeAgentResult
→ nexus.runtime_adapter_response
→ runtime bridge events
→ artifact registry
→ review hardening
→ memory/context hardening
```

## Artifact expectations

Code-agent output should be mapped back to:

```text
artifact kind
artifact ref
artifact summary
step_id
agent_kind
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
unsupported agent kind → reject before dispatch
```

## Operator approval points

Operator approval is required before:

```text
sending a work request to a code-agent runtime
allowing repository mutation
reading or writing outside the approved workspace
persisting new artifact classes
switching from operator-run to direct-run mode
adding a new supported agent kind
```

## Verification plan

Future focused checks should cover:

```text
code-agent envelope generation still passes
operator-run result file normalizes to runtime adapter response
blocked result normalizes to step_blocked
invalid result file is rejected
artifact refs stay bounded to approved workspace
unsupported agent kind fails closed
memory/context packets persist only summaries and refs
```

Suggested future script:

```text
verify:code-agent-runtime-plan
```

## Implementation steps

```text
1. Add an operator-run result file schema.
2. Add a result reader that validates shape, agent kind and workspace bounds.
3. Add completed and blocked fixture results for each supported agent kind.
4. Normalize through existing code-agent adapter.
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
Do not hide agent kind selection from the operator.
```
