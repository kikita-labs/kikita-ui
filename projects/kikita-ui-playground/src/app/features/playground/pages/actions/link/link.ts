import { Component } from '@angular/core';

import { KuiLinkDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  LinkDisabled,
  LinkExternal,
  LinkHosts,
  LinkIcons,
  LinkToneMatrix,
  LinkTypography,
} from './components';

/** Shows the documented Link tones, underline modes, typography roles, hosts, and states. */
@Component({
  selector: 'app-link',
  imports: [
    KuiLinkDirective,
    KuiTextDirective,
    LinkDisabled,
    LinkExternal,
    LinkHosts,
    LinkIcons,
    LinkToneMatrix,
    LinkTypography,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './link.html',
  styleUrl: './link.scss',
})
export class Link {}
