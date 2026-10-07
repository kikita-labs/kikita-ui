import {
  contrastRatio,
  hexToOklch,
  normalizeHue,
  oklchToRgb8,
  rgbToHex,
  srgb8ToOklch,
} from './kui-color-math';

describe('kui color math', () => {
  it('converts white and black to the ends of the lightness scale', () => {
    const white = srgb8ToOklch(255, 255, 255);
    const black = srgb8ToOklch(0, 0, 0);

    expect(white.lightness).toBeCloseTo(1, 4);
    expect(white.chroma).toBeCloseTo(0, 4);
    expect(black.lightness).toBeCloseTo(0, 4);
  });

  it('reads #rgb and #rrggbb to the same colour and rejects other text', () => {
    expect(hexToOklch('#fff')).toEqual(hexToOklch('#ffffff'));
    expect(hexToOklch('#5B4FE0')).toEqual(hexToOklch('#5b4fe0'));
    expect(hexToOklch('5b4fe0')).toBeNull();
    expect(hexToOklch('#5b4fe')).toBeNull();
    expect(hexToOklch('#gggggg')).toBeNull();
  });

  it('round-trips an sRGB colour through OKLCH and back', () => {
    const oklch = hexToOklch('#5b4fe0');

    expect(oklch).not.toBeNull();
    expect(rgbToHex(...oklchToRgb8(oklch!))).toBe('#5b4fe0');
  });

  it('clips an out-of-gamut colour instead of wrapping it', () => {
    const [red, green, blue] = oklchToRgb8({ lightness: 0.7, chroma: 0.4, hue: 140 });

    for (const channel of [red, green, blue]) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(255);
    }
  });

  it('wraps hues into 0..360 and pads hex channels to two digits', () => {
    expect(normalizeHue(-30)).toBe(330);
    expect(normalizeHue(390)).toBe(30);
    expect(normalizeHue(360)).toBe(0);
    expect(rgbToHex(0, 5, 255)).toBe('#0005ff');
  });

  it('measures the WCAG contrast of black on white as 21', () => {
    const white = { lightness: 1, chroma: 0, hue: 0 };
    const black = { lightness: 0, chroma: 0, hue: 0 };

    expect(contrastRatio(white, black)).toBeCloseTo(21, 1);
  });
});
