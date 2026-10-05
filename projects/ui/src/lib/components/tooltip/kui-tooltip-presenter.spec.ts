import { Overlay } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { KUI_TOOLTIP_CLOSE_DELAY, KuiTooltipPresenter } from './kui-tooltip-presenter';

describe('KuiTooltipPresenter', () => {
  let anchor: HTMLElement;
  let presenter: KuiTooltipPresenter;

  beforeEach(() => {
    vi.useFakeTimers();
    anchor = document.createElement('button');
    document.body.append(anchor);
    presenter = new KuiTooltipPresenter({
      overlay: TestBed.inject(Overlay),
      document: TestBed.inject(DOCUMENT),
      placement: () => 'top',
      animateHide: false,
    });
    presenter.show(anchor, 'Text');
  });

  afterEach(() => {
    presenter.destroy();
    anchor.remove();
    vi.useRealTimers();
  });

  it('closes after the delay counted from the first request, however often it is repeated', () => {
    presenter.scheduleClose();
    for (let elapsed = 0; elapsed < KUI_TOOLTIP_CLOSE_DELAY; elapsed += 30) {
      vi.advanceTimersByTime(30);
      presenter.scheduleClose();
    }

    expect(presenter.isOpen).toBe(false);
  });

  it('stays open while a close is requested and then cancelled', () => {
    presenter.scheduleClose();
    vi.advanceTimersByTime(KUI_TOOLTIP_CLOSE_DELAY - 10);
    presenter.cancelClose();
    vi.advanceTimersByTime(KUI_TOOLTIP_CLOSE_DELAY);

    expect(presenter.isOpen).toBe(true);
  });

  it('does not close a pinned tooltip', () => {
    presenter.pin();
    presenter.scheduleClose();
    vi.advanceTimersByTime(KUI_TOOLTIP_CLOSE_DELAY * 2);

    expect(presenter.isOpen).toBe(true);
  });
});
