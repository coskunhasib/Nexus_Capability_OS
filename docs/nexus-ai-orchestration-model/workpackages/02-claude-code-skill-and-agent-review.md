# WP-02 — Claude Code Skill and Agent Review

## Executor

```text
Claude Code
```

## Objective

Skill semantiği, SDLC Agent/Sub-agent rolleri, Core Ability kullanım sınırları ve stage contract tutarlılığını bağımsız şekilde incelemek.

## Inputs

```text
.memory/*
docs/ai-sdlc-factory/00-decision-log.md
docs/ai-sdlc-factory/00a-shared-registry-decisions.md
docs/ai-sdlc-factory/01-nexus-ai-operating-model.md
docs/ai-sdlc-factory/02-concept-boundaries.md
docs/ai-sdlc-factory/03-governance-and-audit-layering.md
docs/ai-sdlc-factory/05-shared-registry-and-usage-mapping.md
docs/ai-sdlc-factory/06*.md
docs/ai-sdlc-factory/08-sdlc-pipeline-contract.md
docs/ai-sdlc-factory/sdlc-stages/*
```

## Review focus

```text
prism = brainstorming / divergent thinking olarak mı kullanılmış?
verification-loop = bug / defect finding olarak mı kullanılmış?
Core Abilities agent gibi modellenmiş mi?
Supervisor, SDLC Team Lead yerine geçmiş mi?
Team → Team Lead → Agent → Sub-agent hiyerarşisi korunmuş mu?
Shared Registry + Usage Mapping kuralı tüm kategorilerde uygulanmış mı?
SDLC stage’leri gereksiz veya eksik mi?
```

## Expected outputs

```text
docs/ai-sdlc-factory/reviews/claude-code-skill-agent-review.md
```

## Completion report

Return:

```yaml
workpackage_id: WP-02
executor: Claude Code
status:
findings:
blocking_findings:
major_findings:
minor_findings:
recommendations:
needs_review:
```
