# Review Report Hardening

The hardened review report separates review evidence into clear buckets:

```text
human_entered_evidence
runtime_reported_evidence
artifact_backed_evidence
missing_evidence
failed_gates
release_blockers
```

Verification:

```bash
npm run verify:review-hardening
```
