// safe-errors.ts — application-owned diagnostic metadata, not arbitrary driver serialization
const messages = {
  UNEXPECTED: 'Unexpected operation failure',
  DATABASE_UNAVAILABLE: 'Required database unavailable',
  INVENTORY_REJECTED: 'Inventory operation rejected',
} as const;
type DiagnosticCode = keyof typeof messages;
interface OwnedDiagnostic { code: DiagnosticCode; frames: string; cause: unknown }
const owned = new WeakMap<Error, OwnedDiagnostic>();
export class DiagnosticError extends Error {
  constructor(code: DiagnosticCode, cause?: unknown) {
    super(messages[code], { cause });
    this.name = 'DiagnosticError';
    // Capture here; never accept a caller-provided stack/message as diagnostic metadata.
    const frames = (new Error().stack ?? '').split('\n').slice(2, 10).join('\n').slice(0, 2048);
    owned.set(this, { code, frames, cause });
  }
}
interface SafeError {
  code: DiagnosticCode;
  message: string;
  stackFrames?: string;
  cause?: SafeError;
  truncated?: boolean;
}
export function serializeError(value: unknown): SafeError {
  const seen = new Set<unknown>();
  function visit(current: unknown, depth: number): SafeError {
    if (seen.has(current) || depth >= 3) {
      return { code: 'UNEXPECTED', message: messages.UNEXPECTED, truncated: true };
    }
    seen.add(current);
    const detail = current instanceof Error ? owned.get(current) : undefined;
    if (!detail) return { code: 'UNEXPECTED', message: messages.UNEXPECTED };
    return {
      code: detail.code, message: messages[detail.code], stackFrames: detail.frames,
      ...(detail.cause === undefined ? {} : { cause: visit(detail.cause, depth + 1) }),
    };
  }
  return visit(value, 0);
}
