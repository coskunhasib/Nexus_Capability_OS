# Pipeline Run State Model — Planning Only

How a future Nexus AI runtime would represent, persist, and transition the **state of a
single Pipeline Run** — `run_id`, `selected_pipeline`, `assigned_team`, `active_stage`,
`completed_stages`, `blocked_stages`, `run_context`, `governance_state`, `evidence`,
`trace`, `open_questions`, `blocking_findings`, `next_action` (and the rest of the 07
Pipeline Run Contract). This is **documentation / blueprint only**. It is a PLAN that
describes HOW the runtime would manage run state; it does **not** implement anything.

- **Phase:** G/H (doc 21 — [`../21-runtime-refactor-planning-only-plan.md`](../../legacy/21-runtime-refactor-planning-only-plan.md), §4 "Pipeline run state model plan"; §5 required output `runtime-refactor-plan/pipeline-run-state-model.md`)
- **Models:** the **07 Pipeline Run Contract** = [`../07-pipeline-contract-standard.md`](../../legacy/07-pipeline-contract-standard.md) §3 (the 25-field Pipeline Run shape) — D-009 Pipeline != Pipeline Run.
- **Machine-readable contract this plan is bound to:** [`../../../configs/nexus-ai/schemas/pipeline_run.schema.json`](../../../../configs/nexus-ai/schemas/pipeline_run.schema.json) (JSON Schema draft 2020-12; 25 required fields; the canonical shape this plan describes managing — no code is added here).
- **Companion plans (doc 21 §5, same series):** `runtime-refactor-plan/README.md`, `pipeline-runner-plan.md` (the engine that *mutates* this state), `governance-engine-plan.md`, `audit-evidence-store-plan.md`, `shared-registry-loader-plan.md`, `tool-permission-system-plan.md`, `model-provider-resolver-plan.md`, `context-memory-resolver-plan.md`, `core-abilities-alignment.md`, `executor-integration-plan.md`. Several are not yet authored; this doc references them as planned companions, not as existing artifacts.
- **Locked boundaries (carried throughout):** Plugin yok (D-002) · Nexus AI is the top model, SDLC is one pipeline (D-001) · Pipeline != Team · Agent != Core Ability (D-003/D-004) · SDLC Team Lead != Supervisor (D-006) · Skill != Tool · Governance != Audit · Evidence != Trace (D-008).
- **Status of this layer:** PLAN ONLY. No runtime code, no product refactor, no connector integration, no deploy/publish, no main-branch merge, no plugin registry. Transition to any implementation is gated by [`../22-final-stop-rule-and-readiness-gate.md`](../../legacy/22-final-stop-rule-and-readiness-gate.md) plus an explicit **owner decision** (see §11).

> This plan invents no fields. Every run-state field below already exists in the 07
> Pipeline Run Contract (§3) and in `pipeline_run.schema.json`
> (`pipeline_run_required_fields` in
> [`../../../configs/nexus-ai/pipeline_contract_standard.yaml`](../../../../configs/nexus-ai/pipeline_contract_standard.yaml)).
> The contribution here is a **planning narrative**: what each field means *as live run
> state*, how it would be populated and transitioned, what invariants must hold, and which
> existing blueprint artifact is its source of truth. The companion `pipeline-runner-plan.md`
> owns the *engine* that performs the transitions; this doc owns the *state shape and rules*.

---

## 1. Purpose and scope

A **Pipeline Definition** is a template (`configs/nexus-ai/sdlc_pipeline.yaml` for the SDLC
pipeline). A **Pipeline Run** is one live execution of that template (D-009). The runtime
needs a single, well-defined, auditable representation of a run's state so that:

- the run can be **resumed deterministically** after any pause (no-human governance; the
  state, not a conversation, is the source of truth),
- governance gates and audit (evidence + trace) can be enforced **against persisted state**
  rather than re-derived,
- the **iteration / rework limits** (`sdlc_pipeline_runtime_rules.yaml`) can be counted and
  enforced, and
- a reviewer can read the run state and know exactly *where* the run is, *why* it is there,
  and *what happens next*.

**In scope:** the state object schema (the 25 Pipeline Run fields), the run lifecycle and
status values, the legal stage-transition rules (as a plan that *defers* routing logic to the
runtime rules + the pipeline-runner plan), the invariants that must always hold over the
state, the persistence/identity model, and the explicit owner-approval dependency.

**Out of scope (non-goals, doc 21 §3):** writing the runner/engine code; writing the
governance engine, audit store, or any resolver; defining new stages or gates; any
connector, deploy, publish, main-merge, or plugin work. Those are either separate plans in
this series or are forbidden in this phase entirely.

---

## 2. Source-of-truth map (what this plan builds on)

Every run-state field traces to an existing blueprint artifact. The runtime would **read**
these; it would not redefine them.

| Concern | Authoritative artifact(s) |
| --- | --- |
| Run-state field set (25 fields) | [`../07-pipeline-contract-standard.md`](../../legacy/07-pipeline-contract-standard.md) §3; [`../../../configs/nexus-ai/pipeline_contract_standard.yaml`](../../../../configs/nexus-ai/pipeline_contract_standard.yaml) `pipeline_run_required_fields` |
| Machine-readable run shape | [`../../../configs/nexus-ai/schemas/pipeline_run.schema.json`](../../../../configs/nexus-ai/schemas/pipeline_run.schema.json) |
| Selected pipeline / definition | [`../../../configs/nexus-ai/sdlc_pipeline.yaml`](../../../../configs/nexus-ai/sdlc_pipeline.yaml); [`../../../configs/nexus-ai/pipeline_catalog.yaml`](../../../../configs/nexus-ai/pipeline_catalog.yaml); schema [`pipeline_definition.schema.json`](../../../../configs/nexus-ai/schemas/pipeline_definition.schema.json) |
| Stage set + ordering + per-stage on_pass/on_fail/rework_route | [`../../../configs/nexus-ai/stages/sdlc/*.yaml`](../../../../configs/nexus-ai/stages/sdlc/README.md) (31 stage contracts); schema [`stage_contract.schema.json`](../../../../configs/nexus-ai/schemas/stage_contract.schema.json) |
| Transition / rework routing + iteration limits + anti-patterns | [`../../../configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml`](../../../../configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml) |
| `governance_state` source | [`../../../configs/nexus-ai/governance_profiles.yaml`](../../../../configs/nexus-ai/governance_profiles.yaml) + `configs/nexus-ai/governance/**` (Global/Pipeline/Team/Stage/Core-Ability/Skill/Tool — D-007) |
| `evidence` items | [`../../../configs/nexus-ai/schemas/evidence_item.schema.json`](../../../../configs/nexus-ai/schemas/evidence_item.schema.json); [`../../../configs/nexus-ai/audit_schemas.yaml`](../../../../configs/nexus-ai/audit_schemas.yaml) |
| `trace` items | [`../../../configs/nexus-ai/schemas/trace_item.schema.json`](../../../../configs/nexus-ai/schemas/trace_item.schema.json); `audit_schemas.yaml` |
| `assigned_team` / `team_lead` | [`../../../configs/nexus-ai/team_templates.yaml`](../../../../configs/nexus-ai/team_templates.yaml); [`../../../configs/nexus-ai/team_lead_roles.yaml`](../../../../configs/nexus-ai/team_lead_roles.yaml) (SDLC → `sdlc_team` / `sdlc_team_lead`) |
| `used_*` registry mappings | the 7 shared registries: `core_abilities`, `skills_registry`, `tools_registry`, `governance_profiles`, `audit_schemas`, `model_provider_profiles`, `context_memory_profiles` (`.yaml`) |
| `run_context` provisioning | [`../../../configs/nexus-ai/context_memory_profiles.yaml`](../../../../configs/nexus-ai/context_memory_profiles.yaml) (e.g. `sdlc_run_context`) — provisioned by the planned `context-memory-resolver-plan.md` |
| Locked decisions enforced in-state | [`../00-decision-log.md`](../../legacy/00-decision-log.md) (D-001…D-010); schema `$comment` locks K-001/K-003/K-004/K-008 |

---

## 3. The Pipeline Run state object (planning view of the 07 contract §3)

The runtime would manage a single state object per run with **exactly** the 25 fields of the
07 Pipeline Run Contract — no more (the plugin field and any undeclared key are rejected by
`pipeline_run.schema.json`; D-002 / K-001), no fewer (all 25 are `required`). The fields
group into five concerns. For the SDLC pipeline, concrete defaults are shown; the model is
pipeline-agnostic (D-010 — other pipelines reuse the same shape).

### 3.1 Identity & selection (set once at run creation, then immutable)

| Field | Meaning as run state | Source of truth | Mutability |
| --- | --- | --- | --- |
| `run_id` | Stable unique id for this run; the persistence key and the value every evidence/trace item points back to via `related_run`. | runtime-assigned at creation | immutable |
| `pipeline_id` | Which Pipeline Definition this run executes (`sdlc_pipeline`). | `sdlc_pipeline.yaml` / catalog | immutable |
| `pipeline_version` | Pinned definition version (`draft-0.1`) so the run is reproducible even if the definition later changes. | definition `version` | immutable (pinned) |
| `selected_pipeline` | The selected pipeline id for this run (snake_case). Echoes `pipeline_id` for a single-pipeline run; kept distinct so multi-pipeline selection stays expressible. | pipeline catalog selection | immutable |
| `run_goal` | The concrete product intent/goal that started the run. | run intake (`intake` stage input) | immutable |

> **Why pin `pipeline_version`.** A run must remain interpretable after the definition
> evolves. The state stores the version it was created under; the runner resolves stages,
> gates, and routes from *that* version, never "latest". This is a planning rule, not code.

### 3.2 Assignment (set at creation; immutable for SDLC)

| Field | Meaning | Source of truth | Locked rule |
| --- | --- | --- | --- |
| `assigned_team` | Team executing the run. SDLC → `sdlc_team`. | `team_templates.yaml`; definition `required_team_type` | Pipeline != Team (D-005). A team is never a stage owner. |
| `team_lead` | Team-lead **role** orchestrating the run. SDLC → `sdlc_team_lead`. | `team_lead_roles.yaml`; definition `required_team_lead_role` | **`team_lead` is NEVER a Core Ability.** `pipeline_run.schema.json` explicitly forbids {Supervisor…OS} (any casing) here — Supervisor is a Core Ability, not the SDLC Team Lead (D-006). |

### 3.3 Progress (the live, mutating heart of the state)

| Field | Meaning | Source of truth | Transition owner |
| --- | --- | --- | --- |
| `run_status` | Lifecycle status: `pending` \| `in_progress` \| `blocked` \| `completed` \| `failed` \| `cancelled` (the schema enum). | `pipeline_run.schema.json` | runner (§5) |
| `active_stage` | `stage_id` of the currently executing stage, **or** a canonical terminal (`done` \| `relevant_failed_stage` \| `block_and_report`). | stage set in `sdlc_pipeline.yaml`; terminals in `sdlc_pipeline_runtime_rules.yaml` `routing_terminals` | runner |
| `completed_stages` | Ordered, unique list of `stage_id`s that have passed their gates. | stage `on_pass` outcomes | runner (append-only within a forward pass) |
| `blocked_stages` | `stage_id`s currently blocked (gate failed / blocking condition met / awaiting rework). | stage `blocking_conditions`; pipeline `blocking_conditions` | runner |
| `next_action` | The single declared next step: a target `stage_id` **or** a terminal. The resumable instruction. | derived from the active stage's `on_pass`/`on_fail`/`rework_route` per `sdlc_pipeline_runtime_rules.yaml` | runner |

> `next_action` is the contract's resumability primitive. At any persisted point the runtime
> can stop, and resume later by reading `next_action` — no conversational memory is needed.
> Its legal value space is exactly `terminalOrStage` from the schema (a known stage_id or a
> canonical terminal). The runner computes it; this model only constrains it.

### 3.4 Context, governance, and audit (Governance != Audit; Evidence != Trace)

| Field | Meaning | Source of truth | Locked rule |
| --- | --- | --- | --- |
| `run_context` | Run-scoped context/memory state (object): references to context-memory profiles such as `sdlc_run_context`, plus run-scoped working context. | `context_memory_profiles.yaml`; provisioned per `context-memory-resolver-plan.md` | object only; no plugin key (K-001) |
| `governance_state` | Current governance posture: which governance profiles are active, per-gate posture, and policy outcomes (blocker/major/advisory/informational). | `governance_profiles.yaml` + `governance/**` (D-007 layers) | **Governance, kept DISTINCT from Audit (D-007/D-008).** Evaluated by the planned `governance-engine-plan.md`; this state only *holds* the posture. |
| `evidence` | Array of **evidence items** (decision proof) produced by the run. | `evidence_item.schema.json` (07 §11) | **Evidence = decision proof. DISTINCT from trace (D-008 / K-008).** Items carry `related_run = run_id`. |
| `trace` | Array of **trace items** (operation/decision history) recorded by the run. | `trace_item.schema.json` (07 §12) | **Trace = operation history. DISTINCT from evidence (D-008 / K-008).** Never merged into `evidence`. |

> **The Evidence/Trace separation is a state-shape rule, not a convention.** `evidence[]`
> and `trace[]` are two separate arrays validated by two separate schemas. The runtime must
> never write a trace shape into `evidence` or vice-versa; the audit store plan
> (`audit-evidence-store-plan.md`) persists each family separately and links both to
> `run_id`. Collapsing them is the forbidden `concept_boundary_collapse` anti-pattern
> (`sdlc_pipeline_runtime_rules.yaml` → `locked_decision_guards`).

### 3.5 Usage attestation (what was actually used) + run signals

The seven `used_*` arrays attest what the run *actually* consumed (versus what the definition
*may* use). Each is constrained by its registry and must remain a subset of the definition's
`uses_*` declaration (§6 invariant I-7):

`used_core_abilities` (closed set {Supervisor, Coder, Vision, Audio, Creative, Memory, Web,
OS}, never agents — D-003/D-004) · `used_skills` (Skill != Tool) · `used_tools` (Tool !=
Skill) · `used_governance_profiles` · `used_audit_schemas` · `used_model_provider_profiles` ·
`used_context_memory_profiles`. Sources: the seven shared registries listed in §2.

| Field | Meaning | Source of truth |
| --- | --- | --- |
| `open_questions` | Unresolved questions raised during the run (e.g. a registry reconciliation item). Non-blocking by nature; they do not by themselves stop the run. | run signal; mirrors this corpus's review style |
| `blocking_findings` | Findings that **block** progression. Non-empty ⇒ the run cannot advance past the affected gate. | stage/pipeline `blocking_conditions`; governance blocker outcomes |
| `next_action` | (see §3.3 — repeated here as the run's terminal signal) | runner |

> **`open_questions` vs `blocking_findings` is a deliberate severity split** (it mirrors the
> `blocker`/`major`/`advisory`/`informational` `severity_values` in
> `pipeline_contract_standard.yaml`). `blocking_findings` maps to `blocker`-class outcomes and
> gates the run; `open_questions` is advisory/informational debt carried forward. The planned
> governance engine decides which bucket a finding lands in; this model only defines that the
> two buckets exist and that a non-empty `blocking_findings` forbids advancement.

---

## 4. Run lifecycle (`run_status`) — planning-level state machine

The lifecycle uses **only** the six `run_status` enum values from `pipeline_run.schema.json`.
The transitions below are a *specification of legal moves over the state*; the engine that
performs them is `pipeline-runner-plan.md`. No code is defined here.

```text
                 create run (intake)
                        │
                        ▼
                  ┌───────────┐   first stage starts   ┌───────────────┐
                  │  pending  │ ─────────────────────▶ │  in_progress  │
                  └───────────┘                        └───────┬───────┘
                                                               │
        gate fails / blocking_findings non-empty               │  all gates pass along the
        / blocking_condition met                               │  forward path …
                  ┌───────────┐ ◀───────────────────────────── │
                  │  blocked  │                                 │
                  └─────┬─────┘                                 ▼
       rework within    │      iteration/rework limit    active_stage = done
       iteration limit  │      exceeded (runtime rules)        │  (after refraction_learning)
                        ▼      ──────────▶ block_and_report    ▼
                  in_progress                   │        ┌───────────┐
                        │                        ▼        │ completed │
                        │                  ┌──────────┐   └───────────┘
                        └────────────────▶ │  failed  │
                                           └──────────┘
            cancelled : owner/governance halt at any non-terminal state
```

State-value rules (planning constraints the runtime must honor):

- **`pending`** — created, identity/assignment/version pinned, no stage started yet.
  `active_stage` = the definition's first stage (`intake`) but not yet executing;
  `completed_stages = []`, `blocked_stages = []`, `evidence = []`, `trace = []`.
- **`in_progress`** — exactly one `active_stage` is a real `stage_id` (not a terminal) and is
  executing.
- **`blocked`** — `blocked_stages` is non-empty and/or `blocking_findings` is non-empty;
  `next_action` points at the rework target the runtime rules dictate (or `block_and_report`).
- **`completed`** — `active_stage = done`; the definition's `exit_criteria`
  (`sdlc_pipeline.yaml`) are all satisfied; `next_action = done`. Terminal.
- **`failed`** — reached `block_and_report` via the iteration/rework limit
  (`sdlc_pipeline_runtime_rules.yaml` `iteration_policy.on_iteration_limit_exceeded`), with
  the `REWORK_LIMIT_EXCEEDED.md` report recorded as run evidence. Terminal.
- **`cancelled`** — an explicit owner/governance halt at any non-terminal state. Terminal.

The exact failure-type → target stage routing is **not** redefined here; it is owned by
`sdlc_pipeline_runtime_rules.yaml` (`rework_routing_table.by_stage` /
`by_failure_type`). This model only requires that whatever route the runner computes is
recorded in `next_action` and respects the routing invariants below.

---

## 5. Transition rules — what may mutate which field (responsibility boundary)

This is the **state-mutation contract** the runtime must obey. It deliberately *defers* the
decision logic to the runtime rules and the runner plan; here we fix *who* may change *what*,
so reviewers can audit the boundary.

| Mutation | Allowed when | Driven by | Reads |
| --- | --- | --- | --- |
| set identity/assignment/version (§3.1–3.2) | once, at `pending` creation | run creation step (runner) | catalog + definition + team/team-lead registries |
| advance `active_stage` forward; append to `completed_stages`; recompute `next_action` | active stage gates **pass** | runner (per stage `on_pass`) | stage contract `on_pass`; runtime rules |
| move a stage into `blocked_stages`; set `run_status=blocked`; set `next_action` to rework target | gate **fails** / `blocking_conditions` met / governance blocker | runner + governance engine | stage `on_fail`/`rework_route`; `rework_routing_table` |
| append evidence item to `evidence[]` | a stage produces decision proof | runner ↔ audit/evidence store plan | `evidence_item.schema.json` |
| append trace item to `trace[]` | any traced operation occurs | runner ↔ audit/evidence store plan | `trace_item.schema.json` |
| update `governance_state` | a gate is evaluated | governance engine plan | `governance_profiles.yaml` + `governance/**` |
| add to `used_*` arrays | a registry item is actually used | runner (attestation) | the 7 shared registries |
| add to `open_questions` / `blocking_findings` | a question/finding is raised | runner + governance engine | severity_values |
| set terminal status (`completed`/`failed`/`cancelled`) | terminal reached / limit / owner halt | runner (+ owner for `cancelled`) | `exit_criteria`; `iteration_policy` |

**Non-mutation rules (forbidden):** no actor may (a) introduce a field outside the 25-field
contract or any `plugin*` key (rejected by the schema; D-002/K-001); (b) set `team_lead` or
any owner role to a Core Ability (D-003/D-006); (c) skip a forward stage without re-evaluating
its gate; (d) merge `evidence` and `trace`; (e) clear `blocking_findings` without the
corresponding gate re-passing.

---

## 6. State invariants (must always hold over any persisted run)

A planner/reviewer (and a future validator) can check these against any run-state instance.
They are derived from the schema, the runtime rules, and the locked decisions — not invented.

- **I-1 — Shape.** The state validates against `pipeline_run.schema.json`: all 25 fields
  present; no plugin key; no undeclared key.
- **I-2 — Terminal-or-stage.** `active_stage` and `next_action` are each either a known
  `stage_id` of `pipeline_version` or a canonical terminal (`done` \| `relevant_failed_stage`
  \| `block_and_report`). (schema `terminalOrStage`; runtime-rules `routing_terminals`.)
- **I-3 — Stage-set closure.** Every id in `completed_stages` ∪ `blocked_stages` ∪
  ({`active_stage`} if not a terminal) is a member of the definition's `stages`.
- **I-4 — Disjointness + order.** `completed_stages` and `blocked_stages` are disjoint and
  unique; `completed_stages` order is consistent with the definition's stage order for the
  forward path (rework may revisit, but a stage is "completed" only after its latest gate pass).
- **I-5 — Backward-only rework.** Any rework target points upstream or to self, never forward
  past an un-re-evaluated gate (runtime-rules `routing_invariants`).
- **I-6 — Iteration ceilings.** Per-stage iterations ≤ the stage's `max_iterations`
  (default 3) and cumulative rework hops ≤ `max_total_rework_cycles` (8); exceeding either ⇒
  `next_action = block_and_report`, `run_status = failed`, `REWORK_LIMIT_EXCEEDED.md`
  recorded (runtime-rules `iteration_policy`).
- **I-7 — Used ⊆ Declared.** Each `used_*` array ⊆ the corresponding definition `uses_*`
  array; `used_core_abilities` ⊆ the closed Core-Ability set and contains no agent id
  (D-003/D-004).
- **I-8 — Team-lead identity.** `team_lead` is a snake_case role and is **not** any Core
  Ability in any casing (schema constraint; D-006).
- **I-9 — Audit linkage + separation.** Every item in `evidence[]` and `trace[]` references
  `run_id` (via `related_run`); evidence items validate against the evidence schema and trace
  items against the trace schema — never the other way (D-008/K-008).
- **I-10 — Block consistency.** `run_status = blocked` ⟺ (`blocked_stages` non-empty **or**
  `blocking_findings` non-empty). A non-empty `blocking_findings` forbids advancing
  `active_stage`.
- **I-11 — Completion gate.** `run_status = completed` ⟹ `active_stage = next_action = done`
  **and** the definition's `exit_criteria` are all satisfied — in particular
  `release_candidate` was produced only after `development_completion` passed (doc 08 §7;
  `sdlc_pipeline.yaml` `blocking_conditions`).
- **I-12 — No bypass of locked guards.** None of the
  `sdlc_pipeline_runtime_rules.yaml` `anti_patterns` / `locked_decision_guards` is violated by
  the state (no plugin stage, no Core-Ability owner, no self-approval routing,
  no Evidence==Trace collapse).

---

## 7. Persistence & identity (planning, not implementation)

What the runtime would need from a store, stated as requirements only:

- **Key.** `run_id` is the primary key; `(pipeline_id, pipeline_version)` is carried so the
  run is interpretable against a pinned definition.
- **Append-only audit.** `evidence[]` and `trace[]` are append-only and externally
  referenced by `related_run`; the planned `audit-evidence-store-plan.md` owns their durable
  store and the release-evidence bundle assembly. This model only requires that the run's
  arrays and the external store stay reconcilable by `run_id`.
- **Resumability.** Persisting the 25-field object at a gate boundary is sufficient to resume:
  `next_action` + `active_stage` + `completed_stages`/`blocked_stages` fully determine the next
  move. No conversational state is part of the contract.
- **Concurrency.** A run advances one `active_stage` at a time (single-writer per `run_id` for
  status/active_stage/next_action). Parallelism *within* a stage (e.g. sub-agents) is a stage
  concern, not a run-state concern, and does not create multiple `active_stage` values.
- **Storage technology is intentionally unspecified.** Choosing a store (file, DB, event log)
  is materialization work that is **out of scope** for this planning phase (doc 21 §3) and
  must wait for owner approval (§11).

---

## 8. Worked illustration (SDLC run state at three points) — non-normative

Illustrative only; field values follow the SDLC defaults above. No code, no real run.

**(a) Just created — `pending`**

```yaml
run_id: <assigned>
pipeline_id: sdlc_pipeline
pipeline_version: draft-0.1
selected_pipeline: sdlc_pipeline
run_goal: "<product intent from intake>"
assigned_team: sdlc_team
team_lead: sdlc_team_lead          # NOT Supervisor (D-006)
run_status: pending
active_stage: intake
completed_stages: []
blocked_stages: []
run_context: {}                    # to be provisioned (sdlc_run_context)
governance_state: {}               # to be populated by governance engine
evidence: []                       # Evidence != Trace
trace: []                          # Trace != Evidence
used_core_abilities: []            # subset of definition uses_core_abilities
used_skills: []
used_tools: []
used_governance_profiles: []
used_audit_schemas: []
used_model_provider_profiles: []
used_context_memory_profiles: []
open_questions: []
blocking_findings: []
next_action: intake
```

**(b) Mid-run, a gate failed — `blocked`** (e.g. `verification_loop_bug_finding` finds a
blocker bug; its canonical `rework_route` is `implementation`):

```yaml
run_status: blocked
active_stage: verification_loop_bug_finding
completed_stages: [intake, domain_risk_profile, skill_semantic_extraction, requirements,
  requirements_review, architecture, architecture_review, security_privacy_design,
  premortem_fmea, planning, implementation, code_review, test_generation, test_execution]
blocked_stages: [verification_loop_bug_finding]
blocking_findings: ["open_blocker_bug_count > 0"]      # blocker-severity ⇒ gates progression
next_action: implementation                            # backward-only rework (I-5)
# evidence[] now holds BUG_FINDING_REPORT (decision proof); trace[] holds the
# verification-loop skill-activation trace + tool traces (operation history) — kept separate.
```

**(c) Done — `completed`** (after `release_candidate`, then `refraction_learning`):

```yaml
run_status: completed
active_stage: done
next_action: done
# exit_criteria satisfied: development_completion_pass, all always-required + applicable
# conditional gates pass, RELEASE_CANDIDATE_REPORT produced, refraction_learning_complete.
# blocking_findings: []   (I-10/I-11)
```

---

## 9. Cross-checks against the locked decisions

| Lock | How the run-state model honors it |
| --- | --- |
| D-001 — Nexus AI is the top model; SDLC is one pipeline | The state object is pipeline-agnostic (`pipeline_id` is a field, SDLC is one value); nothing in the model treats SDLC as the top system. |
| D-002 / K-001 — Plugin cancelled | The schema rejects any `plugin*` key at every object level; the model adds none; "plugin stage" stays a forbidden anti-pattern (I-12). |
| D-003/D-004 — Core Abilities are abilities, never agents | `used_core_abilities` is the closed set; no Core Ability may be `team_lead` or any owner; I-7/I-8 enforce it. |
| D-006 — Supervisor != SDLC Team Lead | `team_lead = sdlc_team_lead`; the schema forbids any Core Ability (incl. Supervisor) in `team_lead` (I-8). |
| D-007 — Governance not blindly merged | `governance_state` holds the layered posture (Global…Tool); evaluation is the governance engine's job, kept distinct from audit. |
| D-008 / K-008 — Evidence != Trace | `evidence[]` and `trace[]` are two arrays, two schemas, append-only, both linked by `run_id` (I-9); merging is forbidden (I-12). |
| D-009 — Pipeline != Pipeline Run | This whole document models the *Run* (the live instance) against the pinned *Definition* (the template). |
| Skill != Tool | `used_skills` and `used_tools` are separate, separately-typed, separately-sourced arrays. |

---

## 10. Open questions (non-blocking; for the runtime/refactor plan review)

These are planning-level questions to resolve during materialization; none blocks this PLAN.

- **Q1 — `selected_pipeline` vs `pipeline_id` for single-pipeline runs.** They are identical
  for an SDLC run. Should the runtime require them equal unless a multi-pipeline selection
  feature exists, or always allow divergence? (Recommend: equal-by-default invariant, relaxed
  only when multi-pipeline selection is actually built.)
- **Q2 — `completed_stages` semantics under rework.** When a stage is reworked and re-passes,
  is it listed once (latest pass) or does the state also retain an attempt history? The 07
  contract field is a plain list; attempt history may belong in `trace[]` rather than in
  `completed_stages`. Decide where re-attempt history lives (recommend: counts/history in
  `trace[]`; `completed_stages` stays a set of latest-passed stages — keeps I-4 simple).
- **Q3 — `run_context` schema depth.** The schema types `run_context` as an open object. How
  much structure should the `context-memory-resolver-plan.md` impose (profile refs only, vs a
  typed working-context sub-schema)? Defer the typed schema to that companion plan.
- **Q4 — `governance_state` schema depth.** Likewise open-typed. The exact posture
  sub-schema (active profiles, per-gate state, policy outcomes) is owned by
  `governance-engine-plan.md`; this model only requires it stay Audit-distinct.
- **Q5 — Severity routing of findings.** The mapping from a raised finding to
  `blocking_findings` vs `open_questions` depends on `severity_values`
  (`blocker` ⇒ blocking; `advisory`/`informational` ⇒ open question; `major` ⇒ policy-defined).
  The precise rule is a governance-engine decision; confirm there.
- **Q6 — Inherited reconciliation debt.** The non-blocking backlog in
  [`../reviews/implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md)
  §3 (e.g. R1 dangling audit-schema ids, R6 gate-name vs rule-id) touches the registries this
  state attests against (`used_audit_schemas`, gate references). It does not block this model
  but should be cleared before the audit/evidence store and governance engine are built.

---

## 11. Owner-approval dependency (explicit)

This document is a **plan**, produced under the doc 21 planning-only regime. It changes no
runtime code, adds no field beyond the 07 contract, and authorizes nothing.

**Dependency in (precondition to writing this plan).** Per doc 21 §2, runtime/refactor
*planning* may proceed only after the Implementation Readiness review passes without blocking
findings. That gate is met:
[`../reviews/implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md)
is **PASS_WITH_FINDINGS** with **zero blocking findings** (doc 22 §6 hard blockers 1–9 CLEAR;
item 10, owner approval, is the pending *final* gate and is explicitly not a blocker for
planning).

**Dependency out (what must clear before this model is implemented).** Per doc 21 §10–§11 and
doc 22 §7, **no** runtime materialization of this state model (no store, no engine, no schema
codegen, no integration) may begin until:

1. the full runtime/refactor plan set (doc 21 §5) exists, and
2. the review [`../reviews/runtime-refactor-plan-review.md`](../../reviews/runtime-refactor-plan-review.md)
   exists with verdict PASS or PASS_WITH_FINDINGS and no blocking findings, and
3. the **owner explicitly approves** the handoff in the doc 22 §7 form:

```text
OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
or
OWNER_DECISION: HOLD_FOR_MORE_REVIEW
```

Even after approval, the next phase is *Runtime / Refactor Implementation Planning Handoff*
(implementation workpackages) — still **not** direct code (doc 22 §8). Until that owner
decision is recorded, the following remain prohibited (doc 21 §3 / doc 22 §9): runtime code
change, product refactor, connector integration, deploy/publish, main-branch merge, plugin
registry, production-readiness claim.

---

## 12. Summary

- The Pipeline Run state model **is** the 07 Pipeline Run Contract §3 (25 fields), interpreted
  as live, persisted, resumable run state, and bound to the machine-readable
  `pipeline_run.schema.json`.
- It is **pipeline-agnostic** (D-001/D-010); SDLC is the worked example. The transition logic
  is **deferred** to `sdlc_pipeline_runtime_rules.yaml` + the companion `pipeline-runner-plan.md`;
  this doc fixes the *state shape, lifecycle, mutation boundary, and invariants*.
- Every locked decision is honored *in the state shape itself* — no plugin field (D-002),
  `team_lead` never a Core Ability (D-003/D-006), Evidence and Trace as two separate arrays
  (D-008), Pipeline vs Pipeline Run kept distinct (D-009).
- This is **planning only**. Implementation is gated by the runtime/refactor plan review and an
  **explicit owner decision** (§11). Nothing here builds, refactors, deploys, merges, or
  reintroduces plugins.
