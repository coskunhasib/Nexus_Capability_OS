import { buildHardenedReviewReport } from '../src/reviewReportHardening.ts';
import { buildRuntimeAdapterRequest, runMockRuntimeAdapter, type EvidenceState, type TaskPacket, type WorkStatus } from '../src/runtimeAdapter.ts';
import { buildRuntimeArtifactRegistryFromEvents } from '../src/runtimeArtifactRegistry.ts';

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify review report hardening',
  source_compiler_rule: 'rule-review-hardening',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['runtime-adapter', 'qa-automation'],
    capability_packs: ['review-hardening-pack'],
    skills: ['quality-assurance-skill', 'review-skill'],
  },
  skills: [
    { skill: 'quality-assurance-skill', required: true },
    { skill: 'review-skill', required: true },
  ],
  team: [{ profile: 'qa-automation-engineer', role: 'owner_or_reviewer' }],
  gates: [
    { gate: 'human-proof', required: true },
    { gate: 'runtime-proof', required: true },
    { gate: 'release-readiness', required: true },
  ],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-human-evidence',
      title: 'Human Evidence',
      owner: 'qa-automation-engineer',
      description: 'Collect human entered evidence.',
      expected_outputs: ['review_note'],
      required_gates: ['human-proof'],
      status: 'done',
    },
    {
      order: 2,
      id: '02-runtime-evidence',
      title: 'Runtime Evidence',
      owner: 'qa-automation-engineer',
      description: 'Collect runtime evidence.',
      expected_outputs: ['runtime_adapter_response'],
      required_gates: ['runtime-proof'],
      status: 'done',
    },
    {
      order: 3,
      id: '03-release',
      title: 'Release Check',
      owner: 'qa-automation-engineer',
      description: 'Check release readiness.',
      expected_outputs: ['release_review'],
      required_gates: ['release-readiness'],
      status: 'blocked',
    },
  ],
};

const statuses: Record<string, WorkStatus> = {
  '01-human-evidence': 'done',
  '02-runtime-evidence': 'done',
  '03-release': 'blocked',
};

const evidence: EvidenceState = {
  '01-human-evidence': {
    'human-proof': {
      status: 'pass',
      evidence_note: 'Reviewed by product owner with acceptance checklist.',
      blocker_reason: '',
    },
  },
  '02-runtime-evidence': {
    'runtime-proof': {
      status: 'pass',
      evidence_note: 'Runtime adapter artifact://mock/run/log verified by CI.',
      blocker_reason: '',
    },
  },
  '03-release': {
    'release-readiness': {
      status: 'fail',
      evidence_note: '',
      blocker_reason: 'Release checklist is not complete.',
    },
  },
};

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const request = buildRuntimeAdapterRequest(samplePacket, 'mock');
const response = runMockRuntimeAdapter(request);
const registry = buildRuntimeArtifactRegistryFromEvents(response.events);
const report = buildHardenedReviewReport(samplePacket, statuses, evidence, registry);

const releaseReadyPacket: TaskPacket = {
  ...samplePacket,
  objective: 'Verify release ready review report',
  work_order: samplePacket.work_order.slice(0, 2),
};
const releaseReadyStatuses: Record<string, WorkStatus> = {
  '01-human-evidence': 'done',
  '02-runtime-evidence': 'done',
};
const releaseReadyEvidence: EvidenceState = {
  '01-human-evidence': evidence['01-human-evidence'],
  '02-runtime-evidence': evidence['02-runtime-evidence'],
};
const readyReport = buildHardenedReviewReport(releaseReadyPacket, releaseReadyStatuses, releaseReadyEvidence, registry);

const assertions = [
  assert('human evidence is separated', report.human_entered_evidence.length === 1, { count: report.human_entered_evidence.length, items: report.human_entered_evidence }),
  assert('runtime evidence is separated', report.runtime_reported_evidence.length === 1, { count: report.runtime_reported_evidence.length, items: report.runtime_reported_evidence }),
  assert('artifact-backed evidence is present', report.artifact_backed_evidence.length > 0, { count: report.artifact_backed_evidence.length }),
  assert('failed gates are counted', report.failed_gates.length === 1 && report.counts.failed_gates === 1, { failed: report.failed_gates, counts: report.counts }),
  assert('missing evidence is counted for failed empty note', report.missing_evidence.length === 1 && report.counts.missing_evidence === 1, { missing: report.missing_evidence, counts: report.counts }),
  assert('release blockers include failed and blocked state', report.release_blockers.length >= 2, { blockers: report.release_blockers }),
  assert('release is blocked when blockers exist', report.release_ready === false, { release_ready: report.release_ready }),
  assert('counts expose all review buckets', report.counts.human_entered_evidence === 1 && report.counts.runtime_reported_evidence === 1 && report.counts.artifact_backed_evidence > 0, { counts: report.counts }),
  assert('release ready report can pass', readyReport.release_ready === true && readyReport.release_blockers.length === 0, { release_ready: readyReport.release_ready, blockers: readyReport.release_blockers }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'review-report-hardening',
  status,
  assertions,
  report_summary: report.counts,
  release_ready: report.release_ready,
  ready_report_summary: readyReport.counts,
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Review report hardening verification failed.');
  process.exit(1);
}
