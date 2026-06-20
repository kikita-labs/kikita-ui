import { Routes } from '@angular/router';

import {
  ButtonPage,
  FieldPage,
  FormsPage,
  GroupPage,
  IconsPage,
  InputPage,
  ThemePage,
  TokensPage,
} from './playground-pages';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tokens' },
  { path: 'tokens', component: TokensPage },
  { path: 'theme', component: ThemePage },
  { path: 'button', component: ButtonPage },
  { path: 'field', component: FieldPage },
  { path: 'input', component: InputPage },
  { path: 'group', component: GroupPage },
  { path: 'icons', component: IconsPage },
  { path: 'forms', component: FormsPage },
  { path: '**', redirectTo: 'tokens' },
];
