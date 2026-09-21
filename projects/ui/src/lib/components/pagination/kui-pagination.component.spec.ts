import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { afterEach } from 'vitest';

import { KuiPaginationComponent } from './kui-pagination.component';

@Component({
  imports: [KuiPaginationComponent],
  template: `<kui-pagination [totalPages]="totalPages()" [(currentPage)]="page" />`,
})
class CompactHost {
  readonly totalPages = signal(12);
  readonly page = signal(5);
}

@Component({
  imports: [KuiPaginationComponent],
  template: `<kui-pagination variant="simple" [totalPages]="4" [(currentPage)]="page" />`,
})
class SimpleHost {
  readonly page = signal(2);
}

@Component({
  imports: [KuiPaginationComponent],
  template: `
    <kui-pagination
      variant="full"
      [totalPages]="12"
      [totalItems]="289"
      [(currentPage)]="page"
      [(pageSize)]="pageSize"
    />
  `,
})
class FullHost {
  readonly page = signal(1);
  readonly pageSize = signal(25);
}

@Component({
  imports: [KuiPaginationComponent],
  template: `<kui-pagination [totalPages]="12" [currentPage]="5" [disabled]="true" />`,
})
class DisabledHost {}

@Component({
  imports: [KuiPaginationComponent],
  template: `<kui-pagination totalPages="12" siblingCount="0" boundaryCount="0" />`,
})
class StaticNumberHost {}

// Helpers

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [component] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}

function getButtons(fixture: ComponentFixture<unknown>): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('button'));
}

function cleanOverlay(): void {
  TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
}

describe('KuiPaginationComponent', () => {
  afterEach(() => {
    cleanOverlay();
  });

  it('renders a nav landmark with the default accessible name', () => {
    const fixture = createFixture(CompactHost);
    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;

    expect(nav.getAttribute('aria-label')).toBe('Pagination');
  });

  it('marks the current page with aria-current and shape=solid, others ghost', () => {
    const fixture = createFixture(CompactHost);
    const current = fixture.nativeElement.querySelector(
      '[aria-current="page"]',
    ) as HTMLButtonElement;

    expect(current.textContent?.trim()).toBe('5');
    expect(current.getAttribute('data-kui-shape')).toBe('solid');
    expect(current.getAttribute('aria-label')).toBe('Page 5, current');

    const others = getButtons(fixture).filter(
      (b) => /^\d+$/.test(b.textContent?.trim() ?? '') && b !== current,
    );
    expect(others.length).toBeGreaterThan(0);
    for (const b of others) expect(b.getAttribute('data-kui-shape')).toBe('ghost');
  });

  it('renders First/Prev/Next/Last as internal chrome (inline SVG, not a name-resolved icon)', () => {
    const fixture = createFixture(CompactHost);
    const buttons = getButtons(fixture);
    const first = buttons[0];
    const last = buttons[buttons.length - 1];

    expect(first.querySelector('svg')).not.toBeNull();
    expect(last.querySelector('svg')).not.toBeNull();
    expect(first.hasAttribute('icon')).toBe(false);
  });

  it('collapses the middle of a long page range into a single ellipsis on each side', () => {
    const fixture = createFixture(CompactHost);
    const ellipses = fixture.nativeElement.querySelectorAll('.kui-pagination__ellipsis');

    expect(ellipses.length).toBe(2);
  });

  it('clicking a page number updates currentPage', () => {
    const fixture = createFixture(CompactHost);

    const target = getButtons(fixture).find((b) => b.textContent?.trim() === '6')!;
    target.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.page()).toBe(6);
  });

  it('disables First/Prev on the first page and Next/Last on the last page', () => {
    const fixture = createFixture(CompactHost);
    fixture.componentInstance.page.set(1);
    fixture.detectChanges();

    const [first, prev] = getButtons(fixture);
    expect(first.disabled).toBe(true);
    expect(prev.disabled).toBe(true);

    fixture.componentInstance.page.set(12);
    fixture.detectChanges();
    const buttons = getButtons(fixture);
    const next = buttons[buttons.length - 2];
    const last = buttons[buttons.length - 1];
    expect(next.disabled).toBe(true);
    expect(last.disabled).toBe(true);
  });

  it('First/Prev/Next/Last jump to the expected page', () => {
    const fixture = createFixture(CompactHost);
    const buttons = getButtons(fixture);
    const first = buttons[0];
    const last = buttons[buttons.length - 1];

    last.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(12);

    first.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(1);
  });

  it('simple variant shows only Prev/Page X of Y/Next, no numbers or ends', () => {
    const fixture = createFixture(SimpleHost);
    const label = fixture.nativeElement.querySelector(
      '.kui-pagination__simple-label',
    ) as HTMLElement;

    expect(label.textContent?.trim()).toBe('Page 2 of 4');
    expect(getButtons(fixture).length).toBe(2);
    expect(fixture.nativeElement.querySelector('.kui-pagination__page')).toBeNull();
  });

  it('full variant renders the summary text and rows-per-page picker', () => {
    const fixture = createFixture(FullHost);
    const summary = fixture.nativeElement.querySelector('.kui-pagination__summary') as HTMLElement;

    expect(summary.textContent?.trim()).toBe('Showing 1–25 of 289');
    expect(summary.getAttribute('aria-live')).toBe('polite');
    expect(fixture.nativeElement.querySelector('input[kuiSelect]')).not.toBeNull();
  });

  it('changing the rows-per-page value updates pageSize and resets currentPage to 1', () => {
    const fixture = createFixture(FullHost);
    fixture.componentInstance.page.set(5);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('input[kuiSelect]') as HTMLInputElement;
    select.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    select.click();
    fixture.detectChanges();

    const options = document.querySelectorAll('.kui-listbox-option');
    const option = Array.from(options).find((o) => o.textContent?.trim() === '50') as HTMLElement;
    option.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.pageSize()).toBe(50);
    expect(fixture.componentInstance.page()).toBe(1);
  });

  it('disables every control when disabled is true', () => {
    const fixture = createFixture(DisabledHost);
    const buttons = getButtons(fixture);

    for (const b of buttons) expect(b.disabled).toBe(true);
  });

  it('coerces static counts to finite integers while allowing zero display counts', () => {
    const fixture = createFixture(StaticNumberHost);
    const pagination = fixture.debugElement
      .query(By.directive(KuiPaginationComponent))
      .injector.get(KuiPaginationComponent);

    expect(pagination.totalPages()).toBe(12);
    expect(pagination.siblingCount()).toBe(0);
    expect(pagination.boundaryCount()).toBe(0);
  });
});
