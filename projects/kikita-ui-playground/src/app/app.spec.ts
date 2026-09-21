import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KUI_LOCALE } from '@kikita-labs/ui';

import { App } from './app';
import { appConfig } from './app.config';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: LOCALE_ID, useValue: 'ru-RU' }, ...appConfig.providers],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('forwards Angular locale to date-aware Kikita UI components', () => {
    expect(TestBed.inject(KUI_LOCALE)).toBe('ru-RU');
  });
});
