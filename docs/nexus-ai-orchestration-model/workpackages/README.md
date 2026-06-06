# Executor Workpackages

Bu klasör, Nexus AI Orchestration Model için Codex / Claude Code / Antigravity iş paketlerini tutar.

Bu workpackage’ler implementation’a doğrudan başlamaz. Amaç, dokümantasyon ve sözleşme setini makine-okunabilir ve uygulanabilir hale getirmektir.

## İş paketleri

```text
01-codex-machine-readable-contracts.md
02-claude-code-skill-and-agent-review.md
03-antigravity-blueprint-assembly-and-visuals.md
04-final-cross-review.md
```

## Genel yasaklar

Executor ortamları şunları yapamaz:

```text
main branch’e yazmak
merge yapmak
runtime/refactor başlatmak
plugin registry eklemek
Nexus publish tasarlamak
production deploy yapmak
Core Abilities / SDLC Team modelini owner onayı olmadan değiştirmek
```

## Beklenen completion formatı

Her executor şu formatla completion raporu üretir:

```yaml
workpackage_id:
executor:
status:
files_created:
files_modified:
gates_passed:
gates_failed:
assumptions:
open_questions:
risks:
needs_review:
```
