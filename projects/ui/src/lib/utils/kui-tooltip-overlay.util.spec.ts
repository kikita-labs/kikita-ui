import { getTooltipPositions, KUI_TOOLTIP_DEFAULT_OFFSET } from './kui-tooltip-overlay.util';

describe('getTooltipPositions', () => {
  it('uses the default gap on the side facing the anchor', () => {
    expect(KUI_TOOLTIP_DEFAULT_OFFSET).toBe(6);
    expect(getTooltipPositions('top')[0]?.offsetY).toBe(-6);
    expect(getTooltipPositions('bottom')[0]?.offsetY).toBe(6);
    expect(getTooltipPositions('left')[0]?.offsetX).toBe(-6);
    expect(getTooltipPositions('right')[0]?.offsetX).toBe(6);
  });

  it('applies a custom gap in the direction away from the anchor', () => {
    expect(getTooltipPositions('top', 14)[0]?.offsetY).toBe(-14);
    expect(getTooltipPositions('bottom', 14)[0]?.offsetY).toBe(14);
    expect(getTooltipPositions('left', 14)[0]?.offsetX).toBe(-14);
    expect(getTooltipPositions('right', 14)[0]?.offsetX).toBe(14);
  });

  it('allows a zero gap', () => {
    expect(getTooltipPositions('bottom', 0)[0]?.offsetY).toBe(0);
  });
});
