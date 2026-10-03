import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { KuiAlertComponent } from '../components/alert/kui-alert.component';
import { KuiAvatarComponent } from '../components/avatar/kui-avatar.component';
import { KuiAvatarGroupComponent } from '../components/avatar/kui-avatar-group.component';
import { KuiButtonDirective } from '../components/button/kui-button.directive';
import { KuiCalendarComponent } from '../components/calendar/kui-calendar.component';
import { KuiCalendarRangeComponent } from '../components/calendar-range/kui-calendar-range.component';
import { KuiCarouselComponent } from '../components/carousel/kui-carousel.component';
import { KuiCarouselSlideDirective } from '../components/carousel/kui-carousel-slide.directive';
import { KuiBarChartComponent } from '../components/chart/bar/kui-bar-chart.component';
import { KuiDonutChartComponent } from '../components/chart/donut/kui-donut-chart.component';
import { KuiLineChartComponent } from '../components/chart/line/kui-line-chart.component';
import { KuiScatterChartComponent } from '../components/chart/scatter/kui-scatter-chart.component';
import { KuiChipDirective } from '../components/chip/kui-chip.directive';
import { KuiDatePickerDirective } from '../components/date-picker/kui-date-picker.directive';
import { KuiDropdownComponent } from '../components/dropdown/kui-dropdown.component';
import { KuiFieldComponent } from '../components/field/kui-field.component';
import { KuiFileUploadComponent } from '../components/file-upload/kui-file-upload.component';
import type { KuiUploadFile } from '../components/file-upload/kui-upload-file.interface';
import { KuiIconButtonDirective } from '../components/icon-button/kui-icon-button.directive';
import { KuiLinkDirective } from '../components/link/kui-link.directive';
import { KuiLoaderDirective } from '../components/loader/kui-loader.directive';
import { KuiNumberInputDirective } from '../components/number-input/kui-number-input.directive';
import { KuiOtpInputComponent } from '../components/otp-input/kui-otp-input.component';
import { KuiPaginationComponent } from '../components/pagination/kui-pagination.component';
import { KuiStepComponent } from '../components/stepper/kui-step.component';
import { KuiStepperComponent } from '../components/stepper/kui-stepper.component';
import { KuiCellDirective } from '../components/table/kui-cell.directive';
import { KuiRowDirective } from '../components/table/kui-row.directive';
import { KuiSelectCellComponent } from '../components/table/kui-select-cell.component';
import { KuiSelectThComponent } from '../components/table/kui-select-th.component';
import { KuiTableDirective } from '../components/table/kui-table.directive';
import { KuiThDirective } from '../components/table/kui-th.directive';
import { KuiThGroupDirective } from '../components/table/kui-th-group.directive';
import { KuiTabDirective } from '../components/tabs/kui-tab.directive';
import { KuiTabsComponent } from '../components/tabs/kui-tabs.component';
import { KuiTimePickerDirective } from '../components/time-picker/kui-time-picker.directive';
import { KuiTimePickerPanelComponent } from '../components/time-picker/kui-time-picker-panel.component';
import { provideKikitaUi } from '../root';
import { KuiI18n } from './kui-i18n.service';
import { KUI_ENGLISH_MESSAGES } from './kui-messages.en';
import type { KuiMessages, KuiMessagesLayer } from './kui-messages.interface';
import { kuiProvideMessages } from './provide-kui-i18n';

const OPEN = '«';
const CLOSE = '»';

/** Wraps every message of a pack in guillemets, so a literal that bypasses the pack stands out. */
function pseudoLocalize(source: KuiMessages): KuiMessagesLayer {
  const result: Record<string, Record<string, unknown>> = {};

  for (const [group, messages] of Object.entries(source)) {
    result[group] = {};

    for (const [key, value] of Object.entries(messages as Record<string, unknown>)) {
      result[group][key] =
        typeof value === 'function'
          ? (params: unknown, ctx: unknown) =>
              `${OPEN}${(value as (p: unknown, c: unknown) => string)(params, ctx)}${CLOSE}`
          : `${OPEN}${value}${CLOSE}`;
    }
  }

  return result as KuiMessagesLayer;
}

const PSEUDO = pseudoLocalize(KUI_ENGLISH_MESSAGES);

const NAME_ATTRIBUTES = ['aria-label', 'aria-roledescription', 'placeholder', 'title'];

/** Collects every library-owned accessible name or placeholder that is not wrapped by the pack. */
function leakedNames(root: HTMLElement): string[] {
  const leaks: string[] = [];

  // Day cells are named with an `Intl` date, which is formatted data and not a message.
  for (const element of Array.from(root.querySelectorAll('*:not(.kui-calendar-day)'))) {
    for (const attribute of NAME_ATTRIBUTES) {
      const value = element.getAttribute(attribute);

      if (value && !value.includes(OPEN) && !value.startsWith('c:') && /\p{L}/u.test(value)) {
        leaks.push(`${element.tagName.toLowerCase()}[${attribute}="${value}"]`);
      }
    }
  }

  return leaks;
}

@Component({
  imports: [
    KuiAlertComponent,
    KuiAvatarComponent,
    KuiAvatarGroupComponent,
    KuiBarChartComponent,
    KuiButtonDirective,
    KuiCalendarComponent,
    KuiCalendarRangeComponent,
    KuiCarouselComponent,
    KuiCarouselSlideDirective,
    KuiCellDirective,
    KuiChipDirective,
    KuiDatePickerDirective,
    KuiDonutChartComponent,
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiFileUploadComponent,
    KuiIconButtonDirective,
    KuiLineChartComponent,
    KuiLinkDirective,
    KuiLoaderDirective,
    KuiNumberInputDirective,
    KuiOtpInputComponent,
    KuiPaginationComponent,
    KuiRowDirective,
    KuiScatterChartComponent,
    KuiSelectCellComponent,
    KuiSelectThComponent,
    KuiStepComponent,
    KuiStepperComponent,
    KuiTabDirective,
    KuiTableDirective,
    KuiTabsComponent,
    KuiThDirective,
    KuiThGroupDirective,
    KuiTimePickerDirective,
    KuiTimePickerPanelComponent,
  ],
  template: `
    <kui-pagination variant="full" [totalPages]="5" [totalItems]="48" [pageSize]="10" />
    <kui-pagination variant="simple" [totalPages]="5" />
    <kui-calendar showFooter />
    <kui-calendar-range showFooter />
    <kui-file-upload [files]="files()" maxCount="2" acceptLabel="c:hint" />
    <kui-file-upload variant="compact" />
    <kui-carousel autoplay showDots>
      <div kuiCarouselSlide>c:one</div>
      <div kuiCarouselSlide>c:two</div>
    </kui-carousel>
    <kui-line-chart [series]="series" [categories]="categories" showTable />
    <kui-line-chart [series]="series" [categories]="categories" loading />
    <kui-bar-chart [series]="series" [categories]="categories" />
    <kui-bar-chart [series]="[]" [categories]="[]" />
    <kui-donut-chart [slices]="slices" />
    <kui-scatter-chart [series]="scatter" />
    <kui-alert title="c:title" closable />
    <kui-avatar status="online" />
    <kui-avatar-group [avatars]="avatars" [max]="1" />
    <kui-stepper aria-label="c:Progress">
      <kui-step label="c:one" />
      <kui-step label="c:two" />
    </kui-stepper>
    <table kuiTable #table="kuiTable" [data]="rows">
      <thead>
        <tr kuiThGroup>
          <th kuiSelectTh></th>
          <th kuiTh sortKey="name">c:Name</th>
        </tr>
      </thead>
      <tbody>
        @for (row of table.sortedData(); track row.id) {
          <tr kuiRow [value]="row">
            <td kuiSelectCell></td>
            <td kuiCell>{{ row.name }}</td>
          </tr>
        }
      </tbody>
    </table>
    <kui-tabs value="a">
      <button kuiTab value="a" hasError>c:A</button>
    </kui-tabs>
    <kui-field label="c:Number">
      <input kuiNumberInput type="number" />
    </kui-field>
    <kui-otp-input loading [length]="4" />
    <span kuiChip removable>c:chip</span>
    <button kuiButton loading>c:Save</button>
    <button kuiIconButton loading aria-label="c:Refresh"></button>
    <span kuiLoader></span>
    <a kuiLink href="https://example.com" target="_blank">c:site</a>
    <kui-field label="c:Date">
      <input kuiDatePicker />
      <kui-dropdown panelRole="dialog"><kui-calendar flat /></kui-dropdown>
    </kui-field>
    <kui-field label="c:Time">
      <input kuiTimePicker />
      <kui-dropdown panelRole="dialog"><kui-time-picker-panel /></kui-dropdown>
    </kui-field>
  `,
})
class MessagesHost {
  readonly files = signal<readonly KuiUploadFile[]>(
    (['pending', 'uploading', 'success', 'error'] as const).map((status, index) => ({
      id: `f${index}`,
      file: new File(['x'], `c:file${index}.txt`, { type: 'text/plain' }),
      name: `c:file${index}.txt`,
      size: 2_500_000,
      type: 'text/plain',
      status,
      progress: 40,
      errorMsg: 'c:server',
    })),
  );
  readonly series = [{ id: 's', name: 'c:S', data: [1, 2, 3] }];
  readonly categories = ['c:a', 'c:b', 'c:c'];
  readonly slices = [
    { id: 'a', label: 'c:A', value: 1 },
    { id: 'b', label: 'c:B', value: 3 },
  ];
  readonly scatter = [{ id: 's', name: 'c:S', points: [{ x: 1, y: 2 }] }];
  readonly avatars = [{ name: 'c:One' }, { name: 'c:Two' }];
  readonly rows = [{ id: 1, name: 'c:Row' }];
}

describe('KuiMessages integration', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it('leaves no library-owned accessible name outside the message pack', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ messages: PSEUDO })],
    });
    const fixture = TestBed.createComponent(MessagesHost);
    fixture.detectChanges();

    expect(leakedNames(fixture.nativeElement as HTMLElement)).toEqual([]);
  });

  it('renders the pack text in the visible chrome', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi({ messages: PSEUDO })] });
    const fixture = TestBed.createComponent(MessagesHost);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    for (const expected of [
      '«Today»',
      '«Queued»',
      '«Done»',
      '«Retry»',
      '«Table»',
      '«Attach file»',
      '«No data»',
      '«Rows per page»',
    ]) {
      expect(text, expected).toContain(expected);
    }
  });

  it('follows a runtime language change without recreating the components', () => {
    const language = signal<KuiMessagesLayer>({ pagination: { next: 'Next one' } });
    TestBed.configureTestingModule({ providers: [provideKikitaUi({ messages: language })] });
    const fixture = TestBed.createComponent(MessagesHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[aria-label="Next one"]')).not.toBeNull();

    language.set({ pagination: { next: 'Weiter' } });
    fixture.detectChanges();

    expect(root.querySelector('[aria-label="Next one"]')).toBeNull();
    expect(root.querySelector('[aria-label="Weiter"]')).not.toBeNull();
  });

  it('keeps two subtrees apart', () => {
    @Component({
      selector: 'kui-test-scoped',
      imports: [KuiPaginationComponent],
      providers: [kuiProvideMessages({ pagination: { next: 'Scoped' } })],
      template: `<kui-pagination [totalPages]="3" />`,
    })
    class Scoped {}

    @Component({
      imports: [Scoped, KuiPaginationComponent],
      template: `
        <kui-pagination id="outside" [totalPages]="3" />
        <kui-test-scoped />
      `,
    })
    class Both {}

    TestBed.configureTestingModule({ imports: [Both], providers: [provideKikitaUi()] });
    const fixture = TestBed.createComponent(Both);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const outside = root.querySelector('#outside')!;

    expect(outside.querySelector('[aria-label="Next page"]')).not.toBeNull();
    expect(root.querySelector('kui-test-scoped [aria-label="Scoped"]')).not.toBeNull();
    expect(TestBed.inject(KuiI18n).get('pagination')().next).toBe('Next page');
  });

  it('lets a component messages input win over the scope', () => {
    @Component({
      imports: [KuiPaginationComponent],
      template: `<kui-pagination [totalPages]="3" [messages]="{ next: 'Instance' }" />`,
    })
    class Instance {}

    TestBed.configureTestingModule({
      imports: [Instance],
      providers: [provideKikitaUi({ messages: { pagination: { next: 'Root' } } })],
    });
    const fixture = TestBed.createComponent(Instance);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[aria-label="Instance"]')).not.toBeNull();
    expect(root.querySelector('[aria-label="Root"]')).toBeNull();
  });
});
