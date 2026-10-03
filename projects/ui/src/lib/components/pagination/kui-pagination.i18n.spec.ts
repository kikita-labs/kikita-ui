import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import { KuiI18n } from '../../i18n/kui-i18n.service';
import { provideKikitaUi } from '../../providers/provide-kikita-ui';
import { KuiPaginationComponent } from './kui-pagination.component';

@Component({
  imports: [KuiPaginationComponent],
  template: `
    <kui-pagination
      variant="full"
      [totalPages]="200"
      [totalItems]="1999"
      [pageSize]="10"
      [(currentPage)]="page"
      [ariaLabel]="label()"
      [messages]="messages()"
    />
  `,
})
class Host {
  readonly page = signal(2);
  readonly label = signal<string | undefined>(undefined);
  readonly messages = signal<{ rowsPerPage?: string } | undefined>(undefined);
}

function setup(options: Parameters<typeof provideKikitaUi>[0] = {}) {
  TestBed.configureTestingModule({ providers: [provideKikitaUi(options)] });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();

  return { fixture, root: fixture.nativeElement as HTMLElement };
}

describe('KuiPaginationComponent messages and locale', () => {
  it('names the controls and the summary in English by default', () => {
    const { root } = setup({ locale: 'en-US' });

    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Pagination');
    expect(root.querySelector('[aria-label="First page"]')).not.toBeNull();
    expect(root.querySelector('[aria-label="Page 2, current"]')).not.toBeNull();
    expect(root.querySelector('.kui-pagination__summary')?.textContent).toBe(
      'Showing 11–20 of 1,999',
    );
  });

  it('formats the counts with the locale', () => {
    const { root } = setup({ locale: 'de-DE' });

    expect(root.querySelector('.kui-pagination__summary')?.textContent).toBe(
      'Showing 11–20 of 1.999',
    );
  });

  it('applies message overrides at the root and lets explicit inputs win', () => {
    const { fixture, root } = setup({
      messages: {
        pagination: {
          label: 'Pages',
          rowsPerPage: 'Per page',
          summary: ({ start, end, total }) => `${start}-${end}/${total}`,
        },
      },
    });

    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Pages');
    expect(root.querySelector('.kui-pagination__summary')?.textContent).toBe('11-20/1999');

    fixture.componentInstance.label.set('Results');
    fixture.componentInstance.messages.set({ rowsPerPage: 'Rows' });
    fixture.detectChanges();

    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Results');
    expect(root.querySelector('.kui-pagination__page-size-label')?.textContent).toBe('Rows');
  });

  it('re-renders when the language changes at runtime', () => {
    const { fixture, root } = setup();

    TestBed.inject(KuiI18n).setMessages({ pagination: { next: 'Forward' } });
    fixture.detectChanges();

    expect(root.querySelector('[aria-label="Forward"]')).not.toBeNull();
    expect(root.querySelector('[aria-label="Next page"]')).toBeNull();
  });
});
