# 20 — Executor Workflow Standard Plan

Bu doküman, Claude Code / Codex / Antigravity executor çalışma standardını tanımlar.

## 1. Objective

Executor ortamlarının iş alma, çıktı üretme, validation yapma ve review’a dönme biçimini standartlaştırmak.

## 2. Dependency

Başlamadan önce:

```text
SDLC completion execution in progress or complete
Governance/Audit readiness draft available
```

## 3. Executor roles

```text
Claude Code = primary executor for documentation/config/schema/review generation
Codex = repo-oriented contract generation and validation helper
Antigravity = blueprint assembly, diagrams, traceability overview
ChatGPT = reviewer / auditor / plan owner
Owner = final decision maker
```

## 4. Workpackage contract

Her workpackage şu alanlara sahip olmalıdır:

```yaml
workpackage_id:
executor:
reviewer:
objective:
mandatory_context:
canonical_sources:
required_outputs:
required_validations:
forbidden_actions:
completion_report_format:
```

## 5. Completion report contract

Her executor şu formatla dönmelidir:

```yaml
workpackage_id:
executor:
status: PASS | PASS_WITH_FINDINGS | BLOCKED
files_created:
files_modified:
validation_summary:
blocking_findings:
major_findings:
minor_findings:
open_questions:
needs_chatgpt_review: true
```

## 6. Global executor forbidden actions

```text
main branch’e yazmak
merge yapmak
runtime implementation yapmak
product refactor başlatmak
connector/deploy/publish eklemek
plugin registry eklemek
owner approval yerine geçmek
production readiness iddiası vermek
```

## 7. Review gates

ChatGPT review verdict formatı:

```text
PASS
PASS_WITH_FINDINGS
BLOCKED
```

No implementation/refactor begins before:

```text
Executor completion report exists.
ChatGPT review exists.
No blocking findings remain.
Owner approves transition.
```

## 8. Executor artifact rules

```text
Long outputs go into repo files, not chat.
Every generated file must be referenced in completion report.
Assumptions must be explicit.
Open questions must be separate from decisions.
No hidden background work claim.
```

## 9. Required docs

Claude Code should create:

```text
docs/ai-sdlc-factory/executor-standard/README.md
docs/ai-sdlc-factory/executor-standard/claude-code.md
docs/ai-sdlc-factory/executor-standard/codex.md
docs/ai-sdlc-factory/executor-standard/antigravity.md
docs/ai-sdlc-factory/executor-standard/completion-report-schema.md
```

## 10. Exit criteria

```text
Executor standard exists.
Completion report schema exists.
Forbidden actions are explicit.
Review flow is explicit.
Owner approval boundary is explicit.
```
