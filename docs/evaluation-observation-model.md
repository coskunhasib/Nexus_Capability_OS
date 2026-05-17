# Evaluation and Observation Model

This document completes item 39 at the design-contract level.

The runtime should not only produce outputs. It should observe what happened and convert useful signals into experience.

## Evaluation goal

```text
Decide whether the result is good enough.
Capture why it worked or failed.
Feed useful lessons back into memory.
```

## Observation targets

Track observations about:

```text
skill effectiveness
tool usefulness
agent performance
sub-agent usefulness
context quality
memory note usefulness
artifact quality
gate reliability
failure causes
```

## Observation shape

```text
observation_id
run_ref
subject_type: skill | tool | agent | sub_agent | context | memory_note | artifact | gate
subject_ref
signal: positive | negative | neutral | unknown
summary
evidence_refs[]
confidence: low | medium | high
recommended_action optional
```

## Evaluation result shape

```text
evaluation_id
run_ref
status: pass | partial | fail
quality_score optional
passed_gates[]
failed_gates[]
missing_evidence[]
accepted_artifacts[]
rejected_artifacts[]
observations[]
recommended_memory_notes[]
open_questions[]
```

## Gate categories

```text
completeness
correctness
safety
traceability
artifact_quality
memory_update_quality
context_quality
operator_approval
```

## Learning rule

Only useful signals become experience.

```text
result output ≠ experience
observed lesson + evidence = experience candidate
```

## What becomes memory

```text
repeated skill success
repeated skill failure
useful tool pattern
unsafe tool pattern
agent/sub-agent delegation lesson
context selection lesson
artifact interpretation
open question
architecture decision
```

## What should not become memory

```text
raw logs
temporary UI state
duplicated observations
low-confidence claims without source refs
one-off noise with no reusable lesson
```

## Future implementation files

```text
schemas/evaluation-observation.schema.json
src/evaluationObservationModel.ts
samples/evaluations/*.json
scripts/verify-evaluation-observation-model.ts
```

## Item 39 completion

This item is complete at design-contract level when observation targets, evaluation result shape and learning rules are documented.
