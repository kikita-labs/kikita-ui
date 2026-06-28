import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { KuiToastRegionComponent } from './kui-toast-region.component';

describe('KuiToastRegionComponent', () => {
  it('renders non-danger toasts as polite status messages', () => {
    const fixture = TestBed.createComponent(KuiToastRegionComponent);
    fixture.componentInstance.addToast({
      title: 'Saved',
      appearance: 'success',
      persistent: true,
    });
    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('.kui-toast') as HTMLElement;
    expect(toast.getAttribute('role')).toBe('status');
    expect(toast.getAttribute('aria-live')).toBe('polite');
  });

  it('renders danger toasts as assertive alerts', () => {
    const fixture = TestBed.createComponent(KuiToastRegionComponent);
    fixture.componentInstance.addToast({
      title: 'Failed',
      appearance: 'danger',
      persistent: true,
    });
    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('.kui-toast') as HTMLElement;
    expect(toast.getAttribute('role')).toBe('alert');
    expect(toast.getAttribute('aria-live')).toBe('assertive');
  });
});
