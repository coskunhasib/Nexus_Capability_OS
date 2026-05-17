# Skill Package Standard

This document completes item 35 at the design-contract level.

A skill is a reusable learned method. It is not only a prompt. It should encode when to use a method, how to run it, what tools it needs, what risks exist and how success is evaluated.

## Skill package goals

```text
make learned methods reusable
make skill selection explainable
make tool needs explicit
make evaluation hooks explicit
make skill performance observable
```

## Minimum skill shape

```text
skill_id
name
version
purpose
when_to_use[]
when_not_to_use[]
required_inputs[]
method_steps[]
required_tools[]
optional_tools[]
agent_profile_hints[]
sub_agent_hints[]
quality_gates[]
risk_notes[]
expected_outputs[]
observation_metrics[]
```

## Method steps

Each method step should include:

```text
step_id
instruction
input_refs[]
output_kind
required_tool_refs[] optional
required_gate_refs[] optional
```

## Tool declarations

A skill may request tools, but it does not grant them.

```text
Skill can request.
Tool permission model grants.
Runtime enforces.
```

## Skill selection signals

Use a skill when:

```text
task matches when_to_use
required inputs are available or obtainable
risk is acceptable
past observations are positive or unresolved
```

Avoid a skill when:

```text
task is outside scope
required tools are not allowed
past observations show repeated failure
required context is missing
```

## Skill performance observations

After a run, record:

```text
skill_id
run_ref
success / partial / failed
quality_gate_results
artifacts produced
tool usefulness
agent feedback
failure causes
lessons learned
```

These observations should feed memory notes.

## Anti-patterns

```text
skill as a long vague prompt
skill with hidden tool assumptions
skill without evaluation gates
skill without risk notes
skill that duplicates another skill without reason
skill that mutates state without permission declaration
```

## Future implementation files

```text
schemas/skill-package.schema.json
samples/skills/*.json
src/skillPackageModel.ts
scripts/verify-skill-package-standard.ts
```

## Item 35 completion

This item is complete at design-contract level when this standard is used as the basis for future skill schema and samples.
