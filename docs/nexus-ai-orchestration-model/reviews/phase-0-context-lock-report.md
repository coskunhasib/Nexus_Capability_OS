# Phase 0 — Context Lock Report

Scope: NEXUS AI SDLC Pipeline, Phase A pre-flight context lock.
Date: 2026-06-03.
Output type: documentation/blueprint only. No runtime code, no merge, no deploy.

## Purpose

Confirm, before any Phase A contract authoring begins, that the persisted
memory (`.memory/`) and the live blueprint README
(`docs/ai-sdlc-factory/README.md`) do not conflict with the locked decisions,
do not reintroduce the cancelled plugin concept, never treat a Core Ability as
an Agent, keep Supervisor separate from the SDLC Team Lead, and keep the Shared
Registry + Usage Mapping rule intact.

## Inputs reviewed

- `.memory/README.md`
- `.memory/0001-session-summary.md`
- `.memory/0002-locked-decisions.md`
- `.memory/0003-sdlc-research-baseline.md`
- `.memory/0004-next-actions.md`
- `docs/ai-sdlc-factory/README.md`

Corroborating reads (used to validate the README's claims against the actual
contract corpus, not just its self-description):
`05-pipeline-model.md`, `05-shared-registry-and-usage-mapping.md`,
`04-team-agent-subagent-model.md`,
`sdlc-stages/06-canonical-corrections-and-overrides.md`, plus repo-wide scans of
`docs/ai-sdlc-factory/` and `sdlc-stages/`.

## Verdict

PASS — no locked-decision conflict detected. Phase A authoring may proceed.

Two non-blocking observations are recorded below for the Phase A authoring step.

## Check results

### 1. No locked-decision conflict — PASS

The memory set (`0002-locked-decisions.md`, K-001 .. K-012) and the README
locked-decision block agree on every point: top structure is
"Nexus AI Orchestration Model"; SDLC is one pipeline, not the top; Core
Abilities are a separate capability layer; team hierarchy is
Team -> Team Lead -> Agents -> Sub-agents. No superseded/contradictory decision
was found across the memory shards or the README.

### 2. No plugin reintroduction — PASS

Every `plugin` occurrence across `.memory/` and `docs/ai-sdlc-factory/` is in a
cancellation, absence-guard, or anti-pattern context. Notable confirmations:

- `02-necessity-and-deduplication.md`: "Plugin | Çıkarıldı" (removed), with an
  explicit "why removed" section.
- `02-concept-boundaries.md`: "Plugin | Hayır | İptal edildi."
- `05-pipeline-model.md:676`: "Plugin stage eklemek" listed under
  **Pipeline anti-patterns / Yasaklar** (prohibited).
- `04-team-agent-subagent-model.md:603`: `plugin_manager_agent` listed as an
  **unnecessary / out-of-scope** role ("plugin kapsam dışıdır").
- `06-governance-policy-evidence.md`: `no_plugin_core` policy
  (`plugin_must_not_be_required_by_core_pipeline`).
- `07-executor-workpackages.md`: `no_plugin_reference` check and
  `reintroduce_plugin_core` listed as a forbidden action.

No field, stage, agent, schema, or governance profile reintroduces a plugin
concept.

### 3. No Core Ability treated as an Agent — PASS

Core Abilities = [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS].
A scan of every `owner_agent:` value across `docs/ai-sdlc-factory/` returns
zero matches against any Core Ability name. All 33 distinct `owner_agent`
values are pipeline agent ROLEs in snake_case. Core Abilities appear only under
`uses_core_abilities` (usage mapping) and in the Core Ability layer, never as an
agent or team member. Consistent with K-003, K-004, and README
"Agent != Core Ability".

### 4. Supervisor != SDLC Team Lead — PASS

No document declares `team_lead: supervisor`. Every explicit pairing of
"Supervisor" with "SDLC Team Lead" is the negative assertion
"Supervisor is not SDLC Team Lead"
(`15-master-roadmap-and-dependency-map.md:167`,
`workpackages/05-...:62`, `workpackages/05-...:153`), which reinforces the lock.
Consistent with K-006 and README "Team Lead != Supervisor".

### 5. Shared Registry + Usage Mapping rule intact — PASS

- `05-shared-registry-and-usage-mapping.md` enumerates all seven shared
  categories in both registry form and usage-mapping form: Core Abilities,
  Skills, Tools, Governance Profiles, Audit Schemas, Model/Provider Profiles,
  Context/Memory Profiles.
- All seven mandatory per-stage usage-mapping fields
  (`uses_core_abilities`, `uses_skills`, `uses_tools`,
  `uses_governance_profiles`, `uses_audit_schemas`,
  `uses_model_provider_profiles`, `uses_context_memory_profiles`) are present
  and used consistently across the stage contracts and the contract standard.
- Consistent with K-009 and README "Shared Registry + Usage Mapping" section.

### Supplementary semantic locks — PASS

- `prism = brainstorming / divergent thinking` (memory 0001) — intact.
- `verification-loop = bug / defect finding` (memory 0001); `05-pipeline-model.md`
  binds it as `verification_loop_bound_as_bug_finding` and lists
  "Verification-loop'u test_execution yerine kullanmak" as a prohibited
  anti-pattern. The bug-finding-not-readiness-checklist and
  not-a-replacement-for-test_execution semantics hold.
- README states all six core boundaries: Plugin yok, Agent != Core Ability,
  Team Lead != Supervisor, Skill != Tool, Governance != Audit, Evidence != Trace.

## Open questions / notes for Phase A authoring (non-blocking)

1. Agent-role naming drift between the legacy contract corpus and the Phase A
   canonical registry. The existing `sdlc-stages/*` and earlier docs use role
   names that differ from the Phase A canonical list, e.g.:
   - `requirements_agent` vs canonical `product_requirements_agent`
   - `architecture_reviewer_agent`, `requirements_reviewer_agent`,
     `qa_lead_agent`, `tech_lead_agent`, `security_agent`,
     `security_architect_agent`, `sre_ops_agent`, `product_manager_agent`,
     `team_lead_orchestrator` — none of which appear verbatim in the Phase A
     canonical Agent-roles list.
   This is expected: those docs predate the Phase A canonical registry. It is
   NOT a context-lock violation (no Core Ability is used as an agent; all are
   genuine pipeline roles). Phase A stage-contract authoring should map these to
   canonical role names and record any role not in the canonical list in
   `open_questions` for registry formalization.

2. Dedicated reviewer roles for no-self-approval. The legacy corpus introduces
   reviewer roles (e.g. `code_reviewer_agent`, `architecture_reviewer_agent`,
   `requirements_reviewer_agent`) that satisfy the no-self-approval rule by
   differing from the artifact author. Where the Phase A canonical registry
   lacks a dedicated reviewer role for a given gate, authoring must fall back to
   `sdlc_team_lead` as the review-gate owner and note it in `open_questions`, per
   the locked no-self-approval policy.

These two items are inputs to Phase A authoring, not blockers to it.
