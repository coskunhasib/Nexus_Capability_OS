# Nexus Migration Checklist

This checklist moves Capability Runtime from repo scaffold to embedded Nexus subsystem without breaking the local controlled verification path.

## Phase 1 — Keep scaffold green

```text
npm ci
npm run lint
npm run build
npm run check:generated
```

Required state:

```text
local scaffold builds
controlled runtime checks stay green
adapter trials stay green
host boundary fixtures validate
```

## Phase 2 — Embed boundary contracts

```text
host boundary documented
package boundary documented
storage boundary documented
permission boundary documented
configuration surface documented
UI mount point documented
```

Required state:

```text
runtime-owned surfaces are explicit
host-owned decisions are explicit
read-only UI rule is explicit
storage writes route through host policy
permission activation routes through host policy
```

## Phase 3 — Mount read-only panel

```text
mount CapabilityRuntimePanel inside Nexus shell
feed panel from host runtime response packet
show trace refs, artifact refs, note candidates, and verification state
block all host mutation actions by default
```

Required state:

```text
panel can render runtime state
panel cannot mutate host memory
panel cannot mutate grants or gates
panel cannot widen workspace scope
```

## Phase 4 — Route persistence through host

```text
artifact refs resolve under approved roots
note candidates require host decision
operator result files remain artifacts before finalization
runtime events are append-only
configuration remains host-owned
```

Required state:

```text
no direct memory commit
no direct configuration mutation
no artifact root override
no trace retention override
```

## Phase 5 — Enable controlled host execution

```text
host request creates runtime input
runtime response returns host-safe packet
blocked and partial results preserve reason fields
source refs remain required for stateful outputs
```

Required state:

```text
host-to-runtime fixture validates
runtime-to-host fixture validates
permission fixture validates
storage fixture validates
```

## Phase 6 — Release gate

```text
all Milestone 3 docs exist
all Milestone 3 verifiers are wired into prebuild and predev
CI is green
release notes exist
closure checklist is complete
```

## Non-regression rule

```text
Embedding must not remove local controlled checks.
Embedding must not make external runtime mapping mandatory.
Embedding must not introduce cloud, marketplace, billing, or workspace expansion requirements.
```
