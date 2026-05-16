# Code Agent Adapter

The code agent adapter defines a safe envelope and result-normalization layer for Codex and Claude Code style coding-agent runtimes.

This layer does **not** launch external agents, execute commands, edit repositories or send secrets. It prepares an explicit work request and normalizes operator/runtime results back into the Nexus runtime adapter response contract.

## Boundary

```text
nexus.runtime_adapter_request
→ nexus.code_agent.work_request
→ operator/runtime execution outside this adapter
→ normalized code-agent result
→ nexus.runtime_adapter_response
```

## Living code path

```text
server/adapters/code-agent-adapter.ts
scripts/verify-ca-adapter.ts
```

NPM script:

```bash
npm run verify:ca-adapter
```

## Supported agent kinds

```text
codex
claude-code
```

The adapter keeps the agent kind explicit so downstream runtime configuration can choose the appropriate external tool later.

## Work request

The adapter builds:

```text
packet_type: nexus.code_agent.work_request
version: 0.1
request_id
agent_kind
target_worker
workspace mode
secret policy
objective
prompt_sections[]
expected_artifacts[]
safety policy
```

Important safety fields:

```text
workspace.secret_policy = do_not_send_secrets
safety.arbitrary_command_execution = false
safety.adapter_invokes_agent = false
safety.requires_operator_runtime = true
```

## Prompt and artifact mapping

Each task packet work-order step becomes:

```text
prompt section
expected artifact expectation(s)
```

Expected outputs are mapped to artifact hints and later normalized into runtime artifact refs.

## Result normalization

A completed code-agent-style result normalizes to:

```text
nexus.runtime_adapter_response
status: accepted
events:
  artifact_created
  step_completed
```

A blocked code-agent-style result normalizes to:

```text
nexus.runtime_adapter_response
status: failed
events:
  artifact_created
  step_blocked
```

## Verification coverage

`verify:ca-adapter` checks:

```text
codex work request shape is valid
claude-code work request shape is valid
workspace does not carry secrets
adapter does not invoke code agents directly
adapter does not request arbitrary command execution
prompt sections are derived from work order
artifact expectations are derived from expected outputs
dry runs return runtime adapter responses
dry runs emit artifact refs
blocked result normalizes to failed runtime response
```

## Current limitation

The adapter is intentionally an envelope/normalization layer only. It does not call Codex, Claude Code, local CLIs, remote APIs or any external execution service.

The execution boundary must remain explicit and operator-controlled.
