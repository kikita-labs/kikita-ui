import { isPlatformBrowser } from '@angular/common';
import type { EffectRef, OnDestroy, Signal } from '@angular/core';
import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  PLATFORM_ID,
  signal,
  ViewEncapsulation,
} from '@angular/core';

import { Subject } from 'rxjs';

import {
  KUI_CIRCLE_CHECK_CIRCLE,
  KUI_CIRCLE_CHECK_D,
  KUI_CIRCLE_X_CIRCLE,
  KUI_CIRCLE_X_D,
  KUI_INFO_CIRCLE,
  KUI_INFO_DOT_D,
  KUI_INFO_LINE_D,
  KUI_TRIANGLE_ALERT_D,
  KUI_X_D,
} from '../../utils/kui-chrome-icon-paths.util';
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
}

type PersistentConfig = boolean | Signal<boolean> | undefined;

function readPersistent(value: PersistentConfig): boolean {
  return typeof value === 'function' ? value() : value === true;
}

/**
 * @internal
 * Fixed region that renders the toast stack.
 * Created lazily by {@link KuiToastService} and appended to `document.body`.
 * Not part of the public API.
 */
@Component({
  selector: 'kui-toast-region',
  template: `
    <div
      class="kui-toast-region"
      [attr.data-position]="_position()"
      role="region"
      aria-label="Notifications"
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
              @switch (toast.config.appearance) {
                @case ('success') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle
                      cx="${KUI_CIRCLE_CHECK_CIRCLE.cx}"
                      cy="${KUI_CIRCLE_CHECK_CIRCLE.cy}"
                      r="${KUI_CIRCLE_CHECK_CIRCLE.r}"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path
                      d="${KUI_CIRCLE_CHECK_D}"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
                @case ('warning') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="${KUI_TRIANGLE_ALERT_D[0]}"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="${KUI_TRIANGLE_ALERT_D[1]}"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="${KUI_TRIANGLE_ALERT_D[2]}"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
                @case ('danger') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle
                      cx="${KUI_CIRCLE_X_CIRCLE.cx}"
                      cy="${KUI_CIRCLE_X_CIRCLE.cy}"
                      r="${KUI_CIRCLE_X_CIRCLE.r}"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path
                      d="${KUI_CIRCLE_X_D[0]}"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                    <path
                      d="${KUI_CIRCLE_X_D[1]}"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                }
                @case ('info') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle
                      cx="${KUI_INFO_CIRCLE.cx}"
                      cy="${KUI_INFO_CIRCLE.cy}"
                      r="${KUI_INFO_CIRCLE.r}"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path
                      d="${KUI_INFO_LINE_D}"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                    <path
                      d="${KUI_INFO_DOT_D}"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                }
              }
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
                style="align-self:flex-start;margin-top:var(--kui-space-1);--kui-btn-ghost-fg:var(--kui-toast-accent-color)"
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
              aria-label="Close"
              (click)="dismiss(toast.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="${KUI_X_D[0]}"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="${KUI_X_D[1]}"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          }

          @if (toast.config.showProgress && !isPersistent(toast)) {
            <div
              class="kui-toast-progress"
              [style.animation-play-state]="toast.paused() ? 'paused' : 'running'"
              [style.animation]="'kui-toast-prog ' + getDuration(toast.config) + 'ms linear both'"
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

  private nextId = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly remaining = new Map<number, number>();
  private readonly startedAt = new Map<number, number>();
  private readonly persistentEffects = new Map<number, EffectRef>();

  /** Add a toast to the region and return a handle. Called by the service. */
  addToast(config: KuiToastConfig): KuiToastRef {
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
      },
    ]);

    if (!this.isPersistentConfig(config)) {
      const duration = this.getDuration(config);
      this.remaining.set(id, duration);
      this.startTimerFor(id, duration);
    }

    this.trackPersistentSignal(id, config.persistent);

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
    } else if (persistentChanged || durationChanged) {
      const duration = this.getDuration(toast.config);
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
    setTimeout(() => {
      this._toasts.update((list) => list.filter((t) => t.id !== id));
      toast.closedSubject.next();
      toast.closedSubject.complete();
      toast.actionSubject.complete();
    }, 200);
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
    if (!this.timers.has(id)) return;
    clearTimeout(this.timers.get(id)!);
    this.timers.delete(id);
    const elapsed = Date.now() - (this.startedAt.get(id) ?? Date.now());
    this.remaining.set(id, Math.max(0, (this.remaining.get(id) ?? 5000) - elapsed));
  }

  protected resumeTimer(id: number): void {
    const toast = this._toasts().find((item) => item.id === id);
    if (!toast) return;
    toast.paused.set(false);
    const rem = this.remaining.get(id);
    if (rem == null) return;
    this.startTimerFor(id, rem);
  }

  protected onAction(toast: InternalToastItem): void {
    toast.actionSubject.next();
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

  protected getDuration(config: KuiToastConfig): number {
    const duration = config.duration ?? 5000;
    return Number.isFinite(duration) ? Math.max(0, duration) : 5000;
  }

  private trackPersistentSignal(id: number, value: PersistentConfig): void {
    if (typeof value !== 'function') return;

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
      this.clearTimer(id);
      this.startedAt.delete(id);
      return;
    }

    const duration = this.remaining.get(id) ?? this.getDuration(toast.config);
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
    this.timers.forEach((t) => clearTimeout(t));
    this.persistentEffects.forEach((ref) => ref.destroy());
  }
}
