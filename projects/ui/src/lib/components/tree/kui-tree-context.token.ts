import { InjectionToken, Signal } from '@angular/core';

import { KuiTreeMode, KuiTreeNode } from './kui-tree-node.interface';

/** Aggregate checked state of a node, including the checkbox `indeterminate` case. */
export type KuiTreeCheckedState = 'true' | 'false' | 'mixed';

/** Shared context provided by KuiTreeComponent to recursive KuiTreeNodeComponent children. */
export interface KuiTreeContext {
  readonly mode: Signal<KuiTreeMode>;
  hasChildren(node: KuiTreeNode): boolean;
  childrenFor(node: KuiTreeNode): readonly KuiTreeNode[];
  isExpanded(id: string): boolean;
  isLoading(id: string): boolean;
  isSelected(id: string): boolean;
  isActive(id: string): boolean;
  checkedState(node: KuiTreeNode): KuiTreeCheckedState;
  onRowClick(node: KuiTreeNode): void;
  onToggleClick(node: KuiTreeNode, event: Event): void;
  onCheckboxClick(node: KuiTreeNode, event: Event): void;
  onKeydown(event: KeyboardEvent, node: KuiTreeNode): void;
}

/** Injection token used by tree nodes to access their parent tree's state and behavior. */
export const KUI_TREE_CONTEXT = new InjectionToken<KuiTreeContext>('KuiTreeContext');
