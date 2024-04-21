export class UnexpectedNullishValueError extends Error {}

export function isNullish<T>(
  value: T | null | undefined,
): value is null | undefined {
  return value === null || value === undefined;
}

export function isNotNullish<T>(
  value: T | null | undefined,
): value is Exclude<T, null | undefined> {
  return !isNullish(value);
}

export function requireNotNullish<T>(value: T | null | undefined): T {
  if (isNullish(value)) {
    throw new UnexpectedNullishValueError();
  }

  return value;
}
