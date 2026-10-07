function statusRank(value: unknown): number {
  if (typeof value !== 'object' || value === null || !('statusRank' in value)) return 0;

  const rank = value.statusRank;

  return typeof rank === 'number' ? rank : 0;
}

/** Compares Table rows by the domain status order stored in each row. */
export function compareTableStatus(left: unknown, right: unknown): number {
  return statusRank(left) - statusRank(right);
}
