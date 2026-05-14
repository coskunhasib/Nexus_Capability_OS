# 01 — Canonical Model

## Amaç

Bu doküman, Nexus Capability OS'in gerçek ürün modelini tanımlar. `src/data.ts` içindeki mevcut ağaç yapısı sadece görsel projeksiyon kabul edilir. Asıl sistem **registry + graph + compiler** mantığıyla çalışmalıdır.

## Ana prensip

```text
Tree = UI projection
Registry = source of truth
Graph = gerçek ilişki modeli
Compiler = intent'ten capability pack derleyen karar katmanı
```

Ağaç görünümü genel bakış için iyidir; fakat ürünleşebilir mimaride aynı skill, gate, agent profile veya tool birden fazla pipeline tarafından kullanılabilir. Bu nedenle canonical model tek ebeveynli ağaç değil, çok ilişkili graph olmalıdır.

## Entity tipleri

| Entity | Açıklama | Örnek |
|---|---|---|
| CapabilityOS | Üst sistem | `nexus-capability-os` |
| CapabilityCompiler | Intent'i team/pipeline/pack'e çeviren çekirdek | `capability-compiler` |
| MacroPipelineFamily | Büyük iş ailesi | `software-development` |
| MicroPipeline | Domain/platform özel akış | `frontend-web`, `stm32-firmware` |
| ProfileFamily | Rol ailesi | `software-engineering`, `qa-review` |
| AgentProfile | Somut ajan profili | `frontend-web-engineer` |
| Skill | Davranış/prosedür paketi | `spec-compliance-review` |
| Tool | Çalıştırılabilir yetenek | `browser-preview`, `test-runner` |
| Plugin | Runtime'a bağlanan paket | `claude-code-plugin` |
| RuntimeAdapter | Claude Code, Codex, Cursor vb. adaptörü | `runtime-claude-code` |
| QualityGate | Geçiş kontrolü | `ui-state-coverage` |
| WorkflowStage | Pipeline aşaması | `implementation`, `verification` |
| MemoryPolicy | Kalıcı bilgi yazma/okuma kuralı | `project-decision-memory` |
| ContextPolicy | Geçici bağlam bütçesi/okuma kuralı | `large-output-sandboxing` |
| CapabilityPack | Ürünleşebilir paket birimi | `frontend-web-react-pack` |
| TeamTemplate | İş tipine göre agent seti | `web-saas-team` |
| EvalCase | Profil/skill/gate test vakası | `api-contract-mismatch-case` |

## Relationship tipleri

| Relationship | Anlam |
|---|---|
| contains | Üst entity alt entity taşır |
| requires | Çalışmak için zorunlu dependency |
| uses | Araç, skill veya policy kullanır |
| produces | Bir çıktı üretir |
| reviews | Başka bir çıktıyı kontrol eder |
| hands_off_to | İş devri yapar |
| blocked_by | Gate veya eksik input nedeniyle durur |
| compatible_with | Runtime/tool/plugin uyumluluğu |
| specializes | Genel profilin özel varyantı |
| triggers | Belirli koşulda skill/gate tetikler |
| writes_memory | Kalıcı hafızaya kayıt yazar |
| reads_context | Geçici çalışma bağlamından okur |
| validates | Gate'in doğruladığı unsur |
| assembles | Compiler'ın pack/team kurma ilişkisi |

## Minimum canonical record

Her registry kaydı en az şu alanları taşımalıdır:

```yaml
id: string
type: entity_type
title: string
summary: string
status: draft | active | deprecated
owner_layer: compiler | pipeline | profile | skill | tool | gate | memory | context | runtime
tags: string[]
relationships:
  - type: relationship_type
    target: entity_id
    reason: string
```

## Projection kuralı

UI haritası bu canonical registry'den üretilecek bir görsel projection olmalıdır.

```text
registry/*.json → graphData.json → treeData.ts projection
```

Tree projection belirli amaçlara göre farklı üretilebilir:

1. Pipeline-centric view
2. Profile-centric view
3. Gate-centric view
4. Tool/plugin-centric view
5. Product package view

## Tasarım kararı

`src/data.ts` korunabilir; ancak kaynak model kabul edilmemelidir. Asıl model `registry/` altında normalize tanımlanmalı, UI ise bu modelden oluşturulan projection'ları göstermelidir.
