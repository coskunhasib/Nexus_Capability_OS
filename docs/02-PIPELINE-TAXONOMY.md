# 02 — Pipeline Taxonomy

## Amaç

Nexus Capability OS'te pipeline; işin nasıl ilerleyeceğini, hangi profillerin devreye gireceğini, hangi gates ile doğrulanacağını ve hangi memory/context politikalarının kullanılacağını belirleyen yürütme sözleşmesidir.

## Pipeline seviyeleri

```text
Level 1 — Macro Pipeline Family
  Büyük iş ailesi. Örn: Software Development, Firmware/PCB, Market Intelligence.

Level 2 — Micro Pipeline
  Domain/platform özel akış. Örn: Frontend Web, Backend API, STM32 Firmware.

Level 3 — Task Pipeline
  Dar görev akışı. Örn: API endpoint ekleme, component üretme, RFQ hazırlama.
```

## Mevcut macro families

| Macro Pipeline | Durum | Not |
|---|---|---|
| Software Development | active | Web, backend, mobile, DB, DevOps, QA, LLM app, agentic system |
| AI Automation / n8n / Agent Workflows | active | Workflow-first AI otomasyonu, RAG, NL2SQL, voice assistant |
| Firmware / PCB / Embedded Control | active | STM32, ESP32, PCB, HVAC driver, bench validation |
| Optomekanik / Lazer Sistemleri | active | DPSS, SHG/THG, QCW RFQ, Risley, alignment |
| HVAC / Enerji Sistemleri | active | EEV, R290, sand battery, parabolic solar, AMR |
| Su Arıtma / Bor Arıtma | active | RO, bor selective filter, recirculation, pH |
| Ürün / Mekanik Tasarım | active | CAD/STEP, DFM/DFA, serviceability |
| Tarım / Peyzaj / Dikey Tarım | active | Tree layout, species selection, irrigation |
| Yatırım / Market Intelligence | active | BIST, KAP, macro/news, risk log |
| İçerik / Growth / Pazarlama Otomasyonu | active | Article, social, personal brand, KDP |
| Health / Bio Product Research | active | Ingredient, evidence, product scan |

## Pipeline schema

```yaml
pipeline_id: frontend-web
type: micro-pipeline
parent_macro: software-development
mission: Component, state, API contract ve UI kalite kapılarıyla web arayüzü üretmek.
inputs:
  - product_brief
  - ux_flow
  - api_contract
  - design_constraints
outputs:
  - component_tree
  - implemented_ui
  - ui_review_report
  - handoff_notes
required_profiles:
  - frontend-web-engineer
  - spec-compliance-reviewer
  - frontend-quality-reviewer
required_gates:
  - spec-compliance
  - ui-state-coverage
  - responsive-check
  - accessibility-baseline
memory_policy: product-ui-decision-memory
context_policy: ui-working-set-context
```

## Pipeline tasarım ilkeleri

1. Önce domain, sonra platform, sonra stack.
2. Stack hiçbir zaman birinci sınıf kategori değildir; `react`, `fastapi`, `stm32` gibi tercihler varyanttır.
3. Her pipeline en az bir spec gate, bir kalite gate ve bir memory handoff içermelidir.
4. Safety-critical veya fiziksel sistemlerde evidence gate zorunludur.
5. Market/financial/health araştırmalarında source freshness ve evidence-level gate zorunludur.

## Pipeline completeness checklist

```text
[ ] Mission net mi?
[ ] Girdi/çıktı sözleşmesi var mı?
[ ] Required agent profiles belli mi?
[ ] Gerekli skill/tool/plugin seti belli mi?
[ ] Gate listesi var mı?
[ ] Memory/context policy bağlandı mı?
[ ] Failure modes yazıldı mı?
[ ] Handoff noktaları belli mi?
```
