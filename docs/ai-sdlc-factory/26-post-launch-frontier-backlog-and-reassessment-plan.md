# 26 — Post-Launch Frontier Backlog and Reassessment Plan

This document records frontier-level ideas that are important but **not launch blockers**. It prevents the project from falling into an infinite pre-launch design loop while preserving the research-backed directions that should be revisited after launch.

Scope: documentation/config planning only. No runtime implementation, product refactor, connector integration, deploy/publish, `nexus` → `main` merge, plugin reintroduction, or production readiness claim is authorized by this document.

## 1. Decision

```text
DECISION: DEFER_FRONTIER_ENHANCEMENTS_UNTIL_POST_LAUNCH_REASSESSMENT
```

Meaning:

```text
The ideas are valuable and must not be forgotten.
They are recorded as post-launch backlog items with rationale, benefits, risks, and evaluation criteria.
They must not block WP-01 or launch-oriented runtime work unless a separate owner decision upgrades one to a blocker.
```

## 2. Why defer?

The Nexus AI blueprint already covers Mission System, Pipeline System, Team System, Coordination System, Governance, Audit, Validation Contract, Structured Handoffs, Mission Control, Mission Analytics, and runtime workpackage boundaries.

The research items below are important, but if all are promoted to immediate implementation requirements, the project will stay trapped in continuous pre-launch expansion.

Launch should validate the core Mission execution loop first.

## 3. Reassessment triggers

Reassess this backlog when one of the following happens:

```text
post_launch_30_days
post_launch_100_missions
first_external_agent_integration_request
first_enterprise_security_review
first_tool_marketplace_or_mcp_gateway_need
first_major_agent_quality_regression
first_cross_workspace_or_multi_tenant_need
first_high_cost_or_latency_issue
first_user_facing_mission_control_feedback_cycle
```

## 4. Post-launch frontier backlog

### F-001 — Agent Interoperability Layer

Rationale:
External agent interoperability is becoming a real ecosystem requirement. Agent-to-agent protocols such as A2A introduce concepts like agent capability descriptions, tasks, artifacts, and cross-system communication. Nexus should eventually support this without confusing internal trusted agents with external agents.

Benefit:

```text
external agent integration
vendor/framework independence
future marketplace / enterprise interoperability
clean trust boundary for outside agents
```

Risk if ignored:

```text
ad-hoc external agent integration
weak trust boundary
vendor lock-in
unsafe artifact acceptance
```

Post-launch decision:

```text
defer_now
reassess_after_external_agent_integration_request
```

### F-002 — Tool Descriptor Security Layer

Rationale:
Tool security is not only about executing a tool safely. The tool description / manifest itself can become a prompt-injection and privilege-escalation surface. Nexus already has Tool Permission, Tool Sandbox and Secret Boundary in planning; descriptor-level security should be revisited before any broad tool ecosystem or MCP gateway.

Benefit:

```text
trusted tool registry
signed descriptors
manifest review
tool poisoning detection
lookalike/shadowing protection
rug-pull detection
```

Risk if ignored:

```text
malicious tool instructions
agent manipulation through tool descriptions
silent tool replacement
cross-tool data exfiltration
```

Post-launch decision:

```text
defer_now
reassess_before_any_external_tool_gateway_or_mcp_integration
```

### F-003 — Coordination Skill Registry / Swarm Skills

Rationale:
Coordination patterns such as delegation, creator-verifier, validation loops, handoffs and negotiation can become versioned reusable coordination skills instead of hardcoded behavior.

Benefit:

```text
portable coordination protocols
measurable coordination quality
skill-level evolution without runtime rewrite
reuse across Mission types
```

Risk if ignored:

```text
coordination logic scattered across prompts
hard-to-improve orchestration behavior
no metrics for coordination quality
```

Post-launch decision:

```text
defer_now
reassess_after_initial_mission_logs_exist
```

### F-004 — Mission Evaluation Suite and Dynamic Benchmarking

Rationale:
Good demos are not enough. Nexus needs mission-level benchmarks that reflect ambiguous user goals, validation quality, handoff quality, tool safety, cost, time, and rework behavior. Static benchmarks can become stale or contaminated.

Benefit:

```text
measurable mission quality
regression detection
validator quality measurement
dynamic refresh of mission tests
less reliance on demo impressions
```

Risk if ignored:

```text
quality drift
false sense of performance
regressions discovered by users instead of tests
```

Post-launch decision:

```text
defer_now
reassess_after_first_20_to_100_real_or_synthetic_missions
```

### F-005 — Continual Mission Learning Evaluation

Rationale:
Nexus has Memory and Refraction/Learning concepts, but learning must be measured. The system should prove that memory improves future missions and does not preserve stale or harmful assumptions.

Benefit:

```text
measure forgetting
measure forward transfer
detect stale memory harm
validate learning effectiveness
improve mission recurrence quality
```

Risk if ignored:

```text
memory bloat
old decisions poisoning new missions
learning claims without measurement
```

Post-launch decision:

```text
defer_now
reassess_after_multiple_related_missions_exist
```

### F-006 — Agent Workspace / Agent-Computer Interface

Rationale:
Software agents need purpose-built interfaces for repository navigation, scoped edits, test execution, failure summarization, validation contracts and handoff writing. Shell-only or raw file access is not enough for reliable long-running engineering work.

Benefit:

```text
better repo navigation
safer edits
more useful validation feedback
cleaner handoffs
lower tool misuse risk
```

Risk if ignored:

```text
poor tool ergonomics
higher error rate
agents waste context exploring repo manually
harder debugging
```

Post-launch decision:

```text
defer_now
reassess_during_wp05_wp09_wp10_runtime_design
```

### F-007 — Formal Policy Verification Layer

Rationale:
Some rules should not merely be tested; they should be impossible to violate in the state model. Examples: no release candidate before development completion, no self-approval, no tool call without permission, no runtime execution without owner decision.

Benefit:

```text
state-machine invariants
forbidden transition checks
property-based validation
higher trust for governance rules
```

Risk if ignored:

```text
policy bypass through edge-case states
runtime bugs allowing forbidden transitions
weaker enterprise/security confidence
```

Post-launch decision:

```text
defer_now
reassess_before_public_or_enterprise_grade_runtime
```

### F-008 — Agent Runtime Compatibility Matrix

Rationale:
Nexus should remain framework-agnostic. Internal concepts should map cleanly to OpenAI Agents SDK, LangGraph, CrewAI, A2A, MCP, local runtimes, and future orchestration frameworks.

Benefit:

```text
runtime portability
less vendor lock-in
clear unsupported feature list
clean integration planning
```

Risk if ignored:

```text
implicit lock-in
hard future migration
concept drift between blueprint and runtime framework
```

Post-launch decision:

```text
defer_now
reassess_before_choosing_or_freezing_runtime_framework
```

### F-009 — Mission Improvement Search / Evolutionary Planning

Rationale:
The system can eventually generate multiple plan, architecture, validation, and coordination variants and select the best one using validation criteria. This should happen only after evaluation and rollback discipline exists.

Benefit:

```text
better plans
more robust architectures
measurable optimization
controlled self-improvement
```

Risk if done too early:

```text
unbounded self-modification
hard-to-debug behavior changes
optimization against weak metrics
```

Post-launch decision:

```text
defer_now
reassess_after_mission_evaluation_suite_exists
```

### F-010 — Collaboration Mode Taxonomy

Rationale:
Not every agent relationship is pure cooperation. Some validators should be adversarial. Some model/plan variants should compete. Some roles should cooperate and compete at different phases.

Benefit:

```text
clear cooperation_vs_competition_modes
better validator behavior
explicit coopetition patterns
less hidden conflict
```

Risk if ignored:

```text
all agents treated as cooperative assistants
evaluation loses adversarial pressure
negotiation rules stay vague
```

Post-launch decision:

```text
defer_now
reassess_after_validator_behavior_is_measured
```

### F-011 — Change Request / Feedback Intake

Rationale:
After launch, user feedback, bug reports, support issues and change requests must become new Missions or enter Activation / Operations / SDLC loops.

Benefit:

```text
closed product feedback loop
bug-to-mission conversion
support-to-operations routing
feature-request triage
```

Risk if ignored:

```text
feedback remains outside Nexus operating model
manual triage burden
missed learning opportunities
```

Post-launch decision:

```text
defer_now
reassess_after_first_user_feedback_cycle
```

### F-012 — Protocol Gateway: A2A + MCP + Internal Tools

Rationale:
A future gateway may be needed to mediate external agent protocols, tool protocols, and internal Nexus contracts. This should not be rushed before security boundaries are tested.

Benefit:

```text
single trust boundary
protocol mediation
external interoperability
clean audit trail for external calls
```

Risk if ignored:

```text
ad-hoc external integration
fragmented trust boundaries
weak tool/agent provenance
```

Post-launch decision:

```text
defer_now
reassess_after_tool_descriptor_security_and_interoperability_design
```

## 5. What must NOT happen before launch

The following must not be used to reopen the pre-launch blueprint loop unless the owner explicitly promotes an item to launch-blocking:

```text
Do not require A2A support before initial runtime.
Do not require MCP gateway before initial runtime.
Do not require self-evolving coordination before initial runtime.
Do not require formal verification before WP-01.
Do not require dynamic benchmarks before WP-01.
Do not require Mission Improvement Search before core Mission execution works.
Do not require external agent marketplace or protocol gateway before launch.
```

## 6. Post-launch reassessment packet

When reassessment is triggered, prepare a packet with:

```text
current mission metrics
user feedback summary
runtime incidents
tool safety findings
validator quality findings
memory usefulness/harm observations
cost and latency profile
integration requests
security review outcomes
which frontier items should move to active workpackages
which should remain deferred
which should be rejected
```

## 7. Final rule

```text
Record now. Do not block launch. Reassess after launch with evidence.
```
