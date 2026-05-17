# External Runtime Safety and Permissions

External runtime mapping must preserve the embedded Nexus boundaries from Milestone 3.

## Rule

```text
Provider capability is not permission.
Adapter availability is not activation.
Normalized output is not automatic acceptance.
```

## Host-owned controls

```text
provider allowlist
adapter activation
tool grants
workspace boundary
artifact root policy
decision gate policy
fallback policy
manual review policy
accepted result shape
```

## Required checks

```text
provider is allowlisted
adapter manifest validates
call packet validates
active grants are explicit
workspace boundary is explicit
source refs are present
artifact root is approved
fallback path exists
normalized result validates
```

## Provider limits

```text
provider cannot change host memory
provider cannot change host configuration
provider cannot expand workspace scope
provider cannot expand artifact root
provider cannot approve decision gates
provider cannot convert candidates into accepted records
```

## Acceptance gate

```text
safety controls are host-owned
permission activation is explicit
provider limits are explicit
manual review remains host-owned
Milestone 3 boundaries remain intact
```
