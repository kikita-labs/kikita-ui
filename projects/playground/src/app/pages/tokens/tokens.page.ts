import { Component, computed, inject } from '@angular/core';

import { KUI_THEME } from '@kikita-labs/ui';

import { createCssText, createPaletteRows, createSeedRows } from '../../playground-data';

@Component({
  selector: 'app-tokens-page',
  imports: [],
  templateUrl: './tokens.page.html',
})
export class TokensPage {
  private readonly theme = inject(KUI_THEME);
  protected readonly seedRows = createSeedRows();
  protected readonly paletteRows = createPaletteRows(this.theme);
  protected readonly cssText = computed(() => createCssText(this.theme, 'dark'));
}
