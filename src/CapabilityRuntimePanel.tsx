import skillFixture from '../samples/capability-runtime/skill.review-doc.sample.json';
import agentFixture from '../samples/capability-runtime/agent.orchestrator.sample.json';
import subAgentFixture from '../samples/capability-runtime/subagent.verifier.sample.json';
import toolGrantFixture from '../samples/capability-runtime/tool.read-doc.grant.sample.json';
import runtimeNoteFixture from '../samples/capability-runtime/memory-note.runtime-philosophy.sample.json';
import contextNoteFixture from '../samples/capability-runtime/memory-note.context-distillation.sample.json';
import activeContextFixture from '../samples/capability-runtime/context.docs-review.sample.json';
import evaluationFixture from '../samples/capability-runtime/evaluation.docs-review.sample.json';
import {
  buildDryRunRuntimeLoopCycle,
  type ActiveContextBundle,
  type AgentProfile,
  type EvaluationObservation,
  type MemoryNote,
  type SkillPackage,
  type SubAgentDelegation,
  type ToolGrant,
} from './capabilityRuntimeContracts.ts';

const skill = skillFixture as SkillPackage;
const agent = agentFixture as AgentProfile;
const subAgent = subAgentFixture as SubAgentDelegation;
const toolGrant = toolGrantFixture as ToolGrant;
const runtimeNote = runtimeNoteFixture as MemoryNote;
const contextNote = contextNoteFixture as MemoryNote;
const activeContext = activeContextFixture as ActiveContextBundle;
const evaluation = evaluationFixture as EvaluationObservation;

const runtimeCycle = buildDryRunRuntimeLoopCycle({
  taskRef: 'task.docs-review-dry-run',
  skill,
  agent,
  subAgent,
  context: activeContext,
  toolGrants: [toolGrant],
  observation: evaluation,
  memoryNotes: [runtimeNote, contextNote],
});

function Pill({ children }: { children: string }) {
  return (
    <span className="inline-flex px-2 py-1 text-[10px] rounded-md border border-cyan-500/20 bg-cyan-950/20 text-cyan-300">
      {children}
    </span>
  );
}

function RuntimeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-[#0e0e0e] border border-white/5 rounded-xl p-4 space-y-3">
      <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">{title}</h3>
      {children}
    </section>
  );
}

function SmallList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-xs text-neutral-500">None</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => <Pill key={item}>{item}</Pill>)}
    </div>
  );
}

export function CapabilityRuntimePanel() {
  return (
    <div className="mt-8 space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-500 font-bold mb-2 px-2">
          Capability Runtime
        </p>
        <p className="text-xs leading-relaxed text-neutral-500 px-2">
          Read-only alpha preview. Shows decisions from fixtures and dry-run loop only; no mutation or external runtime execution.
        </p>
      </div>

      <RuntimeSection title="Skill decision">
        <div>
          <p className="text-sm text-white font-medium">{skill.name}</p>
          <p className="text-xs text-neutral-400 mt-1">{skill.purpose}</p>
        </div>
        <SmallList items={skill.quality_gates} />
      </RuntimeSection>

      <RuntimeSection title="Agent ownership">
        <div>
          <p className="text-sm text-white font-medium">{agent.agent_id}</p>
          <p className="text-xs text-neutral-400 mt-1">{agent.role}</p>
        </div>
        <SmallList items={agent.responsibilities} />
      </RuntimeSection>

      <RuntimeSection title="Sub-agent boundary">
        <div>
          <p className="text-sm text-white font-medium">{subAgent.sub_agent_id}</p>
          <p className="text-xs text-neutral-400 mt-1">{subAgent.scope}</p>
        </div>
        <SmallList items={subAgent.allowed_tools} />
      </RuntimeSection>

      <RuntimeSection title="Tool grant">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-neutral-500">Tool</div>
          <div className="text-neutral-300 text-right">{toolGrant.tool_id}</div>
          <div className="text-neutral-500">Class</div>
          <div className="text-neutral-300 text-right">{toolGrant.action_class}</div>
          <div className="text-neutral-500">Approval</div>
          <div className="text-neutral-300 text-right">{toolGrant.approval_required ? 'required' : 'not required'}</div>
        </div>
        <SmallList items={toolGrant.allowed_actions} />
      </RuntimeSection>

      <RuntimeSection title="Active context notes">
        <SmallList items={activeContext.selected_note_refs} />
        <div className="space-y-2">
          {[runtimeNote, contextNote].map((note) => (
            <div key={note.note_id} className="border border-white/5 rounded-lg p-3 bg-black/20">
              <p className="text-xs text-white font-medium">{note.topic}</p>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{note.summary}</p>
            </div>
          ))}
        </div>
      </RuntimeSection>

      <RuntimeSection title="Evaluation observation">
        <div>
          <p className="text-sm text-white font-medium">{evaluation.signal} / {evaluation.confidence}</p>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{evaluation.summary}</p>
        </div>
        <SmallList items={evaluation.evidence_refs} />
      </RuntimeSection>

      <RuntimeSection title="Dry-run loop cycle">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-neutral-500">Cycle</div>
          <div className="text-neutral-300 text-right truncate">{runtimeCycle.cycle_id}</div>
          <div className="text-neutral-500">Status</div>
          <div className="text-neutral-300 text-right">{runtimeCycle.status}</div>
          <div className="text-neutral-500">Events</div>
          <div className="text-neutral-300 text-right">{runtimeCycle.events.length}</div>
          <div className="text-neutral-500">Memory notes</div>
          <div className="text-neutral-300 text-right">{runtimeCycle.memory_note_update_refs.length}</div>
        </div>
        <div className="space-y-2">
          {runtimeCycle.events.map((event) => (
            <div key={event.event_type} className="text-xs text-neutral-400 border-l border-cyan-500/30 pl-3">
              <span className="text-cyan-300">{event.event_type}</span> — {event.summary}
            </div>
          ))}
        </div>
      </RuntimeSection>
    </div>
  );
}
