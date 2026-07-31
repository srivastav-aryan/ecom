/**
 * MongoDB duplicate key error (code 11000).
 * Mongoose surfaces the driver's WriteError shape on failed unique index inserts.
 */
export interface MongoDuplicateKeyError {
  code: 11000;
  keyPattern: Record<string, number>;
  keyValue: Record<string, unknown>;
}

export function isMongoDuplicateKeyError(
  error: unknown,
): error is MongoDuplicateKeyError {
  if (typeof error !== "object" || error === null) return false;

  const candidate = error as { code?: unknown; keyPattern?: unknown };

  return (
    candidate.code === 11000 &&
    typeof candidate.keyPattern === "object" &&
    candidate.keyPattern !== null
  );
}

/** Returns the first field name that collided (e.g. "slug", "name"). */
export function getDuplicateKeyField(error: MongoDuplicateKeyError): string {
  return Object.keys(error.keyPattern)[0] ?? "field";
}
