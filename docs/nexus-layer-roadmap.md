# Nexus Layer Handoff Reference

## Scope correction

```text
The local capability execution kernel is complete in this repository.
The main Nexus product is developed elsewhere.
The remaining Nexus internal layers should be implemented in the main Nexus product codebase, using this repository as the kernel package and integration reference.
```

This repository is not intended to keep growing into the whole Nexus product.

## What this repository provides

```text
local capability execution kernel
review and disposition guard
accepted artifact guard
reason codes
state history
runtime log
local deterministic snapshots
controlled local runner
operator actions
local identity checks
alpha e2e verifier
minimal review panel
Nexus integration guide
```

## Main Nexus internal layers that should consume this kernel

### 1. Nexus data contract and result envelope

```text
canonical run envelope
canonical result envelope
provider result normalization
artifact and trace reference schema
ingestion guard
shared fixture set
```

### 2. Skill marketplace layer

```text
skill package manifest
publisher identity
skill versioning
quality gate labels
review state
install/use policy
marketplace listing projection
```

### 3. Hidden dispatcher and workflow execution fabric

```text
dispatcher policy
node selection scoring
fallback policy
workflow step graph
run queue
execution state machine
retry and timeout policy
```

### 4. Marketplace compute layer

```text
compute provider record
rental intent
capability and model compatibility
availability window
trust score
provider quality history
cloud/hybrid policy
```

### 5. Company/team usage layer

```text
organization account
team invitation
role mapping
internal workspace boundary
usage telemetry settings
audit chain
```

### 6. Billing, usage credits and settlement primitives

```text
usage meter
credit ledger
escrow-like hold record
provider payout state
refund/cancel path
invoice/export projection
```

### 7. Trust, quality and safety gates

```text
skill quality score
provider quality score
run evaluation record
abuse report path
manual review queue
ban/suspend policy marker
```

## Product decisions to preserve in Nexus

```text
Nexus does not need its own GPU fleet for V1.
Cloud means managed UX over marketplace compute providers.
The user should not see or choose raw compute nodes in normal flow.
Dispatcher stays hidden.
Workspace and tenant concepts are internal implementation boundaries, not front-stage marketing language.
No separate private-data pipeline for V1; privacy is controlled by deployment mode, consent, retention, audit and isolation.
```

## Correct Nexus-side integration sequence

```text
1. Add Nexus adapter for this kernel.
2. Map Nexus run envelope to kernel input.
3. Map kernel VerticalSliceResult to Nexus result envelope.
4. Persist kernel StoredSliceRecord through Nexus storage boundary.
5. Connect Nexus review UI to review action flow.
6. Let hidden dispatcher select this kernel as one eligible execution target.
7. Add marketplace skill invocation path that can use this kernel.
8. Add compute provider records as alternate execution targets.
9. Add billing/trust/quality gates around the run envelope.
10. Add full Nexus e2e verifier.
```

## Kernel repository stop condition

This repository should be considered complete when:

```text
local kernel verification passes
integration guide exists
main Nexus can consume this package through an adapter
```

Further marketplace, dispatcher, compute, billing, organization, and cloud/hybrid implementation belongs in the main Nexus product unless it directly changes the kernel integration surface.
