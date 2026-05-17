# Milestone 3 Release Notes

## Release

```text
Milestone 3 — Embedded Nexus Integration
```

## Summary

Capability Runtime is now prepared to operate as an embedded Nexus subsystem through explicit host, package, storage, permission, UI, configuration, and migration boundaries.

This milestone does not remove local controlled verification. It also does not require cloud productization, marketplace packaging, billing, workspace expansion, or a specific external runtime.

## Added boundaries

```text
Nexus host runtime boundary
embedded package boundary
storage boundary
permission boundary
UI mount point
configuration surface
migration checklist
```

## Added verifiers

```text
verify:nexus-host-boundary
verify:embedded-package-boundary
verify:storage-boundary
verify:permission-boundary
```

## Host-owned decisions clarified

```text
active tool grants
active workspace boundary
valid decision gate result
allowed result shape
allowed artifact root
memory commit policy
configuration policy
UI mount location
release gate policy
```

## Runtime-owned surfaces clarified

```text
contract shapes
mapping helpers
verification helpers
fixtures
read-only runtime panel
local scaffold
```

## Storage behavior clarified

```text
runtime returns trace refs, note candidates, artifact refs, runtime events, and operator result files
host owns memory notes, configuration, artifact roots, trace retention, and final operator result placement
```

## Permission behavior clarified

```text
runtime declares requested access
host grants, narrows, blocks, expires, or revokes access
runtime cannot self-activate grants, widen workspace, or self-approve decision gates
```

## Migration status

```text
repo scaffold remains the local harness
embedded boundaries are documented
focused verifiers are wired into predev and prebuild
external mapping remains disabled by default
```

## Next milestone

```text
Milestone 4 — External Runtime Mapping
```
