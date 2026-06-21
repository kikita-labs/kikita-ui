import { Component, computed, signal } from '@angular/core';
import { FormField, FormRoot, email, form, minLength, required } from '@angular/forms/signals';

import { KuiButtonDirective, KuiFieldComponent, KuiInputDirective } from '@kikita-labs/ui';

@Component({
  selector: 'app-forms-page',
  imports: [FormField, FormRoot, KuiButtonDirective, KuiFieldComponent, KuiInputDirective],
  templateUrl: './forms.page.html',
})
export class FormsPage {
  protected readonly model = signal({
    email: '',
    project: '',
  });

  protected readonly profileForm = form(this.model, (path) => {
    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Enter a valid email' });
    required(path.project, { message: 'Project is required' });
    minLength(path.project, 3, { message: 'Use at least 3 characters' });
  });

  protected readonly formValue = computed(() => JSON.stringify(this.model(), null, 2));

  protected fieldError(field: typeof this.profileForm.email): string | undefined {
    const state = field();

    if (!state.touched() && !state.dirty()) {
      return undefined;
    }

    return state.errors()[0]?.message;
  }
}
