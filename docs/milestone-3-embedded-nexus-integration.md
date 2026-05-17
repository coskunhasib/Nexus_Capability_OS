# Milestone 3 — Embedded Nexus Integration

## Goal

Prepare Capability Runtime to live as an embedded Nexus subsystem.

Milestone 3 defines boundaries and integration shape. It does not replace the local and controlled verification path.

## Baseline

```text
Milestone 1 — Capability Runtime Alpha: documented
Milestone 2 — Controlled Runtime Beta: closed by checklist
Milestone 3 — Embedded Nexus Integration: next
Milestone 4 — External Runtime Mapping: later
```

## Scope

```text
Nexus host boundary
Capability Runtime package boundary
storage boundary
permission boundary
UI mount point
configuration surface
migration path from repo scaffold to embedded subsystem
host-to-runtime fixtures
runtime-to-host fixtures
release notes
```

## Non-goals

```text
no cloud productization requirement
no marketplace requirement
no billing/workspace expansion requirement
no dependency on a specific third-party runtime
no removal of local controlled checks
```

## Host boundary

Define:

```text
host request shape
runtime response shape
required fields
optional fields
blocked or partial result shape
observation return shape
artifact ref return shape
```

Expected files:

```text
docs/nexus-host-runtime-boundary.md
samples/nexus-host-integration/host-request.sample.json
samples/nexus-host-integration/runtime-response.sample.json
scripts/verify-nexus-host-boundary.ts
```

## Package boundary

Define groups:

```text
core contracts
runtime mapping
verification helpers
read-only UI panel
sample fixtures
scaffold app shell
```

## Storage boundary

Separate:

```text
trace refs
memory notes
note candidates
artifact refs
runtime events
configuration
operator result files
```

## Permission boundary

Capability Runtime may declare:

```text
requested tool grant
workspace boundary
decision gate state
required source refs
expected artifact root
```

Nexus host decides:

```text
active grant
active boundary
valid gate result
allowed result shape
```

## UI mount point

Define:

```text
where CapabilityRuntimePanel mounts in Nexus
what data shape it reads
what remains read-only
which future actions require host decision
```

## Configuration surface

Define:

```text
default runtime mode
allowed mapping sources
storage roots
artifact roots
note policy
workspace boundary policy
decision gate policy
external mapping disabled by default
```

## Migration path

```text
1. Keep repo scaffold working.
2. Define host boundary fixtures.
3. Verify host request and runtime response shapes.
4. Document package boundary.
5. Add embedded initialization plan.
6. Keep local controlled verification green.
```

## Required verification

```bash
npm ci
npm run build
npm run check:generated
```

Focused checks to add:

```bash
npm run verify:nexus-host-boundary
npm run verify:embedded-package-boundary
npm run verify:storage-boundary
```

## Release gates

```text
host boundary documented
host request fixture validates
runtime response fixture validates
storage boundary documented
permission boundary documented
UI mount point documented
configuration surface documented
migration checklist exists
Alpha and Beta checks remain green
```

## Known starting limitations

```text
Capability Runtime is still inside the repo scaffold.
Persistent host API is not yet implemented.
Storage boundary is not yet represented by schemas.
Permission boundary is not yet verified.
UI mount point is still scaffold-based.
```

## Next milestone

```text
Milestone 4 — External Runtime Mapping
```