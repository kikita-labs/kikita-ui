import { getKuiCalendarLocaleText } from './kui-calendar-locale-text.util';

describe('getKuiCalendarLocaleText', () => {
  it('resolves English month/weekday names with Sunday as the first day', () => {
    const text = getKuiCalendarLocaleText('en-US');
    expect(text.monthsLong[0]).toBe('January');
    expect(text.monthsShort[0]).toMatch(/Jan/);
    expect(text.firstDayOfWeek).toBe(0);
    expect(text.weekdaysShort[0]).toMatch(/Sun/);
  });

  it('resolves Russian month names and Monday as the first day', () => {
    const text = getKuiCalendarLocaleText('ru-RU');
    expect(text.monthsLong[0].toLowerCase()).toContain('январ');
    expect(text.firstDayOfWeek).toBe(1);
    expect(text.weekdaysLong[0].toLowerCase()).toContain('понедельник');
  });

  it('caches results per locale tag', () => {
    const first = getKuiCalendarLocaleText('fr-FR');
    const second = getKuiCalendarLocaleText('fr-FR');
    expect(first).toBe(second);
  });
});
