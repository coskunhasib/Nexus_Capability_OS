import toolGrantFixture from '../samples/capability-runtime/tool.read-doc.grant.sample.json' assert { type: 'json' };
import {
  evaluateWorkspaceAccess,
  validateWorkspaceBoundary,
  type WorkspaceBoundary,
} from '../src/workspaceBoundary.ts';

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const boundary = toolGrantFixture.workspace_boundary as WorkspaceBoundary;

const validBoundary = validateWorkspaceBoundary(boundary);
const readDocs = evaluateWorkspaceAccess(boundary, 'read', 'docs/runtime-security-policy.md');
const readSamples = evaluateWorkspaceAccess(boundary, 'read', './samples/capability-runtime/skill.review-doc.sample.json');
const readBlocked = evaluateWorkspaceAccess(boundary, 'read', '.env');
const readOutside = evaluateWorkspaceAccess(boundary, 'read', 'src/App.tsx');
const writeDenied = evaluateWorkspaceAccess(boundary, 'write', 'docs/new-file.md');
const artifactAllowed = evaluateWorkspaceAccess(boundary, 'artifact_output', 'artifacts/capability-runtime/summary.json');
const artifactOutside = evaluateWorkspaceAccess(boundary, 'artifact_output', 'artifacts/other/summary.json');
const traversalDenied = evaluateWorkspaceAccess(boundary, 'read', '../secrets.env');

const writeBoundary: WorkspaceBoundary = {
  ...boundary,
  allowed_write_paths: ['artifacts/capability-runtime/'],
};
const writeAllowed = evaluateWorkspaceAccess(writeBoundary, 'write', 'artifacts/capability-runtime/output.json');
const writeBlockedOverride = evaluateWorkspaceAccess({
  ...writeBoundary,
  blocked_paths: ['artifacts/capability-runtime/private/'],
}, 'write', 'artifacts/capability-runtime/private/output.json');

const invalidBoundary = validateWorkspaceBoundary({
  allowed_read_paths: 'docs/',
  allowed_write_paths: [],
  blocked_paths: [],
  artifact_output_root: '',
});

const assertions = [
  assert('sample workspace boundary is valid', validBoundary.valid, { errors: validBoundary.errors }),
  assert('docs read is allowed', readDocs.allowed, { readDocs }),
  assert('samples read is allowed with normalized path', readSamples.allowed && readSamples.normalized_path === 'samples/capability-runtime/skill.review-doc.sample.json', { readSamples }),
  assert('blocked read is rejected', !readBlocked.allowed && readBlocked.matched_rule === '.env', { readBlocked }),
  assert('outside read is rejected', !readOutside.allowed, { readOutside }),
  assert('write is rejected when write allowlist is empty', !writeDenied.allowed, { writeDenied }),
  assert('artifact output inside root is allowed', artifactAllowed.allowed, { artifactAllowed }),
  assert('artifact output outside root is rejected', !artifactOutside.allowed, { artifactOutside }),
  assert('parent traversal is rejected', !traversalDenied.allowed, { traversalDenied }),
  assert('write can be allowed by explicit boundary', writeAllowed.allowed, { writeAllowed }),
  assert('blocked path overrides write allow rule', !writeBlockedOverride.allowed && writeBlockedOverride.matched_rule === 'artifacts/capability-runtime/private/', { writeBlockedOverride }),
  assert('invalid boundary shape is rejected', !invalidBoundary.valid, { errors: invalidBoundary.errors }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'workspace-boundary',
  status,
  assertions,
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Workspace boundary verification failed.');
  process.exit(1);
}
