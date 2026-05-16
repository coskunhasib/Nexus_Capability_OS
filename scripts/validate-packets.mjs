import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const pairs = [
  ['schemas/execution-plan.schema.json', 'samples/packets/execution-plan.sample.json'],
  ['schemas/task-packet.schema.json', 'samples/packets/task-packet.sample.json'],
  ['schemas/runner-state.schema.json', 'samples/packets/runner-state.sample.json'],
  ['schemas/review-report.schema.json', 'samples/packets/review-report.sample.json'],
  ['schemas/memory-update-packet.schema.json', 'samples/packets/memory-update-packet.sample.json'],
  ['schemas/context-update-packet.schema.json', 'samples/packets/context-update-packet.sample.json'],
  ['schemas/nexus-handoff-packet.schema.json', 'samples/packets/nexus-handoff-packet.sample.json'],
  ['schemas/runtime-bridge.schema.json', 'samples/packets/runtime-bridge.sample.json'],
  ['schemas/runtime-adapter-request.schema.json', 'samples/packets/runtime-adapter-request.sample.json'],
  ['schemas/runtime-adapter-response.schema.json', 'samples/packets/runtime-adapter-response.sample.json'],
  ['schemas/trial-scenario.schema.json', 'samples/trials/web-saas-mvp.trial.json'],
  ['schemas/trial-scenario.schema.json', 'samples/trials/stm32-firmware.trial.json'],
  ['schemas/trial-scenario.schema.json', 'samples/trials/agentic-system.trial.json'],
  ['schemas/trial-scenario.schema.json', 'samples/trials/rfq-generation.trial.json'],
  ['schemas/trial-scenario.schema.json', 'samples/trials/technical-report.trial.json'],
  ['schemas/trial-scenario.schema.json', 'samples/trials/adapter-mock-runtime.trial.json'],
  ['schemas/trial-scenario.schema.json', 'samples/trials/adapter-http-dry-run.trial.json'],
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function validate(schema, value, pointer = '$') {
  const errors = [];

  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${pointer}: expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${pointer}: expected one of ${schema.enum.join(', ')}, got ${JSON.stringify(value)}`);
  }

  if (schema.type) {
    const actual = typeOf(value);
    if (actual !== schema.type) {
      errors.push(`${pointer}: expected type ${schema.type}, got ${actual}`);
      return errors;
    }
  }

  if (schema.minLength !== undefined && typeof value === 'string' && value.length < schema.minLength) {
    errors.push(`${pointer}: string shorter than minLength ${schema.minLength}`);
  }

  if (schema.minItems !== undefined && Array.isArray(value) && value.length < schema.minItems) {
    errors.push(`${pointer}: array shorter than minItems ${schema.minItems}`);
  }

  if (schema.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
    const objectValue = value;
    for (const key of schema.required ?? []) {
      if (!(key in objectValue)) errors.push(`${pointer}.${key}: missing required field`);
    }

    for (const [key, childSchema] of Object.entries(schema.properties ?? {})) {
      if (key in objectValue) {
        errors.push(...validate(childSchema, objectValue[key], `${pointer}.${key}`));
      }
    }

    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      for (const [key, childValue] of Object.entries(objectValue)) {
        if (!(schema.properties ?? {})[key]) {
          errors.push(...validate(schema.additionalProperties, childValue, `${pointer}.${key}`));
        }
      }
    }
  }

  if (schema.type === 'array' && Array.isArray(value) && schema.items) {
    value.forEach((item, index) => {
      errors.push(...validate(schema.items, item, `${pointer}[${index}]`));
    });
  }

  return errors;
}

let totalErrors = 0;
const results = [];

for (const [schemaPath, samplePath] of pairs) {
  const schema = readJson(schemaPath);
  const sample = readJson(samplePath);
  const errors = validate(schema, sample);
  totalErrors += errors.length;
  results.push({ schema: schemaPath, sample: samplePath, valid: errors.length === 0, errors });
}

console.log(JSON.stringify({ results }, null, 2));

if (totalErrors > 0) {
  console.error(`Packet validation failed with ${totalErrors} error(s).`);
  process.exit(1);
}

console.log('Packet and trial validation passed.');