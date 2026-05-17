# Decision Gate Policy

## Purpose

Decision gates make controlled local work explicit before an operation is accepted.

A gate records whether the operation is not needed, waiting, granted or denied. The result must be traceable through source refs.

## Gate states

```text
not_required — the operation does not need a gate
do_pending — the operation is waiting for a gate result
do_granted — the operation has a gate result and may continue
do_denied — the operation has a gate result and must not continue
```

## Required trace fields

For granted or denied results:

```text
decided_by
source_ref
```

For denied results:

```text
reason
```

## Rules

```text
not_required allows the operation
do_pending does not allow the operation
do_granted allows only when decided_by and source_ref exist
do_denied never allows and requires reason
gate state must be explicit when a gate is required
```

## Beta verifier expectation

```text
not required gate passes
gate required but pending does not pass
granted gate passes with trace fields
granted gate without trace fields fails
denied gate fails with reason
denied gate without reason fails
```