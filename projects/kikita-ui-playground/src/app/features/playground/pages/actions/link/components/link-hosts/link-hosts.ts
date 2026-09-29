import { Component, signal } from '@angular/core';

import { KuiLinkDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares the anchor and button hosts, with a real counted action on the button. */
@Component({
  selector: 'app-link-hosts',
  imports: [KuiLinkDirective, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './link-hosts.html',
  styleUrl: './link-hosts.scss',
})
export class LinkHosts {
  protected readonly activations = signal(0);

  /** Counts one activation of the action button. */
  protected activate(): void {
    this.activations.update((count) => count + 1);
  }
}
