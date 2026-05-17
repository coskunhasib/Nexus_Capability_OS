# Artifact Lifecycle Policy

## Purpose

Artifact lifecycle makes runtime artifacts traceable beyond simple collection.

The registry already dedupes artifact refs. Beta adds lifecycle status and transition rules so artifacts can move through controlled states without losing source refs.

## Lifecycle statuses

```text
draft — artifact candidate exists but is not yet accepted for runtime use
active — artifact is accepted and can support observations/reviews
retained — artifact is kept as durable evidence or release support
retired — artifact is no longer current but remains traceable
rejected — artifact is not accepted for runtime use
```

## Required artifact fields

```text
artifact_id
kind
ref
summary
source_refs
status
created_at
updated_at
```

## Transition rules

```text
draft → active
draft → rejected
active → retained
active → retired
retained → retired
```

Not allowed:

```text
rejected → active
retired → active
retained → active
active → draft
```

## Source ref rule

Every lifecycle artifact must carry at least one source ref.

Source refs may point to:

```text
runtime event id
operator-run result id
controlled worker action id
artifact manifest ref
review/evaluation evidence ref
```

## Retirement rule

Retiring an artifact requires a reason.

```text
retired artifacts remain traceable
retired artifacts must not disappear from history
retirement reason must be non-empty
```

## Rejection rule

Rejecting an artifact requires a reason.

```text
rejected artifacts are not used as accepted evidence
rejected artifacts remain traceable for audit
rejection reason must be non-empty
```

## Beta verifier expectation

```text
valid lifecycle artifact is accepted
valid transitions are accepted
invalid transitions are rejected
missing source refs are rejected
retire/reject without reason is rejected
summary counts by status are produced
```