import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';

import { WorkspacePlaceholder } from '@features/playground-shell/components';
import { COMPONENT_GROUPS } from '@features/playground-shell/components/component-sidebar/constants';

@Component({
  selector: 'app-component-playground',
  imports: [WorkspacePlaceholder],
  templateUrl: './component-playground.html',
  styleUrl: './component-playground.scss',
})
export class ComponentPlayground {
  private readonly route = inject(ActivatedRoute);

  private readonly componentId = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly selectedComponent = computed(() => {
    const id = this.componentId().get('componentId');
    if (!id) return null;

    for (const group of COMPONENT_GROUPS) {
      const component = group.components.find((item) => item.id === id);
      if (component) return component.label;
    }

    return null;
  });
}
