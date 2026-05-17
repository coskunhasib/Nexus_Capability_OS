# Post-Roadmap Backlog

The adapter/runtime roadmap is complete at 15/15. This file tracks the next hardening cycle.

## Queue

```text
16. Final verification contract refresh — done, PR #48
17. Post-roadmap backlog — done, PR #49
18. Release notes / implementation summary — done, PR #50
19. Runtime security policy — done, PR #51
20. Dev command cleanup — done, PR #52
21. Local controlled worker v2 — done, PR #53
22. Generic runtime integration plan — done, PR #54
23. Code Agent integration plan — done, PR #55
24. UI/runtime adapter polish — done, PR #56
25-31. UI runtime implementation phase — implemented, PR #58
32. Operator-run result file ingestion plan — done, PR #59
33. Capability Runtime data model discovery — design-contract complete
34. Skill-Tool-Agent execution contract — design-contract complete
35. Skill package standard — design-contract complete
36. Tool permission model — design-contract complete
37. Agent / sub-agent delegation model — design-contract complete
38. Memory/context distillation model — design-contract complete
39. Evaluation and observation model — design-contract complete
40. Runtime loop prototype — design-contract complete
```

## Priority buckets

```text
P0 — required before embedding the runtime deeply into Nexus
P1 — required before operator-facing usage
P2 — important hardening or polish
P3 — optional quality-of-life
```

## Core correction

```text
LLM = reasoning intelligence.
Nexus Capability Runtime = wisdom, experience and operating discipline.
Nexus is the host system.
Capability Runtime is the embedded skill-tool-agent layer.
```

## Core philosophy

See:

```text
docs/nexus-capability-runtime-philosophy.md
docs/capability-runtime-decision-log.md
```

Main rules:

```text
Skill decides the method.
Agent owns the role.
Sub-agent handles bounded delegation.
Tool performs the action.
Memory carries experience.
Context carries current working state.
Evaluation decides whether the result is good enough.
```

Memory/context rule:

```text
Distillation first.
Notes-first memory.
Pruning only for duplicates, temporary traces and already-distilled raw noise.
```

## P0 items

### 16. Final verification contract refresh

Status: done, PR #48.

Outcome:

```text
The verification contract now reflects the completed 15/15 roadmap and the 16-24 hardening queue.
```

### 17. Post-roadmap backlog

Status: done, PR #49.

Outcome:

```text
16-24 queue is documented.
Priority buckets are explicit.
Real-runtime prerequisites are visible.
```

### 19. Runtime security policy

Status: done, PR #51.

Outcome:

```text
Runtime trust boundaries, sensitive-data handling rules, artifact/output rules, operator approval points, allowed worker actions and external-runtime constraints are documented in docs/runtime-security-policy.md.
```

### 21. Local controlled worker v2

Status: done, PR #53.

Outcome:

```text
Manifest-driven controlled worker path is implemented in server/controlled-worker-v2.ts.
Actions remain allowlisted.
Outputs are bounded.
Deterministic verification is available through npm run verify:controlled-worker.
Runtime events are produced from manifest action results.
```

### 32. Operator-run result file ingestion plan

Status: done, PR #59.

Outcome:

```text
Operator-managed result file ingestion sequence is documented in docs/operator-run-result-ingestion-plan.md.
This plan is now secondary to the Capability Runtime data model and execution contract.
```

### 33. Capability Runtime data model discovery

Status: design-contract complete.

Outcome:

```text
Existing runtime-facing surfaces are inventoried in docs/capability-runtime-data-model-inventory.md.
Canonical candidates, derived fields, UI-only fields, fixture-only fields and unknowns are identified.
```

### 34. Skill-Tool-Agent execution contract

Status: design-contract complete.

Outcome:

```text
Runtime cycle, ownership rules, execution phases, handoff expectations and safety boundaries are documented in docs/skill-tool-agent-execution-contract.md.
```

### 35. Skill package standard

Status: design-contract complete.

Outcome:

```text
Skill package shape, method steps, tool requests, selection signals, performance observations and anti-patterns are documented in docs/skill-package-standard.md.
```

### 36. Tool permission model

Status: design-contract complete.

Outcome:

```text
Tool classes, grants, workspace boundaries, approval policy, audit output and sub-agent permission boundaries are documented in docs/tool-permission-model.md.
```

### 37. Agent / sub-agent delegation model

Status: design-contract complete.

Outcome:

```text
Agent ownership, sub-agent scope, delegation rules, handoff contract, permission inheritance and context inheritance are documented in docs/agent-subagent-delegation-model.md.
```

### 38. Memory/context distillation model

Status: design-contract complete.

Outcome:

```text
Notes-first memory, raw trace boundaries, distilled note shape, active context selection, note lifecycle and staleness rules are documented in docs/memory-context-distillation-plan.md.
```

## P1 items

### 18. Release notes / implementation summary

Status: done, PR #50.

Outcome:

```text
Implementation summary is documented in docs/release-notes.md.
Verification commands, safe boundaries, known limitations and next integration options are listed.
```

### 20. Dev command cleanup

Status: done, PR #52.

Outcome:

```text
Default dev remains local-safe.
Network/LAN dev is available through explicit opt-in command npm run dev:network.
Policy is documented in docs/dev-command-policy.md.
```

### 24. UI/runtime adapter polish

Status: done, PR #56.

Outcome:

```text
Panel-level job-state visibility, controlled worker manifest visibility, runtime envelope clarity, memory/context continuity visibility, artifact registry visibility and operator action copy improvements are documented in docs/ui-runtime-adapter-polish.md.
Implementation should proceed as focused follow-up PRs.
```

### 39. Evaluation and observation model

Status: design-contract complete.

Outcome:

```text
Observation targets, observation shape, evaluation result shape, gate categories and learning rules are documented in docs/evaluation-observation-model.md.
```

### 40. Runtime loop prototype

Status: design-contract complete.

Outcome:

```text
Runtime loop phases, prototype boundaries, inputs, outputs, RuntimeLoopCycle shape and verification goals are documented in docs/runtime-loop-prototype-plan.md.
```

## P2 items

### 22. Generic runtime integration plan

Status: done, PR #54.

Outcome:

```text
Runtime prerequisites, request envelope handoff, expected result collection, failure modes and operator approvals are documented.
Direct runtime invocation remains intentionally unimplemented.
```

### 23. Code Agent integration plan

Status: done, PR #55.

Outcome:

```text
Supported agent kinds, prompt/workspace envelope mapping, expected artifact collection, failure modes and operator approvals are documented in docs/code-agent-real-integration-plan.md.
Direct runtime invocation remains intentionally unimplemented.
```

## UI implementation phase

Detailed implementation state:

```text
docs/ui-runtime-implementation-plan.md
```

Implemented sequence:

```text
25. Job State card + Export job state — implemented
26. Artifact Registry card — implemented
27. Controlled Worker manifest preview/export — implemented
28. External Runtime Mode explanation card — implemented
29. Memory/Context preview/export — implemented
30. Operator action label polish — implemented
31. First runtime wiring decision gate — documented
```

## Capability Runtime design-contract phase

Detailed documents:

```text
docs/capability-runtime-data-model-inventory.md
docs/skill-tool-agent-execution-contract.md
docs/skill-package-standard.md
docs/tool-permission-model.md
docs/agent-subagent-delegation-model.md
docs/memory-context-distillation-plan.md
docs/evaluation-observation-model.md
docs/runtime-loop-prototype-plan.md
```

Completed design-contract sequence:

```text
33. Capability Runtime data model discovery — design-contract complete
34. Skill-Tool-Agent execution contract — design-contract complete
35. Skill package standard — design-contract complete
36. Tool permission model — design-contract complete
37. Agent / sub-agent delegation model — design-contract complete
38. Memory/context distillation model — design-contract complete
39. Evaluation and observation model — design-contract complete
40. Runtime loop prototype — design-contract complete
```

## Guardrails for the next phase

```text
Keep Nexus as the host system.
Keep Capability Runtime as the embedded wisdom/experience layer.
Treat external tools and agents as mappings into this runtime, not as the source of truth.
Use distillation-first context compression.
Use sub-agents only for real delegation, isolation or parallel work.
Keep runtime output behind response-shape validation.
Keep network development exposure opt-in.
```

## Recommended next phase

```text
41. Add schemas and fixtures for the Capability Runtime contracts.
42. Add deterministic verifiers for skill, tool, agent, note and evaluation shapes.
43. Implement a local dry-run runtime loop prototype.
44. Add UI visibility for skill/tool/agent decisions.
45. Decide whether external runtime mapping is needed after local loop validation.
```

## Completion rule

Each future item should update this file or create a follow-up backlog before merge:

```text
state the implementation target
state verification commands
keep any new follow-up as a lower-priority backlog entry
```