import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';

import { WorkspacePlaceholder } from '@features/playground/components';

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

    const componentKey = id.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());

    return `playground.components.${componentKey}`;
  });
}
