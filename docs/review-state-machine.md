# Review State Machine

Review state tracks candidate run output from queued review to disposition.

## States

```text
review_queued
reviewing
changes_requested
fallback_selected
candidate_rejected
candidate_accepted
closed
```

## Rule

```text
closed is terminal
candidate_accepted requires a decision packet
fallback_selected requires a decision packet
```
