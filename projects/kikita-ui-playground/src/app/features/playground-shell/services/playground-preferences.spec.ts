import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { appConfig } from '@app/app.config';
import {
  DEFAULT_PLAYGROUND_SEED_COLORS,
  PLAYGROUND_PREFERENCES_KEY,
} from '@features/playground-shell/constants';

import { PlaygroundPreferences } from './playground-preferences';

function stored(): Record<string, unknown> | null {
  const raw = localStorage.getItem(PLAYGROUND_PREFERENCES_KEY);

  return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
}

describe('PlaygroundPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts from the defaults and writes nothing until the first render has applied storage', () => {
    const preferences = TestBed.inject(PlaygroundPreferences);

    expect(preferences.themeMode()).toBe('dark');
    expect(preferences.seedColors()).toEqual(DEFAULT_PLAYGROUND_SEED_COLORS);
    expect(preferences.contrast()).toBe('strict');
    expect(stored()).toBeNull();

    TestBed.tick();

    expect(stored()).toMatchObject({ themeMode: 'dark', contrast: 'strict', language: 'en' });
  });

  it('applies stored values after the first render', () => {
    localStorage.setItem(
      PLAYGROUND_PREFERENCES_KEY,
      JSON.stringify({
        themeMode: 'light',
        contrast: 'soft',
        seedColors: { ...DEFAULT_PLAYGROUND_SEED_COLORS, primary: '#e4572e' },
      }),
    );
    const preferences = TestBed.inject(PlaygroundPreferences);

    TestBed.inject(ApplicationRef).tick();

    expect(preferences.themeMode()).toBe('light');
    expect(preferences.contrast()).toBe('soft');
    expect(preferences.seedColors().primary).toBe('#e4572e');
  });

  it('persists every change once the stored values are applied', () => {
    const preferences = TestBed.inject(PlaygroundPreferences);
    TestBed.inject(ApplicationRef).tick();

    preferences.themeMode.set('light');
    preferences.contrast.set('soft');
    preferences.seedColors.set({ ...DEFAULT_PLAYGROUND_SEED_COLORS, danger: '#c0152f' });
    TestBed.tick();

    expect(stored()).toMatchObject({
      themeMode: 'light',
      contrast: 'soft',
      language: 'en',
      seedColors: { danger: '#c0152f' },
    });
  });

  it('ignores unreadable stored values', () => {
    localStorage.setItem(PLAYGROUND_PREFERENCES_KEY, '{broken');
    const preferences = TestBed.inject(PlaygroundPreferences);

    TestBed.inject(ApplicationRef).tick();

    expect(preferences.themeMode()).toBe('dark');
  });
});
