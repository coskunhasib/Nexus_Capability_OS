import type { EvidenceState, TaskPacket, WorkStatus } from './runtimeAdapter.ts';
import type { RuntimeArtifactRegistry, RuntimeArtifactRecord } from './runtimeArtifactRegistry.ts';

export type ReviewEvidenceItem = {
  step_id: string;
  step_title: string;
  gate: string;
  status: 'not_checked' | 'pass' | 'fail';
  evidence_note: string;
  blocker_reason: string;
  source: 'human_entered' | 'runtime_reported';
};

export type ArtifactBackedEvidence = {
  step_id: string;
  step_title: string;
  artifact_id: string;
  kind: string;
  ref: string;
  summary: string;
};

export type ReviewBlocker = {
  type: 'failed_gate' | 'missing_evidence' | 'blocked_step' | 'incomplete_step';
  step_id: string;
  step_title: string;
  gate?: string;
  message: string;
};

export type HardenedReviewReport = {
  objective: string;
  release_ready: boolean;
  human_entered_evidence: ReviewEvidenceItem[];
  runtime_reported_evidence: ReviewEvidenceItem[];
  artifact_backed_evidence: ArtifactBackedEvidence[];
  missing_evidence: ReviewBlocker[];
  failed_gates: ReviewBlocker[];
  release_blockers: ReviewBlocker[];
  counts: {
    required_gates: number;
    human_entered_evidence: number;
    runtime_reported_evidence: number;
    artifact_backed_evidence: number;
    missing_evidence: number;
    failed_gates: number;
    release_blockers: number;
  };
};

function isRuntimeEvidence(note: string) {
  const normalized = note.toLowerCase();
  return normalized.includes('runtime') || normalized.includes('adapter') || normalized.includes('artifact://') || normalized.includes('callback');
}

function artifactTitle(packet: TaskPacket, stepId: string) {
  return packet.work_order.find((step) => step.id === stepId)?.title ?? stepId;
}

function artifactEvidence(packet: TaskPacket, registry?: RuntimeArtifactRegistry): ArtifactBackedEvidence[] {
  return (registry?.artifacts ?? []).map((artifact: RuntimeArtifactRecord) => ({
    step_id: artifact.step_id,
    step_title: artifactTitle(packet, artifact.step_id),
    artifact_id: artifact.artifact_id,
    kind: artifact.kind,
    ref: artifact.ref,
    summary: artifact.summary,
  }));
}

export function buildHardenedReviewReport(
  packet: TaskPacket,
  statuses: Record<string, WorkStatus>,
  evidence: EvidenceState,
  artifactRegistry?: RuntimeArtifactRegistry,
): HardenedReviewReport {
  const human: ReviewEvidenceItem[] = [];
  const runtime: ReviewEvidenceItem[] = [];
  const missing: ReviewBlocker[] = [];
  const failed: ReviewBlocker[] = [];
  const blockers: ReviewBlocker[] = [];
  let requiredGateCount = 0;

  for (const step of packet.work_order) {
    const stepStatus = statuses[step.id] ?? step.status ?? 'not_started';
    if (stepStatus === 'blocked') {
      blockers.push({ type: 'blocked_step', step_id: step.id, step_title: step.title, message: 'Step is blocked.' });
    } else if (stepStatus !== 'done') {
      blockers.push({ type: 'incomplete_step', step_id: step.id, step_title: step.title, message: `Step is ${stepStatus}.` });
    }

    for (const gate of step.required_gates ?? []) {
      requiredGateCount += 1;
      const item = evidence[step.id]?.[gate] ?? { status: 'not_checked' as const, evidence_note: '', blocker_reason: '' };
      const note = item.evidence_note.trim();
      const blockerReason = item.blocker_reason.trim();
      const evidenceItem: ReviewEvidenceItem = {
        step_id: step.id,
        step_title: step.title,
        gate,
        status: item.status,
        evidence_note: note,
        blocker_reason: blockerReason,
        source: isRuntimeEvidence(note) ? 'runtime_reported' : 'human_entered',
      };

      if (note || blockerReason) {
        if (evidenceItem.source === 'runtime_reported') runtime.push(evidenceItem);
        else human.push(evidenceItem);
      }

      if (item.status === 'fail') {
        const failedItem = { type: 'failed_gate' as const, step_id: step.id, step_title: step.title, gate, message: blockerReason || 'Gate failed without blocker reason.' };
        failed.push(failedItem);
        blockers.push(failedItem);
      }

      if (item.status === 'not_checked' || !note) {
        const missingItem = { type: 'missing_evidence' as const, step_id: step.id, step_title: step.title, gate, message: 'Required gate evidence is missing.' };
        missing.push(missingItem);
        blockers.push(missingItem);
      }
    }
  }

  const artifacts = artifactEvidence(packet, artifactRegistry);
  const releaseReady = blockers.length === 0;

  return {
    objective: packet.objective,
    release_ready: releaseReady,
    human_entered_evidence: human,
    runtime_reported_evidence: runtime,
    artifact_backed_evidence: artifacts,
    missing_evidence: missing,
    failed_gates: failed,
    release_blockers: blockers,
    counts: {
      required_gates: requiredGateCount,
      human_entered_evidence: human.length,
      runtime_reported_evidence: runtime.length,
      artifact_backed_evidence: artifacts.length,
      missing_evidence: missing.length,
      failed_gates: failed.length,
      release_blockers: blockers.length,
    },
  };
}
