# Milestone 4 — External Runtime Mapping

## Goal

Prepare Capability Runtime to map controlled runtime work to external runtime providers without making any provider mandatory and without weakening local controlled verification.

Milestone 4 defines mapping contracts, provider manifests, invocation packets, result normalization, failure/fallback behavior, provider capability metadata, permission hardening, observability, migration, and release closure.

## Baseline

```text
Milestone 1 — Capability Runtime Alpha: documented
Milestone 2 — Controlled Runtime Beta: closed by checklist
Milestone 3 — Embedded Nexus Integration: closed
Milestone 4 — External Runtime Mapping: next
```

## Scope

```text
external runtime mapping boundary
provider adapter manifest
external invocation packet
external result normalization
failure and fallback policy
provider capability matrix
security and permission hardening
observability and evaluation checklist
migration path
release notes and closure checklist
```

## Non-goals

```text
no external provider enabled by default
no dependency on a specific third-party runtime
no cloud productization requirement
no marketplace requirement
no billing/workspace expansion requirement
no removal of local controlled checks
no direct provider permission escalation
```

## Step plan

```text
Step 1/10 — external runtime mapping boundary document, fixture and verifier
Step 2/10 — provider adapter manifest document, fixture and verifier
Step 3/10 — external invocation packet document, fixture and verifier
Step 4/10 — external result normalization document, fixture and verifier
Step 5/10 — failure and fallback policy document, fixture and verifier
Step 6/10 — provider capability matrix document and sample
Step 7/10 — security and permission hardening document
Step 8/10 — observability and evaluation checklist
Step 9/10 — migration checklist and release notes
Step 10/10 — Milestone 4 closure checklist
```

## Default posture

```text
external mapping disabled by default
local controlled runtime remains primary
external providers are opt-in adapter targets
host validates every external mapping request
host owns permission grants and workspace boundaries
runtime returns normalized results to Nexus host
```

## Required verification

```bash
npm ci
npm run build
npm run check:generated
```

Focused checks to add:

```bash
npm run verify:external-runtime-mapping
npm run verify:provider-adapter-manifest
npm run verify:external-invocation-packet
npm run verify:external-result-normalization
npm run verify:external-fallback-policy
```

## Release gates

```text
external mapping boundary documented
external mapping fixture validates
provider adapter manifest documented
external invocation packet validates
result normalization validates
failure/fallback policy validates
provider capability matrix exists
security and permission hardening documented
observability checklist exists
migration checklist exists
release notes exist
closure checklist complete
Alpha, Beta and Milestone 3 checks remain green
```

## Next milestone

```text
Milestone 5 — Runtime Provider Execution Slice
```
