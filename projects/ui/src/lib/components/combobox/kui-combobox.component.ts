import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  ViewContainerRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';

import { KUI_COMBOBOX_OPTIONS } from '../../tokens/kui-combobox-options.token';
import { KUI_FIELD_OPTIONS } from '../../tokens/kui-field-options.token';
import { KuiChipDirective } from '../chip/kui-chip.directive';
import { KuiChipRemoveDirective } from '../chip/kui-chip-remove.directive';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KuiComboboxValueContext } from './kui-combobox-value.directive';
import { KuiComboboxMode } from './kui-combobox-mode.type';
import { KuiComboboxSize } from './kui-combobox-size.type';

let nextComboboxId = 0;

function optionalBooleanAttribute(value: unknown): boolean | undefined {
  return value == null ? undefined : booleanAttribute(value);
}

function optionalNumberAttribute(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Searchable combobox for selecting one or more values from a list.
 *
 * Implements {@link FormValueControl} for Signal Forms integration via `[formField]`.
 */
@Component({
  selector: 'kui-combobox',
  imports: [NgTemplateOutlet, KuiChipDirective, KuiChipRemoveDirective],
  templateUrl: './kui-combobox.component.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'kui-combobox',
    '[class.kui-combobox--open]': 'open()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-wrap-chips]': 'effectiveWrapChips() ? "" : null',
    '(focusout)': 'handleFocusOut($event)',
  },
})
export class KuiComboboxComponent<T = unknown>
  implements FormValueControl<T | readonly T[] | string | null>, OnDestroy
{
  /** Available options. */
  readonly options = input<readonly T[]>([]);
  /** Current selected value. In multiple mode this is an array. */
  readonly value = model<T | readonly T[] | string | null>(null);
  /** Current text query. */
  readonly query = model('');
  /** Maps an option to display text. Defaults to `String(option)`. */
  readonly labelFn = input<((item: T) => string) | undefined>();
  /** Placeholder shown when the combobox is empty. */
  readonly placeholder = input('');
  /** Combobox size. Falls back to the parent `kui-field` size when omitted. */
  readonly size = input<KuiComboboxSize | undefined>();
  /** Filtering behavior. */
  readonly mode = input<KuiComboboxMode>('filter');
  /** Enables multiple selected values. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Maximum number of selected chips rendered before collapsed `+N` overflow. */
  readonly maxVisibleChips = input<number | undefined, unknown>(undefined, {
    transform: optionalNumberAttribute,
  });
  /** Text rendered when no options match. */
  readonly emptyText = input<string | undefined>();
  /** Text rendered while loading. */
  readonly loadingText = input<string | undefined>();
  /** Allows selected chips to wrap instead of collapsing into a `+N` overflow chip. */
  readonly wrapChips = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });
  /**
   * Shows a clear affordance when the combobox has a value or query.
   * Falls back to {@link KUI_FIELD_OPTIONS} when undefined.
   */
  readonly clearable = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });
  /** Shows the loading row and loader affordance. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Prevents interaction and marks the control disabled. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Prevents editing while keeping the value readable. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Whether the control has validation errors. Set by `[formField]`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Current validation errors. Set by `[formField]`. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  /** Whether the control has been touched. Set by `[formField]`. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Emitted when the dropdown closes; marks the control as touched in the form system. */
  readonly touch = output<void>();
  /** Explicit id override. If omitted inside `kui-field`, the field id is used. */
  readonly id = input<string | undefined>();

  protected readonly fallbackInputId = `kui-combobox-input-${nextComboboxId}`;
  protected readonly listId = `kui-combobox-list-${nextComboboxId++}`;
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(0);
  protected readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');
  protected readonly comboboxInput = viewChild<ElementRef<HTMLElement>>('comboboxInput');
  protected readonly listTpl = viewChild.required<TemplateRef<void>>('listTpl');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly field = inject(KuiFieldComponent, { optional: true });
  private readonly fieldOpts = inject(KUI_FIELD_OPTIONS, { optional: true });
  private readonly comboboxOpts = inject(KUI_COMBOBOX_OPTIONS, { optional: true });
  private readonly autoVisibleChipCount = signal<number | null>(null);
  private overlayRef: OverlayRef | null = null;
  private positionStrategy: FlexibleConnectedPositionStrategy | null = null;
  private openSubs: { unsubscribe: () => void }[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private cancelScheduledMeasurement: (() => void) | null = null;

  protected readonly inputId = computed(
    () => this.id() ?? this.field?.controlId ?? this.fallbackInputId,
  );

  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);

  protected readonly effectiveInvalid = computed(
    () => this.invalid() || Boolean(this.field?.invalid()),
  );

  protected readonly effectiveSize = computed<KuiComboboxSize>(() => {
    const ownSize = this.size();
    if (ownSize) return ownSize;

    const fieldSize = this.field?.effectiveSize();
    return fieldSize === 'xs' ? 'sm' : (fieldSize ?? 'md');
  });

  protected readonly effectiveClearable = computed(() => {
    const own = this.clearable();
    if (own !== undefined) return own;
    if (this.comboboxOpts?.clearable !== undefined) return this.comboboxOpts.clearable!;
    if (this.fieldOpts?.clearable !== undefined) return this.fieldOpts.clearable!;
    return true;
  });

  protected readonly selectedValues = computed(() => {
    const value = this.value();
    return Array.isArray(value) ? value : value == null ? [] : [value as T];
  });

  protected readonly effectiveMaxVisibleChips = computed(
    () => this.maxVisibleChips() ?? this.comboboxOpts?.maxVisibleChips ?? 3,
  );

  protected readonly effectiveEmptyText = computed(
    () => this.emptyText() ?? this.comboboxOpts?.emptyText ?? 'No results',
  );

  protected readonly effectiveLoadingText = computed(
    () => this.loadingText() ?? this.comboboxOpts?.loadingText ?? 'Loading...',
  );

  protected readonly effectiveWrapChips = computed(() => this.wrapChips() ?? false);

  protected readonly effectiveVisibleChipCount = computed(() => {
    if (this.effectiveWrapChips()) return this.selectedValues().length;
    return Math.min(this.effectiveMaxVisibleChips(), this.autoVisibleChipCount() ?? Infinity);
  });

  protected readonly visibleSelectedValues = computed(() =>
    this.effectiveWrapChips()
      ? this.selectedValues()
      : this.selectedValues().slice(0, Math.max(0, this.effectiveVisibleChipCount())),
  );

  protected readonly hiddenSelectedCount = computed(() =>
    Math.max(0, this.selectedValues().length - this.visibleSelectedValues().length),
  );

  protected readonly valueTemplate = computed(
    () => this.field?.comboboxValueTemplate() as TemplateRef<KuiComboboxValueContext<T>> | null,
  );

  protected readonly displayOptions = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    const options = this.options();
    if (!query || this.mode() === 'async') return options;
    return options.filter((option) => this.labelFor(option).toLocaleLowerCase().includes(query));
  });

  protected readonly activeOptionId = computed(() => {
    if (!this.open() || !this.displayOptions().length) return null;
    return `${this.listId}-option-${this.activeIndex()}`;
  });

  protected readonly showClear = computed(
    () =>
      this.effectiveClearable() &&
      !this.disabled() &&
      !this.readonly() &&
      (this.query().length > 0 || this.selectedValues().length > 0),
  );

  protected readonly inputValue = computed(() => {
    if (this.multiple()) return this.query();
    const value = this.value();
    return value == null ? this.query() : this.labelFor(value as T);
  });

  constructor() {
    effect(() => {
      this.comboboxInput();
      this.selectedValues();
      this.effectiveMaxVisibleChips();
      this.effectiveWrapChips();
      this.labelFn();
      this.scheduleChipMeasurement();
    });

    effect(() => {
      const input = this.comboboxInput()?.nativeElement;
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;

      if (!input || typeof ResizeObserver === 'undefined') return;

      this.resizeObserver = new ResizeObserver(() => {
        this.scheduleChipMeasurement();
      });
      this.resizeObserver.observe(input);
    });

    this.destroyRef.onDestroy(() => this.destroyOverlay());
  }

  protected labelFor(option: T): string {
    return this.labelFn()?.(option) ?? String(option);
  }

  protected isSelected(option: T): boolean {
    return this.selectedValues().some((value) => value === option);
  }

  protected handleInput(event: Event): void {
    if (this.disabled() || this.readonly()) return;
    const query = (event.target as HTMLInputElement).value;
    this.query.set(query);
    if (this.mode() === 'free' && !this.multiple()) {
      this.value.set(query);
    } else if (!this.multiple()) {
      this.value.set(null);
    }
    this.openPanel();
  }

  protected handleControlClick(event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;

    const target = event.target as HTMLElement;
    if (
      target.closest(
        '.kui-combobox-native, .kui-combobox-clear, .kui-combobox-chevron, .kui-chip-remove',
      )
    ) {
      return;
    }

    this.nativeInput()?.nativeElement.focus();
    this.openPanel();
  }

  protected toggleFromChevron(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled() || this.readonly()) return;

    const wasOpen = this.open();
    this.nativeInput()?.nativeElement.focus();
    if (wasOpen) {
      this.closePanel();
      return;
    }

    this.openPanel();
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.readonly()) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.openPanel();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.openPanel();
        this.moveActive(-1);
        break;
      case 'Enter':
        if (this.open()) {
          event.preventDefault();
          this.selectOption(this.displayOptions()[this.activeIndex()]);
        }
        break;
      case 'Escape':
        this.closePanel();
        break;
      case 'Backspace':
        if (this.multiple() && !this.query() && this.selectedValues().length) {
          this.removeValue(this.selectedValues()[this.selectedValues().length - 1]);
        }
        break;
    }
  }

  protected selectOption(option: T | undefined): void {
    if (option === undefined || this.disabled() || this.readonly()) return;

    if (this.multiple()) {
      const values = [...this.selectedValues()];
      const index = values.findIndex((value) => value === option);
      if (index >= 0) values.splice(index, 1);
      else values.push(option);
      this.value.set(values);
      this.query.set('');
      this.openPanel();
      return;
    }

    this.value.set(option);
    this.query.set('');
    this.closePanel();
  }

  protected removeValue(option: T): void {
    if (this.disabled()) return;
    this.value.set(this.selectedValues().filter((value) => value !== option));
  }

  protected valueContext(option: T): KuiComboboxValueContext<T> {
    return {
      $implicit: option,
      item: option,
      label: this.labelFor(option),
      remove: () => this.removeValue(option),
    };
  }

  protected clear(event?: MouseEvent): void {
    event?.stopPropagation();
    this.value.set(this.multiple() ? [] : null);
    this.query.set('');
    this.open.set(false);
    this.touch.emit();
  }

  protected openPanel(): void {
    if (this.disabled() || this.readonly()) return;

    if (!this.overlayRef) {
      this.attachOverlay();
    }

    this.activeIndex.set(
      clamp(this.activeIndex(), 0, Math.max(0, this.displayOptions().length - 1)),
    );
  }

  protected closePanel(): void {
    if (!this.open()) return;
    this.detachOverlay();
    this.touch.emit();
  }

  protected handleFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const overlayEl = this.overlayRef?.overlayElement;
    if (!next || (!this.host.nativeElement.contains(next) && !overlayEl?.contains(next))) {
      this.closePanel();
    }
  }

  private moveActive(delta: number): void {
    const max = this.displayOptions().length - 1;
    if (max < 0) return;
    this.activeIndex.set(clamp(this.activeIndex() + delta, 0, max));
  }

  private attachOverlay(): void {
    const anchor = this.comboboxInput()?.nativeElement;
    if (!anchor) return;

    const gap = 4;
    this.positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: gap },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -gap },
      ])
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy: this.positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      width: anchor.offsetWidth,
    });
    this.overlayRef.attach(new TemplatePortal(this.listTpl(), this.vcr));

    const overlayEl = this.overlayRef.overlayElement;

    const escapeSub = this.overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        this.closePanel();
      }
    });

    const outsideHandler = (event: MouseEvent) => {
      const target = event.target as Element;
      if (this.host.nativeElement.contains(target) || overlayEl.contains(target)) return;
      this.closePanel();
    };

    const scrollHandler = () => this.positionStrategy?.apply();

    document.addEventListener('mousedown', outsideHandler, { capture: true });
    document.addEventListener('scroll', scrollHandler, { capture: true, passive: true });

    this.openSubs = [
      escapeSub,
      {
        unsubscribe: () =>
          document.removeEventListener('mousedown', outsideHandler, { capture: true }),
      },
      {
        unsubscribe: () => document.removeEventListener('scroll', scrollHandler, { capture: true }),
      },
    ];

    this.open.set(true);
  }

  private detachOverlay(): void {
    this.cleanupOverlaySubs();
    this.overlayRef?.detach();
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.positionStrategy = null;
    this.open.set(false);
  }

  private cleanupOverlaySubs(): void {
    this.openSubs.forEach((sub) => sub.unsubscribe());
    this.openSubs = [];
  }

  private destroyOverlay(): void {
    this.cleanupOverlaySubs();
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.positionStrategy = null;
  }

  private scheduleChipMeasurement(): void {
    this.cancelScheduledMeasurement?.();
    this.cancelScheduledMeasurement = null;

    if (typeof requestAnimationFrame === 'function') {
      const frame = requestAnimationFrame(() => {
        this.cancelScheduledMeasurement = null;
        this.measureVisibleChips();
      });
      this.cancelScheduledMeasurement = () => cancelAnimationFrame(frame);
      return;
    }

    const timeout = setTimeout(() => {
      this.cancelScheduledMeasurement = null;
      this.measureVisibleChips();
    });
    this.cancelScheduledMeasurement = () => clearTimeout(timeout);
  }

  private measureVisibleChips(): void {
    if (!this.multiple() || this.effectiveWrapChips()) {
      this.autoVisibleChipCount.set(null);
      return;
    }

    const input = this.comboboxInput()?.nativeElement;
    if (!input) {
      this.autoVisibleChipCount.set(null);
      return;
    }

    const inputWidth = input.clientWidth;
    if (inputWidth <= 0) {
      this.autoVisibleChipCount.set(null);
      return;
    }

    const styles = getComputedStyle(input);
    const padding =
      numberFromCss(styles.paddingInlineStart) + numberFromCss(styles.paddingInlineEnd);
    const gap = numberFromCss(styles.columnGap || styles.gap);
    const suffixWidth =
      input.querySelector<HTMLElement>('.kui-combobox-suffix')?.getBoundingClientRect().width ?? 0;
    const available = inputWidth - padding - suffixWidth - gap;

    if (available <= 0) {
      this.autoVisibleChipCount.set(0);
      return;
    }

    const selected = this.selectedValues();
    const maxVisible = Math.min(selected.length, this.effectiveMaxVisibleChips());
    const overflowWidth = this.estimatedChipWidth(`+${selected.length}`);
    let used = 0;
    let visible = 0;

    for (const item of selected.slice(0, maxVisible)) {
      const chipWidth = this.estimatedChipWidth(this.labelFor(item));
      const chipGap = visible > 0 ? gap : 0;
      const remainingAfterThis = selected.length - visible - 1;
      const reserveOverflow = remainingAfterThis > 0 ? overflowWidth + gap : 0;

      if (used + chipGap + chipWidth + reserveOverflow > available) {
        break;
      }

      used += chipGap + chipWidth;
      visible += 1;
    }

    this.autoVisibleChipCount.set(visible);
  }

  private estimatedChipWidth(label: string): number {
    return clamp(label.length * 6 + 34, 38, 160);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.cancelScheduledMeasurement?.();
    this.destroyOverlay();
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function numberFromCss(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
