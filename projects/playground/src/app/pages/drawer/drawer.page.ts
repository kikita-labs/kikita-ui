import { Component, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  KUI_DRAWER_CONTEXT,
  KuiButtonDirective,
  KuiDrawerContext,
  KuiDrawerHost,
  KuiFieldComponent,
  KuiInputDirective,
  kuiDrawer,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

interface SettingsDrawerData {
  title: string;
}

type SettingsDrawerResult = 'saved' | 'cancelled';

@Component({
  selector: 'app-settings-drawer',
  template: `
    <div class="kui-drawer-header">
      <div class="kui-drawer-header-text">
        <h2 class="kui-drawer-title">{{ ctx.data.title }}</h2>
        <div class="kui-drawer-subtitle">{{ ctx.side }} · {{ ctx.size }}</div>
      </div>
      @if (ctx.closable) {
        <button
          class="kui-drawer-close"
          type="button"
          aria-label="Close drawer"
          (click)="ctx.close('cancelled')"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
      }
    </div>
    <div class="kui-drawer-body drawer-form">
      <kui-field label="Project">
        <input kuiInput type="text" value="Kikita UI" />
      </kui-field>
      <kui-field label="Owner">
        <input kuiInput type="email" value="nikita@kikita.dev" />
      </kui-field>
      <p>
        Drawer body owns the scroll area. Header and footer stay pinned while the middle content
        scrolls.
      </p>
      @for (item of filler; track item) {
        <div class="drawer-note">Audit item {{ item }}</div>
      }
    </div>
    <div class="kui-drawer-footer">
      <button kuiButton appearance="outline" type="button" (click)="ctx.close('cancelled')">
        Cancel
      </button>
      <button kuiButton type="button" (click)="ctx.close('saved')">Save</button>
    </div>
  `,
  imports: [KuiButtonDirective, KuiFieldComponent, KuiInputDirective],
  encapsulation: ViewEncapsulation.None,
})
export class SettingsDrawer implements KuiDrawerHost<SettingsDrawerResult, SettingsDrawerData> {
  public readonly drawerContext =
    inject<KuiDrawerContext<SettingsDrawerResult, SettingsDrawerData>>(KUI_DRAWER_CONTEXT);
  protected readonly ctx = this.drawerContext;
  protected readonly filler = Array.from({ length: 12 }, (_, i) => i + 1);
}

@Component({
  selector: 'app-action-sheet-drawer',
  template: `
    <div class="kui-drawer-header drawer-sheet-header">
      <div class="drawer-sheet-handle" aria-hidden="true"></div>
      <h2 class="kui-drawer-title">Actions</h2>
    </div>
    <div class="kui-drawer-body drawer-sheet-body">
      <button kuiButton appearance="ghost" type="button" (click)="ctx.close('copy')">Copy</button>
      <button kuiButton appearance="ghost" type="button" (click)="ctx.close('archive')">
        Archive
      </button>
      <button kuiButton appearance="ghost" type="button" (click)="ctx.close('delete')">
        Delete
      </button>
    </div>
  `,
  imports: [KuiButtonDirective],
  encapsulation: ViewEncapsulation.None,
})
export class ActionSheetDrawer implements KuiDrawerHost<string, void> {
  public readonly drawerContext = inject<KuiDrawerContext<string, void>>(KUI_DRAWER_CONTEXT);
  protected readonly ctx = this.drawerContext;
}

function injectSettingsDrawer(
  side: 'right' | 'left' | 'top' | 'bottom',
  size: 'sm' | 'md' | 'lg' | 'full',
  config?: { closeOnBackdropClick?: boolean; closeOnEscape?: boolean; closable?: boolean },
) {
  return kuiDrawer(SettingsDrawer, { side, size, ...config });
}

function injectActionSheetDrawer() {
  return kuiDrawer(ActionSheetDrawer, { side: 'bottom', size: 'sm' });
}

@Component({
  selector: 'app-drawer-page',
  templateUrl: './drawer.page.html',
  styleUrl: './drawer.page.scss',
  imports: [PlaygroundPanelComponent, KuiButtonDirective],
  encapsulation: ViewEncapsulation.None,
})
export class DrawerPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly openRightSm = injectSettingsDrawer('right', 'sm');
  private readonly openRightMd = injectSettingsDrawer('right', 'md');
  private readonly openRightLg = injectSettingsDrawer('right', 'lg');
  private readonly openLeftMd = injectSettingsDrawer('left', 'md');
  private readonly openTopMd = injectSettingsDrawer('top', 'md');
  private readonly openBottomMd = injectSettingsDrawer('bottom', 'md');
  private readonly openLocked = injectSettingsDrawer('right', 'md', {
    closeOnBackdropClick: false,
    closeOnEscape: false,
    closable: false,
  });
  private readonly openActionSheet = injectActionSheetDrawer();

  protected readonly lastResult = signal('none');

  protected showRightSm(): void {
    this.openRightSm({ title: 'Small settings' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.lastResult.set(result ?? 'undefined'));
  }

  protected showRightMd(): void {
    this.openRightMd({ title: 'Edit profile' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.lastResult.set(result ?? 'undefined'));
  }

  protected showRightLg(): void {
    this.openRightLg({ title: 'Task details' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.lastResult.set(result ?? 'undefined'));
  }

  protected showLeftMd(): void {
    this.openLeftMd({ title: 'Navigation' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.lastResult.set(result ?? 'undefined'));
  }

  protected showTopMd(): void {
    this.openTopMd({ title: 'Search drawer' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.lastResult.set(result ?? 'undefined'));
  }

  protected showBottomMd(): void {
    this.openBottomMd({ title: 'Filters' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.lastResult.set(result ?? 'undefined'));
  }

  protected showLocked(): void {
    this.openLocked({ title: 'Required action' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.lastResult.set(result ?? 'undefined'));
  }

  protected showActionSheet(): void {
    this.openActionSheet(undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.lastResult.set(result ?? 'undefined'));
  }
}
