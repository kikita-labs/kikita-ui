import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  TypographyHosts,
  TypographyLayout,
  TypographyMatrix,
  TypographyRoles,
  TypographyScopes,
  TypographyTones,
} from './components';

/** Shows Typography roles, tones, semantic hosts, and wrapping behavior. */
@Component({
  selector: 'app-typography',
  imports: [
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
    TypographyHosts,
    TypographyLayout,
    TypographyMatrix,
    TypographyRoles,
    TypographyScopes,
    TypographyTones,
  ],
  templateUrl: './typography.html',
  styleUrl: './typography.scss',
})
export class Typography {}
