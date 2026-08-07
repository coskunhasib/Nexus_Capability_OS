# Nexus Investment Pipeline — THF Vaka Sonrası Düzeltme ve Geliştirme Planı

**Belge türü:** Uygulama öncesi plan / approval-gated remediation plan  
**Tarih:** 7 Ağustos 2026  
**Durum:** **PLAN HAZIR — UYGULAMA ONAYI BEKLENİYOR**  
**Kapsam:** Nexus Bireysel Yatırım Pipeline’ı  
**Referans vaka:** THF (Tera Portföy Hisse Senedi Fonu)

## 0. Zorunlu onay kapısı

Bu belge yalnızca planlama ve dokümantasyondur. Kullanıcının açık ve yazılı uygulama onayı gelmeden kod, test, runtime davranışı, pipeline kuralı, branch yapısı veya üretim konfigürasyonu değiştirilmez.

Geçerli onaya örnek: **“Planı onaylıyorum, uygulamaya geç.”** Buna eşdeğer, tereddütsüz ve yazılı bir ifade de geçerlidir.

`olur`, `tamam`, `mantıklı`, emoji/reaksiyon, bir alt başlığa olumlu görüş veya yeni soru **uygulama onayı sayılmaz**.

---

## 1. Değişmez yönetişim ve branch kuralları

- `main` yatırım pipeline’ı için hedef branch değildir.
- Canonical yatırım entegrasyon branch’i: `feature/nexus-investment-pipeline`.
- `main`e doğrudan commit yasaktır.
- Yatırım branch’inden `main`e merge yasaktır.
- Varsa holding PR draft/open/unmerged kalır.
- Yeni yatırım PR’ları canonical investment branch’i hedefler; `main`i hedeflemez.
- Uygulama onayından sonra ilk teknik adım **read-only branch/PR bütünlük denetimi** olacaktır.
- Branch/PR durumu beklenenden farklıysa fail-closed davranılır: otomatik olarak `main`e yazılmaz, merge edilmez; önce durum raporlanır.
- Canlı GitHub connector görünümü ile önceki branch/PR kayıtları şu anda uyuşmadığından, uygulama başlamadan önce bu durum ayrıca doğrulanacaktır.

---

## 2. THF vakasında ortaya çıkan ana hatalar

### F-01 — Discovery failure
Pipeline THF’yi kullanıcı söylemeden önce yüksek öncelikli yatırım adayı olarak keşfedemedi.

**Beklenen davranış:** yönetici değişimi + portföy rejim değişimi + olağan dışı fon akışı + yatırımcı yapısı değişimi + regülasyon/erişilebilirlik etkisi gibi olaylar birlikte işlendiğinde THF otomatik adaylaştırılmalıydı.

### F-02 — Research / retrieval failure
Kullanıcı “THF fonunu incele” dediğinde konuya doğrudan ilişkin yeni Reddit gönderisi bulunamadı.

**Beklenen davranış:** arama yalnız `THF` anahtar kelimesine bağlı olmamalı; fon, portföy şirketi, yöneticiler, fon ailesi, ilişkili fonlar, portföy hisseleri ve semantik tez başlıkları üzerinden entity-graph tabanlı genişletilmiş arama yapılmalıydı. Başlıkta THF geçmese bile gövdedeki THF tezi bulunabilmeliydi.

### F-03 — Decision failure
Yeterli veri toplandıktan sonra yalnız analiz üretildi; kullanıcı risk düzeyine göre aksiyon önerisi verilmedi.

**Beklenen davranış:** veri yeterliyse her yatırım analizi risk bütçesine göre ayrı karar üretmeli:
`AL / KADEMELİ AL / TUT / BEKLE / AZALT / SAT`.

---

## 3. Spesifikasyon çelişkisini giderme planı

Yaşayan yatırım spesifikasyonu sosyal medyayı **hipotez ve erken uyarı** kaynağı olarak tanımlarken, eski TLY günlük kural seti sosyal medyayı **yalnızca doğrulama amacıyla** kullanıyor.

Canonical karar:

- **Sosyal medya = discovery + hipotez + erken uyarı**
- **Sosyal medya ≠ tek başına kesin kanıt**
- Tez, mümkün olduğunda resmi veya bağımsız yüksek güvenli kaynaklarla doğrulanır.
- Eski “yalnız doğrulama” kuralı yatırım pipeline bağlamında superseded işaretlenecek; “tek başına kanıt değildir” ilkesi korunacak.

---

## 4. Hedef mimari

```text
INVESTMENT UNIVERSE
        │
        ▼
┌─────────────────────┐
│  DISCOVERY SCOUT    │
└─────────┬───────────┘
          │
    ┌─────┼──────────────┐
    ▼     ▼              ▼
 Official Market/Alt     Social
 KAP...   Data           Reddit/X/Forum
    │     │              │
    └─────┼──────────────┘
          ▼
┌─────────────────────┐
│ ENTITY / EVENT GRAPH│
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│ EVENT FUSION ENGINE │
└─────────┬───────────┘
          ▼
  Discovery Score
          │
          ▼
┌─────────────────────┐
│ THESIS / COUNTERCASE│
└─────────┬───────────┘
          ▼
 Opportunity + Risk
          │
          ▼
┌─────────────────────┐
│ USER RISK BUDGET    │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│ ACTION ENGINE       │
│ AL / TUT / SAT ...  │
└─────────┬───────────┘
          ▼
 Invalidation + Sizing
          │
          ▼
 Decision Journal
```

---

## 5. Workstream A — Discovery Scout

### A1. Varlık-agnostik tarama
TLY-merkezli yardımcı fon takibi yerine her fon/hisse bağımsız `candidate` olabilmeli.

### A2. Zorunlu event detector’lar
- `MANAGER_CHANGE`
- `MANAGER_MIGRATION`
- `PORTFOLIO_REGIME_SHIFT`
- `NEW_POSITION_CLUSTER`
- `POSITION_EXIT_CLUSTER`
- `ABNORMAL_AUM_FLOW`
- `ABNORMAL_SHARE_COUNT_FLOW`
- `INVESTOR_COUNT_SHIFT`
- `AVG_INVESTOR_BALANCE_SHIFT`
- `LARGE_TICKET_FLOW_CANDIDATE`
- `REGULATORY_ACCESS_CHANGE`
- `FUND_FAMILY_DNA_SHIFT`
- `LIQUIDITY_CAPACITY_RISK`
- `SOCIAL_HYPOTHESIS`
- `PRICE_NAV_DISLOCATION`
- `EXPECTED_EVENT`

### A3. Manager Migration
Aynı yöneticinin başka fondan gelmesi, ilişkili fonları eşzamanlı yönetmesi ve geçmiş strateji DNA’sının yeni fonla benzerliği ayrı bir sinyal olacaktır.

### A4. Portfolio Regime Shift
Yeni/çıkan hisseler, ilk 5/10 konsantrasyonu, small/mid/large-cap dağılımı, likidite profili, sektör/faktör değişimi ve ilişkili şirket/fon ailesi maruziyeti tek `portfolio_regime_change_score` altında toplanacaktır.

### A5. Fon akışı
Fiyat etkisinden arındırılmış 1/3/5/20 günlük net akış; net akış/AUM; pay adedi; yatırımcı sayısı; ortalama yatırımcı bakiyesi; marjinal akış/marjinal yatırımcı; geçmiş büyük çıkışlara göre recovery; net akış/likidite; estimated days-to-deploy ve days-to-liquidate hesaplanacaktır.

### A6. Discovery Score
`Discovery Score = Event Evidence + Cross-Event Fusion + Novelty + Persistence - Uncertainty - Capacity Penalty`

Ağırlıklar ilk etapta provisional olacak; tarihsel vakalar üzerinde kalibre edilmeden kalıcılaştırılmayacaktır.

---

## 6. Workstream B — Entity Graph ve Query Expansion

Fon için graph:
- fon kodu ve tam adı
- portföy şirketi
- portföy yöneticileri
- ilişkili fonlar
- yeni/ana portföy hisseleri
- regülasyonlar
- sosyal tez/haber kümeleri

Her `incele/değerlendir` çağrısında otomatik arama paketi:
1. exact code
2. exact fund name
3. asset manager
4. manager names
5. related funds
6. top/new holdings
7. flow/anomaly terms
8. regulation terms
9. Reddit
10. X
11. finans forumları / güvenilir medya
12. semantic topic variants

Arama `title match + body match + semantic match + related-entity match` yapacaktır.

**THF regression kriteri:** Reddit başlığında THF geçmese dahi gövdede THF hakkında kuvvetli tez varsa sonuç bulunmalıdır.

---

## 7. Workstream C — Social Intelligence Layer

Sosyal medya:
- erken sinyal,
- özgün tez keşfi,
- crowd observation,
- yeni event candidate

üretir.

Her sosyal sinyal:
- kaynak,
- zaman,
- özgünlük,
- echo/kopya riski,
- destekleyen bağımsız kaynaklar,
- resmi teyit,
- karşı kanıt

ile tutulur.

Durum makinesi:
`UNVERIFIED → PARTIALLY_VERIFIED → VERIFIED / REJECTED / STALE`

Aynı iddiayı kopyalayan çok sayıda hesap bağımsız kanıt sayılmaz.

### Research completeness gate
Fon analizi sonunda sistem kaydetmek zorundadır:
- Reddit arandı mı?
- X arandı mı?
- yönetici/şirket/ilişkili fon adları arandı mı?
- body/semantic arama denendi mi?
- sonuç yoksa kaç farklı query kullanıldı?
- kaynak erişim hatası oldu mu?

Bu kayıt olmadan “araştırma tamamlandı” statüsü verilemez.

---

## 8. Workstream D — Event Fusion Engine

Tek tek sinyal yerine olay kümeleri işlenecektir.

THF örneği:

```text
Manager migration
      +
Portfolio regime change
      +
Abnormal capital flow
      +
Investor structure shift
      +
Social thesis
      ↓
HIGH-PRIORITY CANDIDATE
```

Fusion kriterleri:
- zaman yakınlığı
- aynı entity graph içinde ilişki
- bağımsız kaynak sayısı
- olayların birbirini açıklama gücü
- base-rate/tesadüf riski
- karşı senaryo
- geleceğe dönük test edilebilir beklenti

Korelasyon otomatik nedensellik sayılmayacaktır.

Evidence ayrımı:
`observed / inferred / hypothesized / verified`

---

## 9. Workstream E — Temporal Integrity ve Veri Kalitesi

Yeni katman mevcut metodolojiyle birleşecektir:
- her veri için `as_of_date/time`
- NAV staleness
- fon fiyatı/NAV tarih uyumu
- look-ahead bias yasağı
- 20g ortalama hacim
- medyan hacim
- düşük hacim çeyreği
- spread
- taban/devre kesici
- VBTS/kredili işlem tedbirleri
- fonun şirket sermayesindeki sahiplik oranı
- MKK/KAP sahiplik değişimleri

**Look-ahead yasağı:** 6 Ağustos THF replay’i, 7 Ağustos akışını karar üretmek için göremez. 7 Ağustos verisi yalnız post-validation için kullanılabilir.

---

## 10. Workstream F — Discovery Score / Action Score ayrımı

**Discovery Score:** “Burada sıra dışı ve araştırmaya değer fırsat var mı?”

**Action Score:** “Bugün bu kullanıcı için işlem yapılacak kadar iyi mi?”

Yüksek Discovery Score otomatik `AL` anlamına gelmez.

---

## 11. Workstream G — User Risk Budget

Teknik isim: `user_risk_budget`.

Varsayılan rapor matrisi:
1. `CONSERVATIVE`
2. `BALANCED`
3. `AGGRESSIVE`
4. `SPECULATIVE`

Kullanıcının profili bilinmiyorsa sistem tek karar seçmez; dört profil için ayrı sonuç verir.

Girdiler:
- kabul edilebilir drawdown
- yatırım ufku
- likidite ihtiyacı
- portföy büyüklüğü
- mevcut yoğunlaşma
- aynı tema/fon ailesine maruziyet
- işlem sıklığı
- zarar toleransı
- yeniden giriş isteği
- ürünün likidite/valör karakteri

---

## 12. Workstream H — Action Engine

Zorunlu aksiyon kümesi:
- `AL`
- `KADEMELİ AL`
- `TUT`
- `BEKLE`
- `AZALT`
- `SAT`
- `VERİ YETERSİZ / ACTION BLOCKED`

Her aksiyonun zorunlu alanları:
- kullanıcı risk profili
- aksiyon
- conviction
- veri güveni
- zaman ufku
- pozisyon büyüklüğü bandı
- ana tez
- karşı tez
- invalidation trigger
- upgrade trigger
- downgrade trigger
- likidite/valör notu
- yeniden giriş koşulu

### Yeni output contract
Kullanıcı açıkça istemediği sürece her yatırım incelemesi şu bölümle bitecek:

**Action by Risk Profile**

| Risk profili | Aksiyon | Pozisyon yaklaşımı | Teyit koşulu | İptal koşulu |
|---|---|---|---|---|

Bu bölüm yoksa analiz `COMPLETE` olamaz.

---

## 13. Workstream I — Position Sizing

Aksiyon ile pozisyon büyüklüğü ayrılır.

Sizing:
- asset risk
- user risk budget
- liquidity
- correlation
- concentration
- thesis confidence
- data confidence
- expected downside

ile belirlenir.

İlk sürümde tek sabit yüzde yerine risk-profile bandı kullanılır; kalibrasyon sonrasında daraltılır.

---

## 14. Workstream J — Invalidation ve Re-entry

Her bullish/bearish karar test edilebilir olmalıdır.

Trigger örnekleri:
- beklenen akış devam etmedi
- yönetici/strateji değişimi tersine döndü
- portföy likiditesi bozuldu
- fon büyüklüğü capacity sınırına yaklaştı
- ilişkili hisselerde tedbir/likidite şoku
- büyük yatırımcı geri çekildi
- regülasyon varsayımı yanlışlandı

Her `SAT/AZALT` kararı için yeniden giriş koşulu da kaydedilir.

---

## 15. Workstream K — Research Completeness Contract

Her araştırma sonunda makine-okunur completeness kaydı:

```yaml
official_sources:
  kap: searched
  spk: searched
  tefas: searched
  gefas: searched_or_not_applicable
  mkk: searched_or_not_available

market_data:
  fund_flow: complete
  investor_count: complete
  portfolio_diff: complete
  liquidity: partial

social:
  reddit: searched
  x: searched
  semantic_expansion: searched

entity_graph:
  fund: complete
  manager: complete
  related_funds: complete
  holdings: complete

gaps:
  - ...

status: COMPLETE | PARTIAL | BLOCKED
```

`PARTIAL/BLOCKED` araştırmada Action Engine conviction sınırı uygular veya aksiyonu bloke eder.

---

## 16. Workstream L — THF Golden Regression Suite

**THF-001 — Manager Migration**  
As-of 23 Temmuz 2026: yönetici DNA geçişi fark edilir ve watch alert oluşur.

**THF-002 — Portfolio Regime Shift**  
Temmuz sonu: yeni agresif pozisyon kümesi ve çıkışlar candidate score’u yükseltir.

**THF-003 — Hidden Social Mention**  
Reddit başlığında THF bulunmasa bile gövdedeki THF tezi bulunur.

**THF-004 — Abnormal Flow**  
As-of 6 Ağustos: fiyat etkisinden arındırılmış olağan dışı giriş, AUM oranı, yatırımcı sayısı ve ortalama bakiye birlikte değerlendirilir; Priority-1 candidate’a yükseltilir.

**THF-005 — No Look-ahead**  
6 Ağustos replay’i 7 Ağustos verisini göremez.

**THF-006 — Event Fusion**  
Manager + portfolio + flow + social aynı graph üzerinde birleşir.

**THF-007 — Action Completeness**  
THF analizi dört risk profiline göre aksiyon üretmeden tamamlanamaz.

**THF-008 — Countercase**  
Likidite/capacity ve büyüme riskleri bullish tezin yanında zorunludur.

**THF-009 — Source Conflict**  
Eski “social only validation” ile yeni “social early signal” çakışmasında canonical ADR uygulanır.

**THF-010 — Future Validation**  
7 Ağustos ek akışı 6 Ağustos sinyalinin sonradan doğruluğunu ölçmekte kullanılır; geçmiş kararı üretmekte kullanılmaz.

---

## 17. False-positive testleri

THF’yi yakalamak yeterli değildir.

Negatif testler:
- yalnız tek günlük AUM artışı
- fiyat artışından doğan sahte büyüklük artışı
- yönetici isim benzerliği
- teknik portföy yeniden sınıflandırması
- sosyal medya echo chamber
- stale Reddit gönderisi
- yüksek yatırımcı artışı / düşük net para
- yüksek para girişi / deploy edilemeyen likidite
- aynı fon ailesinde hareket ama bağımsız strateji
- resmi kaynak ile sosyal iddia çelişkisi

---

## 18. Kalibrasyon ve ölçüm

### Discovery
- precision
- recall
- lead time
- false alarm rate
- missed-opportunity rate

### Research
- source coverage
- social retrieval recall
- official confirmation rate
- stale-source rate

### Decision
- action completeness
- profile consistency
- drawdown after action
- opportunity cost of `BEKLE`
- invalidation hit-rate

### Learning
Kararlar 1 hafta, 1 ay ve 3 ay sonra yeniden değerlendirilir ve karar günlüğüne geri yazılır.

---

## 19. Uygulama sonrası dokümantasyon değişiklikleri

Açık yazılı uygulama onayından **sonra**, koddan önce canonical branch üzerinde:

1. Living Specification minor update
2. ADR — Social Discovery + Event Fusion
3. ADR — User Risk Budget + Action Contract
4. THF Golden Case
5. Research Completeness Contract
6. CHANGELOG
7. Test matrix

güncellenecektir.

ADR numaraları ve gerçek repo yolları uygulama öncesi repo/branch audit sonrası atanacaktır; numara tahmin edilmeyecektir.

---

## 20. Uygulama sırası — katı fazlar

Bir fazın gate’i geçmeden sonraki faz başlamaz.

### Faz 0 — Read-only Repo/Branch Audit
Canonical investment branch, holding PR, docs index/manifest drift, mevcut kod/test kapsamı doğrulanır.

**Gate:** main’e dokunulmadığı ve doğru branch’in bulunduğu doğrulanır.

### Faz 1 — Contract ve ADR
Event schema, research completeness, discovery/action ayrımı, user risk budget ve action contract.

### Faz 2 — Discovery Scout
Manager migration, portfolio regime, flow anomaly, investor structure, capacity.

### Faz 3 — Entity Graph + Social Retrieval
Query expansion, title/body/semantic retrieval, echo/staleness kontrolü.

**Gate:** THF-003 geçer.

### Faz 4 — Event Fusion
Temporal/event correlation, evidence level, causality guard.

**Gate:** THF-001/002/004/006 geçer.

### Faz 5 — Action Engine
Risk profile matrix, action types, sizing, invalidation/re-entry, incomplete-data blocking.

**Gate:** THF-007/008 geçer.

### Faz 6 — Time-Sliced Golden Replay
23 Temmuz → Temmuz sonu → 6 Ağustos → 7 Ağustos post-validation.

**Gate:** no-look-ahead + deterministic replay.

### Faz 7 — False Positive / Calibration
Negatif vaka seti, threshold tuning, confidence calibration.

### Faz 8 — Dry-run / Shadow Mode
Gerçek yatırım akışında alarm ve aksiyon önerisi üretir; otomatik işlem yapmaz.

### Faz 9 — Production Recommendation Mode
Yalnız ayrıca onaylanırsa canlı rapora girer. Otomatik brokerage/trade execution bu plan kapsamında değildir.

---

## 21. Definition of Done

Remediation ancak şu koşullar sağlandığında tamamlanmış sayılır:

- THF kullanıcı söylemeden candidate olabilir
- manager migration tespit edilir
- portföy rejim değişimi tespit edilir
- fiyat etkisinden arındırılmış akış hesaplanır
- Reddit başlığında THF geçmeden ilgili gönderi bulunur
- sosyal sinyal kesin kanıttan ayrılır
- event fusion çalışır
- 6 Ağustos replay’inde 7 Ağustos verisi kullanılmaz
- tüm yatırım incelemeleri risk profiline göre action matrix üretir
- eksik veride conviction düşer veya action bloke olur
- sizing, invalidation ve re-entry tanımlanır
- false-positive testleri geçer
- docs/ADR/CHANGELOG/test matrix günceldir
- `main`e hiçbir yatırım pipeline değişikliği merge edilmemiştir

---

## 22. Kapsam dışı

Bu plan:
- otomatik emir göndermez
- aracı kurum entegrasyonu yapmaz
- kullanıcı adına işlem yapmaz
- `main`e merge yapmaz
- yeni genel amaçlı DeepResearch motoru yazmaz
- sosyal medyayı kesin kanıt kabul etmez
- future data leakage’e izin vermez
- THF’ye özel hard-coded tek kullanımlık çözüm üretmez

THF yalnızca **golden regression case** olacaktır; düzeltmeler varlık-agnostik yapılacaktır.

---

## 23. Uygulama öncesi checklist

- [ ] Kullanıcının açık ve yazılı uygulama onayı var.
- [ ] Canonical investment branch canlı doğrulandı.
- [ ] `main` write/merge guard doğrulandı.
- [ ] Holding PR varsa draft/open/unmerged doğrulandı.
- [ ] Dokümantasyon path/ADR numbering audit edildi.
- [ ] THF fixture as-of tarihleri sabitlendi.
- [ ] Look-ahead yasağı test tasarımına işlendi.
- [ ] Source coverage contract kabul edildi.
- [ ] Risk-profile action contract kabul edildi.
- [ ] False-positive test seti hazır.
- [ ] Her fazın gate’i tanımlı.

Bu checklist tamamlanmadan implementation başlamaz.

---

## 24. Karar

**Mevcut durum:** PLANLANDI VE DOKÜMANTE EDİLDİ.  
**Uygulama durumu:** BAŞLATILMADI.  
**Beklenen sonraki olay:** Kullanıcının açık ve yazılı uygulama onayı veya plan revizyon talebi.
