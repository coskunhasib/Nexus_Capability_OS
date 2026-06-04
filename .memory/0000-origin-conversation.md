—> Yazılım geliştirmede(sıfırdan ürün seviyesine dek) uyulması gereken tüm geliştirme standartları ve kurallarını listele. Dil, alan vb şeylere göre değişiyorsa belirt



“””

Aşağıdaki listeyi “sıfırdan ürün seviyesine çıkan bir yazılım için uygulanacak standart seti” olarak düşünebilirsin. Tek bir evrensel zorunlu standart yoktur; zorunluluk ürünün alanına, ülkesine, müşteri sözleşmesine, veri tipine, risk seviyesine ve kullanılan teknolojiye göre değişir. Ama ürün seviyesinde ciddiye alınması gereken çekirdek küme şudur: yaşam döngüsü + gereksinim + mimari + kalite + test + güvenlik + tedarik zinciri + operasyon + uyumluluk.

1. Ana standart aileleri

Katman

Ne için kullanılır?

Önerilen standart / referans

Yazılım yaşam döngüsü

Yazılımın edinim, geliştirme, işletim, bakım ve emeklilik süreçlerini tanımlamak

ISO/IEC/IEEE 12207 yazılım yaşam döngüsü süreçleri için ortak çerçeve sunar; 2026 sürümü yazılım ürün ve hizmetlerinin geliştirme, işletim, bakım ve elden çıkarma süreçlerini kapsar.

Sistem yaşam döngüsü

Yazılımın donanım, insan, süreç, cihaz, servis gibi sistem parçalarıyla birlikte yönetilmesi

ISO/IEC/IEEE 15288:2023, sistemlerin tam yaşam döngüsü için ortak süreç çerçevesi sağlar.

Gereksinim mühendisliği

İş, kullanıcı, sistem, yazılım ve kalite gereksinimlerinin yazılması ve yönetimi

ISO/IEC/IEEE 29148:2018, sistem ve yazılım gereksinimleri için süreçleri ve bilgi öğelerini tanımlar.

Mimari tanımlama

Mimari kararların, görünümlerin, paydaş kaygılarının ve model ilişkilerinin belgelenmesi

ISO/IEC/IEEE 42010:2022, yazılım, sistem, kurumsal mimari ve sistemler sistemi için mimari tanımı gereksinimlerini verir.

Ürün kalite modeli

“Kaliteli yazılım”ın hangi özelliklerle ölçüleceği

ISO/IEC 25010:2023, ICT ve yazılım ürünleri için dokuz kalite karakteristiğinden oluşan ürün kalite modeli tanımlar.

Kaynak kod kalitesi

Otomatik statik analizle kodun güvenlik, güvenilirlik, performans ve sürdürülebilirlik zafiyetlerini ölçmek

ISO/IEC 5055:2021, kaynak kod düzeyinde iyi mimari ve kodlama pratiklerine aykırılıkların ölçümünü standartlaştırır.

Test

Test süreçleri, dokümantasyonu, teknikleri ve risk temelli test

ISO/IEC/IEEE 29119, yazılım testine ilişkin uluslararası kabul görmüş kavram ve süreçleri kapsar.

Doğrulama ve geçerleme

Sistemin doğru inşa edilmesi ve doğru ihtiyacı karşılaması

IEEE 1012-2024, sistem, yazılım ve donanım yaşam döngüsü boyunca V&V süreçlerini ele alır.

Dokümantasyon

Gereksinim, tasarım, test, operasyon, kullanıcı dokümanı gibi yaşam döngüsü bilgi öğeleri

ISO/IEC/IEEE 15289, sistem ve yazılım yaşam döngüsünde üretilen bilgi/dokümantasyon öğelerinin amaç ve içeriğini tanımlar.

Kullanıcı dokümantasyonu

Yardım dokümanı, kullanım kılavuzu, kullanıcı rehberi

ISO/IEC/IEEE 26514:2022, yazılım kullanıcı bilgisi ve dokümantasyonunun tasarlanması/geliştirilmesi için gereksinimler verir.

Bilgi güvenliği yönetimi

Kurumsal güvenlik yönetim sistemi, politika, risk, denetim

ISO/IEC 27001:2022, ISMS için gereksinimleri tanımlar.

Güvenli yazılım geliştirme

Secure SDLC, güvenli geliştirme pratikleri, zafiyet yönetimi

NIST SSDF SP 800-218, güvenli yazılım geliştirme pratiklerini SDLC’ye entegre etmek için çekirdek uygulamalar sunar.

Uygulama güvenliği

Web, API ve mobil uygulama güvenlik kontrol listeleri

OWASP ASVS 5.0.0 uygulama güvenliği doğrulama gereksinimleri sunar; OWASP MASVS mobil güvenlik için endüstri standardı olarak kullanılır.

Siber güvenlik programı

Kurum seviyesinde siber güvenlik yönetişimi ve risk yönetimi

NIST CSF 2.0 siber güvenlik risk yönetimi için çerçeve sağlar; CIS Controls v8.1 önceliklendirilmiş teknik ve yönetsel savunma kontrolleri verir.

Tedarik zinciri güvenliği

Bağımlılık, build, artifact, provenance, SBOM

SLSA v1.2, tedarik zinciri güvenliğini kademeli olarak iyileştirmek için seviyeler tanımlar; CycloneDX ve SPDX / ISO/IEC 5962 SBOM formatlarıdır.

Erişilebilirlik

Engelli kullanıcılar dahil herkesin ürünü kullanabilmesi

WCAG 2.2, web içeriğini erişilebilir yapmak için W3C önerisidir; A, AA, AAA başarı kriterleri vardır.

İnsan merkezli tasarım

UX araştırması, kullanıcı ihtiyacı, kullanılabilirlik

ISO 9241-210, etkileşimli sistemler için insan merkezli tasarım ilkelerini ve yaşam döngüsü aktivitelerini tanımlar.

Risk yönetimi

Teknik, ürün, operasyonel, güvenlik, yasal risklerin sistematik yönetimi

ISO 31000:2018, riskleri belirleme, analiz etme, değerlendirme, işleme, izleme ve iletişim için ilkeler sunar.

Kalite yönetimi

Kurumsal kalite sistemi, sürekli iyileştirme, müşteri beklentisi

ISO 9001:2015 kalite yönetim sistemi standardıdır; ISO/IEC/IEEE 90003:2018 ISO 9001’in yazılım geliştirme, işletim ve bakım süreçlerine uygulanmasına rehberlik eder.

2. Ürün geliştirme boyunca uyulacak çekirdek kurallar

2.1 Ürün ve iş analizi kuralları

Her ürün için önce problem, hedef kullanıcı, değer önerisi, başarı metriği ve kapsam netleşmelidir. Ürün fikri “özellik listesi” olarak değil, ölçülebilir kullanıcı problemi olarak yazılmalıdır.

Uyulması gerekenler:

	1	Problem tanımı yapılmalı.

	2	Hedef kullanıcı/persona belirlenmeli.

	3	Kullanım senaryoları yazılmalı.

	4	İş hedefleri ölçülebilir olmalı: gelir, maliyet düşüşü, dönüşüm oranı, işlem süresi, hata azalması gibi.

	5	MVP kapsamı ile nihai ürün vizyonu ayrılmalı.

	6	Fonksiyonel gereksinimler ve fonksiyonel olmayan gereksinimler ayrı yazılmalı.

	7	Her gereksinimin kabul kriteri olmalı.

	8	Gereksinimler test edilebilir, izlenebilir, önceliklendirilebilir ve değişiklik geçmişi tutulabilir olmalı.

	9	Varsayım, bağımlılık ve riskler ayrıca kaydedilmeli.

	10	“Bitti” tanımı daha başta belirlenmeli.

Fonksiyonel olmayan gereksinimler özellikle unutulmamalı: performans, ölçeklenebilirlik, güvenlik, kullanılabilirlik, erişilebilirlik, uyumluluk, gözlemlenebilirlik, taşınabilirlik, bakım kolaylığı, veri saklama, felaket kurtarma, yedekleme, gizlilik.

2.2 Gereksinim kuralları

Gereksinim yazarken:

	1	Tek gereksinim tek davranışı anlatmalı.

	2	“Hızlı”, “kolay”, “güvenli”, “kullanıcı dostu” gibi belirsiz ifadeler ölçüye çevrilmeli.

	3	Her gereksinimin kaynağı olmalı: müşteri, regülasyon, güvenlik, operasyon, ürün metriği.

	4	Öncelik verilmelidir: Must / Should / Could / Won’t veya benzeri.

	5	Her gereksinimin kabul testi yazılmalı.

	6	Gereksinim değişiklikleri kayıt altına alınmalı.

	7	Yasal ve regülasyon gereksinimleri ürün backlog’undan ayrı izlenmemeli; normal kalite kapılarının parçası olmalı.

	8	Gereksinimden tasarıma, koda, teste ve sürüme izlenebilirlik kurulmalı.

	9	Alan kritikse izlenebilirlik matrisi zorunlu hale getirilmelidir.

	10	Ürün kapsamı “ne yapılacak” kadar “ne yapılmayacak” şeklinde de tanımlanmalı.

2.3 Mimari kuralları

Ürün seviyesinde mimari yalnızca kutu çizimi değildir; kararların gerekçesi ve kalite hedefleriyle birlikte yönetilmelidir.

Uyulması gerekenler:

	1	Mimari karar kayıtları tutulmalı: ADR.

	2	Sistem bağlamı, container/service görünümü, component görünümü ve deployment görünümü belgelenmeli.

	3	Kritik kararların alternatifi ve reddedilme nedeni yazılmalı.

	4	Monolit, modüler monolit, mikroservis, event-driven, serverless gibi seçimler ekip kapasitesi ve operasyon yüküyle birlikte değerlendirilmelidir.

	5	Her servis/modülün sahipliği net olmalı.

	6	Sınırlar açık olmalı: bounded context, API kontratı, veri sahipliği.

	7	Ortak veritabanı üzerinden kontrolsüz entegrasyon yapılmamalı.

	8	Servisler arası iletişimde timeout, retry, circuit breaker, idempotency ve rate limit düşünülmeli.

	9	Kimlik doğrulama, yetkilendirme, audit log ve veri şifreleme mimari seviyede tasarlanmalı.

	10	RTO, RPO, availability, latency, throughput, kapasite ve maliyet hedefleri mimarinin parçası olmalı.

	11	Veri modeli, veri yaşam döngüsü, saklama süresi, arşivleme ve silme politikaları tanımlanmalı.

	12	Tek hata noktaları belirlenmeli.

	13	Kritik dış bağımlılıklar için fallback veya degradation planı olmalı.

	14	API versiyonlama stratejisi belirlenmeli.

	15	Mimari, test edilebilir ve gözlemlenebilir olmalı.

API için:

	•	HTTP API’lerde OpenAPI kullanılmalı; OpenAPI Specification, HTTP API’lerin dil bağımsız biçimde tanımlanmasını sağlar.  

	•	Event-driven veya mesajlaşma tabanlı API’lerde AsyncAPI kullanılmalı; AsyncAPI mesaj odaklı API’leri makine tarafından okunabilir biçimde tanımlamak için kullanılır.  

	•	GraphQL kullanılıyorsa şema, yetkilendirme, query complexity, rate limit ve N+1 sorgu kontrolü ayrı ele alınmalı; GraphQL’in resmi spesifikasyonu tip sistemi, sorgu dili, yürütme semantiği ve doğrulama konularını kapsar.  

2.4 Tasarım ve UX kuralları

	1	Kullanıcı araştırması yapılmalı.

	2	Kullanıcı akışları çizilmeli.

	3	Ekranlar erişilebilirlik kriterlerine göre tasarlanmalı.

	4	Hata mesajları anlaşılır olmalı.

	5	Boş durum, yükleniyor durumu, hata durumu, yetkisiz erişim durumu tasarlanmalı.

	6	Kritik işlemlerde geri alma, onay veya güvenli varsayılan kullanılmalı.

	7	Formlarda validasyon hem istemci hem sunucu tarafında yapılmalı.

	8	Klavye ile kullanım, ekran okuyucu, kontrast, odak sırası ve mobil uyumluluk kontrol edilmeli.

	9	Kullanılabilirlik testi yapılmalı.

	10	Ürün analitiği, mahremiyeti ihlal etmeyecek şekilde tasarlanmalı.

Web ürünlerinde pratik minimum hedef genellikle WCAG 2.2 AA seviyesidir; bazı kamu veya kurumsal sözleşmelerde bu açıkça zorunlu olabilir.

2.5 Kodlama kuralları

Kod kuralları ikiye ayrılır: evrensel kurallar ve dile/ekosisteme özel kurallar.

Evrensel kod kuralları:

	1	Kod okunabilir olmalı.

	2	İsimler açık ve anlamlı olmalı.

	3	Fonksiyonlar tek sorumluluğa yakın olmalı.

	4	Yan etki üreten kod açıkça ayrılmalı.

	5	Karmaşık koşullar sadeleştirilmeli.

	6	Kopyala-yapıştır kod azaltılmalı.

	7	Hata yönetimi standartlaştırılmalı.

	8	Null/none/undefined davranışı açıkça ele alınmalı.

	9	Input validation her güven sınırında yapılmalı.

	10	Output encoding bağlama göre yapılmalı.

	11	Gizli bilgiler koda, loga, hata mesajına veya repoya yazılmamalı.

	12	SQL/NoSQL/LDAP/command injection risklerine karşı parametreli kullanım zorunlu olmalı.

	13	Dosya, ağ, zaman, para, tarih/saat, locale ve encoding işlemleri standart utility veya kütüphanelerle yapılmalı.

	14	Tarih/saat işlemlerinde timezone açık olmalı.

	15	Para işlemlerinde floating point kullanılmamalı.

	16	Eşzamanlılıkta race condition, deadlock, timeout ve cancellation ele alınmalı.

	17	I/O işlemlerinde timeout olmalı.

	18	Retry sınırsız olmamalı; backoff ve jitter kullanılmalı.

	19	Public API geriye uyumluluk dikkate alınarak değiştirilmelidir.

	20	Kod formatı otomatik araçla zorlanmalı.

	21	Linter ve static analysis CI’da çalışmalı.

	22	Testi olmayan kritik kod merge edilmemeli.

	23	Kod yorumları “ne yaptığını” değil, gerekirse “neden böyle yapıldığını” açıklamalı.

	24	Feature flag kullanılan özellikler temizlenmeli; kalıcı teknik borca dönüşmemeli.

	25	Kodda deneysel veya geçici çözüm varsa ticket, son tarih ve sahip belirtilmeli.

Güvenli kodlama için özellikle C, C++, Java, Android ve Perl gibi dillerde SEI CERT Secure Coding Standards referans alınabilir; SEI CERT bu diller için güvenli kodlama standartlarını topluluk katkısıyla geliştirir.  

2.6 Kod inceleme kuralları

	1	Ana branch’e doğrudan commit kapalı olmalı.

	2	Pull request / merge request zorunlu olmalı.

	3	En az bir teknik onay alınmalı; kritik sistemlerde iki onay veya güvenlik onayı gerekir.

	4	Kod inceleme checklist’i olmalı: doğruluk, güvenlik, test, performans, okunabilirlik, veri etkisi, geriye uyumluluk.

	5	Otomatik testler geçmeden merge yapılmamalı.

	6	Linter, formatter, SAST, dependency scan ve secret scan geçmeden merge yapılmamalı.

	7	Büyük PR’lar bölünmeli.

	8	İnceleme kişiye değil koda odaklanmalı.

	9	Mimari etkisi olan değişikliklerde ADR güncellenmeli.

	10	Veritabanı migration içeren PR’larda rollback ve veri kaybı riski incelenmeli.

2.7 Test kuralları

Ürün seviyesinde yalnızca unit test yeterli değildir.

Olması gereken test türleri:

	1	Unit test.

	2	Integration test.

	3	Contract test.

	4	API test.

	5	End-to-end test.

	6	Regression test.

	7	Smoke test.

	8	Sanity test.

	9	Performance/load/stress test.

	10	Security test.

	11	Accessibility test.

	12	Usability test.

	13	Compatibility test.

	14	Migration test.

	15	Backup/restore test.

	16	Disaster recovery test.

	17	Observability test: log, metric, trace, alert gerçekten çalışıyor mu?

	18	Chaos/resilience testi; özellikle dağıtık sistemlerde.

	19	Manual exploratory test.

	20	Kabul testi.

Kurallar:

	•	Her kritik gereksinimin testi olmalı.

	•	Test verisi üretimi deterministik olmalı.

	•	Testler CI’da otomatik çalışmalı.

	•	Flaky testler görmezden gelinmemeli; ya düzeltilmeli ya izole edilmeli.

	•	Test coverage tek başına kalite metriği değildir; risk bazlı coverage gerekir.

	•	Kritik akışlarda mutation testing veya benzeri kalite kontrolleri düşünülebilir.

	•	Performans bütçeleri testle doğrulanmalı.

	•	Güvenlik testleri sadece release sonunda değil, geliştirme boyunca yapılmalı.

	•	Hata bulunduğunda regression testi eklenmeli.

	•	Test ortamı üretime yeterince benzemeli.

2.8 Güvenlik kuralları

Minimum güvenlik seti:

	1	Threat modeling yapılmalı.

	2	Güvenlik gereksinimleri backlog’a yazılmalı.

	3	Kimlik doğrulama merkezi ve standart olmalı.

	4	Yetkilendirme sunucu tarafında yapılmalı.

	5	Least privilege uygulanmalı.

	6	Secrets yönetimi için vault/KMS/secret manager kullanılmalı.

	7	Secrets repo, image, log, crash dump veya analitik sistemine düşmemeli.

	8	TLS zorunlu olmalı.

	9	Hassas veri at-rest ve in-transit şifrelenmeli.

	10	Parola saklanıyorsa güçlü, yavaş, tuzlu hash kullanılmalı.

	11	Session yönetimi güvenli olmalı.

	12	CSRF, XSS, SSRF, injection, broken access control, insecure deserialization gibi riskler kontrol edilmeli.

	13	Dosya yükleme güvenli yapılmalı.

	14	Rate limiting ve abuse prevention olmalı.

	15	Audit log değiştirilemezliğe yakın tasarlanmalı.

	16	Loglarda kişisel veri ve sır maskelenmeli.

	17	Dependency scanning yapılmalı.

	18	SAST, SCA, secret scanning ve mümkünse DAST CI/CD’ye eklenmeli.

	19	Container image taraması yapılmalı.

	20	Vulnerability disclosure ve incident response süreci olmalı.

	21	Güvenlik yamaları için SLA tanımlanmalı.

	22	Üretimde debug endpoint, stack trace ve gereksiz metadata kapalı olmalı.

	23	Varsayılan ayarlar güvenli olmalı.

	24	Admin işlemleri ayrıca korunmalı.

	25	Kritik işlemler için step-up authentication veya ek kontrol kullanılmalı.

OWASP Top 10, web uygulamaları için en kritik güvenlik risklerine dair farkındalık dokümanıdır; fakat ürün seviyesi güvenlikte yalnızca Top 10’a bakmak yetmez, doğrulanabilir kontrol seti olarak ASVS kullanılmalıdır.   API ürünlerinde ayrıca OWASP API Security Top 10 2023 dikkate alınmalıdır.  

2.9 Veri, gizlilik ve uyumluluk kuralları

	1	Veri envanteri çıkarılmalı.

	2	Kişisel veri, hassas veri, finansal veri, sağlık verisi gibi sınıflar belirlenmeli.

	3	Veri minimizasyonu uygulanmalı.

	4	Açık rıza, meşru menfaat, sözleşme gibi işleme dayanakları hukuk ekibiyle netleştirilmeli.

	5	Veri saklama süresi belirlenmeli.

	6	Silme, anonimleştirme ve dışa aktarma süreçleri tasarlanmalı.

	7	Kullanıcı veri talepleri için süreç olmalı.

	8	Yedeklerdeki kişisel veri de yaşam döngüsüne dahil edilmeli.

	9	Analitik ve log sistemleri gizlilik açısından incelenmeli.

	10	Üçüncü taraf veri işlemcileri sözleşme ve güvenlik açısından değerlendirilmelidir.

AB kullanıcıları veya AB’deki kişisel veriler söz konusuysa GDPR dikkate alınır; Avrupa Komisyonu veri koruma sayfası GDPR dahil AB içi ve dışı kişisel veri koruma kurallarına işaret eder.   Ödeme kartı verisi saklayan, işleyen veya ileten ürünlerde PCI DSS gerekir; PCI SSC, PCI DSS v4.0.1’i Haziran 2024’te sınırlı revizyon olarak yayımlamıştır.   ABD sağlık verisi kapsamındaki ürünlerde HIPAA Security Rule elektronik korunan sağlık bilgisinin gizlilik, bütünlük ve erişilebilirliğini korumaya yönelik idari, fiziksel ve teknik güvenlik önlemlerini gerektirir.  

2.10 Bağımlılık ve tedarik zinciri kuralları

	1	Tüm bağımlılıklar envanterlenmeli.

	2	Doğrudan ve dolaylı bağımlılıklar izlenmeli.

	3	Versiyonlar pinlenmeli veya kontrollü güncellenmeli.

	4	Lisans uyumluluğu kontrol edilmeli.

	5	Kritik bağımlılıklar için maintainer, release sıklığı, güvenlik geçmişi ve OpenSSF Scorecard gibi göstergeler incelenmeli.

	6	Build ortamı izole ve tekrarlanabilir olmalı.

	7	Artifact imzalama yapılmalı.

	8	SBOM üretilmeli.

	9	Provenance/attestation tutulmalı.

	10	CI/CD yetkileri minimum olmalı.

	11	Package manager token’ları dar kapsamlı olmalı.

	12	Dependency confusion ve typosquatting riskleri için registry politikaları uygulanmalı.

	13	Container image’lar minimal ve güncel olmalı.

	14	Base image güncellemeleri otomatik takip edilmeli.

	15	Release artifact’ı sonradan değiştirilmemeli.

SemVer kullanılıyorsa versiyonlar MAJOR.MINOR.PATCH anlamını taşımalı; SemVer 2.0.0, sürüm numaralarının alttaki kod değişiklikleriyle ilgili anlam taşımasını hedefler.   Changelog tutulmalı; Keep a Changelog yaklaşımı değişiklik günlüğünü her sürümdeki önemli değişikliklerin kronolojik listesi olarak tanımlar.  

2.11 CI/CD ve release kuralları

	1	Build otomatik olmalı.

	2	Test otomatik olmalı.

	3	Static analysis otomatik olmalı.

	4	Dependency ve secret scanning otomatik olmalı.

	5	Migration otomatik ama kontrollü olmalı.

	6	Release tekrarlanabilir olmalı.

	7	Staging ortamında smoke test çalışmalı.

	8	Production deploy için rollback planı olmalı.

	9	Blue/green, canary veya rolling deployment stratejisi kullanılmalı.

	10	Feature flag sistemi varsa sahiplik, temizlik ve izleme olmalı.

	11	Release notu hazırlanmalı.

	12	Versiyonlama standardı olmalı.

	13	Artifact imzalanmalı.

	14	Onay gerektiren alanlarda release approval kaydı tutulmalı.

	15	Deploy sonrası otomatik sağlık kontrolü yapılmalı.

	16	Geri dönüş süresi ölçülmeli.

	17	Üretim değişiklikleri audit trail’e yazılmalı.

	18	Hotfix süreci önceden tanımlanmalı.

2.12 Operasyon ve üretim kuralları

	1	Monitoring kurulmalı.

	2	Logging kurulmalı.

	3	Distributed tracing kurulmalı.

	4	Alert’ler aksiyon alınabilir olmalı.

	5	SLI/SLO tanımlanmalı.

	6	SLA varsa SLO’dan türetilmeli.

	7	Error budget kullanılmalı.

	8	Runbook yazılmalı.

	9	Incident management süreci olmalı.

	10	On-call sorumlulukları tanımlanmalı.

	11	Postmortem suçlayıcı değil öğrenme odaklı olmalı.

	12	Kapasite planlama yapılmalı.

	13	Backup ve restore düzenli test edilmeli.

	14	Felaket kurtarma tatbikatı yapılmalı.

	15	Güvenlik olayları için ayrı playbook olmalı.

	16	Maliyet izleme yapılmalı.

	17	Log ve metrik saklama süreleri belirlenmeli.

	18	Üretim erişimleri minimum yetkili ve kayıtlı olmalı.

	19	Manuel üretim müdahaleleri azaltılmalı.

	20	Sürüm, commit, build numarası ve konfigürasyon üretimde izlenebilir olmalı.

DORA, yazılım teslim performansını ölçmek için deployment frequency, lead time for changes, change failure rate, failed deployment recovery time ve reliability gibi metrikleri öne çıkarır.   Google SRE yaklaşımında error budget, SLO’dan türetilir; örneğin %99,9 SLO’nun hata bütçesi %0,1’dir.   OpenTelemetry, cloud-native yazılım için iz, metrik ve log toplamaya yönelik açık kaynak gözlemlenebilirlik framework’üdür.  

3. Dile ve teknolojiye göre değişen kurallar

Dil / teknoloji

Uyulacak tipik standartlar ve pratikler

Python

PEP 8, PEP 257, type hints, mypy/pyright, ruff/flake8, black, pytest. PEP 8, Python standart kütüphanesi için kodlama konvansiyonlarını tanımlar.  

Java

Google Java Style veya kurum standardı, Checkstyle, SpotBugs, Error Prone, PMD, JUnit, Maven/Gradle dependency locking. Google Java Style Guide, Java kaynak kodu için Google’ın kodlama standardını tanımlar.  

JavaScript / TypeScript

ESLint, typescript-eslint, Prettier, strict TypeScript, dependency audit, frontend security rules. typescript-eslint, TypeScript kodu için hata, iyi pratik ve stil ihlallerini yakalayan 100’den fazla kural içerir.  

Go

gofmt, go vet, staticcheck, golangci-lint, race detector, context cancellation, table-driven tests. Effective Go, açık ve idiomatik Go kodu yazmak için resmi rehberdir.  

Rust

rustfmt, clippy, cargo audit, ownership/borrowing kuralları, unsafe kullanımında özel inceleme. Rust Style Guide, varsayılan Rust stilini tanımlar ve rustfmt bu stile dayanır.  

C# / .NET

Microsoft C# coding conventions, analyzers, nullable reference types, StyleCop/Roslyn analyzers, xUnit/NUnit. Microsoft C# kod konvansiyonları okunabilirlik, tutarlılık ve ekip iş birliği için öneriler sunar.  

C / C++

MISRA, CERT C/C++, clang-tidy, sanitizers, static analysis, memory safety, undefined behavior kontrolleri. MISRA, gömülü kontrol sistemleri ve standalone yazılımlar için güvenli/güvenilir C/C++ kullanımına yönelik iyi pratik kılavuzları sağlar.  

SQL

Migration standardı, indeksleme kuralları, transaction sınırları, isolation level, migration rollback, query performance test, SQL injection koruması.

Mobile

Platform güvenlik rehberleri, OWASP MASVS, secure storage, certificate pinning gerekip gerekmediği, root/jailbreak risk modeli, offline veri şifreleme.

Web frontend

WCAG, browser compatibility, CSP, XSS koruması, bundle budget, Core Web Vitals, responsive design, i18n/l10n.

Backend API

OpenAPI, authN/authZ, rate limit, idempotency, pagination, versioning, request validation, structured errors.

Cloud-native / Kubernetes

CIS Benchmarks, Kubernetes Pod Security Standards, image scanning, network policy, RBAC, admission control, secrets yönetimi. CIS Kubernetes Benchmark, Kubernetes için güvenli konfigürasyon kılavuzları sunar.  

Container

Minimal image, non-root user, read-only filesystem, SBOM, image signing, vulnerability scanning. NIST SP 800-190, container güvenlik kaygılarını ve önerileri ele alır.  

4. Alana göre değişen standartlar

Alan

Ek standart / regülasyon

Ne zaman gerekir?

Finans / ödeme

PCI DSS, ISO 27001, SOC 2, yerel finans regülasyonları

Kart verisi işleniyor, ödeme altyapısı kuruluyor veya finansal kurumlara ürün satılıyorsa

Sağlık / medikal cihaz

IEC 62304, ISO 13485, ISO 14971, IEC 81001-5-1, FDA/AB MDR gereksinimleri

Yazılım medikal cihazın parçasıysa, sağlık yazılımıysa veya klinik karar/cihaz kontrolü etkisi varsa. IEC 62304 medikal cihaz yazılım yaşam döngüsü gereksinimlerini tanımlar.   ISO 13485 medikal cihaz tasarım ve üretimi için kalite yönetim standardıdır.   ISO 14971 medikal cihaz risk yönetimi sürecini tanımlar.  

Otomotiv

ISO 26262, Automotive SPICE, ISO/SAE 21434

Araç içi E/E sistem, sürüş güvenliği, ECU, ADAS, batarya yönetimi, araç yazılımı geliştiriliyorsa. ISO 26262, karayolu araçlarındaki E/E güvenlikle ilgili sistemlerin fonksiyonel güvenliğini ele alır.   Automotive SPICE 4.0, süreç ve kabiliyet boyutlarıyla otomotiv yazılım süreçlerini değerlendirir.  

Havacılık / savunma

DO-178C, DO-254, ARP4754A, MIL-STD süreçleri

Uçuşa etkili veya sertifikasyon gerektiren yazılım geliştiriliyorsa. DO-178C, airborne software için tasarım ve ürün güvencesi çekirdek dokümanıdır.  

Endüstriyel kontrol / OT

IEC 61508, IEC 62443, IEC 61511

PLC, SCADA, endüstriyel otomasyon, safety-related system veya kritik altyapı varsa. IEC 61508 fonksiyonel güvenlikte risk temelli yaklaşım kullanır.   ISA/IEC 62443, endüstriyel otomasyon ve kontrol sistemleri için siber güvenlik gereksinim ve süreçlerini tanımlar.  

Yapay zekâ / ML

ISO/IEC 42001, ISO/IEC 23894, NIST AI RMF, EU AI Act

AI tabanlı ürün, karar destek sistemi, yüksek riskli AI, model yönetimi veya regülasyon riski varsa. ISO/IEC 42001, AI yönetim sistemi standardıdır.   NIST AI RMF, AI risklerini yönetmeye yönelik framework sunar.   EU AI Act, risk temelli AI yasal çerçevesidir.  

Kamu / erişilebilirlik

WCAG, yerel kamu dijital erişilebilirlik düzenlemeleri, güvenlik sertifikasyonları

Kamuya hizmet veren web/mobil ürünlerde veya kamu ihalesinde

SaaS / kurumsal B2B

SOC 2, ISO 27001, CSA CCM, GDPR, DPA, subprocessors listesi

Kurumsal müşteri verisi işleniyor, güvenlik denetimi isteniyor veya bulut hizmeti veriliyorsa. CSA Cloud Controls Matrix, bulut bilişim için 17 alanda kontrol hedefleri içeren siber güvenlik kontrol çerçevesidir.  

Açık kaynak

SPDX, CycloneDX, OpenSSF Scorecard, lisans politikası

Açık kaynak yayınlanıyorsa veya yoğun açık kaynak bağımlılığı varsa

Eğitim / çocuk ürünleri

COPPA, GDPR-K, yaşa uygun tasarım kuralları, veri minimizasyonu

Çocuklardan veri toplanıyorsa veya eğitim kurumlarına ürün satılıyorsa

E-ticaret

PCI DSS, tüketici hukuku, KVKK/GDPR, erişilebilirlik, fraud kontrolleri

Sipariş, ödeme, kargo, iade, kullanıcı hesabı ve kişisel veri süreçleri varsa

5. Mimari ve kalite için takip edilecek ürün seviyesi kalite özellikleri

ISO/IEC 25010:2023 mantığıyla ürün seviyesinde şu kalite başlıkları için hedef ve metrik belirlenmelidir:

	1	Functional suitability: Doğru işi yapıyor mu?

	2	Performance efficiency: Yeterince hızlı ve verimli mi?

	3	Compatibility: Diğer sistemlerle ve ortamlarla uyumlu mu?

	4	Interaction capability: Kullanıcıyla etkileşimi etkili mi?

	5	Reliability: Hata durumunda çalışmaya devam edebiliyor mu?

	6	Security: Yetkisiz erişim, veri sızıntısı ve kötüye kullanıma dayanıklı mı?

	7	Maintainability: Değiştirilebilir, test edilebilir, analiz edilebilir mi?

	8	Flexibility: Yeni ihtiyaçlara uyarlanabilir mi?

	9	Safety: Kullanıcı, çevre, mal, sistem veya toplum için güvenlik riski yaratıyor mu?

Her biri için “iyi olsun” değil, ölçülebilir hedef gerekir. Örnek: p95 latency < 300 ms, aylık availability ≥ 99.9%, kritik zafiyet SLA ≤ 7 gün, test pass rate ≥ 99%, restore test başarısı ≥ ayda 1, WCAG AA uyumluluğu, audit log coverage %100.

6. Minimum “Definition of Done” listesi

Bir iş ürün seviyesinde “bitti” sayılmadan önce şunlar sağlanmalı:

	1	Gereksinim ve kabul kriteri tamam.

	2	Tasarım veya mimari etkisi değerlendirildi.

	3	Kod yazıldı.

	4	Kod formatlandı.

	5	Linter geçti.

	6	Static analysis geçti.

	7	Unit test yazıldı.

	8	Gerekirse integration/contract/e2e test yazıldı.

	9	Güvenlik etkisi kontrol edildi.

	10	Yetkilendirme kontrolü doğrulandı.

	11	Input validation var.

	12	Hata mesajları güvenli ve anlaşılır.

	13	Loglar yeterli ama sır/kişisel veri sızdırmıyor.

	14	Metrik/trace gerekiyorsa eklendi.

	15	Migration varsa rollback planı var.

	16	API değiştiyse dokümantasyon ve OpenAPI/AsyncAPI güncellendi.

	17	Kullanıcıya görünen değişiklik varsa UX ve erişilebilirlik kontrol edildi.

	18	Dokümantasyon güncellendi.

	19	Kod review tamamlandı.

	20	CI geçti.

	21	Deployment planı belli.

	22	Rollback planı belli.

	23	Monitoring/alert etkisi kontrol edildi.

	24	Release note gerekiyorsa yazıldı.

	25	Product owner veya ilgili sorumlu kabul etti.

7. Ürün seviyesinde repo standardı

Her ciddi projede en az şu dosyalar veya karşılıkları olmalı:

	1	README

	2	CONTRIBUTING

	3	CODE_OF_CONDUCT, açık kaynaksa

	4	SECURITY

	5	LICENSE

	6	CHANGELOG

	7	ARCHITECTURE veya /docs/architecture

	8	ADR kayıtları

	9	API sözleşmeleri

	10	Test stratejisi

	11	Threat model

	12	Deployment dokümanı

	13	Runbook

	14	Incident response playbook

	15	Backup/restore prosedürü

	16	Coding standard

	17	Branching strategy

	18	Release strategy

	19	Dependency policy

	20	Data classification veya privacy notes

8. Küçük ekip için pratik minimum set

Küçük bir startup veya küçük ürün ekibi için sertifikasyon zorunlu değilse bile şu minimumu uygula:

	1	ISO 12207 mantığında hafif SDLC.

	2	ISO 29148 mantığında iyi gereksinim ve kabul kriteri.

	3	ISO 25010 kalite başlıklarıyla NFR listesi.

	4	Basit ADR ve mimari diyagram.

	5	OWASP ASVS’den uygun seviye güvenlik kontrol listesi.

	6	CI/CD + test + lint + secret scan + dependency scan.

	7	OpenAPI/AsyncAPI ile API kontratı.

	8	SBOM üretimi.

	9	SemVer + changelog.

	10	Monitoring, logging, alerting.

	11	Backup/restore testi.

	12	Incident response süreci.

	13	KVKK/GDPR veri haritası.

	14	WCAG AA hedefi.

	15	Kod review zorunluluğu.

9. Büyük kurum / regüle ürün için genişletilmiş set

Regüle, kurumsal veya yüksek riskli ürünlerde ek olarak:

	1	ISO 9001 veya ISO/IEC/IEEE 90003 uyumlu kalite yönetimi.

	2	ISO 27001 uyumlu ISMS.

	3	NIST SSDF tabanlı secure SDLC.

	4	OWASP SAMM ile yazılım güvenliği olgunluk ölçümü.

	5	SLSA seviyesi hedefi.

	6	SBOM + VEX + artifact signing.

	7	Tam gereksinim-tasarım-kod-test izlenebilirliği.

	8	Bağımsız V&V.

	9	Formal change management.

	10	Risk register ve düzenli risk review.

	11	Denetim kanıtları.

	12	Tedarikçi güvenlik değerlendirmesi.

	13	Üretim erişim yönetimi.

	14	Felaket kurtarma tatbikatı.

	15	Yasal/regülasyon matrisi.

	16	Alan standardı: medikal, otomotiv, havacılık, finans, OT, AI vb.

10. En kısa uygulanabilir standart paketi

Yeni bir ürün için doğrudan uygulanabilir bir “başlangıç standardı” seçmem gerekirse:

	•	Süreç: ISO/IEC/IEEE 12207 mantığı.

	•	Gereksinim: ISO/IEC/IEEE 29148.

	•	Mimari: ISO/IEC/IEEE 42010 + ADR.

	•	Kalite: ISO/IEC 25010.

	•	Test: ISO/IEC/IEEE 29119.

	•	Güvenlik: NIST SSDF + OWASP ASVS.

	•	Gizlilik: KVKK/GDPR veri haritası.

	•	Erişilebilirlik: WCAG 2.2 AA.

	•	Tedarik zinciri: SBOM, SLSA, dependency scanning.

	•	Operasyon: SLO, monitoring, incident response, backup/restore.

	•	Dil standardı: kullanılan dilin formatter/linter/style guide seti.

	•	Alan standardı: ürün alanına göre medikal, otomotiv, finans, AI, havacılık, endüstriyel vb. ek standartlar.

Özetle: ürün seviyesi yazılım geliştirme = sadece temiz kod değil; izlenebilir gereksinim, belgelenmiş mimari, ölçülebilir kalite, otomatik test, güvenli geliştirme, denetlenebilir tedarik zinciri ve işletilebilir üretim sistemidir.



”””



—> Çok iyi toparlamışsın, teşekkür ederim.



Bir de gemini çıktısını vereceğim. Doğruyu/yanlışı ayırdıktan sonra bizim tarafa eklenmesi gerekenler olursa eklersin.



“



Yazılım geliştirme süreci, sadece kod yazmaktan ibaret olmayan, mühendislik disiplini gerektiren yapısal bir bütündür. Sıfırdan ürün (production) seviyesine kadar olan süreçte uyulması gereken standartlar, projenin diline, hedef platformuna ve donanım kısıtlamalarına göre değişiklik gösterse de, temel mühendislik ilkeleri evrenseldir.

Aşağıda, modern ve tam otomatik bir sistem mimarisi hedeflenerek baştan sona uygulanması gereken endüstri standartları listelenmiştir:

### 1. Tasarım ve Planlama (Geliştirme Öncesi)

Kod yazmaya başlamadan önceki aşama, projenin temelini oluşturur.

 * **Mimari Görselleştirme:** Hem geliştirici hem de sisteme entegre olabilecek otonom ajanlar (AI) için sistemin haritası çıkarılmalıdır. Mimarinin, veri akışının ve dosya ağacının Mermaid (MMD) formatında, bağımsız iki dosya (insan ve makine okunabilir) halinde hazırlanması standarttır.

 * **Sözde Kod (Pseudocode) Tasarımı:** Algoritmanın mantığı, herhangi bir programlama dilinin sözdizimine (syntax) bağlı kalmadan, detaylı bir sözde kod ile dokümante edilmelidir.

 * **Dosya Ağacı Planlaması:** Tüm kodlar tek bir dosyaya yığılmamalıdır. Konfigürasyonlar, ana modüller, testler ve loglar mantıksal klasörlere (src/, config/, logs/, docs/) ayrılmalıdır.

### 2. Ortam ve Bağımlılık Yönetimi

Yazılımın farklı makinelerde aynı şekilde çalışmasını garanti altına alan standartlardır.

 * **İzole Ortamlar:** Geliştirme ortamı her zaman izole edilmelidir (Örn: Python için venv veya conda, genel sistemler için Docker). Küresel (global) paket kurulumlarından kaçınılmalıdır.

 * **Otomatik Kurulum ve Kontrol:** Sistem, çalışmadan önce gerekli kütüphaneleri ve bağımlılıkları kontrol etmeli, eksikse kullanıcıyı yormadan arka planda (silent install) kuracak şekilde tasarlanmalıdır.

 * **Bağımlılıkların Kilitlenmesi:** Kullanılan kütüphanelerin sürümleri requirements.txt, package.json veya Pipfile.lock gibi dosyalarla sabitlenmelidir.

### 3. Geliştirme ve Kodlama Kuralları

Bu kurallar dilden dile ve alanın doğasına göre (örn: gömülü sistemler vs. web) değişiklik gösterir.

 * **Evrensel Prensipler:**

   * **SOLID:** Nesne yönelimli tasarımın beş temel prensibi uygulanmalıdır.

   * **DRY (Don't Repeat Yourself):** Aynı kod bloğu tekrarlanmamalı, fonksiyon veya modül haline getirilmelidir.

   * **KISS (Keep It Simple, Stupid):** Gereksiz karmaşıklıktan kaçınılmalı, en basit ve okunabilir çözüm tercih edilmelidir.

 * **Dile Özgü Standartlar (Örnekler):**

   * **Python:** PEP-8 standartlarına uyulmalıdır. Tip belirteçleri (Type Hinting) zorunlu olarak kullanılmalıdır.

   * **C/C++ (Donanım/Optik):** Bellek sızıntılarını önlemek için modern C++ (Smart Pointers) kullanılmalı; kritik sistemlerde MISRA C standartlarına uyulmalıdır.

   * **JavaScript/TypeScript:** ESLint ve Prettier gibi formatlayıcılar kullanılmalı, Google veya Airbnb stil rehberleri benimsenmelidir.

 * **Kullanıcı ve Sistem Geri Bildirimi:** Kod sessizce çalışmamalıdır. Uzun süren işlemlerde ilerleme çubukları (progress bars) ve sürecin her adımını kaydeden yapısal loglama (zaman damgalı ve hata seviyeli) standart olarak bulunmalıdır.

### 4. Sürüm Kontrolü ve Dokümantasyon

Sürdürülebilirlik için kritik olan aşamadır.

 * **Anlamsal Sürümlendirme (Semantic Versioning):** Sürümler MAJOR.MINOR.PATCH (Örn: 1.2.4) mantığıyla atlatılmalıdır. Kod revizyonlarında bir önceki sürümle olan uyumluluk gözetilmelidir.

 * **Sürüm Notları (Changelog):** Yapılan her değişiklik, eklenen özellikler ve çözülen hatalar dosya ağacında uygun bir yerde (Örn: CHANGELOG.md) tutulmalıdır.

 * **Sürekli Dokümantasyon:** Sistemde bir güncelleme yapıldığında, başta MMD dosyaları ve mimari diyagramlar olmak üzere tüm dokümanlar kodla eş zamanlı olarak güncellenmelidir.

### 5. Test ve Doğrulama

Kodun üretime (production) geçebilmesi için hatalardan arındırılmış olması gerekir.

 * **Birim Testleri (Unit Testing):** Yazılan her fonksiyonun tekil olarak doğru çalışıp çalışmadığı test edilmelidir.

 * **Entegrasyon Testleri:** Farklı modüllerin bir araya geldiğinde (örn: veritabanı ile ana kod, veya GUI ile arka plan işlemleri) çökmeden çalıştığı doğrulanmalıdır.

### 6. Dağıtım (Deployment) ve Çalışma Zamanı

Ürünün son kullanıcıya veya hedef makineye ulaştığı aşamadır.

 * **Çevrimdışı (Offline) Çalışabilirlik:** Sistemin doğası gerektirmiyorsa, buluta veya sürekli internet bağlantısına bağımlı olmamalıdır. Kurulumlar bir kez çevrimiçi yapıldıktan sonra, sistem kapalı bir ağda veya izole bir bilgisayarda eksiksiz çalışabilmelidir.

 * **Kısa Özet Çıktısı:** İşlem tamamlandığında, yazılım son kullanıcıya (veya çağırıcı sisteme) ne yaptığına dair çok kısa ve net bir yürütme özeti sunmalıdır.

**Alana Göre Standartların Değişimi:**

 * **Donanım ve Mekatronik (Edge Computing):** Gecikme süresi (latency) ve bellek yönetimi (memory footprint) ön plandadır. C/C++ veya Rust tercih edilir, deterministik çalışma (işlemin her zaman aynı sürede bitmesi) zorunludur.

 * **Yapay Zeka ve Veri Bilimi (Otonom Ajanlar):** Modülerlik ve veri akışı ön plandadır. Python endüstri standartıdır. Ağır donanım (VRAM vb.) kullanıldığı için asenkron işlemler ve donanım kullanım limitlerinin izlenmesi kritik kurallardır.

 * **Web/Bulut Sistemleri:** Yatay ölçeklenebilirlik, güvenlik (OWASP standartları) ve eşzamanlı istek yönetimi ön plandadır.

Bu standartlardan hangisini şu an üzerinde çalıştığınız (örneğin otonom bir AI ajanı veya donanım entegrasyonu gibi) spesifik bir projeye uyarlamak istersiniz?



“



“””

Rica ederim. Gemini çıktısının genel yönü iyi ve pratik, ama önemli bir problemi var: bazı ekip tercihi / iyi pratik maddelerini “endüstri standardı” gibi sunmuş. Bizim önceki liste daha doğru çerçevedeydi; Gemini’den ise özellikle repo düzeni, geliştirici ortamı, diagram-as-code, kullanıcıya çalışma özeti, offline/air-gapped çalışma ve donanım kaynak bütçeleri gibi pratik maddeler eklenebilir.

Net değerlendirme

Gemini çıktısı üç kategoriye ayrılır:

	1	Doğru ve eklenebilir maddeler: İzole ortam, bağımlılık kilitleme, repo/dosya ağacı düzeni, SemVer, changelog, unit/integration test, domain’e göre latency/bellek/VRAM gibi kaynak limitlerinin düşünülmesi.

	2	Doğru ama fazla mutlak yazılmış maddeler: Mermaid, pseudocode, SOLID, type hints, progress bar, offline çalışma, deterministik çalışma.

	3	Düzeltilmesi gereken / riskli maddeler: “Silent install” önerisi, “her fonksiyon unit test edilmeli”, “production’a geçmek için hatalardan arındırılmış olmalı”, “Mermaid iki dosya halinde standarttır”, “Python AI için endüstri standardıdır” gibi mutlak ifadeler.



⸻



1. Doğru ve korunması gerekenler

Gemini maddesi

Değerlendirme

Bizim tarafa etkisi

Geliştirme öncesi mimari görselleştirme

Doğru

Eklenmeli; ama Mermaid zorunlu değil, “diagram-as-code” yaklaşımı olarak yazılmalı.

Pseudocode / algoritma tasarımı

Doğru ama kapsamlı sistemlerde seçici uygulanmalı

Kritik algoritmalar, güvenlik akışları, finansal hesaplar, gerçek zamanlı kontrol ve ML pipeline’ları için eklenmeli.

Dosya ağacı planlaması

Doğru

Önceki listede repo standardı vardı; daha somut hale getirilebilir.

İzole geliştirme ortamı

Doğru

Güçlü biçimde eklenmeli: venv, conda, Docker, Dev Container, Nix, asdf, mise vb.

Bağımlılık kilitleme

Doğru

Bizim önceki “tedarik zinciri” başlığına daha net eklenmeli.

SOLID / DRY / KISS

Genel olarak doğru

“Evrensel yasa” değil, tasarım ilkeleri olarak yazılmalı.

PEP 8, ESLint, Prettier, MISRA

Doğru

Dile/ekosisteme göre zaten vardı; ek açıklama yapılabilir. PEP 8’in kendisi bile proje özelindeki stil rehberinin çakışma durumunda öncelikli olabileceğini söyler.  

Yapısal loglama

Doğru

Önceki gözlemlenebilirlik kısmına eklenmeli.

SemVer

Doğru

Önceki listede vardı. SemVer’de MAJOR uyumsuz API değişikliği, MINOR geriye uyumlu özellik, PATCH geriye uyumlu hata düzeltmesi anlamına gelir.  

Changelog

Doğru

Zaten vardı.

Unit ve integration test

Doğru

Zaten vardı; kapsamı risk bazlı olmalı.

Offline çalışma

Bazı ürünlerde çok doğru

Evrensel standart değil; edge, savunma, sağlık, saha cihazı, fabrika, air-gapped ortam için gereksinim olarak eklenmeli.

AI/veri bilimi için donanım kullanımı izleme

Doğru

ML/AI bölümüne eklenmeli: GPU/VRAM/RAM/CPU/disk/network bütçeleri.



⸻



2. Yanlış, eksik veya fazla iddialı kısımlar

2.1 “Mermaid MMD formatında iki ayrı dosya standarttır” ifadesi yanlış

Mermaid faydalı bir araçtır; metin ve kodla diyagram/visualization üretmeye yarar. Ama uluslararası veya genel yazılım geliştirme standardı değildir.  

Doğru ifade şöyle olmalı:

Mimari ve veri akışı diyagramları dokümantasyonun parçası olmalıdır. Mümkünse diagram-as-code yaklaşımı kullanılmalıdır. Mermaid, PlantUML, Structurizr/C4, Graphviz veya benzeri araçlar tercih edilebilir. Kritik sistemlerde mimari dokümantasyon ISO/IEC/IEEE 42010 mantığıyla paydaş, görünüm, karar ve gerekçe bazlı tutulmalıdır.

“İnsan ve makine okunabilir iki ayrı Mermaid dosyası” ise standart değil, ancak ekip içi tercih olabilir.

2.2 “Silent install” önerisi riskli

Gemini’nin en problemli maddesi bu:

“Eksikse kullanıcıyı yormadan arka planda silent install kuracak şekilde tasarlanmalıdır.”

Bu her zaman iyi pratik değildir; hatta güvenlik, denetlenebilirlik ve tekrarlanabilirlik açısından sakıncalı olabilir. Yazılım kendi kendine bağımlılık indirip kuruyorsa:

	•	üretim ortamını beklenmedik şekilde değiştirir,

	•	tedarik zinciri riskini artırır,

	•	lisans ve güvenlik onaylarını atlayabilir,

	•	air-gapped / kontrollü kurum ortamlarında ihlal sayılabilir,

	•	“aynı artifact her yerde aynı çalışır” prensibini bozar.

Doğru yaklaşım:

Bağımlılıklar açıkça beyan edilmeli, kilitlenmeli, CI/CD veya kurulum aşamasında doğrulanmalı; üretim çalışma zamanında habersiz paket kurulumu yapılmamalıdır. Gerekirse bootstrap, install, doctor veya preflight check komutu kullanıcıya açık biçimde eksikleri raporlamalıdır.

Bu, NIST SSDF mantığıyla da daha uyumludur; SSDF, güvenli geliştirme pratiklerinin SDLC’ye entegre edilmesini ve zafiyet riskinin azaltılmasını hedefler, rastgele runtime kurulumunu değil.  

2.3 “Her fonksiyon unit test edilmeli” fazla mutlak

Amaç “her fonksiyona test yazmak” değil, riskli davranışların ve sözleşmelerin test edilmesi olmalı.

Daha doğru ifade:

Kritik iş kuralları, hata koşulları, güvenlik kontrolleri, veri dönüşümleri, hesaplama mantığı ve public API davranışı test edilmelidir. Getter/setter, framework glue code veya trivial wrapper gibi düşük riskli kısımlar için test zorunluluğu risk bazlı değerlendirilmelidir.

Yani test kapsamı “fonksiyon sayısına” göre değil, risk + davranış + gereksinim + sözleşme bazında belirlenmeli.

2.4 “Production’a geçebilmek için hatalardan arındırılmış olmalı” yanlış beklenti

Yazılımın tamamen hatasız olduğu garanti edilemez. Ürün seviyesinde doğru hedef:

Kabul edilebilir artık risk seviyesine ulaşmak, kritik ve yüksek önem seviyeli açıkları kapatmak, testleri geçirmek, rollback planına sahip olmak, gözlemlenebilirliği sağlamak ve operasyonel hazırlığı tamamlamak.

Yani “hatasızlık” değil, ölçülebilir kalite ve kontrollü risk.

2.5 “Kod sessizce çalışmamalı, progress bar olmalı” bağlama göre doğru

CLI, batch job, veri işleme, model eğitimi, uzun süren migration ve kullanıcı arayüzlü işlemlerde ilerleme bilgisi çok faydalıdır. Ama her yazılımda progress bar gerekmez.

Örneğin:

	•	backend servislerinde progress bar değil, structured logging + metrics + tracing gerekir;

	•	kütüphaneler varsayılan olarak sessiz olmalı, çağıran uygulamaya kontrol vermelidir;

	•	daemon/service süreçleri stdout’a sürekli yazmak yerine log seviyeleri ve telemetry kullanmalıdır;

	•	güvenlik ve gizlilik nedeniyle loglar kontrollü olmalıdır.

Doğru ifade:

Uzun süren ve kullanıcı/operatör tarafından takip edilmesi gereken işlemler için ilerleme, durum, hata ve sonuç raporlaması tasarlanmalıdır. Servislerde bu ihtiyaç log, metric, trace ve health check ile karşılanmalıdır.

2.6 “Python’da type hinting zorunlu olmalı” proje standardı olabilir, Python standardı değildir

Python’da type hint kullanmak iyi pratiktir, özellikle büyük kod tabanlarında çok faydalıdır. Ama dil seviyesi veya PEP seviyesi zorunluluk değildir. Python dokümantasyonu runtime’ın type annotation’ları enforce etmediğini; bunların type checker, IDE ve linter gibi üçüncü taraf araçlarca kullanılabileceğini belirtir.   PEP 484 de Python’ın dinamik tipli kalacağını ve type hint’lerin zorunlu yapılmasının hedeflenmediğini açıkça söyler.  

Doğru ifade:

Ürün seviyesindeki Python projelerinde public API’ler, domain modelleri, servis katmanı ve kritik fonksiyonlarda type hint zorunlu tutulmalıdır; type checking CI’da mypy, pyright veya benzeri araçlarla çalıştırılmalıdır.

2.7 SOLID evrensel değil

SOLID özellikle nesne yönelimli tasarım için değerlidir. Ama functional programming, data-oriented design, embedded C, shell script, SQL veya küçük script projelerinde doğrudan uygulanması şart değildir.

Daha doğru üst ilke:

Kod düşük coupling, yüksek cohesion, açık sorumluluk, test edilebilirlik, okunabilirlik ve değiştirilebilirlik hedefleriyle tasarlanmalıdır. OOP projelerde SOLID bu hedefler için kullanılabilir.

2.8 C/C++ için “smart pointer kullanılmalı” her zaman doğru değil

Modern C++ projelerinde RAII ve smart pointer kullanımı güçlü bir iyi pratiktir. Ama bazı gömülü, gerçek zamanlı veya safety-critical sistemlerde dinamik bellek kullanımı kısıtlı veya yasak olabilir. MISRA, güvenli ve güvenilir C/C++ kullanımı için önemli bir referanstır; özellikle gömülü kontrol ve standalone yazılım alanlarında kullanılır.  

Doğru ifade:

C/C++ projelerinde ownership modeli açık olmalı; mümkünse RAII ve güvenli kaynak yönetimi kullanılmalı; gerçek zamanlı/gömülü/safety-critical alanlarda MISRA, CERT C/C++, static analysis, sanitizers ve dinamik bellek politikaları proje standardı olarak tanımlanmalıdır.

2.9 “Offline çalışabilirlik” evrensel standart değil

Offline çalışabilirlik bazı alanlarda çok önemlidir: edge computing, savunma, saha cihazları, hastane içi sistemler, fabrika, gemi/uçak, air-gapped kurum ağı, yetersiz internet bağlantısı olan coğrafyalar.

Ama SaaS, ödeme, gerçek zamanlı bulut senkronizasyonu, merkezi kimlik, lisans doğrulama veya canlı veri gerektiren ürünlerde offline çalışma gereksinimi ya anlamsız ya da sınırlı olabilir.

Doğru ifade:

Ürün bağlamı gerektiriyorsa offline/air-gapped çalışma, local cache, conflict resolution, offline license, local logging, deferred sync ve offline update paketi tasarlanmalıdır.

2.10 “Edge computing’de deterministik çalışma zorunludur” fazla geniş

Deterministik çalışma özellikle hard real-time ve safety-critical sistemlerde zorunludur. Ama her edge computing ürünü hard real-time değildir. Bir kamera analitik cihazı, kiosk, IoT gateway veya lokal ML inference sistemi latency-sensitive olabilir ama her işlemin kesin aynı sürede bitmesi gerekmeyebilir.

Doğru ifade:

Sistem real-time sınıfına ayrılmalıdır: non-real-time, soft real-time, firm real-time veya hard real-time. Hard real-time sistemlerde deterministik süre, bounded memory, worst-case execution time, watchdog ve priority inversion kontrolü gerekir.

2.11 “Python AI için endüstri standardıdır” fazla kesin

Python AI/ML ekosisteminde çok yaygındır; ama bu onu tek standart yapmaz. Üretim inference tarafında C++, Rust, Go, Java, CUDA, Triton, ONNX Runtime, TensorRT, JVM servisleri veya mobil-native çözümler devreye girebilir.

Doğru ifade:

AI/ML geliştirme ve deney süreçlerinde Python yaygın tercihtir; üretim ortamında latency, maliyet, donanım, dağıtım ve güvenlik gereksinimine göre farklı diller ve runtime’lar kullanılabilir.



⸻



3. Bizim önceki standarda eklenmesi gerekenler

Aşağıdaki maddeleri önceki listeye ek bölüm olarak koyardım.

3.1 Diagram-as-code ve yaşayan mimari dokümantasyonu

Eklenmeli:

Mimari, veri akışı, deployment, dependency, sequence ve kritik iş akışları diagram-as-code yaklaşımıyla dokümante edilmelidir. Mermaid, PlantUML, Structurizr/C4, Graphviz veya benzeri araçlar kullanılabilir. Diyagramlar kodla birlikte versiyonlanmalı ve mimari değişikliklerde güncellenmelidir.

Ama şu uyarıyla:

Mermaid faydalı bir araçtır, ancak tek başına evrensel standart değildir.

3.2 Proje iskeleti ve dosya ağacı standardı

Eklenmeli:

/project

  /src veya /app

  /tests

  /docs

  /scripts

  /config

  /migrations

  /deploy veya /infra

  /tools

  /examples

  /.github veya /.gitlab

  README.md

  CHANGELOG.md

  SECURITY.md

  CONTRIBUTING.md

  LICENSE

Kurallar:

	•	kaynak kod, test, konfigürasyon, script, dokümantasyon ve deployment dosyaları ayrılmalı;

	•	production secret hiçbir klasörde düz metin tutulmamalı;

	•	generated dosyalar, cache, log ve build artifact’ları repoya alınmamalı;

	•	repo kökünde “projeyi nasıl ayağa kaldırırım?” sorusunun cevabı olmalı.

3.3 Geliştirici ortamı standardı

Eklenmeli:

Proje, yeni bir geliştiricinin makinesinde tekrarlanabilir şekilde ayağa kalkmalıdır.

Minimumlar:

	•	desteklenen dil/runtime versiyonu belirtilmeli;

	•	dependency lock dosyası olmalı;

	•	local development için tek komutlu kurulum hedeflenmeli;

	•	make, taskfile, justfile, npm scripts, tox, nox, uv, poetry, pip-tools, pnpm, cargo, go mod gibi ekosisteme uygun araçlardan biri seçilmeli;

	•	Docker/Dev Container/Nix gibi reproducible environment seçenekleri düşünülmeli;

	•	doctor veya preflight komutu eksikleri raporlamalı.

Ama:

Runtime sırasında habersiz/silent bağımlılık kurulumu yasaklanmalı veya çok istisnai durumlara bağlanmalıdır.

3.4 Bağımlılık kilitleme standardı daha somut yazılmalı

Eklenmeli:

Ekosistem

Kilitleme / yönetim örneği

Python

requirements.txt tek başına yeterli olmayabilir; requirements.lock, pip-tools, poetry.lock, uv.lock, Pipfile.lock kullanılabilir.

Node.js

package-lock.json, pnpm-lock.yaml veya yarn.lock kullanılmalı; sadece package.json yeterli değildir.

Go

go.mod + go.sum

Rust

Cargo.lock

Java

Maven/Gradle dependency locking, BOM, checksum/signature doğrulama

.NET

packages.lock.json, merkezi package yönetimi

Container

image digest pinning, SBOM, image signing

Ek kural:

CI/CD’de dependency install komutu lock dosyasına sadık çalışmalıdır; örneğin Node tarafında npm ci, Python tarafında lock tabanlı kurulum gibi.

3.5 Uzun süren işler için kullanıcı/operatör geri bildirimi

Eklenmeli:

Uzun süren işlemler için kullanıcı veya çağırıcı sistem bilgilendirilmelidir.

CLI/batch için:

	•	progress bar veya yüzde,

	•	işlem başlangıç/bitiş zamanı,

	•	kaç kayıt işlendi,

	•	kaç hata oluştu,

	•	çıktı dosyası/konumu,

	•	exit code,

	•	kısa özet.

Backend/service için:

	•	structured log,

	•	correlation/request ID,

	•	metric,

	•	trace,

	•	health/readiness endpoint,

	•	job status endpoint,

	•	retry/dead-letter bilgisi.

3.6 Çalışma sonu kısa yürütme özeti

Gemini’nin iyi yakaladığı bir pratik.

Eklenmeli:

Batch job, CLI, veri işleme, model eğitimi, migration, raporlama ve otomasyon süreçleri tamamlandığında kısa bir execution summary üretmelidir.

Örnek:

İşlem tamamlandı.

Toplam kayıt: 120.000

Başarılı: 119.842

Hatalı: 158

Süre: 04:12

Çıktı: /exports/report_2026-06-01.csv

Log ID: run-20260601-1830

3.7 Offline / air-gapped çalışma standardı

Önceki listeye koşullu olarak eklenmeli:

Ürün edge, saha, savunma, sağlık, fabrika, kapalı ağ veya düşük bağlantı ortamında çalışacaksa offline/air-gapped çalışma gereksinimleri baştan tanımlanmalıdır.

Kontrol listesi:

	•	çevrimdışı kurulum paketi,

	•	local dependency mirror,

	•	offline lisanslama,

	•	local log ve audit saklama,

	•	sonra senkronizasyon,

	•	veri çakışması çözümü,

	•	offline update/rollback,

	•	internet yokken degradation davranışı,

	•	sertifika ve zaman senkronizasyon problemi,

	•	güvenli removable media süreci.

3.8 Donanım ve kaynak bütçeleri

Gemini’nin AI ve edge için değindiği kaynak takibi önemli. Eklenmeli:

Ürün için CPU, RAM, disk, network, GPU, VRAM, batarya, sıcaklık ve latency bütçeleri belirlenmelidir.

Özellikle AI/ML için:

	•	model boyutu,

	•	inference latency,

	•	throughput,

	•	GPU/VRAM limiti,

	•	batch size,

	•	cold start süresi,

	•	model yükleme süresi,

	•	fallback model,

	•	quantization etkisi,

	•	maliyet/istek,

	•	veri drift/model drift izleme.

Edge/gömülü için:

	•	memory footprint,

	•	boot time,

	•	watchdog,

	•	power budget,

	•	thermal throttling,

	•	real-time sınıfı,

	•	firmware update/rollback,

	•	local storage wear-out,

	•	bağlantı kopması davranışı.

3.9 Algoritma tasarım notu / pseudocode standardı

Eklenmeli ama kapsamı net yazılmalı:

Karmaşık, kritik veya denetlenebilir olması gereken algoritmalar için implementation öncesinde algoritma tasarım notu yazılmalıdır.

Zorunlu olması gereken yerler:

	•	finansal hesaplama,

	•	yetkilendirme kararı,

	•	fraud/risk skoru,

	•	kriptografik akış,

	•	medikal karar destek,

	•	safety-critical kontrol,

	•	ML feature pipeline,

	•	veri migration,

	•	optimizasyon algoritması,

	•	concurrency/locking mekanizması.

Her CRUD fonksiyonu için pseudocode yazmak gereksiz bürokrasi olur.

3.10 “No silent mutation” kuralı

Bu özellikle eklenmeli:

Yazılım, kullanıcının veya operasyon ekibinin bilgisi dışında çalışma ortamını değiştirmemelidir.

Yani şunlar yasak veya kontrollü olmalı:

	•	runtime’da paket kurmak,

	•	sistem dizinlerine yazmak,

	•	global config değiştirmek,

	•	firewall/registry/system service değiştirmek,

	•	production veritabanında otomatik destructive migration yapmak,

	•	dependency versiyonunu sessizce yükseltmek.

Doğru pratik:

	•	açık kurulum adımı,

	•	imzalı artifact,

	•	migration planı,

	•	onay mekanizması,

	•	rollback,

	•	audit log.



⸻



4. Gemini metninden bizim ana listeye eklenecek nihai ek bölüm

Bunu önceki standarda doğrudan ekleyebilirsin:

Ek: Pratik Ürünleştirme Standartları

	1	Proje iskeleti standardı: Kod, test, dokümantasyon, konfigürasyon, deployment, script ve migration dosyaları ayrı klasörlerde tutulmalıdır.

	2	Diagram-as-code: Mimari, veri akışı, sequence, deployment ve kritik süreç diyagramları kodla birlikte versiyonlanmalıdır. Mermaid, PlantUML, C4/Structurizr veya Graphviz kullanılabilir.

	3	Kritik algoritma tasarımı: Karmaşık veya regüle algoritmalar implementation öncesinde pseudocode, karar tablosu, state machine veya akış diyagramıyla açıklanmalıdır.

	4	Tekrarlanabilir geliştirici ortamı: Runtime versiyonu, bağımlılıklar, lokal servisler ve kurulum adımları net olmalıdır. Yeni geliştirici projeyi tek veya az sayıda komutla ayağa kaldırabilmelidir.

	5	Bağımlılık kilitleme: Bağımlılıklar lock dosyalarıyla sabitlenmeli; CI/CD bu lock dosyalarına sadık çalışmalıdır.

	6	Silent install yasağı: Yazılım, production runtime’da habersiz bağımlılık kurmamalı veya ortamı değiştirmemelidir. Eksikler doctor/preflight komutuyla raporlanmalıdır.

	7	Uzun süren işlem geri bildirimi: CLI, batch job, migration, veri işleme ve ML eğitim süreçleri progress, log, durum ve sonuç özeti üretmelidir.

	8	Structured logging: Loglar timestamp, seviye, correlation ID, işlem adı, hata kodu ve bağlam içermelidir; secret ve kişisel veri maskelenmelidir.

	9	Execution summary: Uzun işler tamamlandığında ne yapıldığı, kaç öğe işlendiği, kaç hata olduğu, çıktı konumu ve süre bilgisi kısa özet olarak verilmelidir.

	10	Offline/air-gapped gereksinim: Ürün kapalı ağ, edge, savunma, sağlık, fabrika veya saha ortamında çalışacaksa offline kurulum, offline update, local cache, deferred sync ve rollback tasarlanmalıdır.

	11	Kaynak bütçesi: CPU, RAM, disk, network, GPU/VRAM, latency, throughput ve maliyet hedefleri tanımlanmalı ve test edilmelidir.

	12	Real-time sınıflandırması: Edge/gömülü sistemlerde sistemin non-real-time, soft real-time, firm real-time veya hard real-time olduğu belirtilmelidir.

	13	Donanım farkındalığı: GPU, VRAM, batarya, sıcaklık, bellek, storage wear-out ve network kopması gibi fiziksel kısıtlar ürün gereksinimlerine dahil edilmelidir.

	14	Dokümantasyon eşzamanlılığı: Kod değiştiğinde ilgili README, API sözleşmesi, mimari diyagram, changelog, runbook ve deployment dokümanı güncellenmelidir.

	15	Style guide seçimi: Her dil/ekosistem için formatter, linter ve style guide seçilmeli; CI’da zorunlu çalıştırılmalıdır. JavaScript/TypeScript tarafında ESLint’in CI’a entegre edilebilen statik analiz aracı olması bu yaklaşımı destekler.  

	16	Güvenlik doğrulama seviyesi: Web/API ürünlerinde OWASP ASVS seviyesi belirlenmeli; ASVS hem geliştiricilere güvenli geliştirme gereksinimleri hem de teknik güvenlik kontrollerini test etmek için temel sağlar.  



⸻



5. Son hüküm

Gemini çıktısı pratik checklist olarak faydalı, ama “standart” kelimesini fazla gevşek kullanıyor. Bizim önceki listeye aynen alınmamalı; şu şekilde alınmalı:

	•	Mermaid zorunlu değil → “diagram-as-code” olarak ekle.

	•	Silent install yanlış → “explicit, reproducible, auditable install” olarak düzelt.

	•	Her fonksiyon test edilmeli değil → “risk bazlı test coverage” olarak düzelt.

	•	Hatasız production değil → “kabul edilebilir artık risk + gözlemlenebilirlik + rollback” olarak düzelt.

	•	Offline çalışma evrensel değil → “ürün bağlamı gerektiriyorsa” diye ekle.

	•	Type hint Python’da dil zorunluluğu değil → “ürün standardı olarak zorunlu tutulabilir” diye yaz.

	•	AI/edge kaynak takibi çok değerli → bizim standarda kesin eklenmeli.



“””



—> Şimdi gelelim ben bu soruları neden soruyorum kısmına; bu işlerin hiç birini insan yapmayacak, hepsini ai yapacak. 



Tüm bu işlerin profesyonel seviyede yapılması için de skill/plugin/agent/sub-agent/pipeline/team-lead/takım vb yapıların kurulması gerek. Sen de bu kısmı halledeceksin.





“””

Tamam. Bu noktada mesele artık “AI kod yazsın” değil; AI’ların profesyonel yazılım organizasyonu gibi çalışacağı bir üretim sistemi kurmak.

Ben bunu şu isimle ele alacağım:

AI Software Factory

Amaç: Sıfırdan ürün seviyesine kadar tüm yazılım geliştirme işlerini AI agent/sub-agent/skill/plugin/pipeline yapısıyla yürütmek.

Bu yapıda insan geliştirici, analist, mimar, tester, security engineer, DevOps, release manager ve takım lideri yerine rol bazlı AI agent’ları olacak. Fakat kritik nokta şu: Tek bir “her şeyi yapan süper agent” kurmayacağız. Bu profesyonel olmaz. Onun yerine yetki sınırları olan, birbirini denetleyen, kanıt üreten ve kalite kapılarından geçmeden ilerleyemeyen bir AI takımı kuracağız.

Başlangıç kitini de hazırladım: AI SDLC Factory Starter Kit v0.1



⸻



1. Ana karar: tek agent değil, AI takım mimarisi

Kuracağımız yapı şöyle olacak:

User / Product Request

        ↓

AI Team Lead / Orchestrator

        ↓

Product + Requirements + Architecture + Security + Dev + QA + DevOps + Release Agent'ları

        ↓

Automated Quality Gates

        ↓

Evidence Bundle

        ↓

Release / Deploy / Operate

OpenAI Agents SDK tarafında agent, instruction, tool, handoff, guardrail ve structured output gibi bileşenlerle tanımlanabiliyor; bu yüzden bizim kuracağımız yapıda “agent = rol + talimat + araç yetkisi + çıktı şeması + kalite kapısı” şeklinde ele alınacak. Ayrıca SDK’nın tracing yapısı LLM çıktıları, tool çağrıları, handoff’lar ve guardrail olaylarını izlenebilir hale getirebildiği için, bu tip üretim hattında agent davranışlarını denetlemek için temel mekanizmalardan biri olmalı.  



⸻



2. Bu sistemin temel prensibi

İnsan yoksa kaliteyi şu dört şey sağlayacak:

	1	Rol ayrımı

	2	Tool yetki sınırı

	3	Makine tarafından zorlanan kalite kapıları

	4	Kanıt paketi / evidence bundle

Yani hiçbir agent “ben yaptım, bence oldu” diyerek merge/release yapamayacak.

Her kritik çıktı şu şekilde kanıtlanacak:

Gereksinim → Tasarım → Kod → Test → Güvenlik taraması → Release kanıtı → Deployment sonucu

Bu, klasik yazılım güvenliğini agent sistemine uyarlamak anlamına geliyor. NIST SSDF de güvenli yazılım geliştirme pratiklerinin SDLC içine entegre edilmesini ve zafiyetlerin azaltılmasını hedefleyen yüksek seviyeli bir çerçeve sunuyor; bizim AI pipeline bunun makine tarafından işletilen hali olacak.  



⸻



3. Kurulacak ana katmanlar

3.1 Team Lead / Orchestrator katmanı

Bu sistemin beyni Team Lead Agent olacak.

Görevleri:

	•	gelen talebi anlamak,

	•	risk sınıfını belirlemek,

	•	alanı tanımak: web, mobil, AI, embedded, SaaS, finans, sağlık vb.,

	•	hangi agent’ların çalışacağını seçmek,

	•	işleri parçalara bölmek,

	•	çıktıların sözleşmeye uygun olup olmadığını kontrol etmek,

	•	kalite kapıları geçmeden sonraki aşamaya izin vermemek,

	•	release kararını tek başına değil, kanıt paketine göre vermek.

Team Lead doğrudan production’a dokunmayacak. Doğrudan kod da yazmayacak. Onun işi orkestrasyon ve karar denetimi.



⸻



3.2 Skill / Plugin / Tool katmanı

Agent’ların dış dünyaya etkide bulunması için kullandığı her şey skill/plugin/tool olacak.

Örnek skill’ler:

repo_read

branch_create

branch_write

test_runner

linter_runner

static_analysis

sast_scan

sca_scan

secret_scan

sbom_generator

license_checker

container_scan

iac_scan

openapi_validator

diagram_generator

benchmark_runner

accessibility_audit

pipeline_trigger

release_tag_create

production_deploy

rollback_trigger

observability_query

log_query

Burada en önemli kural şu:



Tool ne kadar güçlü ise agent’ın onu kullanma yetkisi o kadar dar olmalı.



MCP bu noktada iyi bir model sunuyor: resources, prompts ve tools ayrımıyla context, workflow ve çalıştırılabilir fonksiyonları standart şekilde expose etmeyi hedefliyor. MCP spesifikasyonu ayrıca tool’ların keyfi kod çalıştırma yolları açabileceği için güvenlik, kontrol, yetkilendirme ve veri koruma konularının dikkatle ele alınması gerektiğini vurguluyor.  



Bizim tarafta bu şu demek:

Agent her tool'u kullanamaz.

Her tool çağrısı loglanır.

Her destructive işlem policy gate ister.

Production deploy agent kararıyla değil, policy + evidence ile olur.

Secret değeri agent'a gösterilmez.



⸻



3.3 Policy Engine katmanı

Bu sistemde “hayır” diyebilen deterministik bir katman olacak.

LLM agent “release edebiliriz” dese bile policy engine şunları kontrol edecek:

- Testler geçti mi?

- Kritik güvenlik açığı var mı?

- Secret sızıntısı var mı?

- SBOM üretildi mi?

- Lisans ihlali var mı?

- Rollback planı var mı?

- Migration güvenli mi?

- Backup doğrulandı mı?

- Observability hazır mı?

- Release evidence bundle tamam mı?

Bunlardan biri eksikse release bloklanır.

Bu özellikle önemli, çünkü agent sistemlerinde güvenlik sadece klasik OWASP web güvenliği değildir. OWASP GenAI Security Project, LLM, agentic AI sistemleri ve AI-driven uygulamalar için güvenlik risklerini ve yönetişim rehberlerini kapsayan ayrı bir alan olarak ele alıyor.  



⸻



4. Kurulacak AI takım rolleri

Aşağıdaki yapı profesyonel bir yazılım ekibini AI rollerine bölüyor.

Rol

Görev

Yazabilir mi?

Release etkisi

AI Team Lead

İşleri böler, agent’ları yönetir, gate sonuçlarını toplar

Hayır / sınırlı

Karar önerir

Product Manager Agent

Problem, kullanıcı, MVP, başarı metriği çıkarır

Doküman

Dolaylı

Requirements Agent

Gereksinim, NFR, kabul kriteri, traceability üretir

Doküman

Gate etkisi var

Architecture Lead Agent

Mimari, veri akışı, ADR, servis sınırları üretir

Doküman

Gate etkisi var

Security Architect Agent

Threat model, auth, secret, abuse case, security requirement üretir

Doküman

Bloklayabilir

Data Privacy Agent

Veri envanteri, saklama, silme, kişisel veri riskleri

Doküman

Bloklayabilir

UX / Accessibility Agent

Kullanıcı akışı, erişilebilirlik, hata/boş durumlar

Doküman/test

Bloklayabilir

Tech Lead Agent

Teknik plan, branch stratejisi, görev dağıtımı

Sınırlı

Gate hazırlığı

Backend Dev Agent

Backend kodu ve testleri yazar

Branch

Hayır

Frontend Dev Agent

UI kodu, state, erişilebilirlik testleri yazar

Branch

Hayır

DB Dev Agent

Migration, rollback, indeks, transaction planı

Branch

Riskli gate

ML/AI Dev Agent

Model, prompt, eval, inference pipeline üretir

Branch

Riskli gate

Code Reviewer Agent

Kod doğruluğu, mimari uygunluk, güvenlik ve test denetler

Hayır

Bloklayabilir

QA Lead Agent

Test stratejisi ve test matrisi üretir

Doküman/test

Bloklayabilir

Test Automation Agent

Unit, integration, e2e, contract test yazar

Branch

Hayır

Security Tester Agent

SAST, SCA, secret scan, DAST, container scan çalıştırır

Hayır

Bloklayabilir

AI Red Team Agent

Prompt injection, tool misuse, data exfiltration test eder

Hayır

Bloklayabilir

Performance Tester Agent

Latency, throughput, CPU, RAM, GPU/VRAM testleri

Hayır

Bloklayabilir

DevOps/SRE Agent

CI/CD, deployment, observability, rollback, SLO

Branch/CI

Deploy hazırlar

Docs Writer Agent

README, changelog, API docs, runbook günceller

Branch

Gate etkisi var

Compliance Auditor Agent

Standart, lisans, alan regülasyonu, denetim matrisi

Hayır

Bloklayabilir

Release Manager Agent

Release paketi, sürüm, evidence bundle, rollback planı

Tag/CI

Gate önerir

Incident Commander Agent

Incident, rollback, postmortem, follow-up task

Operasyon

Acil durum

Knowledge Curator Agent

Proje hafızası, ADR, lesson learned, standart güncelleme

Doküman

Dolaylı

Ana kural:

Geliştiren agent ile onaylayan agent aynı olmayacak.



⸻



5. Pipeline yapısı

Kuracağımız SDLC pipeline şu olacak:

1. Intake

2. Requirements

3. Architecture

4. Security & Privacy Design

5. Planning

6. Implementation

7. Code Review

8. Verification

9. Security Validation

10. Performance / Accessibility

11. Release Candidate

12. Deploy

13. Operate & Improve

Bunu şöyle düşünebilirsin:

flowchart LR

  A[Intake] --> B[Requirements]

  B --> C[Architecture]

  C --> D[Security & Privacy]

  D --> E[Planning]

  E --> F[Implementation]

  F --> G[Review]

  G --> H[Verification]

  H --> I[Security Validation]

  I --> J[Release Candidate]

  J --> K[Deploy]

  K --> L[Operate & Improve]

  L --> B

Her aşamanın üç şeyi olacak:

Input contract

Output contract

Gate contract

Örneğin implementation aşaması:

Input:

- requirements_spec

- architecture_doc

- threat_model

- implementation_plan



Output:

- code_changes

- unit_tests

- integration_tests

- docs_changes



Gate:

- branch_only_changes

- no_secret_in_diff

- local_tests_pass

- linter_pass

- static_analysis_pass



⸻



6. Yetki modeli

Agent’lara “her şeye erişim” vermek en büyük hata olur.

Yetki seviyeleri şöyle olacak:

Seviye

Yetki

Kim kullanabilir?

L0

Sadece okuma

Çoğu agent

L1

Doküman yazma

PM, Requirements, Architecture, Docs

L2

Branch’e kod yazma

Dev agent’ları

L3

Sandbox komut çalıştırma

Dev, QA, Security tester

L4

CI pipeline tetikleme

Team Lead, QA, DevOps, Release

L5

Release tag oluşturma

Release Manager

L6

Production deploy

Sadece policy-gated DevOps/Release

L7

Destructive DB değişikliği

Varsayılan kapalı

Sert kurallar:

Main branch'e doğrudan yazmak yok.

Production secret okumak yok.

Runtime'da silent install yok.

Production deploy tek agent kararıyla yok.

Destructive migration backup doğrulanmadan yok.

Kanıt paketi olmadan release yok.



⸻



7. Artifact standardı

Agent’ların üreteceği dosyalar standart olacak.

Minimum artifact seti:

PROJECT_BRIEF.md

REQUIREMENTS_SPEC.md

NFR_CATALOG.md

TRACEABILITY_MATRIX.md

ARCHITECTURE.md

ADR-xxx.md

THREAT_MODEL.md

DATA_INVENTORY.md

TEST_STRATEGY.md

SECURITY_SCAN_REPORT.md

SBOM

LICENSE_REPORT.md

PERFORMANCE_REPORT.md

ACCESSIBILITY_REPORT.md

RELEASE_EVIDENCE.md

ROLLBACK_PLAN.md

RUNBOOK.md

POSTMORTEM.md

Her release için şu paket oluşacak:

Release Evidence Bundle

  - Commit / build ID

  - Requirement coverage

  - Test report

  - Security report

  - Dependency report

  - SBOM

  - License report

  - Performance report

  - Accessibility report

  - Deployment plan

  - Rollback plan

  - Residual risk

  - Final machine gate decision



⸻



8. Agent contract standardı

Her agent böyle tanımlanacak:

id: backend_dev_agent

mission: Backend servisleri, API, iş kuralları ve testleri geliştirir.

inputs:

  - requirements_spec

  - architecture_doc

  - api_contract

  - threat_model

outputs:

  - code_changes

  - unit_tests

  - integration_tests

  - api_contract_updates

may_use_tools:

  - repo_read

  - branch_write

  - sandbox_exec

  - test_runner

  - linter_runner

forbidden_tools:

  - production_deploy

  - secret_read

  - destructive_db_write

quality_gates:

  - local_tests_pass

  - linter_pass

  - no_secret_in_diff

handoffs:

  - code_reviewer_agent

  - qa_lead_agent

trace_required: true

evidence_required: true

Bu yapı sayesinde agent’ların davranışı “prompt’a emanet” edilmeyecek. Prompt sadece niyet verecek; gerçek sınırlar tool permission + policy gate + structured output ile korunacak.



⸻



9. Skill/plugin standardı

Her skill/plugin şu sözleşmeye sahip olacak:

id: test_runner

category: verification

risk: sandbox_exec

description: Unit, integration, contract, e2e veya smoke test çalıştırır.

inputs:

  - test_scope

  - branch

  - environment

outputs:

  - status

  - report_path

  - failed_tests

  - coverage

  - duration

side_effects:

  - sandbox_only

logging:

  trace_required: true

  redact_secrets: true

Skill tasarım kuralları:

	1	Tek sorumluluk.

	2	Parametre şeması açık.

	3	Çıktı makine okunabilir.

	4	Hata formatı standart.

	5	Tüm çağrılar trace edilir.

	6	Secret maskeleme zorunludur.

	7	Tool çıktısı doğrulanmadan güvenilir sayılmaz.

	8	Production etkili tool’lar policy gate arkasındadır.

	9	Destructive işlem varsayılan kapalıdır.

	10	Agent tool açıklamasına körü körüne güvenmez.



⸻



10. No-human governance modeli

İnsan yoksa, insan onayının yerini şu alacak:

LLM önerisi

+ deterministic test

+ static/security scan

+ policy-as-code

+ evidence bundle

+ trace log

+ rollback readiness

= machine approval

Yani “AI karar verdi” yeterli değil.



Release için minimum makine onayı:

requirements_gate: pass

architecture_gate: pass

security_design_gate: pass

code_review_gate: pass

test_gate: pass

security_scan_gate: pass

dependency_gate: pass

license_gate: pass

performance_gate: pass

docs_gate: pass

rollback_gate: pass

observability_gate: pass

release_evidence_gate: pass

Bunlardan biri fail ise:

release_status = blocked



⸻



11. Risk profilleri

Her proje aynı sertlikte yönetilmeyecek. Team Lead önce risk profilini seçecek.

Profil

Örnek

Gerekli sertlik

Prototype

Deneme, PoC

Hafif gate

Internal Tool

Şirket içi araç

Test + security minimum

Commercial Product

SaaS, mobil, web ürün

Tam SDLC gate

Regulated / High Risk

Finans, sağlık, kişisel veri yoğun ürün

Traceability + compliance

Safety Critical

Medikal cihaz, otomotiv, havacılık, endüstriyel kontrol

Bağımsız doğrulama + alan standardı

İnsan olmayacaksa özellikle regulated ve safety critical alanlarda sistemin evidence üretmesi daha da önemli olur. Teknik olarak agent pipeline çalışabilir; fakat bazı alanlarda yasal/sözleşmesel nihai sorumluluk hâlâ bir kurum, yetkili kişi veya sertifikasyon kuruluşuna ait olabilir. Bizim sistem bu durumlarda “onay veriyorum” diye davranmak yerine kanıt paketi üretir, riskleri işaretler ve release’i policy’ye bağlar.



⸻



12. AI agent güvenliği

Bu sistemin klasik yazılım güvenliğine ek olarak kendi riskleri var:

prompt injection

tool misuse

context poisoning

data exfiltration

unsafe delegation

agent self-approval

hallucinated test pass

fake evidence

secret leakage

dependency confusion

unbounded tool execution

Bunlara karşı kurallar:

Tool çıktısı güvenilir varsayılmaz.

Agent kendi yaptığı işi tek başına onaylayamaz.

Reviewer agent kod yazamaz.

Code agent production'a çıkamaz.

Secret agent'a gösterilmez.

Her tool çağrısı trace edilir.

Her karar evidence dosyasına bağlanır.

Prompt, policy yerine geçmez.

OWASP GenAI Security Project’in LLM ve agentic AI sistemleri için ayrı güvenlik çalışmaları yürütmesi de bu ayrımı destekliyor; agent sistemi kurarken klasik appsec kontrollerine ek olarak LLM/agent risklerini ayrı test etmek gerekir.  



⸻



13. Hazırladığım starter kitin içeriği

Dosya: AI SDLC Factory Starter Kit v0.1

İçinde şu yapı var:

ai_sdlc_factory_starter/

  README.md



  .ai/

    agents/

      team.yaml



    skills/

      registry.yaml



    pipelines/

      product_sdlc.yaml



    policies/

      tool_permissions.yaml

      quality_gates.yaml



    templates/

      PROJECT_BRIEF.md

      REQUIREMENTS_SPEC.md

      ARCHITECTURE.md

      ADR.md

      THREAT_MODEL.md

      TEST_STRATEGY.md

      RELEASE_EVIDENCE.md



  docs/

    AI_SOFTWARE_FACTORY.md

    NO_HUMAN_GOVERNANCE.md

    AGENT_CONTRACT.md

    SKILL_PLUGIN_STANDARD.md



  evidence/

    boş klasör

Bu starter kit şunları başlatıyor:

	•	AI takım rolleri,

	•	agent handoff mantığı,

	•	skill/plugin kayıt sistemi,

	•	SDLC pipeline,

	•	tool permission politikası,

	•	kalite kapıları,

	•	no-human governance modeli,

	•	release evidence standardı,

	•	doküman şablonları.



⸻



14. Bundan sonra kurulacak gerçek sistem

Bu v0.1 tasarımın üstüne gerçek implementation için şu bileşenler kurulmalı:

1. Orchestrator runtime

2. Agent registry

3. Skill/plugin registry

4. Policy engine

5. Repo connector

6. CI/CD connector

7. Test/scanner connector

8. Evidence store

9. Trace store

10. Project memory

11. Release gate service

12. Observability dashboard

Mantıksal mimari:

┌─────────────────────┐

│ User / Product Goal │

└──────────┬──────────┘

           ↓

┌─────────────────────┐

│  Team Lead Agent    │

└──────────┬──────────┘

           ↓

┌──────────────────────────────────────┐

│ Specialist Agents                    │

│ PM / Req / Arch / Sec / Dev / QA / Ops│

└──────────┬───────────────────────────┘

           ↓

┌─────────────────────┐

│ Skill / Tool Layer  │

└──────────┬──────────┘

           ↓

┌─────────────────────┐

│ Policy Engine       │

└──────────┬──────────┘

           ↓

┌─────────────────────┐

│ Evidence + Tracing  │

└──────────┬──────────┘

           ↓

┌─────────────────────┐

│ Release / Operate   │

└─────────────────────┘



⸻



15. Benim önerdiğim kurulum felsefesi

Bu sistemi şu şekilde kurmak en doğru yol olur:

Prompt-first değil.

Policy-first.



Agent-first değil.

Artifact-first.



Code-first değil.

Requirement + architecture + test-first.



Trust-first değil.

Verify-first.



One-agent değil.

Role-separated multi-agent.



Human approval değil.

Machine-enforced gates.

En kritik cümle şu:



AI’lar işi yapacak; ama AI’ların profesyonel davranmasını sağlayacak şey yine AI değil, sözleşmeler, yetki sınırları, otomatik testler, güvenlik taramaları, policy gate’ler ve kanıt paketleri olacak.



Böyle kurarsak sistem sadece “kod yazan agent” olmaz; gerçekten ürün çıkaran, test eden, güvenliğini kontrol eden, dokümante eden, release eden ve production’da izleyen AI yazılım takımı olur.



“””



—> devamını neden sen yapmadın anlamadım.





“””

Haklısın. Orada bırakmamam gerekiyordu. Önceki cevapta “bunu şöyle kurarız” seviyesinde kalmışım; senin beklentin ise doğrudan kurulmuş, dosyalanmış, çalıştırılabilir bir başlangıç sistemi idi.

Devamını yaptım.

Buradan indirebilirsin:

AI SDLC Factory v0.2 paketini indir

Bu v0.2 artık yalnızca doküman değil; içinde çalışan bir Python tabanlı AI software factory iskeleti var.

İçine koyduklarım

Paketin ana içeriği:

ai_sdlc_factory_v0_2/

  README.md

  pyproject.toml

  Makefile

  VALIDATION.md



  .ai/

    agents/

      team.yaml

    skills/

      registry.yaml

    pipelines/

      product_sdlc.yaml

    policies/

      tool_permissions.yaml

      quality_gates.yaml

      release_policy.yaml

    templates/



  src/

    ai_sdlc_factory/

      cli.py

      orchestrator.py

      config.py

      evidence.py

      models.py

      pipeline.py



      agents/

        base.py

        builtin.py



      policies/

        engine.py



      skills/

        base.py



      providers/

        base.py



  docs/

    AI_SOFTWARE_FACTORY.md

    AGENT_CONTRACT.md

    PIPELINE_CONTRACT.md

    POLICY_ENGINE.md

    RELEASE_EVIDENCE_STANDARD.md

    LLM_PROVIDER_ADAPTER.md

    IMPLEMENTATION_NOTES.md

    ROADMAP.md



  schemas/

    agent_contract.schema.json

    skill_contract.schema.json

    pipeline_stage.schema.json



  tests/

    test_config_contracts.py

    test_policy_engine.py

    test_pipeline_run.py

Bu sürüm ne yapıyor?

Bu paket şunları kuruyor:

	•	Team Lead / Orchestrator

	•	Agent registry

	•	Skill/plugin registry

	•	Pipeline runner

	•	Policy engine

	•	Tool permission modeli

	•	Quality gate sistemi

	•	Release policy

	•	Evidence bundle üretimi

	•	Trace log

	•	Örnek ürün kodu üretimi

	•	Test çalıştırma

	•	Security scan simülasyonu

	•	SBOM üretimi

	•	License report

	•	Performance report

	•	Rollback planı

	•	Release evidence

	•	Final machine decision

Yani artık şu akış çalışıyor:

Goal

  ↓

Product Manager Agent

  ↓

Requirements Agent

  ↓

Architecture Agent

  ↓

Security Architect Agent

  ↓

QA Lead Agent

  ↓

Tech Lead Agent

  ↓

Backend Dev Agent

  ↓

Code Reviewer Agent

  ↓

Test Automation Agent

  ↓

Security Tester Agent

  ↓

Performance Tester Agent

  ↓

DevOps/SRE Agent

  ↓

Release Manager Agent

  ↓

Policy Engine final decision

Çalıştırma

Paket açıldıktan sonra:

cd ai_sdlc_factory_v0_2

python -m venv .venv

source .venv/bin/activate

pip install -e '.[dev]'

python -m ai_sdlc_factory doctor

python -m ai_sdlc_factory run --goal "Kurumsal görev yönetimi SaaS ürünü" --profile commercial_product --workspace .runs/demo

python -m ai_sdlc_factory inspect --workspace .runs/demo

pytest

Windows PowerShell için:

cd ai_sdlc_factory_v0_2

python -m venv .venv

.\.venv\Scripts\Activate.ps1

pip install -e ".[dev]"

python -m ai_sdlc_factory doctor

python -m ai_sdlc_factory run --goal "Kurumsal görev yönetimi SaaS ürünü" --profile commercial_product --workspace .runs/demo

python -m ai_sdlc_factory inspect --workspace .runs/demo

pytest

Ben çalıştırıp doğruladım

Paket içinde VALIDATION.md dosyasına da yazdım.

Çalıştırılan kontroller:

PYTHONPATH=src python -m ai_sdlc_factory doctor

PYTHONPATH=src python -m ai_sdlc_factory run --goal "Kurumsal görev yönetimi SaaS ürünü" --profile commercial_product --workspace .runs/demo --clean

PYTHONPATH=src python -m ai_sdlc_factory inspect --workspace .runs/demo

PYTHONPATH=src pytest -q

Sonuç:

doctor: pass

pipeline decision: approved

stages passed: 13/13

blocker failures: 0

secret findings: 0

critical/high security findings: 0

tests: 5 passed

Bilerek böyle tasarladım

Bu sürümde gerçek LLM çağrısı bağlamadım. Çünkü önce güvenli omurgayı kurmak gerekiyordu.

Yani şunu yaptım:

Önce policy.

Sonra agent.



Önce evidence.

Sonra otomasyon.



Önce tool permission.

Sonra LLM tool kullanımı.



Önce gate.

Sonra release.

Bu yüzden agents/builtin.py içindeki agent’lar şu anda deterministic çalışıyor. Yani gerçek AI modeline gitmeden artifact üretiyorlar. Bu bilinçli bir karar: önce fabrikanın iskeleti, yetki sınırları, quality gate’leri, evidence üretimi ve release karar mekanizması doğru çalışmalı.

Gerçek LLM entegrasyonu için pakete şunu da koydum:

src/ai_sdlc_factory/providers/base.py

docs/LLM_PROVIDER_ADAPTER.md

Yani sonraki katman şuraya bağlanacak:

class AgentProvider(Protocol):

    def run_agent(self, ctx, stage, agent) -> AgentRunResult:

        ...

Şu anki paket seviyesi

Bu v0.2 şu an şudur:

AI Software Factory çekirdeği

+ çalışan CLI

+ YAML agent/team/skill/pipeline/policy tanımları

+ policy engine

+ evidence bundle

+ quality gates

+ test edilmiş demo run

Henüz şu değildir:

Gerçek OpenAI/Gemini/Claude agent runtime

GitHub PR açan sistem

Gerçek CI/CD tetikleyen sistem

Production deploy yapan sistem

MCP server

Web dashboard

Ama bunlar için doğru yerleri açtım:

providers/

skills/

policies/

.ai/

docs/ROADMAP.md

Önemli fark

Bu pakette “AI kod yazsın” yaklaşımı yok.

Bunun yerine şunu kurmaya başladım:

AI takım çalışsın.

Ama yetkileri sınırlı olsun.

Her çıktısı artifact olsun.

Her artifact gate'ten geçsin.

Her release evidence'a bağlı olsun.

Hiçbir agent kendi işini onaylamasın.

Production/destructive/secret tool'lar varsayılan kapalı olsun.

Yani bu artık senin tarif ettiğin yapının temeli:

skill/plugin/agent/sub-agent/pipeline/team-lead/takım

haline geldi.

Dosya tekrar burada:

AI SDLC Factory v0.2 paketini indir



“””
