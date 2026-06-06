# 01 — Çekirdek Tanımlar

> **Namespace correction:** Bu doküman ilk oluşturulduğunda “AI SDLC Factory” diliyle yazılmıştı. Güncel canonical kapsam **Nexus AI Orchestration Model**’dir. SDLC yalnızca bu üst model altındaki pipeline türlerinden biridir. Bu dokümandaki kavram ayrımları Nexus AI üst standartları olarak okunmalıdır.

Bu doküman, Nexus AI Orchestration Model içinde kullanılacak temel kavramları birbirinden ayırır. Amaç, aynı işi yapan iki ayrı yapı oluşturmamak ve her yapı için net sorumluluk belirlemektir.

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

```text
requirements_agent
architecture_agent
security_validation_agent
qa_agent
release_manager_agent
```
