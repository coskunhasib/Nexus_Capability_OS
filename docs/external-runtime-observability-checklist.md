# External Runtime Observability Checklist

External runtime mapping must be observable enough to debug provider behavior without trusting provider-native logs as the system of record.

## Required trace refs

```text
host request ref
external call packet ref
provider adapter manifest ref
provider capability matrix ref
normalized result ref
fallback policy ref
```

## Required event classes

```text
external_mapping_requested
provider_adapter_selected
external_call_prepared
external_call_completed
external_result_normalized
fallback_policy_checked
manual_review_requested
external_mapping_blocked
```

## Evaluation checklist

```text
source refs preserved
artifact refs bounded
workspace boundary preserved
tool grants preserved
fallback path recorded
blocked reason recorded
partial reason recorded
manual review state recorded
```

## Acceptance gate

```text
trace refs are present
key event classes are documented
evaluation checklist exists
provider-native logs are not the source of truth
```
