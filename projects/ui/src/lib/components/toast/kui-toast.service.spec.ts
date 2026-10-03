import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { KuiDefaults } from '../../providers/kui-defaults.service';
import { KuiToastService } from './kui-toast.service';

describe('KuiToastService', () => {
  let service: KuiToastService | undefined;

  afterEach(() => {
    service?.dismissAll();
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('dismisses a toast by its reference id', () => {
    vi.useFakeTimers();
    service = TestBed.inject(KuiToastService);
    const ref = service.open({ title: 'Persistent notification', persistent: true });
    TestBed.inject(ApplicationRef).tick();

    expect(ref.id).toBeTypeOf('number');
    expect(document.querySelector('.kui-toast')).not.toBeNull();

    service.dismiss(ref.id);
    vi.advanceTimersByTime(200);
    TestBed.inject(ApplicationRef).tick();

    expect(document.querySelector('.kui-toast')).toBeNull();
  });

  it('dismisses all toasts created by the service', () => {
    vi.useFakeTimers();
    service = TestBed.inject(KuiToastService);
    service.open({ title: 'First', persistent: true });
    service.open({ title: 'Second', persistent: true });
    TestBed.inject(ApplicationRef).tick();

    service.dismissAll();
    vi.advanceTimersByTime(200);
    TestBed.inject(ApplicationRef).tick();

    expect(document.querySelectorAll('.kui-toast')).toHaveLength(0);
  });

  describe('region defaults', () => {
    function region(): HTMLElement {
      return document.body.querySelector('.kui-toast-region') as HTMLElement;
    }

    it('moves the region when the position default changes at runtime', () => {
      vi.useFakeTimers();
      service = TestBed.inject(KuiToastService);
      const defaults = TestBed.inject(KuiDefaults);
      service.open({ title: 'One', persistent: true });
      TestBed.inject(ApplicationRef).tick();
      expect(region().getAttribute('data-position')).toBe('bottom-center');

      defaults.set('toast', { position: 'top-end' });
      TestBed.inject(ApplicationRef).tick();

      expect(region().getAttribute('data-position')).toBe('top-end');
    });

    it('applies a changed maxVisible default to the next toast', () => {
      vi.useFakeTimers();
      service = TestBed.inject(KuiToastService);
      const defaults = TestBed.inject(KuiDefaults);
      service.open({ title: 'One', persistent: true });
      defaults.set('toast', { maxVisible: 1 });
      TestBed.inject(ApplicationRef).tick();

      service.open({ title: 'Two', persistent: true });
      TestBed.inject(ApplicationRef).tick();
      vi.advanceTimersByTime(200);
      TestBed.inject(ApplicationRef).tick();

      expect(document.body.querySelectorAll('.kui-toast')).toHaveLength(1);
    });

    it('keeps a setPosition call until the position default changes again', () => {
      vi.useFakeTimers();
      service = TestBed.inject(KuiToastService);
      const defaults = TestBed.inject(KuiDefaults);
      service.open({ title: 'One', persistent: true });
      service.setPosition('top-start');
      defaults.set('toast', { duration: 1000 });
      TestBed.inject(ApplicationRef).tick();
      expect(region().getAttribute('data-position')).toBe('top-start');

      defaults.set('toast', { position: 'bottom-end' });
      TestBed.inject(ApplicationRef).tick();
      expect(region().getAttribute('data-position')).toBe('bottom-end');
    });
  });
});
