# Claude Code — Skill / Agent Review (Doc 13, Phase 4)

Scope: skill/agent review of the 31 machine-readable SDLC stage contracts in
`configs/nexus-ai/stages/sdlc/` (`01-intake.yaml` … `31-refraction-learning.yaml`).
This is a documentation/blueprint review only — no runtime code, no merge, no deploy.

Checks performed (per Doc 13 Phase 4):

- `prism` used ONLY as brainstorming / divergent thinking.
- `verification-loop` used ONLY as bug/defect finding (never a readiness checklist, never a
  `test_execution` replacement).
- `sentinel` / `llm-council` / `fmea` / `gap-audit` bindings are semantically sane.
- NO Core Ability (Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS) listed as an
  Agent / `owner_agent` / `sub_agent`.
- `Supervisor` never used as `sdlc_team_lead`.
- Review/gate stages owned by a non-author of the artifact they review.
- `owner_agent` / `sub_agent` hierarchy valid against the canonical Agent and Sub-agent registries.
- ALL referenced skills collected; any skill not in the canonical skills list flagged as
  `undeclared_skills`.

---

## Verdict

```text
PASS_WITH_FINDINGS
```

No hard boundary violations. Two finding classes:
1. Six **undeclared skills** are referenced (all from the legacy doc-05 allowed-with-flag set —
   none invented). Each is already self-flagged in-file for registry formalization; this review
   confirms and consolidates the list.
2. One **stale justification comment** in `27-operations-readiness.yaml` misattributes the author
   of two input artifacts (documentation defect, not a structural binding violation).

---

## 1. Skill semantics — `prism` (LOCKED: brainstorming / divergence only)

`prism` appears in 5 stages. Every binding is divergent/brainstorming. None uses it as
bug-finding or as a readiness/coverage checklist.

| Stage | File | prism usage | Verdict |
|------|------|-------------|---------|
| 01 intake | `01-intake.yaml` | divergent exploration of goal/problem framing & scope boundaries | OK |
| 04 requirements | `04-requirements.yaml` | divergent requirement elicitation | OK |
| 06 architecture | `06-architecture.yaml` | divergent generation of candidate architecture options | OK |
| 09 premortem_fmea | `09-premortem-fmea.yaml` | divergent failure-mode / abuse-case / edge-case ideation (paired with sentinel + fmea) | OK |
| 10 planning | `10-planning.yaml` | diverge over sequencing / handoff-partitioning options | OK |

Note: stage 09's `prism` bullet carries no inline comment, but the stage purpose
("premortem + FMEA over failure modes, abuse cases and edge cases") and its skill set
(sentinel + prism + fmea) make the divergent-ideation intent unambiguous. Not a misuse.

`prism` is correctly **absent** from every review / validation / execution / readiness stage
(e.g. 05 requirements_review, 12 code_review, 14 test_execution, 16 security_validation,
24 performance_resilience, 27 operations_readiness, 29 development_completion, 30 release_candidate),
several of which explicitly document the exclusion. CLEAN.

## 2. Skill semantics — `verification-loop` (LOCKED: bug/defect finding only)

`verification-loop` appears in exactly 3 stages, each as bug/defect finding, each explicitly
noting it is NOT a readiness checklist and NOT a `test_execution` replacement.

| Stage | File | verification-loop usage | Verdict |
|------|------|-------------------------|---------|
| 15 verification_loop_bug_finding | `15-verification-loop-bug-finding.yaml` | the dedicated defect sweep over the changeset + test results | OK |
| 18 ai_agent_safety_evaluation | `18-ai-agent-safety-evaluation.yaml` | adversarial prompt-injection / tool-misuse / poisoning **defect** sweep | OK |
| 22 data_migration_validation_if_applicable | `22-data-migration-validation-if-applicable.yaml` | defect FINDING over the migration (lossy/irreversible/ordering/idempotency defects) | OK |

Critically, `verification-loop` is **deliberately excluded** from exactly the anti-pattern
stages — 12 code_review, 13 test_generation, 14 test_execution, 16 security_validation,
20 api_contract_compatibility_validation, 21 compliance, 23 accessibility_ux,
24 performance_resilience, 26 backup/DR, 27 operations_readiness, 28 evidence_graph_build,
29 development_completion, 30 release_candidate — and most of those carry an explicit comment
explaining the exclusion (e.g. 14 cites the §7 anti-pattern; 29 explicitly refuses to reuse it
as a general readiness checklist). This is exemplary boundary hygiene. CLEAN.

## 3. `sentinel` / `llm-council` / `fmea` / `gap-audit` (+ `calibrate`) bindings

- **sentinel** (9 stages: 06, 07, 08, 09, 18, 19, 23, 26, 27) — premortem / risk + hidden-assumption
  surfacing, all in design, risk, or pre-commitment readiness/validation gates. Sane.
- **llm-council** (4 stages: 06, 07, 18, 21) — multi-model deliberation/adjudication for
  architecture option scoring, architecture review, agentic-safety severity, and ambiguous
  regulatory interpretation. All genuinely hard/contested judgement contexts. Sane.
- **fmea** (6 stages: 08, 09, 19, 22, 24, 26) — structured failure-mode analysis, all on
  failure-mode-relevant surfaces (security, risk register, data-leak/tenant, migration,
  performance/resilience, data-loss/DR). Sane.
- **gap-audit** (29 stages) — coverage-gap detection, used broadly and appropriately as a
  coverage helper; not standing in for `verification-loop` anywhere.
- **calibrate** (14 stages) — severity / confidence calibration; appropriate companion usage.

No `sentinel`/`llm-council`/`fmea`/`gap-audit` binding is semantically off. CLEAN.

## 4. Core Abilities never used as Agent / owner / team member

- No `owner_agent` is a Core Ability (all 31 owners are pipeline Agent roles, or `sdlc_team_lead`
  for two review gates). CLEAN.
- No `sub_agent` is a Core Ability or an Agent role. CLEAN.
- No Core Ability token leaks into `uses_skills`. CLEAN.
- Every `Supervisor` occurrence is either a `- Supervisor` bullet under `uses_core_abilities`
  (stages 07, 10, 18, 24, 25, 29, 30) or a prose comment reaffirming the locked rule. CLEAN.

## 5. `Supervisor != sdlc_team_lead`

All 31 stages declare `owner_team: sdlc_team` and `team_lead: sdlc_team_lead`. `Supervisor` is
never the team lead. Stages that explicitly route/aggregate (10, 25, 29, 30) use Supervisor only
as the routing Core Ability, with comments stating "Supervisor is a Core Ability, NOT
sdlc_team_lead". CLEAN.

## 6. No self-approval — review/gate stages owned by non-authors

Genuine cross-author review/validation gates all have reviewer ≠ author:

| Review/gate stage | Owner | Reviews artifact authored by | Verdict |
|-------------------|-------|------------------------------|---------|
| 05 requirements_review | `sdlc_team_lead` | REQUIREMENTS_SPEC ← `product_requirements_agent` (04) | OK (fallback owner per locked rule; no dedicated reviewer role) |
| 07 architecture_review | `sdlc_team_lead` | ARCHITECTURE_DOC ← `architecture_agent` (06) | OK (fallback owner) |
| 12 code_review | `code_reviewer_agent` | CODE_CHANGESET_SUMMARY ← `engineering_agent` (11) | OK (dedicated reviewer) |
| 15 verification_loop_bug_finding | `qa_agent` | CODE_CHANGESET_SUMMARY ← `engineering_agent` (11) | OK |
| 19 privacy_data_lifecycle_validation | `privacy_agent` | DATA_INVENTORY / PRIVACY_RISK_REGISTER ← `security_privacy_agent` (08) | OK |
| 20 api_contract_compatibility_validation | `contract_validation_agent` | API_CONTRACTS_IF_APPLICABLE ← `engineering_agent` (11) | OK |
| 22 data_migration_validation | `data_migration_agent` | DATA_MODEL_CHANGE_REPORT / MIGRATION_FILES ← `engineering_agent` (11) | OK |
| 21 compliance_validation | `compliance_agent` | REQUIREMENTS_SPEC / SECURITY_REQUIREMENTS / DOMAIN_PROFILE_DECISION ← various, none `compliance_agent` | OK |
| 28 evidence_graph_build | `evidence_graph_agent` | upstream evidence; author kept distinct from downstream decider `release_manager_agent` | OK |
| 29 development_completion | `release_manager_agent` | aggregates other roles' gate results; does not author any judged artifact | OK |
| 30 release_candidate | `release_manager_agent` | `development_completion_pass` re-attestation routed to `sdlc_team_lead` (`attested_by`) to avoid self-approval of its own stage-29 decision | OK |

Author/executor stages that carry `no_self_approval_policy` only as a standing guard (they author
their own artifacts and adjudicate no foreign author's artifact) are compliant: 03, 04, 08, 09, 14,
16, 17, 24, 25, 31. The `qa_agent` triple (13 authors tests, 14 runs its own suite, 15 hunts defects
in `engineering_agent`'s changeset) is self-consistent: running one's own test suite is not a
foreign-artifact approval, and the defect gate (15) is over a different author's changeset. Already
flagged in-file (14 header) for governance confirmation.

### Finding SA-1 (minor, documentation) — stale author attribution in stage 27

`27-operations-readiness.yaml` (header lines ~29–32) justifies its no-self-approval posture by
asserting its inputs `DR_READINESS_REPORT` and `ROLLBACK_VALIDATION_REPORT` are
"authored upstream by performance_resilience_agent (#26)". That attribution is **incorrect**:
stage **#26 (backup_restore_dr_validation_if_applicable) is owned by `operations_readiness_agent`**
(performance_resilience_agent owns #24), so those two reports are authored by the SAME role that
owns stage 27. This is a same-owner adjacency (26 → 27, both `operations_readiness_agent`):

- It is not a hard self-approval gate violation — stage 27 is a readiness *authoring* stage
  (it produces RUNBOOK / ROLLBACK_PLAN / OBSERVABILITY_PLAN / INCIDENT_RESPONSE_PLAN and decides
  `operations_readiness_pass`) and consumes 26's reports as read-only inputs rather than
  adjudicating them as the artifact-under-review.
- Stage 26's own header already flags this exact adjacency: "The same-owner adjacency of #26 and
  #27 is flagged in open_questions for review-role confirmation." So the structural concern is
  acknowledged; only the stage-27 justification comment is wrong.

Recommended fix: correct the stage-27 comment to attribute `DR_READINESS_REPORT` /
`ROLLBACK_VALIDATION_REPORT` to `operations_readiness_agent` (stage 26), and either (a) confirm in
open_questions that the 26/27 same-owner chain is acceptable because 27 does not adjudicate 26's
output, or (b) split one of the two stages onto a distinct reviewer role. No registry change
required; this is a documentation/governance-note correction.

## 7. Owner / sub-agent hierarchy validity

All `owner_agent` values are in the canonical Agent-roles registry (or `sdlc_team_lead` as the
locked review-gate fallback for 05 and 07). All `sub_agent` values are in the canonical
Sub-agent registry, and each sub-agent sits under a plausible parent:

| Stage | Sub-agent(s) | Owner (parent) |
|------|--------------|----------------|
| 03 | `skill_semantic_extractor_subagent` | `skill_librarian_agent` |
| 06 | `api_design_subagent`, `data_model_subagent` | `architecture_agent` |
| 08 | `threat_modeling_subagent` | `security_privacy_agent` |
| 13 | `test_generation_subagent` | `qa_agent` |
| 15 | `bug_hunter_subagent` | `qa_agent` |
| 16 | `security_scan_interpreter_subagent` | `security_validation_agent` |
| 28 | `evidence_trace_subagent` | `evidence_graph_agent` |

One catalog note (already self-flagged in `28-evidence-graph-build.yaml`): the team model §6.8
lists `evidence_trace_subagent.parent_agent = release_manager_agent`, but stage 28's owner was
reconciled to `evidence_graph_agent`; the effective parent here is therefore `evidence_graph_agent`.
Both are `sdlc_team` roles; flagged in-file for `parent_agent` re-binding. Not a violation of this
review's hierarchy check. CLEAN.

## 8. Undeclared skills (not in the canonical skills list)

Canonical skills: `prism, verification-loop, sentinel, llm-council, fmea, adr-builder, gap-audit,
prompt-fidelity, calibrate, refraction, fermi-decompose, bayesian-update`.

The following referenced skills are NOT in that list. All six are members of the legacy-doc-05
allowed-with-flag set the task permits ("you MAY reference … but MUST add it to open_questions") —
**none is invented** — and each is already flagged in its stage file for registry formalization:

| Undeclared skill | Stage(s) | In-file flag present? | Load-bearing role |
|------------------|----------|-----------------------|-------------------|
| `skill-architect` | 03 | yes | skill semantic/architecture extraction |
| `handoff-designer` | 10 | yes | design executor HANDOFF_PACKETS |
| `context-pack-builder` | 10, 11 | yes | build executor/implementation context pack |
| `scanner-result-normalizer` | 16 | yes | normalize/dedupe raw SAST/SCA scanner output |
| `evidence-graph-builder` | 28 | yes | build the requirement→…→release evidence DAG |
| `release-readiness-judge` | 29, 30 | yes | final go/no-go readiness adjudication |

Action: formalize these six into the shared skills registry (or replace each with a canonical
equivalent) and resolve the corresponding open_questions entries.

---

## Returned object

```yaml
verdict: PASS_WITH_FINDINGS
file_path: docs/ai-sdlc-factory/reviews/claude-code-skill-agent-review.md
undeclared_skills:
  - skill-architect
  - handoff-designer
  - context-pack-builder
  - scanner-result-normalizer
  - evidence-graph-builder
  - release-readiness-judge
boundary_violations: []   # no hard violations; see SA-1 (minor documentation defect) below
notes: >-
  prism (5 uses) all divergent/brainstorming; verification-loop (3 uses) all bug/defect finding and
  correctly excluded from test/review/readiness stages. sentinel/llm-council/fmea/gap-audit/calibrate
  bindings all sane. No Core Ability appears as owner_agent/sub_agent/team_lead or leaks into
  uses_skills; Supervisor never used as sdlc_team_lead (all 31 team_lead = sdlc_team_lead). All
  owner_agents and sub_agents are canonical (05 & 07 use sdlc_team_lead as the locked review-gate
  fallback). Genuine cross-author review gates (05,07,12,15,19,20,21,22,28,29,30) all have reviewer
  != author; 30 routes the development_completion re-attestation to sdlc_team_lead to avoid
  self-approval. SA-1 (minor, documentation): 27-operations-readiness.yaml header wrongly attributes
  DR_READINESS_REPORT / ROLLBACK_VALIDATION_REPORT to performance_resilience_agent; they are authored
  by operations_readiness_agent at stage 26 (same owner as stage 27). This is a same-owner adjacency
  already flagged in stage 26's header for open_questions, and 27 consumes them read-only rather than
  adjudicating them, so it is not a hard self-approval violation — only the justification comment is
  stale and should be corrected. The 6 undeclared skills are all legacy-doc-05 allowed-with-flag
  names (none invented) and are each already flagged in-file for shared-registry formalization.
```
