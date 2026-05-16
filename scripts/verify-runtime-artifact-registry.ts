import { buildMockRuntimeCallbackPayload, buildRuntimeAdapterRequest, runMockRuntimeAdapter, type TaskPacket } from '../src/runtimeAdapter.ts';
import { appendRuntimeArtifacts, buildRuntimeArtifactRegistryFromEvents, collectArtifactRecordsFromEvents, createRuntimeArtifactRegistry, summarizeRuntimeArtifactRegistry } from '../src/runtimeArtifactRegistry.ts';

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify runtime artifact registry',
  source_compiler_rule: 'rule-runtime-artifact-registry',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['runtime-adapter'],
    capability_packs: ['runtime-adapter-pack'],
    skills: ['quality-assurance-skill'],
  },
  skills: [{ skill: 'quality-assurance-skill', required: true }],
  team: [{ profile: 'runtime-adapter-engineer', role: 'owner_or_reviewer' }],
  gates: [{ gate: 'artifact-evidence', required: true }],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-artifacts',
      title: 'Produce Artifacts',
      owner: 'runtime-adapter-engineer',
      description: 'Produce runtime artifact refs.',
      expected_outputs: ['runtime_adapter_request', 'runtime_adapter_response', 'artifact_registry'],
      required_gates: ['artifact-evidence'],
      status: 'not_started',
    },
    {
      order: 2,
      id: '02-callback-artifacts',
      title: 'Produce Callback Artifacts',
      owner: 'runtime-adapter-engineer',
      description: 'Produce callback artifact refs.',
      expected_outputs: ['callback_artifact'],
      required_gates: ['artifact-evidence'],
      status: 'not_started',
    },
  ],
};

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

function uniqueCount(values: string[]) {
  return new Set(values).size;
}

const request = buildRuntimeAdapterRequest(samplePacket, 'mock');
const response = runMockRuntimeAdapter(request);
const callback = buildMockRuntimeCallbackPayload(request, response, 6);
const responseRecords = collectArtifactRecordsFromEvents(response.events);
const callbackRecords = collectArtifactRecordsFromEvents(callback.events);
const responseUniqueCount = uniqueCount(responseRecords.map((record) => record.artifact_id));
const callbackUniqueCount = uniqueCount(callbackRecords.map((record) => record.artifact_id));
const responseRepeatCount = responseRecords.length - responseUniqueCount;
const callbackRepeatCount = callbackRecords.length - callbackUniqueCount;
const registry0 = createRuntimeArtifactRegistry('2026-05-15T00:00:00.000Z');
const appendResponse = appendRuntimeArtifacts(registry0, responseRecords, '2026-05-15T00:00:01.000Z');
const appendCallback = appendRuntimeArtifacts(appendResponse.registry, callbackRecords, callback.received_at);
const appendRepeat = appendRuntimeArtifacts(appendCallback.registry, callbackRecords, callback.received_at);
const builtRegistry = buildRuntimeArtifactRegistryFromEvents([...response.events, ...callback.events], '2026-05-15T00:00:02.000Z');
const summary = summarizeRuntimeArtifactRegistry(appendRepeat.registry);
const builtSummary = summarizeRuntimeArtifactRegistry(builtRegistry);
const expectedRepeatCount = responseRepeatCount + callbackRepeatCount + callbackUniqueCount;

const assertions = [
  assert('response artifact records are collected', responseRecords.length > 0, { response_records: responseRecords.length }),
  assert('callback artifact records are collected', callbackRecords.length > 0, { callback_records: callbackRecords.length }),
  assert('artifact ids are stable strings', responseRecords.every((record) => record.artifact_id.includes(record.step_id) && record.artifact_id.includes(record.kind)), { sample: responseRecords[0] }),
  assert('response artifacts append unique records', appendResponse.artifacts.length === responseUniqueCount, { appended: appendResponse.artifacts.length, unique: responseUniqueCount, raw: responseRecords.length, repeated: appendResponse.repeated.length }),
  assert('callback artifacts append unique records', appendCallback.artifacts.length === callbackUniqueCount, { appended: appendCallback.artifacts.length, unique: callbackUniqueCount, raw: callbackRecords.length, repeated: appendCallback.repeated.length }),
  assert('repeated callback artifacts are deduped', appendRepeat.artifacts.length === 0 && appendRepeat.repeated.length === callbackUniqueCount, { appended: appendRepeat.artifacts.length, repeated: appendRepeat.repeated.length, unique: callbackUniqueCount }),
  assert('registry total artifact count excludes repeats', summary.artifact_count === responseUniqueCount + callbackUniqueCount, { summary, responseUniqueCount, callbackUniqueCount }),
  assert('registry repeat count is tracked', summary.repeated_count === expectedRepeatCount, { summary, expectedRepeatCount }),
  assert('summary includes kind counts', Object.keys(summary.kind_counts).length > 0, { kind_counts: summary.kind_counts }),
  assert('summary includes step counts', Object.keys(summary.step_counts).length > 0, { step_counts: summary.step_counts }),
  assert('built registry matches append path artifact count', builtSummary.artifact_count === summary.artifact_count, { builtSummary, summary }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'runtime-artifact-registry',
  status,
  assertions,
  response_records: responseRecords.length,
  callback_records: callbackRecords.length,
  summary,
  builtSummary,
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Runtime artifact registry verification failed.');
  process.exit(1);
}
