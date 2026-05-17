import type { LocalStore, StoreSnapshot, StoredSliceRecord } from './storageContracts';

export class InMemorySliceStore implements LocalStore {
  private readonly records: StoredSliceRecord[] = [];

  save(record: StoredSliceRecord) {
    this.records.push(record);
  }

  snapshot(): StoreSnapshot {
    return { records: [...this.records] };
  }
}

export class FileSnapshotStore implements LocalStore {
  private readonly records: StoredSliceRecord[] = [];

  save(record: StoredSliceRecord) {
    this.records.push(record);
  }

  snapshot(): StoreSnapshot {
    return { records: [...this.records] };
  }

  toJson() {
    return JSON.stringify(this.snapshot(), null, 2);
  }
}
