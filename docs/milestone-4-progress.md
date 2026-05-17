# Milestone 4 Progress

## Current phase

```text
Milestone 4 — External Runtime Mapping — closed
```

## Progress

```text
Step 1/10 — external runtime mapping boundary document, fixture and verifier — complete, PR #96
Step 2/10 — provider adapter manifest document, fixture and verifier — complete, PR #97
Step 3/10 — external call packet document, fixture and verifier — complete, PR #97
Step 4/10 — external result normalization document, fixture and verifier — complete, PR #97
Step 5/10 — failure and fallback policy document, fixture and verifier — complete, PR #97
Step 6/10 — provider capability matrix document and sample — complete, PR #97
Step 7/10 — security and permission hardening document — complete, PR #97
Step 8/10 — observability and evaluation checklist — complete, PR #97
Step 9/10 — migration checklist and release notes — complete, PR #97
Step 10/10 — Milestone 4 closure checklist — complete, PR #97
```

## Step 1/10

Goal:

```text
Define the external runtime mapping boundary between Nexus host, Capability Runtime, and optional provider adapters.
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
CI green
merged in PR #96
```

## Step 2/10

Goal:

```text
Define the provider adapter manifest contract for optional external runtime providers.
```

Status:

```text
docs/provider-adapter-manifest.md added
samples/nexus-host-integration/provider-adapter-manifest.sample.json added
scripts/verify-provider-adapter-manifest.ts added
verify:provider-manifest script added
prebuild updated
predev updated
CI green
merged in PR #97
```

## Step 3/10

Goal:

```text
Define the external call packet for host-reviewed provider adapter calls.
```

Status:

```text
docs/external-call-packet.md added
samples/nexus-host-integration/external-call-packet.sample.json added
scripts/verify-external-call-packet.ts added
verify:external-call script added
prebuild updated
predev updated
CI green
merged in PR #97
```

## Step 4/10

Goal:

```text
Normalize provider output into host-safe runtime result packets.
```

Status:

```text
docs/external-result-normalization.md added
samples/nexus-host-integration/external-result-normalization.sample.json added
scripts/verify-external-result-normalization.ts added
verify:external-result script added
prebuild updated
predev updated
CI green
merged in PR #97
```

## Step 5/10

Goal:

```text
Define fallback behavior for external provider unavailability, timeout, mismatch, or incomplete output.
```

Status:

```text
docs/external-fallback-policy.md added
samples/nexus-host-integration/external-fallback-policy.sample.json added
scripts/verify-external-fallback-policy.ts added
verify:external-fallback script added
prebuild updated
predev updated
CI green
merged in PR #97
```

## Step 6/10

Goal:

```text
Document provider capability comparison without treating capability as permission.
```

Status:

```text
docs/provider-capability-matrix.md added
samples/nexus-host-integration/provider-capability-matrix.sample.json added
CI green
merged in PR #97
```

## Step 7/10

Goal:

```text
Document safety and permission hardening for external runtime mapping.
```

Status:

```text
docs/external-runtime-safety-and-permissions.md added
CI green
merged in PR #97
```

## Step 8/10

Goal:

```text
Document observability and evaluation requirements for external runtime mapping.
```

Status:

```text
docs/external-runtime-observability-checklist.md added
CI green
merged in PR #97
```

## Step 9/10

Goal:

```text
Document migration path and release notes.
```

Status:

```text
docs/milestone-4-migration-and-release.md added
CI green
merged in PR #97
```

## Step 10/10

Goal:

```text
Close Milestone 4 with an explicit closure checklist.
```

Status:

```text
docs/milestone-4-closure-checklist.md added
CI green
merged in PR #97
Milestone 4 closed
```

## Next

```text
Milestone 5 — Runtime Provider Execution Slice
```
