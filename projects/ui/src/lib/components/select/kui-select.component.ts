import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

import { KuiSize } from '../../types';

export interface KuiOption<T = unknown> {
  readonly value: T;
  readonly label: string;
  readonly disabled?: boolean;
  readonly children?: ReadonlyArray<Omit<KuiOption<T>, 'children'>>;
}

type FlatOption<T> = Omit<KuiOption<T>, 'children'>;

interface OptionGroup<T> {
  readonly label: string | null;
  readonly options: ReadonlyArray<FlatOption<T>>;
}

@Directive({ selector: '[kuiSelectGroup]' })
export class KuiSelectGroupTpl {
  readonly tpl = inject(TemplateRef);
}

@Directive({ selector: '[kuiSelectItem]' })
export class KuiSelectItemTpl {
  readonly tpl = inject(TemplateRef);
}

@Component({
  selector: 'kui-select',
  imports: [NgTemplateOutlet],
  template: `
    <button
      class="kui-select-trigger"
      type="button"
      [attr.data-kui-size]="size() !== 'md' ? size() : null"
      [class.is-open]="isOpen()"
      [class.is-invalid]="invalid()"
      [class.is-disabled]="disabled()"
      [disabled]="disabled()"
      [attr.aria-expanded]="isOpen()"
      aria-haspopup="listbox"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      <span class="kui-select-value" [class.kui-select-value--placeholder]="!selectedLabel()">
        {{ selectedLabel() ?? placeholder() }}
      </span>
      <svg class="kui-select-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    @if (isOpen()) {
      <div
        #dropdownEl
        class="kui-select-dropdown"
        role="listbox"
        [style.position]="'fixed'"
        [style.top.px]="dropdownPos()?.top"
        [style.left.px]="dropdownPos()?.left"
        [style.min-width.px]="dropdownPos()?.minWidth"
        (keydown)="onDropdownKeydown($event)"
      >
        @for (group of groupedOptions(); track group.label; let first = $first) {
          @if (group.label !== null) {
            @if (!first) {
              <div class="kui-select-separator" role="separator"></div>
            }
            <div class="kui-select-group-label">
              @if (groupTpl(); as slot) {
                <ng-container
                  [ngTemplateOutlet]="slot.tpl"
                  [ngTemplateOutletContext]="{ $implicit: group }"
                />
              } @else {
                {{ group.label }}
              }
            </div>
          }
          @for (opt of group.options; track opt.value) {
            <div
              class="kui-select-option"
              [class.kui-select-option--selected]="opt.value === value()"
              [class.kui-select-option--disabled]="opt.disabled"
              [class.is-active]="navigableIndex(opt) === activeIndex()"
              role="option"
              [attr.aria-selected]="opt.value === value()"
              [attr.aria-disabled]="opt.disabled || null"
              [attr.tabindex]="opt.disabled ? null : '-1'"
              [attr.data-opt-idx]="opt.disabled ? null : navigableIndex(opt)"
              (click)="selectOption(opt)"
              (mouseenter)="onOptionHover(opt)"
            >
              @if (itemTpl(); as slot) {
                <ng-container
                  [ngTemplateOutlet]="slot.tpl"
                  [ngTemplateOutletContext]="{ $implicit: opt }"
                />
              } @else {
                {{ opt.label }}
              }
              <svg class="kui-select-check" viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
                <path d="M2.5 7l3 3 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          }
        }
      </div>
    }
  `,
  host: { class: 'kui-select' },
  encapsulation: ViewEncapsulation.None,
})
export class KuiSelectComponent<T = unknown> {
  readonly value = model<T | undefined>(undefined);
  readonly options = input<readonly KuiOption<T>[]>([]);
  readonly placeholder = input('Select…');
  readonly size = input<KuiSize>('md');
  readonly disabled = input(false);
  readonly invalid = input(false);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dropdownRef = viewChild<ElementRef<HTMLElement>>('dropdownEl');
  protected readonly groupTpl = contentChild(KuiSelectGroupTpl);
  protected readonly itemTpl = contentChild(KuiSelectItemTpl);

  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly dropdownPos = signal<{ top: number; left: number; minWidth: number } | null>(null);

  protected readonly groupedOptions = computed<OptionGroup<T>[]>(() => {
    const result: OptionGroup<T>[] = [];
    let defaultBucket: FlatOption<T>[] = [];

    for (const item of this.options()) {
      if (item.children) {
        if (defaultBucket.length) {
          result.push({ label: null, options: defaultBucket });
          defaultBucket = [];
        }
        result.push({ label: item.label, options: item.children });
      } else {
        defaultBucket.push(item as FlatOption<T>);
      }
    }

    if (defaultBucket.length) {
      result.push({ label: null, options: defaultBucket });
    }

    return result;
  });

  protected readonly navigableOptions = computed(() =>
    this.groupedOptions()
      .flatMap((g) => g.options)
      .filter((o) => !o.disabled),
  );

  protected readonly selectedLabel = computed(() => {
    const v = this.value();
    for (const item of this.options()) {
      if (item.children) {
        const found = item.children.find((o) => o.value === v);
        if (found) return found.label;
      } else if (item.value === v) {
        return item.label;
      }
    }
    return null;
  });

  protected navigableIndex(opt: FlatOption<T>): number {
    return this.navigableOptions().indexOf(opt);
  }

  private scrollCleanup: (() => void) | null = null;
  private trigger: HTMLElement | null = null;

  private updatePosition(): void {
    const rect = this.trigger?.getBoundingClientRect();
    if (rect) {
      this.dropdownPos.set({ top: rect.bottom + 4, left: rect.left, minWidth: rect.width });
    }
  }

  protected open(): void {
    this.trigger = this.host.nativeElement.querySelector('.kui-select-trigger') as HTMLElement | null;
    this.updatePosition();
    this.activeIndex.set(-1);
    this.isOpen.set(true);

    const onScroll = () => this.updatePosition();
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    this.scrollCleanup = () => document.removeEventListener('scroll', onScroll, { capture: true });
    this.destroyRef.onDestroy(() => this.scrollCleanup?.());
  }

  protected close(): void {
    this.scrollCleanup?.();
    this.scrollCleanup = null;
    this.isOpen.set(false);
    this.trigger?.focus();
  }

  protected toggle(): void {
    if (this.disabled()) return;
    this.isOpen() ? this.close() : this.open();
  }

  protected selectOption(opt: FlatOption<T>): void {
    if (opt.disabled) return;
    this.value.set(opt.value);
    this.close();
  }

  protected onOptionHover(opt: FlatOption<T>): void {
    if (!opt.disabled) this.activeIndex.set(this.navigableIndex(opt));
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        } else {
          this.moveFocus(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) this.moveFocus(-1);
        break;
      case 'Escape':
        event.preventDefault();
        if (this.isOpen()) this.close();
        break;
    }
  }

  protected onDropdownKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocus(-1);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const opt = this.navigableOptions()[this.activeIndex()];
        if (opt) this.selectOption(opt);
        break;
      }
      case 'Escape':
      case 'Tab':
        event.preventDefault();
        this.close();
        break;
    }
  }

  private moveFocus(delta: number): void {
    const nav = this.navigableOptions();
    if (!nav.length) return;
    const next = Math.max(0, Math.min(nav.length - 1, this.activeIndex() + delta));
    this.activeIndex.set(next);
    this.dropdownRef()?.nativeElement
      .querySelector<HTMLElement>(`[data-opt-idx="${next}"]`)
      ?.focus();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
