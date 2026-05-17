# Agent / Sub-agent Delegation Model

This document completes item 37 at the design-contract level.

Agent and sub-agent are not separate labels for style. They create ownership, scope, context and permission boundaries.

## Agent

Use an agent for:

```text
major role ownership
cross-step responsibility
planning authority
review authority
longer context ownership
accountability for final output
```

Agent shape:

```text
agent_id
profile
role
owned_scope
responsibilities[]
allowed_skill_refs[]
default_tool_policy
memory_access_policy
context_access_policy
evaluation_responsibility
```

## Sub-agent

Use a sub-agent for:

```text
narrow delegated work
bounded research
bounded verification
parallel investigation
permission isolation
context isolation
risk isolation
```

Sub-agent shape:

```text
sub_agent_id
parent_agent_id
scope
allowed_tools[]
active_context_ref
expected_output
handoff_format
expires_after
```

## Delegation rules

A sub-agent should be created only if at least one is true:

```text
the work can be isolated from parent context
the work needs narrower permissions
the work is specialized verification
the work can run in parallel
the work is risky and should be sandboxed
```

Do not create a sub-agent when:

```text
the task is simple
the same agent can safely do it
the only reason is naming or aesthetics
it would duplicate context without isolation benefit
```

## Handoff contract

Sub-agent output should be compact:

```text
sub_agent_id
scope
result_status
summary
artifact_refs[]
observations[]
open_questions[]
recommended_memory_notes[]
```

## Permission inheritance

```text
Sub-agents do not inherit all parent permissions by default.
A sub-agent receives explicit bounded grants.
```

## Context inheritance

```text
Sub-agents receive a smaller active context bundle.
Raw parent context is not copied wholesale.
```

## Evaluation

Parent agent remains accountable for:

```text
accepting or rejecting sub-agent output
checking evidence quality
integrating useful results
marking output as insufficient
```

## Anti-patterns

```text
sub-agent swarm with no ownership
sub-agent with full parent permissions
sub-agent with full parent context
sub-agent outputs stored directly as memory without distillation
no parent review of sub-agent work
```

## Future implementation files

```text
schemas/agent-profile.schema.json
schemas/sub-agent-delegation.schema.json
src/agentDelegationModel.ts
samples/agents/*.json
scripts/verify-agent-delegation-model.ts
```

## Item 37 completion

This item is complete at design-contract level when agent ownership, sub-agent scope, permission inheritance and handoff rules are documented.
