import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tokens' },
  {
    path: 'tokens',
    loadComponent: () => import('./pages/tokens/tokens.page').then((m) => m.TokensPage),
  },
  {
    path: 'theme',
    loadComponent: () => import('./pages/theme/theme.page').then((m) => m.ThemePage),
  },
  {
    path: 'density',
    loadComponent: () => import('./pages/density/density.page').then((m) => m.DensityPage),
  },
  {
    path: 'button',
    loadComponent: () => import('./pages/button/button.page').then((m) => m.ButtonPage),
  },
  {
    path: 'field',
    loadComponent: () => import('./pages/field/field.page').then((m) => m.FieldPage),
  },
  {
    path: 'input',
    loadComponent: () => import('./pages/input/input.page').then((m) => m.InputPage),
  },
  {
    path: 'textarea',
    loadComponent: () => import('./pages/textarea/textarea.page').then((m) => m.TextareaPage),
  },
  {
    path: 'checkbox',
    loadComponent: () => import('./pages/checkbox/checkbox.page').then((m) => m.CheckboxPage),
  },
  {
    path: 'switch',
    loadComponent: () => import('./pages/switch/switch.page').then((m) => m.SwitchPage),
  },
  {
    path: 'radio',
    loadComponent: () => import('./pages/radio/radio.page').then((m) => m.RadioPage),
  },
  {
    path: 'badge',
    loadComponent: () => import('./pages/badge/badge.page').then((m) => m.BadgePage),
  },
  {
    path: 'loader',
    loadComponent: () => import('./pages/loader/loader.page').then((m) => m.LoaderPage),
  },
  { path: 'card', loadComponent: () => import('./pages/card/card.page').then((m) => m.CardPage) },
  {
    path: 'group',
    loadComponent: () => import('./pages/group/group.page').then((m) => m.GroupPage),
  },
  {
    path: 'icons',
    loadComponent: () => import('./pages/icons/icons.page').then((m) => m.IconsPage),
  },
  {
    path: 'forms',
    loadComponent: () => import('./pages/forms/forms.page').then((m) => m.FormsPage),
  },
  { path: 'tabs', loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage) },
  {
    path: 'tooltip',
    loadComponent: () => import('./pages/tooltip/tooltip.page').then((m) => m.TooltipPage),
  },
  {
    path: 'segmented',
    loadComponent: () => import('./pages/segmented/segmented.page').then((m) => m.SegmentedPage),
  },
  {
    path: 'table',
    loadComponent: () => import('./pages/table/table.page').then((m) => m.TablePage),
  },
  {
    path: 'select',
    loadComponent: () => import('./pages/select/select.page').then((m) => m.SelectPage),
  },
  {
    path: 'dropdown',
    loadComponent: () => import('./pages/dropdown/dropdown.page').then((m) => m.DropdownPage),
  },
  { path: '**', redirectTo: 'tokens' },
];
