import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KuiTabPanelDirective } from './kui-tab-panel.directive';
import { KuiTabDirective } from './kui-tab.directive';
import { KuiTabsComponent } from './kui-tabs.component';

@Component({
  imports: [KuiTabsComponent, KuiTabDirective, KuiTabPanelDirective],
  template: `
    <kui-tabs [selected]="tab()" [controlsPanels]="controlsPanels()">
      <button kuiTab value="a">A</button>
      <button kuiTab value="b">B</button>
      <div kuiTabPanel value="a">Panel A</div>
      <div kuiTabPanel value="b">Panel B</div>
    </kui-tabs>
  `,
})
class TabsHost {
  readonly tab = signal('a');
  readonly controlsPanels = signal(true);
}

@Component({
  imports: [KuiTabsComponent, KuiTabDirective, KuiTabPanelDirective],
  template: `
    <kui-tabs selected="a" inverted>
      <button kuiTab value="a">A</button>
      <div kuiTabPanel value="a">Panel A</div>
    </kui-tabs>
  `,
})
class TabsInvertedHost {}

@Component({
  imports: [KuiTabsComponent, KuiTabDirective, KuiTabPanelDirective],
  template: `
    <kui-tabs selected="a">
      <button kuiTab value="a">A</button>
      <button kuiTab value="b" [hasError]="hasError()">B</button>
      <div kuiTabPanel value="a">Panel A</div>
      <div kuiTabPanel value="b">Panel B</div>
    </kui-tabs>
  `,
})
class TabsErrorHost {
  readonly hasError = signal(false);
}

describe('KuiTabsComponent', () => {
  function createFixture(): ComponentFixture<TabsHost> {
    TestBed.configureTestingModule({ imports: [TabsHost] });
    const fixture = TestBed.createComponent(TabsHost);
    fixture.detectChanges();
    return fixture;
  }

  it('renders tablist and tab roles', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[role="tablist"]')).not.toBeNull();
    expect(el.querySelectorAll('[role="tab"]').length).toBe(2);
    expect(el.querySelectorAll('[role="tabpanel"]').length).toBe(2);
  });

  it('sets aria-selected on the active tab', () => {
    const fixture = createFixture();
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;

    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
  });

  it('links tabs and panels with aria-controls and aria-labelledby', () => {
    const fixture = createFixture();
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;
    const panels = fixture.nativeElement.querySelectorAll(
      '[role="tabpanel"]',
    ) as NodeListOf<HTMLElement>;

    expect(tabs[0].getAttribute('aria-controls')).toBe(panels[0].id);
    expect(panels[0].getAttribute('aria-labelledby')).toBe(tabs[0].id);
    expect(tabs[1].getAttribute('aria-controls')).toBe(panels[1].id);
    expect(panels[1].getAttribute('aria-labelledby')).toBe(tabs[1].id);
  });

  it('can omit aria-controls for router navigation tabs without local panels', () => {
    const fixture = createFixture();
    fixture.componentInstance.controlsPanels.set(false);
    fixture.detectChanges();

    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;

    expect(tabs[0].hasAttribute('aria-controls')).toBe(false);
    expect(tabs[1].hasAttribute('aria-controls')).toBe(false);
  });

  it('marks inverted tabs on the host for flipped edge styling', () => {
    TestBed.configureTestingModule({ imports: [TabsInvertedHost] });
    const fixture = TestBed.createComponent(TabsInvertedHost);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('kui-tabs')?.hasAttribute('data-kui-inverted')).toBe(
      true,
    );
  });

  it('hides inactive panels', () => {
    const fixture = createFixture();
    const panels = fixture.nativeElement.querySelectorAll(
      '[role="tabpanel"]',
    ) as NodeListOf<HTMLElement>;

    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
  });

  it('switches active tab on click', () => {
    const fixture = createFixture();
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;

    tabs[1].click();
    fixture.detectChanges();

    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });

  it('toggles the error dot without changing selection', () => {
    TestBed.configureTestingModule({ imports: [TabsErrorHost] });
    const fixture = TestBed.createComponent(TabsErrorHost);
    fixture.detectChanges();

    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;
    expect(tabs[1].querySelector('.kui-tab-error-dot')).toBeNull();

    fixture.componentInstance.hasError.set(true);
    fixture.detectChanges();

    expect(tabs[1].querySelector('.kui-tab-error-dot')).not.toBeNull();
    expect(tabs[1].querySelector('.kui-tab-error-sr')?.textContent).toBe('has error');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');

    fixture.componentInstance.hasError.set(false);
    fixture.detectChanges();

    expect(tabs[1].querySelector('.kui-tab-error-dot')).toBeNull();
  });

  it('reuses pre-rendered error affordances instead of duplicating them during hydration', () => {
    TestBed.configureTestingModule({ imports: [TabsErrorHost] });
    const fixture = TestBed.createComponent(TabsErrorHost);
    fixture.detectChanges();

    const tab = fixture.nativeElement.querySelectorAll('[role="tab"]')[1] as HTMLElement;
    const dot = document.createElement('span');
    const sr = document.createElement('span');

    dot.className = 'kui-tab-error-dot';
    sr.className = 'kui-tab-error-sr';
    tab.append(dot, sr);

    fixture.componentInstance.hasError.set(true);
    fixture.detectChanges();

    expect(tab.querySelectorAll('.kui-tab-error-dot')).toHaveLength(1);
    expect(tab.querySelectorAll('.kui-tab-error-sr')).toHaveLength(1);
    expect(tab.querySelector('.kui-tab-error-sr')?.textContent).toBe('has error');
  });
});
