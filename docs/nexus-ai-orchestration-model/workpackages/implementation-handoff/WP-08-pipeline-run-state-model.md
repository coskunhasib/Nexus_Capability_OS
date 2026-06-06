# WP-08 — Pipeline Run State Model (Implementation Workpackage Spec)

> **What this document is.** A single **implementation workpackage specification** authored
> under the owner-approved *Implementation Planning Handoff* (doc 22 §8). It follows the
> workpackage contract of [`../20-executor-workflow-standard-plan.md`](../../legacy/20-executor-workflow-standard-plan.md) §4,
> extended with `depends_on` for build sequencing, and embeds the global executor forbidden
> actions of doc 20 §6.
>
> **What this document is NOT.** It is **not** code, and authoring it is **not** execution.
> This spec describes *what a future executor would build* and *how that build would be
> validated* for the Pipeline Run state object/store. Actually executing this workpackage —
> producing runtime code — requires a **further, separate, explicit owner decision** beyond
> the planning-handoff approval (doc 22 §7–§9). Until that decision is recorded, nothing here
> may be implemented, refactored, merged, or deployed. The `nexus` branch never merges to
> `main`, and the build target is a **future Nexus runtime workspace (to be decided later)** —
> this workpackage does **not** modify the existing `nexus` app code and does **not** touch
> `main`.

---

```yaml
workpackage_id: WP-08-pipeline-run-state-model
executor: Codex
reviewer: ChatGPT            # plan owner / auditor per doc 20 §3; owner = final decision maker
depends_on:
  - WP-01                     # shared-registry-loader: the validated machine-readable contracts
                              # (schemas + stage YAMLs) must exist and be loaded/validated first;
                              # WP-08 builds the runtime state model ON TOP of pipeline_run.schema.json
                              # and the stage contracts that WP-01
                              # (docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md)
                              # produces. Without that validated machine-readable shape there is no
                              # contract for this state model to bind to.
```

---

## 1. objective

Implement the **Pipeline Run state object and its store** for a future Nexus AI runtime: the
single, well-defined, auditable representation of the state of **one live Pipeline Run** (D-009
Pipeline != Pipeline Run), exactly as specified by the **07 Pipeline Run Contract** and bound
to the machine-readable `pipeline_run.schema.json`.

The state object carries the **25 contract fields** — `run_id`, `pipeline_id`,
`pipeline_version`, `run_goal`, `run_status`, `selected_pipeline`, `assigned_team`,
`team_lead`, `active_stage`, `completed_stages`, `blocked_stages`, `run_context`,
`governance_state`, `evidence`, `trace`, the seven `used_*` arrays
(`used_core_abilities`, `used_skills`, `used_tools`, `used_governance_profiles`,
`used_audit_schemas`, `used_model_provider_profiles`, `used_context_memory_profiles`),
`open_questions`, `blocking_findings`, and `next_action` — and provides:

- a typed **state object** that can be created, validated, persisted, and re-loaded;
- a **store** keyed by `run_id` that makes a run **resumable deterministically** from persisted
  state alone (no conversational memory is part of the contract);
- an **invariant checker** that enforces invariants **I-1 … I-12** of the source plan over any
  persisted run-state instance.

This workpackage owns the **state shape, lifecycle, mutation boundary, persistence/identity
model, and invariants**. It does **not** own the engine that *drives* transitions (that is the
`pipeline-runner` component / a separate future workpackage), the governance evaluator, the
audit/evidence durable store, or any resolver — those are referenced, not built here (see §6).

**Scope is the state model only.** Choosing concrete storage technology (file / DB / event log)
and wiring the model into any product is materialization work that is **out of scope** and
gated behind a further owner decision (doc 21 §3; doc 22 §9).

---

## 2. mandatory_context

The executor MUST read and internalize the following before producing any output. These define
*what* is being built and *which boundaries are locked*; deviating from them is a blocking
failure.

```text
# Primary plan = source of truth for this component (the "WHAT and the rules")
docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-run-state-model.md

# The contract the state object must implement, in prose and machine-readable form
docs/ai-sdlc-factory/07-pipeline-contract-standard.md            # §3 = the 25-field Pipeline Run Contract
configs/nexus-ai/schemas/pipeline_run.schema.json                # the canonical 25-field shape (draft 2020-12)
configs/nexus-ai/pipeline_contract_standard.yaml                 # pipeline_run_required_fields + severity_values

# Locked decisions that the state SHAPE itself must honor
docs/ai-sdlc-factory/00-decision-log.md                          # D-001 … D-010
docs/ai-sdlc-factory/08-sdlc-pipeline-contract.md                # SDLC as ONE pipeline; exit criteria narrative

# Boundary / gate documents (this WP is downstream of these; it authorizes nothing)
docs/ai-sdlc-factory/21-runtime-refactor-planning-only-plan.md   # §3 non-goals, §4 planning areas
docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md    # §6 hard blockers, §7 owner decision, §9 prohibited-until-approval
docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md       # §4 workpackage contract, §6 global forbidden actions
docs/ai-sdlc-factory/executor-standard/codex.md                  # the Codex executor working standard

# Companion runtime plans this WP must stay consistent with (referenced, NOT built here)
docs/ai-sdlc-factory/runtime-refactor-plan/README.md
docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-runner-plan.md          # the engine that MUTATES this state
docs/ai-sdlc-factory/runtime-refactor-plan/governance-engine-plan.md        # populates governance_state
docs/ai-sdlc-factory/runtime-refactor-plan/audit-evidence-store-plan.md     # durable store for evidence[]/trace[]
docs/ai-sdlc-factory/runtime-refactor-plan/context-memory-resolver-plan.md  # provisions run_context
docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md   # loads the 7 registries used_* attest against
```

**Locked boundaries (carry through every output):** Plugin yok (D-002 / K-001) · Nexus AI is
the top model, SDLC is one pipeline (D-001/D-010) · Pipeline != Team (D-005) · Agent != Core
Ability (D-003/D-004) · SDLC Team Lead != Supervisor (D-006) · Skill != Tool · Governance !=
Audit (D-007) · Evidence != Trace (D-008/K-008) · Pipeline != Pipeline Run (D-009).

---

## 3. canonical_sources

The build MUST conform to these artifacts. The **plan doc** is authoritative for *behavior,
lifecycle, and invariants*; the **configs/schemas** are authoritative for the *exact field set,
value spaces, terminals, and the registries the state attests against*. Where a config and the
plan ever appear to differ, the plan's §2 source-of-truth map decides — and any residual
discrepancy is an `open_question`, never a silent reinterpretation.

```text
# === COMPONENT SOURCE OF TRUTH (the plan) ===
docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-run-state-model.md
  # §3 the 25-field state object (5 concern groups); §4 run_status lifecycle state machine;
  # §5 the mutation/responsibility boundary; §6 invariants I-1…I-12; §7 persistence & identity;
  # §10 open questions Q1…Q6; §11 owner-approval dependency.

# === THE CONTRACT BEING IMPLEMENTED ===
configs/nexus-ai/schemas/pipeline_run.schema.json        # 25 required fields; terminalOrStage; run_status enum;
                                                         # team_lead never a Core Ability; plugin forbidden everywhere
docs/ai-sdlc-factory/07-pipeline-contract-standard.md    # §3 Pipeline Run Contract (prose)
configs/nexus-ai/pipeline_contract_standard.yaml         # pipeline_run_required_fields; severity_values

# === PIPELINE DEFINITION + STAGE SET (resolve active_stage / completed / routes against THIS) ===
configs/nexus-ai/sdlc_pipeline.yaml                      # the SDLC Pipeline Definition (stages, exit_criteria, blocking_conditions)
configs/nexus-ai/pipeline_catalog.yaml                   # pipeline selection (selected_pipeline / pipeline_id)
configs/nexus-ai/schemas/pipeline_definition.schema.json # definition shape (uses_* declarations the used_* must be ⊆ of)
configs/nexus-ai/stages/sdlc/*.yaml                      # 31 stage contracts: stage_id set, on_pass/on_fail/rework_route
configs/nexus-ai/schemas/stage_contract.schema.json      # stage contract shape

# === TRANSITION / REWORK ROUTING + ITERATION LIMITS (this WP enforces the INVARIANTS, not the routing logic) ===
configs/nexus-ai/sdlc_pipeline_runtime_rules.yaml        # routing_terminals; rework_routing_table; routing_invariants;
                                                         # iteration_policy (max_iterations, max_total_rework_cycles);
                                                         # anti_patterns; locked_decision_guards

# === GOVERNANCE STATE SOURCE (Governance != Audit) ===
configs/nexus-ai/governance_profiles.yaml
configs/nexus-ai/governance/global.yaml
configs/nexus-ai/governance/pipeline/*.yaml              # incl. sdlc.yaml
configs/nexus-ai/governance/team/*.yaml
configs/nexus-ai/governance/stage/*.yaml
configs/nexus-ai/governance/core-ability/*.yaml
configs/nexus-ai/governance/skill/*.yaml
configs/nexus-ai/governance/tool/*.yaml

# === EVIDENCE / TRACE ITEM SHAPES (Evidence != Trace) — for typing the two arrays + linkage ===
configs/nexus-ai/schemas/evidence_item.schema.json
configs/nexus-ai/schemas/trace_item.schema.json
configs/nexus-ai/audit_schemas.yaml
configs/nexus-ai/audit/evidence_schemas/*.yaml           # incl. sdlc_pipeline_evidence_schemas.yaml, _index.yaml
configs/nexus-ai/audit/trace_schemas/*.yaml              # incl. gate_decision_trace_schema.yaml, stage_gate_trace_schema.yaml, _index.yaml

# === ASSIGNMENT SOURCES (assigned_team / team_lead) ===
configs/nexus-ai/team_templates.yaml                     # sdlc_team
configs/nexus-ai/team_lead_roles.yaml                    # sdlc_team_lead (NEVER a Core Ability)

# === THE 7 SHARED REGISTRIES the used_* arrays attest against ===
configs/nexus-ai/core_abilities.yaml                     # closed set {Supervisor,Coder,Vision,Audio,Creative,Memory,Web,OS}
configs/nexus-ai/skills_registry.yaml
configs/nexus-ai/tools_registry.yaml
configs/nexus-ai/model_provider_profiles.yaml
configs/nexus-ai/context_memory_profiles.yaml            # incl. sdlc_run_context (provisions run_context)
# (governance_profiles.yaml and audit_schemas.yaml listed above complete the 7)

# === PRECEDENT FORMAT / DEPENDENCY ===
docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md   # the depends_on: WP-01 source (shared-registry-loader)
```

---

## 4. required_outputs

> **These describe the modules/artifacts to BUILD — names + responsibilities. They contain NO
> code.** Final file paths/extensions live in the future Nexus runtime workspace (to be decided
> later) and are deliberately unspecified here; the executor proposes them in its completion
> report. Each artifact must trace to the source plan section noted.

### 4.1 Core state-model artifacts (the state shape)

1. **`pipeline_run_state` — the Pipeline Run state object/type.**
   The in-memory representation of one run carrying **exactly** the 25 contract fields (plan §3;
   `pipeline_run.schema.json` `required`). Responsibilities: hold all 25 fields with their
   correct value spaces; expose the five concern groups (identity & selection; assignment;
   progress; context/governance/audit; usage attestation + signals); make identity/assignment/
   version fields **immutable after creation** (plan §3.1–3.2); admit **no** field outside the
   contract and **no** `plugin*` key at any level (D-002/K-001). It defines *shape and access*,
   not transition logic.

2. **`pipeline_run_factory` — run creation / initialization.**
   Constructs a new `pipeline_run_state` in the `pending` lifecycle state from a selected
   pipeline + `run_goal`: assigns `run_id`; pins `pipeline_id`, `pipeline_version` (never
   "latest"), `selected_pipeline`; sets `assigned_team`/`team_lead` from the team registries
   (SDLC → `sdlc_team` / `sdlc_team_lead`, and **never** a Core Ability for `team_lead`);
   initializes `active_stage` to the definition's first stage (`intake`), all list fields to
   `[]`, and `run_context`/`governance_state` to empty objects awaiting provisioning (plan §3.1,
   §4 `pending` rules, §8(a)).

3. **`run_status_lifecycle` — the lifecycle state-machine definition.**
   A declarative description of the six legal `run_status` values
   (`pending|in_progress|blocked|completed|failed|cancelled`) and the **legal transitions**
   between them per plan §4. Responsibilities: enumerate allowed status moves; reject illegal
   moves; encode the terminal states (`completed`/`failed`/`cancelled`). It expresses *which
   status moves are legal*; it does **not** decide failure-type → stage routing (that belongs to
   the runtime rules + the runner component).

4. **`run_state_mutator` — the guarded state-mutation surface.**
   The **only** sanctioned way to change a run's mutable fields, implementing the mutation/
   responsibility boundary table in plan §5. Responsibilities: expose narrow operations
   (advance `active_stage` + append `completed_stages` + recompute `next_action` on gate pass;
   move a stage to `blocked_stages` + set `run_status=blocked` + set `next_action` to the rework
   target on gate fail; append to `evidence[]`; append to `trace[]`; update `governance_state`;
   add to `used_*`; add to `open_questions`/`blocking_findings`; set terminal status). Each
   operation enforces the §5 "non-mutation rules" (no out-of-contract field; no Core-Ability
   owner; no skipping a forward gate; no merging evidence/trace; no clearing
   `blocking_findings` without the gate re-passing). **This module performs no routing
   decisions** — callers (the runner / governance engine) supply the decided target; the
   mutator only validates and applies it, recording the result in `next_action`.

### 4.2 Validation artifacts (the invariants)

5. **`pipeline_run_schema_validator` — structural (shape) validation.**
   Validates any candidate state object against `configs/nexus-ai/schemas/pipeline_run.schema.json`
   (invariant **I-1**): all 25 fields present; no `plugin*` key; no undeclared key; correct
   types; `run_status` within enum; `team_lead`/owner roles never a Core Ability;
   `active_stage`/`next_action` within `terminalOrStage`. Responsibility: be the single
   schema-binding gate so the state can never drift from the machine-readable contract.

6. **`pipeline_run_invariant_checker` — semantic invariant enforcement.**
   Checks a (shape-valid) state object against the full invariant set **I-1 … I-12** of plan §6,
   resolving stage ids/terminals against the **pinned** `pipeline_version` and the runtime rules.
   Responsibilities, one check per invariant: I-2 terminal-or-stage; I-3 stage-set closure;
   I-4 disjointness + forward-order of `completed_stages`/`blocked_stages`; I-5 backward-only
   rework target; I-6 iteration ceilings (`max_iterations` default 3; `max_total_rework_cycles`
   8) ⇒ `block_and_report`/`failed`/`REWORK_LIMIT_EXCEEDED` recorded; I-7 each `used_*` ⊆ the
   definition's `uses_*` and `used_core_abilities` ⊆ closed set with no agent id; I-8 `team_lead`
   snake_case and not any Core Ability in any casing; I-9 every `evidence[]`/`trace[]` item
   references `run_id` and validates against its **own** schema (never the other); I-10 block
   consistency (`blocked` ⟺ non-empty `blocked_stages`/`blocking_findings`; non-empty
   `blocking_findings` forbids advancing `active_stage`); I-11 completion gate
   (`completed` ⟹ `active_stage = next_action = done` and all `exit_criteria` satisfied —
   `release_candidate` only after `development_completion`); I-12 no locked-guard bypass (no
   plugin stage, no Core-Ability owner, no self-approval routing, no Evidence==Trace collapse).
   Output: a structured pass/fail report listing any violated invariant by id.

7. **`run_state_store_interface` — persistence & identity contract (interface only).**
   A **storage-technology-agnostic** interface for persisting and reloading a run by `run_id`,
   per plan §7. Responsibilities: define `save(run_state)` / `load(run_id)` semantics; primary
   key = `run_id` with `(pipeline_id, pipeline_version)` carried for interpretability;
   single-writer-per-`run_id` for `run_status`/`active_stage`/`next_action` (concurrency rule);
   the **resumability guarantee** that the persisted 25-field object alone fully determines the
   next move (via `next_action` + `active_stage` + `completed_stages`/`blocked_stages`); and the
   reconciliation contract that `evidence[]`/`trace[]` stay linkable by `run_id` to the external
   append-only audit store owned by `audit-evidence-store-plan.md`. **No concrete store is
   implemented** (file/DB/event-log choice is out of scope, plan §7 last bullet); only the
   interface + an in-memory reference double sufficient to exercise the validators is built.

### 4.3 Documentation artifact

8. **`WP-08 build README` — the as-built notes for this component.**
   A short doc describing the produced modules, their mapping to plan §3–§7 and invariants
   I-1…I-12, the explicit assumptions made, and the residual `open_questions` (Q1…Q6 of plan
   §10 plus any new ones). It restates the owner-approval boundary: this is a state-model build
   for a future workspace, not a product integration, and is itself gated behind a further
   owner decision before any wiring/deploy.

> **Worked SDLC defaults** (plan §3, §8) — `pipeline_id=sdlc_pipeline`,
> `pipeline_version=draft-0.1`, `assigned_team=sdlc_team`, `team_lead=sdlc_team_lead`,
> `run_context` profile `sdlc_run_context` — are the reference values the artifacts must
> reproduce, but every artifact stays **pipeline-agnostic** (D-001/D-010): SDLC is one value of
> `pipeline_id`, never special-cased into the shape.

---

## 5. required_validations

The executor MUST run and report the following. A failure in any **blocking** check is a
`BLOCKED` completion; advisory items become `open_questions`.

**Shape / contract conformance (blocking):**
```text
[V1]  The state object validates against configs/nexus-ai/schemas/pipeline_run.schema.json:
      all 25 required fields present; types correct; run_status within the 6-value enum;
      active_stage & next_action within terminalOrStage (known stage_id of the pinned version
      OR done|relevant_failed_stage|block_and_report).                                 (I-1, I-2)
[V2]  No field outside the 25-field contract and NO property matching /[Pp][Ll][Uu][Gg][Ii][Nn]/
      at ANY object level (run, run_context, governance_state, evidence[] items, trace[] items).
      (D-002 / K-001)
[V3]  team_lead (and any owner role) is snake_case and is NOT a Core Ability in ANY casing
      {Supervisor,Coder,Vision,Audio,Creative,Memory,Web,OS}.                          (I-8, D-006)
```

**Semantic invariants (blocking) — exercised on representative fixtures (the §8 (a)/(b)/(c) plan
states: a fresh `pending` run, a `blocked` mid-run, a `completed` run), plus negative fixtures:**
```text
[V4]  I-3 stage-set closure + I-4 disjointness/forward-order hold on valid fixtures and are
      REJECTED on a fixture that lists an unknown stage_id or overlaps completed/blocked.
[V5]  I-5 backward-only rework: a next_action that points forward past an un-re-evaluated gate
      is REJECTED; an upstream/self rework target passes.
[V6]  I-6 iteration ceilings: a fixture exceeding max_iterations (default 3) or
      max_total_rework_cycles (8) yields next_action=block_and_report, run_status=failed,
      and a recorded REWORK_LIMIT_EXCEEDED evidence reference.
[V7]  I-7 used_* ⊆ definition uses_*; used_core_abilities ⊆ closed set with no agent id —
      a fixture with a used_* item absent from the definition's uses_* is REJECTED.
[V8]  I-9 audit linkage + separation: every evidence[]/trace[] item references run_id; an
      evidence-shaped object placed in trace[] (or vice-versa) is REJECTED; evidence validates
      ONLY against evidence_item.schema.json and trace ONLY against trace_item.schema.json.
[V9]  I-10 block consistency: run_status=blocked ⟺ (blocked_stages non-empty OR blocking_findings
      non-empty); a non-empty blocking_findings with an advancing active_stage is REJECTED.
[V10] I-11 completion gate: run_status=completed REQUIRES active_stage=next_action=done and all
      exit_criteria satisfied — a "completed" fixture with release_candidate before
      development_completion is REJECTED.                                       (doc 08 §7)
[V11] I-12 locked-guard scan: the state trips none of sdlc_pipeline_runtime_rules.yaml
      anti_patterns / locked_decision_guards (no plugin stage, no Core-Ability owner,
      no self-approval routing, no Evidence==Trace collapse).
```

**Lifecycle / mutation-boundary (blocking):**
```text
[V12] run_status transitions accept ONLY the legal moves of plan §4; every illegal status move
      is rejected by run_status_lifecycle.
[V13] Mutations occur ONLY through run_state_mutator; identity/assignment/version fields are
      immutable after pending creation; no operation merges evidence/trace, clears
      blocking_findings without a gate re-pass, or skips a forward gate (plan §5 non-mutation
      rules).
```

**Resumability / persistence (blocking):**
```text
[V14] save(run_state) then load(run_id) round-trips to an identical, schema-valid object; the
      reloaded object's next_action + active_stage + completed/blocked stages alone determine the
      next move with NO external/conversational state (plan §7 resumability).
```

**Hygiene (blocking):**
```text
[V15] Every produced artifact is referenced in the completion report; every assumption is
      explicit; open questions are listed SEPARATELY from decisions (doc 20 §8).
[V16] No source-of-truth config/schema is modified by this WP (read-only against configs/);
      no file is written to main; no merge/deploy occurs.
```

**Advisory (→ open_questions, non-blocking):**
```text
[A1]  Resolution of plan §10 Q1 (selected_pipeline vs pipeline_id equality), Q2
      (completed_stages re-attempt semantics), Q3/Q4 (run_context / governance_state schema
      depth — owned by resolver/governance plans), Q5 (severity routing), Q6 (inherited
      reconciliation debt). Surface, do not silently decide.
```

---

## 6. forbidden_actions

### 6.1 Global executor forbidden actions (doc 20 §6 — apply to EVERY workpackage)

```text
- Do NOT write to the main branch.
- Do NOT merge (the nexus branch NEVER merges to main).
- Do NOT start runtime implementation / product refactor without a further explicit owner approval.
- Do NOT add any connector, deploy, or publish step.
- Do NOT introduce a plugin (or any plugin registry / plugin field).
- Do NOT self-approve (the executor is not the reviewer and not the owner).
- Do NOT claim production readiness.
```

### 6.2 WP-08-specific forbidden actions

```text
- Do NOT build the transition ENGINE / runner here. This WP owns the state SHAPE, the mutation
  BOUNDARY, and the invariants; the engine that DECIDES and DRIVES transitions is the
  pipeline-runner component (separate plan / future workpackage). run_state_mutator applies
  caller-decided moves; it does not compute routing.
- Do NOT build the governance evaluator, the audit/evidence durable store, or any resolver
  (context-memory, model-provider, tool-permission, shared-registry-loader). They are
  canonical_sources to read, not artifacts to produce here.
- Do NOT invent, add, rename, remove, or re-type any Pipeline Run field. The shape is EXACTLY the
  25 fields of pipeline_run.schema.json. No 26th field, no plugin* key anywhere.
- Do NOT set team_lead (or any owner role) to a Core Ability in any casing (D-003/D-006).
- Do NOT merge or co-locate evidence[] and trace[], or validate one against the other's schema
  (D-008/K-008).
- Do NOT redefine stage routing, rework routes, terminals, iteration limits, gates, or
  exit_criteria. Resolve them from sdlc_pipeline.yaml + sdlc_pipeline_runtime_rules.yaml; only
  ENFORCE the resulting invariants.
- Do NOT treat SDLC as the top-level system or special-case it into the shape; the model is
  pipeline-agnostic (D-001/D-010).
- Do NOT choose or implement a concrete storage technology (file/DB/event log) or persist real
  runs; build only the store INTERFACE + an in-memory reference double for validation.
- Do NOT modify any file under configs/nexus-ai/** or docs/ai-sdlc-factory/** that is a
  canonical source; this WP is read-only against the blueprint and writes only its own build
  artifacts into the future runtime workspace.
- Do NOT modify the existing nexus app code; the build target is a future, separately-decided
  Nexus runtime workspace.
```

---

## 7. completion_report_format

The executor MUST return its completion report in the doc 20 §5 format, extended with the
workpackage id and the depends_on confirmation:

```yaml
workpackage_id: WP-08-pipeline-run-state-model
executor: Codex
depends_on_satisfied:
  WP-01: <true|false>          # were the WP-01 machine-readable contracts present & validated?
status: PASS | PASS_WITH_FINDINGS | BLOCKED
target_workspace: <path/name of the future Nexus runtime workspace these artifacts were built in>
files_created:                  # every artifact from §4, by its final path
files_modified:                 # MUST be empty for blueprint sources (read-only); any entry here
                                # outside the runtime workspace is a finding
artifacts_built:                # map each §4 artifact name -> file -> plan section it implements
  - name: pipeline_run_state
    implements: "plan §3 (25-field state object)"
  - name: pipeline_run_factory
    implements: "plan §3.1–3.2, §4 pending, §8(a)"
  - name: run_status_lifecycle
    implements: "plan §4"
  - name: run_state_mutator
    implements: "plan §5"
  - name: pipeline_run_schema_validator
    implements: "I-1 (pipeline_run.schema.json)"
  - name: pipeline_run_invariant_checker
    implements: "plan §6 I-1…I-12"
  - name: run_state_store_interface
    implements: "plan §7"
  - name: WP-08 build README
    implements: "as-built notes + open questions"
validation_summary:             # per-check result for V1…V16 and A1
  shape_conformance: { V1: , V2: , V3: }
  invariants:        { V4: , V5: , V6: , V7: , V8: , V9: , V10: , V11: }
  lifecycle_mutation:{ V12: , V13: }
  resumability:      { V14: }
  hygiene:           { V15: , V16: }
blocking_findings:              # MUST be empty for PASS
major_findings:
minor_findings:
open_questions:                 # plan §10 Q1…Q6 status + any new ones (A1); SEPARATE from decisions
locked_decisions_attested:      # explicit confirmation each lock held in the built shape
  no_plugin_field: <true|false>
  team_lead_not_core_ability: <true|false>
  evidence_trace_separate: <true|false>
  pipeline_run_distinct: <true|false>
  twenty_five_fields_exact: <true|false>
owner_approval_acknowledged: true   # executor confirms NO further execution/wiring/deploy without
                                    # a further explicit owner decision (doc 22 §7–§9)
needs_chatgpt_review: true
```

---

## 8. Owner-approval boundary (restated — this WP authorizes nothing)

Authoring this workpackage **spec** is permitted under the owner-approved Implementation
Planning Handoff (doc 22 §8). **Executing** it — producing the runtime modules above — is a
**separate phase** that requires a **further explicit owner decision** in the doc 22 §7 form:

```text
OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF   # (already given — authorizes WRITING this spec)
OWNER_DECISION: HOLD_FOR_MORE_REVIEW
# A FURTHER, separate owner decision is required before this WP is EXECUTED (runtime code).
```

Until that further decision is recorded, the doc 22 §9 prohibitions remain in force for this
component: no runtime code change beyond the future workspace's isolated build, no product
refactor, no connector integration, no Nexus publish, no deploy, no `main` merge, no
production-readiness claim. The build precondition narrative (`runtime-refactor-plan-review.md`
= **PASS_WITH_FINDINGS**, no blocking findings;
`implementation-readiness-review.md` = **PASS_WITH_FINDINGS**, hard blockers 1–9 CLEAR) is
satisfied for *planning*; it does not by itself authorize execution.
