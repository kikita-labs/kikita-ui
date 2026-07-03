import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { provideKikitaUi } from './provide-kikita-ui';

describe('provideKikitaUi', () => {
  afterEach(() => {
    delete document.documentElement.dataset['kuiScrollbars'];
    TestBed.resetTestingModule();
  });

  it('enables global styled scrollbars when requested', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ scrollbars: 'styled' })],
    });

    TestBed.inject(DOCUMENT);

    expect(document.documentElement.dataset['kuiScrollbars']).toBe('styled');
  });

  it('removes global styled scrollbars when native mode is explicit', () => {
    document.documentElement.dataset['kuiScrollbars'] = 'styled';

    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ scrollbars: 'native' })],
    });

    TestBed.inject(DOCUMENT);

    expect(document.documentElement.dataset['kuiScrollbars']).toBeUndefined();
  });

  it('leaves manual scrollbar mode untouched by default', () => {
    document.documentElement.dataset['kuiScrollbars'] = 'styled';

    TestBed.configureTestingModule({
      providers: [provideKikitaUi()],
    });

    TestBed.inject(DOCUMENT);

    expect(document.documentElement.dataset['kuiScrollbars']).toBe('styled');
  });
});
