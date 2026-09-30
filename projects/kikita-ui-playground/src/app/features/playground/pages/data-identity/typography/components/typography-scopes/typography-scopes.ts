import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows tone tokens re-evaluated inside light and dark theme scopes. */
@Component({
  selector: 'app-typography-scopes',
  imports: [KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './typography-scopes.html',
  styleUrl: './typography-scopes.scss',
})
export class TypographyScopes {}
