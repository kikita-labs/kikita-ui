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
    path: 'avatar',
    loadComponent: () => import('./pages/avatar/avatar.page').then((m) => m.AvatarPage),
  },
  {
    path: 'loader',
    loadComponent: () => import('./pages/loader/loader.page').then((m) => m.LoaderPage),
  },
  {
    path: 'skeleton',
    loadComponent: () => import('./pages/skeleton/skeleton.page').then((m) => m.SkeletonPage),
  },
  {
    path: 'empty-state',
    loadComponent: () =>
      import('./pages/empty-state/empty-state.page').then((m) => m.EmptyStatePage),
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
  {
    path: 'dialog',
    loadComponent: () => import('./pages/dialog/dialog.page').then((m) => m.DialogPage),
  },
  {
    path: 'toast',
    loadComponent: () => import('./pages/toast/toast.page').then((m) => m.ToastPage),
  },
  {
    path: 'popover',
    loadComponent: () => import('./pages/popover/popover.page').then((m) => m.PopoverPage),
  },
  {
    path: 'accordion',
    loadComponent: () => import('./pages/accordion/accordion.page').then((m) => m.AccordionPage),
  },
  {
    path: 'progress',
    loadComponent: () => import('./pages/progress/progress.page').then((m) => m.ProgressPage),
  },
  {
    path: 'slider',
    loadComponent: () => import('./pages/slider/slider.page').then((m) => m.SliderPage),
  },
  {
    path: 'number-input',
    loadComponent: () =>
      import('./pages/number-input/number-input.page').then((m) => m.NumberInputPage),
  },
  { path: 'menu', loadComponent: () => import('./pages/menu/menu.page').then((m) => m.MenuPage) },
  {
    path: 'separator',
    loadComponent: () => import('./pages/separator/separator.page').then((m) => m.SeparatorPage),
  },
  {
    path: 'drawer',
    loadComponent: () => import('./pages/drawer/drawer.page').then((m) => m.DrawerPage),
  },
  {
    path: 'chip',
    loadComponent: () => import('./pages/chip/chip.page').then((m) => m.ChipPage),
  },
  {
    path: 'combobox',
    loadComponent: () => import('./pages/combobox/combobox.page').then((m) => m.ComboboxPage),
  },
  {
    path: 'command-palette',
    loadComponent: () =>
      import('./pages/command-palette/command-palette.page').then((m) => m.CommandPalettePage),
  },
  {
    path: 'scrollbar',
    loadComponent: () => import('./pages/scrollbar/scrollbar.page').then((m) => m.ScrollbarPage),
  },
  {
    path: 'color-input',
    loadComponent: () =>
      import('./pages/color-input/color-input.page').then((m) => m.ColorInputPage),
  },
  {
    path: 'stepper',
    loadComponent: () => import('./pages/stepper/stepper.page').then((m) => m.StepperPage),
  },
  {
    path: 'breadcrumbs',
    loadComponent: () =>
      import('./pages/breadcrumbs/breadcrumbs.page').then((m) => m.BreadcrumbsPage),
  },
  { path: '**', redirectTo: 'tokens' },
];
