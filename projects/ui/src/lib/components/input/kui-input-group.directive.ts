import { Directive, ElementRef, HostListener, inject } from '@angular/core';

const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="link"]',
].join(',');

const CONTROL_SELECTOR = [
  'input:not(:disabled)',
  'textarea:not(:disabled)',
  'select:not(:disabled)',
].join(',');

/** Adds focus delegation behavior to `.kui-input-group` field chrome containers. */
@Directive({
  selector: '.kui-input-group',
})
export class KuiInputGroupDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('click', ['$event'])
  protected handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target || target.closest(INTERACTIVE_SELECTOR)) {
      return;
    }

    const control = this.host.nativeElement.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >(CONTROL_SELECTOR);

    control?.focus();
  }
}
