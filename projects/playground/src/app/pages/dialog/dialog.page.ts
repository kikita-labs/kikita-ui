import { Component, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  KUI_DIALOG_CONTEXT,
  KuiButtonDirective,
  KuiDialogContext,
  KuiDialogHost,
  KuiIconComponent,
  KuiInputDirective,
  KuiTextareaDirective,
  KuiFieldComponent,
  kuiDialog,
  kuiConfirm,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

// ── Demo dialog: basic form ────────────────────────────────────────────────

interface EditData {
  name: string;
}
type EditResult = 'saved' | null;

@Component({
  selector: 'app-edit-dialog',
  template: `
    <div class="kui-dialog-header">
      <h2 class="kui-dialog-title">Edit profile</h2>
      @if (ctx.closable) {
        <button class="kui-dialog-close" type="button" aria-label="Close" (click)="ctx.close(null)">
          <kui-icon name="x" />
        </button>
      }
    </div>
    <div class="kui-dialog-body" style="display:flex;flex-direction:column;gap:16px">
      <kui-field label="Name">
        <input kuiInput type="text" [value]="ctx.data.name" placeholder="Enter name" />
      </kui-field>
      <kui-field label="Email">
        <input kuiInput type="email" placeholder="name@company.com" />
      </kui-field>
    </div>
    <div class="kui-dialog-footer">
      <button kuiButton shape="outline" type="button" (click)="ctx.close(null)">Cancel</button>
      <button kuiButton type="button" (click)="ctx.close('saved')">Save</button>
    </div>
  `,
  imports: [KuiButtonDirective, KuiInputDirective, KuiFieldComponent, KuiIconComponent],
  encapsulation: ViewEncapsulation.None,
})
export class EditDialog implements KuiDialogHost<EditResult, EditData> {
  public readonly dialogContext =
    inject<KuiDialogContext<EditResult, EditData>>(KUI_DIALOG_CONTEXT);
  protected readonly ctx = this.dialogContext;
}

// ── Demo dialog: destructive ───────────────────────────────────────────────

@Component({
  selector: 'app-delete-dialog',
  template: `
    <div class="kui-dialog-header">
      <svg class="kui-dialog-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 3L2.5 16.5h15L10 3z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
        <line
          x1="10"
          y1="9"
          x2="10"
          y2="12.5"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
        <circle cx="10" cy="14.5" r="0.75" fill="currentColor" />
      </svg>
      <h2 class="kui-dialog-title">Delete account?</h2>
      @if (ctx.closable) {
        <button
          class="kui-dialog-close"
          type="button"
          aria-label="Close"
          (click)="ctx.close(false)"
        >
          <kui-icon name="x" />
        </button>
      }
    </div>
    <div class="kui-dialog-body">
      This action is irreversible. All account data will be permanently removed.
    </div>
    <div class="kui-dialog-footer">
      <button kuiButton shape="outline" type="button" (click)="ctx.close(false)">Cancel</button>
      <button kuiButton appearance="danger" type="button" (click)="ctx.close(true)">Delete</button>
    </div>
  `,
  imports: [KuiButtonDirective, KuiIconComponent],
  encapsulation: ViewEncapsulation.None,
})
export class DeleteDialog implements KuiDialogHost<boolean, void> {
  public readonly dialogContext = inject<KuiDialogContext<boolean, void>>(KUI_DIALOG_CONTEXT);
  protected readonly ctx = this.dialogContext;
}

// ── Demo dialog: long body ─────────────────────────────────────────────────

@Component({
  selector: 'app-long-body-dialog',
  template: `
    <div class="kui-dialog-header">
      <h2 class="kui-dialog-title">Terms of service</h2>
      <button class="kui-dialog-close" type="button" aria-label="Close" (click)="ctx.close()">
        <kui-icon name="x" />
      </button>
    </div>
    <div class="kui-dialog-body">
      @for (i of items; track i) {
        <p style="margin-bottom:12px">
          Section {{ i }}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
      }
    </div>
    <div class="kui-dialog-footer">
      <button kuiButton shape="outline" type="button" (click)="ctx.close()">Close</button>
    </div>
  `,
  imports: [KuiButtonDirective, KuiIconComponent],
  encapsulation: ViewEncapsulation.None,
})
export class LongBodyDialog implements KuiDialogHost<void, void> {
  public readonly dialogContext = inject<KuiDialogContext<void, void>>(KUI_DIALOG_CONTEXT);
  protected readonly ctx = this.dialogContext;
  protected readonly items = Array.from({ length: 20 }, (_, i) => i + 1);
}

// ── Demo dialog: auto size (textarea resize demo) ─────────────────────────

@Component({
  selector: 'app-auto-dialog',
  template: `
    <div class="kui-dialog-header">
      <h2 class="kui-dialog-title">auto - content-sized</h2>
      @if (ctx.closable) {
        <button class="kui-dialog-close" type="button" aria-label="Close" (click)="ctx.close(null)">
          <kui-icon name="x" />
        </button>
      }
    </div>
    <div class="kui-dialog-body" style="display:flex;flex-direction:column;gap:16px">
      <kui-field label="Subject">
        <input kuiInput type="text" placeholder="Enter message subject" />
      </kui-field>
      <kui-field label="Message" hint="Drag the corner - the dialog grows with the textarea">
        <textarea kuiTextarea rows="4" placeholder="Message text..." style="resize:both"></textarea>
      </kui-field>
    </div>
    <div class="kui-dialog-footer">
      <button kuiButton shape="outline" type="button" (click)="ctx.close(null)">Cancel</button>
      <button kuiButton type="button" (click)="ctx.close('sent')">Send</button>
    </div>
  `,
  imports: [
    KuiButtonDirective,
    KuiInputDirective,
    KuiTextareaDirective,
    KuiFieldComponent,
    KuiIconComponent,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AutoDialog implements KuiDialogHost<'sent' | null, void> {
  public readonly dialogContext = inject<KuiDialogContext<'sent' | null, void>>(KUI_DIALOG_CONTEXT);
  protected readonly ctx = this.dialogContext;
}

// ── Demo dialog: no dismiss ────────────────────────────────────────────────

@Component({
  selector: 'app-nodismiss-dialog',
  template: `
    <div class="kui-dialog-header">
      <h2 class="kui-dialog-title">Required action</h2>
    </div>
    <div class="kui-dialog-body">
      This dialog cannot be closed by backdrop click or Escape. The user must choose one of the
      options.
    </div>
    <div class="kui-dialog-footer">
      <button kuiButton shape="outline" type="button" (click)="ctx.close('cancel')">Later</button>
      <button kuiButton type="button" (click)="ctx.close('confirm')">Confirm</button>
    </div>
  `,
  imports: [KuiButtonDirective],
  encapsulation: ViewEncapsulation.None,
})
export class NoDismissDialog implements KuiDialogHost<'confirm' | 'cancel', void> {
  public readonly dialogContext =
    inject<KuiDialogContext<'confirm' | 'cancel', void>>(KUI_DIALOG_CONTEXT);
  protected readonly ctx = this.dialogContext;
}

// ── Helper inject functions ────────────────────────────────────────────────

function injectEditDialog() {
  return kuiDialog(EditDialog, { size: 'md' });
}
function injectAutoDialog() {
  return kuiDialog(AutoDialog, { size: 'auto' });
}
function injectEditDialogSm() {
  return kuiDialog(EditDialog, { size: 'sm' });
}
function injectEditDialogLg() {
  return kuiDialog(EditDialog, { size: 'lg' });
}
function injectDeleteDialog() {
  return kuiDialog(DeleteDialog, { size: 'sm', appearance: 'danger' });
}
function injectLongBodyDialog() {
  return kuiDialog(LongBodyDialog, { size: 'md' });
}
function injectNoDismissDialog() {
  return kuiDialog(NoDismissDialog, { size: 'sm', dismissable: false, closable: false });
}
function injectEditDialogNoClose() {
  return kuiDialog(EditDialog, { size: 'md', closable: false });
}

// ── Page ──────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-dialog-page',
  templateUrl: './dialog.page.html',
  styleUrl: './dialog.page.scss',
  imports: [PlaygroundPanelComponent, KuiButtonDirective],
  encapsulation: ViewEncapsulation.None,
})
export class DialogPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly openEditAuto = injectAutoDialog();
  private readonly openEditSm = injectEditDialogSm();
  private readonly openEditMd = injectEditDialog();
  private readonly openEditLg = injectEditDialogLg();
  private readonly openDelete = injectDeleteDialog();
  private readonly openLongBody = injectLongBodyDialog();
  private readonly openNoDismiss = injectNoDismissDialog();
  private readonly openEditNoClose = injectEditDialogNoClose();
  private readonly confirm = kuiConfirm();

  protected readonly resultSizes = signal<string>('—');
  protected readonly resultDelete = signal<string>('—');
  protected readonly resultNoDismiss = signal<string>('—');
  protected readonly resultNoClose = signal<string>('—');
  protected readonly resultConfirm = signal<string>('—');

  protected showEditAuto(): void {
    this.openEditAuto(undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.resultSizes.set(r ?? 'undefined'));
  }

  protected showEditSm(): void {
    this.openEditSm({ name: 'Alex Smith' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.resultSizes.set(r ?? 'undefined'));
  }

  protected showEditMd(): void {
    this.openEditMd({ name: 'Alex Smith' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.resultSizes.set(r ?? 'undefined'));
  }

  protected showEditLg(): void {
    this.openEditLg({ name: 'Alex Smith' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.resultSizes.set(r ?? 'undefined'));
  }

  protected showDelete(): void {
    this.openDelete(undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.resultDelete.set(String(r)));
  }

  protected showLongBody(): void {
    this.openLongBody(undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {});
  }

  protected showNoDismiss(): void {
    this.openNoDismiss(undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.resultNoDismiss.set(r ?? 'undefined'));
  }

  protected showNoClose(): void {
    this.openEditNoClose({ name: 'Alex Smith' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.resultNoClose.set(r ?? 'undefined'));
  }

  protected showConfirmDefault(): void {
    this.confirm({ title: 'Confirm action?', message: 'This action runs immediately.' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.resultConfirm.set(String(r)));
  }

  protected showConfirmDanger(): void {
    this.confirm({
      title: 'Delete record?',
      message: 'This action cannot be undone.',
      appearance: 'danger',
      confirmLabel: 'Delete',
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.resultConfirm.set(String(r)));
  }

  protected showConfirmWarning(): void {
    this.confirm({
      title: 'Reset settings?',
      message: 'All custom settings will return to their defaults.',
      appearance: 'warning',
      confirmLabel: 'Reset',
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.resultConfirm.set(String(r)));
  }
}
