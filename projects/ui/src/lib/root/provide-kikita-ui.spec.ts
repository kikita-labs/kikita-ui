import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KUI_BRAND_ICONS, KUI_ICONS, resolveLucideIcon } from '../components/icon';
import { KuiTooltipTriggerType } from '../components/tooltip';
import { KuiDefaults } from '../providers/kui-defaults.service';
import { DEFAULT_KUI_THEME } from '../theme';
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

  it('applies the scrollbar mode on the server platform so the first HTML already carries it', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        provideKikitaUi({ scrollbars: 'styled' }),
      ],
    });

    TestBed.inject(DOCUMENT);

    expect(document.documentElement.getAttribute('data-kui-scrollbars')).toBe('styled');
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

  it('registers the default Lucide icon resolver', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi()],
    });

    expect(TestBed.inject(KUI_ICONS)).toContain(resolveLucideIcon);
  });

  it('omits the default Lucide icon resolver when icons is disabled', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ icons: false })],
    });

    expect(TestBed.inject(KUI_ICONS, [])).not.toContain(resolveLucideIcon);
  });

  it('registers the default brand icon set', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi()],
    });

    expect(TestBed.inject(KUI_ICONS)).toContain(KUI_BRAND_ICONS);
  });

  it('omits the default brand icon set when icons is disabled', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ icons: false })],
    });

    expect(TestBed.inject(KUI_ICONS, [])).not.toContain(KUI_BRAND_ICONS);
  });

  it('configures global tooltip options when requested', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ tooltip: { triggerType: KuiTooltipTriggerType.Hover } })],
    });

    expect(TestBed.inject(KuiDefaults).effective().tooltip?.triggerType).toBe(
      KuiTooltipTriggerType.Hover,
    );
  });
});

describe('provideKikitaUi theme', () => {
  afterEach(() => {
    document.getElementById('kui-theme')?.remove();
    document.documentElement.removeAttribute('data-kui-density');
    TestBed.resetTestingModule();
  });

  it('installs the layered default theme and its density on the document', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

    TestBed.inject(DOCUMENT);

    expect(document.documentElement.getAttribute('data-kui-density')).toBe('regular');
    expect(document.getElementById('kui-theme')?.textContent).toContain('@layer kui.tokens');
  });

  it('keeps a density the page already set', () => {
    document.documentElement.setAttribute('data-kui-density', 'compact');
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

    TestBed.inject(DOCUMENT);

    expect(document.documentElement.getAttribute('data-kui-density')).toBe('compact');
  });

  it('generates the theme of custom seeds', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({
          theme: { seeds: { ...DEFAULT_KUI_THEME.seeds, radius: 12, density: 'comfortable' } },
        }),
      ],
    });

    TestBed.inject(DOCUMENT);

    expect(document.getElementById('kui-theme')?.textContent).toContain('--kui-radius-md: 12px');
    expect(document.documentElement.getAttribute('data-kui-density')).toBe('comfortable');
  });
});
