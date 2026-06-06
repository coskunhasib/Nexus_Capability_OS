# Nexus AI Orchestration Model — Canonical Namespace

This directory is the canonical top-level namespace for **Nexus AI Orchestration Model** standards.

## Why this exists

Earlier files live under:

```text
docs/ai-sdlc-factory/
```

That path is now a **legacy/historical path name**. It must not be interpreted as the conceptual scope.

Correct scope:

```text
Nexus AI Orchestration Model
```

Not:

```text
SDLC Factory
```

SDLC is only one pipeline under Nexus AI. The Mission System, Coordination System, Governance, Audit, Shared Registry, user-facing terminology, post-launch frontier backlog, protocol/security/evaluation ideas and runtime execution contracts are **top-level Nexus AI standards**, not SDLC-only standards.

## Canonical interpretation rule

```text
If a file under docs/ai-sdlc-factory/ describes Mission, Coordination, Governance, Audit,
Shared Registry, user-facing terminology, runtime execution boundaries or post-launch frontier
ideas, interpret it as a Nexus AI Orchestration Model standard.
```

## Canonical concept hierarchy

```text
Nexus AI Orchestration Model
├── Mission System
├── Shared Registry System
├── Pipeline System
│   └── SDLC Pipeline is only one pipeline type
├── Team System
├── Core Abilities Layer
├── Skills and Tools Layer
├── Coordination System
├── Governance System
├── Audit System
├── Runtime Execution Boundary
└── Post-Launch Frontier Backlog
```

## Current canonical source files

Until the repository is physically reorganized, these files remain at their existing paths:

```text
docs/ai-sdlc-factory/README.md
docs/ai-sdlc-factory/23-coordination-system-and-runtime-gap-closure.md
docs/ai-sdlc-factory/24-mission-system-and-user-facing-runtime-model.md
docs/ai-sdlc-factory/25-mission-runtime-gap-closure-audit.md
docs/ai-sdlc-factory/26-post-launch-frontier-backlog-and-reassessment-plan.md
configs/nexus-ai/*.yaml
.memory/*.md
```

## Migration rule

Physical relocation should be deferred until it can be done safely without breaking internal links.

Planned future move:

```text
from: docs/ai-sdlc-factory/
to:   docs/nexus-ai-orchestration-model/
```

This move is documentation reorganization only. It must not change runtime behavior and must not authorize runtime implementation.

## Stop rule

This namespace correction does not authorize:

```text
runtime implementation
product refactor
connector integration
Nexus publish
deploy
main branch merge
plugin registry
production readiness claim
```
