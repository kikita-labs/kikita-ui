import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KuiBadgeDirective } from '../components/badge';
import { KuiButtonDirective } from '../components/button';
import { KuiCalendarComponent } from '../components/calendar';
import { KuiCardDirective } from '../components/card';
import { KuiFieldComponent } from '../components/field';
import { KuiIconButtonDirective } from '../components/icon-button';
import { KuiInputDirective } from '../components/input';
import { KuiLoaderDirective } from '../components/loader';
import { KuiProgressComponent } from '../components/progress';
import { KuiTableDirective } from '../components/table';
import { kuiProvideButtonOptions } from '../tokens';
import { provideKikitaUi } from './provide-kikita-ui';

@Component({
  imports: [
    KuiBadgeDirective,
    KuiButtonDirective,
    KuiCalendarComponent,
    KuiCardDirective,
    KuiFieldComponent,
    KuiIconButtonDirective,
    KuiInputDirective,
    KuiLoaderDirective,
    KuiProgressComponent,
    KuiTableDirective,
  ],
  template: `
    <button kuiButton>Save</button>
    <button kuiIconButton aria-label="Settings"></button>
    <span kuiBadge>Status</span>
    <section kuiCard>Card</section>
    <span kuiLoader></span>
    <table kuiTable></table>
    <kui-progress />
    <kui-calendar />
    <kui-field label="Email">
      <input kuiInput />
    </kui-field>
  `,
})
class GlobalDefaultsHost {}

describe('Kikita UI root defaults', () => {
  it('applies root size defaults to size-enabled primitives when local size is omitted', () => {
    TestBed.configureTestingModule({
      imports: [GlobalDefaultsHost],
      providers: [
        provideKikitaUi({ defaults: { size: 'sm' } }),
        kuiProvideButtonOptions({
          button: { shape: 'ghost' },
          iconButton: { shape: 'outline' },
        }),
      ],
    });

    const fixture = TestBed.createComponent(GlobalDefaultsHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const attrs = (selector: string) => host.querySelector<HTMLElement>(selector)!;

    expect(attrs('button.kui-button').getAttribute('data-kui-size')).toBe('sm');
    expect(attrs('button.kui-button').getAttribute('data-kui-shape')).toBe('ghost');
    expect(attrs('button.kui-icon-button').getAttribute('data-kui-size')).toBe('sm');
    expect(attrs('button.kui-icon-button').getAttribute('data-kui-shape')).toBe('outline');
    expect(attrs('[kuiBadge]').getAttribute('data-kui-size')).toBe('sm');
    expect(attrs('[kuiCard]').getAttribute('data-kui-size')).toBe('sm');
    expect(attrs('[kuiLoader]').getAttribute('data-kui-size')).toBe('sm');
    expect(attrs('table[kuiTable]').getAttribute('data-kui-size')).toBe('sm');
    expect(attrs('kui-progress').getAttribute('data-kui-size')).toBe('sm');
    expect(attrs('kui-calendar').getAttribute('data-kui-size')).toBe('sm');
    expect(attrs('kui-field').getAttribute('data-kui-size')).toBe('sm');
    expect(attrs('input[kuiInput]').getAttribute('data-kui-size')).toBe('sm');
  });
});
