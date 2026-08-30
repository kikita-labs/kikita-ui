import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { afterEach, describe, expect, it, vi } from 'vitest';

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
});
