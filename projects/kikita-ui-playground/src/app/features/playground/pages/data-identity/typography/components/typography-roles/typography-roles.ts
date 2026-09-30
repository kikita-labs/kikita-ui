import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows every supported type role with its resolved size, line height, and weight. */
@Component({
  selector: 'app-typography-roles',
  imports: [KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './typography-roles.html',
  styleUrl: './typography-roles.scss',
})
export class TypographyRoles {}
