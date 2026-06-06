# QA-03 — Governance + Audit Config Soundness (Final Adversarial QA)

Scope: `configs/nexus-ai/governance/**` + `configs/nexus-ai/audit/**`, cross-checked
against `configs/nexus-ai/governance_profiles.yaml`, `audit_schemas.yaml`,
`sdlc_pipeline.yaml`, `sdlc_pipeline_runtime_rules.yaml`, the 31 SDLC stage
contracts, and the canonical docs (06, 06b, 08, TRACEABILITY_OVERVIEW).

Method: semantic + cross-layer checks that mechanical validation cannot catch
(the mechanical baseline — YAML parse, JSON-schema validity, link-check, plugin
invariant, owner/lead invariants, evidence/trace dir separation — was already
green and was NOT re-spent here). All checks read-only; no corpus file modified;
no git run.

Classification legend: **DEFECT** (must fix before commit) · **MINOR**
(cosmetic / non-blocking) · **note** (informational / already self-flagged).

---

## Findings

### F-1 — `performance_resilience_pass_or_accepted` blocker gate is in NO required-gate rollup — **DEFECT**
- **Where:** gate produced by `stages/sdlc/24-performance-resilience.yaml`
  (stage #24, **always-on**, no applicability decision; gate
  `performance_resilience_pass_or_accepted`, blocking_condition
  `performance_budget_failure`). Its governing rule
  `governance/stage/sdlc-stages.yaml` is **severity: blocker, required_when:
  always, on_fail: architecture**.
- **What:** this always-on **blocker** gate is absent from BOTH
  `sdlc_pipeline.yaml` `required_gates` (always *and* conditional) AND from the
  aggregate readiness stage `stages/sdlc/29-development-completion.yaml` `gates:`
  / `conditional_required_gates:`. No rollup or aggregate references it.
- **Why it matters:** a checker reading the pipeline contract + the
  development_completion aggregate (the two places that are supposed to enumerate
  the gate set a run must satisfy) would never learn this blocker gate must pass.
  It is the inverse of a dangling edge: a real blocking producer with **no
  consuming rollup**. The canonical "Development Completion minimum gate set"
  (`docs/ai-sdlc-factory/06-sdlc-coverage-gap-audit.md` §8) — explicitly cited as
  a source by both `sdlc_pipeline.yaml` (header) and the dev_completion stage
  file — lists `performance_resilience_pass_or_accepted` as required. doc 08 §6
  further says dev_completion must evaluate "all required + conditional gates per
  docs 06/06a/06b," which re-imports it. So dev_completion is inconsistent with
  its own cited authority.
- **Authority nuance:** `sdlc_pipeline.yaml.required_gates` is an exact mirror of
  `docs/ai-sdlc-factory/08-sdlc-pipeline-contract.md` §4 ("Mandatory gates"),
  which omits this gate (and `risk_register_reviewed`) while adding
  `agentic_safety_eval_pass`. doc 06 §8 and doc 08 §4 are therefore **not
  reconciled with each other**, and the configs inherited a *partial*
  reconciliation. No reconciliation note anywhere states this gate is
  intentionally dropped. Either (a) add `performance_resilience_pass_or_accepted`
  to dev_completion (and to `required_gates`) to match doc 06 §8 + doc 08 §6, or
  (b) add an explicit "intentionally not a rollup gate" reconciliation note. As
  it stands the omission is silent and contradicts a cited canonical source.

### F-2 — `risk_register_reviewed` blocker gate missing from `sdlc_pipeline.yaml` required_gates — **DEFECT (lower blast radius than F-1)**
- **Where:** gate produced by `stages/sdlc/09-premortem-fmea.yaml` (stage #9,
  **always-on**); governing rule in `governance/stage/sdlc-stages.yaml` is
  **severity: blocker, required_when: always**. Listed in doc 06 §8.
- **What:** present in the dev_completion aggregate
  (`29-development-completion.yaml` `gates:` line for `risk_register_reviewed`)
  AND in doc 06 §8 AND governed as a blocker — but **absent from
  `sdlc_pipeline.yaml` `required_gates.always`**.
- **Why it matters:** the pipeline contract's declared always-required gate set
  (17 entries) is missing an always-on blocker gate that the aggregate stage
  itself still enforces. So `sdlc_pipeline.yaml.required_gates.always` ⊊
  `development_completion.gates` (∩ always). This is an internal contradiction
  between the pipeline contract and its own aggregate gate: the contract
  under-declares what dev_completion (correctly) enforces. Same doc 06 §8 vs doc
  08 §4 split as F-1 — but here at least one rollup (dev_completion) still
  catches it, so a run cannot silently pass with an unreviewed risk register; the
  defect is the contract/aggregate disagreement, not a total coverage hole.
- **Fix:** either add `risk_register_reviewed` to `required_gates.always` (align
  to doc 06 §8 + the aggregate), or record why the pipeline-level set
  deliberately omits a gate the aggregate enforces.

### F-3 — `trace_schemas/_index.yaml` states a wrong registry trace count — **MINOR (stale-count regression)**
- **Where:** `configs/nexus-ai/audit/trace_schemas/_index.yaml`, lines 29–32:
  *"the registry contains exactly **9** items with `type: trace_schema`; all 9
  are materialized here … Evidence-family items (the other **57**) are NOT in
  this directory."* and `trace_schema_count: 9`.
- **What:** the source registry `audit_schemas.yaml` actually defines **15**
  `type: trace_schema` items. Its own R5 `materialization_coverage` block
  (lines 3598–3603) says `trace_schema.count: 15` (9 pipeline-materialized + 6
  cross-cutting: `tool_call_trace_schema`, `model_invocation_trace_schema`,
  `skill_activation_trace_schema`, `context_usage_trace_schema`,
  `core_ability_invocation_trace_schema`, `source_fetch_trace_schema`). The
  evidence-family parenthetical "57" is also wrong: catalog
  `evidence_family_total: 58` (56 evidence_schema + 2 decision_record_schema).
- **Why it matters:** the index makes a factual claim about the registry ("the
  registry contains exactly 9") that contradicts the registry's own authoritative
  coverage block. `trace_schema_count: 9` is correct only as a *materialized-here*
  count; the surrounding prose mislabels it as the registry total and asserts
  "all 9 are materialized" — masking that 6 candidate cross-cutting trace schemas
  are deliberately deferred. Looks like the R5 reconciliation updated the catalog
  but not this index. Not blocking (the materialization decision itself is sound
  and documented in the catalog), but the count statement is wrong.

### F-4 — `evidence_schemas/_index.yaml` under-counts the catalog evidence total — **MINOR (stale-count regression)**
- **Where:** `configs/nexus-ai/audit/evidence_schemas/_index.yaml`,
  `coverage.total_evidence_schema_items_in_catalog: 55` (and
  `validation_self_check`: *"Values match the source registry one-to-one"*).
- **What:** the catalog defines **56** `type: evidence_schema` items
  (`audit_schemas.yaml` `evidence_schema.count: 56`); only 55 are materialized
  here. The one not materialized is `evidence_item_schema` (status: candidate,
  cross-cutting base shape bound to `schemas/evidence_item.schema.json`).
- **Why it matters:** the field is labeled "…in_catalog" but holds the
  *materialized* count (55), so it misstates the catalog total by one and the
  "one-to-one with registry" self-check is not literally true (it is one-to-one
  with the *pipeline-materialized* subset, not the full catalog). Same stale-count
  family as F-3. Non-blocking; correct values are in the catalog's R5 block.

---

## Hunts that came back CLEAN (verified, not assumed)

- **`required_gate_producers` map soundness (the 6 R6 gates):** all four checker
  assertions hold for every entry — (a) each `gate` ∈ `sdlc_pipeline.yaml`
  required_gates (5 always + 1 conditional `cost_resource_governance_pass_if_applicable`);
  (b) each `producing_stage` is a canonical 31-stage id; (c) each `producing_rule`
  (`requirements_acceptance_gate`, `architecture_design_governance`,
  `adr_required_gate`, `verification_loop_bug_gate`, `cost_resource_governance`)
  resolves to a `governance_profiles.yaml` id **and** appears in that stage's
  `uses_governance_profiles`; (d) every `satisfied_by_stage_gates` entry is in the
  producing stage's `gates:` list. The map covers exactly the 6 it claims.
- **Every required SDLC gate has a producer:** all 17 always + 7 conditional
  required gates resolve — 6 via the producer map, the other 18 as direct stage
  gates (each also re-aggregated by `development_completion`). **Zero dangling
  required-gate edges.**
- **Every SDLC stage gate is governed:** all 31 stages' gates map to a rule in
  `governance/stage/sdlc-stages.yaml` (intake gates via stage-prefixed rule ids,
  e.g. `intake_product_goal_present` with `pass_condition: product_goal_present ==
  true`; the 6 dev_completion rollup gates are governed at their producing stage).
  No ungoverned stage gate.
- **Rule severity + on_fail invariants (385 rule objects across all 17 governance
  applicable files):** 0 rules missing `severity`; 0 blocker rules missing
  `on_fail`; **0 blocker rules pointing at a non-blocking on_fail** (every blocker
  on_fail is a genuine block/halt/reject/route-to-rework; no blocker degrades to
  warn/record_only/flag_for_review). Richer on_fail verbs in stage/skill/tool/
  core-ability files (e.g. `block_decision`, `reject_binding`, `route_to_rework`)
  are sanctioned by each file's own invariant ("every blocker rule has an on_fail
  behavior"); only `global.yaml` narrows to `block_stage`/`block_release` and is
  internally consistent.
- **Evidence != Trace (physical + semantic):** evidence_schemas/ holds 55 items,
  all `type: evidence_schema`; trace_schemas/ holds 9 files, all
  `type: trace_schema`. No cross-type leakage. The two decision_record_schema ids
  (`activation_decision_evidence_schema`, `skill_binding_decision_schema`) appear
  inside trace files ONLY as `forbidden_usage` / `companion_evidence_schemas`
  annotations explicitly marked "kept distinct" — the boundary is actively
  documented, not violated. `decision_records/` dir not yet created (catalog status
  `placement_decided_pending_phase_e` — consistent, not a dangling claim).
- **Governance != Audit:** no `*_evidence_schema` / `*_trace_schema` id is
  registered as a governance profile; no `required_evidence` list contains a trace
  id and no `required_trace` list contains an evidence id (checked across all
  governance applicable files). The `required_trace` split into `trace_schemas:`
  (schema ids) vs `trace_records:` (record-instance names like
  `stage_gate_decision_trace`) is deliberate — record names are NOT claimed to be
  schema ids, so they are not dangling audit refs (the `stage_gate_decision_trace`
  token is self-flagged in `global.yaml` open_questions for future formalization —
  **note** only).
- **Unknown scope:** 0 governance profiles (applicable layer or registry) use a
  scope outside `{global, pipeline, team, stage, core_ability, skill, tool}`.
- **Plugin governance:** 91 `plugin` mentions across governance + audit are ALL
  absence-guards / prohibitions (e.g. `plugin_absent` rule with
  `plugin_concept_count == 0`, "Plugin … NOT … a governed item"). No plugin is
  created, gated, or managed. Locked decision upheld.
- **Core Abilities never producer/consumer:** no audit schema (evidence or trace)
  lists a Core Ability [Supervisor, Coder, Vision, Audio, Creative, Memory, Web,
  OS] as `producer`/`consumer`. (Memory appears only as a `related_core_ability`
  capability-layer reference in `memory_update_trace_schema` — allowed.)
- **Registry integrity (governance_profiles.yaml):** 122 profiles, all with valid
  scope, `severity_default` present, and `used_by` present (or status candidate);
  all 9 SDLC pipeline-level `uses_governance_profiles` resolve to a registry id or
  alias (`no_self_approval_policy` → `no_self_approval`, `evidence_required_policy`
  → `evidence_required`).
- **Regression-flagged files** (`audit_schemas.yaml`, `governance_profiles.yaml`,
  governance applicable layer): the catalog's R5 `materialization_coverage` block
  is internally consistent (56 evidence + 15 trace + 2 decision_record = 73
  catalog total; 66 pipeline-materialized + 7 cross-cutting). The only regression
  surfaced is the two index files (F-3, F-4) not updated to the R5 counts.

---

## Verdict

2 DEFECT (F-1, F-2 — both rooted in the unreconciled doc 06 §8 vs doc 08 §4 gate
set; F-1 is the more serious because no rollup catches it) and 2 MINOR (F-3, F-4
— stale index counts vs the catalog's authoritative R5 coverage block). No
locked-decision violation, no dangling required-gate edge, no Governance/Audit or
Evidence/Trace conflation, no plugin governance, no Core-Ability-as-actor.
