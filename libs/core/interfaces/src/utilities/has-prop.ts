export function hasProp<K extends PropertyKey>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: object,
  prop: K,
): data is Record<K, unknown> {
  return prop in data;
}
