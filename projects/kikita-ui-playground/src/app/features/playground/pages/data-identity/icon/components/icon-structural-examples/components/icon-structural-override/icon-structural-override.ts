import { Component } from '@angular/core';

import { kuiProvideDefaults } from '@kikita-labs/ui';

import { ICON_STRUCTURAL_OVERRIDES } from '../../constants';
import { IconStructuralSample } from '../icon-structural-sample';

/** Renders the sample inside a `kuiProvideDefaults({ icons })` level, so only this subtree changes. */
@Component({
  selector: 'app-icon-structural-override',
  imports: [IconStructuralSample],
  providers: [kuiProvideDefaults({ icons: ICON_STRUCTURAL_OVERRIDES })],
  template: `
    <app-icon-structural-sample paginationLabel="icon.labels.paginationOverridden" />
  `,
})
export class IconStructuralOverride {}
