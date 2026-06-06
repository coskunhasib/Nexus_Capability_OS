# .memory

Bu klasör, Nexus AI Orchestration Model tartışmasının repo-safe sohbet hafızasını tutar.

Amaç:

```text
Sohbet şişmesini azaltmak
Kararları kaybetmemek
Sonraki oturumlarda bağlamı hızlı geri yüklemek
Codex / Claude Code / Antigravity iş paketleri öncesinde ortak hafıza sağlamak
```

## Parçalama kuralı

Dosya şişerse yeni parça açılır.

Önerilen adlandırma:

```text
0001-session-summary.md
0002-locked-decisions.md
0003-sdlc-research-baseline.md
0004-next-actions.md
0005-current-status-and-bootstrap.md
0006-coordination-runtime-gap-extension.md
0007-mission-system-extension.md
0008-post-launch-frontier-backlog.md
0009-integration-and-memory-rules.md
0010-...
```

## Yazım kuralları

- Private credential, raw log, path, screenshot veya kişisel bilgi yazılmaz.
- Sadece repo-safe karar, bağlam ve tartışma özeti yazılır.
- Kesin kararlar ile açık tartışmalar ayrı tutulur.
- Eski karar değişirse yeni dosyada decision superseded olarak işaretlenir.
- Büyük hafıza tek dosyada büyütülmez; yeni parça açılır.
- **Dallanma ve Entegrasyon Kuralı:** `nexus` branch'i tamamen bağımsızdır. Bu branch'in `main` branch'i ile birleştirilmesi (merge) kesinlikle yasaktır ve `main` branch'ine hiçbir koşulda müdahale edilmez. Bu repo ve branch olgunlaştırıldıktan sonra, `LLM_Calismalari` reposundaki `nexus` projesine bir özellik/modül olarak entegre edilecektir.
- **Hafıza Yönetimi:** Tüm hafıza ve oturum bağlamları bu `.memory` klasörü altında sıralı markdown dosyaları şeklinde tutulur. Bu dokümanlar sürekli güncel tutulmalı, eskiyen ve geçerliliğini yitiren gereksiz bilgiler düzenli olarak temizlenmeli ve budanmalıdır.

## Güncel parçalar

```text
0001-session-summary.md
0002-locked-decisions.md
0003-sdlc-research-baseline.md
0004-next-actions.md
0005-current-status-and-bootstrap.md
0006-coordination-runtime-gap-extension.md
0007-mission-system-extension.md
0008-post-launch-frontier-backlog.md
0009-integration-and-memory-rules.md
```
