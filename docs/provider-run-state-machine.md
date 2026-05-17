# Provider Run State Machine

The provider run state machine tracks a bounded mock provider execution from host-reviewed request to normalized result or fallback.

## States

```text
prepared
started
provider_running
normalizing_result
manual_review_required
fallback_ready
completed
blocked
```

## Required transition rules

```text
prepared can move to started
started can move to provider_running
provider_running can move to normalizing_result
normalizing_result can move to manual_review_required
manual_review_required can move to completed or fallback_ready
fallback_ready can move to completed or blocked
blocked is terminal
completed is terminal
```

## Acceptance gate

```text
states are explicit
terminal states are explicit
manual review is part of the path
fallback is part of the path
blocked state is explainable
```
