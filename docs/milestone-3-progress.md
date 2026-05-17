# Milestone 3 Progress

## Current phase

```text
Milestone 3 — Embedded Nexus Integration
```

## Progress

```text
Step 1/10 — Nexus host boundary document, fixtures and verifier — complete, PR #90
Step 2/10 — package script wiring for host boundary verifier — complete, PR #91
Step 3/10 — embedded package boundary document and verifier — complete, PR #92
Step 4/10 — storage boundary document and verifier — complete, PR #93
Step 5/10 — permission boundary document and verifier — ready for PR
Step 6/10 — UI mount point document — ready for PR
Step 7/10 — configuration surface document — ready for PR
Step 8/10 — migration checklist — ready for PR
Step 9/10 — Milestone 3 release notes — ready for PR
Step 10/10 — Milestone 3 closure checklist — ready for PR
```

## Step 1/10

Goal:

```text
Define the first host boundary contract between Nexus and Capability Runtime.
```

Status:

```text
host boundary document added
host request fixture added
runtime response fixture added
host boundary verifier added
CI green
merged in PR #90
```

## Step 2/10

Goal:

```text
Expose the host boundary verifier through package scripts and the local build chain.
```

Status:

```text
package script added
prebuild updated
predev updated
CI green
merged in PR #91
```

## Step 3/10

Goal:

```text
Define the embedded package boundary between Nexus host-owned decisions and Capability Runtime-owned surfaces.
```

Status:

```text
embedded package boundary document added
embedded package boundary fixture added
embedded package boundary verifier added
package script added
prebuild updated
predev updated
CI green
merged in PR #92
```

## Step 4/10

Goal:

```text
Define the storage boundary between runtime-produced refs/candidates and Nexus host-owned persistence.
```

Status:

```text
storage boundary document added
storage boundary fixture added
storage boundary verifier added
package script added
prebuild updated
predev updated
CI green
merged in PR #93
```

## Step 5/10

Goal:

```text
Define the permission boundary between runtime-declared requests and Nexus host-decided grants.
```

Expected outputs:

```text
docs/nexus-permission-boundary.md
samples/nexus-host-integration/permission-boundary.sample.json
scripts/verify-permission-boundary.ts
verify:permission-boundary package script
prebuild includes verify:permission-boundary
predev includes verify:permission-boundary
```

Status:

```text
permission boundary document added
permission boundary fixture added
permission boundary verifier added
package script added
prebuild updated
predev updated
waiting for PR CI
```

## Step 6/10

Goal:

```text
Document the read-only Capability Runtime UI mount point inside Nexus.
```

Status:

```text
docs/nexus-ui-mount-point.md added
waiting for PR CI
```

## Step 7/10

Goal:

```text
Document host-owned configuration and runtime-readable effective configuration.
```

Status:

```text
docs/nexus-configuration-surface.md added
waiting for PR CI
```

## Step 8/10

Goal:

```text
Document the migration path from repo scaffold to embedded Nexus subsystem.
```

Status:

```text
docs/nexus-migration-checklist.md added
waiting for PR CI
```

## Step 9/10

Goal:

```text
Capture Milestone 3 release notes.
```

Status:

```text
docs/milestone-3-release-notes.md added
waiting for PR CI
```

## Step 10/10

Goal:

```text
Close Milestone 3 with an explicit closure checklist.
```

Status:

```text
docs/milestone-3-closure-checklist.md added
waiting for PR CI
```

Done when:

```text
CI is green
PR is merged
this plan marks Steps 5/10 through 10/10 complete
Milestone 3 is closed
```