# Workspace Boundary Policy

## Purpose

Workspace boundary validation makes tool grants testable before controlled local execution expands.

The boundary is not a permission UI. It is a deterministic contract that decides whether a proposed read, write or artifact output path is inside the allowed workspace envelope.

## Boundary fields

```text
allowed_read_paths
allowed_write_paths
blocked_paths
artifact_output_root
```

## Rule priority

```text
blocked paths override allow rules
artifact outputs must stay under artifact_output_root
reads must stay under allowed_read_paths
writes must stay under allowed_write_paths
empty write allowlist means no workspace writes
```

## Normalization rule

```text
paths are normalized before evaluation
leading ./ is ignored
backslashes are treated as slashes
parent directory traversal is rejected
empty paths are rejected
```

## Read rules

```text
read allowed if path is under allowed_read_paths
read denied if path is under blocked_paths
read denied if allowed_read_paths is empty
```

## Write rules

```text
write allowed if path is under allowed_write_paths
write denied if path is under blocked_paths
write denied if allowed_write_paths is empty
```

## Artifact output rules

```text
artifact output allowed if path is under artifact_output_root
artifact output denied if path is under blocked_paths
artifact output denied if artifact_output_root is empty
```

## Beta verifier expectation

```text
valid read path is accepted
blocked read path is rejected
write path is rejected when write allowlist is empty
valid artifact output path is accepted
artifact output outside root is rejected
path traversal is rejected
blocked path override is proven
```