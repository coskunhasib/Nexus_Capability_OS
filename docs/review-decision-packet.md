# Review Decision Packet

Review decision packets record how an operator handles candidate run output.

## Fields

```text
decision_id
run_ref
result_ref
decision
reason
source_refs
artifact_refs
trace_refs
operator_ref
recorded_at
```

## Decision values

```text
accept_candidate
reject_candidate
request_changes
use_fallback
```

## Rule

```text
candidate output changes state only through a decision packet
```
