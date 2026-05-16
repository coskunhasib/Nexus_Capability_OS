# Roadmap Progress

This file is the living implementation tracker for Nexus Capability OS.

Rule:

```text
After each completed PR, update this file:
- move completed item to Done
- update Current state
- update Next recommended item
- reorder Remaining roadmap if needed
- report progress as X/15 completed
```

## Roadmap progress

```text
13/15 completed
Current item: 14/15 — OpenHands Adapter
Next item: 15/15 — Codex / Claude Code Adapter
```

## Current state

```text
Trial-ready core: strong
Nexus handoff contract: implemented
Runtime bridge contract: implemented
Runtime adapter request/response contract: implemented
Mock adapter-driven Runner loop: implemented
Runtime adapter loop CI verification: implemented
Runtime adapter provider interface: implemented
Mock provider: implemented
HTTP provider: hardened boundary implemented
Runtime adapter config panel: implemented
Runtime callback ingest: implemented
Runtime job state model: implemented
Runtime event store + replay: implemented
Runtime timeline UI: implemented
Runtime artifact registry: implemented
Review report hardening: implemented
Memory/context packet hardening: implemented
Adapter trials: implemented
Local HTTP worker skeleton: implemented
Minimum real worker vertical slice: implemented
OpenHands adapter: not implemented yet
Codex / Claude Code adapter: not implemented yet
```

## Done

```text
✅ Capability registry
✅ Skill registry
✅ Skill research reviews
✅ Skill-aware Runner
✅ Skill-aware Review / Memory / Context
✅ 5 automatic skill trials
✅ Trial Results Dashboard
✅ Nexus Handoff usability verification
✅ Nexus Runtime Bridge verification
✅ Runtime Bridge dashboard
✅ Snapshot sync completeness
✅ CI workflow cleanup
✅ View code splitting
✅ Bundle budget guard
✅ Deterministic npm ci install
✅ Generated artifact drift guard
✅ Untracked generated artifact guard
✅ CI summary
✅ Verification contract documentation
✅ Runtime adapter request/response schemas
✅ Runtime adapter request/response samples
✅ Runtime adapter boundary validation
✅ Mock Runtime Adapter helper
✅ Runtime Adapter Panel in Runner
✅ Adapter request → response → events → Runner state ingest
✅ Runtime adapter loop verification
✅ 1/15 — Adapter Provider Interface
✅ 2/15 — Mock + HTTP provider hardening
✅ 3/15 — Runtime Adapter Config Panel
✅ 4/15 — Runtime Callback Ingest
✅ 5/15 — Job State Model
✅ 6/15 — Event Store + Replay
✅ 7/15 — Runtime Timeline UI
✅ 8/15 — Artifact Registry / Artifact Refs
✅ 9/15 — Review Report Hardening
✅ 10/15 — Memory / Context Packet Hardening
✅ 11/15 — Adapter Trials
✅ 12/15 — Local HTTP Worker Server Skeleton
✅ 13/15 — Minimum Real Worker Vertical Slice
```

## Next recommended item

```text
OpenHands Adapter
```

Why this is next:

```text
The minimum real worker slice now proves safe out-of-process artifact generation through the runtime adapter contract without arbitrary command execution.
The next step is to define an OpenHands adapter contract that can package work for OpenHands without coupling the core worker to an installed OpenHands runtime.
```

Target:

```text
OpenHands request adapter
safe project/workspace envelope
allowed task payload mapping
artifact expectation mapping
adapter response normalization
focused verification script
adapter documentation
```

Expected files:

```text
server/adapters/openhands-adapter.ts
scripts/verify-openhands-adapter.ts
docs/openhands-adapter.md
package.json update
```

Expected NPM script:

```text
verify:openhands-adapter
```

## Remaining roadmap

```text
1. Adapter Provider Interface — done
2. Mock + HTTP provider hardening — done
3. Runtime Adapter Config Panel — done
4. Runtime Callback Ingest — done
5. Job State Model — done
6. Event Store + Replay — done
7. Runtime Timeline UI — done
8. Artifact Registry / Artifact Refs — done
9. Review Report Hardening — done
10. Memory / Context Packet Hardening — done
11. Adapter Trials — done
12. Local HTTP Worker Server Skeleton — done
13. Minimum Real Worker Vertical Slice — done
14. OpenHands Adapter — next
15. Codex / Claude Code Adapter — pending
```

## Current priority stack

```text
1. Adapter Provider Interface — done
2. Mock + HTTP provider hardening — done
3. Runtime Adapter Config Panel — done
4. Runtime callback ingest — done
5. Job state model — done
6. Event store + replay — done
7. Event timeline UI — done
8. Artifact registry — done
9. Review report hardening — done
10. Memory / context packet hardening — done
11. Adapter trials — done
12. Local HTTP worker skeleton — done
13. Real worker vertical slice — done
14. OpenHands adapter — next
15. Codex / Claude Code adapter
```