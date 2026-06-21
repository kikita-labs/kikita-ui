import { Component, ViewEncapsulation } from '@angular/core';

import { KuiFieldComponent, KuiTextareaDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-textarea-page',
  imports: [KuiFieldComponent, KuiTextareaDirective, PlaygroundPanelComponent],
  templateUrl: './textarea.page.html',
  styleUrl: './textarea.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TextareaPage {}
