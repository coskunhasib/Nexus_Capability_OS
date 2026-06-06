# Core Abilities Alignment Plan (Runtime / Refactor — PLANNING ONLY)

- **Document id:** `runtime-refactor-plan/core-abilities-alignment`
- **Phase:** G/H — the first of the doc 21 §5 runtime/refactor plan documents
  ([`../21-runtime-refactor-planning-only-plan.md`](../../legacy/21-runtime-refactor-planning-only-plan.md),
  planning area #1 "Core Abilities alignment plan", requirements in doc 21 §6).
- **Nature:** **PLANNING ONLY.** This document describes *how* a future Nexus AI runtime would align
  the 8 Core Abilities to executable behaviour. It is a **plan, not an implementation**. It contains
  **no runtime code, no product refactor, no connector integration, no deploy/publish, no
  main-branch merge, and no plugin registry** (doc 21 §3; doc 22 §6/§9). Nothing here changes any
  artifact under `configs/nexus-ai/`; it only reads the existing blueprint and prescribes a future
  alignment.
- **Authoritative input:** [`../../../configs/nexus-ai/core_abilities.yaml`](../../../../configs/nexus-ai/core_abilities.yaml)
  (`registry_id: nexus_ai_core_abilities`) is the single source of truth for every fact asserted
  below. Where this plan and the registry ever disagree, **the registry wins** and this plan is
  the defect.
- **Gate already satisfied to author this:** the doc 21 §2 precondition — *Implementation readiness
  review PASS or PASS_WITH_FINDINGS without blocking findings* — is met by
  [`../reviews/implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md)
  (PASS_WITH_FINDINGS; all 9 hard blockers CLEAR).
- **Gate NOT yet satisfied (owner approval):** producing this plan is permitted; **acting on it is
  not.** No alignment described here may be built until (a) all doc 21 §5 plan docs exist, (b)
  [`../reviews/runtime-refactor-plan-review.md`](../../reviews/runtime-refactor-plan-review.md) returns
  PASS / PASS_WITH_FINDINGS with no blocking finding, and (c) the owner issues
  `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` (doc 22 §7). See §9.

---

## 1. Objective and scope

doc 21 §6 requires this plan to cover exactly three things:

```text
Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS — existing names preserved.
Core Abilities are NOT made agents.
Each Core Ability is defined with its model/provider, exposed tools, governance, audit relationships.
```

This document discharges those requirements by describing, for a future runtime, **how the 8 Core
Abilities are represented, named, instantiated, and wired to their model/provider profiles, exposed
tools, governance profiles, and audit schemas** — strictly as already recorded in
`core_abilities.yaml`. It does **not** design the runtime engine itself (that is the job of the
sibling plans: `pipeline-runner-plan.md`, `governance-engine-plan.md`, `audit-evidence-store-plan.md`,
`tool-permission-system-plan.md`, `model-provider-resolver-plan.md`, `context-memory-resolver-plan.md`,
`shared-registry-loader-plan.md`). This plan defines the **Core Abilities contract those engines must
honour** and hands off the engine mechanics to them.

### 1.1 In scope

- The fixed set of 8 Core Abilities and the rule that their **names are canonical and preserved**.
- The hard invariant that a Core Ability is **never** an Agent, sub-agent, owner_agent, team member,
  or (for Supervisor) a team_lead.
- How each ability's `model_provider_profiles`, `exposed_tools`, `governance_profiles`, and
  `audit_schemas` references resolve at runtime against the sibling registries.
- The risk tiering (pure-reasoning vs. high-risk I/O abilities) and what it implies for governance.
- The reconciliation debt that the future alignment must clear before materialization (§8).

### 1.2 Out of scope (non-goals — restated for this document)

- Any executable engine, class, function, schema migration, or config edit.
- Adding, removing, renaming, merging, or splitting any Core Ability (the set is locked at 8; K-003).
- Converting any Core Ability into an Agent or team role (forbidden; K-003/K-004/K-006).
- Defining tool schemas, model bindings, governance rules, or audit-schema bodies — those are owned
  by their own registries and only *referenced* here (K-011 / D-014).
- Any connector, plugin, MCP registry, deploy, publish, or main-branch merge.

---

## 2. Locked decisions this plan is bound by

These are inherited verbatim from `.memory/0002-locked-decisions.md` and the
`core_abilities.yaml` header; the future alignment **must not** weaken any of them.

| Lock | Statement | Where the runtime must enforce it |
|------|-----------|-----------------------------------|
| K-001 | Plugin is cancelled and never reintroduced; there is no plugin registry. | No Core Ability is loaded, exposed, or extended via any plugin mechanism. The alignment surface is the registry file only. |
| K-003 | The 8 Core Abilities are a shared **capability** layer. Exactly 8; names locked-canonical. | The runtime's Core Ability set is fixed at 8 and seeded from `core_abilities.yaml`; the canonical `name` strings are preserved as the stable identity. |
| K-004 | Core Abilities are NOT agents, NOT teams, NOT SDLC team members. | `never_agent: true` is a load-time blocker invariant, re-checked against agent/team catalogs (see §4). |
| K-006 | Supervisor (Core Ability) ≠ `sdlc_team_lead` / any `*_team_lead`. | `never_team_lead: true` on Supervisor is a load-time blocker invariant. The `*_team_lead` roles are Agent-tier callers, not the ability. |
| K-011 / D-014 | Web, OS, Memory remain Core Abilities; their callable operations live in the Tools Registry and are *referenced*, not owned, here. | The runtime owns the *ability identity* here and resolves `exposed_tools` ids against `tools_registry.yaml`; it never defines a tool body inside the Core Ability layer. |
| Concept boundaries | Skill ≠ Tool ; Governance ≠ Audit ; Evidence ≠ Trace ; Supervisor ≠ team_lead. | The alignment keeps these as four separate reference families per ability (`governance_profiles` vs `audit_schemas`; tools vs skills are not mixed). |

`core_abilities.yaml` `hard_rules` (`core_ability_is_never_agent`, `supervisor_is_never_team_lead`,
`core_ability_tools_are_referenced_not_defined`, `every_item_has_status_and_usage`,
`no_plugin_registry`) are the machine-checkable form of the above and become the runtime's Core
Ability load-time assertions (§4.2).

---

## 3. Alignment model — how a Core Ability maps to the runtime

A Core Ability is a **declarative capability descriptor**, not an actor. The future runtime aligns
each registry entry to an in-memory *capability handle* with the fields below — and nothing more. The
handle is **passive**: it is *invoked by* Agent-tier roles (the `allowed_callers`), it never appears
*as* a caller, agent, or team member.

```text
core_abilities.yaml entry  ──aligns to──►  runtime Core Ability capability handle
  id (lowercase)                              stable internal key (case rule per R11 — see §8)
  name (canonical, e.g. "Supervisor")         preserved display/identity string  (NEVER renamed)
  type/category: core_ability                 fixed; cannot be promoted to agent/team/role
  status: canonical                           all 8 are canonical and always loaded
  never_agent: true                           load-time blocker assertion (§4.2)
  never_team_lead: (supervisor only)          load-time blocker assertion (§4.2)
  default_risk_level                          risk tier -> governance strictness (§5; §6)
  model_provider_profiles[]   ──resolve──►    Model/Provider resolver (model-provider-resolver-plan.md)
  exposed_tools[]             ──resolve──►    Tool permission system (tool-permission-system-plan.md)
  governance_profiles[]       ──resolve──►    Governance engine, Core-Ability layer (governance-engine-plan.md)
  audit_schemas[]             ──resolve──►    Audit/evidence store (audit-evidence-store-plan.md)
  allowed_callers[]                           who may invoke this handle (Agent-tier roles only)
  allowed_usage[] / forbidden_usage[]         capability-scoped allow/deny, enforced by governance
  used_by{pipelines,stages,capability_systems} usage-mapping back-reference (doc 05 / doc 17 §13)
```

Three structural rules govern this mapping:

1. **The capability handle is invoked, never enacted as an agent.** Every ability's
   `forbidden_usage` begins with `being_declared_as_an_agent_owner_agent_or_sub_agent`; the runtime
   treats a Core Ability id appearing in any `owner_agent` / `sub_agents` / `agent_id` /
   `sub_agent_id` / `team_lead` position as a **blocker** (matches the implementation-readiness
   review hard-blocker checks #2 and #3, which are already CLEAR).
2. **References are resolved, not owned.** `model_provider_profiles`, `exposed_tools`,
   `governance_profiles`, and `audit_schemas` are *id references* into sibling registries. The Core
   Ability layer never defines a model, tool, policy, or schema body — it only points. This is the
   K-011 / D-014 contract and the `core_ability_tools_are_referenced_not_defined` hard rule.
3. **Usage mapping is bidirectional and must stay truthful.** Each ability carries `used_by`; each
   consuming stage carries `uses_core_abilities`. The future runtime's registry loader
   (`shared-registry-loader-plan.md`) must cross-check the two directions so a Core Ability is never
   silently bound or silently orphaned (doc 17 §13). Audio and Creative are deliberately anchored to
   `nexus_ai_capability_system` only (no pipeline binding yet) — the alignment must preserve that
   "locked-but-unused" state rather than fabricate usage.

---

## 4. Name preservation and the "never an agent" invariant

### 4.1 Name preservation (doc 21 §6, line 1)

The eight canonical names — **Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS** — are
locked (K-003). The future runtime:

- seeds its Core Ability set from `core_abilities.yaml` and uses the `name` field as the stable,
  human-facing identity that is **never** translated, abbreviated, pluralized, or re-cased away from
  the registry spelling;
- uses the lowercase `id` as the internal lookup key, with the **id-vs-Name casing reconciliation
  (R11)** resolved *before* materialization so loaders need no implicit case-folding (§8);
- rejects any attempt to add a 9th ability or drop one of the 8 (`expected_core_ability_count: 8`,
  `actual_core_ability_count: 8` in the registry `validation` block become a runtime load assertion).

### 4.2 "Never an agent" / "Supervisor never team_lead" (doc 21 §6, line 2)

These are the two strongest invariants. The future runtime enforces them at **load time** as
blocker-severity assertions, re-running the same checks the implementation-readiness review already
ran against the live configs:

| Assertion | Source field | Cross-check against | Severity |
|-----------|--------------|---------------------|:--------:|
| No Core Ability id appears as `owner_agent`, `sub_agent`, `agent_id`, or team member | `never_agent: true` (all 8) | `agent_roles.yaml`, `sub_agent_roles.yaml`, all 31 stage `owner_agent`/`sub_agents`, `team_templates.yaml` | **blocker** |
| Supervisor never appears as `team_lead` / `*_team_lead` | `never_team_lead: true` (supervisor) | all 31 stage `team_lead`, `team_lead_roles.yaml` | **blocker** |
| No plugin path loads or extends a Core Ability | `no_plugin: true`, `no_plugin_registry` hard rule | whole config tree (plugin-token scan) | **blocker** |

If any assertion fails, the alignment is invalid and the runtime must refuse to start the Core
Ability layer — a Core Ability silently behaving as an agent is precisely the failure mode these
locks exist to prevent.

---

## 5. Per-ability alignment (doc 21 §6, line 3)

Each of the 8 abilities is defined below **exactly as recorded in `core_abilities.yaml`** — its
model/provider, exposed tools, governance, and audit relationships, plus the risk tier and the
load-time status of every referenced id. "candidate" means the referenced id is owned by a sibling
registry and not yet ratified there; the future alignment must not treat a candidate reference as a
guaranteed binding.

### 5.0 Risk tiering (drives governance strictness in §6)

| Tier | Abilities | Why | `default_risk_level` in registry |
|------|-----------|-----|------|
| Pure-reasoning (no exclusive I/O tools) | Supervisor, Coder, Vision | reason-only; side-effects are delegated to OS-provided tools | not set (default low) |
| Reserved / unused | Audio, Creative | locked names, no pipeline binding yet (`unused_in_current_pipelines: true`) | not set (default low) |
| High-risk I/O | Web, OS | external network egress (Web); filesystem write + shell + process (OS) | **`high`** |
| Stateful recall | Memory | `memory_write` mutates state | not set; `no_silent_mutation` applies |

The registry `validation` block asserts
`web_and_os_higher_default_risk_than_reasoning_abilities: true`; the future governance engine must
preserve that ordering (Web/OS get the strictest Core-Ability governance stacks).

### 5.1 Supervisor — orchestration / routing capability

- **Identity:** `id: supervisor`, `name: Supervisor`, `status: canonical`. `never_agent: true`
  **and** `never_team_lead: true` (K-006). Pure-reasoning → low default risk.
- **Model/provider:** `supervisor_routing_model` (canonical).
- **Exposed tools:** `[]` — pure-reasoning ability; owns no callable tools. Any side-effecting tool
  it reasons about (e.g. `policy_query`) is provided by OS or a pipeline role, never by Supervisor.
- **Governance:** `orchestration_governance` (candidate), `no_self_approval` (canonical),
  `no_policy_bypass` (canonical), `evidence_required` (canonical). Aliases bound by stage contracts:
  `no_self_approval_policy`, `evidence_required_policy` (see `policy_aliases` in the registry).
- **Audit:** `core_ability_invocation_trace_schema` (candidate — Trace family; see R1, §8),
  `gate_decision_trace_schema` (canonical), `release_decision_trace_schema` (canonical).
- **Callers (Agent-tier ROLES, not the ability):** the six `*_team_lead` roles + `pipeline_orchestration_layer`.
- **Runtime note:** Supervisor *reasons about* routing/aggregation; it performs no environment/repo
  mutation and reads no raw secrets, and it cannot approve its own decision or bypass a blocking
  gate (`forbidden_usage`). The `*_team_lead` callers are roles that *call* this ability; they are
  not this ability (K-006).

### 5.2 Coder — software-engineering reasoning capability

- **Identity:** `id: coder`, `name: Coder`, `status: canonical`, `never_agent: true`. Most broadly
  used ability across SDLC (20 stages).
- **Model/provider:** `coder_engineering_model` (canonical).
- **Exposed tools:** `[]` — reasoning ability. The side-effecting engineering tools
  (`repo_reader` / `repo_writer` / `test_runner`) and filesystem/shell tools are **OS-provided**, so
  tool ownership stays single-sourced in the Tools Registry.
- **Governance:** `code_generation_governance` (canonical), `no_secret_read` (canonical),
  `no_silent_mutation` (canonical — every repo mutation goes through an explicit OS tool + trace).
- **Audit:** `core_ability_invocation_trace_schema` (candidate), `code_change_trace_schema`
  (canonical), `implementation_evidence_schema` (canonical).
- **Callers:** engineering / code_reviewer / qa / security_validation / contract_validation /
  data_migration / performance_resilience / operations_readiness / compliance / privacy /
  architecture agents.
- **Runtime note:** the alignment must keep Coder tool-less; the well-known failure mode is letting
  "Coder" mutate the repo directly. All mutation flows through OS tools with a trace
  (`no_silent_mutation`).

### 5.3 Vision — visual perception / reasoning capability

- **Identity:** `id: vision`, `name: Vision`, `status: canonical`, `never_agent: true`.
- **Model/provider:** `vision_model` (canonical).
- **Exposed tools:** `[]` — perception/reasoning only. The `accessibility_auditor` /
  `contrast_checker` that render and capture UI are **OS-provided** side-effect tools.
- **Governance:** `vision_governance` (candidate), `no_secret_read` (canonical).
- **Audit:** `core_ability_invocation_trace_schema` (candidate), `accessibility_evidence_schema`
  (canonical).
- **Callers:** `accessibility_ux_agent` (the only caller; owner of the conditional a11y/UX stage).
- **Runtime note:** narrow but real usage — bound only by the conditional
  `accessibility_ux_validation_if_applicable` stage. Still canonical (name is locked).

### 5.4 Audio — audio perception / reasoning capability (reserved, unused)

- **Identity:** `id: audio`, `name: Audio`, `status: canonical`, `never_agent: true`,
  `unused_in_current_pipelines: true`.
- **Model/provider:** `audio_model` (**candidate** — not referenced by any current stage/pipeline).
- **Exposed tools:** `[]` — none defined yet; capture/transcription tools would be OS-provided *when
  a pipeline binds Audio*.
- **Governance:** `audio_governance` (candidate), `no_secret_read` (canonical).
- **Audit:** `core_ability_invocation_trace_schema` (candidate).
- **Callers:** `[]` (none in the current catalog).
- **Runtime note:** `used_by` is anchored only to `nexus_ai_capability_system`. The future
  alignment **loads Audio as a canonical-but-unbound capability** and must **not** ratify
  `audio_model` until a pipeline actually binds Audio. Do not fabricate callers or pipeline usage.

### 5.5 Creative — creative generation capability (reserved, unused)

- **Identity:** `id: creative`, `name: Creative`, `status: canonical`, `never_agent: true`,
  `unused_in_current_pipelines: true`.
- **Model/provider:** `creative_generation_model` (**candidate** — no current binding).
- **Exposed tools:** `[]` — none yet; any generation/export tools would be OS-provided when bound.
- **Governance:** `creative_governance` (candidate), `no_secret_read` (canonical).
- **Audit:** `core_ability_invocation_trace_schema` (candidate).
- **Callers:** `[]`.
- **Runtime note:** same "locked-but-unused" handling as Audio; the likely future consumer is the
  `content_pipeline` candidate, but `creative_generation_model` is not ratified until a pipeline
  binds Creative.

### 5.6 Memory — long-term memory / recall capability

- **Identity:** `id: memory`, `name: Memory`, `status: canonical`, `never_agent: true`. Bound by all
  31 SDLC stages + all 5 non-SDLC pipelines + the dedicated `knowledge_memory_pipeline`.
- **Model/provider:** `memory_reasoning_profile` (candidate — `knowledge_memory_pipeline`).
- **Exposed tools (owned by the Tools Registry, referenced here):** `memory_search` (read-only
  recall), `memory_write` (**side-effect** — persist a memory item → governance + trace required),
  `memory_summarize`, `context_recall`.
- **Governance:** `memory_access_governance` (canonical), `no_secret_read` (canonical),
  `no_silent_mutation` (canonical — `memory_write` mutates state).
- **Audit:** `core_ability_invocation_trace_schema` (candidate), `memory_update_trace_schema`
  (canonical — memory write/update provenance).
- **Callers:** all SDLC owner_agents (shorthand `all_sdlc_agents`) + `research_intake_agent`,
  `knowledge_memory_agents`, `operations_agents`, `skill_librarian_agent`.
- **Runtime note — critical boundary:** **Memory the Core Ability ≠ Context/Memory Profiles.** The
  ability (with tools `memory_search` / `memory_write` / `memory_summarize` / `context_recall`) is
  resolved here; run/agent *working context* is a separate registry
  ([`../../../configs/nexus-ai/context_memory_profiles.yaml`](../../../../configs/nexus-ai/context_memory_profiles.yaml))
  resolved by `context-memory-resolver-plan.md`. The alignment must keep these two apart;
  `forbidden_usage` explicitly bans conflating them.

### 5.7 Web — external web access capability (HIGH risk)

- **Identity:** `id: web`, `name: Web`, `status: canonical`, `never_agent: true`,
  **`default_risk_level: high`** (external network egress).
- **Model/provider:** `[]` — Web is an *access* ability; reasoning over fetched content uses the
  **calling stage's** model profile (e.g. `sdlc_reasoning_profile`), not a Web-owned model.
- **Exposed tools (owned by the Tools Registry, referenced here):** `web_search`, `web_fetch`,
  `web_scrape` — all perform network egress.
- **Governance:** `web_access_governance` (canonical — higher default risk), `no_secret_read`
  (canonical — outbound requests may not leak secrets/credentials).
- **Audit:** `core_ability_invocation_trace_schema` (candidate), `source_fetch_trace_schema`
  (**candidate** — external-fetch provenance; see R1, §8).
- **Callers:** product_requirements / architecture / security_privacy / security_validation /
  compliance / contract_validation / accessibility_ux / operations_readiness agents +
  research_intake / knowledge_memory agents.
- **Runtime note:** Web is the headline K-011 / D-014 example (ability name here;
  `web_search`/`web_fetch`/`web_scrape` in the Tools Registry). Its tools require sandbox/trace and a
  no-secret-leak posture; fetched content is untrusted until a provenance trace exists
  (`forbidden_usage`: `treating_fetched_content_as_trusted_without_provenance_trace`).

### 5.8 OS — operating-system / execution capability (HIGHEST risk)

- **Identity:** `id: os`, `name: OS`, `status: canonical`, `never_agent: true`,
  **`default_risk_level: high`** (filesystem write + shell + process execution → highest risk).
- **Model/provider:** `[]` — OS is an *execution* ability; it runs tools and owns no reasoning
  model. Result interpretation uses the calling stage's model profile.
- **Exposed tools (owned by the Tools Registry, referenced here):** `file_read` (read-only),
  `file_write` (**side-effect** → governance + trace + sandbox), `shell_exec` (**side-effect** →
  sandbox + timeout + trace), `process_run` (**side-effect** → sandbox + timeout + trace).
- **Governance (strictest stack):** `system_access_governance` (canonical),
  `sandbox_execution_governance` (canonical — sandbox + timeout + trace for `shell_exec`/`process_run`),
  `no_silent_mutation`, `no_destructive_action_without_gate`, `no_secret_read` (all canonical blocker
  policies).
- **Audit:** `core_ability_invocation_trace_schema` (candidate), `code_change_trace_schema`
  (canonical — file/repo mutation provenance), `evidence_integrity_report_schema` (canonical —
  integrity of evidence written via OS tools).
- **Callers:** skill_librarian / engineering / code_reviewer / qa / security_validation / privacy /
  data_migration / accessibility_ux / performance_resilience / operations_readiness /
  evidence_graph / refraction_learning agents.
- **Runtime note:** OS is the provider of the side-effecting tools that Coder and Vision *reason
  with* (`repo_reader`/`repo_writer`/`test_runner`, `accessibility_auditor`/`contrast_checker`),
  keeping tool ownership single-sourced. The future tool-permission system must give OS the strictest
  gate: no shell/process outside a sandbox, no destructive action without an explicit policy gate +
  evidence, no production deploy.

### 5.9 Consolidated alignment matrix

| # | Ability | id | risk | model/provider | exposed tools (count) | governance profiles | audit schemas |
|---|---------|----|:----:|----------------|-----------------------|---------------------|---------------|
| 1 | Supervisor | `supervisor` | low | `supervisor_routing_model` | 0 | orchestration_governance*, no_self_approval, no_policy_bypass, evidence_required | core_ability_invocation_trace_schema*, gate_decision_trace_schema, release_decision_trace_schema |
| 2 | Coder | `coder` | low | `coder_engineering_model` | 0 | code_generation_governance, no_secret_read, no_silent_mutation | core_ability_invocation_trace_schema*, code_change_trace_schema, implementation_evidence_schema |
| 3 | Vision | `vision` | low | `vision_model` | 0 | vision_governance*, no_secret_read | core_ability_invocation_trace_schema*, accessibility_evidence_schema |
| 4 | Audio | `audio` | low (unused) | `audio_model`* | 0 | audio_governance*, no_secret_read | core_ability_invocation_trace_schema* |
| 5 | Creative | `creative` | low (unused) | `creative_generation_model`* | 0 | creative_governance*, no_secret_read | core_ability_invocation_trace_schema* |
| 6 | Memory | `memory` | mutating | `memory_reasoning_profile`* | 4 (`memory_search`,`memory_write`,`memory_summarize`,`context_recall`) | memory_access_governance, no_secret_read, no_silent_mutation | core_ability_invocation_trace_schema*, memory_update_trace_schema |
| 7 | Web | `web` | **high** | (none — uses caller's) | 3 (`web_search`,`web_fetch`,`web_scrape`) | web_access_governance, no_secret_read | core_ability_invocation_trace_schema*, source_fetch_trace_schema* |
| 8 | OS | `os` | **high** | (none — uses caller's) | 4 (`file_read`,`file_write`,`shell_exec`,`process_run`) | system_access_governance, sandbox_execution_governance, no_silent_mutation, no_destructive_action_without_gate, no_secret_read | core_ability_invocation_trace_schema*, code_change_trace_schema, evidence_integrity_report_schema |

`*` = id is **candidate** in its owning registry (must not be treated as a guaranteed binding by the
future alignment). Exposed-tool total = **11**, matching the registry `validation.tool_maps`
(web 3 + os 4 + memory 4).

---

## 6. How the alignment is consumed by the runtime (handoff to sibling plans)

This plan defines the Core Abilities **contract**; the following sibling plans (doc 21 §5) consume
it. The boundaries below are deliberate so no two plans claim the same responsibility.

| Reference family on a Core Ability | Resolved by (sibling plan) | What that plan must honour from here |
|------------------------------------|----------------------------|--------------------------------------|
| `model_provider_profiles[]` | `model-provider-resolver-plan.md` | Web and OS have **no** model (use the caller's profile); Audio/Creative/Memory models are candidates and must not be force-resolved. |
| `exposed_tools[]` | `tool-permission-system-plan.md` | Only Memory/Web/OS expose tools (11 total). The 5 reasoning abilities expose none. High-risk tools (OS shell/process, Web egress, `memory_write`, `file_write`) require sandbox/trace/gate per their governance. |
| `governance_profiles[]` | `governance-engine-plan.md` (Core-Ability layer, doc 03 §7) | Per-ability strictness follows the risk tier (§5.0). `no_self_approval` / `no_policy_bypass` (Supervisor) and the OS blocker stack are non-overridable. |
| `audit_schemas[]` | `audit-evidence-store-plan.md` | Evidence vs Trace must stay separate (doc 03 §10–12). `core_ability_invocation_trace_schema` is the common Trace entry across all 8 and is currently a dangling candidate (R1). |
| `used_by{...}` / `allowed_callers[]` | `pipeline-runner-plan.md` + `shared-registry-loader-plan.md` | A Core Ability is only ever *invoked* by an Agent-tier caller; the runner never instantiates a Core Ability as an agent/team member. |
| whole-registry load | `shared-registry-loader-plan.md` | Enforce the 5 `hard_rules` + the `validation` block as load assertions (count = 8, never_agent, supervisor-not-team_lead, no plugin, tool_maps). |

The `executor-integration-plan.md` and `pipeline-run-state-model.md` consume the *outputs* of the
above (resolved handles, governance verdicts, audit records); they do not re-resolve Core Abilities
directly.

---

## 7. Blueprint artifacts this plan builds on (traceability)

This plan is derived **only** from existing artifacts; it introduces no new authoritative source.

| Artifact | Role in this plan |
|----------|-------------------|
| [`../../../configs/nexus-ai/core_abilities.yaml`](../../../../configs/nexus-ai/core_abilities.yaml) | **Authoritative** — every per-ability fact in §5 / §5.9. |
| [`../21-runtime-refactor-planning-only-plan.md`](../../legacy/21-runtime-refactor-planning-only-plan.md) | Mandate (§5 required output #2; §6 requirements; §3 non-goals; §10 review handoff). |
| [`../22-final-stop-rule-and-readiness-gate.md`](../../legacy/22-final-stop-rule-and-readiness-gate.md) | Hard blockers (§6), owner-decision format (§7), prohibitions until approval (§9). |
| [`../reviews/implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md) | The doc 21 §2 gate (PASS_WITH_FINDINGS) that authorizes authoring this plan; source of the §8 reconciliation backlog (R1, R3, R7, R11). |
| [`../01-nexus-ai-operating-model.md`](../../01-nexus-ai-operating-model.md) | §6 Capability System (the 8 abilities are a capability layer, not agents/teams); §11 Model/Provider; §12 Context/Memory boundary; §14 "Agent ≠ Core Ability", "Team Lead ≠ Supervisor". |
| [`../03-governance-and-audit-layering.md`](../../legacy/03-governance-and-audit-layering.md) | §7 Core Ability Governance profile names; §10–12 the Evidence/Trace separation the audit references must preserve. |
| [`../06-governance-policy-evidence.md`](../../legacy/06-governance-policy-evidence.md) | Canonical policy ids (`no_self_approval`, `evidence_required`, `no_secret_read`, `no_silent_mutation`, `no_policy_bypass`, `no_destructive_action_without_gate`) referenced by the abilities. |
| [`../17-shared-registry-formalization-plan.md`](../../legacy/17-shared-registry-formalization-plan.md) | §3 item contract + §4 category fields + §11/§13 status & usage-mapping rules that shape the alignment model (§3). |
| [`../../../configs/nexus-ai/tools_registry.yaml`](../../../../configs/nexus-ai/tools_registry.yaml), [`model_provider_profiles.yaml`](../../../../configs/nexus-ai/model_provider_profiles.yaml), [`governance_profiles.yaml`](../../../../configs/nexus-ai/governance_profiles.yaml), [`audit_schemas.yaml`](../../../../configs/nexus-ai/audit_schemas.yaml), [`context_memory_profiles.yaml`](../../../../configs/nexus-ai/context_memory_profiles.yaml) | Sibling registries that **own** the ids this plan only *references* (the resolution targets in §6). |
| [`../../../configs/nexus-ai/agent_roles.yaml`](../../../../configs/nexus-ai/agent_roles.yaml), [`sub_agent_roles.yaml`](../../../../configs/nexus-ai/sub_agent_roles.yaml), [`team_lead_roles.yaml`](../../../../configs/nexus-ai/team_lead_roles.yaml), [`team_templates.yaml`](../../../../configs/nexus-ai/team_templates.yaml) | The catalogs the "never an agent / never team_lead" load assertions (§4.2) cross-check against. |

---

## 8. Reconciliation debt the future alignment must clear (non-blocking)

These are the Core-Ability-relevant items from the implementation-readiness review §3 backlog. **None
blocks producing this plan**; each must be resolved by the runtime/refactor work **before
materialization** (not before planning), per that review's disposition.

| Backlog id | Item (as it touches Core Abilities) | Severity | Action for the alignment |
|------------|-------------------------------------|:--------:|--------------------------|
| **R1** | `core_ability_invocation_trace_schema` (referenced by all 8 abilities) and `source_fetch_trace_schema` (Web) are **not defined as items** in `audit_schemas.yaml`. A loader following an ability's `audit_schemas` would reach a dangling id. | MAJOR | Register both as candidates (bind to `schemas/trace_item.schema.json`) before the audit/evidence store resolves Core-Ability traces. |
| **R3** | The candidate Core-Ability governance profiles `orchestration_governance`, `vision_governance`, `audio_governance`, `creative_governance` are referenced here but not yet defined/ratified in `governance_profiles.yaml`. | MAJOR | Register as candidates or record as aliases of canonical profiles before the governance engine resolves these abilities. |
| **R7** | `web_search` / `web_fetch` / `memory_write` are `status: candidate` in `tools_registry.yaml`; and **8** of the 11 `exposed_tools` (`web_scrape`, `file_read`, `file_write`, `shell_exec`, `process_run`, `memory_search`, `memory_summarize`, `context_recall`) are **absent** from `tools_registry.yaml` (internal-consistency only — no stage references them). | MINOR | Promote the candidates and either register the 8 primitives (preferred: with `provided_by_core_ability` + `requires_sandbox`) or trim them from `exposed_tools`/`tool_maps`, before the tool-permission system binds Core-Ability tools. |
| **R11** | Core Ability **id casing vs Name casing**: ids are lowercase (`supervisor`…); role/governance files reference the capitalized `Name`. Resolves today via case-fold. | MINOR | Pick and document the canonical reference form (id vs Name-as-label) so the future loader needs no implicit case-folding (see §4.1). |

The referential-integrity cluster (R1, R3, R7) is the highest-leverage Core-Ability work and is best
resolved as the registries are loaded by `shared-registry-loader-plan.md` / resolved by
`governance-engine-plan.md`, `audit-evidence-store-plan.md`, and `tool-permission-system-plan.md`.

---

## 9. Owner-approval dependency (explicit)

Authoring this plan is allowed; **building anything it describes is not**, until the full gate
sequence clears. This is the load-bearing boundary for this document.

```text
THIS PLAN (and its sibling doc 21 §5 plans)
        │  all plan docs exist
        ▼
docs/ai-sdlc-factory/reviews/runtime-refactor-plan-review.md
        │  verdict = PASS or PASS_WITH_FINDINGS, no blocking finding   (doc 21 §10; doc 22 §5)
        ▼
OWNER DECISION  (doc 22 §7)
        │  OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF
        │      → next phase = "Runtime / Refactor Implementation Planning Handoff" (doc 22 §8)
        │        (still NOT direct code — implementation workpackages are prepared first)
        │  OWNER_DECISION: HOLD_FOR_MORE_REVIEW
        │      → no transition; remain in planning
        ▼
(only after APPROVE) implementation workpackages → … → eventual materialization
```

Until `OWNER_DECISION: APPROVE_IMPLEMENTATION_PLANNING_HANDOFF` is issued, the following remain
**prohibited** for the Core Abilities layer and everything else (doc 21 §3; doc 22 §6/§9):

```text
runtime code change      product refactor        connector integration
deploy / Nexus publish   main-branch merge       plugin / plugin registry
production readiness claim
```

Owner approval (doc 22 §6 item 10) is the single pending final gate. The
[`implementation-readiness-review.md`](../../reviews/implementation-readiness-review.md) already
confirmed it is *not* a blocker for entering planning, but it **is** a hard requirement before any of
the alignment above is implemented. This document does not assert readiness to implement and does not
substitute for the owner decision.

---

## 10. Boundary statement

This is a documentation/blueprint **planning** artifact produced under the executor workflow standard
([`../20-executor-workflow-standard-plan.md`](../../legacy/20-executor-workflow-standard-plan.md)). It does
**not** constitute the ChatGPT review gate, does **not** substitute for owner approval, and does
**not** authorize implementation, refactor, merge, connector, deploy, or publish. It describes a
future alignment of the 8 Core Abilities and changes nothing in the running system. The 8 canonical
names are preserved, no Core Ability is made an agent, and every model/provider, tool, governance,
and audit relationship is taken verbatim from `core_abilities.yaml`.
