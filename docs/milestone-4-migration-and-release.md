# Milestone 4 Migration and Release Notes

## Migration path

```text
1. Keep local controlled runtime primary.
2. Keep external mapping disabled by default.
3. Register provider adapter manifests as optional metadata.
4. Validate external call packets before provider use.
5. Normalize provider output before host review.
6. Apply fallback policy for unavailable, incomplete, or blocked provider outcomes.
7. Preserve Milestone 3 host, storage, permission, UI, and configuration boundaries.
```

## Release notes

```text
Milestone 4 adds external runtime mapping contracts.
Provider adapters remain optional.
Provider capability declarations do not grant permission.
External calls require host-approved grants, workspace boundary, source refs, artifact root, and fallback ref.
External results require normalization before host review.
Fallback policy keeps local controlled runtime available.
```

## Release gates

```text
provider adapter manifest validates
external call packet validates
external result normalization validates
external fallback policy validates
provider capability matrix exists
security and permission hardening documented
observability checklist exists
CI is green
```

## Next milestone

```text
Milestone 5 — Runtime Provider Execution Slice
```
