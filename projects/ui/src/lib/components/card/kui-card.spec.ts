import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiCard } from './kui-card';

@Component({
  imports: [KuiCard],
  template: '<article kuiCard appearance="elevated" interactive>Card</article>',
})
class CardHost {}

describe('KuiCard', () => {
  it('adds card host attributes for appearance and interactivity', () => {
    const fixture = createFixture(CardHost);

    const card = fixture.nativeElement.querySelector('article') as HTMLElement;

    expect(card.classList.contains('kui-card')).toBe(true);
    expect(card.getAttribute('data-kui-appearance')).toBe('elevated');
    expect(card.hasAttribute('data-kui-interactive')).toBe(true);
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
