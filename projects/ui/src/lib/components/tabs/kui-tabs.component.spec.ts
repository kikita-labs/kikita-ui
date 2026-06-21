import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KuiTabPanelDirective } from './kui-tab-panel.directive';
import { KuiTabDirective } from './kui-tab.directive';
import { KuiTabsComponent } from './kui-tabs.component';

@Component({
  imports: [KuiTabsComponent, KuiTabDirective, KuiTabPanelDirective],
  template: `
    <kui-tabs [selected]="tab()">
      <button kuiTab value="a">A</button>
      <button kuiTab value="b">B</button>
      <div kuiTabPanel value="a">Panel A</div>
      <div kuiTabPanel value="b">Panel B</div>
    </kui-tabs>
  `,
})
class TabsHost {
  readonly tab = signal('a');
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

  it('hides inactive panels', () => {
    const fixture = createFixture();
    const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]') as NodeListOf<HTMLElement>;

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
});
