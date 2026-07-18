import { Component, PLATFORM_ID, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { provideKikitaUi } from '../../providers';
import { kuiProvideButtonOptions } from '../../tokens';
import { provideKuiIcons } from '../icon';
import { KuiButtonDirective } from './kui-button.directive';

const CHECK_ICON = '<svg viewBox="0 0 16 16"><path d="M3 8l3 3 7-7" /></svg>';
const ARROW_ICON = '<svg viewBox="0 0 16 16"><path d="M2 8h12M9 3l5 5-5 5" /></svg>';

@Component({
  imports: [KuiButtonDirective],
  template: '<button kuiButton shape="soft" appearance="success" size="sm" wrap>Save</button>',
})
class ButtonHost {}

@Component({
  imports: [KuiButtonDirective],
  template: '<button kuiButton>Save</button>',
})
class DefaultButtonHost {}

@Component({
  imports: [KuiButtonDirective],
  template: '<button kuiButton shape="outline" appearance="danger" size="lg">Delete</button>',
})
class ExplicitButtonHost {}

@Component({
  imports: [KuiButtonDirective],
  template: '<a kuiButton disabled href="/blocked">Blocked</a>',
})
class DisabledAnchorHost {}

@Component({
  imports: [KuiButtonDirective],
  template: '<button kuiButton size="lg" [loading]="true">Save</button>',
})
class LoadingButtonHost {}

@Component({
  imports: [KuiButtonDirective],
  template: '<button kuiButton [iconStart]="startIcon()" [iconEnd]="endIcon()">Continue</button>',
})
class IconSlotButtonHost {
  protected readonly startIcon = signal<string | undefined>('check');
  protected readonly endIcon = signal<string | undefined>('arrow');
}

describe('KuiButtonDirective', () => {
  it('adds button host attributes for appearance and size', () => {
    const fixture = createFixture(ButtonHost);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.classList.contains('kui-button')).toBe(true);
    expect(button.getAttribute('data-kui-shape')).toBe('soft');
    expect(button.getAttribute('data-kui-appearance')).toBe('success');
    expect(button.getAttribute('data-kui-size')).toBe('sm');
    expect(button.hasAttribute('data-kui-wrap')).toBe(true);
  });

  it('uses scoped button option defaults when local inputs are omitted', () => {
    TestBed.configureTestingModule({
      imports: [DefaultButtonHost],
      providers: [
        kuiProvideButtonOptions({
          button: { shape: 'ghost', appearance: 'success', size: 'sm' },
        }),
      ],
    });

    const fixture = TestBed.createComponent(DefaultButtonHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.getAttribute('data-kui-shape')).toBe('ghost');
    expect(button.getAttribute('data-kui-appearance')).toBe('success');
    expect(button.getAttribute('data-kui-size')).toBe('sm');
  });

  it('lets explicit button inputs override scoped option defaults', () => {
    TestBed.configureTestingModule({
      imports: [ExplicitButtonHost],
      providers: [
        kuiProvideButtonOptions({
          button: { shape: 'ghost', appearance: 'success', size: 'sm' },
        }),
      ],
    });

    const fixture = TestBed.createComponent(ExplicitButtonHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.getAttribute('data-kui-shape')).toBe('outline');
    expect(button.getAttribute('data-kui-appearance')).toBe('danger');
    expect(button.getAttribute('data-kui-size')).toBe('lg');
  });

  it('uses root size defaults when scoped button options do not set size', () => {
    TestBed.configureTestingModule({
      imports: [DefaultButtonHost],
      providers: [provideKikitaUi({ defaults: { size: 'sm' } })],
    });

    const fixture = TestBed.createComponent(DefaultButtonHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.getAttribute('data-kui-shape')).toBe('solid');
    expect(button.getAttribute('data-kui-size')).toBe('sm');
  });

  it('marks disabled anchors as aria-disabled and prevents click navigation', () => {
    const fixture = createFixture(DisabledAnchorHost);

    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const allowed = anchor.dispatchEvent(event);

    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(anchor.getAttribute('tabindex')).toBe('-1');
    expect(anchor.hasAttribute('disabled')).toBe(false);
    expect(allowed).toBe(false);
  });

  it('renders a loader, marks the button busy and blocks clicks while loading', () => {
    const fixture = createFixture(LoadingButtonHost);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const loader = button.querySelector('.kui-loader') as HTMLElement;
    const content = button.querySelector('.kui-button__content') as HTMLElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const allowed = button.dispatchEvent(event);

    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('disabled')).toBe('');
    expect(loader).not.toBeNull();
    expect(loader.getAttribute('data-kui-size')).toBe('lg');
    expect(content.textContent?.trim()).toBe('Save');
    expect(allowed).toBe(false);
  });

  it('renders iconStart and iconEnd around the projected content and updates reactively', async () => {
    TestBed.configureTestingModule({
      imports: [IconSlotButtonHost],
      providers: [provideKuiIcons({ check: CHECK_ICON, arrow: ARROW_ICON })],
    });

    const fixture = TestBed.createComponent(IconSlotButtonHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const content = button.querySelector('.kui-button__content') as HTMLElement;
    const icons = [...content.querySelectorAll('kui-icon')];

    expect(icons).toHaveLength(2);
    expect(icons[0].classList.contains('kui-button__icon-start')).toBe(true);
    expect(icons[1].classList.contains('kui-button__icon-end')).toBe(true);
    expect(content.textContent?.trim()).toBe('Continue');

    fixture.componentInstance['startIcon'].set(undefined);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(content.querySelectorAll('kui-icon')).toHaveLength(1);
    expect(content.querySelector('kui-icon')?.classList.contains('kui-button__icon-end')).toBe(
      true,
    );
  });

  it('does not mutate the DOM for iconStart/iconEnd when rendered on the server platform', () => {
    TestBed.configureTestingModule({
      imports: [IconSlotButtonHost],
      providers: [
        provideKuiIcons({ check: CHECK_ICON, arrow: ARROW_ICON }),
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const fixture = TestBed.createComponent(IconSlotButtonHost);

    expect(() => fixture.detectChanges()).not.toThrow();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.querySelector('.kui-button__content')).toBeNull();
    expect(button.querySelector('kui-icon')).toBeNull();
    expect(button.textContent?.trim()).toBe('Continue');
  });
});

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [component],
  });

  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();

  return fixture;
}
