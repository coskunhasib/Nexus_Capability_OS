import type { RuntimeEvent } from '../contracts/verticalSliceContracts';

export class RuntimeLog {
  private readonly records: RuntimeEvent[] = [];

  add(record: RuntimeEvent) {
    this.records.push(record);
  }

  addMany(records: RuntimeEvent[]) {
    records.forEach((record) => this.add(record));
  }

  snapshot() {
    return [...this.records];
  }

  names() {
    return this.records.map((record) => record.event);
  }
}

export function runtimeRecord(name: string, ref: string, reason?: string): RuntimeEvent {
  return reason ? { event: name, ref, reason } : { event: name, ref };
}
