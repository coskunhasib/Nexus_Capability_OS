# Nexus UI Mount Point

Capability Runtime is mounted into Nexus as a read-only runtime panel until the host grants explicit action paths.

## Mount rule

```text
Nexus owns placement, navigation, action routing, and write authority.
Capability Runtime owns read-only presentation of runtime state.
```

## Proposed mount

```text
Nexus / Capability Runtime / Runtime Panel
```

## Panel may read

```text
active runtime cycle ref
selected skill refs
sub-agent refs
host request summary
runtime response summary
trace refs
artifact refs
memory note candidate refs
permission state
storage state
verification results
```

## Panel must not mutate

```text
host memory
host configuration
workspace boundary
tool grants
decision gate result
artifact root
release state
```

## Future host-mediated actions

```text
approve note candidate
reject note candidate
open artifact ref
rerun runtime cycle
request expanded tool grant
request workspace boundary review
export operator result file
```

Each future action must route through Nexus host policy before execution.

## Acceptance gate

```text
read-only rule is explicit
host-owned mutations are blocked
panel input shape is documented
future actions are host-mediated
scaffold app remains usable
```
