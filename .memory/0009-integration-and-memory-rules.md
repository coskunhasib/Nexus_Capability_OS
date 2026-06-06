# 0009 — Integration and Memory Rules

Bu dosya; `nexus` branch'inin izolasyon kurallarını, `LLM_Calismalari` reposuna yapılacak gelecekteki entegrasyon mantığını ve sistemdeki genel hafıza/dokümantasyon yönetim yönergelerini içerir.

```text
Son güncelleme: 2026-06-06
nexus HEAD: 45babcc
```

---

## 1. Bağımsız Branch ve Main İzolasyonu

`Nexus_Capability_OS` reposundaki `nexus` branch'i tamamen bağımsız ve izole bir çalışma alanıdır.

### Kesin Kurallar:
- **Merge Yasağı:** `nexus` branch'inin `main` branch'i ile birleştirilmesi (merge edilmesi) kesinlikle **YASAKTIR**.
- **Main İzolasyonu:** `main` branch'ine hiçbir şekilde müdahale edilmeyecek, commit atılmayacak ve `main` branch'indeki dosyalar değiştirilmeyecektir.
- Bu repo ve branch, sadece Nexus AI Orchestration Model ve ilişkili yeteneklerin olgunlaştırıldığı, test edildiği izole bir laboratuvar/tasarım alanıdır.

---

## 2. Gelecekteki Entegrasyon Mantığı (LLM_Calismalari)

Bu repo ve `nexus` branch'inde yürütülen tüm çalışmalar, mimari yeterliliğe ve olgunluğa ulaştıktan sonra başka bir repo bünyesine dahil edilecektir.

### Entegrasyon Kapsamı ve Zamanlaması:
- **Hedef Repo:** `LLM_Calismalari` (veya `LLM_Clismalari`)
- **Hedef Proje:** `nexus` projesi
- **Rol:** `nexus` branch'indeki bu yetenek işletim sistemi ve şablonlar, hedef projeye yeni bir **özellik/modül (feature/module)** olarak entegre edilecektir.
- **Zamanlama:** Bu entegrasyon hemen yapılmayacaktır; projenin olgunlaşmasından **çok daha sonra** gerçekleştirilecektir. Şu anki çalışmalar tamamen bu entegrasyonun altyapısını hazırlamak ve mantığını kurmak üzerinedir.

---

## 3. Hafıza ve Dokümantasyon Yönetimi (Memory Rules)

Sistemdeki karar, bağlam ve tartışma geçmişinin kaybolmaması ve aynı zamanda bağlam şişmesinin (context window overflow) önlenmesi için sıkı bir hafıza yönetim modeli uygulanır.

### Hafıza Kuralları:
1. **Dosya Konumu:** Tüm sohbet hafızası ve kilitlenen kararlar `.memory/` klasörü altında tutulur.
2. **Sıralı Dokümantasyon:** Hafıza dosyaları çoklu ve sıralı markdown dosyaları halinde tutulmalıdır (`0000-...`, `0001-...`, `0002-...`, vb.). Dosyalar şiştikçe veya yeni bir oturum başladığında yeni bir sıra numarasıyla yeni bir parça açılır.
3. **Sürekli Güncelleme (Continuous Update):** Dokümanlar her önemli karar aşamasında ve oturum sonunda güncellenmelidir.
4. **Temizlik ve Budama:** Eskiyen, geçerliliğini yitiren, çelişkili veya artık gereksiz hale gelen tüm bilgiler dokümanlardan **düzenli olarak temizlenmeli ve budanmalıdır**. Dokümanların her zaman güncel, sade ve nokta atışı bilgi içermesi sağlanmalıdır.
