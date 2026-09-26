import { Component, computed, inject, signal } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { KuiTextDirective, KuiTreeComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import type { KuiTreeNode } from '@kikita-labs/ui';

import { TreeSizeExamples } from './components';

/** Shows Tree's default, checkable, size, keyboard, lazy, and mobile behavior. */
@Component({
  selector: 'app-tree',
  imports: [
    KuiTextDirective,
    KuiTreeComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
    TreeSizeExamples,
  ],
  templateUrl: './tree.html',
  styleUrl: './tree.scss',
})
export class Tree {
  private readonly transloco = inject(TranslocoService);

  private readonly language = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  private readonly translationLoad = toSignal(
    this.transloco.events$.pipe(filter((event) => event.type === 'translationLoadSuccess')),
    { initialValue: null },
  );

  protected readonly value = signal<string | null>(null);
  protected readonly checkedIds = signal<string[]>(['checked-leaf']);
  protected readonly checkedExpandedIds = signal<string[]>(['check-group']);
  protected readonly lazyLoadComplete = signal(false);

  protected readonly displayNodes = computed<readonly KuiTreeNode[]>(() => [
    {
      id: 'workspace',
      label: this.label('tree.nodes.workspace'),
      icon: 'folder',
      children: [
        { id: 'documents', label: this.label('tree.nodes.documents'), icon: 'folder' },
        { id: 'changelog', label: this.label('tree.nodes.changelog'), icon: 'file' },
      ],
    },
    { id: 'readme', label: this.label('tree.nodes.readme'), icon: 'file' },
    { id: 'license', label: this.label('tree.nodes.license'), icon: 'file' },
  ]);

  protected readonly checkableNodes = computed<readonly KuiTreeNode[]>(() => [
    {
      id: 'check-group',
      label: this.label('tree.nodes.checkGroup'),
      icon: 'folder',
      children: [
        { id: 'checked-leaf', label: this.label('tree.nodes.checkedLeaf'), icon: 'file' },
        { id: 'open-leaf', label: this.label('tree.nodes.openLeaf'), icon: 'file' },
      ],
    },
    { id: 'disabled-leaf', label: this.label('tree.nodes.disabledLeaf'), disabled: true },
  ]);

  protected readonly lazyNodes = computed<readonly KuiTreeNode[]>(() => [
    {
      id: 'lazy-folder',
      label: this.label('tree.nodes.lazyFolder'),
      icon: 'folder',
      lazy: true,
    },
  ]);

  protected readonly selectedSummary = computed(() => {
    this.trackTranslationChanges();

    const selectedId = this.value();
    if (!selectedId) return this.transloco.translate('tree.status.noSelection');

    return this.transloco.translate('tree.status.selected', {
      label: this.transloco.translate(`tree.nodes.${selectedId}`),
    });
  });

  protected readonly lazyStatus = computed(() => {
    this.trackTranslationChanges();

    return this.transloco.translate(
      this.lazyLoadComplete() ? 'tree.status.lazyLoaded' : 'tree.status.lazyReady',
    );
  });

  protected readonly loadChildren = async (node: KuiTreeNode): Promise<readonly KuiTreeNode[]> => {
    await new Promise<void>((resolve) => setTimeout(resolve, 120));
    this.lazyLoadComplete.set(true);

    return [
      {
        id: `${node.id}-child-one`,
        label: this.label('tree.nodes.lazyChildOne'),
        icon: 'file',
      },
      {
        id: `${node.id}-child-two`,
        label: this.label('tree.nodes.lazyChildTwo'),
        icon: 'file',
      },
    ];
  };

  private label(key: string): string {
    this.trackTranslationChanges();

    return this.transloco.translate(key);
  }

  private trackTranslationChanges(): void {
    this.language();
    this.translationLoad();
  }
}
