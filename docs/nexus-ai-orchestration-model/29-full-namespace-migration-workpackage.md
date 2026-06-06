# 29 — Full Namespace Migration Workpackage

This document defines the safe way to fully correct the historical `docs/ai-sdlc-factory/` namespace without breaking repository links.

Scope: **documentation reorganization only**. This workpackage does **not** authorize runtime implementation, product refactor, connector integration, deploy/publish, `nexus` → `main` merge, plugin reintroduction, or production readiness claims.

## 1. Problem

The path below is historical and misleading:

```text
docs/ai-sdlc-factory/
```

Much of the content now describes top-level Nexus AI Orchestration Model standards, not only the SDLC Pipeline.

Correct conceptual namespace:

```text
docs/nexus-ai-orchestration-model/
```

## 2. Goal

Physically move and/or re-index top-level Nexus AI Orchestration Model documents so that a reader no longer assumes all standards are SDLC-only.

The migration must preserve links and provenance.

## 3. Non-goals

This workpackage must not:

```text
change runtime behavior
write runtime code
refactor product code
change configs semantically
merge nexus into main
deploy
publish
introduce plugin registry
claim production readiness
```

## 4. Migration strategy

Use a staged migration, not a blind directory move.

### Stage 1 — Inventory

Create a full file inventory of:

```text
docs/ai-sdlc-factory/**
docs/nexus-ai-orchestration-model/**
configs/nexus-ai/**
.memory/**
```

Classify every document as one of:

```text
top_level_nexus_standard
sdlc_pipeline_specific
legacy_provenance
review_or_audit_artifact
workpackage_or_handoff
ai_studio_prompt
runtime_config
memory
```

### Stage 2 — Move top-level standards

Move top-level standards to:

```text
docs/nexus-ai-orchestration-model/
```

Candidate top-level files:

```text
23-coordination-system-and-runtime-gap-closure.md
24-mission-system-and-user-facing-runtime-model.md
25-mission-runtime-gap-closure-audit.md
26-post-launch-frontier-backlog-and-reassessment-plan.md
AI_STUDIO_HIERARCHY_PROMPT.md
AI_STUDIO_USER_SIMULATION_PROMPT.md
README-updates-after-coordination-runtime-gaps.md
README-updates-after-mission-system.md
CANONICAL_NAMESPACE_NOTICE.md
00b-nexus-ai-scope-and-post-launch-decisions.md
```

### Stage 3 — Keep SDLC-specific files under SDLC namespace

Move or keep SDLC-specific docs under an explicit SDLC path:

```text
docs/nexus-ai-orchestration-model/pipelines/sdlc/
```

Candidate SDLC-specific files:

```text
06-sdlc-coverage-gap-audit.md
06a-sdlc-mandatory-gates-decision.md
06b-sdlc-agentic-safety-and-remaining-gates.md
08-sdlc-pipeline-contract.md
sdlc-stages/**
```

### Stage 4 — Preserve legacy docs

Move or mark legacy docs under:

```text
docs/nexus-ai-orchestration-model/legacy/
```

Candidate legacy/provenance files:

```text
01-core-definitions.md
02-necessity-and-deduplication.md
03-skill-semantic-extraction.md
04-team-agent-subagent-model.md
05-pipeline-model.md
06-governance-policy-evidence.md
07-executor-workpackages.md
08-open-discussion-items.md
```

### Stage 5 — Update links

Update every repo-relative link that points to moved files.

Required checks:

```text
no broken markdown links
no stale docs/ai-sdlc-factory references except deprecation stubs
all canonical reading order links resolve
all config links resolve
all memory bootstrap links resolve
```

### Stage 6 — Add deprecation stubs

For high-traffic legacy paths, keep small stub files that point to the new canonical location.

Stub format:

```text
This file moved to: <new path>
This path is retained only for backwards compatibility.
```

### Stage 7 — Verification

Run documentation verification:

```text
markdown link checker or equivalent local script
repo grep for stale scope wording
YAML parse for configs/nexus-ai
schema validation where available
manual review of README / BLUEPRINT_INDEX / memory bootstrap
```

## 5. Required evidence

Completion must produce:

```text
NAMESPACE_MIGRATION_INVENTORY.md
NAMESPACE_MIGRATION_MAP.md
LINK_CHECK_REPORT.md
STALE_REFERENCE_SWEEP.md
MIGRATION_COMPLETION_REPORT.md
```

## 6. Blocking findings

Block completion if any of these occur:

```text
broken internal markdown link
lost document with no new path and no stub
runtime code change
config semantic change outside docs-only migration scope
main merge
plugin reintroduction
production readiness claim
SDLC described as top-level Nexus AI system
Mission described as Pipeline Run
Supervisor described as Mission Orchestrator or Team Lead
```

## 7. Recommended executor

```text
Executor: Codex
Reviewer: ChatGPT
```

Reason: this is a repository-wide documentation/link rewrite task. It is better handled by an executor with local repo operations, grep, path-aware edits, and link checking.

## 8. Owner decision required

This is not runtime execution, but it is a repository-wide documentation reorganization. It should still be explicitly approved before execution.

Suggested decision:

```text
OWNER_DECISION: APPROVE_DOC_NAMESPACE_MIGRATION
SCOPE: documentation-only namespace migration from docs/ai-sdlc-factory to docs/nexus-ai-orchestration-model
EXECUTOR: Codex
REVIEWER: ChatGPT
BRANCH/WORKSPACE: nexus only; no main merge
```

## 9. Stop rule

Until approved, keep the current mitigation:

```text
canonical namespace marker
legacy namespace notice
scope consistency audit
no physical move
```
