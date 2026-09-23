import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PlaygroundExampleCard } from './playground-example-card';

@Component({
  imports: [PlaygroundExampleCard],
  template: `
    <app-playground-example-card heading="Button sizes">
      <button data-testid="example" type="button">Primary</button>
    </app-playground-example-card>
  `,
})
class PlaygroundExampleCardHost {}

describe('PlaygroundExampleCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundExampleCardHost],
    }).compileComponents();
  });

  it('renders the title in a compact Kikita UI card', () => {
    const fixture = TestBed.createComponent(PlaygroundExampleCardHost);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('article.kui-card') as HTMLElement;

    expect(card.getAttribute('data-kui-size')).toBe('sm');
    expect(card.querySelector('h2')?.textContent?.trim()).toBe('Button sizes');
  });

  it('projects the example content into the card', () => {
    const fixture = TestBed.createComponent(PlaygroundExampleCardHost);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="example"]')).toBeTruthy();
  });
});
