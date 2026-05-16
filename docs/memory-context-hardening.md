# Memory / Context Packet Hardening

Memory / context packet hardening turns a hardened review report into two bounded, durable packets:

```text
hardened review report
→ accepted decisions
→ runtime blockers
→ artifact summaries
→ open questions
→ provider/job metadata
→ do-not-store policy
→ next run context
```

## Why this layer exists

Review report hardening separates human-entered evidence, runtime-reported evidence, artifact-backed evidence, missing evidence and release blockers.

Memory/context hardening decides what is safe and useful to carry forward after that review:

```text
store durable decisions, summaries, refs and unresolved questions
exclude raw runtime events, raw callback payloads, raw artifacts, secrets and unrelated personal data
```

This keeps the next run useful without turning memory into a raw log dump.

## Living code path

```text
src/memoryContextHardening.ts
scripts/verify-memory-context-hardening.ts
```

NPM script:

```bash
npm run verify:memory-context
```

The check is part of the `predev` and `prebuild` lifecycle.

## Inputs

The builder receives:

```text
TaskPacket
HardenedReviewReport
RuntimeJobState optional
RuntimeArtifactRegistry optional
generatedAt optional
maxContextItems optional
```

The TaskPacket contributes objective, routing, selected skills and policy hints.

The HardenedReviewReport contributes:

```text
release_ready
human_entered_evidence
runtime_reported_evidence
artifact_backed_evidence
release_blockers
counts
```

The RuntimeJobState contributes traceability metadata only:

```text
job_id
request_id
provider_id
target_worker
status
started_at
last_event_at
event_count
artifact_count
error_count
callback_count
```

The RuntimeArtifactRegistry contributes artifact refs and summaries.

## Outputs

### `nexus.memory_update_packet` v0.2

The memory packet is for durable memory writes.

It contains:

```text
accepted_decisions
runtime_blockers
artifact_summaries
open_questions
provider_job_metadata
do_not_store
source_counts
generated_at
```

### `nexus.context_update_packet` v0.2

The context packet is for the next run's working set.

It contains:

```text
next_run_context
unresolved_blockers
open_questions
provider_job_metadata
do_not_store
generated_at
```

`next_run_context` carries:

```text
objective
recommended_start_step
routing
policies
carry_forward_decisions
carry_forward_artifacts
required_followups
max_context_items
```

## Accepted decision policy

Accepted decisions are derived only from passed evidence and artifact-backed evidence.

```text
human evidence pass → medium-confidence memory decision
runtime evidence pass → high-confidence memory decision
artifact evidence → medium-confidence artifact decision
```

Failed gates, missing evidence and blocked/incomplete steps do not become accepted decisions. They become blockers and open questions.

## Runtime blocker policy

Every hardened review release blocker becomes a compact runtime blocker memory item:

```text
failed_gate
missing_evidence
blocked_step
incomplete_step
```

The memory packet stores the blocker type, step, optional gate and compact message.

## Artifact policy

Artifacts are stored as summary/ref pairs only:

```text
artifact_id
step_id
kind
ref
summary
store_policy: summary_and_ref_only
```

Raw artifact contents are intentionally excluded.

## Open question policy

Open questions are derived from blockers so the next run starts with a bounded follow-up list.

Examples:

```text
missing_evidence → What evidence is required to close this gate?
failed_gate → What change or decision is needed to pass this gate?
blocked_step → What dependency is blocking this step?
incomplete_step → What work remains before this step can be marked done?
```

## Do-not-store policy

The hardening layer excludes:

```text
raw_runtime_events
raw_callback_payloads
raw_artifact_payloads
secrets_or_credentials
personal_data_not_required_for_next_run
full_conversation_transcripts
```

Rules:

```text
Persist artifact summaries and artifact refs only, not raw artifact contents.
Persist blocker summaries and follow-up questions, not full runtime logs.
Persist provider/job identifiers only when they are needed for traceability.
Drop credentials, tokens, private personal data and irrelevant conversation context.
```

## Verification coverage

`verify:memory-context` checks that:

```text
memory packet is nexus.memory_update_packet v0.2
context packet is nexus.context_update_packet v0.2
accepted decisions include human evidence
accepted decisions include runtime evidence
artifact summaries are summary/ref only
runtime blockers are compactly persisted
open questions are derived from blockers
provider job metadata is carried forward
do-not-store policy excludes raw runtime/callback payloads
next run context starts at the first blocker
next run context followups are bounded by maxContextItems
context and memory share unresolved blockers
```

## Current limitation

This layer currently builds the hardened packet objects in code and verifies their behavior. UI export buttons and persisted sample snapshots can be added after the Adapter Trials step proves the next-run workflow shape.
