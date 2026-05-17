export type Scenario =
  | 'happy_path'
  | 'missing_source_refs'
  | 'fallback_path'
  | 'review_reject_path'
  | 'request_changes_path'
  | 'artifact_without_disposition'
  | 'missing_operator_ref'
  | 'artifact_outside_root';

export type SliceState =
  | 'created'
  | 'prepared'
  | 'running'
  | 'normalized'
  | 'reviewed'
  | 'disposed'
  | 'accepted'
  | 'blocked'
  | 'fallback_used'
  | 'changes_requested'
  | 'rejected';

export type HostRequest = {
  requestId: string;
  objective: string;
  sourceRefs: string[];
  scenario: Scenario;
};

export type RuntimeEvent = {
  event: string;
  ref: string;
  reason?: string;
};

export type ProviderRunRequest = {
  runId: string;
  requestRef: string;
  sourceRefs: string[];
  artifactRoot: string;
  fallbackRef: string;
  manualReviewRequired: true;
};

export type CandidateArtifact = {
  kind: 'candidate_patch';
  ref: string;
  root: string;
  summary: string;
  candidateOnly: true;
};

export type NormalizedResult = {
  resultId: string;
  runRef: string;
  status: 'candidate' | 'fallback_used' | 'blocked';
  summary: string;
  sourceRefs: string[];
  artifactRefs: CandidateArtifact[];
  traceRefs: string[];
  reason?: string;
};

export type ReviewDecision = {
  decisionId: string;
  resultRef: string;
  decision: 'accept_candidate' | 'use_fallback' | 'reject_candidate' | 'request_changes';
  reason: string;
  operatorRef: string;
};

export type ArtifactDisposition = {
  dispositionId: string;
  artifactRef: string;
  disposition: 'accept_after_review' | 'use_fallback_result' | 'reject_candidate' | 'request_revision';
  decisionRef: string;
  reason: string;
};

export type AcceptedArtifact = {
  artifactId: string;
  sourceCandidateRef: string;
  acceptedBy: string;
  sourceRefs: string[];
  traceRefs: string[];
};

export type SliceRunner = {
  runnerRef: string;
  run: (request: ProviderRunRequest, scenario: Scenario) => NormalizedResult;
};

export type VerticalSliceResult = {
  status: 'accepted' | 'blocked' | 'fallback_used' | 'changes_requested' | 'rejected';
  hostRequest: HostRequest;
  runRequest?: ProviderRunRequest;
  normalizedResult?: NormalizedResult;
  reviewDecision?: ReviewDecision;
  disposition?: ArtifactDisposition;
  acceptedArtifacts: AcceptedArtifact[];
  events: RuntimeEvent[];
  stateHistory: SliceState[];
  runnerRef?: string;
  reason?: string;
};
