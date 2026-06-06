# Reconciliation Sweep — Dangling-Edge Verification Report

- **Review id:** reconciliation-sweep-report
- **Phase / position:** post-Phase G/H, immediately before the doc 22 final readiness gate.
- **Scope:** corpus-wide intra-registry dangling-edge re-scan of `configs/nexus-ai/`, covering every id
  referenced under `uses_governance_profiles` / `uses_audit_schemas` / `uses_tools` / `uses_skills` /
  `uses_model_provider_profiles` / `uses_context_memory_profiles` and within the per-item governance /
  audit binds (`governance_profiles:`, `audit_schemas:`, `referenced_governance_profiles:`,
  `referenced_audit_schemas:`). Each referenced id must resolve to a **first-class registry item id OR a
  recorded alias** in its owning registry (`governance_profiles.yaml`, `audit_schemas.yaml`,
  `tools_registry.yaml`, `skills_registry.yaml`, `model_provider_profiles.yaml`,
  `context_memory_profiles.yaml`, `core_abilities.yaml`).
- **Nature:** documentation / blueprint verification. NO runtime code, NO merge, NO deploy.
- **Verdict:** **PASS_WITH_FINDINGS** — target of 0 residual dangling edges per category was **met (0/0/0/0/0/0)**.
  One in-scope residual was found during the sweep and **closed** by registering two locked Core-Ability
  model profiles; no blocking findings remain. (See §6 for the single closed finding and §8 for the carried
  advisory.)

---

## 1. Method

A programmatic scanner parsed **every** `*.yaml` file under `configs/nexus-ai/` with PyYAML (not grep
heuristics) and, per reference category, computed two sets:

- **Resolvable set** = the union of (a) every first-class item `id` declared in the owning registry plus
  (b) every **recorded alias**: values under any `aliases:` list, and the `canonical_id` / `canonical`
  targets in the dedicated alias-reconciliation blocks
  (`governance_profile_aliases`, `audit_schema_aliases`, `governance_alias_reconciliation`,
  `policy_aliases`, the model-profile `reconciliation` alias maps, etc.).
- **Referenced set** = every value bound under the in-scope reference keys, across the whole corpus.

**Residual dangling = referenced − resolvable.** The scan is exhaustive (every file, every nesting depth),
not sampled.

### 1.1 Scope boundary (what is and is not a registry reference)

The SDLC stage contracts carry BOTH a registry-binding key (`uses_audit_schemas`) and separate
materialization fields (`evidence:`, `trace:`, `inputs:`, `outputs:`). The latter hold **artifact ids**
(UPPER_SNAKE, e.g. `PRODUCT_BRIEF`, `SBOM`) and **stage-local Evidence/Trace record names**
(e.g. `intake_stage_trace`, `code_review_trace`), which are the stage's own materialization spec governed
by `materialization_coverage` in `audit_schemas.yaml` — they are **not** direct audit-registry id
references and are therefore out of scope for this dangling-edge task. A deliberately over-broad
cross-check (widening the audit key set to `evidence`/`trace`/`produces`/`outputs`/…) surfaced 257 such
entries; all 257 were confirmed to be artifact ids or stage-local record names sitting in the `evidence:` /
`trace:` materialization lists, never under a `uses_*` / `*_schemas:` registry bind. This confirms the
Evidence/Trace materialization stays in its own fields and does not leak into the registry-reference edges.

---

## 2. Before / after residual dangling counts per category

| Reference category | Resolvable (after) | Referenced | **Dangling BEFORE** | **Dangling AFTER** |
|---|---|---|---|---|
| `uses_governance_profiles`      | 163 (133 ids + 31 aliases\*) | 140 | 0 | **0** |
| `uses_audit_schemas`            | 93 (75 ids + 18 aliases)     | 80  | 0 | **0** |
| `uses_tools`                    | 87 (82 ids + 5 aliases)      | 73  | 0 | **0** |
| `uses_skills`                   | 22 (20 ids + 2 aliases)      | 18  | 0 | **0** |
| `uses_model_provider_profiles`  | 44 (23 ids + 23 aliases)     | 24  | **2** | **0** |
| `uses_context_memory_profiles`  | 46 (26 ids + 21 aliases)     | 26  | 0 | **0** |
| **TOTAL** | — | — | **2** | **0** |

\* Counts are de-duplicated resolvable tokens (item ids ∪ recorded aliases ∪ alias-block canonical ids).
The "Referenced" column counts distinct referenced ids across the corpus for that category.

**Net result: total residual dangling edges 2 → 0.** Five of the six categories were already at 0 on entry
(they had been driven to zero by the prior sweep, R1–R16); the sixth (`uses_model_provider_profiles`) had 2
residual edges, now closed.

---

## 3. The two BEFORE-state dangling edges (model/provider category)

| Dangling id | Referenced from | Why it was dangling |
|---|---|---|
| `audio_model`               | `core_abilities.yaml` — Audio Core Ability `model_provider_profiles:` (and its own `referenced_candidates`) | Bound by the locked Audio Core Ability and declared `owned_by: model_provider_profiles.yaml`, but **never materialized** as a first-class item in that owning registry. |
| `creative_generation_model` | `core_abilities.yaml` — Creative Core Ability `model_provider_profiles:` (and its own `referenced_candidates`) | Same pattern for the locked Creative Core Ability. |

This was an **asymmetry**: the third multimodal Core Ability profile, `vision_model`, was already a
first-class item consumed by the Vision Core Ability, and the parallel **governance** profiles
`vision_governance` / `audio_governance` / `creative_governance` were all already first-class `candidate`
items in `governance_profiles.yaml`. Only the Audio/Creative **model** profiles had been left as
`referenced_candidates`-only, so their model-profile edge did not resolve to a registry item.

---

## 4. Fix applied (the only edit in this sweep)

**File edited:** `configs/nexus-ai/model_provider_profiles.yaml` (the single named file modified).

Registered `audio_model` and `creative_generation_model` as **first-class `status: candidate`** items,
mirroring the existing `vision_model` shape and the candidate-item contract (`summarization_model` was the
reference template). Each new item:

- carries the full item contract (`id`, `name`, `type`, `status`, `purpose`, `owner_domain`,
  `provider_type`, `model_family`, `capability_scope`, `resource_limits`, `fallback_policy`,
  `governance_profiles`, `audit_schemas`, `allowed_usage`, `forbidden_usage`, `used_by`, `aliases`,
  `overlap`, `notes`);
- has `used_by` populated from the **actual** references — `core_abilities: [Audio]` / `[Creative]` with
  empty `pipelines: []` and `stages: []` (K-003: the NAME is locked but no current pipeline/stage binds
  it — usage is anchored to the consuming Core Ability, not fabricated);
- binds only already-resolvable governance/audit ids: `audio_governance` / `creative_governance`
  (first-class candidates in `governance_profiles.yaml`), `model_invocation_governance`
  (first-class in `governance_profiles.yaml`), and `model_invocation_trace_schema` (first-class
  **trace**-family schema in `audit_schemas.yaml`) — introducing **no new** dangling edges;
- explicitly lists `forbidden_usage: being listed/used as a Core Ability, Agent, Skill or Tool`.

The `reconciliation` footer self-check was updated to stay consistent: `candidate_count: 13 → 15`
(canonical_count unchanged at 8; profiles total 21 → 23 = 8 canonical + 15 candidate). This now matches the
two new `referenced_candidates` entries (`status: candidate`, `owned_by: model_provider_profiles.yaml`) that
`core_abilities.yaml` already declared, so the edge resolves **from both directions**.

> Naming note: `provider_type` was set to the nearest in-vocabulary value `vision_llm`
> (`provider_type_vocabulary = [reasoning_llm, code_llm, vision_llm, routing_llm]` has no dedicated
> audio/creative multimodal type), with an inline comment to refine when a pipeline binds the ability.
> This is recorded as the carried advisory in §8.

---

## 5. Schema re-validation — `sdlc_pipeline.yaml` (R8)

`configs/nexus-ai/sdlc_pipeline.yaml` was re-validated against
`configs/nexus-ai/schemas/pipeline_definition.schema.json` using a Draft 2020-12 validator
(the schema declares `$schema: https://json-schema.org/draft/2020-12/schema`).

```
$schema declared: https://json-schema.org/draft/2020-12/schema -> Draft202012Validator
VALIDATION ERRORS: 0
```

**Result: 0 errors — R8 remains GREEN.** The sweep did **not** touch `sdlc_pipeline.yaml` or its schema
(the only edit was to `model_provider_profiles.yaml`), so the validation is unaffected. This is **not** a
BLOCKED finding.

---

## 6. Locked-decision integrity checks

| Invariant | Check | Result |
|---|---|---|
| **Evidence != Trace** (directory) | `audit/evidence_schemas/` contains only `*_evidence_schemas` files; `audit/trace_schemas/` contains only `*_trace_schema` files | **PASS** — no evidence schema in `trace_schemas/`, no trace schema in `evidence_schemas/`; zero cross-contamination. |
| **Evidence != Trace** (family) | The audit ids referenced by the two new model profiles are trace-family (`model_invocation_trace_schema`); no evidence id was bound where a trace belongs or vice-versa | **PASS** — model invocation is correctly a Trace, not Evidence. |
| **No plugin** | Corpus scan for a `plugin` concept excluding the `plugin_absent` / `no_plugin*` / `plugin_registry: false` guardrails | **PASS** — 4 residual mentions are all absence-assertions ("No item here is a … Plugin", "no core pipeline may reference a plugin"); no plugin concept/field/stage/registry exists. Edited file mentions plugin only in its header guard + `no_plugin_registry: true`. |
| **No Core Ability as agent** | Corpus scan for any of [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS] used as `owner_agent` / `agent` / `sub_agent` / `team_lead` | **PASS** — none. The two new items list Audio/Creative only under `used_by.core_abilities` and forbid Core-Ability/Agent/Skill/Tool usage. `core_abilities_not_items: true` holds. |
| **Supervisor != team lead / Skill != Tool / Governance != Audit** | unchanged by this sweep (no edits to those boundaries) | **PASS** — preserved. |

---

## 7. Already-fixed items — confirmed untouched

Per the sweep instruction, the following were verified to remain exactly as fixed and were **not**
re-touched:

- **R8** — `sdlc_pipeline.yaml` validates with 0 errors (§5).
- **R10** — `pipeline_catalog.yaml` uses `knowledge_team` (2 occurrences); `knowledge_memory_team` = 0.
- **R16** — `stages/sdlc/27-operations-readiness.yaml` attribution (`operations_readiness_agent` present);
  `stages/sdlc/README.md`, the flow diagram labels, and `BLUEPRINT_INDEX.md §9` were not modified.
- Supporting schema files `schemas/evidence_item.schema.json` and `schemas/trace_item.schema.json` exist
  (referenced by `audit_schemas.yaml`).

All 80 `*.yaml` files under `configs/nexus-ai/` parse cleanly after the edit (0 parse failures).

---

## 8. Findings

### 8.1 Closed during this sweep (was the only in-scope residual)

- **[CLOSED] F-1 — 2 dangling model/provider edges.** `audio_model` and `creative_generation_model` were
  referenced by the Audio/Creative Core Abilities but not first-class in `model_provider_profiles.yaml`.
  Registered as `candidate` items with Core-Ability-anchored `used_by` (§3–§4). Re-scan confirms the
  model/provider category is now at **0** residual dangling edges.

### 8.2 Carried advisory (non-blocking; for Phase E/I ratification, not for this sweep)

- **[ADVISORY] A-1 — `audio_model` / `creative_generation_model` `provider_type`.** Both candidates use
  `provider_type: vision_llm` as the nearest in-vocabulary fit because
  `provider_type_vocabulary` has no audio/creative multimodal type. When (and only when) a pipeline binds
  the Audio or Creative Core Ability, either extend `provider_type_vocabulary` (e.g. `audio_llm`,
  `creative_llm`) or confirm `vision_llm` is acceptable, and ratify the candidates. This does not affect
  edge-resolution (the ids now resolve) and is consistent with the pre-existing `open_questions` /
  `name_collisions_requiring_phase_e_decision` already tracked in that registry.

---

## 9. Residual dangling, per category (candidate-acknowledged)

| Category | Residual dangling | Candidate-acknowledged residual |
|---|---|---|
| `uses_governance_profiles`     | 0 | — |
| `uses_audit_schemas`           | 0 | — |
| `uses_tools`                   | 0 | — |
| `uses_skills`                  | 0 | — |
| `uses_model_provider_profiles` | 0 | `audio_model`, `creative_generation_model` now resolve as **first-class `candidate` items** (not dangling); ratify in Phase E/I per A-1 |
| `uses_context_memory_profiles` | 0 | — |

**All six categories: 0 residual dangling edges.** Target met.

---

## 10. Verdict

**PASS_WITH_FINDINGS.**

- Residual dangling edges driven to **0 in every category** (was 2 in `uses_model_provider_profiles`).
- `sdlc_pipeline.yaml` re-validates against `pipeline_definition.schema.json` with **0 errors** (R8 green;
  not broken by the sweep).
- Evidence != Trace preserved (directory + family); no plugin and no Core-Ability-as-agent introduced;
  Supervisor != team-lead, Skill != Tool, Governance != Audit all intact.
- One in-scope residual (F-1) was found and **closed** by registering two locked Core-Ability model
  profiles as candidates; one non-blocking advisory (A-1) is carried for Phase E/I ratification.
- No blocking findings. Not BLOCKED.

**Only file changed by this sweep:** `configs/nexus-ai/model_provider_profiles.yaml`.
