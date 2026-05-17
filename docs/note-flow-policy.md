# Note Flow Policy

## Purpose

Note flow defines how durable note candidates move through controlled lifecycle operations.

The goal is to keep note changes traceable, source-backed and compact.

## Operations

```text
create — create a new note candidate
update — create a revised note that replaces an older note
merge — create one consolidated note from multiple older notes
retire — mark a note as stale or retired with a reason
```

## Required fields

Every note produced by the flow must include:

```text
note_id
topic
note_type
summary
source_refs
confidence
status
created_at
last_updated
```

## Source rule

```text
source_refs must not be empty
source_refs must point to observations, artifacts, result files or prior notes
```

## Update rule

```text
update must include the replaced note id
updated note must keep source refs
updated note must set last_updated to the operation timestamp
```

## Merge rule

```text
merge must include at least two replaced note ids
merged note must keep source refs from the merged notes
merged note must list replaced note ids
```

## Retire rule

```text
retire must include a reason
retire must not delete the note
retired note remains traceable
```

## Beta verifier expectation

```text
create with source refs passes
create without source refs fails
update preserves lineage
merge preserves replaced ids
retire requires reason
invalid operations fail closed
```