import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { KuiCarouselComponent } from './components/carousel/kui-carousel.component';
import { KuiCarouselSlideDirective } from './components/carousel/kui-carousel-slide.directive';
import { KuiDonutChartComponent } from './components/chart/kui-donut-chart.component';
import { KuiCommandPaletteComponent } from './components/command-palette/kui-command-palette.component';
import { KuiDropdownComponent } from './components/dropdown/kui-dropdown.component';
import { KuiDropdownForDirective } from './components/dropdown/kui-dropdown-for.directive';
import { KuiOptionDirective } from './components/dropdown/kui-option.directive';
import { KuiMenuComponent } from './components/menu/kui-menu.component';
import { KuiMenuForDirective } from './components/menu/kui-menu-for.directive';
import { KuiMenuItemDirective } from './components/menu/kui-menu-item.directive';
import { KuiNumberInputDirective } from './components/number-input/kui-number-input.directive';
import { KuiPopoverComponent } from './components/popover/kui-popover.component';
import { KuiPopoverForDirective } from './components/popover/kui-popover-for.directive';
import { KuiSegmentDirective } from './components/segmented/kui-segment.directive';
import { KuiSegmentedComponent } from './components/segmented/kui-segmented.component';
import { KuiSliderDirective } from './components/slider/kui-slider.directive';
import { KuiTabDirective } from './components/tabs/kui-tab.directive';
import { KuiTabsComponent } from './components/tabs/kui-tabs.component';
import { KuiTimePickerPanelComponent } from './components/time-picker/kui-time-picker-panel.component';
import { KuiToastRegionComponent } from './components/toast/kui-toast-region.component';
import { KuiTooltipDirective } from './components/tooltip/kui-tooltip.directive';

/**
 * Resource-lifecycle regression suite: every component that owns a timer, animation frame,
 * observer or `document`/`window` listener must return to the baseline once it is destroyed, and a
 * callback that was already scheduled must not throw when it fires afterwards. The register with the
 * per-call analysis is `docs/ssr-lifecycle-register.md`.
 */

type ListenerTarget = 'document' | 'window';

/**
 * Window listeners owned by root singletons (`ViewportRuler`, `Location`) that live until the
 * injector is destroyed; they are not component resources.
 */
const ROOT_WINDOW_LISTENERS = /^window:(resize|orientationchange|popstate|hashchange):/;

/** Net number of live `document`/`window` listeners, keyed by target, type and capture flag. */
class ListenerLedger {
  private readonly live = new Map<string, number>();
  private readonly restores: (() => void)[] = [];

  constructor() {
    this.spy('document', document);
    this.spy('window', window);
  }

  snapshot(): Record<string, number> {
    return Object.fromEntries(
      [...this.live].filter(([key, count]) => count !== 0 && !ROOT_WINDOW_LISTENERS.test(key)),
    );
  }

  dispose(): void {
    this.restores.forEach((restore) => restore());
  }

  private spy(name: ListenerTarget, target: EventTarget): void {
    const add = target.addEventListener.bind(target);
    const remove = target.removeEventListener.bind(target);
    const keyOf = (
      type: string,
      options?: boolean | AddEventListenerOptions | EventListenerOptions,
    ) => `${name}:${type}:${typeof options === 'boolean' ? options : !!options?.capture}`;

    target.addEventListener = ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      const key = keyOf(type, options);
      this.live.set(key, (this.live.get(key) ?? 0) + 1);
      add(type, listener, options);
    }) as typeof target.addEventListener;

    target.removeEventListener = ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ) => {
      const key = keyOf(type, options);
      this.live.set(key, (this.live.get(key) ?? 0) - 1);
      remove(type, listener, options);
    }) as typeof target.removeEventListener;

    this.restores.push(() => {
      target.addEventListener = add as typeof target.addEventListener;
      target.removeEventListener = remove as typeof target.removeEventListener;
    });
  }
}

function mount<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [component] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}

/**
 * Destroys the fixture, drops leftover overlay DOM and lets every scheduled callback fire. Two
 * passes: disposing a CDK overlay schedules its own follow-up timers, so a single pass leaves
 * framework housekeeping behind. A leaked interval survives both passes.
 */
function tearDown(fixture: ComponentFixture<unknown>): void {
  fixture.destroy();
  TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
  vi.runOnlyPendingTimers();
  vi.runOnlyPendingTimers();
}

@Component({
  imports: [KuiPopoverComponent, KuiPopoverForDirective],
  template: `
    <button [kuiPopoverFor]="pop" id="trigger">Open</button>
    <kui-popover #pop><p>Content</p></kui-popover>
  `,
})
class ClickPopoverHost {}

@Component({
  imports: [KuiPopoverComponent, KuiPopoverForDirective],
  template: `
    <button [kuiPopoverFor]="pop" id="trigger">Hover</button>
    <kui-popover #pop triggerType="hover" [hoverDelay]="50"><p>Hover</p></kui-popover>
  `,
})
class HoverPopoverHost {}

@Component({
  imports: [KuiPopoverComponent, KuiPopoverForDirective],
  template: `
    <button [kuiPopoverFor]="pop" id="trigger">Open</button>
    <kui-popover #pop [trapFocus]="true"><button type="button">Inside</button></kui-popover>
  `,
})
class TrapPopoverHost {}

@Component({
  imports: [KuiDropdownComponent, KuiDropdownForDirective, KuiOptionDirective],
  template: `
    <button id="trigger" type="button" [kuiDropdownFor]="dropdown">Open</button>
    <kui-dropdown #dropdown>
      <div kuiOption value="first">First</div>
      <div kuiOption value="second">Second</div>
    </kui-dropdown>
  `,
})
class DropdownHost {}

@Component({
  imports: [KuiMenuComponent, KuiMenuForDirective, KuiMenuItemDirective],
  template: `
    <button type="button" [kuiMenuFor]="menu" id="trigger">Actions</button>
    <kui-menu #menu ariaLabel="Actions">
      <button type="button" kuiMenuItem>Rename</button>
    </kui-menu>
  `,
})
class MenuHost {}

@Component({
  imports: [KuiTooltipDirective],
  template: '<button [kuiTooltip]="\'Save\'">Save</button>',
})
class TooltipHost {}

@Component({
  imports: [KuiSliderDirective],
  template: '<input type="range" kuiSlider />',
})
class SliderHost {}

@Component({
  imports: [KuiCarouselComponent, KuiCarouselSlideDirective],
  template: `
    <kui-carousel [autoplay]="true" [autoplayInterval]="1000">
      <div kuiCarouselSlide>1</div>
      <div kuiCarouselSlide>2</div>
    </kui-carousel>
  `,
})
class AutoplayCarouselHost {}

@Component({
  imports: [KuiDonutChartComponent],
  template: '<kui-donut-chart [slices]="slices()" />',
})
class DonutHost {
  readonly slices = signal([
    { id: 'a', label: 'A', value: 40 },
    { id: 'b', label: 'B', value: 60 },
  ]);
}

@Component({
  imports: [KuiTimePickerPanelComponent],
  template: '<kui-time-picker-panel />',
})
class TimePickerPanelHost {}

@Component({
  imports: [KuiNumberInputDirective],
  template: '<input type="number" kuiNumberInput />',
})
class NumberInputHost {}

@Component({
  imports: [KuiSegmentedComponent, KuiSegmentDirective],
  template: `
    <kui-segmented value="a">
      <button kuiSegment value="a">A</button>
      <button kuiSegment value="b">B</button>
    </kui-segmented>
  `,
})
class SegmentedHost {}

@Component({
  imports: [KuiTabsComponent, KuiTabDirective],
  template: `
    <kui-tabs value="a">
      <button kuiTab value="a">A</button>
      <button kuiTab value="b">B</button>
    </kui-tabs>
  `,
})
class TabsHost {}

@Component({
  imports: [KuiCommandPaletteComponent],
  template: '<kui-command-palette [(open)]="open" [groups]="[]" />',
})
class PaletteHost {
  readonly open = signal(false);
}

describe('resource lifecycle', () => {
  let ledger: ListenerLedger;

  beforeEach(() => {
    vi.useFakeTimers();
    ledger = new ListenerLedger();
  });

  afterEach(() => {
    ledger.dispose();
    vi.useRealTimers();
  });

  /** Runs `scenario`, destroys the fixture and expects the baseline back. */
  function expectBaseline<T>(
    component: new () => T,
    scenario: (fixture: ComponentFixture<T>) => void,
  ): void {
    const before = ledger.snapshot();
    const fixture = mount(component);
    scenario(fixture);
    tearDown(fixture);
    expect(ledger.snapshot()).toEqual(before);
    expect(vi.getTimerCount()).toBe(0);
  }

  const click = (fixture: ComponentFixture<unknown>, selector = '#trigger'): void => {
    (fixture.nativeElement.querySelector(selector) as HTMLElement).click();
    fixture.detectChanges();
  };

  it('popover: open then destroy', () => {
    expectBaseline(ClickPopoverHost, (fixture) => click(fixture));
  });

  it('popover: destroyed with a hover close pending', () => {
    expectBaseline(HoverPopoverHost, (fixture) => {
      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      trigger.dispatchEvent(new MouseEvent('mouseleave'));
      expect(vi.getTimerCount()).toBeGreaterThan(0);
    });
  });

  it('popover: a pending hover close never runs after the popover is destroyed', () => {
    const close = vi.spyOn(KuiPopoverComponent.prototype, 'close');
    const fixture = mount(HoverPopoverHost);
    const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    trigger.dispatchEvent(new MouseEvent('mouseleave'));

    fixture.destroy();
    close.mockClear();
    vi.advanceTimersByTime(1000);

    expect(close).not.toHaveBeenCalled();
    close.mockRestore();
  });

  it('popover: destroyed before the focus trap timer fires', () => {
    expectBaseline(TrapPopoverHost, (fixture) => click(fixture));
  });

  it('dropdown: open then destroy', () => {
    expectBaseline(DropdownHost, (fixture) => click(fixture));
  });

  it('dropdown trigger: destroyed before the option focus timer fires', () => {
    expectBaseline(DropdownHost, (fixture) => {
      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      fixture.detectChanges();
    });
  });

  it('dropdown: each open registers, and each close releases, the same document listeners', () => {
    const before = ledger.snapshot();
    const fixture = mount(DropdownHost);
    click(fixture);
    const whileOpen = ledger.snapshot();
    for (let cycle = 0; cycle < 3; cycle++) {
      click(fixture);
      expect(ledger.snapshot()).toEqual(before);
      // The panel finishes closing on its exit animation; jsdom plays none, so end it by hand.
      const ended = Object.assign(new Event('animationend', { bubbles: true }), {
        animationName: 'kui-dropdown-out',
      });
      document.querySelector('.kui-dropdown')?.dispatchEvent(ended);
      fixture.detectChanges();
      click(fixture);
      expect(ledger.snapshot()).toEqual(whileOpen);
    }
    tearDown(fixture);
    expect(ledger.snapshot()).toEqual(before);
  });

  it('remounting an overlay host three times leaves nothing behind', () => {
    const before = ledger.snapshot();
    for (let round = 0; round < 3; round++) {
      TestBed.resetTestingModule();
      const fixture = mount(MenuHost);
      click(fixture);
      tearDown(fixture);
    }
    expect(ledger.snapshot()).toEqual(before);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('menu: open then destroy', () => {
    expectBaseline(MenuHost, (fixture) => click(fixture));
  });

  it('tooltip: shown then destroyed', () => {
    expectBaseline(TooltipHost, (fixture) => {
      const button = fixture.nativeElement.querySelector('button') as HTMLElement;
      const event = new Event('pointerenter', { bubbles: true });
      button.dispatchEvent(event);
      fixture.detectChanges();
    });
  });

  it('slider: value tooltip shown then destroyed', () => {
    expectBaseline(SliderHost, (fixture) => {
      const input = fixture.nativeElement.querySelector('input') as HTMLElement;
      input.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      expect(document.querySelector('.kui-tooltip')).not.toBeNull();
    });
  });

  it('carousel: autoplay timer stops on destroy', () => {
    expectBaseline(AutoplayCarouselHost, () => undefined);
  });

  it('donut chart: destroyed mid re-partition animation', () => {
    expectBaseline(DonutHost, (fixture) => {
      fixture.componentInstance.slices.set([
        { id: 'a', label: 'A', value: 10 },
        { id: 'b', label: 'B', value: 90 },
      ]);
      fixture.detectChanges();
    });
  });

  it('time picker panel: destroyed before its centering timer fires', () => {
    expectBaseline(TimePickerPanelHost, () => undefined);
  });

  it('number input: destroyed while a step button is held', () => {
    expectBaseline(NumberInputHost, (fixture) => {
      const inc = fixture.nativeElement.querySelector('.kui-number-input__btn--inc') as HTMLElement;
      inc.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      vi.advanceTimersByTime(600);
      expect(vi.getTimerCount()).toBeGreaterThan(0);
    });
  });

  it('segmented and tabs: destroyed before the first-render frame fires', () => {
    expectBaseline(SegmentedHost, () => undefined);
    TestBed.resetTestingModule();
    expectBaseline(TabsHost, () => undefined);
  });

  it('command palette: open then destroy', () => {
    expectBaseline(PaletteHost, (fixture) => {
      fixture.componentInstance.open.set(true);
      fixture.detectChanges();
    });
  });

  it('toast region: auto-dismiss timers are cleared on destroy', () => {
    const fixture = TestBed.createComponent(KuiToastRegionComponent);
    fixture.componentInstance.addToast({ title: 'Saved', duration: 5000 });
    fixture.detectChanges();
    expect(vi.getTimerCount()).toBe(1);
    fixture.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('toast region: a close animation already running still completes its refs after destroy', () => {
    const fixture = TestBed.createComponent(KuiToastRegionComponent);
    const ref = fixture.componentInstance.addToast({ title: 'Saved', persistent: true });
    fixture.detectChanges();
    const closed = vi.fn();
    ref.closed$.subscribe({ complete: closed });
    ref.close();
    fixture.destroy();
    expect(() => vi.runOnlyPendingTimers()).not.toThrow();
    expect(closed).toHaveBeenCalled();
  });
});
