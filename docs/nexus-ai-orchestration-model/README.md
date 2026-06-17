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

`main_product_pipeline` is the primary user-facing product journey under Nexus AI. SDLC is a
specialist build/engineering pipeline that can be delegated to by that main journey. The Mission
System, Coordination System, Governance, Audit, Shared Registry, user-facing terminology,
post-launch frontier backlog, protocol/security/evaluation ideas and runtime execution contracts are
**top-level Nexus AI standards**, not SDLC-only standards.

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
│   ├── Main Product Pipeline is the primary product journey
│   └── Specialist pipelines include SDLC, Discovery, Research, Activation, Operations,
│       Skill Governance, Knowledge/Memory, Content, Data Processing, Model/Inference,
│       Customer Support and Business/Strategy
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

The documentation has been physically migrated into this canonical namespace. The standards now live here:

```text
docs/nexus-ai-orchestration-model/README.md
docs/nexus-ai-orchestration-model/23-coordination-system-and-runtime-gap-closure.md
docs/nexus-ai-orchestration-model/24-mission-system-and-user-facing-runtime-model.md
docs/nexus-ai-orchestration-model/25-mission-runtime-gap-closure-audit.md
docs/nexus-ai-orchestration-model/26-post-launch-frontier-backlog-and-reassessment-plan.md
docs/nexus-ai-orchestration-model/packaging/
configs/nexus-ai/main_product_pipeline.yaml
configs/nexus-ai/*.yaml
.memory/*.md
```

Legacy `docs/ai-sdlc-factory/` paths are retained only as backwards-compatibility stubs. See [`INDEX.md`](./INDEX.md) for the full map.

## Migration status

The physical relocation is **complete**:

```text
from: docs/ai-sdlc-factory/   (now backwards-compatibility stubs)
to:   docs/nexus-ai-orchestration-model/
```

It was documentation reorganization only — no runtime behavior change, no runtime implementation authorized. Evidence: [`migration/MIGRATION_COMPLETION_REPORT.md`](./migration/MIGRATION_COMPLETION_REPORT.md).

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
