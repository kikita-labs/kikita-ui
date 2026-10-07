import { Component } from '@angular/core';

import { KuiIcon, KuiIconButton } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { ICON_BUTTON_PLUS_ICON_SOURCE } from './constants';

/** Shows registered icons, projected icon sources, and native anchor composition. */
@Component({
  selector: 'app-icon-button-icon-sources',
  imports: [KuiIconButton, KuiIcon, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './icon-button-icon-sources.html',
  styleUrl: './icon-button-icon-sources.scss',
})
export class IconButtonIconSources {
  protected readonly plusIconSource = ICON_BUTTON_PLUS_ICON_SOURCE;
}
