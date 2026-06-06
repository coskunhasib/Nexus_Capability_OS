# QA-04 — Org & Catalog Bidirectional Consistency (Final Adversarial QA)

Scope: bidirectional org consistency for the Nexus AI Orchestration Model, pre-commit.
Read-only investigation. No corpus files modified; no git run.

Authoritative sources cross-checked:
- `configs/nexus-ai/stages/sdlc/*.yaml` (31 SDLC stage contracts — `owner_agent` + `sub_agents`)
- `configs/nexus-ai/agent_roles.yaml`, `sub_agent_roles.yaml`, `team_lead_roles.yaml`, `team_templates.yaml`
- `configs/nexus-ai/pipeline_catalog.yaml` (R9 summary-only collapse)
- `docs/ai-sdlc-factory/pipeline-catalog/*.md` (5 non-SDLC pipeline definition docs) + `README.md`
- `docs/ai-sdlc-factory/04-team-agent-subagent-model.md` (recently edited)

Verdict: **No DEFECTs.** Bidirectional org wiring is fully consistent in the authoritative
machine-readable configs. 5 MINOR findings (stale comments / cosmetic counts / acknowledged
stale README value), each non-blocking. Detail below.

---

## A. What was verified CLEAN (the core mandate)

1. **SDLC owner_agent ↔ owned_stages, both directions — PASS.**
   - All 31 SDLC stage `owner_agent` values map to an `agent_roles.yaml` entry (the 2 review
     gates `requirements_review` #5 / `architecture_review` #7 correctly map to `sdlc_team_lead`,
     a Team Lead in `team_lead_roles.yaml`, by the locked no-self-approval fallback — not an Agent).
   - Forward+reverse: the `sdlc_owner_agent_coverage` summary map (agent_roles.yaml lines 96–119)
     and each agent's per-entry `owned_stages` block were diffed programmatically: **0 mismatches**
     across all 24 SDLC Agent roles; every agent_id has an owned_stages block. Every owned_stages
     entry also appears as that stage's `owner_agent` in the stage file (zero-diff vs the 31 contracts).

2. **Sub-agents → real parent_agent — PASS.**
   - 8 distinct sub-agents are referenced across the SDLC stage files
     (skill_semantic_extractor / api_design / data_model / threat_modeling / test_generation /
     bug_hunter / security_scan_interpreter / evidence_trace _subagent). All 8 have a
     `sub_agent_roles.yaml` entry, each with `team_lead_direct_call_allowed: false` and a
     `parent_agent` that is a real `agent_roles.yaml` SDLC agent.
   - Each sub-agent's `parent_agent` equals the `owner_agent` of the stage that references it
     (e.g. bug_hunter_subagent→qa_agent on stage #15; evidence_trace_subagent→evidence_graph_agent
     on stage #28). No orphans; no Core Ability as a parent.

3. **team_templates ↔ team_lead_roles ↔ agent_roles — three-way membership agreement — PASS.**
   - sdlc_team: 24 agents identical in all three (team_templates.agents == sdlc_team_lead.may_assign_agents
     == the 24 agent_roles entries with team_id: sdlc_team).
   - research_team (10), activation_team (5), operations_team (6), knowledge_team (6),
     skill_governance_team (skill_librarian_agent + skill_runtime_safety_agent): rosters match
     across all three files. skill_librarian_agent's cross-team binding is modeled once via R12
     `also_serves` (canonical single id) with an `alias_of` stub — consistent everywhere.

4. **pipeline_catalog.yaml (post-R9) ↔ 5 markdown docs — PASS.**
   - stage_count matches each definition_doc: research 10, activation 7, operations 6,
     skill_governance 7, knowledge_memory 6, SDLC 31. (Activation 7 = §2.1–§2.7 with
     activation_manager_agent owning 3 stages; skill_governance 7 = the 7-stage list in
     skill-governance-pipeline.md §1.)
   - required_team_type / required_team_lead_role match each markdown header.
   - **Catalog uses `knowledge_team` / `knowledge_team_lead`** (lines 162–163) — the mandated name;
     `knowledge_memory_team` = 0 occurrences in the catalog. PASS.
   - Every non-SDLC `owner_agent` in the markdown resolves to a known agent_id / alias / sub_agent_id.

5. **No Core Ability as an Agent / owner / lead / parent — PASS (locked decision upheld).**
   - Grep across agent_roles / sub_agent_roles / team_lead_roles / team_templates / 31 stage files
     for any of [Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS] in an
     agent_id/owner_agent/parent_agent/team_lead position: **NONE**. Core Abilities appear only under
     `uses_core_abilities` / `may_use_core_abilities`. Supervisor is never a team_lead.

6. **Other locked decisions — PASS.** No plugin field; Skill/Tool, Governance/Audit, Evidence/Trace
   kept distinct in the role uses_* groupings; Memory is USED by knowledge_team, never an owner.

---

## B. Findings (per-finding, classified)

### F-1 — [MINOR] doc 04 §6.8 half-reconciled: `evidence_graph_agent` is dangling within doc 04's own roster
- **File:** `docs/ai-sdlc-factory/04-team-agent-subagent-model.md` line 582 (recently edited).
- **What:** `evidence_trace_subagent.parent_agent` was changed from `release_manager_agent`
  (which IS defined in doc 04, line 420) to `evidence_graph_agent`. But `evidence_graph_agent`
  is defined NOWHERE else in doc 04 — doc 04 uses an earlier, superseded taxonomy
  (product_requirements_team, engineering_team/backend_dev_agent…, qa_lead_agent,
  security_architect_agent, release_manager_agent). Meanwhile sibling sub-agents in the same
  section still carry doc-04-local legacy parents: §6.2 bug_hunter→`qa_lead_agent`,
  §6.3 threat_modeling→`security_architect_agent`, §6.6 test_generation→`qa_lead_agent`,
  §6.7 security_scan_interpreter→`security_architect_agent`.
- **Why it's a finding:** the edit was applied to ONE of five entries, leaving doc 04 §6 internally
  inconsistent (one entry on canonical names, four on legacy names) and making §6.8's parent a
  dangling reference within doc 04's own agent list.
- **Why MINOR not DEFECT:** doc 04 is a legacy/superseded narrative blueprint (its whole roster was
  superseded by `agent_roles.yaml` during reconciliation — see stage #13/#15/#16 contract notes
  "qa_lead_agent → qa_agent superseded", "security_architect_agent … both superseded"). The
  AUTHORITATIVE configs are all correct and mutually consistent: stage 28 `owner_agent:
  evidence_graph_agent`, `sub_agent_roles.yaml` parent `evidence_graph_agent`, agent_roles has
  `evidence_graph_agent`. No machine-readable wiring is affected; no locked decision violated.
- **Suggested fix (optional, pre-commit):** either (a) revert §6.8 to `release_manager_agent` for
  doc-04-local consistency plus a "canonical owner is evidence_graph_agent (stage 28)" note, or
  (b) reconcile all of doc 04 §6 (ideally the whole doc) to canonical agent_roles names. (a) is the
  smaller change; (b) is the durable fix.

### F-2 — [MINOR] Stale comment in sub_agent_roles.yaml describing doc 04 §6.8 in present tense
- **File:** `configs/nexus-ai/sub_agent_roles.yaml` lines 544–545.
- **What:** comment reads "team-model §6.8 **lists** parent_agent = release_manager_agent" (present
  tense). After the F-1 edit, doc 04 §6.8 now lists `evidence_graph_agent`, so this statement is
  no longer true.
- **Why MINOR:** the actual data on the entry (`parent_agent: evidence_graph_agent`, line 549) is
  CORRECT; only the explanatory comment is stale. Pairs with F-1 — fixing F-1 to option (b) or
  updating this comment to past tense ("§6.8 historically listed … now corrected") resolves it.

### F-3 — [MINOR] Stale open-question OQ-TL-1 (and the line-543 header) claim pipeline_catalog still uses `knowledge_memory_team`
- **File:** `configs/nexus-ai/team_lead_roles.yaml` lines 543, 615–616.
- **What:** OQ-TL-1 asserts "pipeline_catalog.yaml names the 6th team `knowledge_memory_team` with
  lead `knowledge_memory_team_lead`." This was resolved by R10 — `pipeline_catalog.yaml` now uses
  `knowledge_team` / `knowledge_team_lead` (verified: 0 `knowledge_memory_team` occurrences in the
  catalog; reconciliation-sweep-report.md R10 confirms "knowledge_memory_team = 0").
- **Why a finding:** the open-question now describes a RESOLVED state as if still open — a stale
  assertion about another file's current content (a soft contradiction introduced by R10 fixing the
  catalog but not retiring the OQ).
- **Why MINOR:** it is an `open_questions` tracking note, not live wiring; the catalog itself is
  correct. Suggested fix: mark OQ-TL-1 resolved (R10) or delete it.

### F-4 — [MINOR] OQ-TL-3 partially stale (R12 already decided the shared-agent modeling it asks for)
- **File:** `configs/nexus-ai/team_lead_roles.yaml` lines 632–641.
- **What:** OQ-TL-3 says "agent_roles.yaml MUST decide the agent's primary team_id and whether
  cross-team assignment is modeled as one shared role or a per-team alias." R12 already decided this:
  `agent_roles.yaml` models skill_librarian_agent as ONE canonical role (team_id: sdlc_team) with an
  `also_serves` skill_governance binding and an `alias_of` stub. The decision the OQ requests is done.
- **Why MINOR:** stale tracking note; the underlying model is already consistent and correct.
  Suggested fix: mark resolved (R12) or reword to reference the chosen model.

### F-5 — [MINOR] Two cosmetic count mismatches (acknowledged / self-describing)
- **(a) Skill-governance stage_count: catalog 7 vs README §3 = 6.**
  `pipeline_catalog.yaml` line 150 sets stage_count 7 with an inline note that
  README's 6 is "the stale draft-scope value"; the markdown (skill-governance-pipeline.md §1)
  lists 7 stages, so the catalog is correct. But (i) `pipeline-catalog/README.md` line 79 still
  shows 6, and (ii) the catalog's own header (line 20) claims "stage_count mirrors … the README
  table in §3," which is no longer literally true for this one row. **MINOR** — already documented
  as a known stale README value; suggested fix: update README §3 skill-governance row 6→7 (and/or
  soften the catalog's "mirrors README" wording to "mirrors the definition_doc").
- **(b) team_templates.yaml header says "All 9 sub-agents", body says 8.**
  Header line 27 reads "All 9 sub-agents in scope are PARENTED"; the coverage summary (line 829) and
  `sub_agent_roles.yaml` correctly state 8 DISTINCT sub-agents. The "9" double-counts
  skill_semantic_extractor_subagent (it owns a stage in BOTH the SDLC pipeline #3 and the
  skill_governance pipeline #2, but is one sub-agent). **MINOR** cosmetic miscount; suggested fix:
  "9" → "8 distinct (skill_semantic_extractor_subagent serves 2 pipelines)".

---

## C. Adversarial probes that did NOT surface a defect (recorded so they aren't re-run)
- evidence_trace_subagent parent contradiction (team-model historically said release_manager_agent):
  the three authoritative sources (stage 28, sub_agent_roles, agent_roles) all agree on
  evidence_graph_agent; only the legacy-doc/comment layer lags (F-1/F-2).
- skill_semantic_extractor_subagent as a SUB-AGENT owning a stage in two pipelines: intentional and
  consistently modeled (parent skill_librarian_agent in both; documented in sub_agent_roles.yaml
  header and team_templates line 833).
- skill-governance 7-stage ownership fully covered (skill_librarian also_serves owns intake/binding/
  deprecation; skill_runtime_safety owns audit/misuse/activation; sub-agent owns semantic_extraction).
- No Core Ability anywhere as agent/owner/lead/parent in authoritative configs (grep clean).
- All non-SDLC markdown owner_agents resolve to a known role/sub-role id (script-checked).

---

## D. Status
5 MINOR findings, 0 DEFECTs. All findings are stale-comment / cosmetic-count / acknowledged-stale-
README issues in the documentation/comment layer; the authoritative machine-readable org wiring
(agent_roles, sub_agent_roles, team_lead_roles, team_templates, stage contracts, pipeline_catalog)
is bidirectionally consistent and upholds every locked decision. None block commit.

STATUS: MINOR_FINDINGS (5)
