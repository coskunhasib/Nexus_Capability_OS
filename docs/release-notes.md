# Release Notes / Implementation Summary

This document summarizes the completed 15/15 adapter/runtime roadmap and the immediate post-roadmap hardening phase.

## Release status

```text
Roadmap: adapter/runtime roadmap
Status: 15/15 completed
Current phase: post-roadmap hardening
Primary verification command: npm run build && npm run check:generated
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
OpenHands adapter envelope
Code Agent adapter envelope
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

Focused checks include:

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
External agent adapters are envelope/normalization layers only.
They do not launch external agents directly.
They do not execute shell commands.
They do not mutate repositories.
They do not send secrets in work requests.
```

```text
The minimum real worker slice writes bounded artifacts.
It uses an allowlisted action.
It emits runtime bridge events from action results.
It does not perform arbitrary execution.
```

```text
Memory/context packets persist durable decisions, summaries, references and open questions.
They do not persist raw runtime or callback payloads.
```

## Known limitations

```text
No persistent local worker job queue yet.
No direct external runtime invocation yet.
No repository mutation worker action yet.
No operator approval UI for real-runtime handoff yet.
Runtime Adapter Panel job-state export/display still needs polish.
Default dev command is local-only.
```

## Recommended next steps

```text
19. Runtime security policy
20. Dev command cleanup
21. Local controlled worker v2
22. OpenHands real integration plan
23. Code Agent real integration plan
24. UI/runtime adapter polish
```

## Integration recommendation

Do not wire a real external runtime first.

The safer sequence is:

```text
1. Harden runtime security policy.
2. Add local controlled worker v2.
3. Prove manifest-driven bounded actions.
4. Decide external runtime wiring strategy.
5. Add operator approval points.
6. Then wire external runtime invocation.
```
