# 01 — Çekirdek Tanımlar

Bu doküman, AI SDLC Factory içinde kullanılacak temel kavramları birbirinden ayırır. Amaç, aynı işi yapan iki ayrı yapı oluşturmamak ve her yapı için net sorumluluk belirlemektir.

## 1. Skill

**Tanım:** Skill, bir agent’ın belirli bir işi nasıl düşüneceğini, nasıl analiz edeceğini, hangi yöntemi uygulayacağını ve gerekirse hangi script/reference/assets kaynaklarını kullanacağını belirleyen yetenek paketidir.

Skill şu bileşenlerden oluşabilir:

```text
SKILL.md
scripts/
references/
assets/
diğer yardımcı dosyalar
```

Skill’in görevi:

```text
yöntem sağlamak
analiz lensi sağlamak
doğrulama protokolü sağlamak
karar veya üretim standardı sağlamak
script/reference/assets ile desteklemek
```

Skill’in görevi olmayan şeyler:

```text
runtime rol olmak
takım olmak
policy gate’i bypass etmek
kendiliğinden release onayı vermek
```

Örnekler:

```text
prism = brainstorming / divergent thinking skill
verification-loop = bug / defect finding skill
llm-council = çok perspektifli karar değerlendirme skill’i
sentinel = premortem / adversarial foresight skill’i
adr-builder = architecture decision record üretme skill’i
```

## 2. Tool

**Tanım:** Tool, agent’ın çağırabileceği, dış dünyada veya çalışma ortamında somut işlem yapan bir fonksiyondur.

Tool örnekleri:

```text
repo_reader
repo_writer
test_runner
scanner_runner
artifact_writer
evidence_reader
diagram_generator
policy_query
```

Skill ile tool ayrımı:

```text
Skill = ne yöntemiyle düşüneceğim?
Tool  = hangi işlemi çağıracağım?
```

Örnek:

```text
verification-loop = bug bulma metodolojisi
test_runner = test çalıştıran tool
repo_diff_reader = diff okuyan tool
defect_tracker = bulgu kaydeden tool
```

## 3. Agent

**Tanım:** Agent, belirli bir role, sorumluluğa, output’a, yetki sınırına ve review ilişkisine sahip yapay ekip üyesidir.

Agent şu sorulara cevap verir:

```text
Görevi ne?
Hangi takım sınırı içinde?
Hangi input’ları alır?
Hangi skill’leri kullanır?
Hangi tool’ları çağırabilir?
Ne üretir?
Kim review eder?
Neleri asla yapamaz?
Hangi gate’i bloklayabilir?
```

Örnek agent:

```yaml
id: architecture_agent
team: architecture_team
mission: Gereksinimlere ve kalite hedeflerine uygun mimariyi üretir.
inputs:
  - REQUIREMENTS_SPEC.md
  - NFR_CATALOG.md
skills:
  - prism
  - llm-council
  - sentinel
  - adr-builder
tools:
  - diagram_generator
  - artifact_writer
outputs:
  - ARCHITECTURE.md
  - ADR_INDEX.md
reviewed_by:
  - security_architect_agent
  - tech_lead_agent
forbidden:
  - approve_own_work
  - production_deploy
  - secret_read
```

## 4. Sub-agent

**Tanım:** Sub-agent, bir ana agent’ın altında çalışan dar, izole ve uzman görev birimidir.

Sub-agent şu durumlarda açılır:

```text
ayrı context gerekiyorsa
ayrı tool permission gerekiyorsa
paralel çalışabiliyorsa
çıktısı ayrı doğrulanabiliyorsa
tekrarlanan uzmanlık işi ise
ana agent context’ini kirletiyorsa
```

Örnek:

```yaml
id: bug_hunter_subagent
parent_agent: qa_lead_agent
mission: verification-loop skill’iyle bug/defect sweep yürütür.
skills:
  - verification-loop
tools:
  - repo_diff_reader
  - test_runner
  - defect_tracker
outputs:
  - BUG_FINDING_REPORT.json
  - BUG_FINDING_REPORT.md
returns_to:
  - qa_lead_agent
blocks_release_when:
  - open_blocker_bug_count > 0
```

Sub-agent ana agent’ın yerine geçmez. Dar çıktı üretir, sonucu parent agent’a döndürür.

## 5. Team Lead / Orchestrator

**Tanım:** Team Lead, tüm pipeline akışını yöneten orkestrasyon agent’ıdır. İş yapan değil, işi yöneten roldür.

Yapabilecekleri:

```text
pipeline seçmek
stage owner atamak
handoff paketi üretmek
rework routing yapmak
policy durumunu sorgulamak
evidence durumunu kontrol etmek
```

Yapamayacakları:

```text
kod yazmak
kendi kararını onaylamak
policy gate bypass etmek
production deploy yapmak
secret okumak
```

Team Lead tek global orkestratör olarak tasarlanır. Her team için ayrı lead agent oluşturulmaz.

## 6. Team

**Tanım:** Team, aktif çalışan runtime nesnesi değildir. Ownership, policy, sorumluluk ve review sınırı tanımlar.

Örnek:

```yaml
id: security_risk_team
agents:
  - security_architect_agent
  - threat_modeling_subagent
  - security_tester_agent
owns_stages:
  - security_privacy_design
  - security_validation
blocks:
  - critical_security_finding
  - missing_threat_model
```

Team’in görevi:

```text
sorumluluk alanı çizmek
hangi agent’ların aynı disiplinde olduğunu göstermek
bağımsız review sınırı sağlamak
policy ownership belirlemek
```

## 7. Pipeline

**Tanım:** Pipeline, sıralı liste değil, stage graph’tır.

Her stage şunları tanımlar:

```text
owner_agent
sub_agents
inputs
skills
tools
outputs
gates
on_pass
on_fail
rework_route
evidence_required
```

Pipeline deterministic olmalıdır. Team Lead pipeline üzerinde route seçer ama gate bypass edemez.

## 8. Policy

**Tanım:** Policy, LLM/agent kararlarının üzerinde çalışan deterministik yönetişim katmanıdır.

Temel kurallar:

```text
Prompt policy yerine geçmez.
Agent kendi çıktısını onaylayamaz.
Reviewer kod yazamaz.
Evidence yoksa gate pass olamaz.
Critical/high security finding varsa release bloklanır.
Blocker bug varsa release bloklanır.
```

## 9. Evidence

**Tanım:** Evidence, no-human governance için her kararın dayandığı kanıt kaydıdır.

Evidence şunları içerir:

```text
input hash
output hash
producer agent
stage id
skill/tool kullanımı
gate sonucu
trace id
related requirement id
related risk id
```

Evidence graph şu zinciri kurar:

```text
Requirement → Design → Implementation → Test → Security → Gate → Release Candidate
```

## 10. Trace

**Tanım:** Trace, agent/tool/skill çağrılarının ve kararlarının denetlenebilir işlem kaydıdır.

Trace evidence değildir ama evidence’ın nasıl üretildiğini gösterir.

```text
Trace = ne oldu?
Evidence = hangi kanıt kararı destekliyor?
```

## Kısa ayrım tablosu

| Kavram | Ne demek? | Çalışır mı? | Örnek |
|---|---|---:|---|
| Skill | Yöntem/yetenek paketi | Hayır / destekleyici | prism, verification-loop |
| Tool | Çağrılabilir işlem | Evet | test_runner |
| Agent | Rol sahibi worker | Evet | architecture_agent |
| Sub-agent | Dar uzman worker | Evet | bug_hunter_subagent |
| Team Lead | Orkestratör | Evet | team_lead_orchestrator |
| Team | Ownership boundary | Hayır | security_team |
| Pipeline | Stage graph | Evet / kontrol akışı | product_sdlc_graph |
| Policy | Deterministik kural | Evet | no_self_approval |
| Evidence | Kanıt kaydı | Hayır / veri | TEST_REPORT.json |
| Trace | İşlem kaydı | Hayır / veri | run trace |
