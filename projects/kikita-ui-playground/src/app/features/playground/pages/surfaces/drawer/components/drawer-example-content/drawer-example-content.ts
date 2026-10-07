import { Component, inject } from '@angular/core';

import {
  KUI_DRAWER_CONTEXT,
  KuiButton,
  type KuiDrawerContext,
  type KuiDrawerHost,
} from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import type { DrawerExampleData, DrawerExampleResult } from '../../types';

/** Renders the page-owned content used to exercise the public Drawer contract. */
@Component({
  selector: 'app-drawer-example-content',
  imports: [KuiButton, TranslocoPipe],
  templateUrl: './drawer-example-content.html',
})
export class DrawerExampleContent implements KuiDrawerHost<DrawerExampleResult, DrawerExampleData> {
  public readonly drawerContext =
    inject<KuiDrawerContext<DrawerExampleResult, DrawerExampleData>>(KUI_DRAWER_CONTEXT);

  protected readonly ctx = this.drawerContext;
}
