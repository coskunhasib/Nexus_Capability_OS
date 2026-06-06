# 00b — Nexus AI Scope and Post-Launch Decision Addendum

This addendum records locked decisions added after the Mission System, namespace correction, and post-launch frontier backlog discussions.

Scope: documentation/config only. This file does not authorize runtime implementation, product refactor, connector integration, deploy/publish, `nexus` → `main` merge, plugin reintroduction, or production readiness claims.

## D-017 — Canonical namespace is Nexus AI Orchestration Model

The correct top-level namespace is:

```text
Nexus AI Orchestration Model
```

The path `docs/ai-sdlc-factory/` is historical/legacy and must not be interpreted as the conceptual scope.

SDLC is only one pipeline under Nexus AI.

## D-018 — Top-level standards are not SDLC-only

The following are top-level Nexus AI standards, not SDLC Pipeline-only standards:

```text
Mission System
Shared Registry System
Pipeline System
Team System
Core Abilities Layer
Skills and Tools Layer
Coordination System
Governance System
Audit System
Runtime Execution Boundary
Post-Launch Frontier Backlog
User-Facing Terminology
Owner Decision Registry
Execution Scheduling Policy
Role-Based Model Policy
```

## D-019 — Mission is the user-facing work object

```text
Mission = user goal turned into a managed work container.
```

Mission is not a Pipeline Run and not a single long-running agent session. A Mission may contain one or more Pipeline Runs.

## D-020 — Mission Orchestrator is not Supervisor

```text
Supervisor = Core Ability
Mission Orchestrator = Mission-level process manager
SDLC Team Lead = SDLC Team / Pipeline Run manager
```

These must not be merged.

## D-021 — Mission Shared State is not Shared Registry

```text
Shared Registry = system-wide catalogue of capabilities/profiles/tools/etc.
Mission Shared State = state of one specific Mission.
```

These must not be used interchangeably.

## D-022 — Validation Contract precedes implementation

A Mission should define a Validation Contract before implementation work is treated as ready.

User-facing name:

```text
Başarı Kriterleri
```

The contract defines how the work will be judged complete.

## D-023 — Structured Handoffs are mandatory for long-running agent work

Workers and validators must not silently hand off work. They must report what was done, what remains, what was run, what failed, what was found, what evidence was produced, and what should happen next.

User-facing name:

```text
Teslim Raporu
```

## D-024 — Coordination System is top-level, not SDLC-only

Coordination System defines how roles work together across Missions and Pipeline Runs.

Required patterns:

```text
Delegation
Creator-Verifier
Controlled Direct Communication
Negotiation / Arbitration
Broadcast / Event Bus
```

## D-025 — Post-launch frontier backlog is non-blocking before launch

Frontier research items are valuable and must be recorded, but they must not trap the project in an endless pre-launch design loop.

Rule:

```text
Record now. Do not block launch. Reassess after launch with evidence.
```

An item can be promoted to launch-blocking only by explicit owner decision.

## D-026 — Physical directory migration is deferred

The repository may later move:

```text
from: docs/ai-sdlc-factory/
to:   docs/nexus-ai-orchestration-model/
```

But this is documentation reorganization only and must be done safely without breaking internal links. It does not authorize runtime implementation.
