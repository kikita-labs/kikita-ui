import { Overlay } from '@angular/cdk/overlay';
import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  PLATFORM_ID,
  signal,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';

import { KuiButtonDirective } from '../button';
import {
  KuiCellDirective,
  KuiRowDirective,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '../table';
import type {
  KuiChartLegendItem,
  KuiChartLegendSource,
  KuiChartSlice,
  KuiChartTooltipFormatter,
  KuiChartValueFormat,
} from './chart.types';
import { computeRovingIndex } from './chart-keyboard-nav.util';
import { normalizeSlices } from './chart-normalize.util';
import { computeDonutShares, formatCompact } from './chart-scale.util';
import { isTouchPointerType, KuiChartTooltipController } from './chart-tooltip.util';

let nextDonutChartId = 0;

/** See the matching constant's JSDoc in `kui-line-chart.component.ts` -- same rationale. Height
 * and width share one value here (a donut is circular, not an axis-driven rectangle). */
const SIZE_DIMENSIONS = {
  sm: { width: 200, height: 200 },
  md: { width: 280, height: 280 },
  lg: { width: 360, height: 360 },
} as const;

const PADDING = 8;

/** Inner radius as a fraction of the outer radius -- fixed, not configurable in v1. Distinguishes
 * a donut (a ring) from a pie (a filled disc), matching the spec's "donut", not "pie". */
const INNER_RADIUS_RATIO = 0.6;

/** Hover pop-out distance in SVG viewBox units along the slice bisector. */
const HOVER_POP_OUT = 6;

/** Decorative loading-skeleton wedges; they do not represent data. */
const LOADING_WEDGE_SHARES = [0.38, 0.27, 0.21, 0.14] as const;

/** How long a hide/show re-partition animates, in ms. */
const DONUT_TWEEN_DURATION_MS = 260;

/** A displayed share below this is treated as "not rendered" -- both for an entering slice
 * starting its grow-in from 0 and an exiting slice finishing its shrink-out, so the animation ends
 * with the slice actually gone rather than an imperceptible sliver staying in the DOM forever. */
const MIN_VISIBLE_SHARE = 1e-4;

interface KuiDonutChartSlice {
  readonly sliceId: string;
  readonly label: string;
  readonly color?: string;
  readonly value: number;
  readonly share: number;
  /** Always drawn in the slice's own local frame, starting at angle `0`, from the CURRENT
   * (possibly mid-tween) `share` -- see the class doc's "Animating the re-partition" section. */
  readonly path: string;
  /** SVG `rotate(deg cx cy)` transform -- this slice's current position around the circle. */
  readonly rotateTransform: string;
  /** SVG `translate(dx,dy)` transform, in the slice's own local (pre-rotation) frame, along its
   * local angle bisector, applied only while hovered -- see `HOVER_POP_OUT`'s doc. Composed after
   * `rotateTransform` in the template (`rotate(...) translate(...)`), so the push happens in local
   * space and then rotates into its correct final outward direction with the rest of the slice. */
  readonly popOutTransform: string;
}

@Component({
  selector: 'kui-donut-chart',
  imports: [
    KuiButtonDirective,
    KuiCellDirective,
    KuiRowDirective,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
  ],
  templateUrl: './kui-donut-chart.component.html',
  host: {
    class: 'kui-chart kui-donut-chart',
    '[style.--kui-chart-height.px]': 'dimensions().height',
  },
  encapsulation: ViewEncapsulation.None,
})
/**
 * Donut chart. See docs/chart.md for the shared contracts and design limitations.
 *
 * Unlike the cartesian chart types, there are no `categories`/`axes` inputs -- a donut has no
 * axes. Hiding a slice through the legend recomputes the remaining slices' shares/angles (the
 * hidden slice is excluded from the total, the circle re-partitions) -- see
 * `computeDonutShares`'s JSDoc for the full rationale, and `displayedShareById`'s doc for how that
 * re-partition animates as a gap-free sweep (a `requestAnimationFrame`-driven tween of every
 * slice's share in lockstep, not independent CSS transitions -- see that doc for why the latter
 * visibly breaks).
 *
 * Implements {@link KuiChartLegendSource} -- see `kui-line-chart`'s matching class doc.
 */
export class KuiDonutChartComponent implements KuiChartLegendSource {
  /** Slices to plot. Empty or omitted renders the empty state, never a blank canvas. Negative
   * `value` is dropped during normalization (donut shares cannot be negative). */
  readonly slices = input.required<readonly KuiChartSlice[]>();

  /** Canvas size: 200 / 280 / 360px square for sm / md / lg. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Shows a loading placeholder instead of the chart. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Shows the legend. Defaults to `true` when there is more than one slice. */
  readonly legend = input<boolean | undefined>(undefined);

  /** Formats the default tooltip/legend number formatting. Defaults to a compact `1.2K` format. */
  readonly valueFormat = input<KuiChartValueFormat>(formatCompact);

  /** Formats the tooltip text for a slice. Defaults to `"<label>: <value> (<share>%)"`. */
  readonly tooltip = input<KuiChartTooltipFormatter | undefined>(undefined);

  /** Accessible name for the chart as a whole (what it shows, not per-slice detail). */
  readonly ariaLabel = input.required<string>();

  protected readonly chartId = `kui-donut-chart-${++nextDonutChartId}`;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tooltipController = new KuiChartTooltipController(
    inject(Overlay),
    this.platformId,
  );

  protected readonly hiddenSliceIds = signal<ReadonlySet<string>>(new Set());
  protected readonly hoveredSliceId = signal<string | null>(null);
  protected readonly focusedMarkIndex = signal(0);
  protected readonly showTable = signal(false);

  protected readonly dimensions = computed(() => SIZE_DIMENSIONS[this.size()]);

  private readonly normalizedSlices = computed(() => normalizeSlices(this.slices()));

  protected readonly hasData = computed(() => this.normalizedSlices().length > 0);

  protected readonly legendEnabled = computed(() => this.legend() ?? this.slices().length > 1);

  /** Visible slices' shares, recomputed with hidden slices excluded from the total -- see class
   * doc and `computeDonutShares`'s JSDoc. Does not include hidden slices at all (unlike
   * `normalizedSlices`, which `legendSlices` reads directly so hidden items stay in the legend).
   * This is the animation's TARGET, not what's drawn -- see `displayedShareById`. */
  private readonly shares = computed(() =>
    computeDonutShares(this.normalizedSlices(), this.hiddenSliceIds()),
  );

  private readonly center = computed(() => ({
    x: this.dimensions().width / 2,
    y: this.dimensions().height / 2,
  }));
  private readonly outerRadius = computed(
    () => Math.min(this.dimensions().width, this.dimensions().height) / 2 - PADDING,
  );
  private readonly innerRadius = computed(() => this.outerRadius() * INNER_RADIUS_RATIO);

  /**
   * Each slice's CURRENTLY DISPLAYED share (`sliceId` -> `share`), possibly mid-tween toward
   * `shares()`'s real target. Every slice's angle is recomputed from this ONE shared map every
   * animation frame (the same accumulate-from-0 loop `renderedSlices` always used) -- which is
   * what actually guarantees neighboring slices' edges meet exactly, with no gap or overlap, at
   * every instant of a hide/show re-partition: this map's values always sum to exactly `1` (the
   * invariant a linear interpolation between two states that each sum to `1` preserves at every
   * point in between), a guarantee two *independently* animated properties -- say, a `d`-only
   * transition on each slice, or a `d`+separate-`rotate()` split -- have no way to provide, since
   * neither knows what the other slice's element is doing at any given moment.
   *
   * This replaced two earlier, both broken, attempts (kept in git history as a record of what
   * doesn't work here): (1) a single `transition: d` between two path strings -- browsers
   * interpolate `d` by linearly interpolating each coordinate pair in a straight line, not by
   * sweeping along the circle, so a large repositioning visibly cut through the donut's interior
   * instead of sweeping around its rim; (2) splitting shape (`d`) from position (`rotate()`) into
   * two independently CSS-transitioning properties -- `rotate()` alone interpolates an angle
   * correctly, but with no shared timeline between one slice's `d`-transition and its neighbor's
   * `rotate()`-transition, their edges only ever lined up at the animation's start and end, not
   * during it, so hiding a slice visibly opened a gap in the ring mid-transition (found by the
   * maintainer from a real screenshot, not a unit test -- exactly the class of bug a test checking
   * only the settled `0%`/`100%` states can't catch).
   *
   * Starts `null` ("no tween has ever run") rather than eagerly reading `shares()` here: this is a
   * field initializer, which runs before Angular has bound `slices` (a required input) -- reading
   * it this early throws `NG0950`. `renderedSlices` falls back to computing directly from
   * `shares()` on every read while this is `null`, which is exactly the "first render" case (real
   * data, synchronously, no empty-ring flash or SSR/hydration mismatch) -- see its own doc. Written
   * only by `tick`/`retarget` below, both driven by the `effect()` in the constructor -- never
   * assigned to directly from a `computed()`.
   */
  private readonly displayedShareById = signal<ReadonlyMap<string, number> | null>(null);

  /** Last target seen by the `effect()` below, as a canonical string key -- lets the effect tell
   * "the target actually changed" apart from "`shares()` re-ran with an equal-value result"
   * (`computeDonutShares` always returns fresh objects, so reference equality alone would restart
   * the tween on every unrelated change detection pass). */
  private lastTargetKey: string | null = null;
  private rafId: ReturnType<typeof requestAnimationFrame> | null = null;
  private tweenFrom = new Map<string, number>();
  private tweenTo = new Map<string, number>();
  private tweenStart = 0;

  /** Rendered slices, built from `displayedShareById()` (the current, possibly mid-tween, frame)
   * -- iterates `normalizedSlices()` for a stable order and label/color/value, skipping any slice
   * whose displayed share has decayed to ~0 (hidden, or fully exited). See the class doc's
   * "Animating the re-partition" section for why every slice's angle is recomputed from this one
   * shared map every frame, instead of each slice separately animating its own `d`/position.
   * Falls back to `shares()` (the real target) directly when no tween has ever run yet --
   * `displayedShareById`'s own doc explains why that's `null` rather than pre-seeded on the very
   * first render. */
  protected readonly renderedSlices = computed<readonly KuiDonutChartSlice[]>(() => {
    const shareById =
      this.displayedShareById() ??
      new Map(this.shares().map((s) => [s.slice.sliceId, s.share] as const));
    const { x: cx, y: cy } = this.center();
    const outerR = this.outerRadius();
    const innerR = this.innerRadius();

    let visibleCount = 0;
    for (const share of shareById.values()) if (share > MIN_VISIBLE_SHARE) visibleCount++;
    const isSingleSlice = visibleCount === 1;

    let angle = 0;
    const result: KuiDonutChartSlice[] = [];

    for (const slice of this.normalizedSlices()) {
      const share = shareById.get(slice.sliceId);
      if (!share || share <= MIN_VISIBLE_SHARE) continue;

      const startAngle = angle;
      const span = share * 2 * Math.PI;
      const localBisector = span / 2;
      angle = startAngle + span;

      // A single slice spans the full circle, which `donutArcPath`'s arc command cannot close
      // seamlessly (see its own JSDoc) -- even with `FULL_CIRCLE_EPSILON`'s tiny nudge, the
      // unclosed sliver was visibly rendering as a dark seam once zoomed into a real page (found
      // by browser-checking the "single slice" demo, not by a unit test -- the geometry looked
      // fine as raw path data). `donutFullRingPath` draws a true, seamless annulus instead --
      // rotation is meaningless for a full circle, so the rotate transform below is harmlessly `0`
      // either way.
      const path = isSingleSlice
        ? donutFullRingPath(cx, cy, innerR, outerR)
        : donutArcPath(cx, cy, innerR, outerR, 0, span);
      // A full-circle single slice has no meaningful "outward" direction to pop toward (every
      // angle is equally "the middle" of a 360-degree span) -- popping it out along its
      // (arbitrary) bisector just shifted the whole ring sideways on hover, which read as a
      // rendering bug, not an intentional hover effect (found by browser-checking the "single
      // slice" demo). Skip the pop-out entirely when there's only one slice to draw.
      // `px` is required here -- this is bound to `[style.transform]` (a CSS property), not an
      // SVG `transform` attribute. SVG's own attribute syntax accepts bare unitless numbers as
      // its coordinate system's "user units"; CSS `translate()` does not -- a unitless number is
      // an invalid value there, and the browser silently drops the whole declaration rather than
      // erroring, which read as "the pop-out animation just doesn't happen anymore" (found by the
      // maintainer, not a unit test -- jsdom's `getComputedStyle` doesn't validate CSS values the
      // way a real layout/style engine does, so this passed every existing test). `px` on an SVG
      // element's CSS `transform` resolves in that same user-unit coordinate system, so the
      // visual result is identical to the old attribute-based value.
      const popOutTransform = isSingleSlice
        ? ''
        : `translate(${HOVER_POP_OUT * Math.sin(localBisector)}px,${-HOVER_POP_OUT * Math.cos(localBisector)}px)`;

      result.push({
        sliceId: slice.sliceId,
        label: slice.label,
        color: slice.color,
        value: slice.value,
        share,
        path,
        rotateTransform: `rotate(${(startAngle * 180) / Math.PI} ${cx} ${cy})`,
        popOutTransform,
      });
    }
    return result;
  });

  /** Generic wedge paths for the loading skeleton -- same `donutArcPath` geometry as real slices,
   * split by `LOADING_WEDGE_SHARES` (decorative, not real data). Gives a real transparent center
   * for free (an annulus wedge, not a filled disc) -- see `LOADING_WEDGE_SHARES`'s doc. */
  protected readonly loadingWedgePaths = computed(() => {
    const { x: cx, y: cy } = this.center();
    const outerR = this.outerRadius();
    const innerR = this.innerRadius();
    let angle = 0;
    return LOADING_WEDGE_SHARES.map((share) => {
      const startAngle = angle;
      const endAngle = angle + share * 2 * Math.PI;
      angle = endAngle;
      return donutArcPath(cx, cy, innerR, outerR, startAngle, endAngle);
    });
  });

  /** `true` when there is exactly one slice left to draw -- the arc-separator stroke between
   * neighboring slices (`.kui-chart__slice`'s `stroke`) has no neighbor to separate from in that
   * case, and left on, it renders as a stray hairline slit across an otherwise-solid ring (found by
   * browser-checking the "single slice" demo before calling this component done). */
  protected readonly isSingleVisibleSlice = computed(() => this.renderedSlices().length === 1);

  /** Every slice regardless of hidden state, so the legend stays interactive for hidden slices
   * (see `kui-line-chart`'s matching `legendSeries` doc) -- reads `normalizedSlices` directly
   * rather than `shares` (which excludes hidden slices entirely now that hiding recomputes the
   * total). A hidden slice's `share` is looked up from the last visible computation, or `0` while
   * hidden. Also used for the alt-table, which needs the exact `value`, not just `share`. */
  protected readonly legendSlices = computed(() => {
    const visibleShareBySliceId = new Map(
      this.shares().map(({ slice, share }) => [slice.sliceId, share]),
    );
    return this.normalizedSlices().map((slice) => ({
      sliceId: slice.sliceId,
      label: slice.label,
      color: slice.color,
      value: slice.value,
      share: visibleShareBySliceId.get(slice.sliceId) ?? 0,
    }));
  });

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  readonly legendItems: () => readonly KuiChartLegendItem[] = computed(() =>
    this.legendSlices().map((s) => ({
      id: s.sliceId,
      label: s.label,
      color: s.color,
      hidden: this.isSliceHidden(s.sliceId),
    })),
  );

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  readonly hoveredLegendId: () => string | null = computed(() => this.hoveredSliceId());

  protected readonly markRefs = viewChildren<SVGPathElement>('markRef');

  protected sliceLabel(slice: KuiDonutChartSlice): string {
    return this.formatTooltipText(slice);
  }

  private formatTooltipText(slice: KuiDonutChartSlice): string {
    const formatter = this.tooltip();
    if (formatter) {
      return formatter({ seriesName: slice.label, value: slice.value });
    }
    const value = this.valueFormat()(slice.value);
    const percent = Math.round(slice.share * 100);
    return `${slice.label}: ${value} (${percent}%)`;
  }

  protected onSliceEnter(slice: KuiDonutChartSlice, event: PointerEvent, group: Element): void {
    const point = { x: event.clientX, y: event.clientY };
    if (isTouchPointerType(event.pointerType)) {
      // See `kui-line-chart`'s matching `onMarkEnter` doc.
      this.tooltipController.showPinned(point, this.sliceLabel(slice), group, () => {
        this.hoveredSliceId.set(null);
      });
    } else {
      this.tooltipController.show(point, this.sliceLabel(slice));
    }
    this.hoveredSliceId.set(slice.sliceId);
  }

  protected onSliceFocus(slice: KuiDonutChartSlice, index: number, target: Element): void {
    this.focusedMarkIndex.set(index);
    // See `kui-line-chart`'s matching `onMarkFocus` doc -- a click's synthetic `focus` shouldn't
    // jump an already pointer-following tooltip to the element's center.
    if (this.hoveredSliceId() === slice.sliceId) return;
    this.tooltipController.show(target, this.sliceLabel(slice));
  }

  /** See `kui-line-chart`'s matching `onMarksPointerMove` doc -- follows cursor while over the
   * same slice. */
  protected onSlicesPointerMove(event: PointerEvent): void {
    this.tooltipController.move({ x: event.clientX, y: event.clientY });
  }

  /** See `kui-line-chart`'s matching `onMarksPointerLeave` doc. */
  protected onSlicesPointerLeave(event: PointerEvent): void {
    if (isTouchPointerType(event.pointerType)) return;
    this.tooltipController.hide();
    this.hoveredSliceId.set(null);
  }

  /** See `kui-line-chart`'s matching `onMarksFocusOut` doc. */
  protected onSlicesFocusOut(event: FocusEvent, group: Element): void {
    const next = event.relatedTarget as Node | null;
    if (next && group.contains(next)) return;
    this.tooltipController.hide();
  }

  /** See `kui-line-chart`'s matching `onMarksKeydown` doc. */
  protected onSlicesKeydown(event: KeyboardEvent): void {
    const next = computeRovingIndex(
      event.key,
      this.focusedMarkIndex(),
      this.renderedSlices().length,
    );
    if (next === null) return;
    event.preventDefault();
    this.focusedMarkIndex.set(next);
    this.markRefs()[next]?.focus?.();
  }

  protected toggleSlice(sliceId: string): void {
    const next = new Set(this.hiddenSliceIds());
    const hiding = !next.has(sliceId);
    if (hiding) next.add(sliceId);
    else next.delete(sliceId);
    this.hiddenSliceIds.set(next);
    // Clicking a legend item doesn't move the pointer away from it -- if this slice was already
    // the hovered one (hovered, then clicked to hide), it stays "hovered" by id after hiding, but
    // is no longer in `renderedSlices()` to match against, so every other slice's dimmed-check
    // (`hoveredSliceId() && hoveredSliceId() !== slice.sliceId`) was true for all of them --
    // dimming the entire ring with nothing highlighted (found from a real screenshot: hiding "Pro"
    // while still hovering its legend button dimmed Free/Business/Enterprise all at once).
    if (hiding && this.hoveredSliceId() === sliceId) this.hoveredSliceId.set(null);
  }

  protected isSliceHidden(sliceId: string): boolean {
    return this.hiddenSliceIds().has(sliceId);
  }

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  toggleLegendItem(sliceId: string): void {
    this.toggleSlice(sliceId);
  }

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  setHoveredLegendId(sliceId: string | null): void {
    this.hoveredSliceId.set(sliceId);
  }

  protected formatValue(value: number): string {
    return this.valueFormat()(value);
  }

  /** Builds `shares()`'s canonical key -- see `lastTargetKey`'s doc. */
  private targetKeyOf(
    shares: readonly { readonly slice: { sliceId: string }; readonly share: number }[],
  ): string {
    return shares
      .map(({ slice, share }) => `${slice.sliceId}:${share.toFixed(6)}`)
      .sort()
      .join(',');
  }

  /** Starts (or redirects an in-flight) tween from `displayedShareById()`'s current value toward
   * `target`. Entering slice ids (in `target`, not currently displayed) start from `0`; exiting
   * ids (currently displayed, not in `target`) animate toward `0` instead of disappearing outright
   * -- see the class doc's "Animating the re-partition" section for why this, not per-slice
   * `transition: d`/`transform`, is what actually keeps neighboring slices' edges together
   * throughout. Respects `prefers-reduced-motion` and SSR (no `requestAnimationFrame`) by jumping
   * straight to `target`. */
  private retarget(target: ReadonlyMap<string, number>): void {
    if (
      typeof requestAnimationFrame === 'undefined' ||
      (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      this.rafId = null;
      this.displayedShareById.set(target);
      return;
    }

    // Defensive fallback only -- the constructor's `effect` always seeds `displayedShareById`
    // before any real `retarget` can fire, but `new Map(null)` (an empty map) would silently
    // reintroduce the "grows from nothing" bug this method's own doc describes if that ever
    // stopped being true.
    const from = new Map(this.displayedShareById() ?? target);
    const to = new Map(target);
    for (const id of to.keys()) if (!from.has(id)) from.set(id, 0);
    for (const id of from.keys()) if (!to.has(id)) to.set(id, 0);

    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.tweenFrom = from;
    this.tweenTo = to;
    this.tweenStart = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  /** One animation frame of the current tween -- see `retarget`'s doc. Reads/writes only plain
   * fields and `displayedShareById` (never a `computed()`), so this is safe to call from a
   * `requestAnimationFrame` callback outside Angular's effect-execution context. */
  private readonly tick = (now: number): void => {
    const t = Math.min(1, (now - this.tweenStart) / DONUT_TWEEN_DURATION_MS);
    const eased = t * t * (3 - 2 * t);
    const next = new Map<string, number>();
    for (const [id, to] of this.tweenTo) {
      const from = this.tweenFrom.get(id) ?? 0;
      const value = from + (to - from) * eased;
      if (value > MIN_VISIBLE_SHARE || to > MIN_VISIBLE_SHARE) next.set(id, value);
    }
    this.displayedShareById.set(next);

    if (t < 1) {
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }
    this.rafId = null;
    // Snap exactly to target on completion -- easing/floating-point error can leave the tween a
    // fraction of a percent short, and exited slices (target share `0`) need to actually drop out
    // of `tweenTo`'s keys here, not just decay toward (but never quite reach) `MIN_VISIBLE_SHARE`.
    const final = new Map<string, number>();
    for (const [id, to] of this.tweenTo) if (to > MIN_VISIBLE_SHARE) final.set(id, to);
    this.displayedShareById.set(final);
  };

  constructor() {
    // `this.shares()` depends on `this.slices()`, a required input -- not yet bound this early
    // (NG0950), even from inside the constructor body, not just a field initializer. The `effect`
    // below is the first place it's safe to read it. Its first-ever run doesn't animate --
    // `renderedSlices`'s own `displayedShareById() ?? shares()` fallback already renders the
    // correct initial state without a tween -- but it must still *seed* `displayedShareById` with
    // that real starting point (not leave it `null`), or the first-ever `retarget` after a real
    // change has nothing to animate from: `new Map(null)` is an empty map, so every slice's `from`
    // would default to `0` and the whole chart would visibly grow from nothing instead of
    // transitioning from what was already on screen (found from a real reload-then-hide-a-slice
    // repro, not a unit test -- every existing test triggers its one hide/show after mount, so
    // this exact "the very first real change after a fresh page load" path had no coverage).
    let isFirstEffectRun = true;
    effect(() => {
      const shares = this.shares();
      const key = this.targetKeyOf(shares);
      if (isFirstEffectRun) {
        isFirstEffectRun = false;
        this.lastTargetKey = key;
        this.displayedShareById.set(new Map(shares.map((s) => [s.slice.sliceId, s.share])));
        return;
      }
      if (key === this.lastTargetKey) return;
      this.lastTargetKey = key;
      this.retarget(new Map(shares.map((s) => [s.slice.sliceId, s.share])));
    });

    this.destroyRef.onDestroy(() => {
      this.tooltipController.hide();
      this.tooltipController.destroy();
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    });
  }
}

/**
 * SVG's arc command cannot draw a true, closed 360-degree arc: when `startAngle`/`endAngle` span
 * a full circle, their computed start/end points are numerically the same, which every browser
 * renders as a zero-length (invisible) arc -- the standard limitation d3-shape's `arc()` generator
 * works around the same way this does. Found by browser-checking a single-slice donut (100% share)
 * before calling this component done -- it rendered nothing at all.
 */
const FULL_CIRCLE_EPSILON = 1e-3;

/**
 * Builds an SVG path for one donut slice: an annulus wedge between `innerR` and `outerR`, from
 * `startAngle` to `endAngle` (radians, `0` at the top, clockwise) -- the same arc-path math as
 * d3-shape's `arc()` generator, including the full-circle workaround (see
 * `FULL_CIRCLE_EPSILON`'s doc).
 */
function donutArcPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const span = Math.min(endAngle - startAngle, 2 * Math.PI - FULL_CIRCLE_EPSILON);
  const clampedEndAngle = startAngle + span;
  const largeArc = span > Math.PI ? 1 : 0;
  const x1 = cx + outerR * Math.sin(startAngle);
  const y1 = cy - outerR * Math.cos(startAngle);
  const x2 = cx + outerR * Math.sin(clampedEndAngle);
  const y2 = cy - outerR * Math.cos(clampedEndAngle);
  const x3 = cx + innerR * Math.sin(clampedEndAngle);
  const y3 = cy - innerR * Math.cos(clampedEndAngle);
  const x4 = cx + innerR * Math.sin(startAngle);
  const y4 = cy - innerR * Math.cos(startAngle);
  return (
    `M${x1},${y1} A${outerR},${outerR} 0 ${largeArc} 1 ${x2},${y2} ` +
    `L${x3},${y3} A${innerR},${innerR} 0 ${largeArc} 0 ${x4},${y4} Z`
  );
}

/**
 * Builds an SVG path for a full-circle donut ring (a single 100%-share slice): two concentric
 * circles, each drawn as two complete semicircle arcs (which close seamlessly, unlike
 * `donutArcPath`'s single-arc-per-edge technique), combined with `fill-rule="evenodd"` so the
 * inner circle punches a hole out of the outer one. Read with `.kui-chart__slice`'s `fill-rule`
 * attribute, set only for this path shape -- `donutArcPath`'s wedge paths don't need it (a
 * non-closed wedge has no inner subpath to punch a hole with).
 */
function donutFullRingPath(cx: number, cy: number, innerR: number, outerR: number): string {
  return (
    `M${cx - outerR},${cy} A${outerR},${outerR} 0 1 0 ${cx + outerR},${cy} ` +
    `A${outerR},${outerR} 0 1 0 ${cx - outerR},${cy} Z ` +
    `M${cx - innerR},${cy} A${innerR},${innerR} 0 1 0 ${cx + innerR},${cy} ` +
    `A${innerR},${innerR} 0 1 0 ${cx - innerR},${cy} Z`
  );
}
