# 07 — Memory / Context Contract

## Ana ayrım

```text
Memory ≠ Context
```

Memory kalıcıdır. Context geçicidir.

## Memory

Memory, gelecekte karar kalitesini artıracak kalıcı bilgidir.

Kaydedilecekler:

```text
- Kalıcı proje kararları
- Kullanıcı tercihleri
- Mimari prensipler
- İptal edilen yaklaşımlar ve nedenleri
- Öğrenilen dersler
- Stable constraints
- Tekrar eden failure mode'lar
```

Kaydedilmeyecekler:

```text
- Geçici fikirler
- Tek seferlik tool çıktıları
- Henüz doğrulanmamış varsayımlar
- Hassas/private veri
- Sadece mevcut task'a ait debug gürültüsü
```

## Context

Context, mevcut işi yapmak için gereken geçici çalışma alanıdır.

Context'e alınacaklar:

```text
- Mevcut task
- Aktif dosyalar
- İlgili requirement
- Son tool çıktısının özetlenmiş hali
- Gerekli working set
```

Context'e basılmayacaklar:

```text
- Büyük raw loglar
- Uzun PDF/repo dump'ları
- Gereksiz geçmiş konuşma
- Tekrar üretilebilir veri
```

## Memory record schema

```yaml
memory_id: decision-2026-05-14-001
type: decision | preference | constraint | lesson | deprecated | risk | pattern
status: active | superseded | deprecated
summary: string
details: string
source:
  kind: conversation | document | review | gate | user-decision
  ref: string
freshness:
  created_at: date
  last_verified_at: date
  expires_at: optional_date
privacy:
  level: public | project-private | sensitive | excluded
relationships:
  - type: supersedes | supports | conflicts_with | derived_from
    target: memory_id
```

## Context policy schema

```yaml
context_policy_id: ui-working-set-context
max_raw_output: low | medium | high
large_output_strategy: summarize | index | sandbox | reject
working_set:
  - relevant_files
  - current_spec
  - active_decisions
retrieval_order:
  - index_first
  - timeline_if_needed
  - detail_only_on_demand
compaction_rule:
  - preserve_current_task
  - preserve_open_questions
  - preserve_next_actions
```

## Retrieval pattern

Memory retrieval kuralı:

```text
index first → timeline/context → detail only if needed
```

Bu, hafızayı context çöplüğüne çevirmemek için zorunludur.

## Memory gate

Her önemli pipeline sonunda şu kontrol çalışmalıdır:

```text
[ ] Yeni kalıcı karar var mı?
[ ] Eski bir karar superseded oldu mu?
[ ] Risk/failure mode öğrenildi mi?
[ ] Geçici bilgi yanlışlıkla memory'ye yazılıyor mu?
[ ] Sensitive/private bilgi dışarıda bırakıldı mı?
```
