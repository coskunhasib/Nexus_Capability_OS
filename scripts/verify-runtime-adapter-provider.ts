import { buildRuntimeAdapterRequest, type RuntimeAdapterResponse, type TaskPacket } from '../src/runtimeAdapter.ts';
import {
  createRuntimeAdapterProviderRegistry,
  dispatchRuntimeAdapterRequest,
  getRuntimeAdapterProvider,
  isRuntimeAdapterResponse,
  RuntimeAdapterProviderError,
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

function acceptedResponse(requestId: string, targetWorker: string): RuntimeAdapterResponse {
  return {
    packet_type: 'nexus.runtime_adapter_response',
    version: '0.1',
    request_id: requestId,
    accepted: true,
    status: 'accepted',
    job: {
      job_id: 'job-http-test',
      target_worker: targetWorker,
      started_at: '2026-05-15T00:00:00.000Z',
    },
    events: [],
  };
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

async function expectRejects(name: string, fn: () => Promise<unknown>, includes: string, expectedCode?: string) {
  try {
    await fn();
    return assert(name, false, { reason: 'expected rejection' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code = error instanceof RuntimeAdapterProviderError ? error.code : undefined;
    return assert(name, message.includes(includes) && (!expectedCode || code === expectedCode), { message, code });
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
const mockHealth = await mockProvider.healthCheck?.();
const httpUnconfiguredHealth = await httpProvider.healthCheck?.();

const missingProviderCheck = await expectRejects(
  'unknown provider throws clear error',
  async () => getRuntimeAdapterProvider(registry, 'missing'),
  'Unknown runtime adapter provider',
  'UNKNOWN_PROVIDER',
);
const httpMissingEndpointCheck = await expectRejects(
  'http provider requires endpoint_url',
  async () => dispatchRuntimeAdapterRequest(httpProvider, { ...request, dispatch: { ...request.dispatch, mode: 'real' } }),
  'endpoint_url is required',
  'HTTP_ENDPOINT_REQUIRED',
);

let capturedRequest: unknown = null;
const fakeHttpProvider: RuntimeAdapterProvider = {
  id: 'http-test',
  label: 'HTTP Test Provider',
  mode: 'http',
  description: 'Test provider that captures request shape without network.',
  async dispatch(runtimeRequest) {
    capturedRequest = runtimeRequest;
    return acceptedResponse(runtimeRequest.request_id, runtimeRequest.dispatch.target_worker);
  },
};
const fakeHttpResponse = await dispatchRuntimeAdapterRequest(fakeHttpProvider, { ...request, dispatch: { ...request.dispatch, mode: 'real' } });

const httpCalls: Array<{ method: string; body?: unknown }> = [];
const successfulHttpFetch: typeof fetch = async (_input, init) => {
  const bodyText = init?.body ? String(init.body) : '';
  httpCalls.push({ method: init?.method ?? '', body: bodyText ? JSON.parse(bodyText) : undefined });
  return jsonResponse(acceptedResponse(request.request_id, request.dispatch.target_worker));
};
const successfulHttpProvider = createHttpRuntimeAdapterProvider({
  endpoint_url: 'https://runtime.local/dispatch',
  healthcheck_url: 'https://runtime.local/health',
  timeout_ms: 1000,
  fetch_impl: successfulHttpFetch,
});
const successfulHttpResponse = await dispatchRuntimeAdapterRequest(successfulHttpProvider, { ...request, dispatch: { ...request.dispatch, mode: 'real' } });
const successfulHealth = await successfulHttpProvider.healthCheck?.();
const dispatchCall = httpCalls.find((call) => call.method === 'POST');
const healthCall = httpCalls.find((call) => call.method === 'GET');

const invalidShapeProvider = createHttpRuntimeAdapterProvider({
  endpoint_url: 'https://runtime.local/dispatch',
  timeout_ms: 1000,
  fetch_impl: async () => jsonResponse({ ok: true }),
});
const invalidShapeCheck = await expectRejects(
  'http provider rejects invalid response shape',
  async () => dispatchRuntimeAdapterRequest(invalidShapeProvider, { ...request, dispatch: { ...request.dispatch, mode: 'real' } }),
  'invalid runtime adapter response shape',
  'INVALID_RUNTIME_ADAPTER_RESPONSE',
);

const invalidJsonProvider = createHttpRuntimeAdapterProvider({
  endpoint_url: 'https://runtime.local/dispatch',
  timeout_ms: 1000,
  fetch_impl: async () => new Response('not json', { status: 200 }),
});
const invalidJsonCheck = await expectRejects(
  'http provider rejects invalid json',
  async () => dispatchRuntimeAdapterRequest(invalidJsonProvider, { ...request, dispatch: { ...request.dispatch, mode: 'real' } }),
  'invalid JSON',
  'INVALID_JSON',
);

let retryAttempts = 0;
const retryHttpProvider = createHttpRuntimeAdapterProvider({
  endpoint_url: 'https://runtime.local/dispatch',
  timeout_ms: 1000,
  retry_policy: { max_retries: 1, retry_delay_ms: 0, retry_on_statuses: [503] },
  fetch_impl: async () => {
    retryAttempts += 1;
    if (retryAttempts === 1) return jsonResponse({ error: 'busy' }, 503);
    return jsonResponse(acceptedResponse(request.request_id, request.dispatch.target_worker));
  },
});
const retryHttpResponse = await dispatchRuntimeAdapterRequest(retryHttpProvider, { ...request, dispatch: { ...request.dispatch, mode: 'real' } });

const nonRetryHttpProvider = createHttpRuntimeAdapterProvider({
  endpoint_url: 'https://runtime.local/dispatch',
  timeout_ms: 1000,
  retry_policy: { max_retries: 1, retry_delay_ms: 0, retry_on_statuses: [503] },
  fetch_impl: async () => jsonResponse({ error: 'bad request' }, 400),
});
const nonRetryCheck = await expectRejects(
  'http provider maps non-retry status errors',
  async () => dispatchRuntimeAdapterRequest(nonRetryHttpProvider, { ...request, dispatch: { ...request.dispatch, mode: 'real' } }),
  'failed with 400',
  'HTTP_STATUS_ERROR',
);

const assertions = [
  assert('registry contains mock provider', registry.mock?.id === 'mock', { keys: Object.keys(registry) }),
  assert('registry contains http provider', registry.http?.id === 'http', { keys: Object.keys(registry) }),
  assert('mock provider mode is mock', mockProvider.mode === 'mock', { mode: mockProvider.mode }),
  assert('http provider mode is http', httpProvider.mode === 'http', { mode: httpProvider.mode }),
  assert('mock provider health check is healthy', mockHealth?.ok === true && mockHealth.status === 'healthy', { mockHealth }),
  assert('http unconfigured health check is explicit', httpUnconfiguredHealth?.ok === false && httpUnconfiguredHealth.status === 'unconfigured', { httpUnconfiguredHealth }),
  assert('mock provider dispatch accepts request', mockResponse.accepted === true, { accepted: mockResponse.accepted, status: mockResponse.status }),
  assert('mock provider emits runtime events', mockResponse.events.length > 0, { event_count: mockResponse.events.length }),
  assert('dispatch helper preserves request_id', mockResponse.request_id === request.request_id, { response_request_id: mockResponse.request_id, request_id: request.request_id }),
  missingProviderCheck,
  httpMissingEndpointCheck,
  assert('fake http provider captures runtime adapter request', Boolean(capturedRequest), { captured: Boolean(capturedRequest) }),
  assert('fake http provider returns accepted response', fakeHttpResponse.accepted === true && fakeHttpResponse.status === 'accepted', { accepted: fakeHttpResponse.accepted, status: fakeHttpResponse.status }),
  assert('http provider sends POST request', dispatchCall?.method === 'POST', { calls: httpCalls.map((call) => call.method) }),
  assert('http provider sends runtime adapter request body', (dispatchCall?.body as { packet_type?: string })?.packet_type === 'nexus.runtime_adapter_request', { packet_type: (dispatchCall?.body as { packet_type?: string })?.packet_type }),
  assert('http provider health check sends GET request', healthCall?.method === 'GET', { calls: httpCalls.map((call) => call.method) }),
  assert('http provider accepts valid response shape', successfulHttpResponse.accepted === true && isRuntimeAdapterResponse(successfulHttpResponse), { accepted: successfulHttpResponse.accepted, status: successfulHttpResponse.status }),
  assert('http provider health check can be healthy', successfulHealth?.ok === true && successfulHealth.status === 'healthy', { successfulHealth }),
  invalidShapeCheck,
  invalidJsonCheck,
  assert('http provider retries retryable status once', retryAttempts === 2 && retryHttpResponse.accepted === true, { retryAttempts, accepted: retryHttpResponse.accepted }),
  nonRetryCheck,
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
  http_hardening: {
    unconfigured_health_status: httpUnconfiguredHealth?.status,
    successful_health_status: successfulHealth?.status,
    retry_attempts: retryAttempts,
    successful_http_status: successfulHttpResponse.status,
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
