import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { appConfig } from './app.config';

describe('App', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers, provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the English shell by default', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpTesting.expectOne('/i18n/en.json').flush({
      playground: {
        title: 'Kikita UI playground',
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Kikita UI playground');
  });

  it('switches the shell to Russian at runtime', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpTesting.expectOne('/i18n/en.json').flush({
      playground: {
        title: 'Kikita UI playground',
      },
    });
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const russianLanguage = compiled.querySelector<HTMLInputElement>('input[value="ru"]');
    russianLanguage?.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    httpTesting.expectOne('/i18n/ru.json').flush({
      playground: {
        title: '\u041f\u0435\u0441\u043e\u0447\u043d\u0438\u0446\u0430 Kikita UI',
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      '\u041f\u0435\u0441\u043e\u0447\u043d\u0438\u0446\u0430 Kikita UI',
    );
  });
});
