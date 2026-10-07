import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KuiBadge } from '../components/badge/kui-badge';
import { KuiBreadcrumbItem } from '../components/breadcrumbs/kui-breadcrumb-item';
import { KuiBreadcrumbs } from '../components/breadcrumbs/kui-breadcrumbs';
import { KuiChip } from '../components/chip/kui-chip';
import { KuiEmptyState } from '../components/empty-state/kui-empty-state';
import { KuiLoader } from '../components/loader/kui-loader';
import { KuiSegment } from '../components/segmented/kui-segment';
import { KuiSegmented } from '../components/segmented/kui-segmented';
import { KuiTable } from '../components/table/kui-table';
import { provideKikitaUi } from '../root';
import { KuiDefaults } from './kui-defaults';

@Component({
  imports: [
    KuiBadge,
    KuiBreadcrumbs,
    KuiBreadcrumbItem,
    KuiChip,
    KuiEmptyState,
    KuiLoader,
    KuiSegmented,
    KuiSegment,
    KuiTable,
  ],
  template: `
    <span id="badge" kuiBadge>New</span>
    <span id="badge-local" kuiBadge size="lg">New</span>

    <ol id="crumbs" kuiBreadcrumbs>
      <li><a kuiBreadcrumbItem href="/a">A</a></li>
    </ol>
    <ol id="crumbs-local" kuiBreadcrumbs size="lg">
      <li><a kuiBreadcrumbItem href="/a">A</a></li>
    </ol>

    <span id="chip" kuiChip>Tag</span>
    <span id="chip-local" kuiChip size="lg">Tag</span>

    <kui-empty-state id="empty" heading="Nothing" />
    <kui-empty-state id="empty-local" heading="Nothing" size="lg" />

    <span id="loader" kuiLoader label="Wait"></span>
    <span id="loader-local" kuiLoader size="lg" label="Wait"></span>

    <kui-segmented id="segmented" aria-label="View">
      <button kuiSegment value="a">A</button>
    </kui-segmented>
    <kui-segmented id="segmented-local" size="lg" aria-label="View">
      <button kuiSegment value="a">A</button>
    </kui-segmented>

    <table id="table" kuiTable [data]="[]"></table>
    <table id="table-local" kuiTable size="lg" [data]="[]"></table>
  `,
})
class StandaloneHost {}

const KEYS = [
  { key: 'badge', id: 'badge' },
  { key: 'breadcrumbs', id: 'crumbs' },
  { key: 'chip', id: 'chip' },
  { key: 'emptyState', id: 'empty' },
  { key: 'loader', id: 'loader' },
  { key: 'segmented', id: 'segmented' },
  { key: 'table', id: 'table' },
] as const;

function size(host: HTMLElement, id: string): string | null {
  return host.querySelector(`#${id}`)!.getAttribute('data-kui-size');
}

describe('KuiDefaults read by standalone components', () => {
  afterEach(() => TestBed.resetTestingModule());

  for (const { key, id } of KEYS) {
    describe(key, () => {
      it('keeps the built-in size without defaults', () => {
        TestBed.configureTestingModule({ providers: [provideKikitaUi()] });
        const fixture = TestBed.createComponent(StandaloneHost);
        fixture.detectChanges();
        const host = fixture.nativeElement as HTMLElement;

        expect(size(host, id)).toBe('md');
        expect(size(host, `${id}-local`)).toBe('lg');
      });

      it('applies the configured size and lets a local input win', () => {
        TestBed.configureTestingModule({
          providers: [provideKikitaUi({ defaults: { [key]: { size: 'sm' } } })],
        });
        const fixture = TestBed.createComponent(StandaloneHost);
        fixture.detectChanges();
        const host = fixture.nativeElement as HTMLElement;

        expect(size(host, id)).toBe('sm');
        expect(size(host, `${id}-local`)).toBe('lg');
      });

      it('beats the global size for its own key only', () => {
        TestBed.configureTestingModule({
          providers: [provideKikitaUi({ defaults: { size: 'lg', [key]: { size: 'sm' } } })],
        });
        const fixture = TestBed.createComponent(StandaloneHost);
        fixture.detectChanges();
        const host = fixture.nativeElement as HTMLElement;

        expect(size(host, id)).toBe('sm');
        for (const other of KEYS.filter((entry) => entry.key !== key)) {
          expect(size(host, other.id)).toBe('lg');
        }
      });

      it('follows a runtime change', () => {
        TestBed.configureTestingModule({ providers: [provideKikitaUi()] });
        const fixture = TestBed.createComponent(StandaloneHost);
        fixture.detectChanges();
        const host = fixture.nativeElement as HTMLElement;

        expect(size(host, id)).toBe('md');

        TestBed.inject(KuiDefaults).set(key, { size: 'sm' });
        fixture.detectChanges();

        expect(size(host, id)).toBe('sm');
        expect(size(host, `${id}-local`)).toBe('lg');
      });
    });
  }

  it('ignores a configured size the breadcrumbs and empty state do not support', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({
          defaults: {
            breadcrumbs: { size: 'xs' as never },
            emptyState: { size: 'xs' as never },
            chip: { size: 'xs' },
          },
        }),
      ],
    });
    const fixture = TestBed.createComponent(StandaloneHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(size(host, 'crumbs')).toBe('md');
    expect(size(host, 'empty')).toBe('md');
    expect(size(host, 'chip')).toBe('xs');
  });
});
