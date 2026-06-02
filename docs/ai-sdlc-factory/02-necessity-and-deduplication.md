# 02 — Gereklilik ve Tekrar Ayıklama

Bu doküman, hangi yapıların gerçekten gerekli olduğunu ve birbirinin yerine geçen yapıların nasıl ayrıştırılacağını tanımlar.

Amaç:

```text
Tam kapsamlı çekirdek kurmak
ama aynı sorumluluğu taşıyan iki ayrı katman yaratmamak
```

## 1. Nihai karar tablosu

| Yapı | Karar | Gerekçe |
|---|---|---|
| Skill | Gerekli | Verilen skill ekosisteminin ana değer birimi. |
| Tool | Gerekli | Agent’ın dış dünyada işlem yapması için gerekir. |
| Plugin | Çıkarıldı | Dağıtım/paketleme katmanı; şu an ihtiyaç değil. |
| Agent | Gerekli | Rol, sorumluluk, çıktı ve review sahipliği için gerekir. |
| Sub-agent | Gerekli ama sınırlı | Dar, izole, tekrarlı uzmanlık için gerekir. |
| Team Lead | Gerekli | Global orkestrasyon ve rework routing için gerekir. |
| Her team için ayrı lead | Çıkarıldı | Stage owner agent’lar yeterlidir. |
| Team | Gerekli ama pasif | Ownership, policy ve review boundary için gerekir. |
| Pipeline | Gerekli | Stage graph, gate ve rework için gerekir. |
| Policy | Gerekli | Prompt’tan üstün deterministik kontrol için gerekir. |
| Evidence | Gerekli | No-human governance için gerekir. |
| Trace | Gerekli | Denetlenebilirlik ve debugging için gerekir. |

## 2. Skill vs Agent

```text
Skill = yöntem
Agent = rol
```

Yanlış:

```text
verification-loop agent olsun
prism agent olsun
sentinel agent olsun
```

Doğru:

```text
verification-loop = skill
bug_hunter_subagent = verification-loop skill’ini kullanan worker

prism = brainstorming skill
requirements_agent / llm_council / sentinel = prism’i kullanan roller

sentinel = premortem / adversarial foresight skill
security_architect_agent veya risk_review_agent = sentinel’i kullanan rol
```

## 3. Skill vs Tool

```text
Skill = nasıl düşüneceğim / hangi yöntemi uygulayacağım?
Tool  = hangi işlemi çalıştıracağım?
```

Örnek:

```text
verification-loop = bug bulma protokolü
repo_diff_reader = diff okuyan tool
test_runner = test çalıştıran tool
defect_tracker = bulgu kaydeden tool
```

Skill tool değildir; tool da skill değildir.

## 4. Agent vs Sub-agent

```text
Agent = sonuçtan sorumlu ana rol
Sub-agent = dar, izole ve uzmanlaşmış görev worker’ı
```

Sub-agent açmak için karar kriteri:

Bir iş için aşağıdakilerden en az ikisi sağlanmalıdır:

1. Ayrı context gerekiyor.
2. Ayrı tool permission gerekiyor.
3. Paralel çalışabilir.
4. Çıktısı ayrı doğrulanabilir.
5. Tekrarlanan uzmanlık işi.
6. Ana agent context’ini kirletir.

Örnek iyi sub-agent’lar:

```text
bug_hunter_subagent
threat_modeling_subagent
api_design_subagent
data_model_subagent
test_generation_subagent
security_scan_interpreter_subagent
skill_semantic_extractor_subagent
evidence_trace_subagent
```

Örnek gereksiz sub-agent’lar:

```text
readme_fix_subagent
small_refactor_subagent
minor_copy_edit_subagent
simple_file_writer_subagent
```

## 5. Team vs Agent

```text
Team = ownership/policy boundary
Agent = çalışan rol
```

Yanlış:

```text
Security Team çalışır.
```

Doğru:

```text
security_architect_agent çalışır.
security_team bu agent’ın sorumluluk sınırını belirtir.
```

Team’in işi:

```text
hangi stage’lerin sahibi kim?
hangi agent hangi discipline içinde?
hangi gate’i kim bloklar?
bağımsız review nasıl korunur?
```

## 6. Team Lead vs Team Lead çoğalması

Tek global Team Lead kalır.

Yanlış:

```text
architecture_team_lead_agent
security_team_lead_agent
qa_team_lead_agent
release_team_lead_agent
```

Doğru:

```text
team_lead_orchestrator = global akış yöneticisi
architecture_agent = architecture stage owner
security_architect_agent = security stage owner
qa_lead_agent = verification stage owner
release_manager_agent = release candidate stage owner
```

Bu modelde stage owner’lar kendi alanlarının lideridir ama ayrı team lead katmanı oluşturmaz.

## 7. Team Lead vs Pipeline

```text
Team Lead = orkestratör
Pipeline = deterministik stage graph
```

Team Lead pipeline yerine geçmez.

Team Lead:

```text
hangi stage çalışacak?
hangi agent görevlendirilecek?
hangi skill aktive edilecek?
fail olursa hangi rework route kullanılacak?
```

Pipeline:

```text
stage sırası
input/output sözleşmesi
gate
rework route
evidence zorunluluğu
```

Team Lead süper agent değildir. Pipeline ve Policy tarafından sınırlandırılır.

## 8. Pipeline vs Agent akışı

Pipeline chat akışı değildir. Agent’ların kendi aralarında rastgele konuşması pipeline sayılmaz.

Doğru model:

```text
Pipeline stage başlar
→ owner agent çağrılır
→ gerekirse sub-agent çağrılır
→ skill aktive edilir
→ tool kullanılacaksa permission kontrol edilir
→ output üretilir
→ reviewer/policy gate çalışır
→ evidence yazılır
→ pass/fail route seçilir
```

## 9. Plugin neden çıkarıldı?

Plugin şu an ihtiyaç değildir çünkü:

```text
biz skill paketlerini okuyabiliyoruz
biz tool registry tanımlayabiliyoruz
biz agent contract yazabiliyoruz
biz dış dağıtım/marketplace istemiyoruz
```

Plugin ileride tekrar gündeme alınacaksa sadece şu amaçlarla alınır:

```text
başka sistemlere dağıtım
external app connector packaging
marketplace / installable extension
versioned third-party distribution
```

Ancak mevcut çekirdekte yoktur.

## 10. Kalan çekirdek

Sade ve tam çekirdek:

```text
AI SDLC Factory
├── Team Lead / Orchestrator
├── Teams
├── Agents
├── Sub-agents
├── Skills
├── Tools
├── Pipeline
├── Policy Engine
├── Evidence Graph
└── Trace Log
```

## 11. Anti-pattern listesi

Aşağıdakiler yasaktır:

```text
Plugin registry’yi çekirdeğe geri sokmak
Her team için lead agent açmak
Skill’i agent gibi modellemek
Tool’u skill gibi modellemek
Team’i çalışan runtime object yapmak
Pipeline’ı LLM sohbet akışına dönüştürmek
Team Lead’e policy bypass yetkisi vermek
Sub-agent patlaması yaratmak
Evidence olmadan gate pass etmek
Verification-loop’u genel readiness checklist yapmak
Prism’i bug finding skill olarak kullanmak
```

## 12. Kabul kriterleri

Bu dedup modeli doğru uygulanmış sayılırsa:

```text
AGENT_CATALOG içinde plugin referansı olmayacak.
TEAM_CATALOG içinde ayrı team lead agent’ları olmayacak.
Skill-agent ayrımı korunacak.
Sub-agent sayısı gerekçeli olacak.
Pipeline stage owner’ları agent olacak, team olmayacak.
Policy gate bypass kuralı olmayacak.
Evidence zorunluluğu korunacak.
```
