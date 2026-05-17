import {
  createNote,
  mergeNotes,
  retireNote,
  updateNote,
} from '../src/noteFlow.ts';

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const created = createNote({
  note_id: 'note.beta.created',
  topic: 'Beta note flow',
  note_type: 'decision',
  summary: 'Create note candidates with source refs.',
  source_refs: ['obs.beta.001'],
  confidence: 'high',
  at: '2026-05-17T00:00:00.000Z',
});

const invalidCreate = createNote({
  note_id: 'note.beta.invalid',
  topic: 'Invalid beta note flow',
  note_type: 'decision',
  summary: 'This note lacks source refs.',
  source_refs: [],
  confidence: 'high',
  at: '2026-05-17T00:00:00.000Z',
});

const updated = created.note
  ? updateNote({
      existing: created.note,
      note_id: 'note.beta.updated',
      summary: 'Updated note keeps previous and new source refs.',
      source_refs: ['artifact.beta.001'],
      at: '2026-05-17T00:01:00.000Z',
    })
  : { valid: false, errors: ['create failed'] };

const second = createNote({
  note_id: 'note.beta.second',
  topic: 'Second beta note',
  note_type: 'lesson',
  summary: 'Second note for merge verification.',
  source_refs: ['obs.beta.002'],
  confidence: 'medium',
  at: '2026-05-17T00:02:00.000Z',
});

const merged = updated.note && second.note
  ? mergeNotes({
      note_id: 'note.beta.merged',
      topic: 'Merged beta note flow',
      notes: [updated.note, second.note],
      summary: 'Merged note preserves lineage and source refs.',
      source_refs: ['review.beta.merge'],
      confidence: 'high',
      at: '2026-05-17T00:03:00.000Z',
    })
  : { valid: false, errors: ['merge prerequisites failed'] };

const invalidMerge = updated.note
  ? mergeNotes({
      note_id: 'note.beta.bad-merge',
      topic: 'Bad merge',
      notes: [updated.note],
      summary: 'Invalid single-note merge.',
      source_refs: ['review.beta.merge'],
      confidence: 'medium',
      at: '2026-05-17T00:04:00.000Z',
    })
  : { valid: false, errors: ['merge prerequisite failed'] };

const retired = merged.note
  ? retireNote({
      existing: merged.note,
      reason: 'Superseded by Beta controlled runtime summary.',
      at: '2026-05-17T00:05:00.000Z',
    })
  : { valid: false, errors: ['merge failed'] };

const invalidRetire = merged.note
  ? retireNote({
      existing: merged.note,
      reason: '',
      at: '2026-05-17T00:06:00.000Z',
    })
  : { valid: false, errors: ['merge failed'] };

const assertions = [
  assert('create with source refs is valid', created.valid && created.note?.status === 'active', { created }),
  assert('create without source refs is rejected', !invalidCreate.valid, { invalidCreate }),
  assert('update preserves replaced note id', updated.valid && updated.note?.replaces?.includes('note.beta.created'), { updated }),
  assert('update preserves old and new source refs', updated.valid && updated.note?.source_refs.includes('obs.beta.001') && updated.note?.source_refs.includes('artifact.beta.001'), { updated }),
  assert('merge requires multiple notes', !invalidMerge.valid, { invalidMerge }),
  assert('merge preserves replaced ids', merged.valid && merged.note?.replaces?.includes('note.beta.updated') && merged.note?.replaces?.includes('note.beta.second'), { merged }),
  assert('merge preserves source refs', merged.valid && merged.note?.source_refs.includes('obs.beta.001') && merged.note?.source_refs.includes('obs.beta.002') && merged.note?.source_refs.includes('review.beta.merge'), { merged }),
  assert('retire requires reason and keeps traceable note', retired.valid && retired.note?.status === 'retired' && retired.note?.stale_reason, { retired }),
  assert('retire without reason is rejected', !invalidRetire.valid, { invalidRetire }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'note-flow',
  status,
  assertions,
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Note flow verification failed.');
  process.exit(1);
}
