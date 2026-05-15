export type SkillRuntimeFlags = {
  planning: boolean;
  qa: boolean;
  acceleration: boolean;
  review: boolean;
  ultraReview: boolean;
  contextMode: boolean;
  frontend: boolean;
  memory: boolean;
};

export type SkillDirective = {
  skill: string;
  effect: string;
  runner_hint: string;
};

type PacketLike = {
  routing?: { skills?: string[] };
  skills?: Array<string | { skill?: string; required?: boolean }>;
};

export function getPacketSkillIds(packet: PacketLike): string[] {
  const fromRouting = packet.routing?.skills ?? [];
  const fromPacket = (packet.skills ?? []).map((item) => (typeof item === 'string' ? item : item.skill)).filter(Boolean) as string[];
  return Array.from(new Set([...fromRouting, ...fromPacket]));
}

export function hasSkill(packet: PacketLike, skill: string): boolean {
  return getPacketSkillIds(packet).includes(skill);
}

export function buildSkillRuntimeFlags(packet: PacketLike): SkillRuntimeFlags {
  const skills = new Set(getPacketSkillIds(packet));
  return {
    planning: skills.has('superpowered-planning-skill'),
    qa: skills.has('quality-assurance-skill'),
    acceleration: skills.has('execution-acceleration-skill'),
    review: skills.has('review-skill'),
    ultraReview: skills.has('ultrareview-skill'),
    contextMode: skills.has('context-mode-skill'),
    frontend: skills.has('frontend-skill'),
    memory: skills.has('memory-skill'),
  };
}

export function buildSkillDirectives(packet: PacketLike): SkillDirective[] {
  const flags = buildSkillRuntimeFlags(packet);
  const directives: SkillDirective[] = [];
  if (flags.planning) directives.push({ skill: 'superpowered-planning-skill', effect: 'Plan must expose gaps, edge cases and gate mapping.', runner_hint: 'Check whether steps have outputs, gates and blocker notes.' });
  if (flags.qa) directives.push({ skill: 'quality-assurance-skill', effect: 'Missing evidence is a release blocker.', runner_hint: 'Require evidence notes for every required gate.' });
  if (flags.acceleration) directives.push({ skill: 'execution-acceleration-skill', effect: 'Blocked work should produce a concrete next action.', runner_hint: 'Generate next-action suggestions for blocked steps and failed gates.' });
  if (flags.review) directives.push({ skill: 'review-skill', effect: 'Review must separate blocker findings from advisory findings.', runner_hint: 'Classify failed gates, missing evidence and incomplete steps separately.' });
  if (flags.ultraReview) directives.push({ skill: 'ultrareview-skill', effect: 'Review must include adversarial safety, risk and metadata checks.', runner_hint: 'Expect risk/tool/release gates or flag missing ultra-review coverage.' });
  if (flags.contextMode) directives.push({ skill: 'context-mode-skill', effect: 'Context packet must define keep/drop boundaries.', runner_hint: 'Keep active blockers and drop transient UI/raw logs.' });
  if (flags.frontend) directives.push({ skill: 'frontend-skill', effect: 'Frontend work must cover UI states and accessibility baseline.', runner_hint: 'Expect UI state, responsive and accessibility evidence when frontend gates exist.' });
  if (flags.memory) directives.push({ skill: 'memory-skill', effect: 'Memory packet must separate durable decisions from temporary context.', runner_hint: 'Keep do_not_store, deprecated assumptions and unresolved blockers explicit.' });
  return directives;
}

export function requiredGatesForSkills(packet: PacketLike): string[] {
  const flags = buildSkillRuntimeFlags(packet);
  const gates = new Set<string>();
  if (flags.qa) ['test-evidence', 'regression-coverage', 'traceability'].forEach((gate) => gates.add(gate));
  if (flags.ultraReview) ['risk-clarity', 'tool-trust', 'release-readiness'].forEach((gate) => gates.add(gate));
  if (flags.contextMode) ['context-budget', 'stale-memory-check'].forEach((gate) => gates.add(gate));
  if (flags.memory) ['memory-policy-fit', 'stale-memory-check', 'risk-clarity'].forEach((gate) => gates.add(gate));
  if (flags.frontend) ['ui-state-coverage', 'responsive-check', 'accessibility-baseline'].forEach((gate) => gates.add(gate));
  return Array.from(gates);
}

export function buildNextActionSuggestion(args: { stepTitle: string; stepId: string; gate?: string; blockerReason?: string; skills: string[] }): string {
  const hasAcceleration = args.skills.includes('execution-acceleration-skill');
  const hasQa = args.skills.includes('quality-assurance-skill');
  const hasUltra = args.skills.includes('ultrareview-skill');
  const cause = args.blockerReason?.trim() || (args.gate ? `Gate ${args.gate} needs evidence or resolution.` : 'Step is blocked or incomplete.');
  const base = `${args.stepId} / ${args.stepTitle}: ${cause}`;
  if (hasAcceleration) return `${base} Next action: define the smallest safe unblock step, owner, required evidence and what scope can be cut without hiding risk.`;
  if (hasUltra) return `${base} Next action: run adversarial review for risk, tool/skill trust, rollback and hidden dependency before release.`;
  if (hasQa) return `${base} Next action: attach direct evidence, test output or reviewer note before marking this gate as pass.`;
  return `${base} Next action: add blocker reason, evidence note and owner decision.`;
}

export function skillCoverageWarnings(packet: PacketLike, availableGates: string[]): string[] {
  const required = requiredGatesForSkills(packet);
  const available = new Set(availableGates);
  return required.filter((gate) => !available.has(gate)).map((gate) => `Skill-required gate is not present in this task packet: ${gate}`);
}
