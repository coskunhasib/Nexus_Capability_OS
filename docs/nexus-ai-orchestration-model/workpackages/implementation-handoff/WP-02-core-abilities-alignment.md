# WP-02 — Core Abilities Alignment (Implementation Workpackage SPEC)

> **Nature:** This is a **planning artifact** — a workpackage *specification*, not an
> implementation. It describes WHAT a future, separately-approved execution phase would build to
> materialize the 8 Core Abilities, and HOW that build would be validated. It contains **no runtime
> code** and changes nothing in the running system. Authoring this spec is permitted under
> `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` (doc 22 §7/§8); **executing** it requires
> a further explicit owner decision and is out of scope here.
>
> **Implementation target:** a FUTURE Nexus runtime workspace (to be decided later). This workpackage
> does **not** modify the existing nexus app code and does **not** touch `main`. The `nexus` branch
> stays isolated from `main`.

---

## Workpackage contract (doc 20 §4 + `depends_on`)

```yaml
workpackage_id: WP-02-core-abilities-alignment
executor: Codex
reviewer: ChatGPT
depends_on:
  - WP-01      # shared-registry-loader workpackage — the loader/resolver foundation every
               # Core-Ability reference resolution depends on (runtime-refactor-plan/shared-registry-loader-plan.md).
               # WP-02 consumes the loaded/validated registries WP-01 produces; it must not re-implement
               # registry loading.
```

### workpackage_id

```text
WP-02-core-abilities-alignment
```

### executor

```text
Codex
```

### reviewer

```text
ChatGPT   (reviewer / auditor per doc 20 §3; verdict format PASS | PASS_WITH_FINDINGS | BLOCKED)
```

### depends_on

```text
WP-01    # shared-registry-loader workpackage.
```

WP-02 builds **on top of** WP-01: the Core Abilities layer is *seeded from* and *validated against*
the registries that WP-01's loader has already parsed, status-resolved, and usage-cross-checked. WP-02
must treat the loaded registry as input and **must not** re-implement shared-registry loading,
status resolution, or usage-mapping. If WP-01 is incomplete, WP-02 cannot start (build-sequencing
dependency).

### objective

```text
Materialize the 8 Core Abilities (Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS) for a
future Nexus runtime as PASSIVE, declarative capability handles — names preserved and canonical;
never agents; Supervisor never a team_lead — each wired by REFERENCE (not ownership) to its
model/provider profiles, exposed tools, governance profiles, and audit (Trace) schemas exactly as
recorded in configs/nexus-ai/core_abilities.yaml. Where this build and core_abilities.yaml ever
disagree, the registry wins and the build is the defect.
```

The objective is discharged by building the modules/artifacts in `required_outputs`, which together:

- represent the **fixed set of 8** Core Abilities, seeded from `core_abilities.yaml`, with the
  canonical `name`/`display_name` preserved and the lowercase `id` as the stable internal key
  (R11 name-form convention; lowercase `id` is canonical);
- enforce, at load time as **blocker-severity** assertions, that no Core Ability id ever appears as
  an agent / `owner_agent` / `sub_agent` / `agent_id` / team member, that Supervisor never appears as
  `team_lead` / `*_team_lead`, and that no plugin path loads or extends a Core Ability;
- expose each ability's four reference families (`model_provider_profiles`, `exposed_tools`,
  `governance_profiles`, `audit_schemas`) as **id references resolved by the sibling resolvers**, with
  the Core Abilities layer defining **no** model, tool, governance-policy, or schema body of its own
  (K-011 / D-014; the `core_ability_tools_are_referenced_not_defined` hard rule);
- preserve the risk tiering (Web and OS `default_risk_level: high`; Memory mutating;
  Supervisor/Coder/Vision pure-reasoning; Audio/Creative locked-but-unused) and the
  `web_and_os_higher_default_risk_than_reasoning_abilities` ordering;
- keep the four concept boundaries intact: Skill ≠ Tool; Governance ≠ Audit; Evidence ≠ Trace;
  Supervisor ≠ team_lead; and keep **Memory the Core Ability** distinct from **Context/Memory
  Profiles**.

This workpackage builds the **Core Abilities contract surface** (capability identity + reference
wiring + invariant assertions). It does **not** build the resolver engines themselves — those are
separate workpackages derived from the sibling plans (see `canonical_sources` and `forbidden_actions`).

### mandatory_context

```text
The executor MUST read and hold the following before producing any output:

1. The locked decisions this build is bound by and MUST NOT weaken:
   - K-001  Plugin cancelled; NEVER reintroduced; there is no plugin registry.
   - K-003  The 8 Core Abilities are a shared CAPABILITY layer; exactly 8; names locked-canonical.
   - K-004  Core Abilities are NOT agents, NOT teams, NOT SDLC team members.
   - K-006  Supervisor (Core Ability) != sdlc_team_lead / any *_team_lead.
   - K-011 / D-014  Web, OS, Memory remain Core Abilities; their callable operations live in the
            Tools Registry and are REFERENCED, not owned, by the Core Abilities layer.
   - Concept boundaries: Skill != Tool ; Governance != Audit ; Evidence != Trace.

2. A Core Ability is a PASSIVE declarative capability descriptor — invoked BY Agent-tier callers,
   never appearing AS a caller/agent/team member. (core-abilities-alignment.md §3)

3. The five hard_rules in core_abilities.yaml are the machine-checkable invariants and become the
   build's load-time assertions: core_ability_is_never_agent, supervisor_is_never_team_lead,
   core_ability_tools_are_referenced_not_defined, every_item_has_status_and_usage, no_plugin_registry.

4. References are RESOLVED, not OWNED: model/provider, tools, governance, audit are id references into
   sibling registries; the Core Abilities layer defines no bodies for any of them.

5. "candidate" status on a referenced id (e.g. core_ability_invocation_trace_schema,
   source_fetch_trace_schema, orchestration_governance, vision_governance, audio_governance,
   creative_governance, memory_reasoning_profile, audio_model, creative_generation_model) means the
   id is NOT a guaranteed binding and MUST NOT be force-resolved or ratified by WP-02.

6. The reconciliation debt items relevant to Core Abilities (R1 dangling Trace schemas, R3 candidate
   governance profiles, R7 candidate/absent exposed-tool primitives, R11 id-vs-Name casing) are
   pre-materialization concerns owned by the sibling resolver workpackages; WP-02 records them as
   inputs/assumptions and does NOT resolve them itself.

7. WP-01 (shared-registry-loader) is a hard build-sequencing dependency; its loaded+validated
   registry is WP-02's input.

8. Boundary: WP-02 targets a FUTURE Nexus runtime workspace decided later; it does NOT modify the
   existing nexus app, does NOT touch main, and asserts NO production readiness.
```

### canonical_sources

```text
SOURCE OF TRUTH for this component (its runtime/refactor PLAN + the relevant blueprint configs):

# Primary plan (component source of truth)
docs/ai-sdlc-factory/runtime-refactor-plan/core-abilities-alignment.md

# Authoritative existence record for the 8 Core Abilities (registry WINS over the plan on conflict)
configs/nexus-ai/core_abilities.yaml            # registry_id: nexus_ai_core_abilities

# Sibling registries that OWN the ids WP-02 only REFERENCES (resolution targets — not modified here)
configs/nexus-ai/model_provider_profiles.yaml   # model/provider ids referenced by abilities
configs/nexus-ai/tools_registry.yaml            # exposed_tools ids (the 11 Memory/Web/OS tools)
configs/nexus-ai/governance_profiles.yaml       # governance_profiles ids referenced by abilities
configs/nexus-ai/audit_schemas.yaml             # audit (Trace) schema ids referenced by abilities
configs/nexus-ai/context_memory_profiles.yaml   # the SEPARATE registry Memory-the-ability must NOT be conflated with

# Catalogs the "never an agent / never team_lead" load assertions cross-check against
configs/nexus-ai/agent_roles.yaml
configs/nexus-ai/sub_agent_roles.yaml
configs/nexus-ai/team_lead_roles.yaml
configs/nexus-ai/team_templates.yaml
configs/nexus-ai/stages/sdlc/                    # 31 stage contracts: owner_agent/sub_agents/team_lead + uses_core_abilities

# Sibling runtime/refactor plans that own the resolver mechanics WP-02 hands off to (read for boundaries)
docs/ai-sdlc-factory/runtime-refactor-plan/shared-registry-loader-plan.md     # WP-01 dependency
docs/ai-sdlc-factory/runtime-refactor-plan/model-provider-resolver-plan.md
docs/ai-sdlc-factory/runtime-refactor-plan/tool-permission-system-plan.md
docs/ai-sdlc-factory/runtime-refactor-plan/governance-engine-plan.md
docs/ai-sdlc-factory/runtime-refactor-plan/audit-evidence-store-plan.md
docs/ai-sdlc-factory/runtime-refactor-plan/context-memory-resolver-plan.md

# Governing standards / gates
docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md   # §4 contract, §5 completion report, §6 forbidden actions
docs/ai-sdlc-factory/21-runtime-refactor-planning-only-plan.md
docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md  # §6 hard blockers, §7 owner decision, §9 prohibitions
docs/ai-sdlc-factory/reviews/implementation-readiness-review.md  # source of the R1/R3/R7/R11 backlog
```

### required_outputs

> Each item below **describes a module/artifact to be BUILT in the future runtime workspace** by its
> name and responsibility. **No code is provided or implied here.** Names are responsibility labels for
> the spec, not mandated file paths. Every output is reference-resolving and passive: it may carry
> identity and pointers, never a model/tool/governance/schema *body*.

```text
1. CoreAbilityDescriptor (data model / type)
   Responsibility: the in-memory shape of one Core Ability capability handle. Carries id (canonical
   lowercase key), name + display_name (preserved, never renamed/abbreviated/recased/pluralized),
   type=core_ability (non-promotable), status (canonical for all 8), never_agent flag, never_team_lead
   flag (Supervisor only), default_risk_level, and the FOUR reference-id lists
   (model_provider_profiles, exposed_tools, governance_profiles, audit_schemas) plus allowed_callers,
   allowed_usage, forbidden_usage, and the used_by back-reference. The four lists hold IDS ONLY — the
   descriptor stores no model/tool/policy/schema body. The descriptor is passive: it exposes no
   "act"/"enact"/"as-agent" affordance.

2. CoreAbilitiesRegistrySeeder (loader-consumer / factory)
   Responsibility: consume the WP-01-loaded, validated core_abilities.yaml view and instantiate
   exactly 8 CoreAbilityDescriptor handles. Preserves canonical names; keys internal lookup on the
   lowercase id; maps a capitalized reference to the canonical id via the R11 name-form convention
   WITHOUT mass case-folding at every call site. Refuses to instantiate a 9th ability or to drop one
   of the 8. Does NOT itself parse YAML or re-load the registry (that is WP-01).

3. CoreAbilityInvariantAssertions (load-time guard)
   Responsibility: run the blocker-severity invariant checks BEFORE the Core Abilities layer is
   considered ready, mirroring the implementation-readiness checks already CLEAR:
     - no Core Ability id appears as owner_agent / sub_agent / agent_id / team member across
       agent_roles, sub_agent_roles, team_templates, and all 31 stage contracts (never_agent);
     - Supervisor never appears as team_lead / *_team_lead across team_lead_roles and all 31 stage
       contracts (never_team_lead);
     - no plugin path/token loads or extends any Core Ability (no_plugin_registry).
   On any failure the layer MUST refuse to become ready (a Core Ability silently acting as an agent is
   exactly the failure mode the locks exist to prevent). Emits a structured, reviewable failure record.

4. CoreAbilityReferenceBindingMap (resolution-handoff descriptor)
   Responsibility: for each ability, declare WHICH sibling resolver owns each reference family and
   hand the id lists off for resolution — model/provider -> model-provider-resolver; exposed_tools ->
   tool-permission-system; governance_profiles -> governance-engine (Core-Ability layer);
   audit_schemas -> audit/evidence store. It RESOLVES NOTHING ITSELF and DEFINES NO BODIES; it only
   routes id references and records each resolved id's status (canonical vs candidate). It must NOT
   force-resolve or ratify any candidate id, and must surface a candidate/dangling reference rather
   than silently bind it. Encodes that Web and OS expose NO model (callers' profile is used) and that
   only Memory/Web/OS expose tools (11 total: web 3, os 4, memory 4); the 5 reasoning abilities expose
   none.

5. CoreAbilityRiskTierPolicy (risk-tier metadata, not a governance engine)
   Responsibility: surface the per-ability default_risk_level and tier so the governance engine can
   apply the correct strictness — Web/OS = high (egress / fs-write + shell + process); Memory =
   mutating (memory_write -> no_silent_mutation); Supervisor/Coder/Vision = pure-reasoning/low;
   Audio/Creative = locked-but-unused/low. Preserves the
   web_and_os_higher_default_risk_than_reasoning_abilities ordering. This output carries METADATA only;
   it does NOT implement governance rules (that is the governance-engine workpackage).

6. CoreAbilityUsageMappingCrosscheck (bidirectional truthfulness check)
   Responsibility: cross-check each ability's used_by{pipelines,stages,capability_systems} against the
   consuming side's uses_core_abilities so a Core Ability is never silently bound or silently orphaned.
   Preserves the "locked-but-unused" state of Audio and Creative (anchored to
   nexus_ai_capability_system only; no fabricated callers or pipeline usage). Reuses WP-01's usage-map
   primitives where available rather than re-deriving them.

7. CoreAbilityContractValidationSuite (validation harness — see required_validations)
   Responsibility: an executable validation suite that asserts the registry validation block and the
   five hard_rules hold for the materialized layer (count == 8; never_agent on all 8;
   supervisor-not-team_lead; no_plugin_registry; tool_maps web=3/os=4/memory=4 == 11; risk ordering;
   every item has status + used_by-or-candidate). Produces a machine-readable pass/fail report feeding
   the completion report. Tests assert behavior against core_abilities.yaml as the oracle (registry
   wins on any conflict).

8. CoreAbilityReconciliationDebtManifest (documentation artifact, non-blocking)
   Responsibility: a machine-readable record of the Core-Ability reconciliation items (R1 dangling
   Trace schemas core_ability_invocation_trace_schema + source_fetch_trace_schema; R3 candidate
   governance profiles orchestration/vision/audio/creative_governance; R7 candidate/absent exposed-tool
   primitives; R11 id-vs-Name casing) marking each as owned by its sibling resolver workpackage and to
   be cleared BEFORE materialization (not by WP-02). WP-02 records them; it does NOT resolve them.

NOTE ON BOUNDARIES (what WP-02 MUST NOT build): the resolver engines themselves
(model-provider resolver, tool-permission system, governance engine, audit/evidence store,
context/memory resolver) and the shared-registry loader (WP-01) are SEPARATE workpackages. WP-02
builds the Core Abilities identity + reference-wiring + invariant surface and hands off to them.
```

### required_validations

```text
Registry-truth (oracle = configs/nexus-ai/core_abilities.yaml; registry wins on any conflict):
  - actual_core_ability_count == expected_core_ability_count == 8.
  - The 8 names are exactly {Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS}, preserved
    verbatim; lowercase id is the canonical key; display_name resolves to the same ability (R11).
  - tool_maps exact match: web=[web_search,web_fetch,web_scrape]; os=[file_read,file_write,shell_exec,
    process_run]; memory=[memory_search,memory_write,memory_summarize,context_recall]; total == 11.
  - Only Memory/Web/OS expose tools; Supervisor/Coder/Vision/Audio/Creative expose [] (zero).
  - Web and OS expose NO model/provider profile (caller's profile is used); their default_risk_level
    == high; web_and_os_higher_default_risk_than_reasoning_abilities holds.
  - Every item has status (all 8 canonical) and used_by (or is candidate); Audio/Creative remain
    locked-but-unused (used_by anchored to nexus_ai_capability_system; allowed_callers == []).

Hard-rule / invariant (blocker severity — failure => layer refuses to become ready):
  - core_ability_is_never_agent: no Core Ability id appears as owner_agent / sub_agent / agent_id /
    team member in agent_roles.yaml, sub_agent_roles.yaml, team_templates.yaml, or any of the 31
    stage contracts.
  - supervisor_is_never_team_lead: Supervisor never appears as team_lead / *_team_lead in
    team_lead_roles.yaml or any of the 31 stage contracts.
  - no_plugin_registry: no plugin path/token loads or extends any Core Ability (whole-tree scan).
  - core_ability_tools_are_referenced_not_defined: the Core Abilities layer defines NO model, tool,
    governance-policy, or audit-schema body — only id references.

Reference-resolution discipline (handoff correctness — not engine implementation):
  - Every referenced id is routed to the correct sibling resolver family; none is resolved/owned by
    WP-02.
  - Candidate ids (model: memory_reasoning_profile, audio_model, creative_generation_model;
    governance: orchestration/vision/audio/creative_governance; audit:
    core_ability_invocation_trace_schema, source_fetch_trace_schema) are surfaced as candidate and
    NOT force-resolved or ratified by WP-02.

Boundary-separation:
  - Memory the Core Ability (tools memory_search/memory_write/memory_summarize/context_recall) is kept
    distinct from context_memory_profiles.yaml (Context/Memory Profiles); no conflation.
  - Skill ≠ Tool, Governance ≠ Audit, Evidence ≠ Trace remain four separate reference families.

Build-sequencing:
  - WP-01 (shared-registry-loader) outputs are present and consumed; WP-02 does not re-implement
    registry loading.

Mechanical (per doc 20 §8 artifact rules):
  - The validation suite (output #7) runs and produces a machine-readable pass/fail report.
  - Every artifact produced is referenced in the completion report; assumptions and open questions are
    explicit and separated from decisions.
```

### forbidden_actions

```text
# GLOBAL executor forbidden actions (doc 20 §6; doc 22 §6/§9) — apply to EVERY workpackage:
- write to main (no commit/push/PR to the main branch).
- merge (nexus NEVER merges to main; no merge of any kind into main).
- start runtime/refactor work — i.e. produce runtime code or perform a product refactor — WITHOUT a
  further explicit owner approval (writing this WP spec is NOT authorization to execute it).
- add a connector / deploy / publish (no connector integration, no Nexus publish, no deploy).
- introduce a plugin or plugin registry (K-001 — cancelled and never reintroduced).
- self-approve (an executor may not stand in for the ChatGPT review or the owner decision).
- claim production readiness.

# WP-02-specific forbidden actions:
- Do NOT make any Core Ability an Agent, sub-agent, owner_agent, agent_id, team member, or (for
  Supervisor) a team_lead / *_team_lead — under any indirection.
- Do NOT add a 9th Core Ability, drop one of the 8, or rename/merge/split any of them; do NOT
  translate, abbreviate, pluralize, or re-case any of the canonical names away from the registry
  spelling.
- Do NOT define a model, tool, governance-policy, or audit-schema BODY inside the Core Abilities layer
  (references only — K-011 / D-014).
- Do NOT force-resolve or ratify any candidate id (governance profiles, audit/Trace schemas, or
  model/provider profiles); do NOT silently bind a candidate or dangling reference.
- Do NOT conflate Memory the Core Ability with Context/Memory Profiles
  (configs/nexus-ai/context_memory_profiles.yaml).
- Do NOT merge Governance with Audit, or Evidence with Trace, or Skill with Tool.
- Do NOT modify any configs/nexus-ai/* file (those registries are the source of truth WP-02 only
  reads); do NOT modify the existing nexus app code.
- Do NOT build the sibling resolver engines or the shared-registry loader (those are separate
  workpackages); do NOT resolve the R1/R3/R7/R11 reconciliation debt (record only — sibling-owned).
- Do NOT treat fetched/external content as trusted, and do NOT grant Web/OS tools execution outside
  the sandbox/trace posture their governance requires (this WP only wires references — it must not
  weaken those postures).
```

### completion_report_format

```yaml
# Per doc 20 §5 — the executor MUST return exactly this shape on completion.
workpackage_id: WP-02-core-abilities-alignment
executor: Codex
status: PASS | PASS_WITH_FINDINGS | BLOCKED
files_created:        # artifacts produced (in the future runtime workspace); every artifact listed
files_modified:       # expected EMPTY — WP-02 modifies no configs/nexus-ai/* and no existing nexus app code
validation_summary:   # per-check result for required_validations (registry-truth, hard-rule/invariant,
                      # reference-resolution discipline, boundary-separation, build-sequencing, mechanical)
blocking_findings:    # any invariant/hard-rule failure (e.g. ability seen as agent, Supervisor as team_lead,
                      # plugin path, body defined in Core-Ability layer, candidate force-resolved)
major_findings:
minor_findings:
open_questions:       # separate from decisions (doc 20 §8); see "Open questions" below
needs_chatgpt_review: true
```

---

## Build sequence (depends_on rationale)

```text
WP-01 (shared-registry-loader)  --produces-->  loaded + validated + usage-cross-checked registries
        │
        ▼
WP-02 (core-abilities-alignment)  --consumes-->  the loaded core_abilities.yaml view
        │  builds: CoreAbilityDescriptor, RegistrySeeder, InvariantAssertions,
        │          ReferenceBindingMap, RiskTierPolicy, UsageMappingCrosscheck,
        │          ContractValidationSuite, ReconciliationDebtManifest
        ▼
(hands off reference resolution to, but does NOT build:)
  model-provider-resolver WP · tool-permission-system WP · governance-engine WP ·
  audit-evidence-store WP · context-memory-resolver WP
```

WP-02 is gated behind WP-01 because every Core-Ability reference (model/provider, tools, governance,
audit) is resolved against registries that WP-01 loads and validates; without that foundation WP-02
would have to re-implement loading, violating the single-source rule.

## Owner-approval boundary (restated)

Building anything this spec describes requires the full gate sequence to clear and a further explicit
owner decision (doc 22 §7/§8). This document is a **workpackage specification only**. Until that
decision is issued, the following remain prohibited (doc 21 §3; doc 22 §6/§9): runtime code change,
product refactor, connector integration, deploy/Nexus publish, main-branch merge, plugin/plugin
registry, production-readiness claim. The `nexus` branch stays isolated from `main`.

## Open questions

```text
- WP-01 identity: this spec assumes WP-01 == the shared-registry-loader workpackage (per
  runtime-refactor-plan/shared-registry-loader-plan.md), since that loader is the foundation every
  Core-Ability reference resolution depends on. If the future implementation-handoff numbering assigns
  WP-01 to a different component, the depends_on label must be reconciled (the dependency target —
  the loaded/validated shared registry — does not change).
- Future runtime workspace + language/stack are "to be decided later", so required_outputs name
  responsibilities, not file paths or implementation technology. The executor must map these
  responsibility labels onto the chosen workspace layout when (and only when) execution is approved.
- R11 canonical reference form (lowercase id vs capitalized display_name as label) should be fixed by
  the sibling loader/resolver work before materialization; WP-02 keys on the lowercase id and treats
  display_name as an alias, but the corpus-wide reference form is not WP-02's to change.
```
