# 02 — Gereklilik ve Tekrar Ayıklama

> **SUPERSEDED / LEGACY NOTICE.** Bu doküman erken tasarım döneminden kalmıştır. İçindeki bazı ifadeler, özellikle `Team Lead`, team yapısı ve üst kapsam dili, güncel Nexus AI Orchestration Model tarafından supersede edilmiştir.
>
> Güncel canonical kapsam:
>
> ```text
> Nexus AI Orchestration Model
> ```
>
> Güncel üst kavramlar:
>
> ```text
> Mission System
> Shared Registry System
> Pipeline System
> Team System
> Core Abilities Layer
> Skills and Tools Layer
> Coordination System
> Governance System
> Audit System
> Runtime Execution Boundary
> Post-Launch Frontier Backlog
> ```
>
> Bu dosya yalnız tarihsel gerekçe/provenance için okunmalıdır. Uyuşmazlık durumunda `docs/nexus-ai-orchestration-model/README.md`, `docs/ai-sdlc-factory/README.md`, `configs/nexus-ai/*.yaml` ve güncel `.memory/0005-current-status-and-bootstrap.md` geçerlidir.

Bu doküman, hangi yapıların neden gerektiğini ve birbirinin yerine geçen yapıların nasıl ayrıştırıldığını erken aşama açısından açıklar.

## 1. Tarihsel karar tablosu

| Yapı | Erken karar | Güncel not |
|---|---|---|
| Skill | Gerekli | Hâlâ geçerli; yöntem/protokol katmanıdır. |
| Tool | Gerekli | Hâlâ geçerli; çağrılabilir operasyon katmanıdır. |
| Plugin | Çıkarıldı | Hâlâ geçerli; plugin registry yok. |
| Agent | Gerekli | Hâlâ geçerli; rol/sorumluluk/output/yetki sınırı taşır. |
| Sub-agent | Gerekli ama sınırlı | Hâlâ geçerli; dar ve doğrulanabilir görevler için. |
| Team Lead | Gerekli | Güncel modelde pipeline/team/mission bağlamlıdır; Supervisor değildir. |
| Her team için ayrı lead | Erken taslakta çıkarıldı | Güncel model bunu supersede eder: Team → Team Lead → Agents → Sub-agents hiyerarşisi korunur. |
| Team | Gerekli ama pasif | Hâlâ geçerli; ownership/policy/review boundary. |
| Pipeline | Gerekli | Hâlâ geçerli; fakat SDLC sadece bir pipeline’dır. |
| Mission | Erken tabloda yoktu | Güncel modelde kullanıcı hedefinden doğan üst çalışma kabıdır. |
| Coordination System | Erken tabloda yoktu | Güncel modelde agent çalışma desenlerini tanımlar. |
| Policy | Gerekli | Governance ailesi altında. |
| Evidence | Gerekli | Audit ailesinde karar kanıtı. |
| Trace | Gerekli | Audit ailesinde işlem geçmişi. |

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
```
