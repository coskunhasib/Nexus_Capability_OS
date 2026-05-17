# Release Notes / Implementation Summary

This document summarizes the current Nexus Capability OS implementation state.

## Release status

```text
Adapter/runtime roadmap: 15/15 completed
Post-roadmap numbered block: 16-50 completed
Current phase: Milestone 1 — Capability Runtime Alpha
Primary verification command: npm run build && npm run check:generated
```

Detailed Alpha notes:

```text
docs/capability-runtime-alpha-release-notes.md
```

## What was built

### Capability and skill foundation

```text
Capability registry
Skill registry
Skill-aware Runner
Skill-aware Review / Memory / Context
Skill trial scenarios
Trial results dashboard
```

### Handoff and runtime contract

```text
Nexus handoff packet
Runtime bridge events
Runtime adapter request schema
Runtime adapter response schema
Runtime adapter loop verification
Runtime adapter provider interface
Mock provider
Hardened HTTP provider
Runtime Adapter Panel
```

### Runtime state and evidence chain

```text
Runtime callback ingest
Runtime job state model
Runtime event store and replay
Runtime timeline UI
Runtime artifact registry
Review report hardening
Memory/context packet hardening
```

### Worker and adapter layer

```text
Adapter trials
Local HTTP worker skeleton
Minimum real worker vertical slice
Controlled worker v2
OpenHands adapter envelope
Code Agent adapter envelope
```

### Capability Runtime Alpha layer

```text
Capability Runtime contract types
strict Capability Runtime validators
Capability Runtime schema index
Capability Runtime fixture set
read-only CapabilityRuntimePanel
local dry-run RuntimeLoopCycle builder
controlled-worker-to-runtime mapping
operator-result-to-runtime mapping
Capability Runtime verification scripts
Alpha milestone plan
Alpha release checklist
```

## Verification chain

The authoritative verification map is:

```text
docs/verification-contract.md
```

Core local checks:

```bash
npm ci
npm run build
npm run check:generated
```

Focused Alpha checks:

```bash
npm run verify:capability-runtime
npm run verify:controlled-worker
npm run verify:controlled-worker-runtime
npm run verify:operator-run-runtime
```

Focused general checks include:

```bash
npm run validate:packets
npm run audit:registry
npm run trial:all-skills
npm run trial:adapter
npm run verify:local-worker
npm run verify:real-worker
npm run verify:oh-adapter
npm run verify:ca-adapter
npm run verify:handoff
npm run verify:runtime-bridge
npm run verify:adapter-loop
npm run verify:adapter-provider
npm run verify:event-store
npm run verify:artifacts
npm run verify:review-hardening
npm run verify:memory-context
npm run check:bundle
npm run check:generated
```

## Current safe boundaries

```text
CapabilityRuntimePanel is read-only.
Capability Runtime outputs are local, dry-run or controlled.
Controlled worker actions are allowlisted and bounded.
Operator-run result files are structured inputs, not raw external logs.
Memory note outputs are candidates with source refs.
External agent adapters are envelope/normalization layers only.
Live external runtime execution remains outside Alpha scope.
```

```text
The minimum real worker slice writes bounded artifacts.
It uses an allowlisted action.
It emits runtime bridge events from action results.
It does not perform broad workspace execution.
```

```text
Memory/context packets persist durable decisions, summaries, references and open questions.
They do not persist raw runtime or callback payloads.
```

## Known limitations

```text
CapabilityRuntimePanel is fixture-backed.
RuntimeLoopCycle is local/dry-run/controlled, not a persistent host subsystem.
Memory note candidates are generated but not merged into a persistent store.
Artifact lifecycle is still a Beta-grade work area.
Workspace boundary verification is still a Beta-grade work area.
No persistent local worker job queue yet.
Live external runtime execution remains deferred.
Default dev command is local-only.
```

## Recommended next milestone

```text
Milestone 2 — Controlled Runtime Beta
```

Recommended Beta focus:

```text
artifact lifecycle policy and verifier
workspace boundary verifier
memory note lifecycle verifier
multi-skill controlled runtime fixtures
approval checkpoint visibility
security policy update for controlled local execution
```

## Integration recommendation

Do not make a live external runtime the next step.

The safer sequence is:

```text
1. Finish Alpha release validation.
2. Move to Controlled Runtime Beta.
3. Make artifact lifecycle explicit.
4. Make workspace boundaries verifiable.
5. Make memory note lifecycle verifiable.
6. Then revisit external runtime mapping in its dedicated milestone.
```