import { Component, PLATFORM_ID, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { kuiProvideButtonOptions } from '../../tokens';
import { provideKuiIcons } from '../icon';
import { KuiIconButtonDirective } from './kui-icon-button.directive';

const CLOSE_ICON = '<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" /></svg>';
const CHECK_ICON = '<svg viewBox="0 0 16 16"><path d="M3 8l3 3 7-7" /></svg>';

@Component({
  imports: [KuiIconButtonDirective],
  template:
    '<button kuiIconButton shape="soft" appearance="warning" size="xs" aria-label="Settings"></button>',
})
class IconButtonHost {}

@Component({
  imports: [KuiIconButtonDirective],
  template: '<button kuiIconButton aria-label="Settings"></button>',
})
class DefaultIconButtonHost {}

@Component({
  imports: [KuiIconButtonDirective],
  template: '<a kuiIconButton disabled href="/blocked" aria-label="Blocked"></a>',
})
class DisabledIconAnchorHost {}

@Component({
  imports: [KuiIconButtonDirective],
  template: '<button kuiIconButton [icon]="iconName()" aria-label="Close"></button>',
})
class IconInputHost {
  protected readonly iconName = signal<string | undefined>('close');
}

describe('KuiIconButtonDirective', () => {
  it('adds icon button host attributes for appearance and size', () => {
    const fixture = createFixture(IconButtonHost);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.classList.contains('kui-icon-button')).toBe(true);
    expect(button.getAttribute('data-kui-shape')).toBe('soft');
    expect(button.getAttribute('data-kui-appearance')).toBe('warning');
    expect(button.getAttribute('data-kui-size')).toBe('xs');
    expect(button.getAttribute('aria-label')).toBe('Settings');
  });

  it('uses scoped icon button option defaults when local inputs are omitted', () => {
    TestBed.configureTestingModule({
      imports: [DefaultIconButtonHost],
      providers: [
        kuiProvideButtonOptions({
          iconButton: { shape: 'outline', appearance: 'success', size: 'sm' },
        }),
      ],
    });

    const fixture = TestBed.createComponent(DefaultIconButtonHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.getAttribute('data-kui-shape')).toBe('outline');
    expect(button.getAttribute('data-kui-appearance')).toBe('success');
    expect(button.getAttribute('data-kui-size')).toBe('sm');
  });

  it('marks disabled anchor icon buttons as aria-disabled and prevents clicks', () => {
    const fixture = createFixture(DisabledIconAnchorHost);

    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const allowed = anchor.dispatchEvent(event);

    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(anchor.getAttribute('tabindex')).toBe('-1');
    expect(anchor.hasAttribute('disabled')).toBe(false);
    expect(allowed).toBe(false);
  });

  it('renders and updates a kui-icon from the icon input', async () => {
    TestBed.configureTestingModule({
      imports: [IconInputHost],
      providers: [provideKuiIcons({ close: CLOSE_ICON, check: CHECK_ICON })],
    });

    const fixture = TestBed.createComponent(IconInputHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.querySelector('kui-icon svg path')?.getAttribute('d')).toContain('M4 4');

    fixture.componentInstance['iconName'].set('check');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(button.querySelectorAll('kui-icon').length).toBe(1);
    expect(button.querySelector('kui-icon svg path')?.getAttribute('d')).toContain('M3 8');

    fixture.componentInstance['iconName'].set(undefined);
    fixture.detectChanges();

    expect(button.querySelector('kui-icon')).toBeNull();
  });

  it('does not mutate the DOM for icon when rendered on the server platform', () => {
    TestBed.configureTestingModule({
      imports: [IconInputHost],
      providers: [
        provideKuiIcons({ close: CLOSE_ICON, check: CHECK_ICON }),
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const fixture = TestBed.createComponent(IconInputHost);

    expect(() => fixture.detectChanges()).not.toThrow();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.querySelector('kui-icon')).toBeNull();
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
