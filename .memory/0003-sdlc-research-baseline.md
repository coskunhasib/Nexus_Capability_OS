# 0003 — SDLC Research Baseline

Bu dosya, sohbetin başında yapılan yazılım geliştirme döngüsü / standartlar araştırmasının repo-safe hafızasıdır.

## Amaç

Kullanıcının hedefi, sıfırdan ürün seviyesine kadar yazılım geliştirme sürecindeki tüm standart ve kuralları AI sistemlerine uygulatmaktır.

Bu araştırma sonucunda SDLC, Nexus AI altındaki pipeline türlerinden biri olarak konumlandı.

## Ana standart aileleri

Araştırmada dikkate alınan ana referans aileleri:

```text
ISO/IEC/IEEE 12207 — yazılım yaşam döngüsü
ISO/IEC/IEEE 15288 — sistem yaşam döngüsü
ISO/IEC/IEEE 29148 — requirements engineering
ISO/IEC/IEEE 42010 — architecture description
ISO/IEC 25010 — software product quality model
ISO/IEC 5055 — source code quality measurement
ISO/IEC/IEEE 29119 — software testing
IEEE 1012 — verification and validation
ISO/IEC/IEEE 15289 — lifecycle documentation
ISO/IEC/IEEE 26514 — user documentation
ISO/IEC 27001 — information security management
NIST SSDF SP 800-218 — secure software development
OWASP ASVS / MASVS / API Security — application security verification
NIST CSF / CIS Controls — cybersecurity program controls
SLSA / SBOM / SPDX / CycloneDX — supply chain security
WCAG 2.2 — accessibility
ISO 9241-210 — human-centered design
ISO 31000 — risk management
ISO 9001 / ISO 90003 — quality management for software
```

## Ürün seviyesinde SDLC çekirdeği

Araştırmada SDLC için gerekli ana alanlar:

```text
Product / business analysis
Requirements engineering
Architecture
UX / human-centered design
Coding standards
Code review
Testing
Security
Privacy / data governance
Dependency / supply chain management
CI/CD
Release management
Operations / SRE
Documentation
Compliance
Risk management
Evidence / traceability
```

## Pratik ürünleştirme standartları

Gemini çıktısı sonrası eklenmesi gereken pratik başlıklar:

```text
Project skeleton
Diagram-as-code
Critical algorithm design notes / pseudocode
Reproducible developer environment
Dependency locking
No silent install / no silent mutation
Long-running process feedback
Execution summary
Offline / air-gapped support when required
Resource budgets
Real-time classification when relevant
Hardware awareness
Documentation synchronization
Language-specific formatter / linter / style guide
```

## Önemli düzeltilen riskli ifadeler

Yanlış veya fazla iddialı ifadeler:

```text
Mermaid iki dosya halinde standarttır.
Silent install iyi pratiktir.
Her fonksiyon unit test edilmeli.
Production için yazılım hatasız olmalı.
Python type hint dil seviyesinde zorunludur.
Offline çalışma evrensel standarttır.
Edge computing’de her zaman deterministik çalışma zorunludur.
Python AI için tek endüstri standardıdır.
```

Doğru yorum:

```text
Mermaid bir diagram-as-code seçeneğidir.
Runtime’da habersiz dependency kurulumu güvenlik riskidir.
Test kapsamı risk ve davranış bazlı olmalıdır.
Production hedefi sıfır hata değil, kabul edilebilir artık risk + evidence + rollback’tir.
Type hint ürün standardı olarak zorunlu tutulabilir ama Python dilinde zorunlu değildir.
Offline çalışma ürün bağlamına göre gereksinimdir.
Determinism sadece real-time/safety-critical bağlama göre zorunlu olur.
Python AI/ML için yaygındır ama üretimde başka runtime/diller kullanılabilir.
```

## SDLC pipeline için kritik alanlar

SDLC Pipeline eksiksiz sayılmadan önce aşağıdaki stage/gate aileleri kapsanmalıdır:

```text
Intake
Domain / risk profile
Skill semantic extraction
Requirements
Requirements review
Architecture
Architecture review
Security / privacy design
Premortem / FMEA
Planning
Implementation
Code review
Test generation
Test execution
Verification-loop bug finding
Security validation
Performance / resilience
Operations readiness
Evidence graph build
Development completion
Release candidate
Refraction / learning
```

## SDLC için no-human governance ilkesi

İnsan yazılım geliştirme işini yapmayacağı için SDLC’de her geçiş şu temele dayanmalıdır:

```text
agent output
+ deterministic gates
+ evidence
+ trace
+ policy
= machine-verifiable stage decision
```

## SDLC'de özellikle eksik kalmaması gereken noktalar

```text
Requirements traceability
NFR coverage
Architecture decision records
Threat model
Privacy/data inventory
Risk register
Test strategy
Verification-loop defect sweep
Security scanner interpretation
Supply chain/SBOM/license coverage
Performance/resource budget
Observability/runbook/rollback
Development completion gate
Release candidate evidence
Post-run learning/refraction
```

## Açık uyarı

SDLC tarafı çok önemli. Bu yüzden SDLC Pipeline yalnızca birkaç high-level aşama olarak geçilemez. Coverage matrix ile doğrulanmalıdır.
