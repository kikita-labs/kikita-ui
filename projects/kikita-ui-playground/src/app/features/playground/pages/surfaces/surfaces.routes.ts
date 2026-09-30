import type { Routes } from '@angular/router';

import { PlaygroundRoute } from '@app/enums';
import { provideTranslocoScope } from '@jsverse/transloco';

export const PLAYGROUND_SURFACES_ROUTES: Routes = [
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Accordion].join('/'),
    data: { componentId: PlaygroundRoute.Accordion },
    providers: [provideTranslocoScope('accordion')],
    loadComponent: () => import('./accordion').then((page) => page.Accordion),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Card].join('/'),
    data: { componentId: PlaygroundRoute.Card },
    providers: [provideTranslocoScope('card')],
    loadComponent: () => import('./card').then((page) => page.Card),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Breadcrumbs].join('/'),
    data: { componentId: PlaygroundRoute.Breadcrumbs },
    providers: [provideTranslocoScope('breadcrumbs')],
    loadComponent: () => import('./breadcrumbs').then((page) => page.Breadcrumbs),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Dialog].join('/'),
    data: { componentId: PlaygroundRoute.Dialog },
    providers: [provideTranslocoScope('dialog')],
    loadComponent: () => import('./dialog').then((page) => page.Dialog),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Dropdown].join('/'),
    data: { componentId: PlaygroundRoute.Dropdown },
    providers: [provideTranslocoScope('dropdown')],
    loadComponent: () => import('./dropdown').then((page) => page.Dropdown),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.MediaViewer].join('/'),
    data: { componentId: PlaygroundRoute.MediaViewer },
    providers: [provideTranslocoScope('media-viewer')],
    loadComponent: () => import('./media-viewer').then((page) => page.MediaViewer),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Popover].join('/'),
    data: { componentId: PlaygroundRoute.Popover },
    providers: [provideTranslocoScope('popover')],
    loadComponent: () => import('./popover').then((page) => page.Popover),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Drawer].join('/'),
    data: { componentId: PlaygroundRoute.Drawer },
    providers: [provideTranslocoScope('drawer')],
    loadComponent: () => import('./drawer').then((page) => page.Drawer),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Separator].join('/'),
    data: { componentId: PlaygroundRoute.Separator },
    providers: [provideTranslocoScope('separator')],
    loadComponent: () => import('./separator').then((page) => page.Separator),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Splitter].join('/'),
    data: { componentId: PlaygroundRoute.Splitter },
    providers: [provideTranslocoScope('splitter')],
    loadComponent: () => import('./splitter').then((page) => page.Splitter),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Stepper].join('/'),
    data: { componentId: PlaygroundRoute.Stepper },
    providers: [provideTranslocoScope('stepper')],
    loadComponent: () => import('./stepper').then((page) => page.Stepper),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Tabs].join('/'),
    data: { componentId: PlaygroundRoute.Tabs },
    providers: [provideTranslocoScope('tabs')],
    loadComponent: () => import('./tabs').then((page) => page.Tabs),
  },
];
