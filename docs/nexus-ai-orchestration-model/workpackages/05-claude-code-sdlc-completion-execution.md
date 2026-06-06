# WP-05 — Claude Code SDLC Completion Execution Handoff

## Executor

```text
Claude Code
```

## Reviewer

```text
ChatGPT
```

## Objective

`13-sdlc-completion-full-execution-plan.md` içindeki tüm fazları uygulamak ve SDLC Pipeline’ı dokümantasyon seviyesinden `contract-ready + independently reviewed` seviyesine taşımak.

Bu workpackage runtime/refactor/connector/deploy işi değildir. Sadece dokümantasyon, config, schema, validation ve review artifact üretimidir.

## Mandatory context to read first

```text
.memory/README.md
.memory/0001-session-summary.md
.memory/0002-locked-decisions.md
.memory/0003-sdlc-research-baseline.md
.memory/0004-next-actions.md

docs/ai-sdlc-factory/README.md
docs/ai-sdlc-factory/13-sdlc-completion-full-execution-plan.md
docs/ai-sdlc-factory/14-post-sdlc-continuation-plan.md
```

## Canonical source documents

```text
docs/ai-sdlc-factory/07-pipeline-contract-standard.md
docs/ai-sdlc-factory/08-sdlc-pipeline-contract.md
docs/ai-sdlc-factory/09-sdlc-stage-contract-review.md
docs/ai-sdlc-factory/10-sdlc-stage-contract-second-review.md
docs/ai-sdlc-factory/11-artifact-registry-standard.md
docs/ai-sdlc-factory/12-completion-review-for-contract-work.md
docs/ai-sdlc-factory/sdlc-stages/README.md
docs/ai-sdlc-factory/sdlc-stages/01-foundation-and-requirements.md
docs/ai-sdlc-factory/sdlc-stages/02-design-risk-and-planning.md
docs/ai-sdlc-factory/sdlc-stages/03-build-review-and-test.md
docs/ai-sdlc-factory/sdlc-stages/04-validation-and-product-gates.md
docs/ai-sdlc-factory/sdlc-stages/05-completion-release-and-learning.md
docs/ai-sdlc-factory/sdlc-stages/06-canonical-corrections-and-overrides.md
```

## Locked decisions that must not be changed

```text
Plugin is cancelled.
Top-level system is Nexus AI Orchestration Model.
SDLC is one pipeline under Nexus AI, not the top-level system.
Supervisor, Coder, Vision, Audio, Creative, Memory, Web, OS = Core Abilities.
Core Abilities are not Agents and are not Team members.
Team hierarchy is Team → Team Lead → Agents → Sub-agents.
Supervisor is not SDLC Team Lead.
Shared Registry and Usage Mapping are separate.
Shared categories must appear both in registry and usage context.
Skill appears by name in the main hierarchy; skill internals stay in skill inventory/audit docs.
Governance and Audit are separate.
Evidence and Trace are separate.
```

## Required phase execution

Claude Code must complete phases in this order:

```text
Phase 0 — Context lock and memory reload
Phase 1 — Machine-readable SDLC stage contracts
Phase 2 — JSON schemas and validation rules
Phase 3 — SDLC contract consistency audit
Phase 4 — Claude Code independent skill and agent review
Phase 5 — Blueprint assembly and diagrams
Phase 6 — Final cross-review preparation artifact
```

## Required outputs

### Phase 0 outputs

```text
docs/ai-sdlc-factory/execution/phase-0-context-lock-report.md
```

### Phase 1 outputs

```text
configs/nexus-ai/stages/sdlc/*.yaml
configs/nexus-ai/stages/sdlc/README.md
```

### Phase 2 outputs

```text
configs/nexus-ai/schemas/pipeline_definition.schema.json
configs/nexus-ai/schemas/pipeline_run.schema.json
configs/nexus-ai/schemas/stage_contract.schema.json
configs/nexus-ai/schemas/artifact_registry.schema.json
configs/nexus-ai/schemas/evidence_item.schema.json
configs/nexus-ai/schemas/trace_item.schema.json
configs/nexus-ai/validation/README.md
```

### Phase 3 outputs

```text
docs/ai-sdlc-factory/reviews/sdlc-contract-consistency-audit.md
```

### Phase 4 outputs

```text
docs/ai-sdlc-factory/reviews/claude-code-skill-agent-review.md
```

### Phase 5 outputs

```text
docs/ai-sdlc-factory/BLUEPRINT_INDEX.md
docs/ai-sdlc-factory/TRACEABILITY_OVERVIEW.md
docs/ai-sdlc-factory/diagrams/nexus-ai-operating-model.mmd
docs/ai-sdlc-factory/diagrams/sdlc-pipeline-flow.mmd
docs/ai-sdlc-factory/diagrams/shared-registry-usage-map.mmd
docs/ai-sdlc-factory/diagrams/governance-audit-layering.mmd
```

### Phase 6 outputs

```text
docs/ai-sdlc-factory/reviews/claude-code-sdlc-completion-summary.md
```

## Required validations

Claude Code must report these checks:

```text
All YAML files parse.
All JSON schema files parse.
Every SDLC stage has all required fields from pipeline_contract_standard.yaml.
Every SDLC stage includes all shared usage fields.
Every route points to a known stage or canonical terminal state.
Every conditional stage has applicability_decision.
No plugin field exists.
Core Abilities are not listed as Agents.
Supervisor is not listed as SDLC Team Lead.
Release candidate depends on development completion.
Domain/regulatory compliance stage exists.
Supply chain, SBOM, license gates exist.
Agentic safety/evaluation gates exist.
Data/migration, accessibility, API contract, privacy, cost/resource, backup/DR gates exist.
```

## Forbidden actions

```text
Do not implement runtime code.
Do not refactor existing product code.
Do not add connector integration.
Do not add deploy/publish logic.
Do not introduce plugin registry.
Do not write to main branch.
Do not merge.
Do not claim production readiness.
Do not replace owner approval.
```

## Completion report format

Claude Code must finish with:

```yaml
workpackage_id: WP-05
executor: Claude Code
status: PASS | PASS_WITH_FINDINGS | BLOCKED
files_created:
files_modified:
validation_summary:
  yaml_parse: pass | fail
  json_schema_parse: pass | fail
  required_fields_check: pass | fail
  route_check: pass | fail
  conditional_gate_check: pass | fail
  plugin_absence_check: pass | fail
  core_ability_boundary_check: pass | fail
blocking_findings:
major_findings:
minor_findings:
open_questions:
needs_chatgpt_review: true
```

## ChatGPT review gate

After Claude Code finishes, ChatGPT must review the produced artifacts before any next work begins.

Review verdict format:

```text
PASS
PASS_WITH_FINDINGS
BLOCKED
```

Implementation/refactor remains blocked until review is complete.
