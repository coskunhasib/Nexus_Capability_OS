import type {
  AcceptedArtifact,
  ArtifactDisposition,
  HostRequest,
  NormalizedResult,
  ProviderRunRequest,
  ReviewDecision,
  RuntimeEvent,
  VerticalSliceResult,
} from '../contracts/verticalSliceContracts';

export type StoredSliceRecord = {
  hostRequest: HostRequest;
  runRequest?: ProviderRunRequest;
  normalizedResult?: NormalizedResult;
  reviewDecision?: ReviewDecision;
  disposition?: ArtifactDisposition;
  acceptedArtifacts: AcceptedArtifact[];
  runtimeEvents: RuntimeEvent[];
  status: VerticalSliceResult['status'];
  reasonCode: VerticalSliceResult['reasonCode'];
  stateHistory: VerticalSliceResult['stateHistory'];
};

export type StoreSnapshot = {
  records: StoredSliceRecord[];
};

export interface LocalStore {
  save(record: StoredSliceRecord): void;
  snapshot(): StoreSnapshot;
}

export function toStoredSliceRecord(result: VerticalSliceResult): StoredSliceRecord {
  return {
    hostRequest: result.hostRequest,
    runRequest: result.runRequest,
    normalizedResult: result.normalizedResult,
    reviewDecision: result.reviewDecision,
    disposition: result.disposition,
    acceptedArtifacts: result.acceptedArtifacts,
    runtimeEvents: result.events,
    status: result.status,
    reasonCode: result.reasonCode,
    stateHistory: result.stateHistory,
  };
}
