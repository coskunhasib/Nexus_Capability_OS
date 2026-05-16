import type { RuntimeAdapterRequest, RuntimeAdapterResponse } from '../../src/runtimeAdapter.ts';
import {
  buildOpenHandsWorkRequest,
  normalizeOpenHandsResult,
  type OpenHandsArtifactExpectation,
  type OpenHandsResult,
} from './openhands-adapter.ts';

export type OpenHandsOperatorRunArtifact = {
  step_id: string;
  kind: string;
  ref: string;
  summary: string;
};

export type OpenHandsOperatorRunResultFile = {
  packet_type: 'nexus.openhands.operator_run_result';
  version: '0.1';
  request_id: string;
  source_adapter: 'openhands';
  operator_run_id: string;
  status: 'completed' | 'blocked';
  artifacts: OpenHandsOperatorRunArtifact[];
  notes: string[];
  diagnostics?: string[];
  created_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isArtifact(value: unknown): value is OpenHandsOperatorRunArtifact {
  if (!isRecord(value)) return false;
  return typeof value.step_id === 'string'
    && typeof value.kind === 'string'
    && typeof value.ref === 'string'
    && typeof value.summary === 'string';
}

export function isOpenHandsOperatorRunResultFile(value: unknown): value is OpenHandsOperatorRunResultFile {
  if (!isRecord(value)) return false;
  return value.packet_type === 'nexus.openhands.operator_run_result'
    && value.version === '0.1'
    && value.source_adapter === 'openhands'
    && typeof value.request_id === 'string'
    && typeof value.operator_run_id === 'string'
    && (value.status === 'completed' || value.status === 'blocked')
    && Array.isArray(value.artifacts)
    && value.artifacts.every(isArtifact)
    && Array.isArray(value.notes)
    && value.notes.every((note) => typeof note === 'string')
    && (value.diagnostics === undefined || (Array.isArray(value.diagnostics) && value.diagnostics.every((item) => typeof item === 'string')))
    && typeof value.created_at === 'string';
}

function toAdapterArtifact(artifact: OpenHandsOperatorRunArtifact): OpenHandsArtifactExpectation {
  return {
    step_id: artifact.step_id,
    kind: artifact.kind,
    path_hint: artifact.ref,
    summary: artifact.summary,
  };
}

export function normalizeOpenHandsOperatorRunResult(
  request: RuntimeAdapterRequest,
  resultFile: OpenHandsOperatorRunResultFile,
  options: { target_worker?: string; now?: string } = {},
): RuntimeAdapterResponse {
  if (!isOpenHandsOperatorRunResultFile(resultFile)) {
    throw new Error('Invalid OpenHands operator-run result file.');
  }
  if (resultFile.request_id !== request.request_id) {
    throw new Error('OpenHands operator-run result request_id does not match runtime adapter request.');
  }

  const workRequest = buildOpenHandsWorkRequest(request, {
    target_worker: options.target_worker ?? 'openhands-operator-run',
    now: options.now,
  });
  const result: OpenHandsResult = {
    status: resultFile.status,
    artifacts: resultFile.artifacts.map(toAdapterArtifact),
    notes: [
      `Operator run ${resultFile.operator_run_id} normalized from result file.`,
      ...resultFile.notes,
      ...(resultFile.diagnostics ?? []).map((item) => `diagnostic: ${item}`),
    ],
  };

  return normalizeOpenHandsResult(request, workRequest, result, {
    target_worker: workRequest.target_worker,
    now: options.now ?? resultFile.created_at,
  });
}
