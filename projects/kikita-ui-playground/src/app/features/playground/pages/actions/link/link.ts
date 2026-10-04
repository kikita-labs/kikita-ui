import { Component } from '@angular/core';

import { KuiLink, KuiText } from '@kikita-labs/ui';

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
    KuiLink,
    KuiText,
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
