import type { Routes } from '@angular/router';

import { PlaygroundRoute } from '@app/enums';
import { provideTranslocoScope } from '@jsverse/transloco';

export const PLAYGROUND_FORMS_ROUTES: Routes = [
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Calendar].join('/'),
    data: { componentId: PlaygroundRoute.Calendar },
    providers: [provideTranslocoScope('calendar')],
    loadComponent: () => import('./calendar').then((page) => page.Calendar),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Checkbox].join('/'),
    data: { componentId: PlaygroundRoute.Checkbox },
    providers: [provideTranslocoScope('checkbox')],
    loadComponent: () => import('./checkbox').then((page) => page.Checkbox),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.ColorInput].join('/'),
    data: { componentId: PlaygroundRoute.ColorInput },
    providers: [provideTranslocoScope('color-input')],
    loadComponent: () => import('./color-input').then((page) => page.ColorInput),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Combobox].join('/'),
    data: { componentId: PlaygroundRoute.Combobox },
    providers: [provideTranslocoScope('combobox')],
    loadComponent: () => import('./combobox').then((page) => page.Combobox),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.DatePicker].join('/'),
    data: { componentId: PlaygroundRoute.DatePicker },
    providers: [provideTranslocoScope('date-picker')],
    loadComponent: () => import('./date-picker').then((page) => page.DatePicker),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Field].join('/'),
    data: { componentId: PlaygroundRoute.Field },
    providers: [provideTranslocoScope('field')],
    loadComponent: () => import('./field').then((page) => page.Field),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.FileUpload].join('/'),
    data: { componentId: PlaygroundRoute.FileUpload },
    providers: [provideTranslocoScope('file-upload')],
    loadComponent: () => import('./file-upload').then((page) => page.FileUpload),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Group].join('/'),
    data: { componentId: PlaygroundRoute.Group },
    providers: [provideTranslocoScope('group')],
    loadComponent: () => import('./group').then((page) => page.Group),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Input].join('/'),
    data: { componentId: PlaygroundRoute.Input },
    providers: [provideTranslocoScope('input')],
    loadComponent: () => import('./input').then((page) => page.Input),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.NumberInput].join('/'),
    data: { componentId: PlaygroundRoute.NumberInput },
    providers: [provideTranslocoScope('number-input')],
    loadComponent: () => import('./number-input').then((page) => page.NumberInput),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.OtpInput].join('/'),
    data: { componentId: PlaygroundRoute.OtpInput },
    providers: [provideTranslocoScope('otp-input')],
    loadComponent: () => import('./otp-input').then((page) => page.OtpInput),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Radio].join('/'),
    data: { componentId: PlaygroundRoute.Radio },
    providers: [provideTranslocoScope('radio')],
    loadComponent: () => import('./radio').then((page) => page.Radio),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Segmented].join('/'),
    data: { componentId: PlaygroundRoute.Segmented },
    providers: [provideTranslocoScope('segmented')],
    loadComponent: () => import('./segmented').then((page) => page.Segmented),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Select].join('/'),
    data: { componentId: PlaygroundRoute.Select },
    providers: [provideTranslocoScope('select')],
    loadComponent: () => import('./select').then((page) => page.Select),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Slider].join('/'),
    data: { componentId: PlaygroundRoute.Slider },
    providers: [provideTranslocoScope('slider')],
    loadComponent: () => import('./slider').then((page) => page.Slider),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Switch].join('/'),
    data: { componentId: PlaygroundRoute.Switch },
    providers: [provideTranslocoScope('switch')],
    loadComponent: () => import('./switch').then((page) => page.Switch),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Textarea].join('/'),
    data: { componentId: PlaygroundRoute.Textarea },
    providers: [provideTranslocoScope('textarea')],
    loadComponent: () => import('./textarea').then((page) => page.Textarea),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.TimePicker].join('/'),
    data: { componentId: PlaygroundRoute.TimePicker },
    providers: [provideTranslocoScope('time-picker')],
    loadComponent: () => import('./time-picker').then((page) => page.TimePicker),
  },
];
