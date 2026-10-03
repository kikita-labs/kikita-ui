import { Component, signal, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KuiDropdownComponent } from '../components/dropdown/kui-dropdown.component';
import { KuiOptionDirective } from '../components/dropdown/kui-option.directive';
import { KuiFieldComponent } from '../components/field/kui-field.component';
import { KuiLinkDirective } from '../components/link/kui-link.directive';
import { KuiSelectDirective } from '../components/select/kui-select.directive';
import { KuiSplitterComponent } from '../components/splitter/kui-splitter.component';
import { KuiSplitterPaneComponent } from '../components/splitter/kui-splitter-pane.component';
import { KuiTextDirective } from '../components/typography/kui-text.directive';
import { provideKikitaUi } from '../root';
import { KuiDefaults } from './kui-defaults.service';

@Component({
  imports: [KuiTextDirective],
  template: `
    <p kuiText id="plain">Plain</p>
    <p kuiText id="local" variant="title" tone="danger">Local</p>
  `,
})
class TypographyHost {}

@Component({
  imports: [KuiLinkDirective],
  template: `<a kuiLink id="link" href="#">Link</a>`,
})
class LinkHost {}

@Component({
  imports: [KuiSplitterComponent, KuiSplitterPaneComponent],
  template: `
    <kui-splitter id="plain">
      <kui-splitter-pane>One</kui-splitter-pane>
      <kui-splitter-pane [minSize]="30">Two</kui-splitter-pane>
    </kui-splitter>
    <kui-splitter id="local" orientation="horizontal">
      <kui-splitter-pane>One</kui-splitter-pane>
      <kui-splitter-pane>Two</kui-splitter-pane>
    </kui-splitter>
  `,
})
class SplitterHost {
  readonly panes = viewChildren(KuiSplitterPaneComponent);
}

@Component({
  imports: [KuiFieldComponent, KuiSelectDirective, KuiDropdownComponent, KuiOptionDirective],
  template: `
    <kui-field>
      <input kuiSelect id="default" multiple [(value)]="value" />
      <kui-dropdown>
        <div kuiOption value="a">Option A</div>
        <div kuiOption value="b">Option B</div>
      </kui-dropdown>
    </kui-field>
    <kui-field>
      <input kuiSelect id="local" multiple multipleDisplay="chips" [(value)]="value" />
      <kui-dropdown>
        <div kuiOption value="a">Option A</div>
        <div kuiOption value="b">Option B</div>
      </kui-dropdown>
    </kui-field>
  `,
})
class SelectHost {
  readonly value = signal<readonly string[]>(['a', 'b']);
}

function render<T>(type: new () => T): {
  host: HTMLElement;
  fixture: ReturnType<typeof TestBed.createComponent<T>>;
} {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();

  return { host: fixture.nativeElement as HTMLElement, fixture };
}

describe('KuiDefaults read by the typography directive', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('keeps body and default tone without defaults', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

    const plain = render(TypographyHost).host.querySelector('#plain')!;

    expect(plain.classList.contains('kui-body')).toBe(true);
    expect(plain.getAttribute('data-kui-text-tone')).toBe('default');
  });

  it('applies the configured variant and tone, and a local input wins', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({ defaults: { typography: { variant: 'caption', tone: 'muted' } } }),
      ],
    });

    const { host } = render(TypographyHost);
    const plain = host.querySelector('#plain')!;
    const local = host.querySelector('#local')!;

    expect(plain.classList.contains('kui-caption')).toBe(true);
    expect(plain.classList.contains('kui-body')).toBe(false);
    expect(plain.classList.contains('kui-text-muted')).toBe(true);
    expect(local.classList.contains('kui-title')).toBe(true);
    expect(local.classList.contains('kui-text-danger')).toBe(true);
  });

  it('does not reach a link, which owns its own text colour', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({ defaults: { typography: { variant: 'caption', tone: 'muted' } } }),
      ],
    });

    const link = render(LinkHost).host.querySelector('#link')!;

    expect(link.classList.contains('kui-text-muted')).toBe(false);
    expect(link.classList.contains('kui-text-default')).toBe(true);
    expect(link.classList.contains('kui-caption')).toBe(false);
    expect(link.classList.contains('kui-body')).toBe(true);
  });

  it('follows a runtime change', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });
    const { host, fixture } = render(TypographyHost);

    TestBed.inject(KuiDefaults).set('typography', { variant: 'heading-sm' });
    fixture.detectChanges();

    expect(host.querySelector('#plain')!.classList.contains('kui-heading-sm')).toBe(true);
  });
});

describe('KuiDefaults read by the splitter', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('is horizontal with a 10 percent floor without defaults', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });
    const { host, fixture } = render(SplitterHost);

    expect(host.querySelector('#plain')!.getAttribute('data-kui-orientation')).toBe('horizontal');
    expect(fixture.componentInstance.panes()[0]!.effectiveMinSize()).toBe(10);
  });

  it('applies the configured orientation and minimum size, and local inputs win', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({ defaults: { splitter: { orientation: 'vertical', minSize: 20 } } }),
      ],
    });
    const { host, fixture } = render(SplitterHost);
    const panes = fixture.componentInstance.panes();

    expect(host.querySelector('#plain')!.getAttribute('data-kui-orientation')).toBe('vertical');
    expect(host.querySelector('#local')!.getAttribute('data-kui-orientation')).toBe('horizontal');
    expect(panes[0]!.effectiveMinSize()).toBe(20);
    expect(panes[1]!.effectiveMinSize()).toBe(30);
  });

  it('follows a runtime change of the orientation', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });
    const { host, fixture } = render(SplitterHost);

    TestBed.inject(KuiDefaults).set('splitter', { orientation: 'vertical' });
    fixture.detectChanges();

    expect(host.querySelector('#plain')!.getAttribute('data-kui-orientation')).toBe('vertical');
  });
});

describe('KuiDefaults read by select multipleDisplay', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('shows chips by default', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

    expect(
      render(SelectHost).host.querySelector('#default ~ * [kuiChip], [kuiChip]'),
    ).not.toBeNull();
  });

  it('shows text when the select key says so, while a local chips input still shows chips', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ defaults: { select: { multipleDisplay: 'text' } } })],
    });
    const { host } = render(SelectHost);
    const fields = host.querySelectorAll('kui-field');

    expect(fields[0]!.querySelector('[kuiChip]')).toBeNull();
    expect(fields[1]!.querySelector('[kuiChip]')).not.toBeNull();
  });
});
