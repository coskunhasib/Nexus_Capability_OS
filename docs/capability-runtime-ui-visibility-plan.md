# Capability Runtime UI Visibility Plan

This document covers item 44.

The UI should make the runtime's skill-tool-agent decisions visible before deeper runtime automation is added.

## Goal

```text
Show why a skill was selected.
Show which agent owns the work.
Show whether a sub-agent is justified.
Show which tool grants are active.
Show which notes are used as active context.
Show which observations become experience.
```

## First UI card set

```text
Skill decision card
Agent ownership card
Sub-agent delegation card
Tool grant card
Active context notes card
Evaluation observation card
Runtime loop cycle card
```

## Required fields

### Skill decision

```text
skill_id
purpose
why selected
required_tools
quality_gates
risk_notes
```

### Agent ownership

```text
agent_id
role
owned_scope
responsibilities
evaluation responsibility
```

### Sub-agent delegation

```text
sub_agent_id
parent_agent_id
scope
allowed_tools
expected_output
reason for delegation
```

### Tool grant

```text
grant_id
tool_id
action_class
allowed_actions
workspace boundary
approval required
```

### Active context

```text
context_id
selected_note_refs
current_constraints
open_questions
excluded_refs with reasons
```

### Evaluation observation

```text
subject_type
subject_ref
signal
summary
evidence_refs
recommended_action
```

## UI anti-patterns

```text
Do not hide why a skill was selected.
Do not show sub-agents as magical autonomous workers.
Do not show tool availability without permission boundaries.
Do not show raw transcript as default context.
Do not show memory updates without source refs.
```

## Implementation direction

Start with read-only visibility using the sample fixtures and dry-run runtime cycle.

Do not add mutation controls yet.

Suggested future file:

```text
src/CapabilityRuntimePanel.tsx
```

Suggested future route or panel:

```text
Governance or Runner → Capability Runtime
```

## Item 44 completion

This item is complete at planning level when UI visibility requirements are documented.

Implementation should follow after the dry-run contract fixtures are stable.
