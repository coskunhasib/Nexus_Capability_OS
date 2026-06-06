# Shared Registry Formalization Review — Phase C / doc 17 §11 Validation

**Scope:** Validation of the 7 Shared-Registry files produced by the Shared Registry
Formalization phase (`docs/ai-sdlc-factory/17-shared-registry-formalization-plan.md`) against the
doc-17 §3 item contract, the §11 validation rules, and the §13 exit criteria, plus a cross-check
that every item referenced by the 31 SDLC stage contracts and the 5 non-SDLC pipeline catalog
entries is actually present in the registries (orphan / coverage check).

**Reviewer artifact type:** documentation / blueprint review only. No runtime code, no merge, no deploy.

**Inputs reviewed (read from disk):**

- Registries: `configs/nexus-ai/{core_abilities, skills_registry, tools_registry, governance_profiles, audit_schemas, model_provider_profiles, context_memory_profiles}.yaml`
- SDLC source: `configs/nexus-ai/stages/sdlc/*.yaml` (31 stage contracts), `sdlc_pipeline.yaml`, `sdlc_pipeline_runtime_rules.yaml`, `pipeline_catalog.yaml`, `artifact_registry.yaml`
- Non-SDLC pipelines: `docs/ai-sdlc-factory/pipeline-catalog/{research,activation,operations,skill-governance,knowledge-memory}-pipeline.md`
- Consolidated reference lists: `reviews/pipeline-catalog-review.md` §4 (newly-introduced governance/audit/tool/model/context names) and `reviews/claude-code-skill-agent-review.md` §8 (the 6 undeclared skills)
- Concept docs: `03-governance-and-audit-layering.md`, `05-shared-registry-and-usage-mapping.md`, `06-governance-policy-evidence.md`, `11-artifact-registry-standard.md`, `00a-shared-registry-decisions.md`

---

## Verdict

```text
PASS_WITH_FINDINGS
```

All four doc-17 §11 BLOCKED preconditions are clear: **all 7 shared categories have a registry
file**, all 7 parse, **no plugin registry exists**, and **no locked-decision breach exists** (Core
Ability/Agent boundary intact; Supervisor never a team lead; Skill≠Tool; Governance≠Audit;
Evidence≠Trace all preserved). The doc-17 §13 usage-mapping exit criterion is met: every item carries
a `used_by` reverse-index or is `status: candidate`, and **zero items referenced by the 31 SDLC stage
contracts or the 5 pipeline docs are orphaned** — usage mapping is enforceable from registry data.

The findings are **inter-registry referential-integrity gaps**: registries reference each other's
governance/audit ids (and Core-Ability→Tool ids) that do **not resolve** in the owning registry. These
are reconciliation debt for Phase E (governance/audit materialization) and a Phase C tidy-up; none is a
missing-registry or locked-decision breach, so the verdict is **not BLOCKED**.

---

## 1. doc-17 §11 / §13 validation checklist

| # | Validation rule (doc 17 §11 / §13) | Result | Evidence |
|---|---|---|---|
| 1 | Every shared category has a registry file | **PASS** | All 7 files present in `configs/nexus-ai/` and match the §12 output list exactly. |
| 2 | All registry files parse | **PASS** | `yaml.safe_load` succeeds on all 7. |
| 3 | Every item has a `status` | **PASS** | 0 items missing `status` across all 7 registries (core 8, skills 18, tools 73, gov 105, audit 66, model 21, context 26 = 317 items). |
| 4 | Every item has ≥1 `used_by` entry OR `status: candidate` | **PASS** | 0 items fail this across all 7. Unused-but-locked Core Abilities (Audio, Creative) anchor `used_by` to `nexus_ai_capability_system`. |
| 5 | No plugin registry exists | **PASS** | No `*plugin*` file. Every `plugin` token in configs is a negation/prohibition (`no_plugin: true`, `plugin_absent`, anti-pattern `plugin_stage`). |
| 6 | Core Ability / Agent boundary preserved | **PASS** | `never_agent: true` on all 8 abilities; no Core Ability appears as `owner_agent`/`sub_agent`/`agent`/`allowed_caller`/`producer`/`consumer` in any registry. |
| 6b | Supervisor not a team lead | **PASS** | `never_team_lead: true` on Supervisor; no `team_lead: <CoreAbility>` anywhere. The `*_team_lead` values in `allowed_callers` are Agent-tier roles that *call* Supervisor (K-006). |
| 7 | Evidence ≠ Trace preserved in audit_schemas | **PASS** | `type` field partitions all 66 items: 55 `evidence_schema`, 9 `trace_schema`, 2 `decision_record_schema`. Registry rule states they are never merged. |
| 8 | Locked skill semantics (prism, verification-loop) encoded | **PASS** | `prism.semantic_category = divergence` with `bug_finding` in `forbidden_usage`; `verification-loop.semantic_category = verification_defect_discovery` with both `general_readiness_checklist` and `replacing_test_execution` in `forbidden_usage`. Encoded as registry `invariants`. |
| 9 | Usage-mapping rule enforceable from registry data | **PASS** | `used_by` present on every item; **0 orphans** from 31 SDLC stages and 5 pipeline docs (see §3). |

---

## 2. Per-registry results

Legend: items = entries carrying a full doc-17 §3 contract; ✔ = pass.

| Registry (file) | Items (canon / cand) | §3 contract fields | Category fields (doc 17) | status | used_by-or-candidate | Notes |
|---|---|---|---|---|---|---|
| `core_abilities.yaml` | 8 (8 / 0) | ✔ all 11 | ✔ `model_provider_profiles, exposed_tools, governance_profiles, audit_schemas, allowed_callers, forbidden_usage` | ✔ | ✔ | Exactly 8 (K-003). `never_agent` on all; `never_team_lead` on Supervisor; `web`/`os` `default_risk_level: high`. |
| `skills_registry.yaml` | 18 (12 / 6) | ✔ all 11 | ✔ `semantic_category, primary_purpose, allowed_usage, forbidden_usage` | ✔ | ✔ | Canonical 12 + the 6 undeclared skills as `candidate`, each with `remap_candidate` note. prism/verification-loop locked semantics encoded. |
| `tools_registry.yaml` | 73 (35 / 38) | ✔ all 11 | ✔ `provided_by_core_ability, input_schema, output_schema, side_effects, risk_level, requires_sandbox, allowed_callers` | ✔ | ✔ | `provided_by_core_ability` ∈ {Coder, OS, Web, Memory, None}; no Core Ability as `allowed_caller`. See F-1, F-2. |
| `governance_profiles.yaml` | 105 (73 / 32) | ✔ | ✔ scoped by the 7 doc-17 §7 types | ✔ | ✔ | Grouped `global(8) / pipeline(7) / team(2) / stage(80) / core_ability(4) / skill(3) / tool(1)`. Canonical doc-06 §3 policies present under reconciled ids + aliases. See F-1, F-3. |
| `audit_schemas.yaml` | 66 (47 / 19) | ✔ | ✔ `type` ∈ {evidence_schema, trace_schema, decision_record_schema, gate_result_schema} | ✔ | ✔ | Evidence≠Trace machine-checkable via `type`. See F-1, F-3, F-4. |
| `model_provider_profiles.yaml` | 21 (8 / 13) | ✔ | ✔ all doc-17 §9: `used_by, provider_type, model_family, capability_scope, resource_limits, fallback_policy, governance_profiles, audit_schemas` | ✔ | ✔ | 0 items missing a §9 field. See F-1. |
| `context_memory_profiles.yaml` | 26 (9 / 17) | ✔ | ✔ all doc-17 §10: `scope, used_by, source_priority, retention, validity_window, retrieval_rules, redaction_rules, governance_profiles, audit_schemas` | ✔ | ✔ | 0 items missing a §10 field; `memory_vs_context_rule` present (Memory-ability ≠ Context-profile); `plugin_registry: false`. See F-1, F-3. |

**Concept-boundary compliance (all 7):** `Skill != Tool` (no skill in tools_registry; no tool/skill cross-listing), `Governance != Audit` (separate registries; audit registry rule states governance ids live in the separate file), `Evidence != Trace` (audit `type` field), `Core Ability != Agent` (above). Naming reconciliation: `no_self_approval_policy → no_self_approval` and `evidence_required_policy → evidence_required` are recorded under `aliases` in `core_abilities`, `skills_registry`, and `governance_profiles` global scope.

---

## 3. Orphan / coverage check (usage-mapping enforceability — doc 17 §13)

Every item referenced by the **31 SDLC stage contracts** and the **5 non-SDLC pipeline markdown docs**
was resolved against the registries (including each item's `aliases`).

| Category referenced | Distinct refs (SDLC stages) | Orphans (SDLC) | Distinct refs (5 pipeline docs) | Orphans (pipeline docs) |
|---|---|---|---|---|
| Skills | 18 | **0** | 28 | **0** |
| Tools | 45 | **0** | 45 | **0** |
| Governance profiles | 68 | **0** | 30 | **0** |
| Audit schemas | 47 | **0** | 23 | **0** |
| Model/provider profiles | 7 | **0** | 18 | **0** |
| Context/memory profiles | 10 | **0** | 18 | **0** |
| Core abilities | (all 8 mapped) | **0** | 20 | **0** |

**Consolidated §4 cross-check (pipeline-catalog-review.md SECTION 4):** every newly-introduced name
from the review's §4 lists is present in the matching registry — **109 / 109**: §4.1 governance 24/24,
§4.2 audit 20/20, §4.3 tools 33/33, §4.4 model 14/14, §4.5 context 18/18 (§4.6 team/agent roles are
Phase D scope, intentionally not in these 7 registries). **Undeclared skills (skill-agent-review §8):**
all 6 (`skill-architect, handoff-designer, context-pack-builder, scanner-result-normalizer,
evidence-graph-builder, release-readiness-judge`) present as `candidate`.

**Conclusion:** the forward usage-mapping direction (consumer → registry) is fully closed. The
`used_by` reverse index is present on every item. Usage mapping is enforceable from registry data. ✔

---

## 4. Findings (non-blocking)

### F-1 (MAJOR — Phase E reconciliation) — Inter-registry reference integrity: dangling governance/audit ids

While **no consumer (stage/pipeline) reference is orphaned**, the registries reference *each other's*
governance/audit ids that do **not resolve** as a defined item (nor as an `alias`) in the owning
registry. This is the inverse of the §3 orphan check: dangling edges *inside* the shared-registry
graph. Highest-impact dangling ids (referenced-count = number of registry items that point at a
non-existent id):

| Dangling id | Family | Referenced by | × | Owning registry | Present? |
|---|---|---|---|---|---|
| `tool_call_trace_schema` | Trace | tools_registry (73), context_memory (1) | 74 | audit_schemas | **No** |
| `tool_call_governance` | Governance | tools_registry | 73 | governance_profiles | **No** |
| `evidence_item_schema` | Evidence | tools_registry | 44 | audit_schemas | **No** (cf. `schemas/evidence_item.schema.json`) |
| `context_access_governance` | Governance | context_memory_profiles (all 26) | 26 | governance_profiles | **No** |
| `model_invocation_governance` | Governance | model_provider_profiles (all 21) | 21 | governance_profiles | **No** |
| `model_invocation_trace_schema` | Trace | model_provider_profiles (all 21) | 21 | audit_schemas | **No** |
| `skill_activation_trace_schema` | Trace | skills_registry (all 18) | 18 | audit_schemas | **No** |
| `skill_must_have_semantic_extraction_before_binding` | Governance | skills_registry (all 18) | 18 | governance_profiles | **No** |
| `context_usage_trace_schema` | Trace | context_memory_profiles | 13 | audit_schemas | **No** |
| `core_ability_invocation_trace_schema` | Trace | core_abilities (8) | 8 | audit_schemas | **No** |
| `source_fetch_trace_schema` | Trace | core_abilities (1) | 1 | audit_schemas | **No** |

Plus lower-count dangles: governance `global_governance`, `research_pipeline_governance`,
`requirements_governance`, `architecture_governance`, `verification_governance`,
`operations_readiness_governance`, `release_governance`, `orchestration_governance`,
`vision_governance`, `audio_governance`, `creative_governance`,
`sdlc_development_completion_governance`, `architecture_governance_profile`,
`security_privacy_design_governance`, `privacy_governance_profile`, `blocker_bug_zero`,
`residual_risk_recorded`; audit `requirements_evidence_schema`, `test_result_evidence_schema`,
`security_evidence_schema`, `operations_evidence_schema`, `decision_trace_schema` (4×),
`stage_gate_decision_trace`.

**Root cause / characterization.** The **generic Trace family** that doc 03 §12 enumerates verbatim —
*tool call trace, model invocation trace, context usage trace, skill activation trace, core ability
invocation trace* — was **not registered** as items in `audit_schemas.yaml` (whose 9 trace schemas are
all domain-specific: stage_gate, architecture_decision, code_change, security_finding, gate_decision,
release_decision, memory_update, activation_transition, skill_governance). Likewise the generic
**Governance** profiles for the tool / model / context / skill scopes (`tool_call_governance`,
`model_invocation_governance`, `context_access_governance`, `skill_must_have_semantic_extraction_before_binding`)
were referenced by the sibling registries but never defined. The `audit_schemas.yaml`
`cross_file_notes` even asserts these governance ids "are defined in the SEPARATE
governance_profiles.yaml" — but the most-referenced ones are not. So the registries are internally
cross-inconsistent.

**Why this is MAJOR but not BLOCKED.** doc-17 §11 limits BLOCKED to *a missing registry* or *a
locked-decision breach* — neither applies (all 7 registries exist; boundaries intact). doc-17 §13
defines enforceability as *"usage mapping rule is enforceable from registry data (`used_by` present)"* —
the `used_by` reverse index IS complete and the forward consumer→registry direction has **0 orphans**.
But the registry-to-registry governance/audit edges do not close, so a consumer that follows a tool's
`audit_schemas: [tool_call_trace_schema]` (74 such references) reaches a dangling id. This must be
fixed before Phase E governance/audit configs are materialized.

**Recommendation (Phase C tidy-up + Phase E):** register the generic Trace-family schemas
(`tool_call_trace_schema`, `model_invocation_trace_schema`, `context_usage_trace_schema`,
`skill_activation_trace_schema`, `core_ability_invocation_trace_schema`) and the generic
`evidence_item_schema` (binding it to `configs/nexus-ai/schemas/evidence_item.schema.json` /
`trace_item.schema.json`) in `audit_schemas.yaml`; register the scope-level governance profiles
(`tool_call_governance`, `model_invocation_governance`, `context_access_governance`,
`skill_must_have_semantic_extraction_before_binding`) in `governance_profiles.yaml`. Each may be
`status: candidate`. Then re-run the dangling-edge check until it reaches zero.

### F-2 (MINOR — Phase C) — Core-Ability → Tool map gap (`exposed_tools` not all in tools_registry)

`core_abilities.yaml` declares 11 task-mandated Web/OS/Memory `exposed_tools` and asserts in its
notes + `validation.tool_maps` that they are "owned by the Tools Registry, referenced here." Only
**3 of 11 exist** in `tools_registry.yaml`:

| Ability | Declared `exposed_tools` | In tools_registry? |
|---|---|---|
| Web | `web_search`, `web_fetch` | present |
| Web | `web_scrape` | **missing** |
| OS | `file_read`, `file_write`, `shell_exec`, `process_run` | **all 4 missing** |
| Memory | `memory_write` | present |
| Memory | `memory_search`, `memory_summarize`, `context_recall` | **all 3 missing** |

The Coder entry's note even says "Engineering side-effects (repo_reader/repo_writer/test_runner) are
OS-provided tools (see OS.exposed_tools)" — but the OS primitives it points to are absent. **Impact is
internal-consistency only:** no SDLC stage's `uses_tools` references any of the 8 missing primitives
(stages use the higher-level `repo_reader`/`repo_writer`/`test_runner`/`artifact_writer`/etc., all of
which ARE present, with `provided_by_core_ability: Coder`/`OS`). So no consumer is broken; the
Core-Ability→Tool ownership map simply does not round-trip for the 8 primitives.

**Recommendation:** either register the 8 missing primitive tools in `tools_registry.yaml` (with
`provided_by_core_ability: OS`/`Web`/`Memory`, `requires_sandbox: true` for the side-effecting ones),
or amend `core_abilities.yaml` to drop the primitives from `exposed_tools`/`tool_maps` and reference
only the higher-level tools that actually exist. Prefer the former for fidelity to K-011/D-014.

### F-3 (MINOR — Phase C) — `_policy` naming reconciliation applied inconsistently

The doc-17 alias mechanism (canonical id + variant under `aliases`) is correctly applied in
`skills_registry.yaml`, `core_abilities.yaml`, and `governance_profiles.yaml` global scope for
`no_self_approval_policy` / `evidence_required_policy`. But several other `_policy` variants are
referenced by sibling registries and **dangle** instead of resolving via an alias:
`no_silent_mutation_policy` (context, 2×; canonical `no_silent_mutation` is itself aliased by
`trace_required`), `no_secret_read_policy` (context, 1×; canonical `no_secret_exposure`),
`global_trace_required_policy` (audit, 9×), `global_no_secret_policy` (tools, 9×).

**Recommendation:** add these variants to the `aliases` of their canonical governance items so the
reconciliation rule is uniform and these references resolve.

### F-4 (INFO) — `gate_result_schema` type declared but unused

`audit_schemas.yaml` declares `gate_result_schema` in its `type_vocabulary` (matching doc 17 §8's four
types) but **no item carries `type: gate_result_schema`** — gate results are folded into
`evidence_schema` items (e.g. the `*_GATE_RESULT` artifacts). This is consistent with doc 06 §8 (a gate
result is evidence) and not a defect; flag only so Phase E either populates the type or documents that
gate results are intentionally modeled as evidence.

---

## 5. Locked-decision compliance summary

| Locked decision | Status |
|---|---|
| Plugin cancelled / no plugin registry, ever | **UPHELD** — no plugin file; only negations (`no_plugin: true`, `plugin_absent`, anti-pattern `plugin_stage`). |
| Core Abilities are NOT agents / team members | **UPHELD** — `never_agent: true` on all 8; never appear as `owner_agent`/`sub_agent`/`allowed_caller`/`producer`/`consumer`. |
| Supervisor ≠ any team_lead | **UPHELD** — `never_team_lead: true`; `*_team_lead` only ever a *caller* of Supervisor. |
| Core Abilities live ONLY in the Core Abilities registry | **UPHELD** — abilities not duplicated as skills/tools; their operations are referenced (not redefined) as tools (modulo F-2 gap). |
| Skill ≠ Tool | **UPHELD** — no skill in tools_registry; no tool in skills_registry. |
| Governance ≠ Audit | **UPHELD** — separate files; audit registry rule keeps governance ids out of audit definitions. |
| Evidence ≠ Trace | **UPHELD** — audit `type` field partitions Evidence vs Trace; never merged. |
| prism = brainstorming only; verification-loop = bug/defect finding only | **UPHELD** — encoded in `semantic_category` + `forbidden_usage` + registry `invariants`. |
| Shared Registry + Usage Mapping for all 7 categories | **UPHELD** — all 7 registries exist; `used_by` reverse index on every item; 0 consumer orphans. |
| `*_policy` variant reconciliation via canonical id + alias | **PARTIAL** — applied for the two primary policies; F-3 lists variants not yet aliased. |

**No locked-decision breach. No registry missing. Verdict = PASS_WITH_FINDINGS.**

---

## 6. Recommended actions before Phase C closure / for Phase E

1. **Fix F-1 (priority):** register the generic Trace-family schemas + `evidence_item_schema` in
   `audit_schemas.yaml`, and the scope-level governance profiles (`tool_call_governance`,
   `model_invocation_governance`, `context_access_governance`,
   `skill_must_have_semantic_extraction_before_binding`) in `governance_profiles.yaml`; then re-run the
   dangling-edge scan to zero.
2. **Fix F-2:** register the 8 missing OS/Web/Memory primitive tools in `tools_registry.yaml`
   (preferred), or trim them from `core_abilities.yaml` `exposed_tools`/`tool_maps`.
3. **Fix F-3:** add the remaining `_policy` variants to their canonical items' `aliases`.
4. **Note F-4:** populate or document the unused `gate_result_schema` type.
5. Carry the governance/audit subsets of F-1/F-3 into Phase E (`19-governance-audit-readiness-plan.md`).

---

## Returned object

```yaml
verdict: PASS_WITH_FINDINGS
file_path: docs/ai-sdlc-factory/reviews/shared-registry-formalization-review.md
blocking_findings: []   # no missing registry; no locked-decision breach
findings:
  - F-1 (MAJOR): inter-registry referential integrity — 13 governance ids + 13 audit-schema ids
      referenced by sibling registries do not resolve in the owning registry. Highest impact:
      tool_call_trace_schema (74x), tool_call_governance (73x), evidence_item_schema (44x),
      context_access_governance (26x), model_invocation_governance / model_invocation_trace_schema
      (21x each), skill_activation_trace_schema / skill_must_have_semantic_extraction_before_binding
      (18x each), core_ability_invocation_trace_schema (8x). The generic Trace family (doc 03 §12)
      and the generic evidence_item_schema / scope-level governance profiles were never registered as
      items. Phase E reconciliation. NOT blocking (no consumer/stage orphan; used_by index complete).
  - F-2 (MINOR): Core-Ability -> Tool map gap — core_abilities exposed_tools declares 11 Web/OS/Memory
      primitives "owned by tools_registry" but 8 (file_read, file_write, shell_exec, process_run,
      web_scrape, memory_search, memory_summarize, context_recall) are absent from tools_registry.
      No SDLC stage references them, so internal-consistency only.
  - F-3 (MINOR): _policy naming reconciliation applied inconsistently — no_silent_mutation_policy,
      no_secret_read_policy, global_trace_required_policy, global_no_secret_policy referenced but not
      recorded as aliases of their canonical governance ids.
  - F-4 (INFO): gate_result_schema type declared in audit type_vocabulary but no item uses it
      (gate results are modeled as evidence_schema).
notes: >-
  All 7 registries exist and parse. 317 items; every item has a status and a used_by entry or is
  status: candidate. No plugin registry (only negations). Core Ability/Agent boundary intact:
  never_agent on all 8 abilities, never_team_lead on Supervisor, no Core Ability as
  owner_agent/sub_agent/allowed_caller/producer/consumer anywhere. Evidence != Trace machine-checkable
  via audit `type` (55 evidence / 9 trace / 2 decision_record). prism (divergence; bug_finding
  forbidden) and verification-loop (verification_defect_discovery; general_readiness_checklist +
  replacing_test_execution forbidden) locked semantics encoded as registry invariants. Usage-mapping
  rule enforceable: 0 orphans from the 31 SDLC stage contracts and 5 pipeline docs across all
  categories; all 109 pipeline-catalog-review §4 newly-introduced names present; all 6 undeclared
  skills (skill-agent-review §8) registered as candidates. Findings are inter-registry
  referential-integrity gaps (F-1/F-3) and a Core-Ability->Tool map gap (F-2) — Phase C/E
  reconciliation debt, no locked-decision breach, no missing registry. Verdict PASS_WITH_FINDINGS.
```
