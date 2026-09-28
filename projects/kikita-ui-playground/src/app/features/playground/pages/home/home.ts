import { Component } from '@angular/core';

import { WorkspacePlaceholder } from '@features/playground/components';

@Component({
  selector: 'app-playground-home',
  imports: [WorkspacePlaceholder],
  templateUrl: './home.html',
})
export class PlaygroundHome {}
