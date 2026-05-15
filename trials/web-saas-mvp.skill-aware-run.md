# Trial Run: web-saas-mvp / Skill-Aware Execution

## Purpose

Validate that the `web-saas-mvp` trial produces a usable skill-aware execution flow:

```text
Trial intent
→ Compiler routing
→ Execution Plan
→ Task Packet
→ Runner
→ Gate Evidence
→ Review Report
→ Memory Packet
→ Context Packet
→ Nexus Handoff usefulness decision
```

## Expected selected capability

```text
Capability pack: web-saas-mvp-pack
Macro pipeline: software-development
```

## Expected skills

```text
superpowered-planning-skill
review-skill
quality-assurance-skill
frontend-skill
memory-skill
```

## Required skill behavior checks

| Check | Expected behavior | Pass criteria |
|---|---|---|
| Skill routing | Task Packet includes canonical skills | `routing.skills` and `skills[]` are present |
| Skill runtime | Runner displays active skill directives | Skill runtime directive panel is visible |
| QA behavior | Missing evidence blocks release | Missing required gate evidence creates blocker finding |
| Frontend behavior | UI state/accessibility gates are visible | `ui-state-coverage`, `responsive-check`, or `accessibility-baseline` appear when frontend step exists |
| Review behavior | Findings have severity and source skill where applicable | Review report separates blocker/major/minor/advisory |
| Memory behavior | Memory packet has skill context and do_not_store | `active_skills`, `skill_runtime`, `do_not_store` are present |
| Context behavior | Context packet preserves blockers and next focus | `current_blockers`, `missing_evidence`, `next_execution_focus` are present |

## Manual runner setup

Set a mixed execution state:

```text
01-intake: done
02-architecture: in_progress
pipeline-frontend-web: blocked
```

Set gate evidence:

```text
clarity: pass
  evidence_note: reviewed acceptance criteria and explicit scope boundaries

scope-fit: pass
  evidence_note: verified MVP scope against web-saas acceptance criteria

architecture-coherence: not_checked
  evidence_note: empty

ui-state-coverage: fail
  blocker_reason: empty/loading/error/permission states are not yet mapped

responsive-check: not_checked
  evidence_note: empty

accessibility-baseline: not_checked
  evidence_note: empty
```

## Expected review outcome

```text
release_ready: false
failed_gates > 0
missing_evidence > 0
blocked_steps > 0
```

Expected skill-triggered findings:

```text
quality-assurance-skill → missing evidence is blocker
execution-acceleration-skill → only if present, next_action findings appear
frontend-skill → frontend gates are visible in the task packet
memory-skill → memory packet includes do_not_store and unresolved blockers
```

Note: `web-saas-mvp-pack` does not currently include `execution-acceleration-skill`, so next-action behavior is not expected unless that skill is manually added to the Task Packet.

## Pass / fail decision table

| Area | Status | Notes |
|---|---:|---|
| Compiler routing | TBD |  |
| Execution plan quality | TBD |  |
| Skill-aware Task Packet | TBD |  |
| Skill-aware Runner | TBD |  |
| Review correctness | TBD |  |
| Memory packet quality | TBD |  |
| Context packet quality | TBD |  |
| Nexus handoff usefulness | TBD |  |

## Decision rule

The trial passes only if:

```text
1. selected pack and skills match expectations
2. Review Report blocks release under failed/missing evidence
3. Memory/Context packets preserve blockers without storing noisy transient state
4. Handoff packet is concrete enough for Nexus/runtime execution
```

## Follow-up if failed

```text
routing failure → adjust compiler rule or pack mapping
missing skill behavior → update skillRuntime / ReviewReportPanel
weak memory/context packet → update ReviewReportPanel packet builders
handoff weakness → update nexus-handoff-packet schema and exporter
```
