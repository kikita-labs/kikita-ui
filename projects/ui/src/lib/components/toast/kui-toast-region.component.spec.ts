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

  describe('reactive lifecycle', () => {
    function open(config: Parameters<KuiToastRegionComponent['addToast']>[0]) {
      const fixture = TestBed.createComponent(KuiToastRegionComponent);
      const ref = fixture.componentInstance.addToast(config);
      fixture.detectChanges();
      return { fixture, ref, region: fixture.componentInstance };
    }

    it('keeps the remaining time when a persistent signal pauses and resumes the timer', () => {
      vi.useFakeTimers();
      const persistent = signal(false);
      const { fixture, region } = open({ title: 'Sync', duration: 5_000, persistent });

      vi.advanceTimersByTime(3_000);
      persistent.set(true);
      fixture.detectChanges();
      vi.advanceTimersByTime(60_000);
      expect(region._toasts()[0].closing()).toBe(false);

      persistent.set(false);
      fixture.detectChanges();
      vi.advanceTimersByTime(1_999);
      expect(region._toasts()[0].closing()).toBe(false);
      vi.advanceTimersByTime(1);
      expect(region._toasts()[0].closing()).toBe(true);
    });

    it('does not restart the timer on pointer leave while a signal keeps the toast persistent', () => {
      vi.useFakeTimers();
      const persistent = signal(false);
      const { fixture, region } = open({ title: 'Sync', duration: 5_000, persistent });

      persistent.set(true);
      fixture.detectChanges();
      const toast = fixture.nativeElement.querySelector('.kui-toast') as HTMLElement;
      toast.dispatchEvent(new Event('mouseenter'));
      toast.dispatchEvent(new Event('mouseleave'));
      vi.advanceTimersByTime(60_000);

      expect(region._toasts()[0].closing()).toBe(false);
    });

    it('detaches the previous signal when update() supplies a replacement', () => {
      vi.useFakeTimers();
      const first = signal(true);
      const second = signal(true);
      const { fixture, ref, region } = open({ title: 'Sync', duration: 2_000, persistent: first });

      ref.update({ persistent: second });
      fixture.detectChanges();
      first.set(false);
      fixture.detectChanges();
      vi.advanceTimersByTime(60_000);
      expect(region._toasts()[0].closing()).toBe(false);

      second.set(false);
      fixture.detectChanges();
      vi.advanceTimersByTime(2_000);
      expect(region._toasts()[0].closing()).toBe(true);
    });

    it('lets an explicit update replace a signal binding with a static value', () => {
      vi.useFakeTimers();
      const persistent = signal(true);
      const { fixture, ref, region } = open({ title: 'Sync', duration: 2_000, persistent });

      ref.update({ persistent: false });
      persistent.set(true);
      fixture.detectChanges();
      vi.advanceTimersByTime(2_000);

      expect(region._toasts()[0].closing()).toBe(true);
    });

    it('does not create duplicate timers across repeated toggles', () => {
      vi.useFakeTimers();
      const persistent = signal(true);
      const { fixture, region } = open({ title: 'Sync', duration: 1_000, persistent });

      for (let i = 0; i < 5; i++) {
        persistent.set(false);
        fixture.detectChanges();
        persistent.set(true);
        fixture.detectChanges();
      }
      expect(vi.getTimerCount()).toBe(0);

      persistent.set(false);
      fixture.detectChanges();
      expect(vi.getTimerCount()).toBe(1);
      vi.advanceTimersByTime(1_000);
      expect(region._toasts()[0].closing()).toBe(true);
    });

    it('falls back to the default duration when update() sets duration to undefined', () => {
      vi.useFakeTimers();
      const fixture = TestBed.createComponent(KuiToastRegionComponent);
      const region = fixture.componentInstance;
      const ref = region.addToast({ title: 'Sync', duration: 10_000 }, 3_000);
      fixture.detectChanges();

      ref.update({ duration: undefined });
      vi.advanceTimersByTime(3_000);

      expect(region._toasts()[0].closing()).toBe(true);
    });

    it('ignores updates after the toast is dismissed', () => {
      vi.useFakeTimers();
      const { ref, region } = open({ title: 'Sync', persistent: true });

      ref.close();
      ref.update({ persistent: false, duration: 100 });
      vi.advanceTimersByTime(200);

      expect(region._toasts()).toHaveLength(0);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('clears timers and completes subscriptions when the region is destroyed', () => {
      vi.useFakeTimers();
      const persistent = signal(false);
      const { fixture, ref } = open({ title: 'Sync', duration: 5_000, persistent });
      let completed = false;
      ref.closed$.subscribe({ complete: () => (completed = true) });

      fixture.destroy();

      expect(vi.getTimerCount()).toBe(0);
      expect(completed).toBe(true);
    });
  });
});
