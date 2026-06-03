# 05 — Shared Registry and Usage Mapping

Bu doküman, ortak kullanılan tüm kategorilerin hem ortak registry’de hem de kullanıldığı bağlamda gösterilmesi kuralını tanımlar.

## 1. Ana kural

Ortak kullanılan bir öğe iki yerde görünmelidir:

```text
1. Shared Registry içinde: sistemde mevcut olduğu için
2. Kullanıldığı pipeline/team/agent/stage altında: kullanım ilişkisi için
```

Bu tekrar sahiplik anlamına gelmez. Bu tekrar kullanım ilişkisini görünür kılar.

## 2. Kapsam

Bu kural sadece Skills için değil, tüm ortak kategoriler için geçerlidir.

```text
Core Abilities
Skills
Tools
Governance Profiles
Audit Schemas
Model / Provider Profiles
Context / Memory Profiles
```

## 3. Shared Registry neyi gösterir?

Shared Registry şu soruyu cevaplar:

```text
Sistemde ne var?
```

Örnek:

```text
Shared Registry
├── Core Abilities
│   ├── Supervisor
│   ├── Coder
│   ├── Vision
│   ├── Audio
│   ├── Creative
│   ├── Memory
│   ├── Web
│   └── OS
│
├── Skills
│   ├── prism
│   ├── verification-loop
│   ├── sentinel
│   └── llm-council
│
├── Tools
│   ├── file_read
│   ├── shell_exec
│   ├── web_fetch
│   └── test_runner
│
├── Governance Profiles
├── Audit Schemas
├── Model / Provider Profiles
└── Context / Memory Profiles
```

## 4. Usage mapping neyi gösterir?

Usage mapping şu soruyu cevaplar:

```text
Kim / hangi pipeline / hangi stage / hangi agent neyi kullanıyor?
```

Örnek:

```text
SDLC Pipeline
└── Requirements Stage
    └── Requirements Agent
        ├── uses Core Abilities:
        │   ├── Memory
        │   └── Web
        ├── uses Skills:
        │   ├── prism
        │   ├── prompt-fidelity
        │   └── gap-audit
        ├── uses Tools:
        │   ├── artifact_writer
        │   └── evidence_writer
        ├── uses Governance:
        │   └── requirements_governance_profile
        ├── uses Audit:
        │   └── requirements_evidence_schema
        ├── uses Model / Provider Profiles:
        │   └── text_reasoning_profile
        └── uses Context / Memory Profiles:
            └── requirements_context_pack
```

## 5. Neden iki yerde gösteriyoruz?

Çünkü iki farklı bilgi türü vardır:

```text
Registry = sahiplik / varlık bilgisi
Usage = kullanım / bağımlılık bilgisi
```

Yanlış:

```text
Skill shared registry’de var, o yüzden pipeline altında tekrar yazmayalım.
```

Doğru:

```text
Skill shared registry’de var.
Ayrıca kullanıldığı stage/agent altında uses Skills bölümünde tekrar görünür.
```

## 6. Tüm shared kategoriler için örnek

```text
Architecture Agent
├── uses Core Abilities:
│   ├── Coder
│   ├── Memory
│   └── Web
├── uses Skills:
│   ├── prism
│   ├── sentinel
│   ├── llm-council
│   └── adr-builder
├── uses Tools:
│   ├── diagram_generator
│   └── artifact_writer
├── uses Governance:
│   ├── architecture_governance_profile
│   └── adr_required_gate
├── uses Audit:
│   ├── architecture_evidence_schema
│   └── decision_trace_schema
├── uses Model / Provider Profiles:
│   └── architecture_reasoning_profile
└── uses Context / Memory Profiles:
    └── architecture_context_pack
```

## 7. Skill alt kırılımı ana hiyerarşide gösterilmez

Skill paketleri kendi içinde dosya ve kaynaklar içerebilir. Ancak ana hiyerarşik modelde yalnız skill adı gösterilir.

Doğru:

```text
Skills
  - prism
  - verification-loop
  - sentinel
```

Yanlış:

```text
Skills
  - prism
    - SKILL.md
    - scripts/
    - references/
```

Bu ayrıntılar skill inventory / audit dokümanında kalır.

## 8. Core Ability alt tool’ları

Core Ability ana hiyerarşide adıyla görünür. Alt tool’lar tool registry’de ve kullanım yerinde görünür.

Örnek:

```text
Core Abilities
  - Web

Tools
  - web_search
  - web_fetch
  - web_scrape

Research Agent
  uses Core Abilities:
    - Web
  uses Tools:
    - web_search
    - web_fetch
```

## 9. Governance özel durumları

Governance ortak registry’de profiller olarak görünür. Kullanıldığı pipeline/stage/team altında tekrar gösterilir.

Örnek:

```text
Governance Registry
  - global_no_secret_policy
  - sdlc_development_completion_governance
  - verification_loop_bug_gate

SDLC Pipeline
  uses Governance:
    - global_no_secret_policy
    - sdlc_development_completion_governance

Verification Loop Stage
  uses Governance:
    - verification_loop_bug_gate
```

## 10. Audit özel durumları

Audit ortak registry’de evidence/trace şemaları olarak görünür. Kullanıldığı yerde tekrar gösterilir.

Örnek:

```text
Audit Registry
  - gate_decision_trace_schema
  - bug_finding_evidence_schema
  - release_evidence_schema

Bug Finding Stage
  uses Audit:
    - bug_finding_evidence_schema
    - gate_decision_trace_schema
```

## 11. Model / Provider özel durumları

Core Abilities kendi model/provider profillerine sahip olabilir. Bu profiller shared registry’de görünür ve kullanıldığı Core Ability altında tekrar gösterilir.

Örnek:

```text
Model / Provider Registry
  - supervisor_routing_model
  - coder_engineering_model
  - vision_model

Coder
  uses Model / Provider Profiles:
    - coder_engineering_model
```

## 12. Context / Memory özel durumları

Context ve Memory profilleri shared registry’de görünür, pipeline run ve agent altında tekrar gösterilir.

Örnek:

```text
Context / Memory Registry
  - sdlc_run_context
  - requirements_context_pack
  - architecture_context_pack

SDLC Pipeline Run
  uses Context / Memory Profiles:
    - sdlc_run_context

Requirements Agent
  uses Context / Memory Profiles:
    - requirements_context_pack
```

## 13. Kısa karar

```text
Shared Registry: ne var?
Usage Mapping: kim neyi kullanıyor?
```

Tüm ortak kategoriler için ikisi de gerekir.

Bu kural şu kategorilerin tamamına uygulanır:

```text
Core Abilities
Skills
Tools
Governance Profiles
Audit Schemas
Model / Provider Profiles
Context / Memory Profiles
```
