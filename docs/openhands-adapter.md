# OpenHands Adapter

The OpenHands adapter adds a safe adapter envelope for handing Nexus Capability OS work to an OpenHands-style coding agent runtime.

This PR does **not** install, launch or call OpenHands. It defines the contract that a real OpenHands runtime can consume later.

## Boundary

```text
nexus.runtime_adapter_request
→ nexus.openhands.work_request
→ operator/runtime execution outside this adapter
→ normalized OpenHands result
→ nexus.runtime_adapter_response
```

## Living code path

```text
server/adapters/openhands-adapter.ts
scripts/verify-openhands-adapter.ts
scripts/verify-oh-adapter.ts
```

NPM script:

```bash
npm run verify:oh-adapter
```

## Work request

The adapter builds:

```text
packet_type: nexus.openhands.work_request
version: 0.1
request_id
target_worker
workspace mode
secret policy
objective
instructions[]
expected_artifacts[]
safety policy
```

Important safety fields:

```text
workspace.secret_policy = do_not_send_secrets
safety.arbitrary_command_execution = false
safety.adapter_invokes_openhands = false
safety.requires_operator_runtime = true
```

## Artifact mapping

Each task packet work-order step becomes:

```text
instruction
expected artifact expectation(s)
```

Expected outputs are mapped to artifact hints and later normalized into runtime artifact refs.

## Result normalization

A completed OpenHands-style result normalizes to:

```text
nexus.runtime_adapter_response
status: accepted
events:
  artifact_created
  step_completed
```

A blocked OpenHands-style result normalizes to:

```text
nexus.runtime_adapter_response
status: failed
events:
  artifact_created
  step_blocked
```

## Verification coverage

`verify:oh-adapter` checks:

```text
work request shape is valid
workspace does not carry secrets
adapter does not invoke OpenHands directly
adapter does not request arbitrary command execution
instructions are derived from work order
artifact expectations are derived from expected outputs
dry run returns runtime adapter response
dry run emits artifact refs
blocked result normalizes to failed runtime response
```

## Current limitation

The adapter is intentionally an envelope/normalization layer only. It does not perform actual code changes, execute shell commands, manage OpenHands containers or call external services.

That execution boundary should remain explicit and operator-controlled.
