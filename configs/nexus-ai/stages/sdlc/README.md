# SDLC Pipeline — Stage Contracts

Machine-readable stage contracts for the **SDLC Pipeline**, the single end-to-end
software-delivery pipeline under the **Nexus AI Orchestration Model**. Each YAML file
in this directory is one stage contract; this README is the canonical index and
routing summary.

- Pipeline definition: [`../../sdlc_pipeline.yaml`](../../sdlc_pipeline.yaml)
- Runtime rules (routing / gate / iteration enforcement): [`../../sdlc_pipeline_runtime_rules.yaml`](../../sdlc_pipeline_runtime_rules.yaml)

**Ownership (applies to every stage):** `owner_team: sdlc_team`, `team_lead: sdlc_team_lead`.
`owner_agent` is always a pipeline **Agent role** (snake_case). The Core Abilities
(Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS) are capabilities a stage
*uses* — they are never an `owner_agent` and never a team member. `Supervisor != sdlc_team_lead`.

**Conventions used below:**
- Files numbered `NN-...yaml` carry the leading order index; `stage_id` is the snake_case canonical id used by routing.
- `(conditional)` marks a stage with an `applicability_decision` / `required_when` block that may skip the stage.
- All 31 canonical stages declared in `../../sdlc_pipeline.yaml` now have their contract file authored in this directory (`01`–`31`).

---

## Stages (canonical order)

| # | File | `stage_id` | Purpose (one line) |
|---|------|-----------|--------------------|
| 01 | `01-intake.yaml` | `intake` | Capture and bound the product goal — problem, objective, in/out-of-scope, success metrics — as the product brief (does not set risk class or write requirements). |
| 02 | `02-domain-risk-profile.yaml` | `domain_risk_profile` | Establish domain, data-sensitivity, security, regulatory, availability, performance and autonomy risk profile; pick the risk class and initialize the conditional gate flags. |
| 03 | `03-skill-semantic-extraction.yaml` | `skill_semantic_extraction` | Read each selected skill package and extract its meaning (purpose, triggers, side effects, misuse, handoffs); lock `prism` = divergence and `verification-loop` = bug finding. |
| 04 | `04-requirements.yaml` | `requirements` | Produce functional requirements, the NFR catalog, acceptance criteria, and the requirements-to-source traceability baseline; every requirement testable and traceable to intent. |
| 05 | `05-requirements-review.yaml` | `requirements_review` | Independent review-gate over requirements/NFR/acceptance for intent fidelity, scope, coverage and traceability — approved under no-self-approval by `sdlc_team_lead`. |
| 06 | `06-architecture.yaml` | `architecture` | Produce system architecture — boundaries, components, options/trade-offs, chosen approach, API/data/deployment strategy and ADRs — demonstrably addressing the NFR catalog. |
| 07 | `07-architecture-review.yaml` | `architecture_review` | Independent review-gate stress-testing architecture, ADRs and boundaries for trade-offs, security, performance, maintainability, NFR fit and domain suitability. |
| 08 | `08-security-privacy-design.yaml` | `security_privacy_design` | Produce threat model, security requirements, data inventory, privacy risk register and auth/authz + data-lifecycle strategy before implementation. |
| 09 | `09-premortem-fmea.yaml` | `premortem_fmea` | Structured premortem + FMEA over failure modes, abuse cases and edge cases; produce a risk register with an accept decision or an owned mitigation per critical risk. |
| 10 | `10-planning.yaml` | `planning` | Produce the implementation plan, requirement-traceable task breakdown, executor handoff packets and runbook/rollback drafts that bound implementation scope. |
| 11 | `11-implementation.yaml` | `implementation` | Produce code and engineering artifacts for the planned scope with baseline local verification (build/lint/smoke), strictly in scope. No merge, no deploy. |
| 12 | `12-code-review.yaml` | `code_review` | Independent review-gate over the changeset for correctness, ADR fidelity, requirement fidelity, security hygiene, maintainability and needed test presence (not a defect sweep). |
| 13 | `13-test-generation.yaml` | `test_generation` | Produce the test plan and generated/planned test set covering critical paths, changed behavior and regression surface — traceable and gap-free (does not run tests or hunt defects). |
| 14 | `14-test-execution.yaml` | `test_execution` | Execute the planned test suite against the changeset, parse coverage, handle flaky tests, and emit auditable pass/fail + coverage evidence (proves the plan passes; not defect hunting). |
| 15 | `15-verification-loop-bug-finding.yaml` | `verification_loop_bug_finding` | Rigorous `verification-loop` defect sweep (multi-lens, invariant/mutation/regression red-teaming); triage by severity and block on open blocker/over-threshold major bugs. |
| 16 | `16-security-validation.yaml` | `security_validation` | Run and interpret the appsec scanner suite (SAST/SCA, secret, container, IaC), normalize findings, and gate on zero unaccepted critical/high findings and no leaked secrets. |
| 17 | `17-supply-chain-sbom-license.yaml` | `supply_chain_sbom_license` | Generate the SBOM, scan declared + transitive dependencies for vulns and provenance risk, and verify every component license is permitted; gate on forbidden license / critical dep / missing SBOM. |
| 18 | `18-ai-agent-safety-evaluation.yaml` | `ai_agent_safety_evaluation` | Adversarially test agent behavior, tool use, context safety and evidence fidelity (prompt injection, tool misuse, context poisoning, over-permission, hallucinated evidence). |
| 19 | `19-privacy-data-lifecycle-validation.yaml` | `privacy_data_lifecycle_validation` | (conditional) Validate personal/sensitive/tenant data handling across its lifecycle — minimization, retention, deletion, anonymization, export, audit content, tenant isolation. |
| 20 | `20-api-contract-compatibility-validation.yaml` | `api_contract_compatibility_validation` | (conditional) Validate changed APIs/events/SDKs against declared contracts and backward/forward compatibility; block unapproved breaking changes (conformance gate, not a defect sweep). |
| 21 | `21-domain-regulatory-compliance-validation-if-applicable.yaml` | `domain_regulatory_compliance_validation_if_applicable` | (conditional) Validate domain/regulatory/contractual obligations via a compliance matrix with traceability to requirements and controls; block unclosed obligations. |
| 22 | `22-data-migration-validation-if-applicable.yaml` | `data_migration_validation_if_applicable` | (conditional) Validate migrations are safe, ordered, idempotent and reversible: forward+rollback replay and post-migration integrity; block unsafe/irreversible/integrity-failing migrations. |
| 23 | `23-accessibility-ux-validation-if-applicable.yaml` | `accessibility_ux_validation_if_applicable` | (conditional) Validate accessibility conformance (WCAG-style) and core UX quality (task flows, error/empty/loading states) for user-facing changes; decide the UI release gate. |
| 24 | `24-performance-resilience.yaml` | `performance_resilience` | Validate latency, throughput, resource budgets, capacity/scalability and resilience failure behavior via benchmarks and budget checks; budget breaches and unaccepted risks block. |
| 25 | `25-cost-resource-governance.yaml` | `cost_resource_governance` | (conditional) Govern projected runtime cost and resource footprint (token/model spend, GPU/CPU/RAM/storage, CI time, retry amplification) against budgets and quota policy. |
| 26 | `26-backup-restore-dr-validation-if-applicable.yaml` | `backup_restore_dr_validation_if_applicable` | (conditional) Validate backup/restore/DR/rollback posture — backup adequacy, executable restore test, DR runbook, RTO/RPO and rollback validity — for production/persistent data. |
| 27 | `27-operations-readiness.yaml` | `operations_readiness` | Produce and verify the operational readiness package (runbook, rollback, observability/alerting, incident response) and decide the always-required `operations_readiness_pass` gate. |
| 28 | `28-evidence-graph-build.yaml` | `evidence_graph_build` | Assemble the end-to-end evidence DAG and traceability matrix linking requirements through design, code, tests, bug-finding, security/supply-chain/safety and ops; audit for completeness and consistency. |
| 29 | `29-development-completion.yaml` | `development_completion` | Decide whether development is genuinely complete by aggregating the evidence graph, traceability matrix and all gate results; emit a single binary completion gate, the precondition for a release candidate. |
| 30 | `30-release-candidate.yaml` | `release_candidate` | After development_completion passes, assemble, verify and seal the release-candidate evidence package and render the final go/no-go decision (development_completion_pass re-attested by `sdlc_team_lead`); produces no new product artifacts. |
| 31 | `31-refraction-learning.yaml` | `refraction_learning` | Post-pipeline `refraction` learning pass: mine error/defect and rework patterns and decisions, and curate durable lessons fed back to memory/skills (advisory, non-blocking). |

> **Index status:** all 31 canonical stages have contract files in this directory (`01`–`31`),
> each conforming to the stage-contract standard with all 7 usage-mapping fields and the full
> stage-contract field set.

---

## Routing summary

Each stage contract declares `on_pass`, `on_fail`, `rework_route`, `max_iterations`, and (for
conditional stages) an `applicability_decision` with a `required_when` expression. Routing
targets are always either a known `stage_id` or one of the canonical terminals
**`done`**, **`relevant_failed_stage`**, **`block_and_report`**.

### Forward path (`on_pass`) — linear

The happy path is a single linear chain in canonical order:

```
intake → domain_risk_profile → skill_semantic_extraction → requirements →
requirements_review → architecture → architecture_review → security_privacy_design →
premortem_fmea → planning → implementation → code_review → test_generation →
test_execution → verification_loop_bug_finding → security_validation →
supply_chain_sbom_license → ai_agent_safety_evaluation →
privacy_data_lifecycle_validation → api_contract_compatibility_validation →
domain_regulatory_compliance_validation_if_applicable →
data_migration_validation_if_applicable → accessibility_ux_validation_if_applicable →
performance_resilience → cost_resource_governance →
backup_restore_dr_validation_if_applicable → operations_readiness →
evidence_graph_build → development_completion → release_candidate → refraction_learning
```

A **conditional** stage that is not applicable (its `required_when` evaluates false) is skipped
and control passes to the same `on_pass` successor, so the linear order is preserved whether or
not the conditional stage runs.

### Rework path (`on_fail` / `rework_route`)

On gate failure a stage routes **back to the upstream stage that owns the root cause**, never
forward. Observed routing in the authored contracts (`01`–`31`):

- **Self-rework** (author fixes its own output, re-enters itself): `intake`, `skill_semantic_extraction`, `planning`, `implementation`, `refraction_learning`.
- **Review-gates route back to the authoring stage they review** (no-self-approval): `requirements_review → requirements`, `architecture_review → architecture`. `requirements` itself sends scope defects back to `intake`; `architecture` sends requirement defects back to `requirements`.
- **Build / test / validation stages route defects back to `implementation`** for a code fix: `code_review`, `test_generation`, `test_execution`, `verification_loop_bug_finding`, `security_validation`, `supply_chain_sbom_license`, `ai_agent_safety_evaluation`.
- **Design-rooted validations route back to design**: `security_privacy_design`, `premortem_fmea`, `architecture_review` → `architecture`; `privacy_data_lifecycle_validation` and `domain_regulatory_compliance_validation_if_applicable` → `security_privacy_design`; `api_contract_compatibility_validation`, `data_migration_validation_if_applicable`, `performance_resilience` → `architecture`.
- **Plan-rooted validations route back to `planning`**: `cost_resource_governance`, `backup_restore_dr_validation_if_applicable`, `operations_readiness`.
- **Terminal `relevant_failed_stage`** is used where the responsible upstream stage is data-dependent at runtime: `accessibility_ux_validation_if_applicable` (`rework_route`), `evidence_graph_build`, and `development_completion` (route back to whichever upstream gate failed rather than passing forward).
- **Release / learning tail**: `release_candidate` → `development_completion` (a failed release-candidate gate re-enters completion); `refraction_learning` self-reworks and, on `on_pass`, routes to the `done` terminal.

### Terminals

- **`done`** — pipeline-level success terminal (reached after the final stage passes).
- **`relevant_failed_stage`** — dynamic re-entry to whichever upstream stage produced the blocking finding (used by aggregation/evidence stages and where the root-cause stage is determined at runtime).
- **`block_and_report`** — hard stop with an audit report; reserved for unrecoverable blocking-policy failures.

---

## Iteration policy

- Every authored stage sets **`max_iterations: 3`** (the pipeline default). A stage may re-enter via its `on_fail` / `rework_route` up to this limit.
- When a stage exhausts `max_iterations` without clearing its gate, it must stop iterating and escalate to a terminal (`block_and_report`) or to `relevant_failed_stage`, rather than looping indefinitely — enforced by [`../../sdlc_pipeline_runtime_rules.yaml`](../../sdlc_pipeline_runtime_rules.yaml).
- Iteration counts are tracked in the stage-gate trace (`stage_gate_trace_schema`) so loop budgets are auditable.

---

## Governance, gates and evidence

- All stages run under `sdlc_pipeline_governance`, `no_self_approval_policy` and `evidence_required_policy`; review/gate stages add stage-specific gate profiles.
- **No self-approval:** a review/gate stage's `owner_agent` always differs from the author of the artifact it reviews. Where no dedicated reviewer role exists, `sdlc_team_lead` owns the review-gate (e.g. `requirements_review`, `architecture_review`).
- **Always-required vs conditional gates** are listed in [`../../sdlc_pipeline.yaml`](../../sdlc_pipeline.yaml) (`required_gates.always` / `required_gates.conditional`). Conditional stages additionally declare `conditional_required_gates` keyed by their `required_when` expressions.
- **Gate-name `_if_applicable` suffix is non-authoritative.** Conditionality is carried authoritatively by each gate's `required_when` expression (in `conditional_required_gates`) together with `required_gate_producers` — **not** by the gate name. The `_if_applicable` suffix on some gate names is descriptive only; its presence or absence does not change whether a gate is required. The `required_when` expression is the single source of truth for when a conditional gate must pass, so gate names are intentionally left as-is even where the suffix is applied inconsistently.
- Evidence and trace are kept distinct: evidence schemas (e.g. `sdlc_pipeline_evidence_schema`, `release_evidence_schema`, `bug_finding_evidence_schema`) record *what was produced*; trace schemas (e.g. `stage_gate_trace_schema`) record *the decision/iteration path*.

---

## Open items

None outstanding for this directory: all 31 stage contracts (`01`–`31`) are authored, and the
cross-stage routing/gate/iteration enforcement rules now live in
[`../../sdlc_pipeline_runtime_rules.yaml`](../../sdlc_pipeline_runtime_rules.yaml).
