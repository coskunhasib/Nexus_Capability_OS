import { applyRuntimeEventsToRunnerState, runtimeEventKey, type EvidenceState, type RuntimeBridgeEvent, type WorkStatus } from './runtimeAdapter.ts';

export type RuntimeEventSource = 'adapter_response' | 'callback';

export type RuntimeEventStoreEntry = {
  sequence: number;
  key: string;
  source: RuntimeEventSource;
  received_at: string;
  event: RuntimeBridgeEvent;
};

export type RuntimeEventStore = {
  request_id: string;
  job_id: string;
  entries: RuntimeEventStoreEntry[];
  repeated: RuntimeEventStoreEntry[];
  keys: string[];
  updated_at: string;
};

function nowIso() {
  return new Date().toISOString();
}

export function createRuntimeEventStore(requestId: string, jobId: string, at = nowIso()): RuntimeEventStore {
  return { request_id: requestId, job_id: jobId, entries: [], repeated: [], keys: [], updated_at: at };
}

export function appendRuntimeEvents(store: RuntimeEventStore, events: RuntimeBridgeEvent[], source: RuntimeEventSource, at = nowIso()) {
  const keys = new Set(store.keys);
  const entries: RuntimeEventStoreEntry[] = [];
  const repeated: RuntimeEventStoreEntry[] = [];
  let sequence = store.entries.length + store.repeated.length;

  for (const event of events) {
    sequence += 1;
    const key = runtimeEventKey(event);
    const entry = { sequence, key, source, received_at: at, event };
    if (keys.has(key)) {
      repeated.push(entry);
    } else {
      keys.add(key);
      entries.push(entry);
    }
  }

  return {
    store: {
      ...store,
      entries: [...store.entries, ...entries],
      repeated: [...store.repeated, ...repeated],
      keys: Array.from(keys),
      updated_at: at,
    },
    entries,
    repeated,
  };
}

export function summarizeRuntimeEventStore(store: RuntimeEventStore) {
  return {
    request_id: store.request_id,
    job_id: store.job_id,
    entry_count: store.entries.length,
    repeated_count: store.repeated.length,
    adapter_response_count: store.entries.filter((entry) => entry.source === 'adapter_response').length,
    callback_count: store.entries.filter((entry) => entry.source === 'callback').length,
    event_types: Array.from(new Set(store.entries.map((entry) => entry.event.event_type))),
    last_received_at: store.entries.at(-1)?.received_at,
  };
}

export function replayRuntimeEventStore(store: RuntimeEventStore, statuses: Record<string, WorkStatus>, evidence: EvidenceState) {
  const ordered = [...store.entries].sort((a, b) => a.sequence - b.sequence);
  const patch = applyRuntimeEventsToRunnerState(statuses, evidence, ordered.map((entry) => entry.event));
  return { ...patch, entries: ordered, summary: summarizeRuntimeEventStore(store) };
}

export function runtimeEventStoreTimeline(store: RuntimeEventStore) {
  return [...store.entries].sort((a, b) => a.sequence - b.sequence).map((entry) => ({
    sequence: entry.sequence,
    source: entry.source,
    event_type: entry.event.event_type,
    step_id: entry.event.step_id,
    status: entry.event.status,
    received_at: entry.received_at,
  }));
}
