# 05 — Capability Pack Spec

## Amaç

Capability Pack, ürünleşebilir dağıtım birimidir. Tek başına skill satmak/kurmak yerine belirli iş tipi için gerekli profil, skill, tool, gate, memory/context policy ve workflow parçalarını bir paket halinde tanımlar.

## Pack neden gerekli?

Dış sistemlerde genellikle skill/command/plugin tekil sunulur. Nexus Capability OS ise iş tipi bazlı derleme yapmalıdır:

```text
İş tipi → Team → Pipeline → Capability Pack
```

Bu sayede kullanıcı “hangi agent lazım?” diye düşünmez; sistem uygun capability setini derler.

## Pack schema

```yaml
pack_id: frontend-web-react-pack
type: capability-pack
status: draft | active | deprecated
summary: React tabanlı web frontend geliştirme capability paketi.
for_intents:
  - web ui development
  - dashboard frontend
  - saas frontend
profiles:
  - frontend-web-engineer
  - ux-flow-designer
  - spec-compliance-reviewer
  - frontend-quality-reviewer
skills:
  - planning-gate
  - frontend-quality-gate
  - spec-compliance-review
  - code-quality-review
  - memory-curator
tools:
  - test-runner
  - browser-preview
  - screenshot-diff
  - accessibility-checker
plugins:
  - runtime-claude-code
runtimes:
  - claude-code
  - codex
quality_gates:
  - ui-state-coverage
  - responsive-check
  - accessibility-baseline
  - api-contract-fit
memory_policy: product-ui-decision-memory
context_policy: ui-working-set-context
outputs:
  - implemented_ui
  - ui_review_report
  - handoff_notes
```

## Pack türleri

| Pack türü | Açıklama |
|---|---|
| domain-pack | Belirli domain için: `firmware-stm32-pack` |
| platform-pack | Platform için: `web-app-pack`, `mobile-app-pack` |
| quality-pack | Review/QA için: `ultrareview-pack` |
| memory-context-pack | Hafıza/bağlam için: `memory-context-governance-pack` |
| product-pack | Uçtan uca ürün tipi için: `web-saas-mvp-pack` |

## Pack quality checklist

```text
[ ] Pack tek iş tipine hizmet ediyor mu?
[ ] Required profile listesi fazla geniş mi?
[ ] Gate listesi gerçekten gerekli mi?
[ ] Tool/plugin izinleri minimum mu?
[ ] Memory/context policy bağlı mı?
[ ] Failure modes var mı?
[ ] Eval case tanımlı mı?
[ ] Runtime uyumluluğu açık mı?
```
