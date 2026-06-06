# Team / Agent / Sub-agent Catalog Review

Phase D / doc 18 (§12 validation + §14). Documentation/blueprint review only — no runtime
code, no merge, no deploy.

**Verdict: PASS_WITH_FINDINGS**

No BLOCKED condition is present (no stage without an owner role, no orphan sub-agent, no Core
Ability listed as an Agent, no Supervisor as a Team Lead). The findings are non-blocking
cross-file naming/aliasing items, each already documented in the catalogs and their
`open_questions`.

---

## 1. Scope and sources reviewed

Files reviewed (the four catalog files under review):

- `configs/nexus-ai/team_templates.yaml`
- `configs/nexus-ai/team_lead_roles.yaml`
- `configs/nexus-ai/agent_roles.yaml`
- `configs/nexus-ai/sub_agent_roles.yaml`

Authoritative sources cross-checked (read from disk):

- `configs/nexus-ai/stages/sdlc/*.yaml` — all 31 SDLC stage contracts (AUTHORITATIVE for SDLC
  `owner_agent` + `sub_agents`).
- `docs/ai-sdlc-factory/pipeline-catalog/{research,activation,operations,skill-governance,knowledge-memory}-pipeline.md`
  — the 5 non-SDLC pipeline rosters.
- Shared registries: `core_abilities.yaml`, `skills_registry.yaml`, `tools_registry.yaml`,
  `governance_profiles.yaml`, `audit_schemas.yaml`, `model_provider_profiles.yaml`,
  `context_memory_profiles.yaml`.

Registry sizes observed (used as the resolution sets): 18 skills, 81 tools, 118 governance
profiles (incl. aliases), 66 audit schemas, 21 model/provider profiles, 26 context/memory
profiles, 8 Core Abilities.

Counts: **6 team templates, 6 team leads, 53 agent role instances, 8 sub-agents.**

---

## 2. Check (1) — SDLC stage → owner_agent coverage table

Every distinct `owner_agent` across the 31 SDLC stage contracts maps to a role. The two
review-gate stages are owned by `sdlc_team_lead` (a Team Lead, intentionally NOT an
`agent_roles.yaml` entry — the no-self-approval fallback). All other 29 stages map to a
present `agent_roles.yaml` agent. **No stage is without an owner role.**

| # | stage_id | owner_agent | present? |
|---|----------|-------------|----------|
| 1 | intake | product_requirements_agent | present (agent) |
| 2 | domain_risk_profile | domain_risk_agent | present (agent) |
| 3 | skill_semantic_extraction | skill_librarian_agent | present (agent) |
| 4 | requirements | product_requirements_agent | present (agent) |
| 5 | requirements_review | **sdlc_team_lead** | present (team lead — no-self-approval fallback) |
| 6 | architecture | architecture_agent | present (agent) |
| 7 | architecture_review | **sdlc_team_lead** | present (team lead — no-self-approval fallback) |
| 8 | security_privacy_design | security_privacy_agent | present (agent) |
| 9 | premortem_fmea | risk_agent | present (agent) |
| 10 | planning | planning_agent | present (agent) |
| 11 | implementation | engineering_agent | present (agent) |
| 12 | code_review | code_reviewer_agent | present (agent) |
| 13 | test_generation | qa_agent | present (agent) |
| 14 | test_execution | qa_agent | present (agent) |
| 15 | verification_loop_bug_finding | qa_agent | present (agent) |
| 16 | security_validation | security_validation_agent | present (agent) |
| 17 | supply_chain_sbom_license | supply_chain_agent | present (agent) |
| 18 | ai_agent_safety_evaluation | agentic_safety_agent | present (agent) |
| 19 | privacy_data_lifecycle_validation | privacy_agent | present (agent) |
| 20 | api_contract_compatibility_validation | contract_validation_agent | present (agent) |
| 21 | domain_regulatory_compliance_validation_if_applicable | compliance_agent | present (agent) |
| 22 | data_migration_validation_if_applicable | data_migration_agent | present (agent) |
| 23 | accessibility_ux_validation_if_applicable | ux_accessibility_agent | present (agent) |
| 24 | performance_resilience | performance_resilience_agent | present (agent) |
| 25 | cost_resource_governance | cost_resource_agent | present (agent) |
| 26 | backup_restore_dr_validation_if_applicable | operations_readiness_agent | present (agent) |
| 27 | operations_readiness | operations_readiness_agent | present (agent) |
| 28 | evidence_graph_build | evidence_graph_agent | present (agent) |
| 29 | development_completion | release_manager_agent | present (agent) |
| 30 | release_candidate | release_manager_agent | present (agent) |
| 31 | refraction_learning | memory_curator_agent | present (agent) |

24 distinct SDLC agent owners + `sdlc_team_lead` (Team Lead) = full coverage of the 31 stages.
`team_lead` on all 31 stage contracts is `sdlc_team_lead` (consistent).

Non-SDLC rosters match their pipeline docs zero-diff:

- research_team (10): research_intake, research_scoping, source_discovery, source_reliability,
  claim_extraction, claim_evidence, cross_validation, uncertainty_reporting, research_synthesis,
  research_completion — all present.
- activation_team (5): activation_manager, pilot_activation, activation_reviewer,
  activation_owner_decision, rollback_readiness — all present.
- operations_team (6): incident_intake, severity_classification, mitigation_planning,
  incident_response, postmortem, operational_learning — all present.
- skill_governance_team (2): skill_librarian (governance instance), skill_runtime_safety — present.
- knowledge_team (6): knowledge_intake, source_classification, memory_summarization,
  validity_window, retrieval_profile, memory_expiration — all present.

---

## 3. Check (2) — sub_agent coverage

8 distinct sub-agents are referenced across the stage contracts (stages 3, 6×2, 8, 13, 15, 16,
28) and the skill-governance pipeline (which reuses `skill_semantic_extractor_subagent`). The
other 4 non-SDLC pipelines declare no sub-agents.

All 8 referenced sub-agents exist in `sub_agent_roles.yaml`. **No referenced sub-agent is
missing; no defined sub-agent is unreferenced.**

| sub_agent | referenced by stage | in sub_agent_roles.yaml? |
|-----------|---------------------|--------------------------|
| skill_semantic_extractor_subagent | #3 (+ skill-gov §2.2) | yes |
| api_design_subagent | #6 architecture | yes |
| data_model_subagent | #6 architecture | yes |
| threat_modeling_subagent | #8 security_privacy_design | yes |
| test_generation_subagent | #13 test_generation | yes |
| bug_hunter_subagent | #15 verification_loop_bug_finding | yes |
| security_scan_interpreter_subagent | #16 security_validation | yes |
| evidence_trace_subagent | #28 evidence_graph_build | yes |

---

## 4. Check (3) — orphan sub-agent check

Every sub-agent declares a `parent_agent` and `team_lead_direct_call_allowed: false`. Every
parent resolves to a present agent role. **No orphans.**

| sub_agent | parent_agent | parent in agent_roles? | team_lead_direct_call_allowed |
|-----------|--------------|------------------------|-------------------------------|
| skill_semantic_extractor_subagent | skill_librarian_agent | yes | false |
| api_design_subagent | architecture_agent | yes | false |
| data_model_subagent | architecture_agent | yes | false |
| threat_modeling_subagent | security_privacy_agent | yes | false |
| test_generation_subagent | qa_agent | yes | false |
| bug_hunter_subagent | qa_agent | yes | false |
| security_scan_interpreter_subagent | security_validation_agent | yes | false |
| evidence_trace_subagent | evidence_graph_agent | yes | false |

`team_templates.yaml` `direct_sub_agents: []` for every team and
`may_call_direct_sub_agents: []` for every team lead are consistent with this (all sub-agents
are parented, none are team-lead-direct-call).

---

## 5. Check (4) — no Core Ability listed as an Agent

The 8 Core Abilities [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS] do NOT
appear as any `agent_id`, as any `sub_agent_id`, or as any `agents:` member in
`team_templates.yaml`. They appear only via `uses_core_abilities` / `may_use_core_abilities` /
`uses_core_abilities` (capability layer). **PASS.** In particular the knowledge_team correctly
keeps Memory as a used capability (forbidden_actions includes
`memory_core_ability_promoted_to_agent`).

## 6. Check (5) — Supervisor is not a Team Lead; no Team Lead as an Agent

The 6 team leads are `sdlc_team_lead`, `research_team_lead`, `activation_team_lead`,
`operations_team_lead`, `skill_governance_team_lead`, `knowledge_team_lead`. `Supervisor` is
not among them. No `*_team_lead` id appears as an `agent_id`. Every team-lead forbidden_actions
block carries `cannot_act_as_the_supervisor_core_ability`. **PASS.**

## 7. Check (6) — review-gate owner differs from the authoring agent (no self-approval)

- `requirements_review` (#5): owner `sdlc_team_lead`, authoring agent `product_requirements_agent` → distinct.
- `architecture_review` (#7): owner `sdlc_team_lead`, authoring agent `architecture_agent` → distinct.

No agent's `reviewed_by` equals its own `agent_id` (0 self-approval cases across all 53 agent
instances). Every `reviewed_by` target resolves to a distinct existing agent or a team lead.
Structural reviewer-distinctness also holds in the non-SDLC pipelines, e.g.:

- code_review owner `code_reviewer_agent` ≠ changeset author `engineering_agent`.
- qa_agent (verification/bug-finding) ≠ engineering_agent (changeset author).
- research cross_validation_agent is distinct from the producing agents.
- activation_reviewer_agent / activation_owner_decision_agent distinct from pilot owner;
  activation_owner_decision_agent RECORDS a human/owner decision (not an autonomous approver).
- skill_runtime_safety_agent (activation decision) ≠ skill_librarian_agent (binding proposer).

**PASS.**

## 8. Check (7) — every shared-registry reference resolves

Programmatic resolution of every `uses_*` / `may_use_*` / `may_call_*` list item against the 7
registries: **0 unresolved references** in `agent_roles.yaml`, `sub_agent_roles.yaml`, and
`team_lead_roles.yaml`. The governance `_policy` variants (`no_self_approval_policy`,
`evidence_required_policy`) resolve via the registered `aliases:` in
`governance_profiles.yaml` (canonical `no_self_approval` / `evidence_required`). Core Abilities
referenced by capitalized `name` resolve to the lowercase registry `id` (case-fold). Skill ids
are disjoint from tool ids (Skill != Tool); evidence vs trace schemas are kept distinct
(Evidence != Trace); governance vs audit are kept distinct (Governance != Audit).

## 9. Check (8) — no plugin field

No active `plugin:` field exists in any of the four catalog files (or anywhere under
`configs/nexus-ai/*.yaml`). The only plugin tokens present are explicit negations / locks:
`plugin_registry: false`, `no_plugin: true`, invariant "No plugin field exists", and
forbidden-action entries (`introduce_plugin`, `cannot_reintroduce_a_plugin_concept`). **PASS.**

---

## 10. Findings (non-blocking)

These are consistency/naming items, each already disclosed in the catalogs and/or their
`open_questions`. None blocks the catalog.

- **F-1 — skill_librarian shared-role id spelling differs across files.**
  `agent_roles.yaml` models the skill-governance instance as
  `skill_librarian_agent_skill_governance` (a per-team alias to keep `team_id`/`pipeline_id`
  single-valued), while `team_lead_roles.yaml` (skill_governance_team_lead.may_assign_agents),
  `team_templates.yaml` (skill_governance_team.agents), and the skill-governance pipeline doc
  all reference the canonical `skill_librarian_agent`. Intentional and documented
  (agent_roles.yaml notes + OQ-TL-3), but a loader must treat
  `skill_librarian_agent_skill_governance` as an alias of `skill_librarian_agent`. Recommend
  Phase E pick one canonical id + an explicit alias map so the three files spell it identically.

- **F-2 — evidence_trace_subagent parent reconciliation.**
  Team-model §6.8 lists `parent_agent: release_manager_agent`; the stage #28 contract reconciled
  the owner to `evidence_graph_agent` (artifact-author vs gate-decider separation), and
  `sub_agent_roles.yaml` follows the stage contract (`parent_agent: evidence_graph_agent`). This
  matches the authoritative stage #28 `owner_agent`. Documented inline + open_questions; flagged
  so doc 04/team-model §6.8 is updated to match.

- **F-3 — knowledge team naming (YAML vs markdown).**
  `pipeline_catalog.yaml` names the 6th team `knowledge_memory_team` / `knowledge_memory_team_lead`,
  while the pipeline markdown and all four Phase D catalogs use `knowledge_team` /
  `knowledge_team_lead` (markdown-authoritative rule). Reconcile `pipeline_catalog.yaml` (OQ-TL-1).

- **F-4 — governance `_policy` alias spelling drift.**
  SDLC stage/pipeline contracts and `team_templates.yaml` use `no_self_approval_policy` /
  `evidence_required_policy`; `team_lead_roles.yaml` and `sub_agent_roles.yaml` use the canonical
  bare ids. Both resolve via the registry alias table, but Phase E should standardize one
  spelling (sub_agent_roles open_questions + agent_roles header note).

- **F-5 — Core Ability name-casing vs registry id.**
  Role files reference Core Abilities by capitalized `name` (Supervisor, Memory, …) while
  `core_abilities.yaml` ids are lowercase. Harmless with case-folding; confirm the canonical
  reference form in Phase E (OQ-TL-5).

- **F-6 — no team-scope governance profile for 4 of 6 teams.**
  `governance_profiles.yaml` defines team-scope profiles only for `sdlc_team_governance` and
  `research_team_governance`. activation/operations/skill_governance/knowledge leads bind the
  pipeline-level umbrella + cross-cutting policies instead. Not a missing reference (everything
  resolves); a Phase E completeness decision (OQ-TL-2).

---

## 11. Verdict

**PASS_WITH_FINDINGS.**

All eight mandated checks pass: full SDLC stage→owner coverage (24 agents + sdlc_team_lead
fallback), full sub-agent coverage (8/8), no orphan sub-agents, no Core Ability as an Agent,
Supervisor not a Team Lead, review-gate owners distinct from authors (0 self-approval cases),
all shared-registry references resolve (0 unresolved), and no plugin field. The six findings are
non-blocking naming/aliasing reconciliations already captured in the catalogs' `open_questions`
for Phase E.
