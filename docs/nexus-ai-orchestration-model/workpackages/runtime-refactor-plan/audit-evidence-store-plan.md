# Audit / Evidence Store Plan (Planning-Only)

> **Phase G/H — doc 21 §9.** This is a **PLANNING-ONLY** document. It describes
> **HOW** a future Audit / Evidence store **would** work for the Nexus AI
> Orchestration Model. It implements **nothing**: no runtime code, no schema
> migration, no datastore, no connector, no deploy, no main-branch merge. Every
> statement below is a plan, not an instruction to build.
>
> **Driver:** `docs/ai-sdlc-factory/21-runtime-refactor-planning-only-plan.md` §9
> (Audit/evidence store plan requirements): *Evidence item persistence · Trace
> item persistence · Decision record persistence · Artifact registry linkage ·
> Release evidence bundle generation.*
>
> **Position in the output set (doc 21 §5):** this is the
> `audit-evidence-store-plan.md` member of `docs/ai-sdlc-factory/runtime-refactor-plan/`.
> It is a sibling of (and depends on) `governance-engine-plan.md`,
> `pipeline-runner-plan.md`, `pipeline-run-state-model.md`,
> `shared-registry-loader-plan.md`, and `executor-integration-plan.md`.

---

## 0. Owner-approval dependency (read first)

This plan **cannot be executed.** Producing this document is permitted (it is one
of the doc 21 §5 required planning outputs). **Acting on it is not**, until an
explicit owner decision is recorded.

- **Upstream gate already satisfied for *planning*:**
  `docs/ai-sdlc-factory/reviews/implementation-readiness-review.md` is
  **PASS_WITH_FINDINGS**, with all 9 doc 22 §6 hard blockers **CLEAR**; item 10
  (owner approval) is the explicit *pending final gate*, **not** a blocker for
  authoring plans (doc 22 §7). doc 21 §2 lists exactly this verdict as the
  precondition for the runtime/refactor planning phase. So this plan may be
  **written and reviewed** now.
- **Downstream gate required before any implementation:** doc 21 §11 and doc 22
  §7 require an explicit owner decision:

  ```text
  OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
  or
  OWNER_DECISION: HOLD_FOR_MORE_REVIEW
  ```

  Until `APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` is recorded, **everything in
  §4–§9 below is prohibited from being built** (doc 22 §9: no runtime code, no
  refactor, no connector, no publish, no deploy, no main merge, no production
  readiness claim). Even after approval, the next step is implementation
  *workpackages*, **not** code (doc 22 §8).
- **Review handoff for this plan:** before implementation, this document plus its
  siblings must pass
  `docs/ai-sdlc-factory/reviews/runtime-refactor-plan-review.md` (doc 21 §10,
  doc 22 §5) with no blocking findings.

> If you are an executor reading this and no `APPROVE_IMPLEMENTATION_PLANNING_HANDOFF`
> exists: **stop.** Do not create a datastore, write a persister, or run a
> migration. Return to the owner.

---

## 1. Objective

Plan a future Audit store that **persists and serves** the audit records the
blueprint already defines, while preserving every locked boundary. The store is
the durable home for:

1. **Evidence items** — *decision proof* (karar kanıtı).
2. **Trace items** — *operation/process history* (işlem geçmişi).
3. **Decision records** — a distinct Evidence-family `type`
   (`decision_record_schema`) for explicit choice points.
4. **Artifact-registry linkage** — the binding from evidence/trace back to the
   canonical artifacts they attest to.
5. **Release-evidence bundle generation** — the sealed, gate-ordered evidence set
   that a release candidate requires.

This plan deliberately does **not** invent new record shapes. It consumes the
shapes already materialized under `configs/nexus-ai/audit/` and the JSON Schemas
under `configs/nexus-ai/schemas/`. The store's job is **persistence + retrieval +
bundle assembly**, never redefinition.

---

## 2. Locked decisions this plan must honor

These are inherited, not re-litigated. Decision-log ids are D-### in
`docs/ai-sdlc-factory/00-decision-log.md`; the existing audit configs additionally
spell the same decisions as K-### (per `BLUEPRINT_INDEX.md`: K-001..K-012 mirror
D-001..D-015). Both spellings are referenced so this plan stays in lock-step with
the config headers.

| # | Locked decision | Consequence for the store |
|---|---|---|
| **Evidence != Trace** (D-008 / K-008) | Two **physically separate namespaces / stores**. Evidence (decision proof) and Trace (operation history) are grouped under *Audit* but are **never merged** into one collection, one table, or one record. | §3, §4, §5 |
| **Governance != Audit** (D-007) | This store is **Audit only.** It never holds, evaluates, or owns governance profiles. It *reads* governance ids as cross-references and *records* the evidence/trace governance demanded — it does not decide policy. Policy lives in the governance engine (`governance-engine-plan.md`) and `configs/nexus-ai/governance/**`. | §6.3, §8 |
| **Plugin cancelled** (D-002 / K-001) | No `plugin*` key, table, namespace, or concept anywhere in the store, its schema, or its API. The JSON Schemas already hard-ban `plugin`/`plugins`/`plugin_id`/`plugin_registry`/`uses_plugins`. | §4.4, §10 |
| **Core Abilities are not agents** (D-003/D-004) | `Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS` **never** appear as a `produced_by`, `producer`, `consumer`, `related_agent`, or `related_sub_agent`. They may appear **only** as `related_core_ability` on a **trace** item (capability-layer reference, never authorship). Names are preserved verbatim; never converted to agents. | §4.1, §4.2, §10 |
| **Supervisor != team lead** (D-006) | The store never records `Supervisor` (or any Core Ability) in a `team_lead`/`producer` authorship position; SDLC authorship roles are `sdlc_team_lead` and snake_case Agent roles. | §10 |
| **Evidence != Artifact** (doc 11 §1) | An artifact is a produced file/output; evidence is a record *bound to a gate/decision* that *attests to* artifacts. The store links them (§6) but never collapses one into the other. | §6 |
| **Pipeline != Pipeline Run** (D-009) | Every persisted record is keyed by both `related_pipeline` (the template) and `related_run` (the instance). The run-state model owns run identity (`pipeline-run-state-model.md`); this store references `run_id`, it does not mint pipeline definitions. | §4, §7 |
| **Top = Nexus AI; SDLC is one pipeline** (D-001) | The store is **pipeline-agnostic.** SDLC is the canonical first tenant, but the same two namespaces serve research / activation / operations / skill_governance / knowledge_memory evidence and trace already present in `configs/nexus-ai/audit/`. | §3, §11 |

---

## 3. Store shape (two namespaces, never merged)

The store is modeled as **one Audit family with two strictly separated
namespaces**, mirroring the on-disk config layout that already exists:

```text
Audit Store (family)
├── Evidence namespace      ← decision proof
│     source of shapes: configs/nexus-ai/audit/evidence_schemas/*.yaml
│     validated by:       configs/nexus-ai/schemas/evidence_item.schema.json
│     holds: evidence items + (see §5) decision records
│
└── Trace namespace         ← operation/process history
      source of shapes: configs/nexus-ai/audit/trace_schemas/*.yaml
      validated by:       configs/nexus-ai/schemas/trace_item.schema.json
      holds: trace items only
```

Hard separation rules the future store **must** enforce (these are not new — they
are restatements of the index invariants in
`configs/nexus-ai/audit/evidence_schemas/_index.yaml` and
`configs/nexus-ai/audit/trace_schemas/_index.yaml`):

- An evidence write **rejects** any record whose `type` is `trace_schema`, and a
  trace write **rejects** any record whose `type` is `evidence_schema` /
  `decision_record_schema` / `gate_result_schema`.
- The two namespaces have **independent** physical storage. No join table forces
  them into one row; linkage is by **reference only** (§6.2), in the direction the
  configs already declare (`companion_evidence_schemas` /
  `companion_trace_schemas`).
- A retrieval API that returns "everything for a run" returns **two disjoint
  result sets** (evidence set, trace set), never an interleaved/merged record.

> **Why this matters (audit integrity):** the whole point of the distinction is
> that a *trace* can show *how* a result was produced without itself being
> treated as the *proof* of the decision. Merging them would let process history
> masquerade as decision evidence — a doc 22 §6 hard blocker
> ("Evidence and Trace merged incorrectly").

---

## 4. Persistence plans (the five doc 21 §9 areas)

### 4.1 Evidence-item persistence

**Record shape (authoritative, do not redefine):**
`configs/nexus-ai/schemas/evidence_item.schema.json`. Required fields:
`evidence_id, type, produced_by, related_pipeline, related_run, related_stage,
related_agent, related_sub_agent, related_gate, source_artifacts, summary,
status, created_at`. The schema **bans** `plugin` and **forbids** the 8 Core
Abilities as `produced_by`/`related_agent`/`related_sub_agent`.

**Per-scope schema catalog (which evidence shapes exist):**
`configs/nexus-ai/audit/evidence_schemas/*.yaml` (55 `type: evidence_schema`
items across 6 pipelines; SDLC = 40). The base SDLC shape is
`sdlc_pipeline_evidence_schema`; stage-specific shapes (e.g.
`bug_finding_evidence_schema` with `blocker_bug_count`/`major_bug_count`,
`security_scan_evidence_schema` with `critical_finding_count`/`high_finding_count`)
add fields on top.

**Plan:**
- **Write path** validates each item against `evidence_item.schema.json` **and**
  against the matching per-scope schema's `required_fields`/`redaction_rules`
  (resolved via `produced_by` + `related_stage` + the schema's `applies_to`).
  Validation failure ⇒ reject; no partial write.
- **Identity & immutability:** `evidence_id` is the primary key; evidence is
  **append-only and immutable** once `status` is terminal (`pass`/`fail`).
  Corrections are new evidence items that reference the superseded id, never
  in-place edits (audit integrity). *(Open question O-4: supersession field.)*
- **Indexing for retrieval (no new fields, indexes only):** by `related_run`, by
  `related_stage`, by `related_gate`, by `produced_by`. These four cover every
  query the runner/governance engine needs (per-run bundle, per-stage evidence,
  per-gate decision support, per-agent provenance).
- **Redaction at write:** apply the item's `redaction_rules` (e.g.
  `no_raw_secret_exposure`, `raw_credential_redaction`, `redact_pii_in_source_artifacts`)
  **before** the record is durably stored. The store **never** persists a raw
  secret and then "redacts on read."
- **Retention:** honor each item's `retention` value verbatim (SDLC items use
  `retain_with_release_evidence`; activation items use
  `retain_with_activation_record`). The store implements retention *classes*, not
  ad-hoc TTLs, and maps each class from the config value.

### 4.2 Trace-item persistence

**Record shape (authoritative):** `configs/nexus-ai/schemas/trace_item.schema.json`.
Required fields: `trace_id, type, actor, action, related_pipeline, related_run,
related_stage, related_skill, related_tool, related_core_ability, input_refs,
output_refs, status, timestamp`. `related_core_ability` is a **closed enum**
(`Supervisor … OS` or null) and is the **only** place a Core Ability may appear —
as a capability-layer reference, never as `actor` authorship/ownership.

**Per-scope schema catalog:** `configs/nexus-ai/audit/trace_schemas/*.yaml` (9
`type: trace_schema` items). `stage_gate_trace_schema` is the most reused
(`applies_to: all_pipelines`, every one of the 31 SDLC stages).

**Plan:**
- **Write path** validates against `trace_item.schema.json` and the matching
  per-scope trace schema. Reject on failure.
- **Append-only:** traces are pure history; they are **never** updated after
  write. `status` reflects the operation outcome at the time it was recorded.
- **Indexing:** by `related_run`, by `related_stage`, plus `output_refs`/`input_refs`
  reverse-lookup so an evidence id can be traced back to the operations that
  produced/consumed it (this is the provenance query, not a merge).
- **Redaction at write:** apply trace `redaction_rules` (e.g.
  `redact_tool_call_arguments_containing_secrets`) before storage.
- **Separation guard:** the trace writer **refuses** any record carrying
  evidence-only fields (e.g. `source_artifacts`, `related_gate` as
  authorship-of-decision) — those belong to the Evidence namespace.

### 4.3 Decision-record persistence

**Status: planned with an open placement question (O-1).** Decision records are
**Evidence family** (they are decision proofs) but a **distinct `type`**
(`decision_record_schema`) — so they must **never** land in the Trace namespace,
and the existing evidence-schema files intentionally **exclude** them (see
`configs/nexus-ai/audit/evidence_schemas/_index.yaml` open questions and the scope
note in `activation_pipeline_evidence_schemas.yaml`).

Known decision-record schemas in the Phase C catalog
(`configs/nexus-ai/audit_schemas.yaml`), not yet materialized to per-file configs:
`activation_decision_evidence_schema`, `skill_binding_decision_schema`.

**Plan:**
- Persist decision records in the **Evidence namespace**, in a **dedicated
  sub-collection** (e.g. a `decision_records` partition) that is *part of
  Evidence* but distinguished by `type: decision_record_schema`. This preserves
  Evidence != Trace **and** keeps decision records queryable alongside the
  evidence they justify.
- **Blocked dependency:** the concrete `required_fields` for decision records
  must come from a materialized config layer (recommended:
  `configs/nexus-ai/audit/decision_records/*.yaml`) produced under the governance/
  audit track — **not invented here**. Until that layer exists, this plan can only
  reserve the partition and the validation hook. *(O-1.)*
- Decision records are immutable once recorded; a reversal is a **new** decision
  record referencing the prior one.

### 4.4 Artifact-registry linkage

**Authoritative sources:**
- Canonical artifact names + groups + `release_evidence_required` (core +
  conditional): `configs/nexus-ai/schemas/artifact_registry.schema.json`
  validating `configs/nexus-ai/artifact_registry.yaml`, per doc 11.
- The linkage field already exists on every evidence item: `source_artifacts`
  (array of UPPER_SNAKE_CASE canonical artifact names) — see
  `evidence_item.schema.json` and doc 11 §1/§5.

**Plan:**
- **Linkage is reference-only and one-directional:** evidence (and trace
  `input_refs`/`output_refs`) **point at** canonical artifact names; the store
  does **not** copy artifact *content* into evidence (Evidence != Artifact, doc 11
  §1). An artifact becomes evidence-relevant **only** when an evidence item with a
  `related_gate`/decision references it (doc 11 §1: "not every artifact is
  evidence").
- **Referential validation:** on evidence write, every name in `source_artifacts`
  **should** resolve to a name registered in the artifact registry. *(O-3: hard
  reject vs. warn — the registry materialization must exist first.)*
- **Linkage queries the store must serve:**
  *artifact → evidence* (what proves this artifact?),
  *artifact → trace* (how was it produced?),
  *evidence → artifacts* (what does this proof attest to?).
- The store treats `release_evidence_required.core` /
  `.conditional` from the registry as the **completeness checklist** for §4.5; it
  reads that list, it does not own it.

### 4.5 Release-evidence bundle generation

**Authoritative sources:**
- Bundle membership rule: doc 11 §7 (core required evidence + applicable
  conditional evidence + no blocking policy failure + development completion pass)
  and the `release_evidence_schema` in
  `configs/nexus-ai/audit/evidence_schemas/sdlc_pipeline_evidence_schemas.yaml`
  (`producer: release_manager_agent`, `consumer: policy_and_evidence_engine`,
  required fields incl. `residual_risks`, `rollback_plan_present`,
  `runbook_present`).
- Ordering/gate rules: SDLC governance
  `configs/nexus-ai/governance/pipeline/sdlc.yaml`
  (`sdlc_development_completion_requires_all_required_gates`,
  `sdlc_release_candidate_requires_development_completion`).

**Plan — bundle is *assembled*, never *authored* by the store:**
- A **bundle generator** (invoked for a given `related_run`) collects, **from the
  Evidence namespace only**, the evidence items that satisfy the doc 11 §7
  checklist for that run: all core `release_evidence_required` items + every
  *applicable* conditional item (applicability comes from the run's
  `_APPLICABILITY_DECISION` evidence, not guessed).
- The bundle **includes trace by reference, not by value**: it records the
  `trace_refs`/provenance pointers needed to audit the path, but the sealed proof
  set is **evidence**, and trace remains in its own namespace (Evidence != Trace).
- **Pre-conditions enforced before a bundle can be marked complete** (these are
  governance outcomes the store *checks*, not *decides* — it asks the governance
  engine / reads gate-result evidence):
  - development completion pass present (`development_completion` gate evidence),
  - release-candidate ordering satisfied (no RC bundle before dev-completion),
  - zero blocker bugs / zero critical security findings as attested by
    `bug_finding_evidence_schema` / `security_scan_evidence_schema` items,
  - required conditional gates for the run satisfied.
- **Sealing:** once generated and accepted, a release-evidence bundle is
  **immutable** and retained under `retain_with_release_evidence`. Re-issuing a
  bundle produces a **new** bundle id referencing the prior; the store never
  mutates a sealed bundle.
- **The store does not deploy, publish, or "release" anything.** It produces the
  *evidence bundle artifact*; the release decision and any activation/deploy are
  out of scope (doc 21 §3, doc 22 §9).

---

## 5. Evidence vs Trace — the boundary, made concrete

| Aspect | Evidence namespace | Trace namespace |
|---|---|---|
| Meaning | decision proof (karar kanıtı) | operation/process history (işlem geçmişi) |
| Shape schema | `evidence_item.schema.json` | `trace_item.schema.json` |
| Per-scope catalog | `audit/evidence_schemas/*.yaml` | `audit/trace_schemas/*.yaml` |
| Authorship field | `produced_by` (snake_case role, **never** a Core Ability) | `actor` (free-form; may name a Core Ability as the capability that acted, e.g. Supervisor routing) |
| Core Ability allowed? | **No** (not as producer/consumer/related_*) | **Only** via `related_core_ability` (closed enum), as a capability reference |
| Mutability | append-only; immutable when terminal | append-only; never updated |
| Included in release bundle | **Yes** (the sealed proof set) | **By reference only** (provenance pointers) |
| Holds decision records? | **Yes** (distinct `type`, dedicated partition) | **Never** |

This table is the single most load-bearing thing the future store must not
violate. If a design decision blurs any row, it reintroduces a doc 22 §6 hard
blocker.

---

## 6. Linkage model (references, not merges)

### 6.1 The four record families and where they live
1. **Artifact** (`configs/nexus-ai/artifact_registry.yaml`) — produced output;
   *outside* the audit store (the store references its names).
2. **Evidence item** (Evidence namespace) — proof bound to a gate/decision.
3. **Decision record** (Evidence namespace, distinct partition) — explicit choice
   proof.
4. **Trace item** (Trace namespace) — production-path history.

### 6.2 Allowed reference edges (and forbidden ones)
```text
evidence.source_artifacts   ──▶ artifact_name        (allowed; doc 11 §5)
evidence (companion_*)       ──▶ trace (by id)        (allowed; reference only)
trace.input_refs/output_refs ──▶ artifact|evidence|trace ids (allowed)
release_bundle               ──▶ evidence ids + trace_refs   (allowed)

evidence  ◀──merge──▶ trace        FORBIDDEN (Evidence != Trace)
decision_record stored in Trace    FORBIDDEN (it is Evidence family)
artifact content copied into evidence  FORBIDDEN (Evidence != Artifact)
any plugin* linkage/edge           FORBIDDEN (D-002 / K-001)
```

### 6.3 What the store reads vs. owns
- **Reads (cross-reference only):** governance profile ids referenced on audit
  schemas (e.g. `trace_required`, and its alias `global_trace_required_policy`);
  artifact names; gate ids. These are *referenced*, never *defined* here.
- **Owns:** the durable evidence/trace/decision records, their indexes, their
  redaction-at-write, their retention classes, and bundle assembly.
- **Does NOT own:** policy decisions, gate pass/fail logic, run-state transitions,
  artifact production. Those belong to `governance-engine-plan.md`,
  `pipeline-runner-plan.md`, `pipeline-run-state-model.md`, and the producing
  stages respectively.

---

## 7. Interfaces this store would expose (described, not coded)

> Conceptual contracts only — **no signatures, no code.** Each "operation" is a
> capability the future store would offer; how it is implemented is deferred to
> implementation workpackages produced *after* owner approval.

- **write_evidence(record)** — validate (global + per-scope), redact, append,
  index. Reject trace/decision-record types.
- **write_trace(record)** — validate, redact, append, index. Reject evidence
  fields.
- **write_decision_record(record)** — validate against the (pending) decision-record
  schema layer, store in the Evidence namespace decision partition. *(Blocked by
  O-1.)*
- **get_evidence_for_run(run_id) / get_trace_for_run(run_id)** — return **two
  disjoint** result sets.
- **resolve_artifact_links(artifact_name)** — return referencing evidence + trace.
- **generate_release_bundle(run_id)** — assemble the doc 11 §7 evidence set,
  enforce pre-conditions (§4.5), seal. Read-only against governance outcomes.
- **All operations are run-scoped** (`related_run`) and pipeline-tagged
  (`related_pipeline`); the store never invents a run (Pipeline != Pipeline Run).

---

## 8. Boundaries with sibling runtime/refactor plans

| Concern | Owner plan | This plan's relationship |
|---|---|---|
| Policy/gate evaluation, severity, bypass prevention | `governance-engine-plan.md` (doc 21 §8) | The store **asks** for / **reads** gate outcomes; it records evidence of them. It never evaluates policy. (Governance != Audit.) |
| Run identity, stage transitions, status | `pipeline-run-state-model.md` / `pipeline-runner-plan.md` (doc 21 §7) | The store consumes `run_id`/`stage_id`; it is written to *by* stages during a run. It never drives transitions. |
| Loading schemas/registries from config | `shared-registry-loader-plan.md` | The store **depends on** the loader to surface the per-scope audit schemas + JSON Schemas; it does not parse config itself in isolation. |
| Executor wiring | `executor-integration-plan.md` (doc 21 §5) | Executors emit evidence/trace through the store's write operations; the completion report (`executor-standard/completion-report-schema.md`) references the evidence/trace produced. |

---

## 9. Phased build plan (post-approval only — do **not** start)

> Listed so the eventual implementation workpackages have a skeleton. **None of
> these phases may begin** before `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF`
> (§0). Each phase is itself first a *workpackage*, not direct code (doc 22 §8).

1. **P0 — Materialize missing schema layers** (unblocks O-1/O-3): produce
   `audit/decision_records/*.yaml` and confirm `artifact_registry.yaml` exists,
   under the governance/audit track. *Config authoring only.*
2. **P1 — Validation + redaction-at-write** for evidence and trace against the
   existing JSON Schemas and per-scope catalogs.
3. **P2 — Two-namespace persistence + indexes**, with the separation guards (§3).
4. **P3 — Artifact-registry linkage + reference queries** (§4.4, §6).
5. **P4 — Decision-record partition** (depends on P0/O-1).
6. **P5 — Release-evidence bundle generator** with pre-condition checks (§4.5),
   reading governance outcomes from the governance engine.
7. **P6 — Retention classes** mapped from config `retention` values.

---

## 10. Self-check against doc 22 §6 hard blockers

The future store, as planned, must keep every one of these **CLEAR**:

- [x] **Plugin registry reintroduced** — no `plugin*` anywhere (schemas already
  ban it; §2, §4.4, §6.2).
- [x] **Core Ability treated as Agent** — never producer/consumer/related_agent;
  only `related_core_ability` on traces (§4.1, §4.2, §5).
- [x] **Supervisor treated as SDLC Team Lead** — authorship roles are
  `sdlc_team_lead` / snake_case agents; Supervisor never in an authorship slot
  (§2, §5).
- [x] **SDLC treated as top-level system** — store is pipeline-agnostic; SDLC is
  one tenant (§2, §3, §11).
- [x] **Governance and Audit merged incorrectly** — store is Audit-only; reads
  governance ids, never decides policy (§2, §6.3, §8).
- [x] **Evidence and Trace merged incorrectly** — two separate namespaces, no
  merged record, disjoint retrieval (§3, §4, §5, §6.2).
- [x] **release candidate allowed before development completion** — bundle
  generator enforces dev-completion-pass + RC ordering before sealing (§4.5).
- [x] **owner approval missing** — entire plan gated on §0; nothing buildable
  until `APPROVE_IMPLEMENTATION_PLANNING_HANDOFF`.

---

## 11. Coverage map (every doc 21 §9 item is addressed)

| doc 21 §9 requirement | Section | Authoritative source it builds on |
|---|---|---|
| Evidence item persistence | §4.1 | `schemas/evidence_item.schema.json`; `audit/evidence_schemas/*.yaml` |
| Trace item persistence | §4.2 | `schemas/trace_item.schema.json`; `audit/trace_schemas/*.yaml` |
| Decision record persistence | §4.3 | `audit_schemas.yaml` (decision_record_schema items); pending `audit/decision_records/*.yaml` |
| Artifact registry linkage | §4.4 | `schemas/artifact_registry.schema.json`; doc 11; evidence `source_artifacts` |
| Release evidence bundle generation | §4.5 | `release_evidence_schema`; doc 11 §7; `governance/pipeline/sdlc.yaml` |

---

## 12. Open questions (for `runtime-refactor-plan-review.md`)

- **O-1 — Decision-record schema layer.** Decision records
  (`activation_decision_evidence_schema`, `skill_binding_decision_schema`) are
  Evidence family but not yet materialized to per-file configs. Confirm the
  recommended placement `configs/nexus-ai/audit/decision_records/*.yaml` (kept in
  the Evidence namespace, out of `trace_schemas/`) and authorize the
  governance/audit track to produce it. **Blocks §4.3 / P5.** (Mirrors the open
  question in `audit/evidence_schemas/_index.yaml`.)
- **O-2 — First-class `gate_result_schema`.** The §12 type vocabulary lists
  `gate_result_schema`, but the catalog carries gate outcomes as fields on
  evidence items / `release_evidence_schema` rather than as standalone records.
  Confirm whether the store should persist gate results as a first-class evidence
  sub-type or keep them embedded. Affects §4.5 pre-condition queries.
- **O-3 — Artifact-name referential integrity strictness.** Should an evidence
  write **hard-reject** a `source_artifacts` name absent from
  `artifact_registry.yaml`, or warn-and-store? Depends on the artifact registry
  being materialized and frozen first. Affects §4.4.
- **O-4 — Supersession / correction model.** Evidence and decision records are
  immutable; corrections are new records referencing the old. Confirm whether a
  `supersedes`/`superseded_by` reference field should be added to the evidence
  contract (a schema change, owned by the audit track, **not** by this store).
- **O-5 — Retention-class catalog.** `retention` values
  (`retain_with_release_evidence`, `retain_with_activation_record`) are currently
  free-form strings. Confirm whether to enumerate a closed retention-class
  vocabulary before P6.
- **O-6 — Trace `actor` Core-Ability spelling.** `trace_item.schema.json` allows
  a Core Ability name as a free-form `actor` (capability that acted), while
  `related_core_ability` is the closed-enum capability reference. Confirm the
  store treats `actor` strictly as non-authorship history so this never reads as
  "Core Ability owns evidence" (it does not — `actor` is on **trace**, and trace
  is never decision proof).

---

*End of planning-only document. No code produced. No store built. No merge, no
deploy. Implementation requires `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF`
(doc 21 §11, doc 22 §7) and a passing `runtime-refactor-plan-review.md`.*
