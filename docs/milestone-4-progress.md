# Milestone 4 Progress

## Current phase

```text
Milestone 4 — External Runtime Mapping
```

## Progress

```text
Step 1/10 — external runtime mapping boundary document, fixture and verifier — ready for PR
Step 2/10 — provider adapter manifest document, fixture and verifier — planned
Step 3/10 — external invocation packet document, fixture and verifier — planned
Step 4/10 — external result normalization document, fixture and verifier — planned
Step 5/10 — failure and fallback policy document, fixture and verifier — planned
Step 6/10 — provider capability matrix document and sample — planned
Step 7/10 — security and permission hardening document — planned
Step 8/10 — observability and evaluation checklist — planned
Step 9/10 — migration checklist and release notes — planned
Step 10/10 — Milestone 4 closure checklist — planned
```

## Step 1/10

Goal:

```text
Define the external runtime mapping boundary between Nexus host, Capability Runtime, and optional provider adapters.
```

Expected outputs:

```text
docs/milestone-4-external-runtime-mapping.md
docs/external-runtime-mapping-boundary.md
samples/nexus-host-integration/external-runtime-mapping.sample.json
scripts/verify-external-runtime-mapping.ts
verify:external-runtime-mapping package script
prebuild includes verify:external-runtime-mapping
predev includes verify:external-runtime-mapping
```

Status:

```text
Milestone 4 plan added
external runtime mapping boundary document added
external runtime mapping fixture added
external runtime mapping verifier added
package script added
prebuild updated
predev updated
waiting for PR CI
```

Done when:

```text
CI is green
PR is merged
this plan marks Step 1/10 complete
```
