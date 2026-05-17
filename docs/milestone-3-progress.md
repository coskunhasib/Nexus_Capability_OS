# Milestone 3 Progress

## Current phase

```text
Milestone 3 — Embedded Nexus Integration
```

## Progress

```text
Step 1/10 — Nexus host boundary document, fixtures and verifier — complete, PR #90
Step 2/10 — package script wiring for host boundary verifier — complete, PR #91
Step 3/10 — embedded package boundary document and verifier — ready for PR
Step 4/10 — storage boundary document and verifier — planned
Step 5/10 — permission boundary document and verifier — planned
Step 6/10 — UI mount point document — planned
Step 7/10 — configuration surface document — planned
Step 8/10 — migration checklist — planned
Step 9/10 — Milestone 3 release notes — planned
Step 10/10 — Milestone 3 closure checklist — planned
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

Expected outputs:

```text
docs/nexus-embedded-package-boundary.md
samples/nexus-host-integration/embedded-package-boundary.sample.json
scripts/verify-embedded-package-boundary.ts
verify:embedded-package-boundary package script
prebuild includes verify:embedded-package-boundary
predev includes verify:embedded-package-boundary
```

Status:

```text
embedded package boundary document added
embedded package boundary fixture added
embedded package boundary verifier added
package script added
prebuild updated
predev updated
waiting for PR CI
```

Done when:

```text
CI is green
PR is merged
this plan marks Step 3/10 complete
```