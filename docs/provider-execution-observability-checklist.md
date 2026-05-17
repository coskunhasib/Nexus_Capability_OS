# Provider Execution Observability Checklist

Provider execution needs enough traces to explain what was requested, what ran, what was normalized, and why fallback or review was required.

## Required trace refs

```text
run request ref
provider adapter manifest ref
provider run state ref
normalized result ref
ingest ref
fallback ref
artifact routing ref
```

## Event classes

```text
provider_run_requested
provider_run_prepared
provider_run_started
provider_run_completed
provider_result_normalized
provider_result_ingested
fallback_execution_recorded
manual_review_required
provider_run_blocked
```

## Evaluation checks

```text
source refs preserved
workspace boundary preserved
artifact root preserved
trace refs preserved
review requirement preserved
fallback reason preserved
host acceptance false by default
```

## Acceptance gate

```text
trace refs are complete
event classes are documented
evaluation checks are explicit
```
