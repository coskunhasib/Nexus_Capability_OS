# 06 — Gate Spec

## Amaç

Gate, pipeline içinde bir çıktının sonraki aşamaya geçip geçemeyeceğini belirleyen kalite, güvenlik, doğruluk veya uygunluk kontrolüdür.

Gate sadece isim değildir. Her gate input, check method, pass/fail criteria, evidence ve escalation içermelidir.

## Gate schema

```yaml
gate_id: spec-compliance
type: quality-gate
status: active
mission: Üretilen çıktının istenen gereksinimi eksiksiz ve fazlasız karşıladığını doğrular.
inputs:
  - requirement_spec
  - implementation_or_output
  - acceptance_criteria
checks:
  - missing_requirement_check
  - overbuild_check
  - deviation_check
pass_criteria:
  - all_must_have_requirements_covered
  - no_unjustified_extra_scope
  - acceptance_criteria_traceable
fail_criteria:
  - missing_must_have
  - unapproved_scope_change
  - unverifiable_claim
evidence_required:
  - requirement_trace_table
  - reviewer_notes
escalation:
  - return_to_planning
  - request_human_decision
```

## Gate aileleri

| Gate family | Örnekler |
|---|---|
| Spec gates | `spec-compliance`, `scope-fit`, `acceptance-criteria-fit` |
| Code quality gates | `code-quality`, `maintainability`, `type-safety` |
| Test/evidence gates | `test-evidence`, `bench-evidence`, `regression-coverage` |
| Security/trust gates | `security-review`, `tool-trust`, `permission-model`, `prompt-safety` |
| UI/UX gates | `ui-state-coverage`, `responsive-check`, `accessibility-baseline` |
| Physical/system gates | `electrical-safety`, `physics-consistency`, `thermal-coherence` |
| Research gates | `source-quality`, `source-freshness`, `evidence-level` |
| Release gates | `release-readiness`, `rollback-plan`, `observability-baseline` |
| Memory/context gates | `memory-policy-fit`, `context-budget`, `stale-memory-check` |

## Gate severity

```text
Advisory   → Uyarır, bloklamaz.
Blocking   → Geçişi durdurur.
Critical   → İnsan kararı veya yeni plan gerekir.
```

## Gate output format

```yaml
gate_result:
  gate_id: spec-compliance
  status: pass | fail | warning
  severity: advisory | blocking | critical
  evidence:
    - item: requirement_trace_table
      path: string
  findings:
    - severity: important
      issue: string
      why_it_matters: string
      fix: string
  next_action: continue | revise | escalate
```

## Zorunlu kural

Spec-compliance gate ve code-quality gate ayrı tutulmalıdır.

```text
Doğru yapılmış yanlış şey = fail
Yanlış yapılmış doğru şey = fail
```
