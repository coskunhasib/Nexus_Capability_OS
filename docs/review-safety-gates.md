# Review Safety Gates

Review gates keep candidate provider output separate from accepted host state.

## Gates

```text
review_packet_gate
operator_ref_gate
source_ref_gate
trace_ref_gate
artifact_ref_gate
disposition_gate
closed_state_gate
```

## Rules

```text
review packet is required
operator ref is required
source refs are required
trace refs are required
artifact disposition is recorded separately
closed state is terminal
```
