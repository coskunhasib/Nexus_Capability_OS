import type { AcceptedArtifact, ArtifactDisposition, CandidateArtifact, NormalizedResult, ReviewDecision } from '../contracts/verticalSliceContracts';

export type ArtifactRegistrySnapshot = {
  candidates: CandidateArtifact[];
  accepted: AcceptedArtifact[];
};

export class InMemoryArtifactRegistry {
  private readonly candidates: CandidateArtifact[] = [];
  private readonly accepted: AcceptedArtifact[] = [];

  recordCandidates(artifacts: CandidateArtifact[]) {
    artifacts.forEach((artifact) => {
      if (!this.candidates.some((item) => item.ref === artifact.ref)) this.candidates.push(artifact);
    });
  }

  commitAccepted(result: NormalizedResult, decision: ReviewDecision, disposition?: ArtifactDisposition): AcceptedArtifact[] {
    if (result.status !== 'candidate') return [];
    if (decision.decision !== 'accept_candidate') return [];
    if (!decision.operatorRef.trim()) return [];
    if (!disposition || disposition.disposition !== 'accept_after_review') return [];
    if (result.artifactRefs.length === 0) return [];
    if (result.sourceRefs.length === 0) return [];

    const artifact = result.artifactRefs[0];
    if (!artifact.ref.startsWith(artifact.root)) return [];
    if (!artifact.ref.startsWith('artifacts/provider-run-candidates/')) return [];
    if (disposition.artifactRef !== artifact.ref) return [];

    const accepted: AcceptedArtifact = {
      artifactId: `accepted-${artifact.ref}`,
      sourceCandidateRef: artifact.ref,
      acceptedBy: decision.operatorRef,
      sourceRefs: result.sourceRefs,
      traceRefs: result.traceRefs,
    };

    if (!this.accepted.some((item) => item.artifactId === accepted.artifactId)) this.accepted.push(accepted);
    return [accepted];
  }

  snapshot(): ArtifactRegistrySnapshot {
    return {
      candidates: [...this.candidates],
      accepted: [...this.accepted],
    };
  }
}
