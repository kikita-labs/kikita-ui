import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KUI_LOCALE } from '../../../i18n/kui-locale.token';
import type { KuiChartTooltipFormatter, KuiChartValueFormat } from '../chart.types';
import { KuiChartSession } from './chart-session';

function setup(
  overrides: {
    ariaLabel?: string;
    valueFormat?: KuiChartValueFormat;
    tooltip?: KuiChartTooltipFormatter;
    markCount?: number;
    focused?: string[];
  } = {},
): KuiChartSession {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [{ provide: KUI_LOCALE, useValue: 'en-US' }] });

  const refs = Array.from({ length: overrides.markCount ?? 3 }, (_, index) => ({
    focus: () => overrides.focused?.push(`mark-${index}`),
  }));

  return TestBed.runInInjectionContext(
    () =>
      new KuiChartSession({
        idPrefix: 'kui-test-chart',
        defaultLabel: (messages) => messages.lineLabel,
        ariaLabel: signal(overrides.ariaLabel),
        messages: signal(undefined),
        valueFormat: signal(overrides.valueFormat),
        tooltip: signal(overrides.tooltip),
        markCount: () => refs.length,
        markRefs: () => refs,
      }),
  );
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
  it('names the chart with the built-in label unless one is given', () => {
    expect(setup().effectiveAriaLabel()).toBe('Line chart');
    expect(setup({ ariaLabel: 'Revenue' }).effectiveAriaLabel()).toBe('Revenue');
  });

  it('gives each chart instance of one page its own id', () => {
    const first = setup();
    const second = TestBed.runInInjectionContext(
      () =>
        new KuiChartSession({
          idPrefix: 'kui-test-chart',
          defaultLabel: (messages) => messages.lineLabel,
          ariaLabel: signal(undefined),
          messages: signal(undefined),
          valueFormat: signal(undefined),
          tooltip: signal(undefined),
          markCount: () => 0,
          markRefs: () => [],
        }),
    );

    expect(first.chartId).toMatch(/^kui-test-chart-/u);
    expect(second.chartId).toMatch(/^kui-test-chart-/u);
    expect(second.chartId).not.toBe(first.chartId);
  });

  it('formats values compactly by default and with the chart format when set', () => {
    expect(setup().formatValue(1200)).toBe('1.2K');
    expect(setup({ valueFormat: (value) => `${value}!` }).formatValue(5)).toBe('5!');
  });

  it('builds the text of a cartesian point with or without a category and from a formatter', () => {
    const session = setup();

    expect(session.pointText({ seriesName: 'Sales', value: 1200 })).toContain('Sales');
    expect(session.pointText({ seriesName: 'Sales', value: 1200 })).toContain('1.2K');
    expect(session.pointText({ seriesName: 'Sales', categoryLabel: 'May', value: 1200 })).toContain(
      'May',
    );
    expect(
      setup({ tooltip: (point) => `custom ${point.seriesName}` }).pointText({
        seriesName: 'Sales',
        value: 1,
      }),
    ).toBe('custom Sales');
  });

  it('reports a custom tooltip text only when a formatter is set', () => {
    expect(setup().customText({ seriesName: 'a', value: 1 })).toBeUndefined();
    expect(setup({ tooltip: () => '' }).customText({ seriesName: 'a', value: 1 })).toBe('');
  });

  it('tracks the hovered series and mark while the pointer is over a mark', () => {
    const session = setup();
    const group = document.createElement('div');

    session.enter('a', 'a:1', 'text', pointerEvent('pointerenter'), group);

    expect(session.hoveredSeriesId()).toBe('a');
    expect(session.hoveredMarkKey()).toBe('a:1');

    session.onPointerLeave(pointerEvent('pointerleave'));

    expect(session.hoveredSeriesId()).toBeNull();
    expect(session.hoveredMarkKey()).toBeNull();
  });

  it('keeps the hover on a touch pointer leave, because a touch tooltip is pinned', () => {
    const session = setup();
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

  it('remembers the focused mark and does not re-anchor to a mark the pointer already hovers', () => {
    const session = setup();
    const target = document.createElement('span');

    session.focus(2, 'a:2', 'text', target);

    expect(session.focusedMarkIndex()).toBe(2);
  });

  it('moves the roving focus with the arrow keys and jumps with Home and End', () => {
    const focused: string[] = [];
    const session = setup({ markCount: 4, focused });
    const press = (key: string): KeyboardEvent => {
      const event = new KeyboardEvent('keydown', { key, cancelable: true });
      session.onKeydown(event);
      return event;
    };

    expect(press('ArrowRight').defaultPrevented).toBe(true);
    expect(session.focusedMarkIndex()).toBe(1);

    press('End');
    expect(session.focusedMarkIndex()).toBe(3);

    press('Home');
    expect(session.focusedMarkIndex()).toBe(0);
    expect(focused).toEqual(['mark-1', 'mark-3', 'mark-0']);
    expect(press('x').defaultPrevented).toBe(false);
  });

  it('hides and shows a series, and clears the hover when the hovered series is hidden', () => {
    const session = setup();
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
    const session = setup();
    const group = document.createElement('div');

    session.enter('a', 'a:0', 'text', pointerEvent('pointerenter'), group);
    session.toggle('b');

    expect(session.hoveredSeriesId()).toBe('a');
  });
});
