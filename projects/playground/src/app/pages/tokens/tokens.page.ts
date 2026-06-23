import { Component, ViewEncapsulation, computed, inject } from '@angular/core';

import {
  KuiCardDirective,
  KuiCellDirective,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
  KUI_THEME,
} from '@kikita-labs/ui';

import { createCssText, createPaletteRows, createSeedRows } from '../../playground-data';
import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-tokens-page',
  imports: [
    PlaygroundPanelComponent,
    KuiCardDirective,
    KuiTableDirective,
    KuiThGroupDirective,
    KuiThDirective,
    KuiCellDirective,
  ],
  templateUrl: './tokens.page.html',
  styleUrl: './tokens.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TokensPage {
  private readonly theme = inject(KUI_THEME);
  protected readonly seedRows = createSeedRows();
  protected readonly paletteRows = createPaletteRows(this.theme);
  protected readonly cssText = computed(() => createCssText(this.theme, 'dark'));
}
