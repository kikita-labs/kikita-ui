import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import {
  KuiButtonDirective,
  KuiFieldComponent,
  KuiGroupDirective,
  KuiIconButtonDirective,
  KuiInputDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { GROUP_SEARCH_FORM_DEFAULT_STATE } from './constants';
import type { GroupSearchFormModel } from './interfaces';

@Component({
  selector: 'app-group-compositions',
  imports: [
    FormField,
    KuiButtonDirective,
    KuiFieldComponent,
    KuiGroupDirective,
    KuiIconButtonDirective,
    KuiInputDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './group-compositions.html',
  styleUrl: './group-compositions.scss',
})
export class GroupCompositions {
  protected readonly hasSearched = signal(false);

  private readonly model = signal<GroupSearchFormModel>(GROUP_SEARCH_FORM_DEFAULT_STATE);

  protected readonly searchForm = form(this.model);

  protected submitSearch(): void {
    this.hasSearched.set(true);
  }
}
