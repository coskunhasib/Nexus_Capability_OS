# WP-04 — Final Cross Review

## Executor

```text
Codex + Claude Code + Antigravity, independent then consolidated
```

## Objective

Makine-okunabilir sözleşmeler, skill/agent review ve görsel/traceability çıktıları üretildikten sonra bağımsız cross-review yapmak.

## Inputs

```text
docs/ai-sdlc-factory/**
configs/nexus-ai/**
.memory/**
```

## Review questions

```text
Pipeline contracts standarda uyuyor mu?
SDLC stage contracts eksiksiz mi?
Artifact registry canonical mı?
Shared Registry + Usage Mapping tüm kategorilerde uygulanmış mı?
Governance layer global/pipeline/team/stage/core ability/skill/tool olarak ayrılmış mı?
Audit layer evidence/trace ayrımını koruyor mu?
Core Abilities agent’a dönüştürülmüş mü?
Supervisor yanlışlıkla SDLC Team Lead yapılmış mı?
Plugin geri sızmış mı?
```

## Expected outputs

```text
docs/ai-sdlc-factory/reviews/codex-final-review.md
docs/ai-sdlc-factory/reviews/claude-code-final-review.md
docs/ai-sdlc-factory/reviews/antigravity-final-review.md
docs/ai-sdlc-factory/reviews/final-cross-review-summary.md
```

## Verdict format

```text
PASS
PASS_WITH_FINDINGS
BLOCKED
```

## Completion report

Return:

```yaml
workpackage_id: WP-04
executor: consolidated
status:
verdict:
blocking_findings:
major_findings:
minor_findings:
merge_readiness:
next_action:
```
