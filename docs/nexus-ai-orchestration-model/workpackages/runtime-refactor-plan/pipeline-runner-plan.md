# Pipeline Runner Plan (Planning-Only)

> **Phase G/H — doc 21 §7.** This document describes *how* a future Nexus AI **pipeline runner**
> would load a pipeline definition, instantiate a run, transition through stages, evaluate gates,
> route rework, and track status. It is a **design plan only**. **It contains no runtime code, no
> implementation, no merge, no deploy, no connector wiring, and no plugin concept.** Nothing here
> is authorized to be built. The transition from this plan to any implementation is gated by the
> owner-approval boundary in [§11](#11-owner-approval-dependency-explicit).

- **Plan id:** `pipeline-runner-plan`
- **Phase:** G/H — [`../21-runtime-refactor-planning-only-plan.md`](../../legacy/21-runtime-refactor-planning-only-plan.md) §7 ("Pipeline runner plan requirements")
- **Required output slot:** `docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-runner-plan.md` (doc 21 §5)
- **Scope (doc 21 §7):** pipeline definition loader · pipeline-run instance creation · stage
  transition handling · `on_pass` / `on_fail` / `rework_route` handling · conditional gate
  evaluation · status tracking · iteration limits.
- **Status:** plan drafted; **not implemented, not reviewed, not approved.** Subject to
  [`../reviews/runtime-refactor-plan-review.md`](../../reviews/runtime-refactor-plan-review.md) (doc 21 §10)
  and the doc 22 owner decision.
- **Locked boundaries (carried in every section):** Plugin cancelled · Top = Nexus AI
  Orchestration Model, SDLC is *one* pipeline under it · Core Ability != Agent · Team Lead !=
  Supervisor · Skill != Tool · Governance != Audit · Evidence != Trace.

---

## 1. Purpose and what this plan is *not*

The Nexus AI Orchestration Model's SDLC pipeline is already specified as **data**: a 31-stage
ordered pipeline definition, per-stage contracts, a cross-stage runtime-rules file, and JSON
Schemas that constrain both. A **pipeline runner** is the (future) component that would *read that
data and walk it deterministically* under no-human governance.

This plan defines the runner's responsibilities, inputs, internal phases, and invariants so that a
future implementation workpackage can be written against a fixed target. It deliberately stops at
design.

**Explicit non-goals (doc 21 §3, restated):**

| Non-goal | Consequence for this plan |
|----------|---------------------------|
| Runtime code change | No code, pseudocode-as-implementation, or file-by-file build steps are produced here. Diagrams below are illustrative, not source. |
| Product refactor | This plan does not restructure any existing artifact; it consumes the blueprint as-is. |
| Connector integration | The runner's tool/model/governance/audit dependencies are described as **resolver boundaries** (separate plans), never as wired integrations. |
| Deploy / publish | The runner is never described as deployed; "run" here means walking the stage graph in a design sense. |
| `main`-branch merge | This file is authored on the `nexus` branch and is never merged to `main`. |
| Plugin registry | No plugin stage, field, or registry appears; the runner must *reject* any such concept (see [§9](#9-locked-decision-guards-the-runner-must-enforce)). |

> **The runner is a stage-graph walker, not an agent.** It does not "decide" creatively; it
> evaluates declared gates and follows declared routes. This is enforced by the
> `pipeline_as_agent_chat` anti-pattern (runtime-rules `anti_patterns[0]`).

---

## 2. Blueprint artifacts this plan builds on

Every behavior below is derived from artifacts that **already exist** in the repo. The runner adds
no new policy; it *executes the existing contracts*.

| Artifact | Path | What the runner consumes from it |
|----------|------|----------------------------------|
| **SDLC pipeline definition** | [`../../../configs/nexus-ai/sdlc_pipeline.yaml`](../../../../configs/nexus-ai/sdlc_pipeline.yaml) | Canonical 31-stage ordered list, `entry_criteria`, `exit_criteria`, `blocking_conditions`, `allowed_rework_routes`, `required_gates.always` / `.conditional`, `required_evidence`, `required_trace`, the 7 `uses_*` registry bindings. |
| **31 stage contracts** | [`../../../configs/nexus-ai/stages/sdlc/*.yaml`](../../../../configs/nexus-ai/stages/sdlc/README.md) | Per-stage `gates`, `on_pass`, `on_fail`, `rework_route`, `blocking_conditions`, `optional_conditions`, `conditional_required_gates`, `applicability_decision` (conditional stages), `max_iterations`, and the per-stage `uses_*` bindings. |
| **Runtime rules** | [`../../../configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml`](../../../../configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml) | `rework_routing_table.by_stage` (authoritative failure→target per all 31 stages), `by_failure_type` index, `routing_invariants`, `iteration_policy`, `routing_terminals`, `anti_patterns`, `locked_decision_guards`. |
| **Pipeline-definition schema** | [`../../../configs/nexus-ai/schemas/pipeline_definition.schema.json`](../../../../configs/nexus-ai/schemas/pipeline_definition.schema.json) | The shape a *valid definition* must satisfy before the runner will load it. |
| **Pipeline-run schema** | [`../../../configs/nexus-ai/schemas/pipeline_run.schema.json`](../../../../configs/nexus-ai/schemas/pipeline_run.schema.json) | The shape of the run instance the runner creates and mutates: `run_status` enum, `active_stage`, `completed_stages`, `blocked_stages`, `next_action`, `governance_state`, `evidence`/`trace`, the `used_*` arrays. |
| **Stage-contract schema** | [`../../../configs/nexus-ai/schemas/stage_contract.schema.json`](../../../../configs/nexus-ai/schemas/stage_contract.schema.json) | The shape each embedded/looked-up stage contract must satisfy. |
| **Pipeline contract standard** | [`../07-pipeline-contract-standard.md`](../../legacy/07-pipeline-contract-standard.md), [`../08-sdlc-pipeline-contract.md`](../../pipelines/sdlc/08-sdlc-pipeline-contract.md) | §2 definition fields, §3 run fields, §4 stage-contract fields; doc 08 §4 mandatory + conditional gates, §6 development-completion aggregation, §7 release-candidate gating. |
| **Pipeline model** | [`../05-pipeline-model.md`](../../legacy/05-pipeline-model.md) | §5 rework routing, §6 iteration policy, §7 anti-patterns — the source the runtime-rules file formalizes. |
| **Executor / owner boundary** | [`../executor-standard/README.md`](../../legacy/executor-standard/README.md), [`../22-final-stop-rule-and-readiness-gate.md`](../../legacy/22-final-stop-rule-and-readiness-gate.md) | The owner-approval gate that must clear before this plan becomes implementation ([§11](#11-owner-approval-dependency-explicit)). |
| **Readiness verdict** | [`../reviews/implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md) | `PASS_WITH_FINDINGS`; confirms the corpus is ready for *planning* (this doc), with item 10 (owner approval) still pending. |

**Sibling runtime/refactor plans** (doc 21 §5) that this plan hands off to rather than duplicates —
each is its own document and may not yet exist:

- [`pipeline-run-state-model.md`](./pipeline-run-state-model.md) — owns the detailed state object,
  status lifecycle, and persistence of the run record. **This runner plan defines transitions;
  the state-model plan defines the durable shape they mutate.**
- [`shared-registry-loader-plan.md`](./shared-registry-loader-plan.md) — resolves the 7 `uses_*`
  registry references the runner depends on.
- [`governance-engine-plan.md`](./governance-engine-plan.md) — evaluates governance profiles; the
  runner *calls* it at every gate but does not contain it.
- [`audit-evidence-store-plan.md`](./audit-evidence-store-plan.md) — persists evidence/trace items
  the runner emits.
- [`tool-permission-system-plan.md`](./tool-permission-system-plan.md),
  [`model-provider-resolver-plan.md`](./model-provider-resolver-plan.md),
  [`context-memory-resolver-plan.md`](./context-memory-resolver-plan.md) — resolve the stage's
  tool / model / context bindings.
- [`core-abilities-alignment.md`](./core-abilities-alignment.md) — keeps Core Abilities as abilities;
  the runner never instantiates one as an agent.
- [`executor-integration-plan.md`](./executor-integration-plan.md) — how an executor environment
  would *invoke* a runner. The runner is invoked by an executor; it is not itself an executor.

> **Boundary statement:** the runner is the **orchestration spine**. Anything it *resolves*
> (registry entries, model/provider, tools, context) or *delegates* (governance evaluation,
> evidence/trace persistence, stage execution by an owner agent) belongs to a sibling plan. This
> doc owns only definition-loading, run creation, transition, routing, conditional-gate
> evaluation, status, and iteration limits.

---

## 3. Runner responsibilities at a glance

```text
            ┌───────────────────────── PIPELINE RUNNER (design) ─────────────────────────┐
            │                                                                              │
  pipeline  │   (1) DEFINITION LOADER ── validate vs pipeline_definition.schema.json       │
 definition │            │              resolve 31 stage_ids -> stage contracts            │
  + stages ─┼──────────► │              build routing/iteration tables from runtime-rules  │
            │            ▼                                                                  │
   run goal │   (2) RUN INSTANCE CREATION ── check entry_criteria                           │
  + context ┼──────────► build pipeline_run record (run_status=pending -> in_progress)      │
            │            ▼                                                                  │
            │   (3) STAGE TRANSITION LOOP  ◄──────────────────────────┐                     │
            │            │   set active_stage; (conditional) applicability check            │
            │            │   delegate stage execution to owner_agent (NOT in this plan)     │
            │            ▼                                                                   │
            │   (4) GATE EVALUATION ── always gates + applicable conditional gates           │
            │            │   delegate policy verdicts to governance-engine (sibling)        │
            │            ▼                                                                   │
            │   (5) ROUTING ── on_pass | on_fail | rework_route                              │
            │            │   resolve relevant_failed_stage; honor routing_invariants        │
            │            ▼                                                                   │
            │   (6) ITERATION / STATUS ── count iterations; enforce limits ────────────────┘ │
            │            │   block_and_report on limit; reach `done` on exit_criteria        │
            │            ▼                                                                   │
            │   evidence + trace emitted at every step (DISTINCT stores; sibling persists)   │
            └──────────────────────────────────────────────────────────────────────────────┘
```

Sections 4–8 specify each numbered phase. The diagram is illustrative; it is not an
implementation artifact.

---

## 4. Pipeline definition loader (doc 21 §7 — "Pipeline Definition loader")

### 4.1 Inputs

- A **pipeline definition** identified by `pipeline_id` (for the SDLC pipeline:
  `sdlc_pipeline`, version `draft-0.1`) — i.e. the contents of `sdlc_pipeline.yaml`.
- The set of **stage contracts** the definition's `stages` list references (the 31 files under
  `stages/sdlc/`). Per `pipeline_definition.schema.json`, each `stages[]` entry is *either* a
  snake_case `stage_id` reference *or* a full inline `stage_contract`; the SDLC definition uses
  the reference form, so the loader must resolve each id to its contract file.
- The **runtime-rules** document (`sdlc_pipeline_runtime_rules.yaml`) bound to the same
  `pipeline_id`.

### 4.2 Loader phases (design)

1. **Parse + schema-validate the definition** against
   `pipeline_definition.schema.json`. A definition that fails schema validation is *not loaded*;
   the loader refuses it (this is a precondition, not a gate failure). Note the schema's
   `additionalProperties: false` and global `not: { required: [plugin] }` — an unknown field or
   any `plugin` key is a hard load rejection ([§9](#9-locked-decision-guards-the-runner-must-enforce)).
2. **Resolve the stage list** — for each `stage_id` in `stages`, locate the matching stage
   contract and schema-validate it against `stage_contract.schema.json`. The loader asserts:
   - every referenced `stage_id` resolves to exactly one contract;
   - the contract's `stage_id` matches the reference;
   - all 7 `uses_*` arrays are present (may be empty) — required by the schema.
   *Resolution of the registry **values** inside those arrays is the
   [shared-registry-loader-plan](./shared-registry-loader-plan.md)'s job, not the runner's; the
   runner only checks presence/shape here.*
3. **Build the routing table** from `runtime-rules.rework_routing_table.by_stage` (the
   authoritative per-stage failure→target map covering all 31 stages) and cross-check it against
   each contract's own `rework_route`. Where the runtime-rules file already flags a source
   conflict (e.g. `domain_regulatory_compliance_validation_if_applicable`: stage file says
   `security_privacy_design`, corrections doc §1 says `requirements`), the loader uses the
   **stage-file value as primary** exactly as the runtime-rules file documents, and records the
   conflict as an open question on the run rather than silently choosing. See
   [§10 open question OQ-1](#10-open-questions).
4. **Build the iteration policy** from `runtime-rules.iteration_policy`:
   `default_max_iterations_per_stage = 3`, `max_total_rework_cycles = 8`, and
   `on_iteration_limit_exceeded = { action: block_and_report, output: REWORK_LIMIT_EXCEEDED.md }`.
   Per-stage `max_iterations` (default 3) overrides the default *for that stage only* (runtime-rules
   `scope_notes`).
5. **Index the gate sets** — `required_gates.always` and `required_gates.conditional` from the
   definition, plus each stage's own `gates` and `conditional_required_gates`. This index is what
   [§7](#7-conditional-gate-evaluation-doc-21-7--conditional-gate-evaluation) consults.
6. **Register routing terminals** — `done`, `relevant_failed_stage`, `block_and_report` (from
   `runtime-rules.routing_terminals`). Any route target must be a known `stage_id` *or* one of
   these three (this is `routing_invariants[0]`).

### 4.3 Loader invariants (refuse-to-load conditions)

- **Closed stage universe.** Every routing target found in any stage contract
  (`on_pass`/`on_fail`/`rework_route`) and in `allowed_rework_routes` must resolve to a loaded
  `stage_id` or a routing terminal. An unresolved target is a load failure, not a run-time
  surprise.
- **Definition is immutable at load.** The loader produces a read-only resolved definition. The
  runner *runs* a definition; it never mutates it. (`pipeline_as_agent_chat` /
  `team_as_stage_owner` anti-patterns — the Team Lead orchestrator drives a run, it does not edit
  the pipeline.)
- **No plugin.** Any `plugin`-named property at any level fails the load (mirrors all three JSON
  schemas' guards).

---

## 5. Pipeline-run instance creation (doc 21 §7 — "Pipeline Run instance creation")

### 5.1 Entry-criteria check (precondition gate)

Before a run record is created, the runner verifies the definition's `entry_criteria` hold. For
`sdlc_pipeline` these are: `product_intent_or_request_provided`,
`domain_and_risk_profile_resolvable`, `sdlc_team_and_sdlc_team_lead_assigned`,
`required_skills_available_for_semantic_extraction`. If any entry criterion is unmet, **no run is
created** (this is distinct from a stage-gate failure — there is nothing yet to rework).

### 5.2 The run record (shape governed by `pipeline_run.schema.json`)

The runner instantiates a **pipeline-run** object conforming to `pipeline_run.schema.json`. The
fields it sets at creation:

| Field | Value at creation | Notes |
|-------|-------------------|-------|
| `run_id` | freshly minted unique id | shape only; minting policy is the state-model plan's |
| `pipeline_id` / `selected_pipeline` | `sdlc_pipeline` | |
| `pipeline_version` | `draft-0.1` | matches the loaded definition |
| `run_goal` | the concrete product intent | |
| `run_status` | `pending` → `in_progress` | enum: `pending` `in_progress` `blocked` `completed` `failed` `cancelled` |
| `assigned_team` | `sdlc_team` | from `required_team_type` |
| `team_lead` | `sdlc_team_lead` | schema **forbids** any Core Ability (Supervisor included) here |
| `active_stage` | `intake` | first stage of the canonical order |
| `completed_stages` / `blocked_stages` | `[]` / `[]` | |
| `run_context` / `governance_state` | empty objects, plugin-forbidden | governance posture is owned by the governance-engine plan |
| `evidence` / `trace` | `[]` / `[]` | **DISTINCT** arrays — Evidence != Trace |
| `used_core_abilities` … `used_context_memory_profiles` | `[]` | populated as the run progresses |
| `open_questions` / `blocking_findings` | `[]` (seeded with loader-recorded conflicts, e.g. OQ-1) | |
| `next_action` | `intake` | a `stage_id` or a terminal |

> **Distinction enforced at creation:** `team_lead` is `sdlc_team_lead` (an Agent/role), **never**
> the `Supervisor` Core Ability — the schema's `not` clause blocks both the PascalCase and
> lowercase ability names. This is the `supervisor_as_team_lead` locked-decision guard.

### 5.3 What run creation does *not* do

- It does not execute `intake`. Setting `active_stage = intake` only *positions* the run.
- It does not resolve registry values, models, tools, or context packs — those are resolver-plan
  responsibilities invoked later, per stage.
- It does not persist the record. The shape is defined here; durable persistence and the full
  status lifecycle belong to [`pipeline-run-state-model.md`](./pipeline-run-state-model.md).

---

## 6. Stage transition handling + `on_pass` / `on_fail` / `rework_route` (doc 21 §7)

### 6.1 The transition loop (design)

Starting from `active_stage`, the runner repeats the following until it reaches a terminal
(`done` / `block_and_report`) or the run becomes `blocked`/`failed`:

1. **Conditional applicability check (conditional stages only).** If the active stage carries an
   `applicability_decision` block (the `*_if_applicable` family — e.g.
   `accessibility_ux_validation_if_applicable`, `data_migration_validation_if_applicable`,
   `privacy_data_lifecycle_validation`, `api_contract_compatibility_validation`,
   `domain_regulatory_compliance_validation_if_applicable`,
   `backup_restore_dr_validation_if_applicable`, `cost_resource_governance`), the runner evaluates
   `required_when`. If false, it follows `applicability_decision.on_not_applicable.route` (e.g.
   accessibility routes to `performance_resilience`) and records the
   `applicability_decision.on_not_applicable.record_evidence` artifact. The stage's gates are
   **skipped, not failed** — a not-applicable conditional gate is neither a pass nor a fail (see
   [§7.2](#72-three-valued-conditional-gate-status)).
2. **Stage execution (delegated — out of scope).** The owner agent named by the stage contract's
   `owner_agent` (always a role, never a Core Ability) performs the stage's work and emits its
   declared `outputs`, `evidence`, and `trace`. **This runner plan does not specify how a stage
   executes** — that is the owner agent's behavior, invoked via the executor-integration plan. The
   runner only consumes the resulting gate inputs.
3. **Gate evaluation.** See [§7](#7-conditional-gate-evaluation-doc-21-7--conditional-gate-evaluation).
4. **Route selection.** See [§6.2](#62-route-selection).
5. **Status + iteration update.** See [§8](#8-status-tracking--iteration-limits-doc-21-7).

### 6.2 Route selection

Each stage contract declares three route fields. The runner selects exactly one per stage
evaluation:

| Outcome | Field used | Example (intake → … ) |
|---------|-----------|------------------------|
| All required gates pass | **`on_pass`** | `intake.on_pass = domain_risk_profile` |
| A gate fails | **`on_fail`** | `intake.on_fail = intake`; `verification_loop_bug_finding.on_fail = implementation` |
| Re-entry target for rework | **`rework_route`** | `requirements_review.rework_route = requirements`; aggregate stages use `relevant_failed_stage` |

Design rules the runner obeys (all from `runtime-rules.routing_invariants`):

- **Declared targets only.** The runner follows the stage's *declared* route. It MAY NOT improvise
  a different target (`routing_invariants[1]`). The pipeline is a deterministic stage graph, not
  agent chatter.
- **`relevant_failed_stage` resolution.** For aggregate stages
  (`evidence_graph_build`, `development_completion`, and the accessibility stage), `on_fail` /
  `rework_route = relevant_failed_stage`. The runner must resolve this to the *specific upstream
  stage whose gate/evidence actually failed* (`routing_invariants[2]`), using the recorded gate
  results — not to a fixed stage. If the failed gate cannot be attributed to a single upstream
  stage, that is a blocking finding, not a guess.
- **Backward-or-self only.** Rework targets point **upstream or to self**; rework MUST NOT skip
  forward past an un-re-evaluated gate (`routing_invariants[3]`). After rework completes upstream,
  the run resumes forward through the normal `on_pass` chain — re-crossing every intervening gate.
- **`block_and_report` is reachable only via the iteration limit** (`routing_invariants[4]`), never
  as a normal stage's declared route. See [§8](#8-status-tracking--iteration-limits-doc-21-7).
- **`done` only after the exit criteria.** The terminal `done` is reached after
  `refraction_learning` and only when the definition's `exit_criteria` hold
  ([§8.4](#84-reaching-done)).

### 6.3 Worked transition examples (illustrative, from the real contracts)

- **Happy path front:** `intake` → (`on_pass`) `domain_risk_profile` → `skill_semantic_extraction`
  → `requirements` → `requirements_review` …
- **Review-gate rework:** `requirements_review` fails → `rework_route = requirements`; after
  `requirements` re-passes, flow returns to `requirements_review`, then forward.
- **Defect rework:** `verification_loop_bug_finding` fails → `on_fail = implementation` (a
  backward jump of several stages); all gates between `implementation` and
  `verification_loop_bug_finding` are re-evaluated on the way forward.
- **Release gating:** `development_completion` aggregates every required + applicable conditional
  gate (doc 08 §6); `on_pass = release_candidate`, `on_fail = relevant_failed_stage`. A
  `release_candidate` can never be produced before `development_completion` passes (doc 08 §7;
  pipeline `blocking_conditions` includes `release_candidate_attempted_before_development_completion`),
  enforced by the `release_candidate_without_policy_gate` anti-pattern.

> The runner does **not** encode these examples as special cases — they fall out of following the
> declared `on_pass`/`on_fail`/`rework_route` fields plus the routing invariants.

---

## 7. Conditional gate evaluation (doc 21 §7 — "conditional gate evaluation")

### 7.1 Two gate populations

The runner distinguishes the definition's two gate populations (`sdlc_pipeline.yaml`
`required_gates`):

- **`always`** — 17 gates required for *every* product-grade run (e.g. `requirements_complete`,
  `code_review_pass`, `tests_pass`, `verification_loop_bug_finding_pass`, `security_validation_pass`,
  `supply_chain_pass`, `sbom_present`, `agentic_safety_eval_pass`, `evidence_graph_complete`,
  `no_blocking_policy_failure`).
- **`conditional`** — 7 gates required *only when applicable* (e.g.
  `accessibility_pass_if_applicable`, `data_migration_pass_if_applicable`,
  `privacy_lifecycle_pass_if_applicable`, `api_contract_compatibility_pass_if_applicable`,
  `backup_restore_dr_pass_if_applicable`, `compliance_pass_if_applicable`,
  `cost_resource_governance_pass_if_applicable`).

### 7.2 Three-valued conditional gate status

A conditional gate is evaluated to one of **three** values, never coerced to a boolean too early:

| Status | When | Effect on routing/aggregation |
|--------|------|-------------------------------|
| **applicable + pass** | `required_when` true *and* the gate passed | counts as satisfied |
| **applicable + fail** | `required_when` true *and* the gate failed | triggers the owning stage's `on_fail` / `rework_route`; blocks `development_completion` |
| **not_applicable** | `required_when` false (per the upstream `applicability_decision`) | **neither pass nor fail**; recorded as `record_evidence` and treated as satisfied-by-non-applicability at aggregation |

The applicability verdict comes from the upstream stage's `applicability_decision.required_when`
(e.g. `product_has_ui == true or ui_changeset_present == true` for accessibility). The runner
**evaluates the declared `required_when` expression against run context**; it does not invent
applicability. The *expression-evaluation mechanism itself* (how `product_has_ui` is sourced) is a
boundary shared with the run-state and context-memory resolver plans — flagged as
[OQ-2](#10-open-questions).

### 7.3 Gate verdicts are governance-delegated

The runner asks **whether** every required gate (always) and every applicable conditional gate has
a pass verdict. It does **not** itself decide policy outcomes — `blocker` / `major` / `advisory`
severity handling, policy-bypass prevention, and the owner decision boundary live in
[`governance-engine-plan.md`](./governance-engine-plan.md) (doc 21 §8). The runner consumes the
governance engine's verdict and the stage's `gates` results, then routes. This keeps **Governance
!= Audit** and prevents the runner from becoming a second, conflicting policy authority.

### 7.4 Aggregate evaluation at `development_completion`

`development_completion` is the always-on aggregate gate (doc 08 §6). The runner, at that stage,
confirms via the governance engine and the recorded gate results that:

- all `always` gates passed;
- every `conditional` gate is either **applicable+pass** or **not_applicable** (resolved via its
  upstream applicability decision);
- no `blocking_conditions` hold (e.g. `any_required_gate_failed`,
  `applicable_conditional_gate_failed`, `missing_required_evidence`, `evidence_graph_incomplete`,
  `unresolved_blocker_finding`, `accepted_risk_without_owner`).

On any failure it routes to `relevant_failed_stage`; otherwise `on_pass = release_candidate`.

---

## 8. Status tracking + iteration limits (doc 21 §7)

### 8.1 Run status lifecycle

The runner maintains `run_status` over the closed enum from `pipeline_run.schema.json`:

```text
 pending ──► in_progress ──┬─► completed   (exit_criteria met; final active_stage = done)
                           ├─► blocked      (iteration limit hit -> block_and_report; or
                           │                 unresolved blocking_condition / hard-blocker)
                           ├─► failed        (run abandoned without satisfying exit_criteria)
                           └─► cancelled     (externally cancelled by the owner/executor)
```

Alongside the scalar status, the runner maintains: `active_stage` (current `stage_id` or
terminal), `completed_stages` (ordered), `blocked_stages`, `next_action` (target `stage_id` or
terminal), `blocking_findings`, and `open_questions`. The **durable** representation and exact
transition guards of this lifecycle are owned by
[`pipeline-run-state-model.md`](./pipeline-run-state-model.md); this plan defines *which transitions
the runner triggers*, not how the record is stored.

### 8.2 Iteration counting

Two counters, both from `runtime-rules.iteration_policy`:

- **Per-stage iteration count** — incremented each time a stage is (re-)entered for rework.
  Compared against that stage's `max_iterations` (default 3 from
  `default_max_iterations_per_stage`; a stage's own `max_iterations` overrides for that stage
  only).
- **Total rework cycles** — incremented on *every* rework hop across the whole run. Compared
  against `max_total_rework_cycles = 8`.

### 8.3 Iteration-limit enforcement

Per `runtime-rules.iteration_policy.scope_notes`: if **either** a stage hits its per-stage
`max_iterations` **or** the run hits `max_total_rework_cycles`, the runner takes
`on_iteration_limit_exceeded.action = block_and_report`:

- set `run_status = blocked`, `active_stage = block_and_report`, `next_action = block_and_report`;
- emit the `REWORK_LIMIT_EXCEEDED.md` report as run evidence, recording the offending stage, the
  failure type, the route taken, and the iteration counts (per the runtime-rules contract);
- stop auto-looping. This honors doc 05 §6 ("no-human sistemde sonsuz loop yasaktır") and
  `routing_invariants[4]` (`block_and_report` is reached *only* via the iteration limit).

> The runner never silently exceeds a limit and never auto-loops past it. `block_and_report` is a
> terminal for the auto-runner; resuming requires action outside the runner's authority.

### 8.4 Reaching `done`

The terminal `done` is set only after `refraction_learning` completes **and** the definition's
`exit_criteria` hold: `development_completion_pass`, `all_always_required_gates_pass`,
`all_applicable_conditional_gates_pass`, `release_candidate_report_produced`,
`refraction_learning_complete`. At that point `run_status = completed`, `active_stage = done`,
`next_action = done`.

### 8.5 Evidence vs trace emitted during status tracking

At every transition the runner contributes to **two distinct** record sets (Evidence != Trace):

- **Evidence** (decision proof) — e.g. gate results, `DEVELOPMENT_COMPLETION_GATE_RESULT`,
  `REWORK_LIMIT_EXCEEDED.md`, applicability-decision records.
- **Trace** (operation log) — e.g. the run's `stage_gate_decision_trace`, `rework_routing_trace`,
  `iteration_count_trace`, `governance_gate_evaluation_trace` (the `required_trace` set in
  `sdlc_pipeline.yaml`).

Persisting both is the [`audit-evidence-store-plan.md`](./audit-evidence-store-plan.md)'s job; the
runner only *emits* them and keeps the two streams separate.

---

## 9. Locked-decision guards the runner must enforce

These mirror `runtime-rules.anti_patterns` and `locked_decision_guards`. A future runner that
violated any of them would be non-conformant; the plan calls them out so the implementation target
is unambiguous.

| Guard | Runner behavior | Source |
|-------|-----------------|--------|
| **No plugin** | Reject any definition/contract/run carrying a `plugin` field or a plugin stage at load. | `anti_patterns.plugin_stage`; all 3 JSON schemas' plugin guards |
| **Deterministic graph, not chat** | Follow declared routes only; never improvise a target; never mutate the definition. | `anti_patterns.pipeline_as_agent_chat`; `routing_invariants[1]` |
| **Team is not a stage owner** | `owner_agent` is always a role; `sdlc_team` is the owning team, never an owner. | `anti_patterns.team_as_stage_owner` |
| **Core Ability is not an owner/agent** | Never instantiate `Supervisor`/`Coder`/`Vision`/`Audio`/`Creative`/`Memory`/`Web`/`OS` as `owner_agent`, sub-agent, or team member. | `locked_decision_guards.core_ability_as_owner_or_agent`; schema `ownerAgentRole` `not` clause |
| **Supervisor is not the Team Lead** | `team_lead = sdlc_team_lead`; Supervisor stays a Core Ability. | `locked_decision_guards.supervisor_as_team_lead`; schema `team_lead` `not` clause |
| **No self-approval** | A review/gate stage's `owner_agent` must differ from the reviewed artifact's author; the runner does not route around that. | `locked_decision_guards.self_approval_gate`; `no_self_approval_policy` |
| **No deploy before development_completion** | Publication/deploy stages are optional and only *after* `release_candidate`; the core pipeline ends at `refraction_learning`. | `anti_patterns.deploy_before_development_completion` |
| **verification-loop != test_execution** | Treat stage 14 (`test_execution`) and stage 15 (`verification_loop_bug_finding`) as distinct; don't substitute one for the other. | `anti_patterns.verification_loop_replaces_test_execution`; Skill != Tool |
| **No skill binding without semantic extraction** | `skill_semantic_extraction` precedes all skill-using stages. | `anti_patterns.skill_binding_without_semantic_extraction` |
| **Concept boundaries kept** | Skill != Tool, Governance != Audit, Evidence != Trace are preserved in the run record and emitted records. | `locked_decision_guards.concept_boundary_collapse` |

---

## 10. Open questions

These are recorded as open questions (doc 20 §8 artifact rule 4: open questions are separate from
decisions), to be resolved with the owner / in the runtime-refactor-plan review — **not** decided
unilaterally here.

- **OQ-1 — `domain_regulatory_compliance_validation_if_applicable` rework target.** The
  runtime-rules file (`rework_routing_table.by_stage`) and the stage file route this failure to
  `security_privacy_design`, while
  `docs/ai-sdlc-factory/sdlc-stages/06-canonical-corrections-and-overrides.md` §1 says
  `requirements`. This plan uses the **stage-file value as primary** (matching the runtime-rules
  documented resolution) and records the conflict on the run. The runner should not hard-code a
  silent winner; the source conflict needs an owner ruling.
- **OQ-2 — applicability-expression evaluation boundary.** Conditional gate evaluation
  ([§7.2](#72-three-valued-conditional-gate-status)) depends on evaluating `required_when`
  expressions (e.g. `product_has_ui == true`) against run context. *Where those facts are sourced*
  (intake/domain outputs, run context) and *what expression grammar* is supported are shared with
  the run-state-model and context-memory-resolver plans. This runner plan assumes the expression is
  evaluable and deterministic; the evaluation mechanism is deferred to those plans.
- **OQ-3 — `relevant_failed_stage` attribution when multiple upstream gates fail.** The invariants
  require resolving `relevant_failed_stage` to *the* specific failed upstream stage. When an
  aggregate stage (e.g. `development_completion`) sees more than one failed upstream gate, the
  attribution / ordering policy (route to the earliest? raise a multi-target blocking finding?) is
  not pinned by the current artifacts and needs a decision in the runtime-refactor-plan review.
- **OQ-4 — runner/state-model split of the status lifecycle.** This plan defines *which*
  transitions the runner triggers; the durable status record, `run_id` minting, and persistence
  belong to [`pipeline-run-state-model.md`](./pipeline-run-state-model.md). The exact ownership line
  for transition *guards* (validated here vs there) should be confirmed once that sibling plan
  exists so the two do not diverge.

---

## 11. Owner-approval dependency (explicit)

**This plan does not authorize building a pipeline runner.** It is a Phase G/H planning artifact
produced under the executor workflow standard, and it sits entirely **upstream** of the
implementation line.

- **Per-workpackage gate (executor-standard README §3.1):** this document is an executor output; it
  requires a completion report and a ChatGPT review verdict
  ([`../reviews/runtime-refactor-plan-review.md`](../../reviews/runtime-refactor-plan-review.md), doc 21
  §10) before its workpackage is considered closed. `PASS_WITH_FINDINGS` is acceptable only with no
  blocking findings; findings carry forward.
- **Phase-level gate (doc 22 §5–§7):** even with every plan doc reviewed, **no implementation or
  refactor begins** until the doc 22 readiness gate is satisfied (planning complete, execution
  complete, required review verdicts `PASS`/`PASS_WITH_FINDINGS` with no blocking findings, no hard
  blockers) **and** the owner issues:

  ```text
  OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
  or
  OWNER_DECISION: HOLD_FOR_MORE_REVIEW
  ```

- **Readiness status today:** [`../reviews/implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md)
  is `PASS_WITH_FINDINGS` — the corpus is ready to *plan* the runtime (this doc); doc 22 §6 item 10
  (owner approval) remains the pending final gate and is **not** satisfied by this plan.
- **Even on `APPROVE`,** the next phase is *Runtime / Refactor Implementation Planning Handoff* (doc
  22 §8) — preparing implementation workpackages — **not** writing the runner. Until that owner
  decision lands, the doc 22 §9 prohibitions stand: no runtime code change, no product refactor, no
  connector integration, no Nexus publish, no deploy, no `main` merge, no production-readiness claim.

> **Net statement:** the pipeline runner described here may be *implemented only after* (a) this
> plan's review verdict clears with no blocking findings, (b) the doc 22 readiness gate is
> satisfied, and (c) the owner explicitly approves the implementation transition. Until all three
> hold, this remains a design on paper.

---

## 12. Exit criteria for this plan (doc 21 §11, scoped to this doc)

- [x] `docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-runner-plan.md` exists (this file).
- [x] It covers every doc 21 §7 item: definition loader (§4), run instance creation (§5), stage
  transition handling + `on_pass`/`on_fail`/`rework_route` (§6), conditional gate evaluation (§7),
  status tracking + iteration limits (§8).
- [x] It references the concrete blueprint artifacts it builds on (§2) and the sibling resolver
  plans it delegates to.
- [x] No code changed; no runtime implementation started; this is a plan only.
- [x] The owner-approval dependency is explicit (§11).
- [ ] Review verdict exists ([`../reviews/runtime-refactor-plan-review.md`](../../reviews/runtime-refactor-plan-review.md)) — pending (doc 21 §10).
- [ ] Owner explicitly approves the next phase — pending (doc 22 §7).

---

*Documentation / blueprint only. No runtime code, no merge, no deploy, no connector, no plugin. The
pipeline runner is not built until the doc 22 readiness gate is satisfied and the owner explicitly
approves the transition.*
