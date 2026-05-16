# Runtime Artifact Registry

Runtime artifact registry normalizes artifact refs reported by runtime events.

It supports:

```text
collect artifact refs from runtime events
create stable artifact_id values
append unique artifact records
track repeated artifact records separately
summarize artifacts by kind and step
```

Verification:

```bash
npm run verify:artifacts
```
