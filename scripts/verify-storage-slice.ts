import { runProviderVerticalSlice } from '../src/providerVerticalSlice.ts';
import { FileSnapshotStore, InMemorySliceStore } from '../src/storage/localStore.ts';
import { toStoredSliceRecord } from '../src/storage/storageContracts.ts';
import type { Scenario } from '../src/contracts/verticalSliceContracts.ts';

type Check = { name: string; pass: boolean; details?: Record<string, unknown> };

function check(name: string, pass: boolean, details?: Record<string, unknown>): Check {
  return { name, pass, details };
}

const scenarios: Scenario[] = ['happy_path', 'missing_source_refs', 'fallback_path'];
const memoryStore = new InMemorySliceStore();
const fileStore = new FileSnapshotStore();

for (const scenario of scenarios) {
  const record = toStoredSliceRecord(runProviderVerticalSlice(scenario));
  memoryStore.save(record);
  fileStore.save(record);
}

const memorySnapshot = memoryStore.snapshot();
const fileSnapshot = fileStore.snapshot();
const fileJson = fileStore.toJson();
const fileJsonAgain = fileStore.toJson();

const happy = memorySnapshot.records.find((record) => record.hostRequest.scenario === 'happy_path');
const blocked = memorySnapshot.records.find((record) => record.hostRequest.scenario === 'missing_source_refs');
const fallback = memorySnapshot.records.find((record) => record.hostRequest.scenario === 'fallback_path');

const assertions: Check[] = [
  check('memory store has three records', memorySnapshot.records.length === 3, { memorySnapshot }),
  check('file store has matching records', fileSnapshot.records.length === memorySnapshot.records.length, { fileSnapshot }),
  check('file snapshot json is deterministic', fileJson === fileJsonAgain, { fileJson }),
  check('happy record stores one accepted artifact', happy?.acceptedArtifacts.length === 1, { happy }),
  check('happy record stores accepted status', happy?.status === 'accepted' && happy.reasonCode === 'NONE', { happy }),
  check('blocked record stores missing source reason', blocked?.status === 'blocked' && blocked.reasonCode === 'MISSING_SOURCE_REFS', { blocked }),
  check('blocked record stores zero accepted artifacts', blocked?.acceptedArtifacts.length === 0, { blocked }),
  check('fallback record stores fallback reason', fallback?.status === 'fallback_used' && fallback.reasonCode === 'FALLBACK_SELECTED', { fallback }),
  check('fallback record stores zero accepted artifacts', fallback?.acceptedArtifacts.length === 0, { fallback }),
  check('all stored records include runtime events', memorySnapshot.records.every((record) => record.runtimeEvents.length > 0), { memorySnapshot }),
  check('all stored records include state history', memorySnapshot.records.every((record) => record.stateHistory[0] === 'created'), { memorySnapshot }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
console.log(JSON.stringify({ suite_id: 'storage-slice', status, assertions }, null, 2));

if (status !== 'pass') process.exit(1);
