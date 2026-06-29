import { Component, ViewEncapsulation, computed, input } from '@angular/core';

/** Visual shape used by `kui-progress`. */
export type KuiProgressType = 'linear' | 'circular';

/** Semantic color used by `kui-progress`. */
export type KuiProgressColor = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

/** Size token used by `kui-progress`. */
export type KuiProgressSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface CircularConfig {
  readonly size: number;
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly strokeWidth: number;
  readonly circumference: number;
}

const CIRCULAR_CONFIGS: Record<string, CircularConfig> = {
  sm: { size: 24, cx: 12, cy: 12, r: 10.75, strokeWidth: 2.5, circumference: 67.54 },
  md: { size: 36, cx: 18, cy: 18, r: 16.5, strokeWidth: 3, circumference: 103.67 },
  lg: { size: 48, cx: 24, cy: 24, r: 22.25, strokeWidth: 3.5, circumference: 139.8 },
  xl: { size: 64, cx: 32, cy: 32, r: 30, strokeWidth: 4, circumference: 188.5 },
};

@Component({
  selector: 'kui-progress',
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (type() === 'linear') {
      <div class="kui-progress-linear-fill" [style.width]="fillWidth()"></div>
    } @else {
      <svg
        [attr.width]="circCfg().size"
        [attr.height]="circCfg().size"
        [attr.viewBox]="'0 0 ' + circCfg().size + ' ' + circCfg().size"
      >
        <circle
          [attr.cx]="circCfg().cx"
          [attr.cy]="circCfg().cy"
          [attr.r]="circCfg().r"
          fill="none"
          class="kui-progress-circular-track"
          [attr.stroke-width]="circCfg().strokeWidth"
        />
        <circle
          [attr.cx]="circCfg().cx"
          [attr.cy]="circCfg().cy"
          [attr.r]="circCfg().r"
          fill="none"
          class="kui-progress-circular-fill"
          [attr.stroke-width]="circCfg().strokeWidth"
          [attr.stroke-dasharray]="circCfg().circumference"
          [attr.stroke-dashoffset]="dashOffset()"
          stroke-linecap="round"
        />
      </svg>
      <div class="kui-progress-circular-label">
        <ng-content />
      </div>
    }
  `,
  host: {
    '[class.kui-progress-linear]': 'type() === "linear"',
    '[class.kui-progress-circular]': 'type() === "circular"',
    '[attr.data-kui-size]': 'size()',
    '[attr.data-kui-color]': 'color()',
    '[attr.data-kui-indeterminate]': 'isIndeterminate() ? "true" : null',
    role: 'progressbar',
    '[attr.aria-valuenow]': 'isIndeterminate() ? null : clampedValue()',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
  },
})
export class KuiProgressComponent {
  /** Visual shape of the progress indicator. Defaults to linear. */
  readonly type = input<KuiProgressType>('linear');

  /** Progress value from 0 to 100, or null for an indeterminate indicator. */
  readonly value = input<number | null>(null);

  /** Semantic color applied to the filled portion of the indicator. */
  readonly color = input<KuiProgressColor>('primary');

  /** Visual size of the progress indicator. */
  readonly size = input<KuiProgressSize>('md');

  protected readonly isIndeterminate = computed(() => this.value() === null);
  protected readonly clampedValue = computed(() => Math.max(0, Math.min(100, this.value() ?? 0)));

  protected readonly fillWidth = computed(() => {
    if (this.isIndeterminate()) return null;
    return `${this.clampedValue()}%`;
  });

  protected readonly circCfg = computed(
    () => CIRCULAR_CONFIGS[this.size()] ?? CIRCULAR_CONFIGS['md'],
  );

  protected readonly dashOffset = computed(() => {
    const { circumference } = this.circCfg();
    if (this.isIndeterminate()) return circumference * 0.25;
    return circumference * (1 - this.clampedValue() / 100);
  });
}
