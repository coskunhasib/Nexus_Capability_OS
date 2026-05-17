# Review Artifact Disposition

Artifact disposition records the review outcome for candidate artifacts.

## Fields

```text
disposition_id
artifact_ref
run_ref
result_ref
decision_ref
disposition
reason
source_refs
trace_refs
```

## Values

```text
keep_candidate
request_revision
use_fallback_result
accept_after_review
reject_candidate
```

## Rule

```text
candidate artifacts keep candidate status until disposition is recorded
```
