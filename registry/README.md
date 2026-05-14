# Registry

Bu klasör Nexus Capability OS'in normalize veri modelinin başlangıç yeridir. `src/data.ts` görsel projection olarak kalabilir; gerçek ürünleşme yolunda canonical source bu registry olacaktır.

## Tasarım prensibi

```text
registry/*.json = source of truth
graphData.json = ilişkisel model
treeData.ts = UI projection
```

## Dosyalar

| Dosya | Amaç |
|---|---|
| `schema.json` | Canonical entity ve relationship veri şeması |
| `core-entities.json` | Başlangıç entity envanteri |
| `relationship-types.json` | Graph ilişki tipleri |
| `example-capability-packs.json` | Örnek capability pack kayıtları |

## Neden registry?

Ağaç modeli şu ilişkileri iyi taşıyamaz:

- Bir gate'in birden fazla pipeline tarafından kullanılması
- Bir agent profile'ın birden fazla team template içinde yer alması
- Bir tool'un memory, context ve review pipeline'larda ortak kullanılması
- Runtime adapter uyumluluklarının çapraz bağlanması

Bu nedenle normalize registry + graph yaklaşımı ana modeldir.
