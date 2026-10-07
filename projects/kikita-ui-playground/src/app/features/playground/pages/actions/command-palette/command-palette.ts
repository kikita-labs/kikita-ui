import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { CommandPaletteExamples } from './components';

@Component({
  selector: 'app-command-palette',
  imports: [CommandPaletteExamples, KuiText, TranslocoPipe],
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.scss',
})
export class CommandPalette {}
