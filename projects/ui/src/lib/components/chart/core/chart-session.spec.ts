import { ElementRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { afterEach, vi } from 'vitest';

import { KUI_LOCALE } from '../../../i18n/kui-locale.token';
import type { KuiChartTooltipFormatter, KuiChartValueFormat } from '../chart.types';
import type { KuiChartNavigationModel, KuiChartNavMark } from './chart-keyboard-nav.util';
import { KuiChartSession } from './chart-session';

/** Two series over three categories; series 0 is drawn above series 1. */
const GRID: readonly KuiChartNavMark[] = [
  { key: 'a0', series: 0, category: 0, x: 10, y: 20 },
  { key: 'b0', series: 1, category: 0, x: 10, y: 60 },
  { key: 'a1', series: 0, category: 1, x: 50, y: 30 },
  { key: 'b1', series: 1, category: 1, x: 50, y: 70 },
  { key: 'a2', series: 0, category: 2, x: 90, y: 25 },
  { key: 'b2', series: 1, category: 2, x: 90, y: 65 },
];

interface Setup {
  readonly session: KuiChartSession;
  readonly host: HTMLElement;
  readonly marks: ReturnType<typeof signal<readonly KuiChartNavMark[]>>;
  readonly focused: string[];
}

function setup(
  overrides: {
    ariaLabel?: string;
    valueFormat?: KuiChartValueFormat;
    tooltip?: KuiChartTooltipFormatter;
    navigation?: KuiChartNavigationModel;
    marks?: readonly KuiChartNavMark[];
  } = {},
): Setup {
  TestBed.resetTestingModule();

  const host = document.createElement('div');
  document.body.append(host);

  const marks = signal<readonly KuiChartNavMark[]>(overrides.marks ?? GRID);
  const focused: string[] = [];

  for (const mark of marks()) {
    const element = document.createElement('span');
    element.setAttribute('data-kui-mark', mark.key);
    element.focus = () => focused.push(mark.key);
    host.append(element);
  }

  TestBed.configureTestingModule({
    providers: [
      { provide: KUI_LOCALE, useValue: 'en-US' },
      { provide: ElementRef, useValue: new ElementRef(host) },
    ],
  });

  const session = TestBed.runInInjectionContext(
    () =>
      new KuiChartSession({
        idPrefix: 'kui-test-chart',
        defaultLabel: (messages) => messages.lineLabel,
        ariaLabel: signal(overrides.ariaLabel),
        messages: signal(undefined),
        valueFormat: signal(overrides.valueFormat),
        tooltip: signal(overrides.tooltip),
        marks: () => marks(),
        navigation: () => overrides.navigation ?? 'columns',
      }),
  );

  return { session, host, marks, focused };
}

function pointerEvent(type: string, init: PointerEventInit = {}): PointerEvent {
  return Object.assign(new Event(type, { bubbles: true }), {
    clientX: 12,
    clientY: 34,
    pointerType: 'mouse',
    ...init,
  }) as PointerEvent;
}

describe('KuiChartSession', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('names the chart with the built-in label unless one is given', () => {
    expect(setup().session.effectiveAriaLabel()).toBe('Line chart');
    expect(setup({ ariaLabel: 'Revenue' }).session.effectiveAriaLabel()).toBe('Revenue');
  });

  it('gives each chart instance of one page its own id', () => {
    const first = setup().session;
    const second = TestBed.runInInjectionContext(
      () =>
        new KuiChartSession({
          idPrefix: 'kui-test-chart',
          defaultLabel: (messages) => messages.lineLabel,
          ariaLabel: signal(undefined),
          messages: signal(undefined),
          valueFormat: signal(undefined),
          tooltip: signal(undefined),
          marks: () => [],
          navigation: () => 'sequence',
        }),
    );

    expect(first.chartId).toMatch(/^kui-test-chart-/u);
    expect(second.chartId).toMatch(/^kui-test-chart-/u);
    expect(second.chartId).not.toBe(first.chartId);
  });

  it('formats values compactly by default and with the chart format when set', () => {
    expect(setup().session.formatValue(1200)).toBe('1.2K');
    expect(setup({ valueFormat: (value) => `${value}!` }).session.formatValue(5)).toBe('5!');
  });

  describe('point text', () => {
    it('builds the text of a cartesian point with or without a category and from a formatter', () => {
      const { session } = setup();

      expect(session.pointText({ seriesName: 'Sales', value: 1200 })).toContain('Sales');
      expect(session.pointText({ seriesName: 'Sales', value: 1200 })).toContain('1.2K');
      expect(
        session.pointText({ seriesName: 'Sales', categoryLabel: 'May', value: 1200 }),
      ).toContain('May');
      expect(
        setup({ tooltip: (point) => `custom ${point.seriesName}` }).session.pointText({
          seriesName: 'Sales',
          value: 1,
        }),
      ).toBe('custom Sales');
    });

    it('names a scatter point by its data coordinates and a bubble by its radius too', () => {
      const { session } = setup();

      expect(session.pointText({ seriesName: 'Users', x: 22, y: 32000, value: 32000 })).toBe(
        'Users: (22, 32K)',
      );
      expect(session.pointText({ seriesName: 'Users', x: 22, y: 32000, value: 32000, r: 6 })).toBe(
        'Users: (22, 32K), radius 6',
      );
    });

    it('reports a custom tooltip text only when a formatter is set', () => {
      expect(setup().session.customText({ seriesName: 'a', value: 1 })).toBeUndefined();
      expect(setup({ tooltip: () => '' }).session.customText({ seriesName: 'a', value: 1 })).toBe(
        '',
      );
    });
  });

  describe('pointer', () => {
    it('tracks the hovered series and mark while the pointer is over a mark', () => {
      const { session } = setup();
      const group = document.createElement('div');

      session.enter('a', 'a:1', 'text', pointerEvent('pointerenter'), group);

      expect(session.hoveredSeriesId()).toBe('a');
      expect(session.hoveredMarkKey()).toBe('a:1');

      session.onPointerLeave(pointerEvent('pointerleave'));

      expect(session.hoveredSeriesId()).toBeNull();
      expect(session.hoveredMarkKey()).toBeNull();
    });

    it('keeps the hover on a touch pointer leave, because a touch tooltip is pinned', () => {
      const { session } = setup();
      const group = document.createElement('div');

      session.enter(
        'a',
        'a:1',
        'text',
        pointerEvent('pointerenter', { pointerType: 'touch' }),
        group,
      );
      session.onPointerLeave(pointerEvent('pointerleave', { pointerType: 'touch' }));

      expect(session.hoveredSeriesId()).toBe('a');
    });

    it('follows the mark nearest to the pointer and lets go when there is none', () => {
      vi.useFakeTimers();
      const { session } = setup();
      const group = document.createElement('div');

      session.hover({ seriesId: 'a', key: 'a:1', text: 'one' }, pointerEvent('pointermove'), group);
      expect(session.hoveredMarkKey()).toBe('a:1');
      expect(document.querySelector('.kui-tooltip')?.textContent).toBe('one');

      session.hover({ seriesId: 'a', key: 'a:2', text: 'two' }, pointerEvent('pointermove'), group);
      expect(session.hoveredMarkKey()).toBe('a:2');
      expect(document.querySelector('.kui-tooltip')?.textContent).toBe('two');
      expect(document.querySelectorAll('.kui-tooltip')).toHaveLength(1);

      session.hover(null, pointerEvent('pointermove'), group);
      expect(session.hoveredMarkKey()).toBeNull();
      expect(document.querySelector('.kui-tooltip')).toBeNull();
    });

    it('pins a tooltip on a touch hit and does not follow a finger that moves', () => {
      const { session } = setup();
      const group = document.createElement('div');

      session.hover(
        { seriesId: 'a', key: 'a:1', text: 'one' },
        pointerEvent('pointerdown', { pointerType: 'touch' }),
        group,
      );
      session.hover(null, pointerEvent('pointermove', { pointerType: 'touch' }), group);

      expect(session.hoveredMarkKey()).toBe('a:1');
      expect(document.querySelector('.kui-tooltip')).not.toBeNull();
    });
  });

  describe('tooltip (WCAG 1.4.13)', () => {
    it('is dismissed by Escape and stays closed until the pointer leaves and returns', () => {
      vi.useFakeTimers();
      const { session } = setup();
      const group = document.createElement('div');

      session.hover({ seriesId: 'a', key: 'a:1', text: 'one' }, pointerEvent('pointermove'), group);
      expect(document.querySelector('.kui-tooltip')).not.toBeNull();

      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(document.querySelector('.kui-tooltip')).toBeNull();

      // Moving to another mark is not a new trigger: the tooltip stays closed.
      session.hover({ seriesId: 'a', key: 'a:2', text: 'two' }, pointerEvent('pointermove'), group);
      expect(document.querySelector('.kui-tooltip')).toBeNull();

      // Leaving the plot and coming back is.
      session.onPointerLeave(pointerEvent('pointerleave'));
      session.hover({ seriesId: 'a', key: 'a:2', text: 'two' }, pointerEvent('pointermove'), group);
      expect(document.querySelector('.kui-tooltip')?.textContent).toBe('two');
    });

    it('closes at once when the pointer leaves, and ignores the pointer afterwards', () => {
      const { session } = setup();
      const group = document.createElement('div');

      session.hover({ seriesId: 'a', key: 'a:1', text: 'one' }, pointerEvent('pointermove'), group);
      const surface = document.querySelector('.kui-tooltip') as HTMLElement;

      // The tooltip follows the pointer, so it never takes pointer events of its own.
      expect(surface.classList.contains('kui-tooltip--hoverable')).toBe(false);

      session.onPointerLeave(pointerEvent('pointerleave'));
      expect(document.querySelector('.kui-tooltip')).toBeNull();
    });

    it('shows again on a new keyboard focus after Escape', () => {
      vi.useFakeTimers();
      const { session, host } = setup();
      const first = host.querySelector('[data-kui-mark="a0"]') as HTMLElement;
      const second = host.querySelector('[data-kui-mark="a1"]') as HTMLElement;

      session.focus('a0', 'a', 'zero', first);
      expect(document.querySelector('.kui-tooltip')?.textContent).toBe('zero');

      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(document.querySelector('.kui-tooltip')).toBeNull();

      session.focus('a1', 'a', 'one', second);
      expect(document.querySelector('.kui-tooltip')?.textContent).toBe('one');
    });
  });

  describe('focus and keyboard', () => {
    it('remembers the focused mark and mirrors hover by highlighting its series', () => {
      const { session, host } = setup();
      const target = host.querySelector('[data-kui-mark="b1"]') as HTMLElement;

      session.focus('b1', 'b', 'text', target);

      expect(session.rovingKey()).toBe('b1');
      expect(session.hoveredSeriesId()).toBe('b');

      session.onFocusOut(new FocusEvent('focusout', { relatedTarget: null }), host);

      expect(session.hoveredSeriesId()).toBeNull();
    });

    it('starts with the first mark as the only tab stop', () => {
      expect(setup().session.rovingKey()).toBe('a0');
    });

    it('moves DOM focus with the arrow keys of the navigation model and jumps with Home and End', () => {
      const { session, focused } = setup({ navigation: 'columns' });
      const press = (key: string): KeyboardEvent => {
        const event = new KeyboardEvent('keydown', { key, cancelable: true });
        session.onKeydown(event);
        return event;
      };

      expect(press('ArrowRight').defaultPrevented).toBe(true);
      expect(session.rovingKey()).toBe('a1');

      press('ArrowDown');
      expect(session.rovingKey()).toBe('b1');

      press('End');
      expect(session.rovingKey()).toBe('b2');

      press('Home');
      expect(session.rovingKey()).toBe('b0');
      expect(focused).toEqual(['a1', 'b1', 'b2', 'b0']);
      expect(press('x').defaultPrevented).toBe(false);
    });

    it('moves the tab stop to the nearest remaining mark when its mark disappears', () => {
      const { session, host, marks } = setup();
      const target = host.querySelector('[data-kui-mark="b1"]') as HTMLElement;

      session.focus('b1', 'b', 'text', target);
      expect(session.rovingKey()).toBe('b1');

      // The whole second series is hidden.
      marks.set(GRID.filter((mark) => mark.series === 0));
      expect(session.rovingKey()).toBe('a1');

      // And comes back: the mark the user chose holds the tab stop again.
      marks.set(GRID);
      expect(session.rovingKey()).toBe('b1');
    });
  });

  describe('hiding', () => {
    it('hides and shows a series, and clears the hover when the hovered series is hidden', () => {
      const { session } = setup();
      const group = document.createElement('div');

      session.enter('a', 'a:0', 'text', pointerEvent('pointerenter'), group);
      session.toggle('a');

      expect(session.isHidden('a')).toBe(true);
      expect(session.hoveredSeriesId()).toBeNull();
      expect(session.hoveredMarkKey()).toBeNull();

      session.toggle('a');

      expect(session.isHidden('a')).toBe(false);
    });

    it('leaves the hover alone when another series is hidden', () => {
      const { session } = setup();
      const group = document.createElement('div');

      session.enter('a', 'a:0', 'text', pointerEvent('pointerenter'), group);
      session.toggle('b');

      expect(session.hoveredSeriesId()).toBe('a');
    });
  });
});
