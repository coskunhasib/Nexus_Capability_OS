import type { RuntimeAdapterResponse } from './runtimeAdapter.ts';
import {
  buildDryRunRuntimeLoopCycle,
  type ActiveContextBundle,
  type AgentProfile,
  type EvaluationObservation,
  type MemoryNote,
  type RuntimeLoopCycle,
  type SkillPackage,
  type SubAgentDelegation,
  type ToolGrant,
} from './capabilityRuntimeContracts.ts';

export type ControlledWorkerRuntimeMappingInput = {
  taskRef: string;
  response: RuntimeAdapterResponse;
  skill: SkillPackage;
  agent: AgentProfile;
  subAgent?: SubAgentDelegation;
  context: ActiveContextBundle;
  toolGrants: ToolGrant[];
  memoryNotes: MemoryNote[];
};

export type ControlledWorkerRuntimeMappingResult = {
  observation: EvaluationObservation;
  runtime_cycle: RuntimeLoopCycle;
};

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function mapControlledWorkerResponseToRuntimeLoop(
  input: ControlledWorkerRuntimeMappingInput,
): ControlledWorkerRuntimeMappingResult {
  const eventTypes = unique(input.response.events.map((event) => event.event_type));
  const artifactRefs = input.response.events.flatMap((event) => event.artifact_refs ?? []);
  const signal = input.response.accepted && input.response.status === 'accepted' && artifactRefs.length > 0
    ? 'positive'
    : 'negative';

  const observation: EvaluationObservation = {
    packet_type: 'nexus.evaluation_observation',
    version: '0.1',
    observation_id: `obs.controlled-worker.${input.taskRef}`,
    run_ref: input.taskRef,
    subject_type: 'tool',
    subject_ref: 'controlled-worker-v2',
    signal,
    summary: signal === 'positive'
      ? `Controlled worker produced ${input.response.events.length} runtime events and ${artifactRefs.length} artifact refs.`
      : 'Controlled worker response did not produce accepted artifact-backed events.',
    evidence_refs: [
      input.response.request_id,
      ...eventTypes.map((eventType) => `event:${eventType}`),
      ...artifactRefs.map((artifact) => artifact.ref),
    ],
    confidence: signal === 'positive' ? 'high' : 'medium',
    recommended_action: signal === 'positive'
      ? 'Allow controlled worker outputs to feed the local runtime loop.'
      : 'Keep controlled worker output blocked until accepted artifact-backed events exist.',
  };

  const runtime_cycle = buildDryRunRuntimeLoopCycle({
    taskRef: input.taskRef,
    skill: input.skill,
    agent: input.agent,
    subAgent: input.subAgent,
    context: input.context,
    toolGrants: input.toolGrants,
    observation,
    memoryNotes: input.memoryNotes,
  });

  return {
    observation,
    runtime_cycle: {
      ...runtime_cycle,
      cycle_id: `cycle.controlled-worker.${input.taskRef}`,
      events: [
        ...runtime_cycle.events,
        ...input.response.events.map((event) => ({
          event_type: `controlled_worker.${event.event_type}`,
          summary: event.runtime_notes ?? `Controlled worker emitted ${event.event_type}.`,
        })),
      ],
      artifact_refs: [
        ...runtime_cycle.artifact_refs,
        ...artifactRefs.map((artifact) => ({
          kind: artifact.kind,
          ref: artifact.ref,
          summary: artifact.summary,
        })),
      ],
    },
  };
}
