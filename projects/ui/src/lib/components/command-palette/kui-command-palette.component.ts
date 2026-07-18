import { CdkTrapFocus } from '@angular/cdk/a11y';
import type { OverlayRef } from '@angular/cdk/overlay';
import { Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import type { ElementRef, OnDestroy, TemplateRef } from '@angular/core';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';

import {
  KUI_SEARCH_CIRCLE,
  KUI_SEARCH_HANDLE_D,
  KUI_X_D,
} from '../../utils/kui-chrome-icon-paths.util';
import { KuiEmptyStateComponent, KuiEmptyStateIconDirective } from '../empty-state';
import { KuiSkeletonDirective } from '../skeleton';
import type { KuiCommandGroup, KuiCommandItem } from './kui-command-palette.types';

let nextCommandPaletteId = 0;

interface KuiCommandEntry {
  readonly group: KuiCommandGroup;
  readonly item: KuiCommandItem;
}

interface KuiCommandLabelSegment {
  readonly text: string;
  readonly match: boolean;
}

/** Searchable command palette dialog with grouped commands and keyboard navigation. */
@Component({
  selector: 'kui-command-palette',
  imports: [CdkTrapFocus, KuiEmptyStateComponent, KuiEmptyStateIconDirective, KuiSkeletonDirective],
  templateUrl: './kui-command-palette.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class KuiCommandPaletteComponent implements OnDestroy {
  protected readonly _searchCircle = KUI_SEARCH_CIRCLE;
  protected readonly _searchHandleD = KUI_SEARCH_HANDLE_D;
  protected readonly _xD = KUI_X_D;

  /** Controls whether the command palette overlay is open. */
  readonly open = model(false);
  /** Command groups rendered in the list. */
  readonly groups = input<readonly KuiCommandGroup[]>([]);
  /** Loading state. Renders skeleton rows and sets `aria-busy`. */
  readonly loading = input(false);
  /** Search input placeholder. */
  readonly placeholder = input('Type a command or search...');
  /** Accessible label for the modal command palette dialog. */
  readonly label = input('Command palette');
  /** Text shown when no commands match the query. */
  readonly emptyText = input('No commands found');
  /** Current search query. */
  readonly query = model('');
  /** Emitted when a command is selected. */
  readonly selected = output<KuiCommandItem>();

  protected readonly paletteId = `kui-command-palette-${nextCommandPaletteId++}`;
  protected readonly listId = `${this.paletteId}-list`;
  protected readonly activeIndex = signal(0);
  protected readonly paletteTpl = viewChild.required<TemplateRef<void>>('paletteTpl');
  protected readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);
  private overlayRef: OverlayRef | null = null;
  private previouslyFocused: HTMLElement | null = null;

  protected readonly filteredGroups = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    const groups = this.groups();
    if (!query) return groups;

    return groups
      .map((group) => ({
        heading: group.heading,
        items: group.items.filter((item) => this.matchesQuery(item, query)),
      }))
      .filter((group) => group.items.length > 0);
  });

  protected readonly selectableEntries = computed(() =>
    this.filteredGroups().flatMap((group) =>
      group.items
        .filter((item) => !item.disabled)
        .map((item) => ({
          group,
          item,
        })),
    ),
  );

  protected readonly activeItemId = computed(() => {
    const item = this.selectableEntries()[this.activeIndex()]?.item;
    return item ? this.optionId(item) : null;
  });

  constructor() {
    effect(() => {
      if (this.open()) this.attachOverlay();
      else this.detachOverlay(true);
    });

    effect(() => {
      this.filteredGroups();
      this.activeIndex.set(0);
    });
  }

  protected optionId(item: KuiCommandItem): string {
    return `${this.paletteId}-option-${item.id}`;
  }

  protected isActive(item: KuiCommandItem): boolean {
    return this.selectableEntries()[this.activeIndex()]?.item === item;
  }

  protected highlightedLabelSegments(label: string): readonly KuiCommandLabelSegment[] {
    const query = this.query().trim();
    return query ? splitLabelByQuery(label, query) : [{ text: label, match: false }];
  }

  protected handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.selectEntry(this.selectableEntries()[this.activeIndex()]);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  protected selectItem(item: KuiCommandItem): void {
    if (item.disabled) return;
    this.selected.emit(item);
    this.close();
  }

  protected clearQuery(): void {
    this.query.set('');
    this.inputEl()?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.detachOverlay(false);
  }

  protected close(): void {
    this.open.set(false);
  }

  private selectEntry(entry: KuiCommandEntry | undefined): void {
    if (entry) this.selectItem(entry.item);
  }

  private moveActive(delta: number): void {
    const max = this.selectableEntries().length - 1;
    if (max < 0) return;
    const next = clamp(this.activeIndex() + delta, 0, max);
    this.activeIndex.set(next);
    // The active item is a CSS class on a roving index, not real DOM focus (focus stays on
    // the search input the whole time), so there's no native focus()-triggered auto-scroll to
    // rely on here -- scroll it into view ourselves.
    const item = this.selectableEntries()[next]?.item;
    const el = item ? this.document.getElementById(this.optionId(item)) : null;
    el?.scrollIntoView?.({ block: 'nearest' });
  }

  private matchesQuery(item: KuiCommandItem, query: string): boolean {
    const haystack = [item.label, item.description, item.meta, ...(item.keywords ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase();
    return haystack.includes(query);
  }

  private attachOverlay(): void {
    if (this.overlayRef) return;

    this.previouslyFocused = this.document.activeElement as HTMLElement | null;
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().top('12vh'),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: false,
    });
    this.overlayRef.attach(new TemplatePortal(this.paletteTpl(), this.vcr));
    queueMicrotask(() => this.inputEl()?.nativeElement.focus());
  }

  private detachOverlay(restoreFocus: boolean): void {
    if (!this.overlayRef) return;
    this.overlayRef.detach();
    this.overlayRef.dispose();
    this.overlayRef = null;

    if (restoreFocus && this.previouslyFocused?.isConnected) {
      this.previouslyFocused.focus();
    }
    this.previouslyFocused = null;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function splitLabelByQuery(label: string, query: string): readonly KuiCommandLabelSegment[] {
  const normalizedLabel = label.toLocaleLowerCase();
  const normalizedQuery = query.toLocaleLowerCase();
  const segments: KuiCommandLabelSegment[] = [];
  let cursor = 0;

  while (cursor < label.length) {
    const index = normalizedLabel.indexOf(normalizedQuery, cursor);
    if (index < 0) {
      segments.push({ text: label.slice(cursor), match: false });
      break;
    }
    if (index > cursor) {
      segments.push({ text: label.slice(cursor, index), match: false });
    }
    const end = index + normalizedQuery.length;
    segments.push({ text: label.slice(index, end), match: true });
    cursor = end;
  }

  return segments.length ? segments : [{ text: label, match: false }];
}
