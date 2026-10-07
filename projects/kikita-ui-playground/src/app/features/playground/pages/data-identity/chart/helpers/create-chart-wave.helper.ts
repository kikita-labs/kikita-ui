/**
 * Builds `count` deterministic, wave-like values for the dense and stress examples, so every run and
 * every screenshot draws the same chart.
 */
export function createChartWave(count: number, phase = 0): readonly number[] {
  return Array.from({ length: count }, (_, index) => {
    const slow = Math.sin((index + phase) / 17);
    const fast = Math.sin((index + phase) / 3.1) * 0.35;

    return Math.round(200 + 120 * slow + 60 * fast);
  });
}
