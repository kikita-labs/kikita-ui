import { Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PlaygroundPanelComponent {
  readonly num = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string>('');
}
