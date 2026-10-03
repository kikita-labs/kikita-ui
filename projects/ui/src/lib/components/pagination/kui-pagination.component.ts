import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  model,
  ViewEncapsulation,
} from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiI18n } from '../../i18n/kui-i18n.service';
import type { KuiPaginationMessages } from '../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import type { KuiSize } from '../../types';
import { kuiNextId } from '../../utils/kui-id.util';
import {
  optionalNonNegativeIntegerAttribute,
  positiveIntegerAttribute,
} from '../../utils/kui-input-transform.util';
import { KuiButtonDirective } from '../button';
import { KuiDropdownComponent, KuiOptionDirective } from '../dropdown';
import { KuiFieldComponent } from '../field';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import {
  KUI_GLYPH_CHEVRON_LEFT,
  KUI_GLYPH_CHEVRON_RIGHT,
  KUI_GLYPH_CHEVRONS_LEFT,
  KUI_GLYPH_CHEVRONS_RIGHT,
} from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';
import { KuiIconButtonDirective } from '../icon-button';
import { KuiSelectDirective } from '../select';
import type { KuiPaginationVariant } from './kui-pagination-variant.type';

/** One rendered slot in the page-number row: either a page button or a static ellipsis. */
interface KuiPaginationPageItem {
  readonly key: string;
  readonly ellipsis: false;
  readonly page: number;
  readonly label: string;
  readonly active: boolean;
  readonly shape: 'solid' | 'ghost';
  readonly appearance: 'primary' | undefined;
  readonly ariaLabel: string;
  readonly ariaCurrent: 'page' | null;
}

interface KuiPaginationEllipsisItem {
  readonly key: string;
  readonly ellipsis: true;
}

type KuiPaginationItem = KuiPaginationPageItem | KuiPaginationEllipsisItem;

/**
 * Page navigation with a page window, optional summary, and rows-per-page picker.
 * The consumer owns data slicing; currentPage and pageSize are two-way models.
 * Composes existing button, icon-button, and select primitives. The current page
 * has aria-current="page"; ellipses are noninteractive. Pagination is navigation
 * state, not a Signal Forms field. See docs/pagination.md.
 *
 * @example
 * ```html
 * <kui-pagination [totalPages]="12" [(currentPage)]="page" />
 * ```
 *
 * @example Full variant with summary and rows-per-page
 * ```html
 * <kui-pagination
 *   variant="full"
 *   [totalPages]="totalPages"
 *   [totalItems]="totalItems"
 *   [(currentPage)]="page"
 *   [(pageSize)]="pageSize"
 * />
 * ```
 */
@Component({
  selector: 'kui-pagination',
  imports: [
    KuiButtonDirective,
    KuiIconButtonDirective,
    KuiSelectDirective,
    KuiFieldComponent,
    KuiDropdownComponent,
    KuiOptionDirective,
    KuiGlyphComponent,
  ],
  template: `
    @if (showSummary()) {
      <div class="kui-pagination__summary" aria-live="polite">{{ summaryText() }}</div>
    }

    <nav class="kui-pagination__nav" [attr.aria-label]="ariaLabel() ?? t().label">
      @if (showEnds()) {
        <button
          kuiIconButton
          shape="ghost"
          [size]="effectiveSize()"
          [attr.aria-label]="t().first"
          [disabled]="firstDisabled()"
          (click)="goFirst()"
        >
          <svg width="16" height="16" [kuiGlyph]="firstGlyph()" [kuiGlyphStroke]="1.5"></svg>
        </button>
      }

      <button
        kuiIconButton
        shape="ghost"
        [size]="effectiveSize()"
        [attr.aria-label]="t().previous"
        [disabled]="prevDisabled()"
        (click)="goPrev()"
      >
        <svg width="16" height="16" [kuiGlyph]="previousGlyph()" [kuiGlyphStroke]="1.5"></svg>
      </button>

      @if (showNumbers()) {
        @for (item of pages(); track item.key) {
          @if (item.ellipsis) {
            <span
              aria-hidden="true"
              class="kui-pagination__ellipsis"
              [attr.data-kui-size]="effectiveSize()"
              >&hellip;</span
            >
          } @else {
            <button
              kuiButton
              class="kui-pagination__page"
              [shape]="item.shape"
              [appearance]="item.appearance"
              [size]="effectiveSize()"
              [attr.aria-label]="item.ariaLabel"
              [attr.aria-current]="item.ariaCurrent"
              [disabled]="disabled()"
              (click)="setPage(item.page)"
            >
              {{ item.label }}
            </button>
          }
        }
      }

      @if (showSimple()) {
        <span class="kui-pagination__simple-label">{{
          t().simplePage({ page: clampedCurrentPage(), total: totalPages() })
        }}</span>
      }

      <button
        kuiIconButton
        shape="ghost"
        [size]="effectiveSize()"
        [attr.aria-label]="t().next"
        [disabled]="nextDisabled()"
        (click)="goNext()"
      >
        <svg width="16" height="16" [kuiGlyph]="nextGlyph()" [kuiGlyphStroke]="1.5"></svg>
      </button>

      @if (showEnds()) {
        <button
          kuiIconButton
          shape="ghost"
          [size]="effectiveSize()"
          [attr.aria-label]="t().last"
          [disabled]="lastDisabled()"
          (click)="goLast()"
        >
          <svg width="16" height="16" [kuiGlyph]="lastGlyph()" [kuiGlyphStroke]="1.5"></svg>
        </button>
      }

      @if (showPageSize()) {
        <span class="kui-pagination__page-size">
          <span class="kui-pagination__page-size-label" aria-hidden="true">{{
            t().rowsPerPage
          }}</span>
          <kui-field class="kui-pagination__page-size-field" [size]="effectiveSize()" hideErrors>
            <input
              kuiSelect
              [value]="pageSize()"
              (valueChange)="onPageSizeChange($event)"
              [disabled]="disabled()"
              [attr.aria-label]="t().rowsPerPage"
            />
            <kui-dropdown>
              @for (option of effectivePageSizeOptions(); track option) {
                <div kuiOption [value]="option">{{ option }}</div>
              }
            </kui-dropdown>
          </kui-field>
        </span>
      }
    </nav>
  `,
  host: {
    class: 'kui-pagination',
    '[attr.data-kui-variant]': 'effectiveVariant()',
    '[attr.data-kui-size]': 'effectiveSize()',
  },
  encapsulation: ViewEncapsulation.None,
})
/** Page navigation for a long list/table. See the class-level example above. */
export class KuiPaginationComponent {
  protected readonly firstGlyph = injectKuiGlyph({
    role: 'first',
    slot: () => this.paginationDefaults()?.firstIcon,
    fallback: KUI_GLYPH_CHEVRONS_LEFT,
  });

  protected readonly previousGlyph = injectKuiGlyph({
    role: 'previous',
    slot: () => this.paginationDefaults()?.previousIcon,
    fallback: KUI_GLYPH_CHEVRON_LEFT,
  });

  protected readonly nextGlyph = injectKuiGlyph({
    role: 'next',
    slot: () => this.paginationDefaults()?.nextIcon,
    fallback: KUI_GLYPH_CHEVRON_RIGHT,
  });

  protected readonly lastGlyph = injectKuiGlyph({
    role: 'last',
    slot: () => this.paginationDefaults()?.lastIcon,
    fallback: KUI_GLYPH_CHEVRONS_RIGHT,
  });

  /**
   * Layout preset: `full` adds the summary and rows-per-page picker on top of `compact`;
   * `compact` is First/Prev/numbers+ellipsis/Next/Last; `simple` is only Prev/"Page X of Y"/Next,
   * for narrow layouts. Defaults to `compact`.
   */
  readonly variant = input<KuiPaginationVariant | undefined>();

  /** Control size, the same scale as `Button`/`IconButton`. Defaults to md. */
  readonly size = input<KuiSize | undefined>();

  /** Total number of pages. Required -- there is no reasonable default. */
  readonly totalPages = input.required<number, unknown>({ transform: positiveIntegerAttribute });

  /** Current page, 1-based. Two-way bindable via `[(currentPage)]`. Defaults to `1`. */
  readonly currentPage = model(1);

  /** How many page numbers to show beside the current page before an ellipsis appears. */
  readonly siblingCount = input<number | undefined, unknown>(undefined, {
    transform: optionalNonNegativeIntegerAttribute,
  });

  /** How many page numbers to always show at each edge before an ellipsis appears. */
  readonly boundaryCount = input<number | undefined, unknown>(undefined, {
    transform: optionalNonNegativeIntegerAttribute,
  });

  /** Rows shown per page. Only used by `variant="full"`. Two-way bindable. Defaults to `25`. */
  readonly pageSize = model(25);

  /** Choices offered by the rows-per-page picker. Only used by `variant="full"`. */
  readonly pageSizeOptions = input<readonly number[] | undefined>();

  /**
   * Total item count across every page, for the "Showing X-Y of Z" summary text. Only used by
   * `variant="full"`. Falls back to `totalPages * pageSize` when omitted.
   */
  readonly totalItems = input<number | undefined>();

  /** Disables every control. Defaults to `false`. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Accessible name for the `nav` landmark. Defaults to the `pagination.label` message. */
  readonly ariaLabel = input<string | undefined>();

  /** Per-instance text overrides; they win over the scoped and root messages. */
  readonly messages = input<Partial<KuiPaginationMessages> | undefined>();

  private readonly i18n = inject(KuiI18n);

  protected readonly t = injectKuiMessages('pagination', () => this.messages());

  private readonly instanceId = kuiNextId('kui-pagination');

  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize() ?? 'md');

  /** `currentPage()` clamped to `[1, totalPages()]`, defensive against an out-of-range binding. */
  protected readonly clampedCurrentPage = computed(() =>
    Math.min(Math.max(this.currentPage(), 1), Math.max(this.totalPages(), 1)),
  );

  private readonly paginationDefaults = inject(KuiDefaults).get('pagination');

  protected readonly effectiveVariant = computed(
    () => this.variant() ?? this.paginationDefaults()?.variant ?? 'compact',
  );
  private readonly effectiveSiblingCount = computed(
    () => this.siblingCount() ?? this.paginationDefaults()?.siblingCount ?? 1,
  );
  private readonly effectiveBoundaryCount = computed(
    () => this.boundaryCount() ?? this.paginationDefaults()?.boundaryCount ?? 1,
  );
  protected readonly effectivePageSizeOptions = computed(
    () => this.pageSizeOptions() ?? this.paginationDefaults()?.pageSizeOptions ?? [10, 25, 50, 100],
  );

  protected readonly showEnds = computed(() => this.effectiveVariant() !== 'simple');
  protected readonly showNumbers = computed(() => this.effectiveVariant() !== 'simple');
  protected readonly showSimple = computed(() => this.effectiveVariant() === 'simple');
  protected readonly showSummary = computed(() => this.effectiveVariant() === 'full');
  protected readonly showPageSize = computed(() => this.effectiveVariant() === 'full');

  protected readonly firstDisabled = computed(
    () => this.disabled() || this.clampedCurrentPage() <= 1,
  );
  protected readonly prevDisabled = this.firstDisabled;
  protected readonly lastDisabled = computed(
    () => this.disabled() || this.clampedCurrentPage() >= this.totalPages(),
  );
  protected readonly nextDisabled = this.lastDisabled;

  protected readonly pages = computed<readonly KuiPaginationItem[]>(() => {
    const page = this.clampedCurrentPage();
    const raw = computePageWindow(
      page,
      this.totalPages(),
      this.effectiveSiblingCount(),
      this.effectiveBoundaryCount(),
    );

    return raw.map((it, i) => {
      if (it === 'ellipsis-start' || it === 'ellipsis-end') {
        return { key: `${this.instanceId}-${it}-${i}`, ellipsis: true };
      }

      const active = it === page;
      return {
        key: `${this.instanceId}-p${it}`,
        ellipsis: false,
        page: it,
        label: this.i18n.context().formatNumber(it),
        active,
        shape: active ? 'solid' : 'ghost',
        appearance: active ? 'primary' : undefined,
        ariaLabel: this.t().page({ page: it, current: active }),
        ariaCurrent: active ? 'page' : null,
      };
    });
  });

  protected readonly summaryText = computed(() => {
    const page = this.clampedCurrentPage();
    const pageSize = this.pageSize();
    const total = this.totalItems() ?? this.totalPages() * pageSize;
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    return this.t().summary({ start, end, total });
  });

  protected setPage(page: number): void {
    const clamped = Math.min(Math.max(page, 1), this.totalPages());
    if (clamped !== this.currentPage()) this.currentPage.set(clamped);
  }

  protected goFirst(): void {
    this.setPage(1);
  }

  protected goPrev(): void {
    this.setPage(this.clampedCurrentPage() - 1);
  }

  protected goNext(): void {
    this.setPage(this.clampedCurrentPage() + 1);
  }

  protected goLast(): void {
    this.setPage(this.totalPages());
  }

  /** Rows-per-page picker changed: applies the new size and resets to page 1, matching every
   *  researched kit's own Paginator behavior (a stale page offset into a resized list is wrong,
   *  not just visually different). */
  protected onPageSizeChange(value: unknown): void {
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) return;

    this.pageSize.set(size);
    this.currentPage.set(1);
  }
}

/**
 * Builds the page window from `siblingCount` pages around the current page and
 * `boundaryCount` pages at each edge. Gaps become ellipsis slots only when they
 * conceal more than one page.
 */
function computePageWindow(
  page: number,
  count: number,
  siblingCount: number,
  boundaryCount: number,
): readonly (number | 'ellipsis-start' | 'ellipsis-end')[] {
  const range = (start: number, end: number): number[] => {
    const out: number[] = [];
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  };

  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    count - boundaryCount - 1,
  );

  const items: (number | 'ellipsis-start' | 'ellipsis-end')[] = [...startPages];

  if (siblingsStart > boundaryCount + 2) {
    items.push('ellipsis-start');
  } else if (boundaryCount + 1 < count - boundaryCount) {
    items.push(boundaryCount + 1);
  }

  items.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < count - boundaryCount - 1) {
    items.push('ellipsis-end');
  } else if (count - boundaryCount > boundaryCount) {
    items.push(count - boundaryCount);
  }

  items.push(...endPages);

  const seen = new Set<number>();
  return items.filter((it) => {
    if (it === 'ellipsis-start' || it === 'ellipsis-end') return true;
    if (seen.has(it)) return false;
    seen.add(it);
    return true;
  });
}
