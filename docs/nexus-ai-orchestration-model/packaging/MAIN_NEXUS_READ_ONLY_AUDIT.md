# Main Nexus Read-Only Audit

Date: 2026-06-17
Status: Phase 3 evidence complete
Scope: `/Users/hasibcoskun/Documents/Nexus_Project`
Audit mode: read-only; no product repo changes; no integration implementation

## Audit Boundary

This audit answers where Capability OS `.pipeline` packages can attach to the
main Nexus product runtime. It does not start integration.

Observed product repo state during audit:

- Branch: `feat/ui-simplification-r1`
- Branch state: ahead of origin by 4 commits
- Worktree: dirty before audit, mostly unrelated UI-simplification and backend
  logging/auth changes
- Product repo edits made by this audit: none

## Short Verdict

The first integration should still be `research-pipeline`, but the main Nexus
consumer runtime is not yet implemented.

Main Nexus already has usable sockets:

- pipeline DB/API/runtime facade
- cognitive/classic run logs
- plan approval gate
- skill registry and skill dispatch
- web search / deep research skills
- airgap egress guard
- report-only orchestration classification

Main Nexus is missing the consumer-specific package layer:

- package importer
- content fingerprint storage
- dedup/share conflict handling
- package dependency resolver
- package gate/evidence loader
- package-to-runtime stage adapter
- enforceable permission/gate runner for package gates
- package evidence persistence contract

## Consumer Socket Diagram

```text
Capability OS package
  |
  |  folder import, later zip/marketplace
  v
+-----------------------------+
| Nexus package importer      |  MISSING
| - read manifest             |
| - validate package shape    |
| - compute content hash      |
+--------------+--------------+
               |
               v
+-----------------------------+
| Package registry / DB       |  MISSING
| - pipeline_id               |
| - package_version           |
| - fingerprint               |
| - import status             |
+--------------+--------------+
               |
               v
+-----------------------------+
| Dependency resolver         |  PARTIAL SOCKET
| - skills table              |
| - registry truth reports    |
| - web skill availability    |
+--------------+--------------+
               |
               v
+-----------------------------+
| Runtime adapter             |  MISSING
| - stages -> Nexus runner    |
| - gates -> enforcement      |
| - evidence -> persistence   |
+--------------+--------------+
               |
               v
+-----------------------------+
| Existing Nexus runtime      |  PRESENT SOCKET
| - PipelineEngine            |
| - AgentEngine skill dispatch|
| - deep_research/web_search  |
| - PipelineRunLog/details    |
+-----------------------------+
```

## Socket Map

| Integration need | Main Nexus socket | Audit result |
|---|---|---|
| Package import | `routers/pipelines*`, `models/pipeline.py`, startup service wiring | Existing pipeline CRUD creates DB-backed classic/cognitive configs, not `.pipeline` packages. Add a new importer service/route beside the existing pipeline system; do not replace seed/runtime pipelines. |
| Pipeline run | `services/pipeline_engine.py`, `services/pipeline_engine_run.py`, `services/cognitive_pipeline*.py` | Existing engine can run classic/cognitive DB config and stream SSE. It does not understand package manifests, package gates, package evidence, or component references. |
| Research execution | `services/skills/web.py`, `web_search.py`, `web_research.py`, `web_api.py` | Correct first pilot socket exists. `deep_research` chains search, scrape, and optional synthesis. Use this via skill dispatch or a thin adapter, not by duplicating HTTP logic. |
| Skill/shared registry | `models/skill.py`, `routers/agents_skills.py`, `services/skill_registry_truth*`, `services/agent_engine_skills.py` | Skill registry exists and has report-only truth validation plus real handler dispatch. Tool/plugin registry is not a separate first-class package registry yet. |
| Human approval gate | `services/plan_review_gate.py`, `routers/pipelines_run_routes.py`, `models/plan_review.py` | Blocking plan approval exists for cognitive upper-tier runs and persists plan review audit records. This is a real gate candidate. |
| Permission gate | `services/permission_gate_*`, `routers/task_orchestration.py` | Permission gate is explicitly report-first/no-enforcement. It can report missing approvals/permissions, but cannot be treated as package gate enforcement yet. |
| Evidence metadata | `services/review_evidence.py` | Safe evidence metadata helpers exist. There is no package-specific gate evidence table/contract yet. |
| Trace/run records | `models/execution.py`, `models/cognitive_run.py`, `routers/execution_log_*`, `services/agent_react_trace.py` | Pipeline and agent traces exist, but package gate/evidence trace mapping is missing. |
| Sandbox/credential boundary | `services/airgap_guard.py`, `services/skills/web_policy.py`, `docs/security/credential-boundary-contract.md` | Airgap/network guard exists; provider credential storage is out of scope in current product docs. Package runtime must preserve this boundary. |
| Orchestrator routing | `services/task_orchestration_*`, `services/controlled_routing_policy.py`, `routers/task_orchestration.py` | Current orchestration is explain-only/report-only. Post-integration orchestrator must know all main/specialist pipeline ids and route matured intent to the best pipeline. |

## Evidence Notes

Read-only files inspected in `Nexus_Project`:

- `nexus-backend/models/pipeline.py`: `Pipeline` stores classic/cognitive DB
  config, not package manifests.
- `nexus-backend/schemas/pipeline.py`: `PipelineCreate` and
  `PipelineRunRequest` support classic/cognitive config and prompt/context
  inputs.
- `nexus-backend/routers/pipelines.py`: `/pipelines` composes list/create,
  metadata, run, and item routes.
- `nexus-backend/routers/pipelines_collection_routes.py`: create flow writes a
  `Pipeline` row directly.
- `nexus-backend/routers/pipelines_run_routes.py`: `/run` streams engine events;
  `/approve` mutates pending run status for approval/revision/rejection.
- `nexus-backend/services/pipeline_engine.py`: public engine facade wires
  knowledge, preload, and run mixins.
- `nexus-backend/services/pipeline_engine_run.py`: classic run creates
  `PipelineRunLog`, yields stage events, and completes/fails run state.
- `nexus-backend/services/cognitive_pipeline_run.py`: cognitive run creates
  run logs, runs upper approval, lower tier, review, evaluator, and metering.
- `nexus-backend/services/cognitive_pipeline_run_approval.py`: upper-tier plan
  loop calls the plan review gate and supports approve/revise/reject.
- `nexus-backend/services/plan_review_gate.py`: blocking approval gate persists
  review decisions through `record_review`.
- `nexus-backend/services/permission_gate_*`: report-only gate; explicitly no
  execution/enforcement.
- `nexus-backend/models/execution.py`: pipeline run logs, agent logs,
  execution traces, and trace steps are present.
- `nexus-backend/models/cognitive_run.py`: cognitive step detail records are
  present.
- `nexus-backend/services/review_evidence.py`: metadata-safe evidence builders
  and redaction helpers exist.
- `nexus-backend/models/skill.py`: skill registry rows have name/category,
  schemas, handler path, config, tags, user/tenant scope.
- `nexus-backend/services/skill_registry_truth*`: report-only registry truth
  validates handler presence, async execute interface, profile/permission/owner
  requirements.
- `nexus-backend/services/agent_engine_skills.py`: real skill dispatch loads
  handler classes or built-in OS skill handlers.
- `nexus-backend/services/skills/web.py`: public web skill entrypoint exports
  search, scrape, api_call, and research.
- `nexus-backend/services/skills/web_search.py`: web search implementation uses
  airgap guard and does not silently mock in production.
- `nexus-backend/services/skills/web_research.py`: deep research chains search,
  scrape/content collection, and optional compute synthesis.
- `nexus-backend/services/airgap_guard.py`: hard/soft airgap egress guard and
  startup socket block exist.
- `docs/security/credential-boundary-contract.md`: provider credentials are
  explicitly out of scope in the current phase.
- `nexus-backend/services/task_orchestration_*` and
  `services/controlled_routing_policy.py`: current orchestrator/routing reports
  are side-effect-free and do not start runtime routes.

## Phase 4 Inputs

Phase 4 should lock these design decisions before any product repo coding:

1. Import service boundary:
   `PipelinePackageImportService` or equivalent should live beside the existing
   pipeline services and should not overload `PipelineCreate`.

2. Storage:
   add a package import registry with `pipeline_id`, `package_version`,
   `fingerprint`, source path, import status, installed pipeline row id, and
   validation report.

3. Fingerprint:
   compute from canonical package content in Nexus, never from producer labels.
   Same `pipeline_id` plus same fingerprint can share; same id plus different
   fingerprint must keep both and warn.

4. Dependency resolution:
   resolve package dependencies against the existing `skills` table and registry
   truth reports. Web research should require `network_egress` and airgap-aware
   availability.

5. Runtime adapter:
   translate package stages/gates/evidence into existing run logs plus a new
   package gate/evidence mapping. Do not force package stages into the current
   classic/cognitive config shape if the mapping loses governance data.

6. Gate enforcement:
   use existing `plan_review_gate` where it fits, but do not treat
   `permission_gate` as enforcement until it is upgraded from report-only.

7. Evidence:
   use `review_evidence` redaction/metadata helpers, but add package gate
   evidence persistence or a precise extension to existing run detail records.

8. Research pilot adapter:
   call `deep_research` / `web_search` through the skill dispatch boundary or a
   thin service wrapper so production airgap and strict mock rules remain intact.

9. Post-integration orchestrator:
   after package import and first pilot run are proven, the orchestrator must load
   the full main/specialist/blueprint pipeline catalog and redirect matured
   intent to the right pipeline when needed.

## Phase 3 Result

Phase 3 is complete.

Phase 4 design lock is now recorded in
`CONSUMER_RUNTIME_DESIGN_LOCK.md`. Product integration remains blocked until
the owner explicitly starts Phase 5.
