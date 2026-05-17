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
33-40. Capability Runtime design-contract phase — done, PR #66
41. Capability Runtime schemas and fixtures — implemented
42. Capability Runtime deterministic verifier — implemented
43. Local dry-run runtime loop prototype — implemented
44. Capability Runtime UI visibility plan — documented
45. External runtime mapping decision — documented
46. CapabilityRuntimePanel read-only UI — implemented
47. Stricter JSON schema validation — implemented
48. Local controlled worker mapping into runtime loop — implemented
49. Operator-run result mapping into runtime loop — implemented
50. External runtime mapping re-evaluation — next
Post-50. Switch to milestone/release planning — planned
```

## Stop rule

```text
Stop extending the numbered roadmap after item 50.
After item 50, switch to milestone/release mode.
```

Detailed post-50 plan:

```text
docs/post-50-milestone-plan.md
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

### 33-40. Capability Runtime design-contract phase

Status: done, PR #66.

Outcome:

```text
Capability Runtime data inventory, skill-tool-agent execution contract, skill package standard, tool permission model, agent/sub-agent delegation model, memory/context distillation model, evaluation/observation model and runtime loop prototype plan are documented.
```

### 41. Capability Runtime schemas and fixtures

Status: implemented.

Outcome:

```text
Schema index and first fixture set exist for skill package, tool grant, agent profile, sub-agent delegation, memory notes, active context bundle and evaluation observation.
```

### 42. Capability Runtime deterministic verifier

Status: implemented.

Outcome:

```text
Deterministic verifier validates fixture shapes and dry-run runtime loop construction through npm run verify:capability-runtime.
```

### 43. Local dry-run runtime loop prototype

Status: implemented.

Outcome:

```text
Dry-run RuntimeLoopCycle is generated from selected skill, owning agent, bounded sub-agent, explicit tool grant, active context notes, evaluation observation and memory note refs.
```

### 46. CapabilityRuntimePanel read-only UI

Status: implemented.

Outcome:

```text
Read-only CapabilityRuntimePanel renders skill decision, agent ownership, sub-agent delegation, tool grant, active context notes, evaluation observation and dry-run runtime loop cycle in the sidebar.
No mutation controls or external runtime execution were added.
```

### 47. Stricter JSON schema validation

Status: implemented.

Outcome:

```text
Capability Runtime validators now enforce stricter enums, non-empty required arrays, method-step gate/tool refs, nested workspace boundaries, stale-note reasons, evaluation evidence refs and runtime loop event/artifact shape.
The verifier includes invalid fixture smoke-tests that must fail validation.
The JSON schema index mirrors the stricter contract.
```

### 48. Local controlled worker mapping into runtime loop

Status: implemented.

Outcome:

```text
Controlled worker RuntimeAdapterResponse output maps into a Capability Runtime EvaluationObservation and RuntimeLoopCycle.
Controlled worker runtime events and artifact refs are carried into the runtime loop without direct external runtime execution.
Focused verification is available through npm run verify:controlled-worker-runtime.
```

### 49. Operator-run result mapping into runtime loop

Status: implemented.

Outcome:

```text
Operator-run completed and blocked result files map into Capability Runtime EvaluationObservation, RuntimeLoopCycle events/artifacts and memory note candidates.
Invalid operator-run result shapes fail closed before mapping.
Focused verification is available through npm run verify:operator-run-runtime.
```

### 50. External runtime mapping re-evaluation

Status: next.

Definition of done:

```text
Re-evaluate external runtime mapping only after local loop, schema validation, controlled worker mapping, operator-run mapping and UI visibility are proven.
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

### 44. Capability Runtime UI visibility plan

Status: documented.

Outcome:

```text
Read-only UI visibility requirements for skill decision, agent ownership, sub-agent delegation, tool grants, active context notes, evaluation observations and runtime loop cycle are documented in docs/capability-runtime-ui-visibility-plan.md.
```

### 45. External runtime mapping decision

Status: documented.

Outcome:

```text
External runtime mapping is deferred until local loop, contracts, fixtures and UI visibility are validated. Decision is documented in docs/external-runtime-mapping-decision.md.
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

## Capability Runtime implementation-prep phase

Detailed files:

```text
src/capabilityRuntimeContracts.ts
src/CapabilityRuntimePanel.tsx
src/controlledWorkerRuntimeMapping.ts
src/operatorRunRuntimeMapping.ts
schemas/capability-runtime-contracts.schema.json
samples/capability-runtime/
samples/operator-run-results/
scripts/verify-capability-runtime-contracts.ts
scripts/verify-controlled-worker-runtime-mapping.ts
scripts/verify-operator-run-runtime-mapping.ts
docs/capability-runtime-ui-visibility-plan.md
docs/external-runtime-mapping-decision.md
```

Completed sequence:

```text
41. Add schemas and fixtures for the Capability Runtime contracts — implemented
42. Add deterministic verifiers for skill, tool, agent, note and evaluation shapes — implemented
43. Implement a local dry-run runtime loop prototype — implemented
44. Add UI visibility for skill/tool/agent decisions — documented
45. Decide whether external runtime mapping is needed after local loop validation — documented
46. Implement CapabilityRuntimePanel read-only UI — implemented
47. Add stricter JSON schema validation for fixtures — implemented
48. Add local controlled worker mapping into runtime loop — implemented
49. Add operator-run result mapping into runtime loop — implemented
```

## Post-50 milestone mode

Detailed plan:

```text
docs/post-50-milestone-plan.md
```

Planned milestones:

```text
Milestone 1 — Capability Runtime Alpha
Milestone 2 — Controlled Runtime Beta
Milestone 3 — Embedded Nexus Integration
Milestone 4 — External Runtime Mapping
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
Keep external runtime mapping deferred until local loop validation and UI visibility are proven.
Stop extending numbered roadmap after item 50.
```

## Recommended next phase

```text
50. Revisit external runtime mapping after local validation.
Then switch to Milestone 1 — Capability Runtime Alpha.
```

## Completion rule

Each future item should update this file or create a follow-up backlog before merge:

```text
state the implementation target
state verification commands
keep any new follow-up as a lower-priority backlog entry
```