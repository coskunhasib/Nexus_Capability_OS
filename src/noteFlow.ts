import {
  validateMemoryNote,
  type MemoryNote,
  type MemoryNoteType,
  type RuntimeConfidence,
} from './capabilityRuntimeContracts.ts';

export type NoteCreateInput = {
  note_id: string;
  topic: string;
  note_type: MemoryNoteType;
  summary: string;
  source_refs: string[];
  confidence: RuntimeConfidence;
  at: string;
};

export type NoteUpdateInput = {
  existing: MemoryNote;
  note_id: string;
  summary: string;
  source_refs: string[];
  confidence?: RuntimeConfidence;
  at: string;
};

export type NoteMergeInput = {
  note_id: string;
  topic: string;
  notes: MemoryNote[];
  summary: string;
  source_refs: string[];
  confidence: RuntimeConfidence;
  at: string;
};

export type NoteRetireInput = {
  existing: MemoryNote;
  reason: string;
  at: string;
};

export type NoteFlowResult = {
  note?: MemoryNote;
  valid: boolean;
  errors: string[];
};

function hasText(value: string) {
  return Boolean(value.trim());
}

function unique(items: string[]) {
  return [...new Set(items.filter(hasText))];
}

function finish(note: MemoryNote): NoteFlowResult {
  const validation = validateMemoryNote(note);
  return validation.valid
    ? { note, valid: true, errors: [] }
    : { valid: false, errors: validation.errors };
}

export function createNote(input: NoteCreateInput): NoteFlowResult {
  return finish({
    packet_type: 'nexus.memory_note',
    version: '0.1',
    note_id: input.note_id,
    topic: input.topic,
    note_type: input.note_type,
    summary: input.summary,
    source_refs: unique(input.source_refs),
    confidence: input.confidence,
    status: 'active',
    created_at: input.at,
    last_updated: input.at,
  });
}

export function updateNote(input: NoteUpdateInput): NoteFlowResult {
  if (!input.source_refs.length) return { valid: false, errors: ['update source_refs must not be empty'] };
  return finish({
    ...input.existing,
    note_id: input.note_id,
    summary: input.summary,
    source_refs: unique([...input.existing.source_refs, ...input.source_refs]),
    confidence: input.confidence ?? input.existing.confidence,
    status: 'active',
    created_at: input.existing.created_at,
    last_updated: input.at,
    replaces: unique([...(input.existing.replaces ?? []), input.existing.note_id]),
  });
}

export function mergeNotes(input: NoteMergeInput): NoteFlowResult {
  if (input.notes.length < 2) return { valid: false, errors: ['merge requires at least two notes'] };
  const sourceRefs = unique([
    ...input.source_refs,
    ...input.notes.flatMap((note) => note.source_refs),
  ]);
  const replaced = unique([
    ...input.notes.map((note) => note.note_id),
    ...input.notes.flatMap((note) => note.replaces ?? []),
  ]);

  return finish({
    packet_type: 'nexus.memory_note',
    version: '0.1',
    note_id: input.note_id,
    topic: input.topic,
    note_type: 'pattern',
    summary: input.summary,
    source_refs: sourceRefs,
    confidence: input.confidence,
    status: 'active',
    created_at: input.at,
    last_updated: input.at,
    replaces: replaced,
    related_notes: input.notes.map((note) => note.note_id),
  });
}

export function retireNote(input: NoteRetireInput): NoteFlowResult {
  if (!hasText(input.reason)) return { valid: false, errors: ['retire reason must be non-empty'] };
  return finish({
    ...input.existing,
    status: 'retired',
    last_updated: input.at,
    stale_reason: input.reason,
  });
}
