import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';

import {
  KuiAccordionComponent,
  KuiAccordionItemComponent,
  KuiFieldAffixDirective,
  KuiFieldComponent,
  KuiIconComponent,
  KuiInputDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundRoute } from '@app/enums';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { COMPONENT_GROUPS } from './constants';

@Component({
  selector: 'app-component-sidebar',
  imports: [
    KuiAccordionComponent,
    KuiAccordionItemComponent,
    KuiFieldComponent,
    KuiInputDirective,
    KuiTextDirective,
    TranslocoPipe,
    KuiIconComponent,
    KuiFieldAffixDirective,
    RouterLink,
  ],
  templateUrl: './component-sidebar.html',
  styleUrl: './component-sidebar.scss',
})
export class ComponentSidebar {
  readonly selectedComponent = input<string | null>(null);

  private readonly transloco = inject(TranslocoService);

  protected readonly componentsRoute = PlaygroundRoute.Components;
  protected readonly groups = COMPONENT_GROUPS;

  protected readonly expandedCategories = signal(['actions']);
  protected readonly searchTerm = signal('');

  protected readonly activeLanguage = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  protected readonly visibleGroups = computed(() => {
    this.activeLanguage();
    const query = this.searchTerm().trim().toLocaleLowerCase();
    if (!query) return this.groups;

    return this.groups
      .map((group) => ({
        ...group,
        components: group.components.filter((component) =>
          String(this.transloco.translate(component.label)).toLocaleLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.components.length > 0);
  });

  constructor() {
    effect(() => {
      const selected = this.selectedComponent();
      const activeGroup = this.groups.find((group) =>
        group.components.some((component) => component.id === selected),
      );

      if (activeGroup && !this.expandedCategories().includes(activeGroup.id)) {
        this.expandedCategories.update((expanded) => [...expanded, activeGroup.id]);
      }
    });
  }

  /** Updates the navigation filter from its native input event. */
  protected updateSearch(event: Event): void {
    const input = event.target;

    if (input instanceof HTMLInputElement) this.searchTerm.set(input.value);
  }
}
