import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiTextDirective } from './kui-text.directive';
import type { KuiTextTone } from './kui-text-tone.type';
import type { KuiTextVariant } from './kui-text-variant.type';

@Component({
  imports: [KuiTextDirective],
  template: '<p kuiText [variant]="variant()" [tone]="tone()">Copy</p>',
})
class TextHost {
  readonly variant = signal<KuiTextVariant>('heading-md');
  readonly tone = signal<KuiTextTone>('muted');
}

describe('KuiTextDirective', () => {
  it('applies typography role and tone classes', () => {
    const fixture = createFixture(TextHost);

    const text = fixture.nativeElement.querySelector('p') as HTMLParagraphElement;

    expect(text.classList.contains('kui-heading-md')).toBe(true);
    expect(text.classList.contains('kui-text-muted')).toBe(true);
    expect(text.dataset['kuiTextVariant']).toBe('heading-md');
    expect(text.dataset['kuiTextTone']).toBe('muted');
  });

  it('updates classes when inputs change', () => {
    const fixture = createFixture(TextHost);
    const text = fixture.nativeElement.querySelector('p') as HTMLParagraphElement;

    fixture.componentInstance.variant.set('caption');
    fixture.componentInstance.tone.set('danger');
    fixture.detectChanges();

    expect(text.classList.contains('kui-heading-md')).toBe(false);
    expect(text.classList.contains('kui-text-muted')).toBe(false);
    expect(text.classList.contains('kui-caption')).toBe(true);
    expect(text.classList.contains('kui-text-danger')).toBe(true);
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
