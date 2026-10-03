/** Compares nullable dates by timestamp, treating `null` as its own distinct value. */
export function sameNullableDate(a: Date | null, b: Date | null): boolean {
  return (a?.getTime() ?? null) === (b?.getTime() ?? null);
}
