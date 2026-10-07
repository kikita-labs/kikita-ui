import { Component } from '@angular/core';

import { KuiSkeleton, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { SkeletonLoadingRegion, SkeletonShapeMatrix } from './components';

/** Shows Skeleton defaults, every supported shape and animation, and busy-region composition. */
@Component({
  selector: 'app-skeleton',
  imports: [
    KuiSkeleton,
    KuiText,
    PlaygroundExampleCard,
    SkeletonLoadingRegion,
    SkeletonShapeMatrix,
    TranslocoPipe,
  ],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
})
export class Skeleton {}
