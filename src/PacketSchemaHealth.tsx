import { FileJson, ListChecks, ShieldCheck } from 'lucide-react';
import executionPlanSchema from '../schemas/execution-plan.schema.json';
import taskPacketSchema from '../schemas/task-packet.schema.json';
import runnerStateSchema from '../schemas/runner-state.schema.json';
import reviewReportSchema from '../schemas/review-report.schema.json';
import memoryUpdateSchema from '../schemas/memory-update-packet.schema.json';
import contextUpdateSchema from '../schemas/context-update-packet.schema.json';
import executionPlanSample from '../samples/packets/execution-plan.sample.json';
import taskPacketSample from '../samples/packets/task-packet.sample.json';
import runnerStateSample from '../samples/packets/runner-state.sample.json';
import reviewReportSample from '../samples/packets/review-report.sample.json';
import memoryUpdateSample from '../samples/packets/memory-update-packet.sample.json';
import contextUpdateSample from '../samples/packets/context-update-packet.sample.json';

type Schema = Record<string, unknown>;
type ValidationResult = { valid: boolean; errors: string[] };

const contracts = [
  { id: 'execution-plan', title: 'Execution Plan', schema: executionPlanSchema as Schema, sample: executionPlanSample },
  { id: 'task-packet', title: 'Task Packet', schema: taskPacketSchema as Schema, sample: taskPacketSample },
  { id: 'runner-state', title: 'Runner State', schema: runnerStateSchema as Schema, sample: runnerStateSample },
  { id: 'review-report', title: 'Review Report', schema: reviewReportSchema as Schema, sample: reviewReportSample },
  { id: 'memory-update-packet', title: 'Memory Update Packet', schema: memoryUpdateSchema as Schema, sample: memoryUpdateSample },
  { id: 'context-update-packet', title: 'Context Update Packet', schema: contextUpdateSchema as Schema, sample: contextUpdateSample },
];

function typeOf(value: unknown) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function validate(schema: Schema, value: unknown, pointer = '$'): string[] {
  const errors: string[] = [];

  if ('const' in schema && value !== schema.const) {
    errors.push(`${pointer}: expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }

  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    errors.push(`${pointer}: invalid enum value ${JSON.stringify(value)}`);
  }

  if (typeof schema.type === 'string') {
    const actual = typeOf(value);
    if (actual !== schema.type) {
      errors.push(`${pointer}: expected ${schema.type}, got ${actual}`);
      return errors;
    }
  }

  if (typeof schema.minLength === 'number' && typeof value === 'string' && value.length < schema.minLength) {
    errors.push(`${pointer}: shorter than minLength ${schema.minLength}`);
  }

  if (typeof schema.minItems === 'number' && Array.isArray(value) && value.length < schema.minItems) {
    errors.push(`${pointer}: shorter than minItems ${schema.minItems}`);
  }

  if (schema.type === 'object') {
    const objectValue = asRecord(value);
    for (const key of Array.isArray(schema.required) ? schema.required : []) {
      if (typeof key === 'string' && !(key in objectValue)) errors.push(`${pointer}.${key}: missing required field`);
    }

    const properties = asRecord(schema.properties);
    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in objectValue) errors.push(...validate(childSchema as Schema, objectValue[key], `${pointer}.${key}`));
    }

    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      for (const [key, childValue] of Object.entries(objectValue)) {
        if (!(key in properties)) errors.push(...validate(schema.additionalProperties as Schema, childValue, `${pointer}.${key}`));
      }
    }
  }

  if (schema.type === 'array' && Array.isArray(value) && schema.items && typeof schema.items === 'object') {
    value.forEach((item, index) => errors.push(...validate(schema.items as Schema, item, `${pointer}[${index}]`)));
  }

  return errors;
}

function resultFor(schema: Schema, sample: unknown): ValidationResult {
  const errors = validate(schema, sample);
  return { valid: errors.length === 0, errors };
}

function requiredFields(schema: Schema) {
  return (Array.isArray(schema.required) ? schema.required : []).filter((item): item is string => typeof item === 'string');
}

function enumPaths(schema: Schema, pointer = '$'): string[] {
  const paths: string[] = [];
  if (Array.isArray(schema.enum)) paths.push(pointer);
  const properties = asRecord(schema.properties);
  for (const [key, child] of Object.entries(properties)) paths.push(...enumPaths(child as Schema, `${pointer}.${key}`));
  if (schema.items && typeof schema.items === 'object') paths.push(...enumPaths(schema.items as Schema, `${pointer}[]`));
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') paths.push(...enumPaths(schema.additionalProperties as Schema, `${pointer}.*`));
  return paths;
}

function Badge({ children, tone = 'neutral' }: { children: string | number; tone?: 'neutral' | 'green' | 'yellow' | 'red' | 'cyan' }) {
  const cls = {
    neutral: 'border-white/10 bg-white/5 text-neutral-300',
    green: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300',
    yellow: 'border-yellow-500/20 bg-yellow-950/20 text-yellow-200',
    red: 'border-red-500/20 bg-red-950/20 text-red-200',
    cyan: 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300',
  }[tone];
  return <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{children}</span>;
}

export default function PacketSchemaHealth() {
  const rows = contracts.map((contract) => ({
    ...contract,
    result: resultFor(contract.schema, contract.sample),
    required: requiredFields(contract.schema),
    enumFields: enumPaths(contract.schema),
    version: String((contract.schema.properties as Record<string, unknown> | undefined)?.version ? '0.1' : 'n/a'),
  }));
  const invalidCount = rows.filter((row) => !row.result.valid).length;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldCheck size={18} className="text-cyan-300" />
          Packet Schema Health
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="cyan">{rows.length} contracts</Badge>
          <Badge tone={invalidCount ? 'red' : 'green'}>{invalidCount ? `${invalidCount} invalid` : 'all valid'}</Badge>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-white/10 bg-black/30 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge tone={row.result.valid ? 'green' : 'red'}>{row.result.valid ? 'valid' : 'invalid'}</Badge>
                  <Badge>{row.id}</Badge>
                  <Badge tone="cyan">v{row.version}</Badge>
                </div>
                <h3 className="text-base font-semibold text-white">{row.title}</h3>
                <p className="mt-1 text-xs text-neutral-500">{String(row.schema.$id ?? row.schema.title ?? row.id)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#050505] px-3 py-2 text-xs text-neutral-400">
                sample: {row.id}.sample.json
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-[#050505] p-3">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500"><FileJson size={13} />required</div>
                <div className="flex flex-wrap gap-2">{row.required.map((field) => <Badge key={field}>{field}</Badge>)}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#050505] p-3">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500"><ListChecks size={13} />enum paths</div>
                <div className="flex flex-wrap gap-2">{row.enumFields.length ? row.enumFields.map((field) => <Badge key={field} tone="yellow">{field}</Badge>) : <span className="text-xs text-neutral-500">none</span>}</div>
              </div>
            </div>

            {!row.result.valid && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-950/10 p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-red-200">errors</div>
                <div className="space-y-1 text-xs text-red-100">
                  {row.result.errors.slice(0, 8).map((error) => <div key={error}>{error}</div>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
