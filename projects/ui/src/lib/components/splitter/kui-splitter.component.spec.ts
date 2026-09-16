import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { vi } from 'vitest';

import { KuiSplitterComponent } from './kui-splitter.component';
import { KuiSplitterPaneComponent } from './kui-splitter-pane.component';

@Component({
  imports: [KuiSplitterComponent, KuiSplitterPaneComponent],
  template: `
    <kui-splitter
      [orientation]="orientation()"
      [disabled]="disabled()"
      (sizesChange)="onResize($event)"
    >
      <kui-splitter-pane [minSize]="minSizeA()" [collapsible]="collapsibleA()">A</kui-splitter-pane>
      <kui-splitter-pane [minSize]="minSizeB()">B</kui-splitter-pane>
    </kui-splitter>
  `,
})
class TwoPaneHost {
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly disabled = signal(false);
  readonly minSizeA = signal(10);
  readonly minSizeB = signal(10);
  readonly collapsibleA = signal(false);
  onResize(sizes: readonly number[]): void {
    this.lastResizeSizes = [...sizes];
  }
  lastResizeSizes: number[] | null = null;
}

@Component({
  imports: [KuiSplitterComponent, KuiSplitterPaneComponent],
  template: `
    <kui-splitter>
      <kui-splitter-pane [size]="20">A</kui-splitter-pane>
      <kui-splitter-pane>B</kui-splitter-pane>
      <kui-splitter-pane>C</kui-splitter-pane>
    </kui-splitter>
  `,
})
class ThreePaneHost {}

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [component] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}

function getGutters(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[role="separator"]'));
}

describe('KuiSplitterComponent', () => {
  it('renders one gutter per pair of adjacent panes', () => {
    const fixture = createFixture(ThreePaneHost);
    expect(getGutters(fixture).length).toBe(2);
  });

  it('inserts each gutter between its two adjacent panes in DOM order', () => {
    const fixture = createFixture(ThreePaneHost);
    const children = Array.from<Element>(
      fixture.nativeElement.querySelector('kui-splitter').children,
    );
    const tags = children.map((el) => el.tagName.toLowerCase());
    expect(tags).toEqual([
      'kui-splitter-pane',
      'kui-splitter-gutter',
      'kui-splitter-pane',
      'kui-splitter-gutter',
      'kui-splitter-pane',
    ]);
  });

  it('gives an explicit-size pane its size and splits the rest evenly among the others', () => {
    const fixture = createFixture(ThreePaneHost);
    const panes = fixture.nativeElement.querySelectorAll('kui-splitter-pane');

    expect(panes[0].style.flexBasis).toContain('* 0.2)');
    expect(panes[1].style.flexBasis).toContain('* 0.4)');
    expect(panes[2].style.flexBasis).toContain('* 0.4)');
  });

  it('sets aria-orientation perpendicular to the splitter orientation', () => {
    const fixture = createFixture(TwoPaneHost);
    const host = fixture.componentInstance;

    expect(getGutters(fixture)[0].getAttribute('aria-orientation')).toBe('vertical');

    host.orientation.set('vertical');
    fixture.detectChanges();
    expect(getGutters(fixture)[0].getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('resizes the adjacent pair with ArrowRight/ArrowLeft, clamped by minSize', () => {
    const fixture = createFixture(TwoPaneHost);
    const host = fixture.componentInstance;
    const gutter = getGutters(fixture)[0];

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(host.lastResizeSizes).toEqual([52, 48]);

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(host.lastResizeSizes).toEqual([50, 50]);
  });

  it('uses the large step with Shift', () => {
    const fixture = createFixture(TwoPaneHost);
    const host = fixture.componentInstance;
    const gutter = getGutters(fixture)[0];

    gutter.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true }),
    );
    fixture.detectChanges();
    expect(host.lastResizeSizes).toEqual([60, 40]);
  });

  it('does not shrink a pane below its minSize', () => {
    const fixture = createFixture(TwoPaneHost);
    const host = fixture.componentInstance;
    host.minSizeA.set(45);
    fixture.detectChanges();
    const gutter = getGutters(fixture)[0];

    for (let i = 0; i < 10; i++) {
      gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    }
    fixture.detectChanges();

    expect(host.lastResizeSizes?.[0]).toBe(45);
  });

  it('Home/End collapse the before pane to its minSize and expand it to the max', () => {
    const fixture = createFixture(TwoPaneHost);
    const host = fixture.componentInstance;
    const gutter = getGutters(fixture)[0];

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(host.lastResizeSizes).toEqual([10, 90]);

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(host.lastResizeSizes).toEqual([90, 10]);
  });

  it('Enter toggles collapse only for a collapsible edge pane', () => {
    const fixture = createFixture(TwoPaneHost);
    const host = fixture.componentInstance;
    host.collapsibleA.set(true);
    fixture.detectChanges();
    const gutter = getGutters(fixture)[0];

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(host.lastResizeSizes).toEqual([10, 90]);

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(host.lastResizeSizes).toEqual([50, 50]);
  });

  it('renders a collapse button only on the edge gutter of a collapsible pane', () => {
    const fixture = createFixture(TwoPaneHost);
    const host = fixture.componentInstance;
    host.collapsibleA.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.kui-splitter-gutter__thumb-btn')).toBeTruthy();

    host.collapsibleA.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kui-splitter-gutter__thumb-btn')).toBeFalsy();
  });

  it('removes gutters from tab order and ignores keyboard resize when disabled', () => {
    const fixture = createFixture(TwoPaneHost);
    const host = fixture.componentInstance;
    host.disabled.set(true);
    fixture.detectChanges();
    const gutter = getGutters(fixture)[0];

    expect(gutter.getAttribute('tabindex')).toBe('-1');
    expect(gutter.getAttribute('aria-disabled')).toBe('true');

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(host.lastResizeSizes).toBeNull();
  });

  it('drags the gutter and resizes proportionally to pointer movement', () => {
    const fixture = createFixture(TwoPaneHost);
    const host = fixture.componentInstance;
    const splitterHost = fixture.nativeElement.querySelector('kui-splitter') as HTMLElement;
    Object.defineProperty(splitterHost, 'clientWidth', { value: 1000, configurable: true });
    const gutter = getGutters(fixture)[0];
    gutter.setPointerCapture = vi.fn();

    gutter.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 500, pointerId: 1, bubbles: true }),
    );
    gutter.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 600, pointerId: 1, bubbles: true }),
    );
    fixture.detectChanges();

    // 100px moved over ~992px available (1000 - 1*8 default gutter fallback) => +~10.08%
    expect(host.lastResizeSizes?.[0]).toBeCloseTo(60.08, 0);

    gutter.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }));
  });

  it('Escape cancels an active drag and reverts to the pre-drag sizes', () => {
    const fixture = createFixture(TwoPaneHost);
    const host = fixture.componentInstance;
    const splitterHost = fixture.nativeElement.querySelector('kui-splitter') as HTMLElement;
    Object.defineProperty(splitterHost, 'clientWidth', { value: 1000, configurable: true });
    const gutter = getGutters(fixture)[0];
    gutter.setPointerCapture = vi.fn();

    gutter.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 500, pointerId: 1, bubbles: true }),
    );
    gutter.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 600, pointerId: 1, bubbles: true }),
    );
    fixture.detectChanges();
    expect(host.lastResizeSizes?.[0]).not.toBe(50);

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('kui-splitter-pane')[0].style.flexBasis,
    ).toContain('* 0.5)');
  });
});
