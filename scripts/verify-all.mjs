import { spawnSync } from 'node:child_process';

const commands = [
  ['npm', ['run', 'audit:registry']],
  ['npm', ['run', 'validate:packets']],
  ['npm', ['run', 'trial:web-saas-skill']],
  ['npm', ['run', 'trial:all-skills']],
  ['npm', ['run', 'trial:adapter']],
  ['npm', ['run', 'verify:local-worker']],
  ['npm', ['run', 'verify:real-worker']],
  ['npm', ['run', 'verify:controlled-worker']],
  ['npm', ['run', 'verify:controlled-worker-runtime']],
  ['npm', ['run', 'verify:operator-run-runtime']],
  ['npm', ['run', 'verify:artifact-lifecycle']],
  ['npm', ['run', 'verify:workspace-boundary']],
  ['npm', ['run', 'verify:note-flow']],
  ['npm', ['run', 'verify:multi-skill-controlled-runtime']],
  ['npm', ['run', 'verify:decision-gate']],
  ['npm', ['run', 'verify:nexus-host-boundary']],
  ['npm', ['run', 'verify:embedded-package-boundary']],
  ['npm', ['run', 'verify:storage-boundary']],
  ['npm', ['run', 'verify:permission-boundary']],
  ['npm', ['run', 'verify:external-runtime-mapping']],
  ['npm', ['run', 'verify:provider-manifest']],
  ['npm', ['run', 'verify:external-call']],
  ['npm', ['run', 'verify:external-result']],
  ['npm', ['run', 'verify:external-fallback']],
  ['npm', ['run', 'verify:provider-execution']],
  ['npm', ['run', 'verify:review-layer']],
  ['npm', ['run', 'verify:vs']],
  ['npm', ['run', 'verify:vs-snapshot']],
  ['npm', ['run', 'verify:store']],
  ['npm', ['run', 'verify:runner']],
  ['npm', ['run', 'verify:actions']],
  ['npm', ['run', 'verify:oh-adapter']],
  ['npm', ['run', 'verify:ca-adapter']],
  ['npm', ['run', 'verify:capability-runtime']],
  ['npm', ['run', 'verify:handoff']],
  ['npm', ['run', 'verify:runtime-bridge']],
  ['npm', ['run', 'verify:adapter-loop']],
  ['npm', ['run', 'verify:adapter-provider']],
  ['npm', ['run', 'verify:event-store']],
  ['npm', ['run', 'verify:artifacts']],
  ['npm', ['run', 'verify:review-hardening']],
  ['npm', ['run', 'verify:memory-context']],
];

for (const [command, args] of commands) {
  const label = `${command} ${args.join(' ')}`;
  console.log(`\n> ${label}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    console.error(`verify-all failed at: ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log('\nverify-all passed');
