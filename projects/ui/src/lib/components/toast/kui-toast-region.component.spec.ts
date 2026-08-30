import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { KuiToastRegionComponent } from './kui-toast-region.component';

describe('KuiToastRegionComponent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

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

  it('keeps a persistent toast open until its ref closes it', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(KuiToastRegionComponent);
    const ref = fixture.componentInstance.addToast({ title: 'Uploading', persistent: true });
    fixture.detectChanges();

    vi.advanceTimersByTime(10_000);
    expect(fixture.componentInstance._toasts()).toHaveLength(1);

    ref.close();
    vi.advanceTimersByTime(200);

    expect(fixture.componentInstance._toasts()).toHaveLength(0);
  });

  it('reacts to a persistent signal and starts the timer when it becomes false', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(KuiToastRegionComponent);
    const persistent = signal(true);
    const ref = fixture.componentInstance.addToast({ title: 'Syncing', persistent });
    fixture.detectChanges();

    persistent.set(false);
    fixture.detectChanges();
    vi.advanceTimersByTime(4_999);
    expect(fixture.componentInstance._toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(fixture.componentInstance._toasts()[0].closing()).toBe(true);

    vi.advanceTimersByTime(200);
    expect(fixture.componentInstance._toasts()).toHaveLength(0);
    ref.close();
  });

  it('updates a toast and re-evaluates its timer', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(KuiToastRegionComponent);
    const ref = fixture.componentInstance.addToast({ title: 'Uploading', persistent: true });
    fixture.detectChanges();

    ref.update({ title: 'Uploaded', appearance: 'success', persistent: false, duration: 1000 });
    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('.kui-toast') as HTMLElement;
    expect(toast.textContent).toContain('Uploaded');
    expect(toast.getAttribute('data-kui-appearance')).toBe('success');

    vi.advanceTimersByTime(1_000);
    vi.advanceTimersByTime(200);
    expect(fixture.componentInstance._toasts()).toHaveLength(0);
  });

  it('treats Infinity duration as persistent without scheduling an overflowing timer', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(KuiToastRegionComponent);
    const ref = fixture.componentInstance.addToast({ title: 'Waiting', duration: Infinity });
    fixture.detectChanges();

    vi.advanceTimersByTime(10_000);
    expect(fixture.componentInstance._toasts()).toHaveLength(1);

    ref.close();
    vi.advanceTimersByTime(200);
    expect(fixture.componentInstance._toasts()).toHaveLength(0);
  });

  it('pauses and resumes the progress animation with the timer', () => {
    const fixture = TestBed.createComponent(KuiToastRegionComponent);
    const ref = fixture.componentInstance.addToast({
      title: 'Saving',
      duration: 5_000,
      showProgress: true,
    });
    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('.kui-toast') as HTMLElement;
    const progress = toast.querySelector('.kui-toast-progress') as HTMLElement;
    expect(progress.style.animationPlayState).toBe('running');

    toast.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(progress.style.animationPlayState).toBe('paused');

    toast.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(progress.style.animationPlayState).toBe('running');

    ref.close();
  });

  it('dismisses all active toasts', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(KuiToastRegionComponent);
    fixture.componentInstance.addToast({ title: 'First', persistent: true });
    fixture.componentInstance.addToast({ title: 'Second', persistent: true });
    fixture.detectChanges();

    fixture.componentInstance.dismissAll();
    vi.advanceTimersByTime(200);

    expect(fixture.componentInstance._toasts()).toHaveLength(0);
  });
});
