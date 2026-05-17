export type WorkspaceBoundary = {
  allowed_read_paths: string[];
  allowed_write_paths: string[];
  blocked_paths: string[];
  artifact_output_root: string;
};

export type WorkspaceAccessKind = 'read' | 'write' | 'artifact_output';

export type WorkspaceBoundaryDecision = {
  allowed: boolean;
  reason: string;
  normalized_path?: string;
  matched_rule?: string;
};

function cleanPath(input: string): string | undefined {
  const normalized = input.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+/g, '/').trim();
  if (!normalized) return undefined;
  if (normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) return undefined;
  return normalized;
}

function prefix(input: string): string | undefined {
  const normalized = cleanPath(input);
  if (!normalized) return undefined;
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function under(path: string, root: string): boolean {
  const p = prefix(root);
  if (!p) return false;
  return path === p.slice(0, -1) || path.startsWith(p);
}

function first(path: string, roots: string[]): string | undefined {
  return roots.find((root) => under(path, root));
}

export function validateWorkspaceBoundary(value: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const b = value as WorkspaceBoundary;
  if (!b || typeof b !== 'object' || Array.isArray(b)) return { valid: false, errors: ['workspace boundary must be an object'] };
  if (!Array.isArray(b.allowed_read_paths)) errors.push('allowed_read_paths must be an array');
  if (!Array.isArray(b.allowed_write_paths)) errors.push('allowed_write_paths must be an array');
  if (!Array.isArray(b.blocked_paths)) errors.push('blocked_paths must be an array');
  if (typeof b.artifact_output_root !== 'string' || !b.artifact_output_root.trim()) errors.push('artifact_output_root must be a non-empty string');
  return { valid: errors.length === 0, errors };
}

export function evaluateWorkspaceAccess(boundary: WorkspaceBoundary, kind: WorkspaceAccessKind, targetPath: string): WorkspaceBoundaryDecision {
  const boundaryValidation = validateWorkspaceBoundary(boundary);
  if (!boundaryValidation.valid) return { allowed: false, reason: boundaryValidation.errors.join('; ') };
  const normalized = cleanPath(targetPath);
  if (!normalized) return { allowed: false, reason: 'invalid path' };
  const stop = first(normalized, boundary.blocked_paths);
  if (stop) return { allowed: false, reason: 'matched blocked_paths', normalized_path: normalized, matched_rule: stop };
  if (kind === 'read') {
    const matched = first(normalized, boundary.allowed_read_paths);
    return matched ? { allowed: true, reason: 'read allowed', normalized_path: normalized, matched_rule: matched } : { allowed: false, reason: 'read outside boundary', normalized_path: normalized };
  }
  if (kind === 'write') {
    const matched = first(normalized, boundary.allowed_write_paths);
    return matched ? { allowed: true, reason: 'write allowed', normalized_path: normalized, matched_rule: matched } : { allowed: false, reason: 'write outside boundary', normalized_path: normalized };
  }
  return under(normalized, boundary.artifact_output_root)
    ? { allowed: true, reason: 'artifact path allowed', normalized_path: normalized, matched_rule: boundary.artifact_output_root }
    : { allowed: false, reason: 'artifact path outside boundary', normalized_path: normalized };
}
