import {
  AfterViewInit,
  booleanAttribute,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  Renderer2,
  signal,
} from '@angular/core';

import { KUI_TABLE_CTX } from './kui-table.directive';

@Directive({
  selector: 'th[kuiTh]',
  host: {
    class: 'kui-th',
    '[class.kui-th--sticky]': 'sticky()',
    '[class.kui-th--sortable]': '!!sortKey()',
    '[class.kui-th--sort-asc]': 'sortDir() === "asc"',
    '[class.kui-th--sort-desc]': 'sortDir() === "desc"',
    '[attr.aria-sort]': 'ariaSort()',
  },
})
export class KuiThDirective implements AfterViewInit, OnDestroy {
  private readonly table = inject(KUI_TABLE_CTX, { optional: true });
  private readonly el = inject<ElementRef<HTMLTableCellElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  readonly sortKey = input<string | undefined>(undefined);
  readonly comparator = input<((a: unknown, b: unknown) => number) | undefined>(undefined);
  readonly sticky = input(false, { transform: booleanAttribute });

  protected readonly sortDir = computed(() => {
    const state = this.table?.sortState();
    if (!state || state.key !== this.sortKey()) return null;
    return state.direction;
  });

  protected readonly ariaSort = computed(() => {
    const dir = this.sortDir();

    if (dir === 'asc') return 'ascending';
    if (dir === 'desc') return 'descending';

    return this.sortKey() ? 'none' : null;
  });

  private readonly sortButtonLabel = computed(() => {
    const dir = this.sortDir();
    const label = this.sortColumnLabel();
    if (dir === 'asc') return `Sort ${label} descending`;
    if (dir === 'desc') return `Clear ${label} sort`;
    return `Sort ${label} ascending`;
  });

  private readonly sortColumnLabel = signal('column');
  private sortButton: HTMLButtonElement | null = null;
  private removeSortListener: (() => void) | null = null;

  constructor() {
    effect(() => {
      const label = this.sortButtonLabel();
      if (this.sortButton) {
        this.renderer.setAttribute(this.sortButton, 'aria-label', label);
      }
    });
  }

  private ensureSortButton(): void {
    if (this.sortButton) return;

    const host = this.el.nativeElement;
    // A hydrated client instance re-runs ngAfterViewInit on the same DOM node a server-side
    // instance already wrapped; reuse that button instead of nesting a second one inside it.
    const existingButton = Array.from(host.children).find(
      (child): child is HTMLButtonElement =>
        child instanceof HTMLButtonElement && child.classList.contains('kui-th__sort-button'),
    );

    if (existingButton) {
      this.sortColumnLabel.set(existingButton.textContent?.trim() || this.sortKey() || 'column');
      this.removeSortListener = this.renderer.listen(existingButton, 'click', () => this.onSort());
      this.sortButton = existingButton;
      return;
    }

    const button = this.renderer.createElement('button') as HTMLButtonElement;
    this.renderer.setAttribute(button, 'type', 'button');
    this.renderer.addClass(button, 'kui-th__sort-button');

    Array.from(host.childNodes).forEach((node) => this.renderer.appendChild(button, node));
    this.sortColumnLabel.set(button.textContent?.trim() || this.sortKey() || 'column');
    this.renderer.appendChild(host, button);
    this.removeSortListener = this.renderer.listen(button, 'click', () => this.onSort());
    this.sortButton = button;
  }

  ngAfterViewInit(): void {
    if (!this.sortKey()) return;
    this.ensureSortButton();
    if (this.sortButton) {
      this.renderer.setAttribute(this.sortButton, 'aria-label', this.sortButtonLabel());
    }
  }

  private onSort(): void {
    const key = this.sortKey();
    if (!key || !this.table) return;

    const comp = this.comparator();
    if (comp) this.table.registerComparator(key, comp as never);
    this.table.updateSort(key);
  }

  ngOnDestroy(): void {
    this.removeSortListener?.();
  }
}
