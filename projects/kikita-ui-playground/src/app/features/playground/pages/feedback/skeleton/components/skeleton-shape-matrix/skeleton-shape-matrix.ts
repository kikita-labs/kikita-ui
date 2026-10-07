import { Component } from '@angular/core';

import { KuiSkeleton, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { SKELETON_ANIMATIONS, SKELETON_SHAPES } from './constants';

/** Renders every supported Skeleton shape with each animation mode. */
@Component({
  selector: 'app-skeleton-shape-matrix',
  imports: [KuiSkeleton, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './skeleton-shape-matrix.html',
  styleUrl: './skeleton-shape-matrix.scss',
})
export class SkeletonShapeMatrix {
  protected readonly shapes = SKELETON_SHAPES;

  protected readonly animations = SKELETON_ANIMATIONS;
}
