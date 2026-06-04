# WP-04 — Audit / Evidence Store (Implementation Workpackage Spec)

> **PLANNING ARTIFACT — doc 22 §8.** This is a **workpackage SPEC**, not an
> instruction to write runtime code. It describes **WHAT** a future, separately
> approved execution phase **would** build for the Nexus AI Audit / Evidence store
> and **HOW** that build would be validated. Authoring this spec is **not**
> executing it. It contains **no code**.
>
> **Owner gate:** the owner recorded
> `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` (2026-06-04, doc 22 §8),
> which authorizes preparing implementation workpackages. It does **not** authorize
> producing runtime code. Per doc 22 §8, "Bu bile doğrudan kod yazmak değildir;
> önce uygulanacak implementation workpackages hazırlanır." Actually executing this
> workpackage (producing the modules below as runtime code) requires a **further,
> explicit owner decision** and is **out of scope** here.
>
> **Implementation target (not yet chosen):** a **future** Nexus runtime workspace,
> to be decided later. This workpackage does **not** modify the existing nexus app
> code and does **not** touch `main`. The `nexus` branch never merges to `main`.

---

```yaml
# ===========================================================================
# Workpackage Contract — doc 20 §4 (+ depends_on)
# Format source of truth:
#   docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md §4
#   docs/ai-sdlc-factory/executor-standard/completion-report-schema.md §2
# Filled in by the plan owner (ChatGPT) and handed to the executor BEFORE work
# starts. Every field is present; empty list fields appear as [] (never omitted).
# ===========================================================================

workpackage_id: WP-04-audit-evidence-store
executor: Codex
reviewer: ChatGPT
depends_on:
  - WP-01            # shared-registry / config loader workpackage — see "depends_on
                     # rationale" and open question OQ-1 below. WP-04 cannot validate
                     # records against the per-scope audit schemas or JSON Schemas
                     # without the loader WP-01 delivers.

objective: >-
  Specify (for a future approved execution phase) a durable Audit / Evidence store
  for the Nexus AI Orchestration Model that PERSISTS and SERVES evidence items
  (decision proof), trace items (operation/process history), and decision records —
  keeping Evidence and Trace in PHYSICALLY SEPARATE stores (Evidence != Trace) —
  plus artifact-registry linkage (reference-only) and release-evidence bundle
  generation, all without redefining any record shape, deciding any policy, or
  crossing a single locked boundary.
```

---

## mandatory_context

The executor MUST load and internalize these before producing any output. These
carry the locked decisions, the boundary rules, and the per-workpackage gate that
govern this build.

```text
.memory/*                                                         # locked decisions, project memory (nexus never merges to main)
docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md        # §4 workpackage contract, §6 global forbidden actions, §7 review gate
docs/ai-sdlc-factory/executor-standard/codex.md                   # Codex executor standard (this WP's executor)
docs/ai-sdlc-factory/executor-standard/completion-report-schema.md# completion-report contract this WP must return in
docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md     # §6 hard blockers, §7 owner decision, §8 allowed-next-phase, §9 prohibited-until-approval
docs/ai-sdlc-factory/21-runtime-refactor-planning-only-plan.md    # §9 audit/evidence store plan requirements; §11 downstream owner gate
docs/ai-sdlc-factory/00-decision-log.md                           # D-001..D-015 locked decisions (Evidence!=Trace D-008, Governance!=Audit D-007, plugin cancelled D-002, Core Abilities not agents D-003/D-004, Supervisor!=team lead D-006, Pipeline!=Pipeline Run D-009)
docs/ai-sdlc-factory/02-concept-boundaries.md                     # concept boundaries (Skill!=Tool, Governance!=Audit, Evidence!=Trace, Evidence!=Artifact)
docs/ai-sdlc-factory/03-governance-and-audit-layering.md          # §10–§12 Evidence/Trace layering
docs/ai-sdlc-factory/11-artifact-registry-standard.md             # §1 Evidence!=Artifact, §5 source_artifacts linkage, §7 release-evidence bundle membership rule
```

---

## canonical_sources

The authoritative sources the specified store is **bound to and must not
contradict**. The store **reads/consumes** these shapes; it **never redefines**
them. (All paths verified present on the `nexus` branch at authoring time.)

```text
# --- PRIMARY component plan (source of truth for THIS component) ---
docs/ai-sdlc-factory/runtime-refactor-plan/audit-evidence-store-plan.md   # the planning-only plan this WP implements; §3 two-namespace shape, §4 the five persistence areas, §5 Evidence/Trace boundary table, §6 linkage model, §7 interfaces, §9 phased build, §12 open questions

# --- audit record CONFIG layer the store reads (configs/nexus-ai/audit/) ---
configs/nexus-ai/audit/evidence_schemas/_index.yaml                       # Evidence-namespace index + invariants (55 evidence_schema items; decision records intentionally excluded)
configs/nexus-ai/audit/evidence_schemas/sdlc_pipeline_evidence_schemas.yaml      # canonical SDLC evidence shapes incl. release_evidence_schema, bug_finding_evidence_schema, security_scan_evidence_schema
configs/nexus-ai/audit/evidence_schemas/research_pipeline_evidence_schemas.yaml
configs/nexus-ai/audit/evidence_schemas/activation_pipeline_evidence_schemas.yaml
configs/nexus-ai/audit/evidence_schemas/operations_pipeline_evidence_schemas.yaml
configs/nexus-ai/audit/evidence_schemas/skill_governance_pipeline_evidence_schemas.yaml
configs/nexus-ai/audit/evidence_schemas/knowledge_memory_pipeline_evidence_schemas.yaml
configs/nexus-ai/audit/trace_schemas/_index.yaml                          # Trace-namespace index + invariants (9 trace_schema items; never merged with evidence)
configs/nexus-ai/audit/trace_schemas/stage_gate_trace_schema.yaml         # most-reused trace schema (applies_to all pipelines)
configs/nexus-ai/audit/trace_schemas/architecture_decision_trace_schema.yaml
configs/nexus-ai/audit/trace_schemas/code_change_trace_schema.yaml
configs/nexus-ai/audit/trace_schemas/security_finding_trace_schema.yaml
configs/nexus-ai/audit/trace_schemas/gate_decision_trace_schema.yaml
configs/nexus-ai/audit/trace_schemas/release_decision_trace_schema.yaml
configs/nexus-ai/audit/trace_schemas/memory_update_trace_schema.yaml
configs/nexus-ai/audit/trace_schemas/activation_transition_trace_schema.yaml
configs/nexus-ai/audit/trace_schemas/skill_governance_trace_schema.yaml

# --- JSON Schemas that validate individual records (shape authority) ---
configs/nexus-ai/schemas/evidence_item.schema.json                        # evidence record shape; bans plugin*; forbids the 8 Core Abilities as produced_by/related_agent/related_sub_agent
configs/nexus-ai/schemas/trace_item.schema.json                           # trace record shape; related_core_ability is a closed enum and the ONLY place a Core Ability may appear
configs/nexus-ai/schemas/artifact_registry.schema.json                    # artifact registry shape; release_evidence_required.core/.conditional

# --- artifact registry instance the store links to by reference ---
configs/nexus-ai/artifact_registry.yaml                                   # canonical UPPER_SNAKE_CASE artifact names; referenced, never copied into evidence

# --- Phase C catalog (decision-record types live here, not yet materialized) ---
configs/nexus-ai/audit_schemas.yaml                                       # activation_decision_evidence_schema, skill_binding_decision_schema (type: decision_record_schema)

# --- governance ids the store cross-references (Governance != Audit: read-only) ---
configs/nexus-ai/governance_profiles.yaml                                 # trace_required (first-class), alias global_trace_required_policy, retention/redaction policy ids
configs/nexus-ai/governance/pipeline/sdlc.yaml                            # sdlc_development_completion_requires_all_required_gates; sdlc_release_candidate_requires_development_completion

# --- sibling runtime/refactor plans this store integrates with (boundaries) ---
docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md # supplies the per-scope schemas + JSON Schemas to the store (WP-01 dependency)
docs/ai-sdlc-factory/runtime-refactor-plan/governance-engine-plan.md      # owns policy/gate evaluation; the store READS gate outcomes, never decides them
docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-run-state-model.md    # owns run identity (run_id); the store references it, never mints runs
docs/ai-sdlc-factory/runtime-refactor-plan/pipeline-runner-plan.md        # drives stage transitions; writes evidence/trace THROUGH the store
docs/ai-sdlc-factory/runtime-refactor-plan/executor-integration-plan.md   # executors emit evidence/trace via the store's write operations
```

### depends_on rationale

`WP-04` builds on the **shared-registry / config loader** workpackage (`WP-01`).
Every write path in this store validates a record against (a) its JSON Schema and
(b) the matching per-scope audit schema's `required_fields`/`redaction_rules`
(audit-evidence-store-plan §4.1–§4.2). The store **must not parse
`configs/nexus-ai/...` in isolation** — it depends on the loader to surface those
schemas (audit-evidence-store-plan §8, row "Loading schemas/registries from
config" → `shared-registry-loader-plan.md`). Until that loader exists, the store
has nothing to validate against. The numeric id `WP-01` is taken to mean the
**implementation-handoff shared-registry-loader workpackage**; see **OQ-1** for the
id-mapping confirmation request.

---

## required_outputs

The modules / artifacts the future execution phase **would build**, described by
**name + responsibility ONLY**. **No code, no signatures, no schemas are produced
by this spec.** Concrete file paths and language live in the future runtime
workspace (not yet chosen) and are decided in the execution phase, **not here**.
Each output traces to a section of `audit-evidence-store-plan.md`.

> Naming below is logical (module responsibility names), not file paths. The build
> is structured so Evidence and Trace are **separate modules over separate
> physical stores** — never one shared persister.

```text
A. Evidence Namespace (decision proof) — plan §3, §4.1
   A1. Evidence Write Module
       Responsibility: accept an evidence record, validate it (global
       evidence_item.schema.json + the matching per-scope evidence schema's
       required_fields), apply redaction-at-write, then append-only persist and
       index it. MUST REJECT any record whose type is trace_schema / a trace-only
       record. No partial writes.
   A2. Evidence Store (physical namespace)
       Responsibility: durable, append-only home for evidence items, keyed by
       evidence_id; immutable once status is terminal (pass/fail). Physically
       independent from the Trace store (no shared table/collection/row).
   A3. Evidence Index Module
       Responsibility: maintain retrieval indexes by related_run, related_stage,
       related_gate, produced_by (indexes only — adds NO new record fields).
   A4. Evidence Retrieval Module
       Responsibility: serve get_evidence_for_run(run_id), per-stage and per-gate
       evidence queries. When asked for "everything for a run," returns ONLY the
       evidence result set (the disjoint companion trace set comes from D2).

B. Trace Namespace (operation/process history) — plan §3, §4.2
   B1. Trace Write Module
       Responsibility: accept a trace record, validate it (global
       trace_item.schema.json + matching per-scope trace schema), apply redaction-
       at-write, append-only persist and index it. MUST REFUSE any record carrying
       evidence-only fields (e.g. source_artifacts, related_gate used as decision
       authorship) — those belong to the Evidence namespace.
   B2. Trace Store (physical namespace)
       Responsibility: durable, append-only home for trace items, keyed by
       trace_id; never updated after write. Physically independent from the
       Evidence store.
   B3. Trace Index Module
       Responsibility: indexes by related_run, related_stage, plus
       input_refs/output_refs reverse-lookup (provenance: trace an evidence id back
       to the operations that produced/consumed it — a reference query, NOT a merge).
   B4. Trace Retrieval Module
       Responsibility: serve get_trace_for_run(run_id) and provenance lookups,
       returning ONLY the trace result set.

C. Decision Records (Evidence family, distinct type) — plan §4.3 (BLOCKED on OQ-2)
   C1. Decision-Record Partition (within the Evidence namespace)
       Responsibility: reserved sub-collection that stores records of
       type: decision_record_schema as PART OF Evidence (never in the Trace
       namespace), distinguished by type. Immutable once recorded; a reversal is a
       NEW decision record referencing the prior one.
   C2. Decision-Record Write Module
       Responsibility: validate decision records against the (pending) materialized
       decision-record schema layer, then persist into C1. This module's required-
       field validation is BLOCKED until that schema layer exists (OQ-2); the spec
       reserves the partition and the validation hook only.

D. Cross-namespace Boundary & Retrieval Guards — plan §3, §5, §6
   D1. Namespace Separation Guard
       Responsibility: enforce, on every write, the hard rule that evidence writes
       reject trace types and trace writes reject evidence/decision-record/gate-
       result types. Single chokepoint that makes "Evidence != Trace" structurally
       impossible to violate.
   D2. Disjoint Run-View Assembler
       Responsibility: when a caller asks for "everything for a run," return TWO
       disjoint result sets (evidence set, trace set) — never an interleaved or
       merged record.

E. Artifact-Registry Linkage (reference-only) — plan §4.4, §6.2
   E1. Artifact Reference Validator
       Responsibility: on evidence write, check that every UPPER_SNAKE_CASE name in
       source_artifacts resolves to a name registered in artifact_registry.yaml.
       Strictness (hard-reject vs warn-and-store) is governed by OQ-3.
   E2. Linkage Query Module
       Responsibility: serve resolve_artifact_links(artifact_name) →
       referencing-evidence + referencing-trace; plus artifact→evidence,
       artifact→trace, evidence→artifacts directions. Reference-only: NEVER copies
       artifact content into evidence (Evidence != Artifact).

F. Release-Evidence Bundle Generation — plan §4.5, §6.2
   F1. Bundle Generator
       Responsibility: for a given run_id, ASSEMBLE (never author) the doc 11 §7
       evidence set from the EVIDENCE namespace ONLY — all core
       release_evidence_required items + every APPLICABLE conditional item
       (applicability read from the run's _APPLICABILITY_DECISION evidence, not
       guessed). Includes trace BY REFERENCE only (provenance pointers), never by
       value.
   F2. Bundle Pre-Condition Checker
       Responsibility: before a bundle may be marked complete, verify (by READING
       governance outcomes / gate-result evidence, never by deciding policy):
       development-completion pass present; release-candidate ordering satisfied
       (no RC bundle before dev-completion); zero blocker bugs / zero critical
       security findings per bug_finding/security_scan evidence; required
       conditional gates satisfied.
   F3. Bundle Sealer
       Responsibility: once generated and accepted, seal the bundle as IMMUTABLE,
       retained under retain_with_release_evidence. Re-issuing produces a NEW bundle
       id referencing the prior; never mutates a sealed bundle. Produces the
       evidence-bundle artifact ONLY — it does NOT deploy, publish, or release.

G. Shared / Cross-cutting Modules — plan §4.1, §4.2, §6.3, §7
   G1. Redaction-at-Write Module
       Responsibility: apply each record's redaction_rules (e.g.
       no_raw_secret_exposure, raw_credential_redaction,
       redact_pii_in_source_artifacts, redact_tool_call_arguments_containing_secrets)
       BEFORE durable storage. The store NEVER persists a raw secret then "redacts
       on read."
   G2. Retention-Class Module
       Responsibility: map each record's config retention value (e.g.
       retain_with_release_evidence, retain_with_activation_record) to a retention
       CLASS and honor it. Retention classes, not ad-hoc TTLs. (Closed-vocabulary
       enumeration is OQ-5.)
   G3. Validation Adapter (to the shared registry loader / WP-01)
       Responsibility: obtain the per-scope audit schemas + JSON Schemas FROM the
       loader (does not re-parse config standalone); resolve the per-scope schema
       for a record via produced_by + related_stage + applies_to.
   G4. Governance-Outcome Reader (read-only; Governance != Audit)
       Responsibility: read gate outcomes / governance ids the bundle checker needs
       from the governance engine. READS only — never evaluates or owns policy.

H. Store Interface Surface (described, not coded) — plan §7
   H1. Store Operations Surface
       Responsibility: expose the conceptual operations write_evidence,
       write_trace, write_decision_record, get_evidence_for_run,
       get_trace_for_run, resolve_artifact_links, generate_release_bundle — all
       run-scoped (related_run) and pipeline-tagged (related_pipeline). The store
       NEVER invents a run (Pipeline != Pipeline Run).

I. Build Documentation (in the future runtime workspace, not on this branch)
   I1. Store Build README
       Responsibility: document the two-namespace design, the separation guards,
       the reference-only linkage model, and the bundle-sealing rules — restating
       the boundaries so an implementer cannot accidentally merge Evidence/Trace.
   I2. Validation/Test Plan Document
       Responsibility: enumerate the required_validations below as executable
       checks for the execution phase (it is the test charter, not the tests).
```

> **Build sequencing (from plan §9, post-approval only):** P0 materialize missing
> schema layers (unblocks decision records / artifact strictness) → P1 validation +
> redaction-at-write → P2 two-namespace persistence + indexes + separation guards →
> P3 artifact linkage + reference queries → P4 decision-record partition → P5
> release-bundle generator with pre-condition checks → P6 retention classes. None of
> these phases may begin before a further owner approval.

---

## required_validations

Checks the execution phase MUST run/state before reporting. These are the
acceptance criteria for the build; this spec defines them, it does not run them.
Each maps to the plan's invariants and the doc 22 §6 hard blockers.

```text
# --- record-shape conformance ---
V1.  Every persisted evidence record validates against
     configs/nexus-ai/schemas/evidence_item.schema.json (required fields:
     evidence_id, type, produced_by, related_pipeline, related_run, related_stage,
     related_agent, related_sub_agent, related_gate, source_artifacts, summary,
     status, created_at) AND its matching per-scope evidence schema. Failure => reject.
V2.  Every persisted trace record validates against
     configs/nexus-ai/schemas/trace_item.schema.json (required fields: trace_id,
     type, actor, action, related_pipeline, related_run, related_stage,
     related_skill, related_tool, related_core_ability, input_refs, output_refs,
     status, timestamp) AND its matching per-scope trace schema. Failure => reject.

# --- Evidence != Trace (D-008 / doc 22 §6 hard blocker) ---
V3.  Evidence and Trace are in physically separate stores: no shared
     table/collection/row, no join row forcing a merged record.
V4.  An evidence write REJECTS a trace-typed record; a trace write REJECTS an
     evidence_schema / decision_record_schema / gate_result_schema record.
V5.  A "everything for a run" retrieval returns two DISJOINT result sets
     (evidence, trace) — never an interleaved/merged record.
V6.  No release bundle embeds trace records by value; trace appears only as
     reference/provenance pointers.

# --- decision records (Evidence family, distinct type) ---
V7.  Decision records persist in the EVIDENCE namespace decision partition only —
     never in the Trace namespace. (Concrete required-field validation deferred to
     OQ-2's materialized schema layer.)

# --- Core Abilities are not agents (D-003/D-004) / Supervisor != team lead (D-006) ---
V8.  No Core Ability [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS]
     ever appears as produced_by / producer / consumer / related_agent /
     related_sub_agent on any evidence record. (Enforced by V1's schema.)
V9.  A Core Ability appears ONLY as related_core_ability (closed enum) on a TRACE
     record; trace `actor` is treated strictly as non-authorship history (never read
     as "a Core Ability owns evidence"). (See OQ-6.)
V10. No record places Supervisor (or any Core Ability) in a team_lead / producer
     authorship slot; SDLC authorship roles are sdlc_team_lead and snake_case agents.

# --- plugin cancelled (D-002 / K-001) ---
V11. No plugin / plugins / plugin_id / plugin_registry / uses_plugins key, table,
     namespace, index, or concept appears anywhere in the store, its storage, or
     its interface.

# --- Governance != Audit (D-007) ---
V12. The store evaluates NO policy and owns NO governance profile. It only READS
     governance ids / gate outcomes (G4) and RECORDS evidence/trace of them.

# --- Evidence != Artifact (doc 11 §1) ---
V13. Linkage is reference-only: source_artifacts holds artifact NAMES; artifact
     content is never copied into an evidence record.
V14. Every source_artifacts name resolves against artifact_registry.yaml
     (hard-reject vs warn governed by OQ-3).

# --- Pipeline != Pipeline Run (D-009) ---
V15. Every record is keyed by both related_pipeline and related_run; the store
     references run_id (owned by pipeline-run-state-model) and never mints a run or
     a pipeline definition.

# --- redaction / retention / immutability ---
V16. redaction_rules are applied BEFORE durable storage (no raw secret persisted
     then redacted-on-read).
V17. retention values are mapped to retention classes and honored verbatim.
V18. Evidence/decision records are immutable once terminal; trace is never updated;
     corrections/reversals are NEW records referencing the superseded id (see OQ-4).

# --- release-candidate ordering (doc 22 §6 hard blocker) ---
V19. The bundle generator refuses to seal a release-candidate bundle unless
     development-completion pass is present and RC ordering is satisfied
     (sdlc_development_completion_requires_all_required_gates,
     sdlc_release_candidate_requires_development_completion), and zero blocker
     bugs / zero critical security findings are attested.
V20. A sealed bundle is immutable; re-issue produces a new bundle id referencing
     the prior. The store does not deploy/publish/release anything.

# --- self-check against the plan's coverage ---
V21. All five doc 21 §9 areas are covered by built modules: evidence persistence
     (A), trace persistence (B), decision-record persistence (C), artifact-registry
     linkage (E), release-evidence bundle generation (F).

# --- gate / boundary self-attestation ---
V22. The completion report records that NO output is runtime code on `main`, NO
     merge occurred, and NO production-readiness claim is made.
```

---

## forbidden_actions

The **global executor forbidden actions** (doc 20 §6 / doc 22 §9) apply to this
workpackage at all times, independent of any gate. In addition, the locked-boundary
guardrails this specific store must not route around are listed.

```text
# --- GLOBAL forbidden actions (doc 20 §6) — apply to EVERY workpackage ---
write_to_main_branch                       # never write to main
merge                                       # never merge (nexus NEVER merges to main)
start_runtime_or_refactor_without_further_owner_approval   # no runtime/refactor without a NEW explicit owner decision
add_connector_deploy_or_publish             # no connector, no deploy, no publish
introduce_plugin                            # plugin is cancelled — no plugin registry/stage/namespace/field/concept
self_approve                                # an executor never substitutes for owner approval
claim_production_readiness                   # never claim production readiness

# --- component-specific guardrails (locked boundaries this store must keep) ---
merge_evidence_and_trace                     # Evidence != Trace — no shared store/table/row, no merged record, no interleaved retrieval
store_decision_record_in_trace_namespace     # decision records are Evidence family — never in trace_schemas/ or the Trace store
decide_or_own_governance_policy              # Governance != Audit — read gate outcomes only; never evaluate/own policy
copy_artifact_content_into_evidence          # Evidence != Artifact — link by name/reference only
treat_core_ability_as_agent_or_author        # Supervisor/Coder/Vision/Audio/Creative/Memory/Web/OS never producer/consumer/related_agent/author; only related_core_ability on trace
treat_supervisor_as_sdlc_team_lead           # authorship roles are sdlc_team_lead / snake_case agents
redefine_or_invent_record_shapes             # consume existing schemas; never redefine or add ad-hoc record shapes
mint_a_pipeline_run_or_pipeline_definition   # Pipeline != Pipeline Run — reference run_id; never create runs/definitions
seal_release_candidate_before_dev_completion  # never assemble/seal an RC bundle before development completion + RC ordering
mutate_a_sealed_bundle_or_terminal_evidence   # append-only / immutable; corrections are NEW records
persist_raw_secret_then_redact_on_read        # redaction is at-write, always
```

---

## completion_report_format

The executor returns exactly the doc 20 §5 Completion Report, per
`docs/ai-sdlc-factory/executor-standard/completion-report-schema.md#3-completion-report-contract-doc-20-5`.
Every field present; empty list fields appear as `[]`. Status obeys the §1 rules
(any blocking finding forces `BLOCKED`).

```yaml
workpackage_id: WP-04-audit-evidence-store     # MUST match this contract's id
executor: Codex                                 # MUST match this contract's executor
status:                                         # PASS | PASS_WITH_FINDINGS | BLOCKED
files_created:                                  # every new artifact produced (in the future runtime workspace; NEVER on main)
  - []
files_modified:                                 # every changed file (MUST contain nothing on main)
  - []
validation_summary:                             # one line per V1..V22: what was checked and the result
  - []
blocking_findings:                              # [] for PASS/PASS_WITH_FINDINGS; non-empty => status BLOCKED
  - []
major_findings:                                 # significant but non-blocking; carried forward
  - []
minor_findings:                                 # nits / cosmetic / low-impact
  - []
open_questions:                                 # unresolved questions for reviewer/owner — SEPARATE from decisions (carry OQ-1..OQ-6 if still open)
  - []
needs_chatgpt_review: true                      # a ChatGPT review is required before the review gate can open
```

> **Review gate (doc 20 §7):** no execution proceeds downstream until this report
> exists, a ChatGPT review of it exists, no blocking findings remain, and the owner
> records a further explicit approval. This spec does not open that gate.

---

## Open questions (carried from the plan; for `runtime-refactor-plan-review.md` / owner)

```text
OQ-1  depends_on id mapping. This WP declares depends_on: [WP-01]. The
      implementation-handoff series is new (this is its first authored spec), so
      WP-01 is TAKEN to mean the shared-registry / config-loader implementation
      workpackage (the audit store cannot validate records without it —
      audit-evidence-store-plan §8). Confirm the WP-01 id and that it covers the
      shared-registry-loader-plan.md scope. (Distinct from the EXECUTOR-track
      WP-01 in docs/ai-sdlc-factory/workpackages/01-codex-machine-readable-contracts.md,
      which is a different numbering scheme.)
OQ-2  Decision-record schema layer (plan O-1). decision_record_schema items
      (activation_decision_evidence_schema, skill_binding_decision_schema) are
      Evidence family but NOT yet materialized to per-file configs. Confirm the
      recommended placement configs/nexus-ai/audit/decision_records/*.yaml (kept in
      the Evidence namespace, never in trace_schemas/) and authorize the
      governance/audit track to produce it. BLOCKS module C2 / P5.
OQ-3  Artifact-name referential strictness (plan O-3). On evidence write, should a
      source_artifacts name absent from artifact_registry.yaml HARD-REJECT or
      warn-and-store? Depends on the artifact registry being materialized and frozen
      first. Affects module E1 / V14.
OQ-4  Supersession/correction model (plan O-4). Evidence and decision records are
      immutable; corrections are new records referencing the old. Confirm whether a
      supersedes / superseded_by reference field is added to the evidence contract
      (a SCHEMA change owned by the audit track, NOT by this store).
OQ-5  Retention-class vocabulary (plan O-5). retention values are currently
      free-form strings. Confirm whether to enumerate a CLOSED retention-class
      vocabulary before building module G2 / P6.
OQ-6  Trace `actor` Core-Ability spelling (plan O-6). trace_item.schema.json allows
      a Core Ability name as free-form `actor` (capability that acted), while
      related_core_ability is the closed-enum capability reference. Confirm the
      store treats `actor` strictly as non-authorship history so it never reads as
      "Core Ability owns evidence." Affects module B1 / V9.
OQ-7  gate_result_schema first-class vs embedded (plan O-2). The type vocabulary
      lists gate_result_schema, but gate outcomes currently ride on evidence
      required_fields / release_evidence_schema. Confirm whether the store persists
      gate results as a first-class evidence sub-type or keeps them embedded.
      Affects modules F1/F2 pre-condition queries.
```

---

*End of workpackage spec. No runtime code produced. No store built. No merge, no
deploy, no connector, no plugin, no production-readiness claim. Executing this
workpackage (producing the modules above as runtime code) requires a FURTHER,
explicit owner decision beyond `APPROVE_IMPLEMENTATION_PLANNING_HANDOFF`, and the
`nexus` branch never merges to `main`.*
