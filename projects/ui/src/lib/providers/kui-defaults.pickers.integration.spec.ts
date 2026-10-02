import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KuiCalendarComponent } from '../components/calendar/kui-calendar.component';
import { KuiCalendarRangeComponent } from '../components/calendar-range/kui-calendar-range.component';
import { KuiCarouselComponent } from '../components/carousel/kui-carousel.component';
import { KuiCarouselSlideDirective } from '../components/carousel/kui-carousel-slide.directive';
import { KuiDropdownComponent } from '../components/dropdown/kui-dropdown.component';
import { KuiFieldComponent } from '../components/field/kui-field.component';
import { KuiPaginationComponent } from '../components/pagination/kui-pagination.component';
import { KuiTimePickerDirective } from '../components/time-picker/kui-time-picker.directive';
import { KuiTimePickerPanelComponent } from '../components/time-picker/kui-time-picker-panel.component';
import { KuiDefaults } from './kui-defaults.service';
import { provideKikitaUi } from './provide-kikita-ui';

@Component({
  imports: [KuiCalendarComponent, KuiCalendarRangeComponent],
  template: `
    <kui-calendar id="plain" />
    <kui-calendar id="local" [showFooter]="false" [showPrevNav]="true" />
    <kui-calendar-range id="range" />
  `,
})
class CalendarHost {}

function render(): HTMLElement {
  const fixture = TestBed.createComponent(CalendarHost);
  fixture.detectChanges();

  return fixture.nativeElement as HTMLElement;
}

describe('KuiDefaults read by calendars', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('keeps the built-in view without defaults', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

    const host = render();
    const plain = host.querySelector('#plain')!;

    expect(plain.hasAttribute('data-kui-flat')).toBe(false);
    expect(plain.querySelector('.kui-calendar-footer')).toBeNull();
    expect(plain.querySelectorAll('.kui-calendar-header button').length).toBe(3);
  });

  it('applies calendar defaults and lets a local input win', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({
          defaults: { calendar: { flat: true, showFooter: true, size: 'sm' } },
        }),
      ],
    });

    const host = render();
    const plain = host.querySelector('#plain')!;
    const local = host.querySelector('#local')!;

    expect(plain.hasAttribute('data-kui-flat')).toBe(true);
    expect(plain.getAttribute('data-kui-size')).toBe('sm');
    expect(plain.querySelector('.kui-calendar-footer')).not.toBeNull();
    expect(local.querySelector('.kui-calendar-footer')).toBeNull();
  });

  it('hides the navigation controls the defaults turn off, and a local true brings one back', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({ defaults: { calendar: { showPrevNav: false, showNextNav: false } } }),
      ],
    });

    const host = render();

    // The header always keeps the title button; prev and next are the optional ones.
    expect(host.querySelectorAll('#plain .kui-calendar-header button').length).toBe(1);
    expect(host.querySelectorAll('#local .kui-calendar-header button').length).toBe(2);
  });

  it('keeps the range calendar on its own key', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ defaults: { calendar: { flat: true } } })],
    });

    const range = render().querySelector('#range')!;

    expect(range.hasAttribute('data-kui-flat')).toBe(false);
  });

  it('applies calendarRange defaults to the range calendar only', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ defaults: { calendarRange: { flat: true } } })],
    });

    const host = render();

    expect(host.querySelector('#range')!.hasAttribute('data-kui-flat')).toBe(true);
    expect(host.querySelector('#plain')!.hasAttribute('data-kui-flat')).toBe(false);
  });
});

@Component({
  imports: [
    KuiFieldComponent,
    KuiDropdownComponent,
    KuiTimePickerDirective,
    KuiTimePickerPanelComponent,
  ],
  template: `
    <kui-field label="Time">
      <input kuiTimePicker id="default" />
      <kui-dropdown panelRole="dialog" panelWidth="auto">
        <kui-time-picker-panel />
      </kui-dropdown>
    </kui-field>
    <kui-field label="Local">
      <input kuiTimePicker id="local" format="24h" [showSeconds]="false" />
      <kui-dropdown panelRole="dialog" panelWidth="auto">
        <kui-time-picker-panel />
      </kui-dropdown>
    </kui-field>
  `,
})
class TimeHost {}

describe('KuiDefaults read by the time picker', () => {
  afterEach(() => TestBed.resetTestingModule());

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(TimeHost);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('uses the 24 hour format without defaults', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

    expect(render().querySelector('#default')!.getAttribute('placeholder')).toBe('hh:mm');
  });

  it('applies the format and seconds defaults, and a local input wins', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({ defaults: { timePicker: { format: '12h', showSeconds: true } } }),
      ],
    });

    const host = render();

    expect(host.querySelector('#default')!.getAttribute('placeholder')).toBe('hh:mm:ss AM/PM');
    expect(host.querySelector('#local')!.getAttribute('placeholder')).toBe('hh:mm');
  });

  it('follows a runtime change of the format', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });
    const fixture = TestBed.createComponent(TimeHost);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('#default')!;

    TestBed.inject(KuiDefaults).set('timePicker', { format: '12h' });
    fixture.detectChanges();

    expect(input.getAttribute('placeholder')).toBe('hh:mm AM/PM');
  });
});

@Component({
  imports: [KuiCarouselComponent, KuiCarouselSlideDirective],
  template: `
    <kui-carousel id="default">
      <div kuiCarouselSlide>One</div>
      <div kuiCarouselSlide>Two</div>
    </kui-carousel>
    <kui-carousel id="local" [showDots]="true" [showArrows]="true">
      <div kuiCarouselSlide>One</div>
      <div kuiCarouselSlide>Two</div>
    </kui-carousel>
  `,
})
class CarouselHost {}

describe('KuiDefaults read by the carousel', () => {
  afterEach(() => TestBed.resetTestingModule());

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('shows arrows and dots without defaults', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

    const carousel = render().querySelector('#default')!;

    expect(carousel.querySelector('.kui-carousel__control-slot--prev')).not.toBeNull();
    expect(carousel.querySelector('.kui-carousel__dots')).not.toBeNull();
  });

  it('hides the chrome the defaults turn off, and a local true brings it back', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({ defaults: { carousel: { showArrows: false, showDots: false } } }),
      ],
    });

    const host = render();
    const plain = host.querySelector('#default')!;
    const local = host.querySelector('#local')!;

    expect(plain.querySelector('.kui-carousel__control-slot--prev')).toBeNull();
    expect(plain.querySelector('.kui-carousel__dots')).toBeNull();
    expect(local.querySelector('.kui-carousel__control-slot--prev')).not.toBeNull();
    expect(local.querySelector('.kui-carousel__dots')).not.toBeNull();
  });
});

@Component({
  imports: [KuiPaginationComponent],
  template: `
    <kui-pagination id="default" [totalPages]="20" [(currentPage)]="page" />
    <kui-pagination id="local" [totalPages]="20" variant="compact" [(currentPage)]="page" />
  `,
})
class PaginationHost {
  readonly page = signal(10);
}

describe('KuiDefaults read by pagination', () => {
  afterEach(() => TestBed.resetTestingModule());

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(PaginationHost);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('applies the variant default and lets a local variant win', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ defaults: { pagination: { variant: 'simple' } } })],
    });

    const host = render();

    expect(host.querySelector('#default')!.getAttribute('data-kui-variant')).toBe('simple');
    expect(host.querySelector('#local')!.getAttribute('data-kui-variant')).toBe('compact');
  });

  it('widens the page window with a sibling count default', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });
    const base = render().querySelectorAll('#default .kui-pagination__page').length;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ defaults: { pagination: { siblingCount: 3 } } })],
    });
    const wide = render().querySelectorAll('#default .kui-pagination__page').length;

    expect(wide).toBeGreaterThan(base);
  });
});
