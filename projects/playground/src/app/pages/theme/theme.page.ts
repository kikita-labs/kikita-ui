import { Component, computed, inject } from '@angular/core';

import { KUI_THEME, KuiButtonDirective, KuiFieldComponent, KuiInputDirective } from '@kikita-labs/ui';

import { createPreviewStyle, createSemanticRows } from '../../playground-data';

@Component({
  selector: 'app-theme-page',
  imports: [KuiButtonDirective, KuiFieldComponent, KuiInputDirective],
  templateUrl: './theme.page.html',
})
export class ThemePage {
  private readonly theme = inject(KUI_THEME);
  protected readonly semanticRows = computed(() => createSemanticRows(this.theme, 'dark'));
  protected readonly lightStyle = computed(() => createPreviewStyle(this.theme, 'light'));
  protected readonly darkStyle = computed(() => createPreviewStyle(this.theme, 'dark'));
}
