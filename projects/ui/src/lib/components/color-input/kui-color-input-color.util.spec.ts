import {
  hexToParsed,
  KUI_COLOR_INPUT_MAX_CHROMA,
  normalizeOklch,
  parseColor,
} from './kui-color-input-color.util';

describe('kui color input colour util', () => {
  it('reads short and long hex text, with any case and surrounding space', () => {
    expect(parseColor('#abc')?.hex).toBe('#aabbcc');
    expect(parseColor('  #5B4FE0 ')?.hex).toBe('#5b4fe0');
    expect(parseColor('#5b4fe0')?.l).toBeGreaterThan(0);
  });

  it('reads oklch text with a plain or percent lightness', () => {
    const plain = parseColor('oklch(0.52 0.25 285)');
    const percent = parseColor('oklch(52% 0.25 285)');

    expect(plain?.l).toBeCloseTo(0.52, 5);
    expect(percent?.l).toBeCloseTo(0.52, 5);
    expect(plain?.hex).toMatch(/^#[0-9a-f]{6}$/u);
  });

  it('rejects text that is neither a hex nor an oklch colour', () => {
    expect(parseColor('')).toBeNull();
    expect(parseColor('red')).toBeNull();
    expect(parseColor('#12')).toBeNull();
    expect(parseColor('oklch(0.5 0.1)')).toBeNull();
    expect(hexToParsed('5b4fe0')).toBeNull();
  });

  it('clamps lightness, chroma and hue to what the picker can show', () => {
    const high = normalizeOklch(1.4, 0.9, 725);
    const low = normalizeOklch(-1, -1, -30);

    expect(high.l).toBe(1);
    expect(high.c).toBe(KUI_COLOR_INPUT_MAX_CHROMA);
    expect(high.h).toBe(5);
    expect(low.l).toBe(0);
    expect(low.c).toBe(0);
    expect(low.h).toBe(330);
  });

  it('keeps a hue of exactly 360 instead of wrapping it to 0', () => {
    expect(normalizeOklch(0.5, 0.1, 360).h).toBe(360);
  });
});
