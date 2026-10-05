import { describe, expect, it } from 'vitest';

import {
  KUI_CHART_PATTERN_COUNT,
  patternId,
  patternPaint,
  patternShape,
} from './chart-pattern.util';

describe('chart pattern util', () => {
  it('gives each of the first eight series a different hatch', () => {
    const hatches = Array.from({ length: KUI_CHART_PATTERN_COUNT }, (_, i) => patternShape(i).d);

    expect(new Set(hatches).size).toBe(KUI_CHART_PATTERN_COUNT);
  });

  it('repeats the hatches past the eighth series and accepts any integer', () => {
    expect(patternShape(KUI_CHART_PATTERN_COUNT)).toBe(patternShape(0));
    expect(patternShape(-1)).toBe(patternShape(KUI_CHART_PATTERN_COUNT - 1));
  });

  it('keeps the id of a pattern unique per index even when the hatch repeats', () => {
    expect(patternId('c-1', 0)).not.toBe(patternId('c-1', KUI_CHART_PATTERN_COUNT));
    expect(patternId('c-1', 2)).not.toBe(patternId('c-2', 2));
  });

  it('references a pattern by the fragment of its id', () => {
    expect(patternPaint('c-1', 3)).toBe('url(#c-1-pattern-3)');
  });
});
