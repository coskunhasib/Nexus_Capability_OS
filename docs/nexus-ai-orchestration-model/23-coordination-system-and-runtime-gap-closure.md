# 23 — Coordination System and Runtime Gap Closure

This document extends the Nexus AI Orchestration Model blueprint with the missing runtime-facing layers identified after the SDLC / registry / governance / audit corpus was completed.

Scope: **documentation and machine-readable planning only**. This document does **not** authorize runtime implementation, product refactor, connector integration, deploy/publish, `nexus` → `main` merge, plugin reintroduction, or production readiness claims.

## 1. Why this extension exists

The existing blueprint strongly defines:

```text
Shared Registry
Pipeline System
Team System
Core Abilities
Skills
Tools
Governance System
Audit System
```

The missing layer is not another team or pipeline. The missing layer is **how agents coordinate during a Pipeline Run** and which runtime components must exist before the blueprint can become a working system.

## 2. New conceptual layer — Coordination System

Add this layer to the Nexus AI top-level model:

```text
Nexus AI Orchestration Model
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
Team System = who exists?
Coordination System = how do they work together?
Pipeline System = what process is being run?
Governance System = what is allowed?
Audit System = what was proven and what happened?
```

The Coordination System contains five required agent coordination patterns.

### 2.1 Delegation

Simple meaning:

```text
One agent gives a smaller subtask to another agent or sub-agent.
```

Examples:

```text
SDLC Team Lead → Architecture Agent
Architecture Agent → Threat Modeling Sub-agent
QA Agent → Bug Hunter Sub-agent
```

Required contract fields:

```text
delegator
delegatee
scope
allowed_tools
allowed_skills
expected_output_schema
evidence_required
trace_required
reviewer
failure_route
```

Rule: delegated work does not bypass governance, evidence, trace, or review.

### 2.2 Creator-Verifier

Simple meaning:

```text
One agent creates; a different agent verifies.
```

Examples:

```text
product_requirements_agent creates requirements → sdlc_team_lead reviews
architecture_agent creates architecture → sdlc_team_lead reviews
engineering_agent writes code → code_reviewer_agent reviews
qa_agent generates tests → test execution verifies
```

Rule: an agent must not approve its own decision-critical artifact.

Required enforcement:

```text
creator_agent != verifier_agent
self_approval_blocked = true
review_trace_required = true
verification_evidence_required = true
```

### 2.3 Controlled Direct Communication

Simple meaning:

```text
Two agents may talk directly, but only through a controlled, traced message channel.
```

This pattern is useful but dangerous. Uncontrolled agent-to-agent chat can fragment state, hide decisions, leak context, bypass Team Lead visibility, and bypass policy gates.

Rule:

```text
Direct communication is allowed only through the Agent Message Bus.
No invisible peer-to-peer state.
No secret sharing.
No policy bypass.
All messages are traceable.
Decision-relevant messages can become evidence inputs.
```

### 2.4 Negotiation / Arbitration

Simple meaning:

```text
Agents may propose trade-offs, but policy and evidence decide the outcome.
```

Examples:

```text
Security vs UX
Performance vs Cost
Release speed vs Risk
Model quality vs Latency
Scope vs Delivery time
```

Separation:

```text
Negotiation = agents propose options and trade-offs.
Arbitration = deterministic governance chooses or blocks.
```

Priority rules:

```text
blocking gate > agent opinion
policy > preference
evidence-backed finding > unsupported claim
security/privacy blocker > release desire
owner decision > runtime permission
```

### 2.5 Broadcast / Event Bus

Simple meaning:

```text
Important state changes are announced to the relevant agents, governance, audit and memory systems.
```

Examples:

```text
requirements_changed
stage_started
stage_completed
gate_failed
security_blocker_found
evidence_written
rework_required
release_blocked
owner_decision_required
```

Rule:

```text
Broadcast is not free conversation.
Broadcast is controlled state publication.
```

Every broadcast-worthy event must be traceable.

## 3. Runtime gap closure inventory

The following missing components must be tracked before any runtime workpackage execution is treated as complete.

### P0 — Required before meaningful runtime execution

1. Runtime Execution Kernel
2. Shared Registry Loader
3. Registry Resolver
4. Policy Enforcement Point
5. Tool Permission System
6. Tool Sandbox
7. Secret / Credential Boundary
8. Evidence Store
9. Trace Store
10. Pipeline Run State Model
11. Owner Decision Registry
12. Runtime Workpackage Execution Contract

### P1 — Required for the first working SDLC Pipeline Run

13. Pipeline Runner
14. Agent Invocation Contract
15. Agent Message Bus
16. Coordination System enforcement
17. Gate Evaluator
18. Rework / Iteration Engine
19. Model Router
20. Context / Memory Resolver

### P2 — Required for professional-grade operation

21. Decision Arbitration Layer
22. Prompt / Instruction Registry
23. Agent Evaluation Harness
24. Memory Validity / Conflict Resolver
25. Resource & Budget Manager
26. Risk Acceptance Contract
27. Dashboard / Control Plane

### P3 — Required for scale and full Nexus integration

28. Cross-Pipeline Orchestration
29. Tenant / Workspace Boundary
30. External Nexus Integration Boundary
31. Contract Versioning / Migration Policy
32. Incident / Rollback Automation
33. Runtime Definition of Done

## 4. Runtime component explanations in plain language

### Runtime Execution Kernel

The engine that starts a pipeline run, executes stages, invokes agents, checks gates, routes rework, writes evidence/trace, and ends the run.

### Registry Resolver

The resolver that answers: which agent may use which Core Ability, Skill, Tool, Governance Profile, Audit Schema, Model/Profile, and Memory/Profile?

### Policy Enforcement Point

The hard gatekeeper. It allows or blocks tool calls, stage transitions, self-approval, evidence acceptance, risk acceptance, and release movement.

### Tool Sandbox

The safe execution boundary for tools. Tools may read/write/execute only inside allowed scope. Production, secrets, destructive operations and branch writes are deny-by-default unless explicitly allowed.

### Secret / Credential Boundary

Agents do not see raw secrets. Secrets are available only to approved tool runtimes, and never written into trace, evidence, logs, prompts, or output artifacts.

### Evidence Store

The tamper-evident store for decision proof. It records what was proven, by whom, for which stage, with which source artifacts and hashes.

### Trace Store

The operation history. It records agent calls, tool calls, skill usage, policy evaluations, stage transitions, rework routes, broadcasts and model invocations.

### Agent Invocation Contract

The call contract for every agent: task, context, allowed tools, allowed skills, model profile, memory profile, output schema, timeout, retry, failure route and evidence requirements.

### Agent Message Bus

The controlled communication channel for Direct Communication and Broadcast. It prevents invisible peer-to-peer state.

### Decision Arbitration Layer

The rule layer that resolves conflicts between agents. Deterministic policy and evidence outrank unsupported agent opinions.

### Prompt / Instruction Registry

Versioned storage for system prompts, role instructions, output schemas, forbidden claims, examples, and evaluation sets.

### Agent Evaluation Harness

The test bench for agents. It measures whether requirements extraction, architecture review, security finding, test generation, bug finding, evidence production and tool-safety behavior are good enough.

### Memory Validity / Conflict Resolver

The layer that decides whether a memory item is current, stale, superseded, expired, project-scoped, session-scoped, or safe to retrieve.

### Cross-Pipeline Orchestration

The layer that chains pipelines together, for example:

```text
Research Pipeline → SDLC Pipeline → Activation Pipeline → Operations Pipeline → Knowledge / Memory Pipeline
```

### Owner Decision Registry

The durable record of owner decisions such as runtime workpackage execution, executor override, risk acceptance, deploy, merge, or hold.

### Executor Override Policy

The rule for changing an assigned executor. Example: if a Codex-assigned workpackage is reassigned to Claude Code, the override must record reason, risk impact, reviewer, extra gates and owner approval.

### Dashboard / Control Plane

The UI/control surface showing active runs, current stages, gate status, evidence graph, trace timeline, rework loops, blocked items, owner decisions, cost and risk.

### Resource & Budget Manager

The controller for token budget, model cost, latency, parallelism, retry limits, tool-call limits, GPU/CPU/RAM and provider rate limits.

### Model Router

The component that chooses the right model/provider for a task using quality, latency, cost, context length, modality and risk.

### Intent → Pipeline Router

The component that routes user intent to the right pipeline:

```text
"research this" → Research Pipeline
"build product" → SDLC Pipeline
"activate feature" → Activation Pipeline
"incident" → Operations Pipeline
"govern skill" → Skill Governance Pipeline
"update memory" → Knowledge / Memory Pipeline
```

## 5. Required workpackage impact

The existing implementation handoff remains valid, but runtime execution must explicitly account for this extension.

Minimum mapping:

```text
WP-01 Shared Registry Loader
  must support registry validation, resolver inputs, ids/status/version, and cross-reference checks.

WP-03 Governance Engine
  must become or expose the Policy Enforcement Point.

WP-04 Audit / Evidence Store
  must keep Evidence and Trace separate and support tamper-evident metadata.

WP-05 Tool Permission System
  must include Tool Sandbox and Secret Boundary assumptions.

WP-08 Pipeline Run State Model
  must include Coordination System events and message/broadcast state.

WP-09 Pipeline Runner
  must enforce coordination patterns, gate checks, rework routes and event publishing.

WP-10 Executor Integration
  must require owner decision registry checks and executor override policy.
```

## 6. Runtime execution remains prohibited until separate owner approval

This document expands the blueprint. It does not start runtime work.

Still prohibited without separate explicit owner decision:

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

Runtime execution decision format should be scoped to one workpackage:

```text
OWNER_DECISION: APPROVE_RUNTIME_WORKPACKAGE_EXECUTION
SCOPE: WP-XX only
EXECUTOR: <assigned executor>
REVIEWER: ChatGPT
BRANCH/WORKSPACE: isolated under nexus; no main merge
```

## 7. Final rule

The model is no longer only:

```text
Pipeline + Team + Governance + Audit
```

It must also include:

```text
Coordination + Runtime Kernel + Resolver + Enforcement + Evidence/Trace Stores + Evaluation + Control Plane
```

Without these, Nexus AI remains a strong blueprint. With them, it can become a governed no-human AI software operating system.
