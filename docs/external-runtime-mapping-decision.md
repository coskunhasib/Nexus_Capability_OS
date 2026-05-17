# External Runtime Mapping Decision

This document covers item 45.

## Decision

Do not wire external runtime execution yet.

First validate the local Capability Runtime loop with deterministic contracts, fixtures and observations.

## Why

```text
The runtime contract is now clearer, but still new.
External tools and agents should map into the Capability Runtime contract.
They should not define the contract.
```

## Current default path

```text
local dry-run loop
→ contract verification
→ UI visibility
→ local controlled worker expansion
→ external runtime mapping only if needed
```

## External mapping principle

```text
external output
→ mapping adapter
→ Capability Runtime contract
→ evaluation observation
→ distilled memory note
```

## Candidate future sources

```text
custom code agent
local controlled worker
operator-run result file
remote runtime service
```

## Requirements before external mapping

```text
skill package schema exists
tool permission schema exists
agent/sub-agent schema exists
memory note schema exists
evaluation observation schema exists
runtime loop verifier exists
UI visibility exists for decisions and grants
```

## Risks of early external wiring

```text
external output starts defining the core contract
permission boundaries become unclear
raw logs enter memory
sub-agents become uncontrolled workers
context dumping returns
```

## Recommended next implementation order

```text
46. Implement CapabilityRuntimePanel read-only UI
47. Add stricter JSON schema validation for fixtures
48. Add local controlled worker mapping into runtime loop
49. Add operator-run result mapping into runtime loop
50. Revisit external runtime mapping
```

## Item 45 completion

This item is complete when the decision is recorded:

```text
External runtime mapping is deferred until local loop, contracts, fixtures and UI visibility are validated.
```