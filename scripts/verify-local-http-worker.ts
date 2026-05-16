import { buildRuntimeAdapterRequest, type RuntimeAdapterResponse, type TaskPacket } from '../src/runtimeAdapter.ts';
import { isRuntimeAdapterResponse } from '../src/runtimeAdapterProvider.ts';
import { startLocalHttpWorkerServer } from '../server/local-http-worker.ts';

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify local HTTP worker skeleton',
  source_compiler_rule: 'verify-local-http-worker',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['runtime-adapter', 'local-http-worker'],
    capability_packs: ['local-http-worker-pack'],
    skills: ['quality-assurance-skill', 'review-skill'],
  },
  skills: [
    { skill: 'quality-assurance-skill', required: true },
    { skill: 'review-skill', required: true },
  ],
  team: [{ profile: 'runtime-adapter-engineer', role: 'owner_or_reviewer' }],
  gates: [
    { gate: 'worker-health', required: true },
    { gate: 'adapter-response', required: true },
  ],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-local-worker-dispatch',
      title: 'Local Worker Dispatch',
      owner: 'runtime-adapter-engineer',
      description: 'Dispatch a runtime adapter request to the local HTTP worker.',
      expected_outputs: ['runtime_adapter_response', 'runtime_bridge_events'],
      required_gates: ['worker-health', 'adapter-response'],
      status: 'not_started',
    },
  ],
};

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const worker = await startLocalHttpWorkerServer({ port: 0, worker_id: 'verify-local-http-worker' });

try {
  const healthResponse = await fetch(`${worker.url}/health`);
  const health = await healthResponse.json();

  const request = buildRuntimeAdapterRequest(samplePacket, 'mock');
  const adapterResponse = await fetch(`${worker.url}/runtime/adapter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const adapterPayload = await adapterResponse.json() as RuntimeAdapterResponse;

  const invalidResponse = await fetch(`${worker.url}/runtime/adapter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invalid: true }),
  });
  const invalidPayload = await invalidResponse.json();

  const notFoundResponse = await fetch(`${worker.url}/missing`);
  const notFoundPayload = await notFoundResponse.json();

  const assertions = [
    assert('health endpoint passes', healthResponse.ok && health.ok === true && health.worker_id === 'verify-local-http-worker', { health }),
    assert('adapter endpoint returns runtime adapter response', adapterResponse.ok && isRuntimeAdapterResponse(adapterPayload), { status: adapterResponse.status }),
    assert('adapter response target worker is local worker', adapterPayload.job.target_worker === 'verify-local-http-worker', { target_worker: adapterPayload.job.target_worker }),
    assert('adapter response emits runtime events', adapterPayload.events.length > 0, { event_count: adapterPayload.events.length }),
    assert('invalid request fails closed', invalidResponse.status === 400 && invalidPayload.code === 'INVALID_RUNTIME_ADAPTER_REQUEST', { status: invalidResponse.status, payload: invalidPayload }),
    assert('unknown endpoint returns 404', notFoundResponse.status === 404 && notFoundPayload.code === 'NOT_FOUND', { status: notFoundResponse.status, payload: notFoundPayload }),
  ];

  const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
  const result = {
    suite_id: 'local-http-worker',
    status,
    worker_url: worker.url,
    assertions,
    response_summary: {
      accepted: adapterPayload.accepted,
      runtime_status: adapterPayload.status,
      event_count: adapterPayload.events.length,
      target_worker: adapterPayload.job.target_worker,
    },
  };

  console.log(JSON.stringify(result, null, 2));

  if (status !== 'pass') {
    console.error('Local HTTP worker verification failed.');
    process.exit(1);
  }
} finally {
  await worker.close();
}
