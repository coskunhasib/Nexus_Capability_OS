# WP-09 — Pipeline Runner (Implementation Workpackage Spec)

> **Implementation Planning Handoff artifact — doc 22 §8.** This is a **workpackage SPECIFICATION**:
> it describes *what* a future, separately-approved execution phase would BUILD for the Nexus AI
> Orchestration Model **pipeline runner**, and *how* that build will be validated. **Writing this
> spec is not executing it.** This document contains **no runtime code**, implements nothing, merges
> nothing, deploys nothing, wires no connector, and introduces no plugin. Producing the runtime
> modules named in [`required_outputs`](#required_outputs) requires a **further explicit owner
> decision** and is out of scope here. The `nexus` branch never merges to `main`.

- **Contract:** Implementation Workpackage Contract — doc 20 §4 (the workpackage-contract field set
  in [`../20-executor-workflow-standard-plan.md`](../../legacy/20-executor-workflow-standard-plan.md) §4, with
  the machine-readable mirror in
  [`../executor-standard/completion-report-schema.md`](../../legacy/executor-standard/completion-report-schema.md)
  §2), **plus `depends_on`** (build-sequencing extension required by the handoff).
- **Phase:** Implementation Planning Handoff (doc 22 §8) — *preparing* implementation workpackages.
  The allowed next phase after the doc 22 §7 owner approval; still **not** writing product code.
- **Source of truth for this component:** the pipeline-runner runtime/refactor PLAN
  [`../runtime-refactor-plan/pipeline-runner-plan.md`](../runtime-refactor-plan/pipeline-runner-plan.md)
  plus the relevant blueprint configs under `configs/nexus-ai/` (see
  [`canonical_sources`](#canonical_sources)). This spec says **what to build** and **how it will be
  validated**; it carries **no code**.
- **Locked boundaries (carried throughout):** Plugin cancelled · Top = Nexus AI Orchestration Model,
  SDLC is *one* pipeline under it · Core Ability != Agent · Supervisor != Team Lead · Skill != Tool ·
  Governance != Audit · Evidence != Trace · the runner is a **deterministic stage-graph walker, not
  an agent**.

---

## Workpackage contract (doc 20 §4 + `depends_on`)

```yaml
# ---------------------------------------------------------------------------
# Implementation Workpackage Contract — doc 20 §4 (+ depends_on)
# Specification of a FUTURE build unit. Authoring it changes no code and authorizes nothing.
# Field list and key order follow docs/ai-sdlc-factory/executor-standard/completion-report-schema.md §2.
# ---------------------------------------------------------------------------

workpackage_id: WP-09-pipeline-runner

executor: Codex            # doc 20 §3 — repo-oriented contract generation & validation helper

reviewer: ChatGPT          # doc 20 §3 — reviewer / auditor / plan owner; issues the verdict

depends_on:                # build-sequencing prerequisites (other workpackage ids). See "Dependency
  - WP-03                  #   detail" below. These WPs MUST be completed, reviewed (PASS /
  - WP-04                  #   PASS_WITH_FINDINGS, no blocking findings) and their built modules
  - WP-08                  #   available before WP-09 build may begin. (Build order only — this spec
                           #   may be authored now; nothing is built until the doc 22 §7 owner
                           #   decision approves the execution phase. See OQ-1 for the exact
                           #   WP-number -> component binding to confirm against the WP index.)

objective: >-
  Specify a deterministic SDLC pipeline runner that orchestrates a single Pipeline Run: it loads and
  schema-validates a Pipeline Definition and its referenced stage contracts (definition loader),
  creates the Pipeline Run instance after the entry-criteria precondition, walks stage transitions,
  applies on_pass / on_fail / rework_route route selection, evaluates conditional-stage applicability
  and conditional gates (delegating policy verdicts to the governance-engine), enforces iteration
  limits read from the runtime rules, tracks run status across the closed status enum, and emits (to
  the audit-store, never persists itself) Evidence and Trace as two DISTINCT streams at every step.
  The runner is the orchestration spine only: registry resolution, run-state persistence, governance
  policy decisions, audit/evidence persistence, model/tool/context resolution, and stage execution
  itself all belong to sibling components it calls or delegates to — never to the runner.

mandatory_context:         # context the executor MUST load before producing output
  - .memory/*                                                            # locked decisions / project memory
  - docs/ai-sdlc-factory/00-decision-log.md                             # locked decisions corpus
  - docs/ai-sdlc-factory/02-concept-boundaries.md                       # Skill!=Tool, Governance!=Audit, Evidence!=Trace, Core Ability!=Agent
  - docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md          # workpackage contract (§4), forbidden actions (§6), review gate (§7)
  - docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md       # readiness gate, hard blockers (§6), owner decision (§7), §8 next phase
  - docs/ai-sdlc-factory/executor-standard/README.md                    # 5 roles, workpackage flow, owner-approval boundary
  - docs/ai-sdlc-factory/executor-standard/completion-report-schema.md  # completion-report contract this WP must return in (§3)
  - docs/ai-sdlc-factory/runtime-refactor-plan/README.md                # plan-set overview + owner-approval dependency
  - docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-runner-plan.md  # THE component plan (source of truth for this WP)
  - docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-run-state-model.md  # sibling that owns the durable run record this runner mutates
  - docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md  # sibling that resolves the 7 uses_* references
  - docs/ai-sdlc-factory/runtime-refactor-plan/governance-engine-plan.md   # sibling that returns gate/policy verdicts
  - docs/ai-sdlc-factory/runtime-refactor-plan/audit-evidence-store-plan.md # sibling that persists evidence/trace
  - docs/ai-sdlc-factory/reviews/runtime-refactor-plan-review.md         # plan review verdict (PASS_WITH_FINDINGS) + carried findings
  - docs/ai-sdlc-factory/reviews/implementation-readiness-review.md      # readiness verdict; item 10 (owner approval) is the pending gate

<a id="canonical_sources"></a>
canonical_sources:         # authoritative sources the built modules are derived from / bound to
  # -- The component plan (primary source of truth) --
  - docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-runner-plan.md
  # -- Pipeline definition + cross-stage runtime rules + the 31 stage contracts --
  - configs/nexus-ai/sdlc_pipeline.yaml                          # 31-stage ordered definition; entry/exit/blocking; required_gates.always/.conditional; allowed_rework_routes; required_evidence/required_trace; 7 uses_* bindings
  - configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml            # rework_routing_table.by_stage (authoritative failure->target), routing_invariants, iteration_policy, routing_terminals, anti_patterns, locked_decision_guards
  - configs/nexus-ai/stages/sdlc/                                # the 31 per-stage contracts: gates, on_pass/on_fail/rework_route, applicability_decision, conditional_required_gates, max_iterations, per-stage uses_*
  # -- The three JSON Schemas that constrain what the runner may load / build / mutate --
  - configs/nexus-ai/schemas/pipeline_definition.schema.json     # shape a valid definition must satisfy (additionalProperties:false; no 'plugin')
  - configs/nexus-ai/schemas/pipeline_run.schema.json            # shape of the run record (run_status enum; team_lead/owner_agent never a Core Ability; evidence/trace distinct arrays; used_* arrays)
  - configs/nexus-ai/schemas/stage_contract.schema.json          # shape each referenced/embedded stage contract must satisfy
  # -- Contract standards + pipeline model (the human-readable contracts the configs encode) --
  - docs/ai-sdlc-factory/07-pipeline-contract-standard.md        # §2 definition fields, §3 run fields, §4 stage-contract fields
  - docs/ai-sdlc-factory/08-sdlc-pipeline-contract.md            # §4 mandatory+conditional gates, §6 development_completion aggregation, §7 release-candidate gating
  - docs/ai-sdlc-factory/05-pipeline-model.md                    # §5 rework routing, §6 iteration policy, §7 anti-patterns (the source the runtime-rules file formalizes)
  - docs/ai-sdlc-factory/sdlc-stages/06-canonical-corrections-and-overrides.md  # route override source referenced by OQ on stage 21
  # -- Sibling component plans WP-09 delegates to (boundaries, not duplicated logic) --
  - docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-run-state-model.md
  - docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md
  - docs/ai-sdlc-factory/runtime-refactor-plan/governance-engine-plan.md
  - docs/ai-sdlc-factory/runtime-refactor-plan/audit-evidence-store-plan.md

required_outputs:          # MODULES/ARTIFACTS to be BUILT — names + responsibilities ONLY. NO CODE.
  # NOTE: paths are LOGICAL component/module names within a FUTURE Nexus runtime workspace (location
  # decided in a later, separately-approved step). They are NOT files in THIS repo and this WP does
  # NOT create them. The names below describe responsibilities; the build phase produces the code.
  modules: [ see "required_outputs (module specifications)" section below ]
  documentation:
    - a module-level README for the pipeline-runner component that restates the locked boundaries,
      the orchestration-spine scope, and the explicit non-responsibilities (what is delegated to
      siblings), mirroring pipeline-runner-plan.md §2 "Boundary statement".
  tests:
    - a conformance test description set (cases enumerated, not the test code) covering the
      acceptance checks in "required_validations" — happy-path traversal, every routing-invariant,
      three-valued conditional-gate handling, and both iteration limits.

required_validations:      # checks the BUILD must satisfy / the executor must state before reporting
  - see "required_validations (acceptance checks)" section below

forbidden_actions:         # global forbidden actions (doc 20 §6) + component-specific guards
  # -- Global executor forbidden actions (doc 20 §6) — bound on EVERY workpackage --
  - write_to_main_branch
  - merge
  - start_runtime_or_refactor_without_further_owner_approval
  - add_connector_deploy_or_publish
  - introduce_plugin_or_plugin_registry
  - self_approve
  - claim_production_readiness
  # -- Component-specific forbidden actions (from pipeline-runner-plan.md §1, §9) --
  - mutate_the_pipeline_definition_at_runtime        # definition is read-only after load (§4.3)
  - improvise_a_route_target_not_declared_by_the_stage  # follow declared on_pass/on_fail/rework_route only (routing_invariants[1])
  - skip_forward_past_an_un_reevaluated_gate_during_rework  # rework is backward-or-self only (routing_invariants[3])
  - reach_block_and_report_other_than_via_the_iteration_limit  # routing_invariants[4]
  - decide_governance_policy_outcomes_inside_the_runner  # blocker/major/advisory verdicts belong to the governance-engine (Governance!=Audit)
  - persist_evidence_or_trace_inside_the_runner      # persistence belongs to the audit-store; the runner only EMITS, keeping the two streams distinct (Evidence!=Trace)
  - resolve_registry_values_models_tools_or_context_inside_the_runner  # those are sibling resolver responsibilities
  - instantiate_a_core_ability_as_owner_agent_subagent_or_team_member  # Core Ability != Agent
  - treat_supervisor_as_team_lead                    # team_lead = sdlc_team_lead; Supervisor stays a Core Ability
  - route_around_the_no_self_approval_gate           # review-gate owner_agent must differ from the reviewed artifact's author
  - collapse_skill_tool_governance_audit_or_evidence_trace_boundaries

completion_report_format:  # the contract the executor returns in (doc 20 §5)
  schema: docs/ai-sdlc-factory/executor-standard/completion-report-schema.md#3-completion-report-contract-doc-20-5
  required_fields:         # every field present; empty lists appear as []
    - workpackage_id       # MUST equal WP-09-pipeline-runner
    - executor             # MUST equal Codex
    - status               # PASS | PASS_WITH_FINDINGS | BLOCKED  (any blocking finding forces BLOCKED)
    - files_created
    - files_modified       # MUST contain nothing on the main branch
    - validation_summary   # one line per required_validation: what was checked + result
    - blocking_findings    # [] for PASS / PASS_WITH_FINDINGS
    - major_findings
    - minor_findings
    - open_questions       # questions only — never silently-made decisions (carry OQ-1..OQ-3 forward)
    - needs_chatgpt_review # true — the review gate requires a ChatGPT review to exist
```

---

## Dependency detail (`depends_on`)

`depends_on` records **build-sequencing** prerequisites only. It does not authorize building anything:
authoring this spec is allowed now; **no module is built until the doc 22 §7 owner decision approves
the execution phase** (see [Owner-approval boundary](#owner-approval-boundary)).

The pipeline runner is the *orchestration spine*; `pipeline-runner-plan.md` §2 names the siblings it
**resolves through** or **delegates to**. WP-09 cannot be built until those siblings' modules exist,
because the runner *calls* them at well-defined boundaries:

| dep id | Component (per `pipeline-runner-plan.md` §2) | Why WP-09 depends on it (the call boundary) |
|--------|----------------------------------------------|----------------------------------------------|
| **WP-03** | **governance-engine** ([`governance-engine-plan.md`](../runtime-refactor-plan/governance-engine-plan.md)) | Gate evaluation asks *whether* every required (always) and applicable conditional gate has a pass verdict, but the **policy verdict itself** — blocker/major/advisory severity, policy-bypass prevention, the owner-decision boundary — is owned by the governance-engine. The runner consumes its verdict and routes. (`pipeline-runner-plan.md` §7.3.) |
| **WP-04** | **audit-evidence-store** ([`audit-evidence-store-plan.md`](../runtime-refactor-plan/audit-evidence-store-plan.md)) | The runner **emits** Evidence and Trace as two distinct streams at every transition, but **persisting** them (and linking to the artifact registry, producing release bundles) is the audit-store's job. The runner depends on the store to durably accept what it emits. (`pipeline-runner-plan.md` §8.5.) |
| **WP-08** | **pipeline-run-state-model** ([`pipeline-run-state-model.md`](../runtime-refactor-plan/pipeline-run-state-model.md)) | The runner triggers transitions on a Pipeline Run, but the durable run record, `run_id` minting, and the transition guards the runner triggers are owned by the pipeline-run-state-model. The runner depends on that state model to hold and persist the run state it mutates. (`pipeline-runner-plan.md` §5.3, §8.1.) |

> **Run-state-model is the `WP-08` dependency:** `pipeline-runner-plan.md` §2 / §5.3 / §8.1
> makes the **pipeline-run-state-model**
> ([`pipeline-run-state-model.md`](../runtime-refactor-plan/pipeline-run-state-model.md)) a hard
> sibling — it owns the durable run record, `run_id` minting, and the transition guards the runner
> triggers. Under the canonical WP-number → component map it is exactly the `WP-08` entry of the
> `depends_on` set handed to this workpackage (`WP-03`, `WP-04`, `WP-08`); see **[OQ-1](#open-questions)**
> for the (now resolved) WP-number → component binding.

---

<a id="required_outputs"></a>
## `required_outputs` (module specifications)

Each entry is a **module to be BUILT** by the future execution phase: a name and the responsibility it
owns. **These are descriptions, not code, and not files in this repo.** They partition the runner plan
(`pipeline-runner-plan.md` §4–§9) into buildable units. Every module is bound by
[`forbidden_actions`](#workpackage-contract-doc-20-4--depends_on); none may resolve registries, decide
policy, persist audit data, or mutate the definition.

1. **`definition_loader`** — Loads a Pipeline Definition by `pipeline_id` and parses it; **schema-validates**
   it against `pipeline_definition.schema.json` and **refuses to load** on failure (precondition, not a
   gate failure). Resolves each `stages[]` `stage_id` reference to exactly one stage contract and
   validates each against `stage_contract.schema.json`. Asserts the loader invariants in
   `pipeline-runner-plan.md` §4.3: closed stage universe (every routing target resolves to a loaded
   `stage_id` or a routing terminal), definition immutable after load, and **no `plugin` field at any
   level** (mirrors all three schemas' guards). Checks each stage's 7 `uses_*` arrays for
   **presence/shape only** — value resolution is delegated to `WP-01` (shared-registry-loader, sibling).
   Responsibility boundary: produces a **read-only resolved definition**; it never edits the definition
   or resolves registry values. (Plan §4.)

2. **`routing_table_builder`** — Builds the authoritative failure→target routing table from
   `sdlc_pipeline_runtime_rules.yaml` `rework_routing_table.by_stage` (covering all 31 stages) and
   cross-checks it against each contract's own `rework_route`. Where a documented source conflict exists
   (e.g. `domain_regulatory_compliance_validation_if_applicable`: stage file → `security_privacy_design`
   vs corrections doc §1 → `requirements`), it uses the **stage-file value as primary** (matching the
   runtime-rules documented resolution) and **records the conflict as an open question on the run** — it
   does not silently pick a winner. Registers the routing terminals `done`, `relevant_failed_stage`,
   `block_and_report`. (Plan §4.2 step 3/6, §4.3, OQ-1 in the plan.)

3. **`iteration_policy_builder`** — Materializes the iteration policy from
   `runtime_rules.iteration_policy`: `default_max_iterations_per_stage = 3`,
   `max_total_rework_cycles = 8`, and `on_iteration_limit_exceeded = { action: block_and_report,
   output: REWORK_LIMIT_EXCEEDED.md }`, honoring per-stage `max_iterations` overrides (per-stage only).
   Produces the two counter definitions the transition loop will maintain. (Plan §4.2 step 4, §8.2.)

4. **`gate_index`** — Indexes the two gate populations the definition declares: `required_gates.always`
   (17 always gates) and `required_gates.conditional` (7 `_if_applicable` gates), plus each stage's own
   `gates` and `conditional_required_gates`. This index is what gate evaluation consults. (Plan §4.2
   step 5, §7.1.)

5. **`entry_criteria_checker`** — Verifies the definition's `entry_criteria` hold **before** any run
   record is created (`product_intent_or_request_provided`, `domain_and_risk_profile_resolvable`,
   `sdlc_team_and_sdlc_team_lead_assigned`, `required_skills_available_for_semantic_extraction`). If any
   is unmet, **no run is created** — distinct from a stage-gate failure. (Plan §5.1.)

6. **`run_instance_factory`** — Instantiates a Pipeline Run object conforming to
   `pipeline_run.schema.json` and sets the creation-time fields (`pipeline_id`/`selected_pipeline =
   sdlc_pipeline`, `pipeline_version = draft-0.1`, `run_status: pending → in_progress`,
   `assigned_team = sdlc_team`, `team_lead = sdlc_team_lead`, `active_stage = intake`, empty
   `completed_stages`/`blocked_stages`/`evidence`/`trace`/`used_*`, `next_action = intake`). **Enforces at
   creation** that `team_lead`/`owner_agent` is never a Core Ability (schema `not` clause;
   `supervisor_as_team_lead` guard) and that `evidence`/`trace` are **two distinct arrays**. It does
   **not** execute `intake`, resolve registries, or persist the record — minting/persistence/lifecycle
   guards belong to `WP-08` (pipeline-run-state-model). (Plan §5.2, §5.3.)

7. **`applicability_evaluator`** — For conditional (`*_if_applicable`) stages, evaluates the upstream
   `applicability_decision.required_when` expression against run context to a boolean. On `false`,
   follows `applicability_decision.on_not_applicable.route` and records the declared `record_evidence`
   artifact; the stage's gates are **skipped, not failed**. It evaluates the **declared** expression only;
   it never invents applicability, and the expression-sourcing/grammar boundary is shared with the
   run-state and context-memory resolvers ([OQ-2](#open-questions)). (Plan §6.1 step 1, §7.2.)

8. **`gate_evaluator`** — For the active stage, determines whether every required (always) gate and every
   **applicable** conditional gate holds a pass verdict, producing a **three-valued** conditional-gate
   status (`applicable+pass` | `applicable+fail` | `not_applicable`) that is never coerced to a boolean too
   early. It **delegates the policy verdict** (severity, bypass prevention) to `WP-03` (governance-engine)
   and consumes that verdict plus the stage's recorded `gates` results — it does **not** decide policy
   itself (Governance != Audit). (Plan §7.)

9. **`route_selector`** — Selects exactly one route per stage evaluation: `on_pass` (all required gates
   pass), `on_fail` (a gate fails), or `rework_route` (rework re-entry). Obeys every
   `routing_invariants` rule: declared targets only (no improvisation); **backward-or-self** rework with no
   forward skip past an un-re-evaluated gate; `block_and_report` reachable **only** via the iteration limit;
   `done` only after `exit_criteria`. (Plan §6.2.)

10. **`relevant_failed_stage_resolver`** — For aggregate stages (`evidence_graph_build`,
    `development_completion`, and the accessibility stage) whose `on_fail`/`rework_route =
    relevant_failed_stage`, resolves the terminal to the **specific upstream stage** whose gate/evidence
    actually failed, using recorded gate results — never a fixed stage. If a single upstream stage cannot
    be attributed (multiple upstream gates failed), it raises a **blocking finding**, not a guess
    ([OQ-3](#open-questions)). (Plan §6.2 `routing_invariants[2]`.)

11. **`aggregate_gate_checker`** (development_completion) — At `development_completion`, confirms (via the
    governance-engine verdict and recorded gate results) that all `always` gates passed, every
    `conditional` gate is `applicable+pass` or `not_applicable`, and no pipeline/stage `blocking_conditions`
    hold; on success routes `on_pass = release_candidate`, otherwise `relevant_failed_stage`. Encodes the
    doc 08 §6 aggregation and doc 08 §7 release-candidate gating (no `release_candidate` before
    `development_completion`). (Plan §6.3, §7.4.)

12. **`transition_loop`** — The orchestration spine that drives a run from `active_stage` to a terminal:
    per stage it runs the applicability check, **delegates stage execution to the stage's `owner_agent`
    (OUT OF SCOPE — owner-agent behavior, invoked via the executor-integration sibling)**, calls
    `gate_evaluator`, calls `route_selector`, and updates status/iteration. It consumes gate inputs from
    the delegated execution; it does **not** specify how a stage executes. (Plan §6.1.)

13. **`iteration_counter`** — Maintains the per-stage iteration count (vs each stage's `max_iterations`)
    and the total rework-cycle count (vs `max_total_rework_cycles = 8`), incrementing on each
    rework hop. (Plan §8.2.)

14. **`limit_enforcer`** — When **either** limit is exceeded, performs `block_and_report`: sets
    `run_status = blocked`, `active_stage = block_and_report`, `next_action = block_and_report`; emits the
    `REWORK_LIMIT_EXCEEDED.md` report (offending stage, failure type, route taken, iteration counts) as run
    evidence; and **stops auto-looping**. Honors doc 05 §6 (no infinite loop) and `routing_invariants[4]`.
    (Plan §8.3.)

15. **`status_tracker`** — Maintains `run_status` over the closed enum `pending | in_progress | blocked |
    completed | failed | cancelled`, alongside `active_stage`, `completed_stages` (ordered),
    `blocked_stages`, `next_action`, `blocking_findings`, and `open_questions`. It defines **which
    transitions the runner triggers**; the durable record and exact transition guards belong to `WP-08`
    (pipeline-run-state-model) ([OQ-1](#open-questions)). Sets terminal `done`/`completed` only
    after `refraction_learning` completes **and** the definition's `exit_criteria` hold. (Plan §8.1, §8.4.)

16. **`evidence_trace_emitter`** — At every transition, contributes to **two distinct** record sets:
    **Evidence** (decision proof — gate results, `DEVELOPMENT_COMPLETION_GATE_RESULT`,
    `REWORK_LIMIT_EXCEEDED.md`, applicability-decision records) and **Trace** (operation log — the
    `required_trace` set: `stage_gate_decision_trace`, `rework_routing_trace`, `iteration_count_trace`,
    `governance_gate_evaluation_trace`). It **emits only**, keeping the two streams separate;
    **persistence is delegated to `WP-04`** (audit-evidence-store). (Plan §8.5.)

17. **`locked_decision_guard`** — A cross-cutting guard set the runner enforces, mirroring
    `runtime_rules.anti_patterns` and `locked_decision_guards`: reject any `plugin` field/stage at load;
    follow declared routes only and never mutate the definition; never instantiate a Core Ability as
    `owner_agent`/sub-agent/team member; keep `team_lead = sdlc_team_lead` (Supervisor stays a Core
    Ability); never route around the no-self-approval gate; never deploy before `development_completion`;
    keep `test_execution` (#14) distinct from `verification_loop_bug_finding` (#15); require
    `skill_semantic_extraction` before any skill-using stage; preserve Skill!=Tool, Governance!=Audit,
    Evidence!=Trace. (Plan §9.)

> **Module names are responsibilities, not a directory layout.** The build phase MAY group or split them;
> what is fixed here is the **set of responsibilities** and the **delegation boundaries** (registry
> resolution → shared-registry-loader (WP-01, sibling), governance verdicts → WP-03, audit persistence →
> WP-04, run-state persistence → WP-08, stage execution → owner agent via executor-integration). No module
> contains code in this spec.

---

## `required_validations` (acceptance checks)

The build is acceptable only if it can demonstrate (and the executor states the result of) every check
below. These are **validations of the built modules against the canonical sources** — they are derived
from `pipeline-runner-plan.md` and the schemas, and do **not** themselves run product code as part of
authoring this spec.

**A. Definition loading & schema conformance**
1. A definition that fails `pipeline_definition.schema.json` (including `additionalProperties:false` or any
   `plugin`-named property at any level) is **refused at load**, not loaded-then-failed.
2. Every `stages[]` `stage_id` resolves to exactly one stage contract, the contract's `stage_id` matches,
   and each contract validates against `stage_contract.schema.json` with all 7 `uses_*` arrays present.
3. The closed-stage-universe invariant holds: every routing target appearing in any contract
   (`on_pass`/`on_fail`/`rework_route`) and in `allowed_rework_routes` resolves to a loaded `stage_id` or a
   routing terminal (`done` | `relevant_failed_stage` | `block_and_report`).
4. The resolved definition is **read-only**; no code path mutates it after load.

**B. Run instance creation**
5. `entry_criteria` are checked before creation; if unmet, **no run record is produced**.
6. The created run validates against `pipeline_run.schema.json`, with `run_status` in the closed enum,
   `team_lead = sdlc_team_lead`, and **neither `team_lead` nor any `owner_agent`** equal to a Core Ability
   in any casing (schema `not` clause).
7. `evidence` and `trace` are created as **two distinct arrays** (Evidence != Trace).

**C. Transitions, routing & invariants**
8. Route selection uses exactly one of the stage's **declared** `on_pass`/`on_fail`/`rework_route`; no
   improvised target (routing_invariants[1]).
9. Rework targets are **backward-or-self** and never skip forward past an un-re-evaluated gate
   (routing_invariants[3]); after upstream rework, the run re-crosses every intervening gate.
10. `relevant_failed_stage` resolves to the **specific** failed upstream stage from recorded gate results;
    an unattributable multi-failure raises a **blocking finding**, not a guess (routing_invariants[2]).
11. `block_and_report` is reachable **only** via the iteration limit, never as a normal stage's declared
    route (routing_invariants[4]).

**D. Conditional gate evaluation**
12. Conditional gates are **three-valued** (`applicable+pass` | `applicable+fail` | `not_applicable`); a
    `not_applicable` gate is neither pass nor fail, records `record_evidence`, and counts as satisfied at
    aggregation.
13. The runner **delegates** the policy verdict to the governance-engine (WP-03) and does not decide
    blocker/major/advisory severity itself (Governance != Audit).
14. `development_completion` aggregation passes only when all `always` gates pass, every `conditional` gate
    is `applicable+pass` or `not_applicable`, and no `blocking_conditions` hold; a `release_candidate` can
    never precede a passing `development_completion` (doc 08 §7).

**E. Iteration limits & status**
15. Per-stage iterations are capped at the stage's `max_iterations` (default 3); total rework cycles are
    capped at `max_total_rework_cycles = 8`; exceeding **either** triggers `block_and_report` with
    `REWORK_LIMIT_EXCEEDED.md` and stops auto-looping (no infinite loop — doc 05 §6).
16. `run_status` transitions stay within the closed enum; terminal `done`/`completed` is reached only after
    `refraction_learning` **and** all `exit_criteria`.

**F. Evidence/Trace & delegation boundaries**
17. The runner **emits** Evidence and Trace separately and **does not persist** them (persistence delegated
    to WP-04); the `required_trace` records are produced as trace, not evidence.
18. The runner resolves no registry values, models, tools, or context (delegated to WP-01, the
    shared-registry-loader, and the resolver siblings) and does not contain a second governance authority.

**G. Locked-decision guards**
19. All `locked_decision_guard` behaviors in `pipeline-runner-plan.md` §9 are demonstrably enforced (no
    plugin; Core Ability never an owner/agent; Supervisor never team lead; no self-approval routing;
    no deploy before `development_completion`; `test_execution` ≠ `verification_loop_bug_finding`; skill
    semantic extraction precedes skill use; Skill!=Tool / Governance!=Audit / Evidence!=Trace preserved).

**H. Structural / process checks the executor states in `validation_summary`**
20. Conformance test cases exist for A–G above (cases enumerated; the runner is exercised against the real
    31-stage definition, runtime rules, and the three schemas).
21. No output of this WP is written to `main`; nothing is merged, deployed, published, or claimed
    production-ready; no plugin concept is introduced.

---

## Forbidden actions (expanded)

### Global executor forbidden actions (doc 20 §6) — bound on every workpackage

These are **hard prohibitions**, not preferences. An executor asked to do any of them must decline and
surface it as a `blocking_finding`. Several double as **doc 22 §6 hard blockers** that block the entire
implementation transition.

1. **Write to the `main` branch.**
2. **Merge** anything.
3. **Start runtime implementation or a product refactor without a further explicit owner approval.** (This
   WP is a *spec*; building the modules it names is a separate, separately-approved step.)
4. **Add a connector / deploy / publish** step.
5. **Introduce a plugin** or plugin registry (Plugin is cancelled — a doc 22 §6 hard blocker).
6. **Self-approve** (an executor never approves its own work; the reviewer is ChatGPT, the approver is the
   owner).
7. **Claim production readiness.**

### Component-specific forbidden actions (pipeline-runner-plan.md §1, §9)

8. Mutate the Pipeline Definition at runtime (it is read-only after load).
9. Improvise a route target the stage did not declare.
10. Skip forward past an un-re-evaluated gate during rework.
11. Reach `block_and_report` by any path other than the iteration limit.
12. Decide governance policy outcomes inside the runner (delegate to the governance-engine).
13. Persist Evidence or Trace inside the runner (delegate to the audit-store; emit only, keep distinct).
14. Resolve registry values, models, tools, or context inside the runner (delegate to the resolver siblings).
15. Instantiate a Core Ability as `owner_agent`, sub-agent, or team member.
16. Treat Supervisor as the Team Lead.
17. Route around the no-self-approval gate.
18. Collapse the Skill!=Tool, Governance!=Audit, or Evidence!=Trace boundaries.

---

## Owner-approval boundary

This spec is an Implementation **Planning** Handoff artifact (doc 22 §8). It sits **upstream** of any build.

- **Per-workpackage gate (doc 20 §7 / executor-standard README §3.1):** once the WP-09 *build* is later
  executed, it requires a completion report (doc 20 §5 format) **and** a ChatGPT review **and** no blocking
  findings before that build workpackage closes. `PASS_WITH_FINDINGS` is acceptable only with no blocking
  findings; major/minor findings carry forward.
- **Phase-level gate (doc 22 §5–§7):** **no implementation/refactor begins** until the doc 22 readiness gate
  holds (planning complete, execution complete, required review verdicts `PASS`/`PASS_WITH_FINDINGS` with no
  blocking findings, no hard blockers) **and** the owner issues:

  ```text
  OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
  or
  OWNER_DECISION: HOLD_FOR_MORE_REVIEW
  ```

- **Even on `APPROVE`,** the approved next phase is the *Implementation Planning Handoff* (doc 22 §8) —
  *preparing* workpackages like this one — **not** building the runner. **Actually executing WP-09 (producing
  the runtime modules in `required_outputs`) requires a further explicit owner decision** and is out of scope
  here. Until then the doc 22 §9 prohibitions stand: no runtime code change, no product refactor, no connector
  integration, no Nexus publish, no deploy, no `main` merge, no production-readiness claim.

> **Net statement:** WP-09's modules may be **built only after** (a) this handoff and its review clear with no
> blocking findings, (b) the doc 22 readiness gate is satisfied, and (c) the owner explicitly approves the
> execution transition. The build target is a **future Nexus runtime workspace** (decided later); WP-09 does
> **not** modify the existing nexus app code and does **not** touch `main`.

---

## Open questions

Recorded as open questions (doc 20 §8 artifact rule 4 — open questions are separate from decisions), to be
resolved with the owner / in review, **not** decided unilaterally here.

- **OQ-1 — `depends_on` WP-number → component binding.** This spec carries the dependency set exactly as
  handed to the workpackage (`WP-03`, `WP-04`, `WP-08`) and binds them to the governance-engine,
  audit-evidence-store, and pipeline-run-state-model respectively, per `pipeline-runner-plan.md` §2 and the
  canonical WP id → component map in the implementation-handoff `README.md` index. **Sub-question:** the
  **pipeline-run-state-model** is a hard sibling (it owns the durable run record, `run_id` minting, and the
  transition guards the runner triggers — `pipeline-runner-plan.md` §5.3, §8.1); it is **already** the
  `WP-08` entry of the `depends_on` set under that canonical map, so no extra fourth `depends_on` entry is
  needed.
  > resolved: labels corrected to canonical component names (WP-03 = governance-engine, WP-04 = audit-evidence-store, WP-08 = pipeline-run-state-model; per README.md index).
- **OQ-2 — applicability-expression evaluation boundary.** `applicability_evaluator` and `gate_evaluator`
  depend on evaluating `required_when` expressions (e.g. `product_has_ui == true`) against run context.
  *Where those facts are sourced* (intake/domain outputs, run context) and *what expression grammar* is
  supported are shared with the run-state-model and context-memory-resolver plans. This WP assumes the
  expression is evaluable and deterministic; the evaluation mechanism is deferred to those components
  (carried from `pipeline-runner-plan.md` OQ-2).
- **OQ-3 — `relevant_failed_stage` attribution on multiple upstream failures.** When an aggregate stage
  (e.g. `development_completion`) sees more than one failed upstream gate, the attribution/ordering policy
  (route to the earliest? raise a multi-target blocking finding?) is not pinned by the current artifacts.
  This spec mandates a **blocking finding rather than a guess**, but the definitive policy needs a decision
  in review (carried from `pipeline-runner-plan.md` OQ-3).
- **OQ-4 — `domain_regulatory_compliance_validation_if_applicable` rework target conflict.** The
  runtime-rules file and the stage file route this failure to `security_privacy_design`, while the canonical
  corrections doc §1 says `requirements`. `routing_table_builder` uses the **stage-file value as primary**
  (matching the runtime-rules documented resolution) and records the conflict on the run; the source conflict
  still needs an owner ruling (carried from `pipeline-runner-plan.md` OQ-1).

---

*Documentation / blueprint only — an implementation **workpackage specification**, not an implementation. No
runtime code, no merge, no deploy, no connector, no plugin. The pipeline-runner modules are not built until
the doc 22 readiness gate is satisfied and the owner explicitly approves the execution transition. The
`nexus` branch never merges to `main`.*
