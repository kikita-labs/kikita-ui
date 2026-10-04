import { isPlatformServer } from '@angular/common';
import type { Signal } from '@angular/core';
import {
  afterNextRender,
  inject,
  Injector,
  makeStateKey,
  PLATFORM_ID,
  Service,
  signal,
  TransferState,
} from '@angular/core';

/** @internal */
export interface KuiClockSeed {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  /** Server epoch milliseconds, used to ignore the seed once the page is no longer fresh. */
  readonly epoch: number;
}

/** @internal Transfer-state key that carries the server's calendar date to the browser. */
export const KUI_CLOCK_SEED = /* @__PURE__ */ makeStateKey<KuiClockSeed>('kui-clock-seed');

/** A seed older than this is not from the render being hydrated. */
const SEED_MAX_AGE_MS = 10 * 60 * 1000;

/**
 * @internal
 * The date that date-aware components render first, identical on the server and in the browser.
 *
 * Components that compute "today" while rendering produce different markup when the server clock,
 * time zone or date differs from the browser's. Angular hydration reuses the server DOM and does
 * not remove a class or attribute that the server set and the browser's first evaluation leaves
 * unset, so the mismatch survives hydration (for example two days marked as today). The server
 * records its calendar date in `TransferState`; the browser renders that same date first, then
 * `today` moves to the real local date once the first browser render has finished.
 */
@Service()
export class KuiClock {
  private readonly seed: Date | null;
  private readonly todaySignal = signal(new Date());

  /** Start of the current local day: the seeded day first, the real one after the first render. */
  readonly today: Signal<Date>;

  constructor() {
    const transferState = inject(TransferState);
    const injector = inject(Injector);
    const isServer = isPlatformServer(inject(PLATFORM_ID));
    const now = new Date();

    if (isServer) {
      transferState.set(KUI_CLOCK_SEED, {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
        epoch: now.getTime(),
      });
      this.seed = null;
    } else {
      const seed = transferState.get(KUI_CLOCK_SEED, null);
      const fresh = seed !== null && Math.abs(now.getTime() - seed.epoch) < SEED_MAX_AGE_MS;

      this.seed = fresh ? new Date(seed.year, seed.month, seed.day, 12) : null;
    }

    this.todaySignal.set(startOfDay(this.seed ?? now));
    this.today = this.todaySignal.asReadonly();

    if (!isServer) {
      afterNextRender(() => this.todaySignal.set(startOfDay(new Date())), { injector });
    }
  }

  /**
   * The moment to derive first-render defaults from (for example the visible month). It equals the
   * server's date while a server-rendered page is being hydrated and the real time otherwise.
   */
  initialNow(): Date {
    return this.seed ? new Date(this.seed) : new Date();
  }

  /**
   * Moves a value that was derived from the seeded server date to the same derivation of the real
   * date, but only while it is still the untouched seeded value. Call it from `afterNextRender`;
   * without a seed (a client-only render) it does nothing. A value the user or the app already
   * changed is never overwritten.
   */
  followBrowserDate(
    state: { (): Date; set(value: Date): void },
    derive: (now: Date) => Date,
  ): void {
    if (!this.seed) return;

    const seeded = derive(this.seed);
    const current = state();
    if (current.getTime() !== seeded.getTime()) return;

    const real = derive(new Date());
    if (real.getTime() !== seeded.getTime()) state.set(real);
  }
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
