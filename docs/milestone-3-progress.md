# Milestone 3 Progress

## Current phase

```text
Milestone 3 — Embedded Nexus Integration
```

## Progress

```text
Step 1/10 — Nexus host boundary document, fixtures and verifier — complete, PR #90
Step 2/10 — package script wiring for host boundary verifier — ready for PR
Step 3/10 — embedded package boundary document and verifier — planned
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

Expected outputs:

```text
verify:nexus-host-boundary package script
prebuild includes verify:nexus-host-boundary
predev includes verify:nexus-host-boundary
```

Status:

```text
package script added
prebuild updated
predev updated
waiting for PR CI
```

Done when:

```text
CI is green
PR is merged
this plan marks Step 2/10 complete
```