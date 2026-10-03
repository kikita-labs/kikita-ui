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
    expect(text.monthsLong[0].toLowerCase()).toContain('\u044f\u043d\u0432\u0430\u0440');
    expect(text.firstDayOfWeek).toBe(1);
    expect(text.weekdaysLong[0].toLowerCase()).toContain(
      '\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a',
    );
  });

  it('reports the weekend of the locale', () => {
    expect(getKuiCalendarLocaleText('en-US').weekend).toEqual([6, 0]);
    expect(getKuiCalendarLocaleText('he-IL').weekend).toEqual([5, 6]);
  });

  it('names months in the Gregorian calendar whatever the locale default is', () => {
    expect(getKuiCalendarLocaleText('th-TH').monthsLong[9]).toBe('ตุลาคม');
  });
});
