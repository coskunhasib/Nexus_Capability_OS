# Implementation Planning Handoff

> **Doc 22 §8 artifact.** This directory holds the implementation **workpackage specs** produced
> after the owner approved the readiness gate. Each spec describes *what* a runtime component must
> be built to do and *how* its build will be validated. **No code lives here, and authoring these
> specs does not authorize writing any.** Producing the runtime modules they name is a **separate,
> future, separately-approved execution step**. The `nexus` branch stays isolated from `main`.

## Owner decision (recorded)

```text
OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
```

- Date: 2026-06-04 · Decided by: Owner (coskunhasib)
- See [`../reviews/final-readiness-gate.md`](../reviews/final-readiness-gate.md).

## Workpackages

Each spec follows the Workpackage Contract (doc 20 §4) plus a `depends_on` field. Completion is
reported via the Completion Report Contract (doc 20 §5 / `../executor-standard/completion-report-schema.md`).

| WP | Component | Executor | depends_on |
|----|-----------|----------|------------|
| [WP-01](WP-01-shared-registry-loader.md) | Shared Registry Loader | Codex | — |
| [WP-02](WP-02-core-abilities-alignment.md) | Core Abilities Alignment | Codex | WP-01 |
| [WP-03](WP-03-governance-engine.md) | Governance Engine | Codex | WP-01 |
| [WP-04](WP-04-audit-evidence-store.md) | Audit / Evidence Store | Codex | WP-01 |
| [WP-05](WP-05-tool-permission-system.md) | Tool Permission System | Codex | WP-01, WP-02 |
| [WP-06](WP-06-model-provider-resolver.md) | Model / Provider Resolver | Codex | WP-01, WP-02 |
| [WP-07](WP-07-context-memory-resolver.md) | Context / Memory Resolver | Codex | WP-01 |
| [WP-08](WP-08-pipeline-run-state-model.md) | Pipeline Run State Model | Codex | WP-01 |
| [WP-09](WP-09-pipeline-runner.md) | Pipeline Runner | Codex | WP-03, WP-04, WP-08 |
| [WP-10](WP-10-executor-integration.md) | Executor Integration | Claude Code | WP-09, WP-05 |

## Recommended build order (dependency tiers)

The `depends_on` graph is acyclic. A valid topological build order, with safe parallelism per tier:

```text
Tier 0  (foundation)        WP-01  Shared Registry Loader
Tier 1  (needs WP-01)       WP-02, WP-03, WP-04, WP-07, WP-08   (parallel)
Tier 2  (needs WP-01+WP-02) WP-05, WP-06                        (parallel)
Tier 3  (needs WP-03+04+08) WP-09  Pipeline Runner
Tier 4  (needs WP-09+WP-05) WP-10  Executor Integration
```

Rationale: the Shared Registry Loader is the foundation every other component resolves against.
The Governance Engine, Audit/Evidence Store and Pipeline Run State Model are independent given the
loader; the Pipeline Runner orchestrates them; Executor Integration sits on top of the runner and
the tool-permission system.

## Global forbidden actions (every workpackage)

Per doc 20 §6, no executor of any of these workpackages may:

- write to `main`, or merge `nexus` into `main`;
- start runtime/refactor **execution** (produce runtime code) without a **further explicit owner approval**;
- add a connector, deploy, or publish step;
- (re)introduce a plugin / plugin registry;
- approve its own work, or bypass a governance gate;
- claim production readiness.

## Post-handoff gate

These specs are the **plan**, not the build. Before any workpackage is *executed* (i.e. runtime
code is produced), the following must hold — mirroring the readiness gate that preceded this handoff:

1. An execution workpackage is selected with an explicit executor + ChatGPT reviewer.
2. The owner gives a **separate** explicit approval to begin execution.
3. Even then, work happens in an isolated runtime workspace — **`nexus` is never merged into `main`.**

Until that separate approval, this handoff remains **planning only**.

## Review

Independent review of this handoff: [`../reviews/implementation-handoff-review.md`](../reviews/implementation-handoff-review.md).
