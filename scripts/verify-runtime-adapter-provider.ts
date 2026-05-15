import { buildRuntimeAdapterRequest, type TaskPacket } from '../src/runtimeAdapter.ts';
import {
  createRuntimeAdapterProviderRegistry,
  dispatchRuntimeAdapterRequest,
  getRuntimeAdapterProvider,
  type RuntimeAdapterProvider,
} from '../src/runtimeAdapterProvider.ts';
import { mockRuntimeAdapterProvider } from '../src/runtimeAdapters/mockRuntimeAdapterProvider.ts';
import { createHttpRuntimeAdapterProvider } from '../src/runtimeAdapters/httpRuntimeAdapterProvider.ts';

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify runtime adapter provider interface',
  source_compiler_rule: 'rule-runtime-adapter-provider',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['runtime-adapter'],
    capability_packs: ['runtime-adapter-pack'],
    skills: ['quality-assurance-skill'],
  },
  skills: [{ skill: 'quality-assurance-skill', required: true }],
  team: [{ profile: 'runtime-adapter-engineer', role: 'owner_or_reviewer' }],
  gates: [{ gate: 'adapter-contract-fit', required: true }],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-provider-dispatch',
      title: 'Provider Dispatch',
      owner: 'runtime-adapter-engineer',
      description: 'Dispatch through provider interface.',
      expected_outputs: ['runtime_adapter_response'],
      required_gates: ['adapter-contract-fit'],
      status: 'not_started',
    },
  ],
};

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

async function expectRejects(name: string, fn: () => Promise<unknown>, includes: string) {
  try {
    await fn();
    return assert(name, false, { reason: 'expected rejection' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return assert(name, message.includes(includes), { message });
  }
}

const request = buildRuntimeAdapterRequest(samplePacket, 'mock');
const registry = createRuntimeAdapterProviderRegistry([
  mockRuntimeAdapterProvider,
  createHttpRuntimeAdapterProvider({ endpoint_url: '', timeout_ms: 1000 }),
]);
const mockProvider = getRuntimeAdapterProvider(registry, 'mock');
const httpProvider = getRuntimeAdapterProvider(registry, 'http');
const mockResponse = await dispatchRuntimeAdapterRequest(mockProvider, request);
const missingProviderCheck = await expectRejects(
  'unknown provider throws clear error',
  async () => getRuntimeAdapterProvider(registry, 'missing'),
  'Unknown runtime adapter provider',
);
const httpMissingEndpointCheck = await expectRejects(
  'http provider requires endpoint_url',
  async () => dispatchRuntimeAdapterRequest(httpProvider, { ...request, dispatch: { ...request.dispatch, mode: 'real' } }),
  'endpoint_url is required',
);

let capturedRequest: unknown = null;
const fakeHttpProvider: RuntimeAdapterProvider = {
  id: 'http-test',
  label: 'HTTP Test Provider',
  mode: 'http',
  description: 'Test provider that captures request shape without network.',
  async dispatch(runtimeRequest) {
    capturedRequest = runtimeRequest;
    return {
      packet_type: 'nexus.runtime_adapter_response',
      version: '0.1',
      request_id: runtimeRequest.request_id,
      accepted: true,
      status: 'accepted',
      job: {
        job_id: 'job-http-test',
        target_worker: runtimeRequest.dispatch.target_worker,
        started_at: '2026-05-15T00:00:00.000Z',
      },
      events: [],
    };
  },
};
const fakeHttpResponse = await dispatchRuntimeAdapterRequest(fakeHttpProvider, { ...request, dispatch: { ...request.dispatch, mode: 'real' } });

const assertions = [
  assert('registry contains mock provider', registry.mock?.id === 'mock', { keys: Object.keys(registry) }),
  assert('registry contains http provider', registry.http?.id === 'http', { keys: Object.keys(registry) }),
  assert('mock provider mode is mock', mockProvider.mode === 'mock', { mode: mockProvider.mode }),
  assert('http provider mode is http', httpProvider.mode === 'http', { mode: httpProvider.mode }),
  assert('mock provider dispatch accepts request', mockResponse.accepted === true, { accepted: mockResponse.accepted, status: mockResponse.status }),
  assert('mock provider emits runtime events', mockResponse.events.length > 0, { event_count: mockResponse.events.length }),
  assert('dispatch helper preserves request_id', mockResponse.request_id === request.request_id, { response_request_id: mockResponse.request_id, request_id: request.request_id }),
  missingProviderCheck,
  httpMissingEndpointCheck,
  assert('fake http provider captures runtime adapter request', Boolean(capturedRequest), { captured: Boolean(capturedRequest) }),
  assert('fake http provider returns accepted response', fakeHttpResponse.accepted === true && fakeHttpResponse.status === 'accepted', { accepted: fakeHttpResponse.accepted, status: fakeHttpResponse.status }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'runtime-adapter-provider',
  status,
  assertions,
  providers: Object.values(registry).map((provider) => ({ id: provider.id, label: provider.label, mode: provider.mode })),
  mock_response: {
    accepted: mockResponse.accepted,
    status: mockResponse.status,
    event_count: mockResponse.events.length,
  },
  fake_http_response: {
    accepted: fakeHttpResponse.accepted,
    status: fakeHttpResponse.status,
    event_count: fakeHttpResponse.events.length,
  },
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Runtime adapter provider verification failed.');
  process.exit(1);
}
