# 15 — Master Roadmap and Dependency Map

Bu doküman, Nexus AI Orchestration Model için SDLC completion sonrası tüm işleri tek ana haritada toplar.

## 1. Purpose

Amaç:

```text
Tüm kalan işleri belirlemek
İşlerin bağımlılık sırasını netleştirmek
Claude Code’un hangi sırayla uygulayacağını belirlemek
ChatGPT review kapılarını tanımlamak
Implementation/refactor aşamasına erken geçmeyi engellemek
```

## 2. Current baseline

Mevcut baseline:

```text
Nexus AI kavram modeli: documented
Core Abilities kararı: locked
Shared Registry + Usage Mapping kuralı: locked
SDLC conceptual coverage: complete
SDLC stage contracts: complete with canonical corrections
Artifact registry standard: baseline complete
Machine-readable baseline configs: baseline complete
Claude Code SDLC completion handoff: created
```

## 3. Master dependency chain

```text
A. SDLC Completion Execution
   ↓
B. Pipeline Catalog Expansion
   ↓
C. Shared Registry Formalization
   ↓
D. Team / Agent / Sub-agent Catalogs
   ↓
E. Governance and Audit Implementation Readiness
   ↓
F. Executor Workflow Standard
   ↓
G. Implementation Readiness Review
   ↓
H. Runtime / Refactor Planning Only
   ↓
I. Final Stop Rule and Readiness Gate
```

## 4. Phase A — SDLC Completion Execution

Source plan:

```text
docs/ai-sdlc-factory/13-sdlc-completion-full-execution-plan.md
```

Executor:

```text
Claude Code
```

Reviewer:

```text
ChatGPT
```

Exit criteria:

```text
All SDLC stage YAMLs exist.
All schemas exist.
Consistency audit has no blocking findings.
Claude Code skill/agent review has no blocking findings.
Blueprint index and diagrams exist.
Final cross-review is PASS or PASS_WITH_FINDINGS with no blocking findings.
```

## 5. Phase B — Pipeline Catalog Expansion

Source plan:

```text
docs/ai-sdlc-factory/16-pipeline-catalog-expansion-plan.md
```

Goal:

```text
SDLC dışındaki pipeline türlerini aynı contract standardıyla planlamak.
```

Depends on:

```text
Phase A complete
```

Exit criteria:

```text
Pipeline catalog has initial non-SDLC pipeline definitions.
Each pipeline uses 07-pipeline-contract-standard.md.
Each pipeline identifies its shared registry usage.
```

## 6. Phase C — Shared Registry Formalization

Source plan:

```text
docs/ai-sdlc-factory/17-shared-registry-formalization-plan.md
```

Goal:

```text
Core Abilities, Skills, Tools, Governance, Audit, Model/Provider, Context/Memory registries oluşturmak.
```

Depends on:

```text
Phase A complete
Phase B at least draft complete
```

Exit criteria:

```text
All shared registry files exist.
Every registry item has owner/type/status.
Unused items are marked candidate or deprecated.
```

## 7. Phase D — Team / Agent / Sub-agent Catalogs

Source plan:

```text
docs/ai-sdlc-factory/18-team-agent-subagent-catalog-plan.md
```

Goal:

```text
Pipeline-specific team, team lead, agent and sub-agent role catalogs oluşturmak.
```

Depends on:

```text
Phase B pipeline definitions
Phase C shared registry baseline
```

Exit criteria:

```text
Core Abilities are not listed as Agents.
Supervisor is not listed as SDLC Team Lead.
Every Agent has allowed shared usage fields.
Every Sub-agent has parent or explicit direct-call permission.
```

## 8. Phase E — Governance and Audit Implementation Readiness

Source plan:

```text
docs/ai-sdlc-factory/19-governance-audit-readiness-plan.md
```

Goal:

```text
Governance ve Audit katmanlarını uygulanabilir config standardına taşımak.
```

Depends on:

```text
Phase B pipeline catalog
Phase C shared registries
Phase D role catalogs
```

Exit criteria:

```text
Global, pipeline, team, stage, core ability, skill and tool governance configs exist.
Evidence and Trace schemas remain separate.
```

## 9. Phase F — Executor Workflow Standard

Source plan:

```text
docs/ai-sdlc-factory/20-executor-workflow-standard-plan.md
```

Goal:

```text
Claude Code, Codex, Antigravity iş alma/çıktı dönme/review standardını kilitlemek.
```

Depends on:

```text
Phase A complete
Phase E draft complete
```

Exit criteria:

```text
Executor input/output schema exists.
Completion report schema exists.
No executor can approve own work.
No executor can bypass governance.
```

## 10. Phase G — Implementation Readiness Review

Source plan:

```text
docs/ai-sdlc-factory/21-runtime-refactor-planning-only-plan.md
```

Goal:

```text
Runtime/refactor planına geçmeden önce readiness review yapmak.
```

Depends on:

```text
Phases A-F complete
```

Exit criteria:

```text
Implementation readiness verdict is PASS or PASS_WITH_FINDINGS without blocking findings.
```

## 11. Phase H — Runtime / Refactor Planning Only

Source plan:

```text
docs/ai-sdlc-factory/21-runtime-refactor-planning-only-plan.md
```

Goal:

```text
Core Abilities, pipeline runner, governance engine, audit store için sadece plan hazırlamak.
```

Non-goal:

```text
No runtime code change.
No product refactor.
No connector or deploy.
```

## 12. Phase I — Final Stop Rule and Readiness Gate

Source plan:

```text
docs/ai-sdlc-factory/22-final-stop-rule-and-readiness-gate.md
```

Goal:

```text
Planlama bitti mi, implementation/refactor’a geçilebilir mi sorusunu karara bağlamak.
```

Exit criteria:

```text
Owner decision required before implementation/refactor begins.
```

## 13. Global stop rules

Aşağıdaki işlere bu roadmap tamamlanmadan başlanmaz:

```text
runtime implementation
product refactor
connector integration
Nexus publish
deploy
plugin registry
main branch merge
```

## 14. Review ownership

```text
Claude Code executes documentation/config/schema generation.
ChatGPT reviews outputs.
Owner decides transition to implementation/refactor.
```
