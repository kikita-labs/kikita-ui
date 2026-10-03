import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import type { EffectRef, ElementRef, OnDestroy, Signal } from '@angular/core';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  Injector,
  isSignal,
  PLATFORM_ID,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { Subject } from 'rxjs';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import {
  KUI_GLYPH_CIRCLE_CHECK,
  KUI_GLYPH_CIRCLE_X,
  KUI_GLYPH_INFO,
  KUI_GLYPH_TRIANGLE_ALERT,
  KUI_GLYPH_X,
} from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';
import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
import type {
  KuiToastAppearance,
  KuiToastConfig,
  KuiToastPosition,
  KuiToastRef,
} from './kui-toast.types';

interface InternalToastItem {
  readonly id: number;
  config: KuiToastConfig;
  readonly closing: ReturnType<typeof signal<boolean>>;
  readonly paused: ReturnType<typeof signal<boolean>>;
  readonly closedSubject: Subject<void>;
  readonly actionSubject: Subject<void>;
  /** Duration used when a config has no finite duration of its own. */
  readonly defaultDuration: number;
}

const DEFAULT_DURATION = 5000;

type PersistentConfig = boolean | Signal<boolean> | undefined;

function readPersistent(value: PersistentConfig): boolean {
  return isSignal(value) ? value() : value === true;
}

/**
 * @internal
 * Fixed region that renders the toast stack.
 * Created lazily by {@link KuiToastService} and appended to `document.body`.
 * While toasts are visible the region is a manual popover, so it sits in the browser top layer
 * and is raised above any dialog, drawer or other overlay that is open when a toast is added.
 * Not part of the public API.
 */
@Component({
  selector: 'kui-toast-region',
  imports: [KuiGlyphComponent],
  template: `
    <div
      #region
      class="kui-toast-region"
      popover="manual"
      [attr.data-position]="_position()"
      role="region"
      [attr.aria-label]="t().region"
      aria-live="polite"
    >
      @for (toast of _toasts(); track toast.id) {
        <div
          class="kui-toast"
          [attr.data-kui-appearance]="toast.config.appearance ?? 'neutral'"
          [attr.role]="toast.config.appearance === 'danger' ? 'alert' : 'status'"
          [attr.aria-live]="toast.config.appearance === 'danger' ? 'assertive' : 'polite'"
          aria-atomic="true"
          [style.animation]="toast.closing() ? _outAnim() : _inAnim()"
          (mouseenter)="pauseTimer(toast.id)"
          (mouseleave)="resumeTimer(toast.id)"
        >
          @if (toast.config.showIcon !== false && hasIcon(toast.config.appearance)) {
            <span class="kui-toast-icon">
              <svg
                width="18"
                height="18"
                [kuiGlyph]="statusGlyph(toast.config.appearance)"
                [kuiGlyphStroke]="1.5"
              ></svg>
            </span>
          }

          <div class="kui-toast-body">
            <div class="kui-toast-title">{{ toast.config.title }}</div>
            @if (toast.config.message) {
              <div class="kui-toast-message">{{ toast.config.message }}</div>
            }
            @if (toast.config.actionLabel) {
              <button
                class="kui-button"
                data-kui-shape="ghost"
                data-kui-size="xs"
                type="button"
                style="align-self:flex-start;margin-top:var(--kui-space-1);--kui-btn-ghost-fg:var(--kui-toast-accent-color, var(--_kui-toast-accent-color))"
                (click)="onAction(toast)"
              >
                {{ toast.config.actionLabel }}
              </button>
            }
          </div>

          @if (toast.config.closable !== false) {
            <button
              class="kui-toast-close"
              type="button"
              [attr.aria-label]="common().close"
              (click)="dismiss(toast.id)"
            >
              <svg width="16" height="16" [kuiGlyph]="closeGlyph()" [kuiGlyphStroke]="1.5"></svg>
            </button>
          }

          @if (toast.config.showProgress && !isPersistent(toast)) {
            <div
              class="kui-toast-progress"
              [style.animation-play-state]="toast.paused() ? 'paused' : 'running'"
              [style.animation]="'kui-toast-prog ' + getDuration(toast) + 'ms linear both'"
            ></div>
          }
        </div>
      }
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
})
/** Hosts and announces active Kikita UI toast notifications. */
export class KuiToastRegionComponent implements OnDestroy {
  private readonly injector = inject(Injector);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly regionEl = viewChild<ElementRef<HTMLElement>>('region');
  private readonly toastDefaults = inject(KuiDefaults).get('toast');
  protected readonly t = injectKuiMessages('toast');
  protected readonly common = injectKuiMessages('common');

  private readonly infoGlyph = injectKuiGlyph({ role: 'statusInfo', fallback: KUI_GLYPH_INFO });
  private readonly successGlyph = injectKuiGlyph({
    role: 'statusSuccess',
    fallback: KUI_GLYPH_CIRCLE_CHECK,
  });
  private readonly warningGlyph = injectKuiGlyph({
    role: 'statusWarning',
    fallback: KUI_GLYPH_TRIANGLE_ALERT,
  });
  private readonly dangerGlyph = injectKuiGlyph({
    role: 'statusDanger',
    fallback: KUI_GLYPH_CIRCLE_X,
  });

  protected readonly closeGlyph = injectKuiGlyph({
    role: 'close',
    slot: () => this.toastDefaults()?.closeIcon,
    fallback: KUI_GLYPH_X,
  });

  /** @internal Set by the service after creation. */
  readonly _position = signal<KuiToastPosition>('bottom-center');
  /** @internal Set by the service after creation. */
  readonly _maxVisible = signal<number>(3);

  readonly _toasts = signal<InternalToastItem[]>([]);

  protected readonly _isTop = computed(() => this._position().startsWith('top'));
  protected readonly _inAnim = computed(() =>
    this._isTop() ? 'kui-toast-in-t 220ms ease-out both' : 'kui-toast-in-b 220ms ease-out both',
  );
  protected readonly _outAnim = computed(() =>
    this._isTop() ? 'kui-toast-out-t 160ms ease-in both' : 'kui-toast-out-b 160ms ease-in both',
  );

  private topLayerListener: ((event: Event) => void) | null = null;
  private nextId = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly remaining = new Map<number, number>();
  private readonly startedAt = new Map<number, number>();
  private readonly persistentEffects = new Map<number, EffectRef>();
  private readonly closeTimers = new Map<number, ReturnType<typeof setTimeout>>();

  /** Add a toast to the region and return a handle. Called by the service. */
  addToast(config: KuiToastConfig, defaultDuration = DEFAULT_DURATION): KuiToastRef {
    const id = this.nextId++;
    const closedSubject = new Subject<void>();
    const actionSubject = new Subject<void>();
    const closingSignal = signal(false);
    const pausedSignal = signal(false);

    // Evict oldest visible toast if at capacity
    const visible = this._toasts().filter((t) => !t.closing());
    if (visible.length >= this._maxVisible()) {
      this.dismiss(visible[0].id);
    }

    this._toasts.update((list) => [
      ...list,
      {
        id,
        config,
        closing: closingSignal,
        paused: pausedSignal,
        closedSubject,
        actionSubject,
        defaultDuration,
      },
    ]);

    if (!this.isPersistentConfig(config)) {
      const duration = this.getDuration({ config, defaultDuration });
      this.remaining.set(id, duration);
      this.startTimerFor(id, duration);
    }

    this.trackPersistentSignal(id, config.persistent);
    this.raiseToTopLayer();

    return {
      id,
      close: () => this.dismiss(id),
      update: (nextConfig) => this.update(id, nextConfig),
      closed$: closedSubject.asObservable(),
      action$: actionSubject.asObservable(),
    };
  }

  update(id: number, config: Partial<KuiToastConfig>): void {
    const toast = this._toasts().find((item) => item.id === id);
    if (!toast || toast.closing()) return;

    const persistentChanged = Object.hasOwn(config, 'persistent');
    const durationChanged = Object.hasOwn(config, 'duration');
    toast.config = { ...toast.config, ...config };

    if (persistentChanged) {
      this.destroyPersistentSignal(id);
      this.trackPersistentSignal(id, toast.config.persistent);
    }

    if (this.isPersistentConfig(toast.config)) {
      this.clearTimer(id);
      this.startedAt.delete(id);
      this.remaining.delete(id);
    } else if (persistentChanged || durationChanged) {
      const duration = this.getDuration(toast);
      this.remaining.set(id, duration);
      if (!toast.paused()) this.startTimerFor(id, duration);
    }

    this._toasts.update((list) => [...list]);
  }

  dismiss(id: number): void {
    const toast = this._toasts().find((t) => t.id === id);
    if (!toast || toast.closing()) return;
    this.destroyPersistentSignal(id);
    this.clearTimer(id);
    this.remaining.delete(id);
    this.startedAt.delete(id);
    toast.paused.set(false);
    toast.closing.set(true);
    this.closeTimers.set(
      id,
      setTimeout(() => {
        this.closeTimers.delete(id);
        this._toasts.update((list) => list.filter((t) => t.id !== id));
        if (this._toasts().length === 0) this.leaveTopLayer();
        this.completeSubjects(toast, true);
      }, 200),
    );
  }

  dismissAll(): void {
    for (const toast of this._toasts()) {
      this.dismiss(toast.id);
    }
  }

  protected pauseTimer(id: number): void {
    const toast = this._toasts().find((item) => item.id === id);
    if (!toast) return;
    toast.paused.set(true);
    this.freezeTimer(id, toast);
  }

  protected resumeTimer(id: number): void {
    const toast = this._toasts().find((item) => item.id === id);
    if (!toast) return;
    toast.paused.set(false);
    if (toast.closing() || this.isPersistentConfig(toast.config)) return;
    const rem = this.remaining.get(id);
    if (rem == null) return;
    this.startTimerFor(id, rem);
  }

  protected onAction(toast: InternalToastItem): void {
    toast.actionSubject.next();
  }

  protected statusGlyph(appearance: KuiToastAppearance | undefined): KuiIconGlyph {
    switch (appearance) {
      case 'success':
        return this.successGlyph();
      case 'warning':
        return this.warningGlyph();
      case 'danger':
        return this.dangerGlyph();
      default:
        return this.infoGlyph();
    }
  }

  protected hasIcon(appearance: KuiToastAppearance | undefined): boolean {
    return (
      appearance === 'success' ||
      appearance === 'warning' ||
      appearance === 'danger' ||
      appearance === 'info'
    );
  }

  protected isPersistent(toast: InternalToastItem): boolean {
    return this.isPersistentConfig(toast.config);
  }

  /**
   * Overlays opened by the library (dialog, drawer, menu, tooltip) live in the top layer, where
   * `z-index` has no effect and the last element shown is on top. Show the region as a popover
   * after any other top-layer element so toasts are never hidden behind an overlay, whether the
   * overlay was open when the toast was added or opened while the toast was visible. Without
   * another open top-layer element nothing can cover the region, so the existing toasts keep their
   * enter animation.
   */
  private raiseToTopLayer(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(
      () => {
        this.stackOnTop();
        if (this.topLayerListener) return;
        this.topLayerListener = (event: Event) => {
          const toggle = event as ToggleEvent;
          if (toggle.newState === 'open' && event.target !== this.regionEl()?.nativeElement) {
            queueMicrotask(() => this.stackOnTop());
          }
        };
        this.document.addEventListener('toggle', this.topLayerListener, true);
      },
      { injector: this.injector },
    );
  }

  private stackOnTop(): void {
    const region = this.regionEl()?.nativeElement;
    if (!region || typeof region.showPopover !== 'function' || this._toasts().length === 0) return;
    if (region.matches(':popover-open')) {
      if (!this.document.querySelector(':popover-open:not(.kui-toast-region), :modal')) return;
      region.hidePopover();
    }
    region.showPopover();
  }

  private leaveTopLayer(): void {
    if (this.topLayerListener) {
      this.document.removeEventListener('toggle', this.topLayerListener, true);
      this.topLayerListener = null;
    }
    const region = this.regionEl()?.nativeElement;
    if (region && typeof region.hidePopover === 'function' && region.matches(':popover-open')) {
      region.hidePopover();
    }
  }

  private startTimerFor(id: number, duration: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.clearTimer(id);
    this.startedAt.set(id, Date.now());
    this.timers.set(
      id,
      setTimeout(() => this.dismiss(id), duration),
    );
  }

  private isPersistentConfig(config: KuiToastConfig): boolean {
    return (
      readPersistent(config.persistent) ||
      (config.persistent === undefined && config.duration === Infinity)
    );
  }

  /** A missing or non-finite duration falls back to the default the toast was opened with. */
  protected getDuration(toast: Pick<InternalToastItem, 'config' | 'defaultDuration'>): number {
    const duration = toast.config.duration;
    return duration !== undefined && Number.isFinite(duration)
      ? Math.max(0, duration)
      : toast.defaultDuration;
  }

  /** Stops the running timer and keeps the time that was left, so a later resume continues it. */
  private freezeTimer(id: number, toast: InternalToastItem): void {
    if (!this.timers.has(id)) return;
    this.clearTimer(id);
    const elapsed = Date.now() - (this.startedAt.get(id) ?? Date.now());
    const left = this.remaining.get(id) ?? this.getDuration(toast);
    this.remaining.set(id, Math.max(0, left - elapsed));
    this.startedAt.delete(id);
  }

  private completeSubjects(toast: InternalToastItem, emitClosed: boolean): void {
    if (emitClosed) toast.closedSubject.next();
    toast.closedSubject.complete();
    toast.actionSubject.complete();
  }

  private trackPersistentSignal(id: number, value: PersistentConfig): void {
    if (!isSignal(value)) return;

    let previous = readPersistent(value);
    const ref = effect(
      () => {
        const current = value();
        if (current === previous) return;
        previous = current;
        this.syncPersistentState(id, current);
      },
      { injector: this.injector },
    );
    this.persistentEffects.set(id, ref);
  }

  private syncPersistentState(id: number, persistent: boolean): void {
    const toast = this._toasts().find((item) => item.id === id);
    if (!toast || toast.closing()) return;

    if (
      persistent ||
      (toast.config.persistent === undefined && toast.config.duration === Infinity)
    ) {
      this.freezeTimer(id, toast);
      return;
    }

    const duration = this.remaining.get(id) ?? this.getDuration(toast);
    this.remaining.set(id, duration);
    if (!toast.paused()) this.startTimerFor(id, duration);
  }

  private destroyPersistentSignal(id: number): void {
    this.persistentEffects.get(id)?.destroy();
    this.persistentEffects.delete(id);
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer != null) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  ngOnDestroy(): void {
    this.leaveTopLayer();
    this.timers.forEach((t) => clearTimeout(t));
    this.closeTimers.forEach((t) => clearTimeout(t));
    this.persistentEffects.forEach((ref) => ref.destroy());
    this.timers.clear();
    this.closeTimers.clear();
    this.persistentEffects.clear();
    for (const toast of this._toasts()) this.completeSubjects(toast, toast.closing());
  }
}
