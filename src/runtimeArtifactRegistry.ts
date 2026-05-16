import type { RuntimeBridgeEvent } from './runtimeAdapter.ts';

export type RuntimeArtifactRecord = {
  artifact_id: string;
  kind: string;
  ref: string;
  summary: string;
  step_id: string;
  event_id?: string;
  event_type: string;
  created_at: string;
};

export type RuntimeArtifactRegistry = {
  artifacts: RuntimeArtifactRecord[];
  repeated: RuntimeArtifactRecord[];
  keys: string[];
  updated_at: string;
};

function nowIso() {
  return new Date().toISOString();
}

export function artifactKey(record: Pick<RuntimeArtifactRecord, 'kind' | 'ref' | 'step_id'>) {
  return `${record.step_id}:${record.kind}:${record.ref}`;
}

export function createRuntimeArtifactRegistry(at = nowIso()): RuntimeArtifactRegistry {
  return { artifacts: [], repeated: [], keys: [], updated_at: at };
}

export function collectArtifactRecordsFromEvents(events: RuntimeBridgeEvent[]) {
  const records: RuntimeArtifactRecord[] = [];
  for (const event of events) {
    for (const artifact of event.artifact_refs ?? []) {
      records.push({
        artifact_id: artifactKey({ kind: artifact.kind, ref: artifact.ref, step_id: event.step_id }),
        kind: artifact.kind,
        ref: artifact.ref,
        summary: artifact.summary,
        step_id: event.step_id,
        event_id: event.event_id,
        event_type: event.event_type,
        created_at: event.timestamp,
      });
    }
  }
  return records;
}

export function appendRuntimeArtifacts(registry: RuntimeArtifactRegistry, records: RuntimeArtifactRecord[], at = nowIso()) {
  const keys = new Set(registry.keys);
  const artifacts: RuntimeArtifactRecord[] = [];
  const repeated: RuntimeArtifactRecord[] = [];

  for (const record of records) {
    const key = record.artifact_id || artifactKey(record);
    const normalized = { ...record, artifact_id: key };
    if (keys.has(key)) {
      repeated.push(normalized);
    } else {
      keys.add(key);
      artifacts.push(normalized);
    }
  }

  return {
    registry: {
      artifacts: [...registry.artifacts, ...artifacts],
      repeated: [...registry.repeated, ...repeated],
      keys: Array.from(keys),
      updated_at: at,
    },
    artifacts,
    repeated,
  };
}

export function buildRuntimeArtifactRegistryFromEvents(events: RuntimeBridgeEvent[], at = nowIso()) {
  return appendRuntimeArtifacts(createRuntimeArtifactRegistry(at), collectArtifactRecordsFromEvents(events), at).registry;
}

export function summarizeRuntimeArtifactRegistry(registry: RuntimeArtifactRegistry) {
  const kind_counts = Object.fromEntries(
    Array.from(new Set(registry.artifacts.map((artifact) => artifact.kind))).map((kind) => [
      kind,
      registry.artifacts.filter((artifact) => artifact.kind === kind).length,
    ]),
  );
  const step_counts = Object.fromEntries(
    Array.from(new Set(registry.artifacts.map((artifact) => artifact.step_id))).map((stepId) => [
      stepId,
      registry.artifacts.filter((artifact) => artifact.step_id === stepId).length,
    ]),
  );

  return {
    artifact_count: registry.artifacts.length,
    repeated_count: registry.repeated.length,
    kind_counts,
    step_counts,
    updated_at: registry.updated_at,
  };
}
