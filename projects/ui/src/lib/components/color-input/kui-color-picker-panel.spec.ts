import { RendererFactory2, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KUI_ENGLISH_MESSAGES } from '../../i18n/kui-messages.en';
import type { KuiBoundMessages, KuiColorInputMessages } from '../../i18n/kui-messages.interface';
import { hexToParsed, type KuiParsedColor } from './kui-color-input-color.util';
import { KuiColorPickerPanel } from './kui-color-picker-panel';

function boundMessages(): KuiBoundMessages<KuiColorInputMessages> {
  const source = KUI_ENGLISH_MESSAGES.colorInput;
  const context = { locale: 'en-US', formatNumber: (v: number) => String(v), plural: () => '' };

  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      typeof value === 'function'
        ? (params: unknown) => (value as (p: unknown, c: unknown) => string)(params, context)
        : value,
    ]),
  ) as KuiBoundMessages<KuiColorInputMessages>;
}

function setup() {
  const renderer = TestBed.inject(RendererFactory2).createRenderer(null, null);
  const panel = document.createElement('div');
  document.body.append(panel);
  const color = signal<KuiParsedColor>(hexToParsed('#5b4fe0')!);
  const commits: KuiParsedColor[] = [];
  const tooltips: string[] = [];
  const picker = new KuiColorPickerPanel({
    renderer,
    panel,
    messages: boundMessages,
    color: () => color(),
    commit: (next) => {
      commits.push(next);
      color.set(next);
      picker.sync();
    },
    showTooltip: (_anchor, text) => tooltips.push(`hover:${text}`),
    showTooltipOnFocus: (_anchor, text) => tooltips.push(`focus:${text}`),
    hideTooltip: () => tooltips.push('hide'),
    leaveTooltip: () => tooltips.push('hide'),
  });

  return { panel, color, commits, tooltips, picker };
}

describe('KuiColorPickerPanel', () => {
  afterEach(() => document.body.replaceChildren());

  it('builds the surface, the hue slider, the OKLCH and hex fields, six presets and a copy button', () => {
    const { panel, picker } = setup();

    picker.sync();

    const surface = panel.querySelector('.kui-color-input-picker') as HTMLElement;
    expect(surface.getAttribute('role')).toBe('slider');
    expect(surface.getAttribute('aria-valuetext')).toBe('#5b4fe0');
    expect(panel.querySelectorAll('.kui-color-input-num input')).toHaveLength(3);
    expect((panel.querySelector('.kui-color-input-hex') as HTMLInputElement).value).toBe('#5b4fe0');
    expect(panel.querySelectorAll('.kui-color-input-preset')).toHaveLength(6);
    expect(panel.querySelector('.kui-color-input-copy-btn')).toBeTruthy();
  });

  it('builds once and then only updates the visuals', () => {
    const { panel, color, picker } = setup();
    picker.sync();
    const surface = panel.querySelector('.kui-color-input-picker');

    color.set(hexToParsed('#ff0000')!);
    picker.sync();

    expect(panel.querySelector('.kui-color-input-picker')).toBe(surface);
    expect(surface?.getAttribute('aria-valuetext')).toBe('#ff0000');
    expect((panel.querySelector('.kui-color-input-hex') as HTMLInputElement).value).toBe('#ff0000');
  });

  it('does not overwrite a field the user is typing in', () => {
    const { panel, color, picker } = setup();
    picker.sync();
    const hex = panel.querySelector('.kui-color-input-hex') as HTMLInputElement;
    hex.focus();
    hex.value = '#12';

    color.set(hexToParsed('#ff0000')!);
    picker.sync();

    expect(hex.value).toBe('#12');
  });

  it('moves chroma and lightness with the arrow keys of the surface and jumps with Home and End', () => {
    const { panel, commits, picker } = setup();
    picker.sync();
    const surface = panel.querySelector('.kui-color-input-picker') as HTMLElement;
    const before = commits.length;

    surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true }));
    surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', cancelable: true }));

    expect(commits.length).toBe(before + 2);
    expect(commits[commits.length - 1].c).toBe(0);
    expect(commits[0].c).toBeGreaterThan(hexToParsed('#5b4fe0')!.c);

    const other = new KeyboardEvent('keydown', { key: 'x', cancelable: true });
    surface.dispatchEvent(other);
    expect(other.defaultPrevented).toBe(false);
    expect(commits.length).toBe(before + 2);
  });

  it('commits the hex field, the L C H fields, a preset and the hue slider', () => {
    const { panel, commits, picker } = setup();
    picker.sync();

    const hex = panel.querySelector('.kui-color-input-hex') as HTMLInputElement;
    hex.value = '#00ff00';
    hex.dispatchEvent(new Event('change'));
    expect(commits.at(-1)?.hex).toBe('#00ff00');

    const [lightness] = Array.from(
      panel.querySelectorAll<HTMLInputElement>('.kui-color-input-num input'),
    );
    lightness.value = '0.4';
    lightness.dispatchEvent(new Event('change'));
    expect(commits.at(-1)?.l).toBeCloseTo(0.4, 5);

    hex.value = 'not a colour';
    hex.dispatchEvent(new Event('change'));
    expect(commits.at(-1)?.l).toBeCloseTo(0.4, 5);

    (panel.querySelector('.kui-color-input-preset') as HTMLButtonElement).click();
    expect(commits.at(-1)?.hex).toMatch(/^#[0-9a-f]{6}$/u);

    const hue = panel.querySelector('.kui-color-input-hue-native') as HTMLInputElement;
    hue.value = '120';
    hue.dispatchEvent(new Event('input'));
    expect(Math.round(commits.at(-1)!.h)).toBe(120);
  });

  it('shows tooltips for the presets and the copy button and hides them on teardown', () => {
    const { panel, tooltips, picker } = setup();
    picker.sync();

    (panel.querySelector('.kui-color-input-copy-btn') as HTMLElement).dispatchEvent(
      new Event('mouseenter'),
    );
    expect(tooltips).toContain('hover:Copy value');

    tooltips.length = 0;
    picker.destroy();
    expect(tooltips).toEqual(['hide']);
  });

  it('keeps focus handling in the surface for a keyboard user', () => {
    const { panel, picker } = setup();
    picker.sync();

    picker.focusSurface();

    expect(document.activeElement).toBe(panel.querySelector('.kui-color-input-picker'));
  });
});
