import { DOCUMENT } from '@angular/common';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { appConfig } from '@app/app.config';

import { PlaygroundShell } from './playground-shell';

describe('PlaygroundShell', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundShell],
      providers: [...appConfig.providers, provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('generates the theme stylesheet after rendering and starts in dark mode', async () => {
    const fixture = TestBed.createComponent(PlaygroundShell);
    fixture.detectChanges();
    httpTesting.expectOne('/i18n/en.json').flush({ playground: { title: 'Kikita UI' } });
    await fixture.whenStable();
    fixture.detectChanges();

    const document = TestBed.inject(DOCUMENT);
    expect(document.documentElement.getAttribute('data-kui-theme')).toBe('dark');
    expect(document.head.querySelector('#playground-theme')?.textContent).toContain(
      '--kui-seed-primary',
    );
  });
});
