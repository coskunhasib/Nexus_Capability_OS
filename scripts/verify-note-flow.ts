import { createNote, mergeNotes, retireNote, updateNote } from '../src/noteFlow.ts';

function assert(name: string, pass: unknown, details?: Record<string, unknown>) {
  return { name, pass: Boolean(pass), details };
}

const t0 = '2026-05-17T00:00:00.000Z';
const t1 = '2026-05-17T00:01:00.000Z';
const t2 = '2026-05-17T00:02:00.000Z';
const t3 = '2026-05-17T00:03:00.000Z';
const t4 = '2026-05-17T00:04:00.000Z';
const t5 = '2026-05-17T00:05:00.000Z';

const a = createNote({
  note_id: 'note.beta.a',
  topic: 'Beta note flow',
  note_type: 'decision',
  summary: 'Create note candidates with source refs.',
  source_refs: ['obs.beta.001'],
  confidence: 'high',
  at: t0,
});

const badCreate = createNote({
  note_id: 'note.beta.bad',
  topic: 'Bad note',
  note_type: 'decision',
  summary: 'No refs.',
  source_refs: [],
  confidence: 'high',
  at: t0,
});

const b = a.note ? updateNote({
  existing: a.note,
  note_id: 'note.beta.b',
  summary: 'Updated note keeps previous and new refs.',
  source_refs: ['artifact.beta.001'],
  at: t1,
}) : { valid: false, errors: ['missing a'] };

const c = createNote({
  note_id: 'note.beta.c',
  topic: 'Second note',
  note_type: 'lesson',
  summary: 'Second note.',
  source_refs: ['obs.beta.002'],
  confidence: 'medium',
  at: t2,
});

const merged = b.note && c.note ? mergeNotes({
  note_id: 'note.beta.merged',
  topic: 'Merged note',
  notes: [b.note, c.note],
  summary: 'Merged note keeps lineage and refs.',
  source_refs: ['review.beta.merge'],
  confidence: 'high',
  at: t3,
}) : { valid: false, errors: ['missing merge input'] };

const badMerge = b.note ? mergeNotes({
  note_id: 'note.beta.bad-merge',
  topic: 'Bad merge',
  notes: [b.note],
  summary: 'Single note merge.',
  source_refs: ['review.beta.merge'],
  confidence: 'medium',
  at: t4,
}) : { valid: false, errors: ['missing b'] };

const closed = merged.note ? retireNote({
  existing: merged.note,
  reason: 'Superseded by later summary.',
  at: t4,
}) : { valid: false, errors: ['missing merged'] };

const badClose = merged.note ? retireNote({
  existing: merged.note,
  reason: '',
  at: t5,
}) : { valid: false, errors: ['missing merged'] };

const assertions = [
  assert('create with refs', a.valid && a.note?.status === 'active', { a }),
  assert('create without refs fails', !badCreate.valid, { badCreate }),
  assert('update has lineage', b.valid && b.note?.replaces?.includes('note.beta.a'), { b }),
  assert('update keeps refs', b.valid && b.note?.source_refs.includes('obs.beta.001') && b.note?.source_refs.includes('artifact.beta.001'), { b }),
  assert('single note merge fails', !badMerge.valid, { badMerge }),
  assert('merge has lineage', merged.valid && merged.note?.replaces?.includes('note.beta.b') && merged.note?.replaces?.includes('note.beta.c'), { merged }),
  assert('merge keeps refs', merged.valid && merged.note?.source_refs.includes('obs.beta.001') && merged.note?.source_refs.includes('obs.beta.002') && merged.note?.source_refs.includes('review.beta.merge'), { merged }),
  assert('close has note status', closed.valid && closed.note?.status === 'retired' && closed.note?.stale_reason, { closed }),
  assert('close without reason fails', !badClose.valid, { badClose }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = { suite_id: 'note-flow', status, assertions };
console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Note flow verification failed.');
  process.exit(1);
}
