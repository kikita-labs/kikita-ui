/** Fixed numeric fixtures shared by the Chart page; names and labels are translated on the page. */
export const CHART_SESSIONS: readonly number[] = [120, 180, 150, 220, 260, 210, 300];
export const CHART_SIGNUPS: readonly number[] = [40, 65, 52, 88, 97, 80, 120];
export const CHART_TRIALS: readonly number[] = [18, 26, 31, 44, 52, 47, 63];
export const CHART_SESSIONS_WITH_GAPS: readonly (number | null)[] = [
  120,
  180,
  null,
  220,
  260,
  null,
  300,
];

export const CHART_MONTHLY_REVENUE: readonly number[] = [0, 4200, 9800, 15600];
export const CHART_ANNUAL_REVENUE: readonly number[] = [0, 3100, 8200, 12100];

export const CHART_BALANCE_GAINS: readonly number[] = [12, 18, 9, 15, 20];
export const CHART_BALANCE_LOSSES: readonly number[] = [-6, -9, -4, -11, -7];

export const CHART_SCATTER_FREE: readonly { readonly x: number; readonly y: number }[] = [
  { x: 22, y: 32000 },
  { x: 26, y: 38000 },
  { x: 31, y: 43000 },
  { x: 35, y: 52000 },
  { x: 40, y: 58000 },
];
export const CHART_SCATTER_PRO: readonly { readonly x: number; readonly y: number }[] = [
  { x: 28, y: 54000 },
  { x: 34, y: 66000 },
  { x: 41, y: 71000 },
  { x: 47, y: 88000 },
  { x: 52, y: 96000 },
];

/** Bubble radii are SVG viewBox units; Chart does not clamp them. */
export const CHART_BUBBLE_FREE: readonly {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}[] = CHART_SCATTER_FREE.map((point, index) => ({ ...point, r: 4 + index * 2 }));
export const CHART_BUBBLE_PRO: readonly {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}[] = CHART_SCATTER_PRO.map((point, index) => ({ ...point, r: 12 - index * 2 }));

export const CHART_PLAN_MIX: readonly number[] = [40, 35, 25, 18, 12];

/** Values large enough to demonstrate the default compact format and exact alt-table values. */
export const CHART_LARGE_TRAFFIC: readonly number[] = [
  1_200_000, 1_850_000, 1_640_000, 2_400_000, 2_950_000, 2_310_000, 3_100_000,
];
export const CHART_EXACT_SESSIONS: readonly number[] = [1234, 1876, 1502, 2291, 2648, 2105, 3017];
export const CHART_EXACT_SIGNUPS: readonly number[] = [412, 655, 528, 884, 973, 806, 1204];
