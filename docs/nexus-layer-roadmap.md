# Nexus Layer Roadmap

## Scope correction

```text
The local capability execution kernel is complete.
The whole Nexus layer is not complete.
The remaining items are Nexus internal layers, not external or optional side quests.
```

Nexus is not just a local runner, a single-agent app, or a demo UI. The intended layer is:

```text
skill marketplace
agent/capability runtime
workflow execution fabric
hidden dispatcher
marketplace compute records
company/team usage layer
internal tenant/workspace isolation
billing and usage-credit primitives
trust/reputation gates
cloud/hybrid run policy
Nexus data contract and result ingestion
```

## Completed internal foundation

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
```

## Active Nexus internal layers still to implement

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

## Important product decisions already made

```text
Nexus does not need its own GPU fleet for V1.
Cloud means managed UX over marketplace compute providers.
The user should not see or choose raw compute nodes in normal flow.
Dispatcher stays hidden.
Workspace and tenant concepts are internal implementation boundaries, not front-stage marketing language.
No separate private-data pipeline for V1; privacy is controlled by deployment mode, consent, retention, audit and isolation.
```

## Next correct implementation sequence

```text
1. Nexus data contract discovery and canonical envelope
2. Result ingestion prototype over current local kernel
3. Skill marketplace registry and listing projection
4. Hidden dispatcher policy and node scoring fixture
5. Marketplace compute provider records
6. Company/team usage layer and internal isolation
7. Billing/credit/settlement primitives
8. Trust/reputation/quality gates
9. Cloud/hybrid policy projection
10. Full Nexus e2e verifier
```

## Stop condition for Nexus layer

Nexus layer can be called complete only when this exists:

```text
a skill can be published, discovered, selected, dispatched to an eligible local/cloud/hybrid runner through hidden policy, executed through guarded workflow, reviewed, billed/credited when applicable, stored, audited, and evaluated with trust/quality records.
```

Until then, only the local capability execution kernel is complete.
