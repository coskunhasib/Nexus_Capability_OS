# 24 — Mission System and User-Facing Runtime Model

This document closes the next set of blueprint gaps identified from the multi-agent Mission architecture review.

Scope: **documentation and machine-readable planning only**. This document does **not** authorize runtime implementation, product refactor, connector integration, deploy/publish, `nexus` → `main` merge, plugin reintroduction, or production readiness claims.

## 1. Why Mission System is needed

The existing model has Pipeline System, Team System, Coordination System, Governance System and Audit System. That is correct internally, but it is not the right user-facing top-level work object.

A user does not ask Nexus to run a `Pipeline Run`. A user gives a goal.

```text
Mission = the managed work container created from a user goal.
```

A Mission is not a single long-running agent session. It is an ecosystem of agents coordinating through structured handoffs, shared state, validation contracts, evidence, trace and governance.

## 2. New top-level concept family

Add Mission System as a first-class concept family:

```text
Nexus AI Orchestration Model
├── Mission System
├── Shared Registry System
├── Pipeline System
├── Team System
├── Core Abilities Layer
├── Skills and Tools Layer
├── Coordination System
├── Governance System
└── Audit System
```

Simple meaning:

```text
Mission System = what user goal are we carrying over time?
Pipeline System = which process template/run executes the work?
Team System = who works on it?
Coordination System = how do the roles work together?
Governance System = what is allowed?
Audit System = what was proven and what happened?
```

## 3. Mission lifecycle

A Mission has four user-facing phases:

```text
1. Describe the goal
2. Scope it through conversation
3. Approve the plan
4. Mission handles execution
```

Internal lifecycle:

```text
mission_intake
mission_scoping
mission_plan
validation_contract_authoring
owner_plan_approval
mission_execution
mission_validation_loop
mission_control_monitoring
mission_completion_decision
mission_learning
```

## 4. Mission structure

A Mission contains:

```text
mission_id
mission_goal
user_visible_title
mission_scope
assumptions
constraints
owner_decisions
mission_plan
milestones
features
selected_pipelines
pipeline_runs
assigned_teams
mission_orchestrator
workers
validators
validation_contract
mission_shared_state
structured_handoffs
mission_control_view
mission_analytics
evidence_index
trace_timeline
risk_register
open_issues
completion_decision
learning_record
```

## 5. Mission vs Pipeline Run

```text
Mission = user-facing managed work container.
Pipeline Run = one executed process inside a Mission.
```

A Mission may contain one or more Pipeline Runs:

```text
Mission: Build an AI-assisted decision-tracking SaaS
├── Research Pipeline Run
├── SDLC Pipeline Run
├── Activation Pipeline Run
├── Operations Pipeline Run
└── Knowledge / Memory Pipeline Run
```

A Mission can also use a single Pipeline Run when the goal is narrow.

## 6. Three-role architecture

Every Mission should expose a simple three-role architecture:

```text
Mission Orchestrator
├── Workers
└── Validators
```

### Mission Orchestrator

Simple meaning: the process manager for the Mission.

Responsibilities:

```text
scope the goal
create the plan
write/maintain the validation contract
spawn workers and validators
review handoffs
accept, reject, or rescope work
update shared state
request owner decisions
protect serial-first scheduling
summarize mission progress
```

Boundary: Mission Orchestrator is **not** the Supervisor Core Ability. Supervisor remains a Core Ability.

### Workers

Simple meaning: producing experts.

Responsibilities:

```text
implement features
write documents
prepare artifacts
perform scoped research
produce handoff reports
never self-approve decision-critical work
```

### Validators

Simple meaning: independent checking experts.

Responsibilities:

```text
validate against the validation contract
run tests / typechecks / linting where applicable
perform adversarial review
simulate user flows
check security, performance and compliance where applicable
produce validation findings
return findings to the orchestrator
```

Validator rule:

```text
Validators should start with fresh context where practical.
Validators must not inherit the implementer's blind spots.
Validation is adversarial by design.
```

## 7. Validation Contract

A Mission must define a validation contract before implementation work is treated as ready.

Simple meaning:

```text
Validation Contract = how we will know the work is actually done.
```

User-facing name:

```text
Başarı Kriterleri
```

The validation contract should contain:

```text
expected_behaviors
acceptance_criteria
must_fail_conditions
test_scenarios
user_flows
security_expectations
performance_expectations
compatibility_expectations
accessibility_expectations_if_applicable
regression_controls
non_goals
owner_approval_requirements
```

Rule:

```text
Validation contract must be authored before implementation and used by validators after each milestone/feature.
```

## 8. Structured Handoffs

Every worker must report before handing work back to the orchestrator or another role.

User-facing name:

```text
Teslim Raporu
```

Required handoff fields:

```text
handoff_id
mission_id
source_role
target_role
work_unit_id
what_was_implemented
what_was_left_undone
commands_run_with_exit_codes
issues_discovered
procedures_followed
evidence_produced
trace_references
files_or_artifacts_changed
known_risks
recommended_next_step
```

Rule:

```text
No silent handoff. Every worker reports what was done, what remains, what was run, what failed, what was found, and whether procedure was followed.
```

## 9. Mission Shared State

Mission Shared State is not the Shared Registry.

```text
Shared Registry = what capabilities exist in the system.
Mission Shared State = what is happening in this Mission.
```

Mission Shared State may include:

```text
mission.json
mission-plan.md
features.json
milestones.json
handoffs.jsonl
validation-contract.md
progress-log.jsonl
issues.jsonl
decisions.md
evidence-index.json
trace-index.json
agent-skills.json
model-role-map.json
```

Rule:

```text
Agents must reference shared state instead of inventing private mission state.
```

## 10. Serial-first execution policy

Default rule:

```text
Conflict-prone writing work should run serially.
Read-only research and validation can run in controlled parallel.
```

Why:

```text
Parallel write work can cause conflicting changes, duplicate work, inconsistent architecture, higher coordination cost and higher token/cost burn.
```

Allowed parallel work:

```text
read-only codebase exploration
API / library research
documentation reading
independent validation reviews
security review
performance review
accessibility review
```

Restricted parallel work:

```text
same file writes
same architecture area writes
database schema changes
public API changes
migration changes
release candidate changes
```

Rule:

```text
Correctness compounds more reliably through serial execution. Parallelism is reserved for work that cannot conflict or is intentionally independent.
```

## 11. Mission Control

Mission Control is the user-facing monitoring surface for multi-hour or multi-day autonomous work.

User-facing name:

```text
Çalışma Merkezi
```

Mission Control should show:

```text
mission title
mission status
current phase
current milestone
active feature
active worker
active validator
completed features
blocked features
validation status
handoff reports
progress log
owner decisions needed
open risks
open issues
runtime/cost estimate
mission analytics
```

Technical/advanced view may show:

```text
agent runs
worker count
validator count
token usage by role
cache read
output tokens
source/test split
coverage
milestone waterfall
serial/parallel utilization
```

Default view must use user-facing names, not internal ids.

## 12. Role-based model policy

No single model is best at planning, implementation and validation.

Use role-based model selection:

```text
Planning Model
Implementation Model
Validation Model
Research Model
Fast Classification Model
Vision / Audio / Creative Models where needed
```

Guidelines:

```text
Planning = slow, careful reasoning, strategic constraints.
Implementation = code fluency, tool use, fast generation.
Validation = strict instruction following, adversarial review, ideally independent provider/model family where practical.
Research = source handling, uncertainty, citation discipline.
Classification = low-cost fast routing.
```

Rule:

```text
The validator model should be independent from the implementation model where practical.
```

## 13. Mission Analytics

Mission Analytics should summarize work over time.

User-facing metrics:

```text
total elapsed time
completed phases
completed milestones
completed features
issues found
defects fixed
validation passes
handoff count
open risks
readiness percentage
estimated cost
owner decisions pending
```

Advanced metrics:

```text
agent_runs
subagent_runs
worker_runs
validator_runs
token_usage_by_role
cache_read_tokens
output_tokens
source_lines
test_lines
coverage_percent
serial_vs_parallel_utilization
milestone_waterfall
worker_validator_ratio
```

## 14. Mission completion

A Mission may finish in one of these states:

```text
completed
completed_with_accepted_risk
blocked
needs_owner_decision
needs_rework
cancelled
superseded
```

Completion must be backed by:

```text
validation_contract_status
required_gate_rollup
handoff_summary
evidence_index
trace_timeline
open_risks
owner_decisions
learning_record
```

## 15. User-facing naming rule

Do not show technical names in normal UI.

Use this mapping:

```text
Mission -> Çalışma
Mission Control -> Çalışma Merkezi
Mission Orchestrator -> Süreç Yöneticisi
Worker -> Üreten Uzman
Validator -> Kontrol Uzmanı
Validation Contract -> Başarı Kriterleri
Structured Handoff -> Teslim Raporu
Shared State -> Ortak Çalışma Durumu
Serial Execution -> Sıralı Çalışma
Parallel Execution -> Paralel Yardımcı Çalışma
Mission Analytics -> Çalışma Özeti
Continuous Learning -> Öğrenme ve İyileştirme
Pipeline -> Yolculuk / İş Akışı
Pipeline Run -> Aktif Çalışma
Stage -> Aşama
Agent -> Uzman
Sub-agent -> Yardımcı Uzman
Gate -> Kontrol Noktası
Evidence -> Kanıt
Trace -> İşlem Geçmişi
Rework -> Düzeltme Döngüsü
Runtime -> Çalışma Altyapısı
```

## 16. Workpackage impact

Existing implementation handoff remains valid, but runtime execution must account for Mission System gaps:

```text
WP-01 Shared Registry Loader
  must not confuse Shared Registry with Mission Shared State.

WP-03 Governance Engine
  must enforce Mission approval, validation contract, serial-first scheduling, owner-decision gates.

WP-04 Audit / Evidence Store
  must store validation contract evidence, handoff reports, mission progress evidence and trace.

WP-05 Tool Permission System
  must enforce worker/validator tool boundaries and secret-safe handoffs.

WP-06 Model / Provider Resolver
  must support role-based model selection.

WP-07 Context / Memory Resolver
  must support Mission Shared State and fresh validator context.

WP-08 Pipeline Run State Model
  must distinguish Mission state from Pipeline Run state.

WP-09 Pipeline Runner
  must run inside a Mission and obey Mission scheduling / handoff / validation contract rules.

WP-10 Executor Integration
  must check owner decisions, executor overrides and Mission completion reports.
```

## 17. Stop rule

This document closes blueprint gaps. It does not start implementation.

Still prohibited without separate owner approval:

```text
runtime implementation
product refactor
connector integration
Nexus publish
deploy
main branch merge
plugin registry
production readiness claim
```
