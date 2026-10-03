import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiAccordionComponent } from '../components/accordion/kui-accordion.component';
import { KuiAccordionItemComponent } from '../components/accordion/kui-accordion-item.component';
import { KuiAlertComponent } from '../components/alert/kui-alert.component';
import { KuiCardDirective } from '../components/card/kui-card.directive';
import { KuiGroupDirective } from '../components/group/kui-group.directive';
import { KuiStepComponent } from '../components/stepper/kui-step.component';
import { KuiStepperComponent } from '../components/stepper/kui-stepper.component';
import { KuiTabDirective } from '../components/tabs/kui-tab.directive';
import { KuiTabPanelDirective } from '../components/tabs/kui-tab-panel.directive';
import { KuiTabsComponent } from '../components/tabs/kui-tabs.component';
import { KuiTreeComponent } from '../components/tree/kui-tree.component';
import type { KuiTreeNode } from '../components/tree/kui-tree-node.interface';
import { provideKikitaUi } from '../root';
import { KuiDefaults } from './kui-defaults.service';

const NODES: KuiTreeNode[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
];

@Component({
  imports: [KuiAccordionComponent, KuiAccordionItemComponent],
  template: `
    <kui-accordion id="plain">
      <kui-accordion-item header="One">1</kui-accordion-item>
      <kui-accordion-item header="Two">2</kui-accordion-item>
    </kui-accordion>
    <kui-accordion id="local" mode="exclusive" appearance="ghost" size="sm">
      <kui-accordion-item header="One">1</kui-accordion-item>
      <kui-accordion-item header="Two">2</kui-accordion-item>
    </kui-accordion>
  `,
})
class AccordionHost {}

@Component({
  imports: [KuiAlertComponent],
  template: `
    <kui-alert id="plain" appearance="info" title="Plain" />
    <kui-alert
      id="local"
      appearance="info"
      title="Local"
      size="md"
      shape="soft"
      [showIcon]="true"
      [closable]="true"
    />
  `,
})
class AlertHost {}

@Component({
  imports: [KuiCardDirective],
  template: `
    <div id="plain" kuiCard>Plain</div>
    <div id="local" kuiCard size="md" appearance="surface">Local</div>
  `,
})
class CardHost {}

@Component({
  imports: [KuiTabsComponent, KuiTabDirective, KuiTabPanelDirective],
  template: `
    <kui-tabs id="plain" value="a">
      <button kuiTab value="a">A</button>
      <div kuiTabPanel value="a">Panel A</div>
    </kui-tabs>
    <kui-tabs id="local" value="a" variant="line" orientation="horizontal" size="md">
      <button kuiTab value="a">A</button>
      <div kuiTabPanel value="a">Panel A</div>
    </kui-tabs>
  `,
})
class TabsHost {}

@Component({
  imports: [KuiStepperComponent, KuiStepComponent],
  template: `
    <kui-stepper id="plain" [currentIndex]="0">
      <kui-step label="A" />
      <kui-step label="B" />
    </kui-stepper>
    <kui-stepper
      id="local"
      [currentIndex]="0"
      size="md"
      orientation="horizontal"
      [linear]="true"
      [compact]="false"
    >
      <kui-step label="A" />
      <kui-step label="B" />
    </kui-stepper>
  `,
})
class StepperHost {}

@Component({
  imports: [KuiTreeComponent],
  template: `
    <kui-tree id="plain" ariaLabel="Plain" [data]="nodes" />
    <kui-tree id="local" ariaLabel="Local" [data]="nodes" size="md" mode="display" />
  `,
})
class TreeHost {
  readonly nodes = NODES;
}

@Component({
  imports: [KuiGroupDirective],
  template: `
    <div id="plain" kuiGroup><span>x</span></div>
    <div
      id="local"
      kuiGroup
      size="md"
      orientation="horizontal"
      [collapsed]="false"
      [rounded]="true"
    >
      <span>x</span>
    </div>
  `,
})
class GroupHost {}

describe('KuiDefaults read by structural components', () => {
  afterEach(() => TestBed.resetTestingModule());

  function create<T>(
    type: new () => T,
    defaults?: Parameters<typeof provideKikitaUi>[0],
  ): {
    fixture: ComponentFixture<T>;
    plain: HTMLElement;
    local: HTMLElement;
  } {
    TestBed.configureTestingModule({ providers: defaults ? [provideKikitaUi(defaults)] : [] });
    const fixture = TestBed.createComponent(type);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    return {
      fixture,
      plain: root.querySelector<HTMLElement>('#plain')!,
      local: root.querySelector<HTMLElement>('#local')!,
    };
  }

  describe('accordion', () => {
    function expandedCount(el: HTMLElement): number {
      return el.querySelectorAll('button[aria-expanded="true"]').length;
    }

    function openBoth(el: HTMLElement, fixture: ComponentFixture<unknown>): void {
      for (const button of Array.from(el.querySelectorAll<HTMLButtonElement>('button'))) {
        button.click();
        fixture.detectChanges();
      }
    }

    it('keeps the built-in size, appearance and mode without defaults', () => {
      const { fixture, plain } = create(AccordionHost);

      expect(plain.getAttribute('data-kui-size')).toBe('md');
      expect(plain.getAttribute('data-kui-appearance')).toBe('default');
      expect(plain.getAttribute('data-kui-mode')).toBe('exclusive');
      openBoth(plain, fixture);
      expect(expandedCount(plain)).toBe(1);
    });

    it('applies the configured size, appearance and mode', () => {
      const { fixture, plain } = create(AccordionHost, {
        defaults: { accordion: { size: 'lg', appearance: 'bordered', mode: 'multi' } },
      });

      expect(plain.getAttribute('data-kui-size')).toBe('lg');
      expect(plain.getAttribute('data-kui-appearance')).toBe('bordered');
      expect(plain.getAttribute('data-kui-mode')).toBe('multi');
      openBoth(plain, fixture);
      expect(expandedCount(plain)).toBe(2);
    });

    it('lets local inputs win', () => {
      const { fixture, local } = create(AccordionHost, {
        defaults: { accordion: { size: 'lg', appearance: 'bordered', mode: 'multi' } },
      });

      expect(local.getAttribute('data-kui-size')).toBe('sm');
      expect(local.getAttribute('data-kui-appearance')).toBe('ghost');
      expect(local.getAttribute('data-kui-mode')).toBe('exclusive');
      openBoth(local, fixture);
      expect(expandedCount(local)).toBe(1);
    });

    it('follows a runtime change', () => {
      const { fixture, plain } = create(AccordionHost);

      TestBed.inject(KuiDefaults).set('accordion', { appearance: 'ghost', mode: 'multi' });
      fixture.detectChanges();

      expect(plain.getAttribute('data-kui-appearance')).toBe('ghost');
      expect(plain.getAttribute('data-kui-mode')).toBe('multi');
    });
  });

  describe('alert', () => {
    it('keeps the built-in look without defaults', () => {
      const { plain } = create(AlertHost);

      expect(plain.getAttribute('data-kui-size')).toBe('md');
      expect(plain.getAttribute('data-kui-shape')).toBe('soft');
      expect(plain.querySelector('.kui-alert__icon')).not.toBeNull();
      expect(plain.querySelector('.kui-alert__close')).not.toBeNull();
    });

    it('applies the configured size, shape, showIcon and closable', () => {
      const { plain } = create(AlertHost, {
        defaults: { alert: { size: 'sm', shape: 'outline', showIcon: false, closable: false } },
      });

      expect(plain.getAttribute('data-kui-size')).toBe('sm');
      expect(plain.getAttribute('data-kui-shape')).toBe('outline');
      expect(plain.querySelector('.kui-alert__icon')).toBeNull();
      expect(plain.querySelector('.kui-alert__close')).toBeNull();
    });

    it('lets local inputs win', () => {
      const { local } = create(AlertHost, {
        defaults: { alert: { size: 'sm', shape: 'outline', showIcon: false, closable: false } },
      });

      expect(local.getAttribute('data-kui-size')).toBe('md');
      expect(local.getAttribute('data-kui-shape')).toBe('soft');
      expect(local.querySelector('.kui-alert__icon')).not.toBeNull();
      expect(local.querySelector('.kui-alert__close')).not.toBeNull();
    });

    it('follows a runtime change', () => {
      const { fixture, plain } = create(AlertHost);

      TestBed.inject(KuiDefaults).set('alert', { shape: 'solid', closable: false });
      fixture.detectChanges();

      expect(plain.getAttribute('data-kui-shape')).toBe('solid');
      expect(plain.querySelector('.kui-alert__close')).toBeNull();
    });
  });

  describe('card', () => {
    it('keeps the built-in size and appearance without defaults', () => {
      const { plain } = create(CardHost);

      expect(plain.getAttribute('data-kui-size')).toBe('md');
      expect(plain.getAttribute('data-kui-appearance')).toBe('surface');
    });

    it('applies the configured size and appearance', () => {
      const { plain } = create(CardHost, {
        defaults: { card: { size: 'lg', appearance: 'elevated' } },
      });

      expect(plain.getAttribute('data-kui-size')).toBe('lg');
      expect(plain.getAttribute('data-kui-appearance')).toBe('elevated');
    });

    it('lets local inputs win', () => {
      const { local } = create(CardHost, {
        defaults: { card: { size: 'lg', appearance: 'elevated' } },
      });

      expect(local.getAttribute('data-kui-size')).toBe('md');
      expect(local.getAttribute('data-kui-appearance')).toBe('surface');
    });

    it('follows a runtime change', () => {
      const { fixture, plain } = create(CardHost);

      TestBed.inject(KuiDefaults).set('card', { size: 'sm', appearance: 'sunken' });
      fixture.detectChanges();

      expect(plain.getAttribute('data-kui-size')).toBe('sm');
      expect(plain.getAttribute('data-kui-appearance')).toBe('sunken');
    });
  });

  describe('tabs', () => {
    it('keeps the built-in look without defaults', () => {
      const { plain } = create(TabsHost);

      expect(plain.getAttribute('data-kui-size')).toBe('md');
      expect(plain.getAttribute('data-kui-variant')).toBe('line');
      expect(plain.getAttribute('data-kui-orientation')).toBeNull();
      expect(plain.querySelector('[role="tablist"]')?.getAttribute('aria-orientation')).toBe(
        'horizontal',
      );
    });

    it('applies the configured size, variant and orientation', () => {
      const { plain } = create(TabsHost, {
        defaults: { tabs: { size: 'lg', variant: 'pill', orientation: 'vertical' } },
      });

      expect(plain.getAttribute('data-kui-size')).toBe('lg');
      expect(plain.getAttribute('data-kui-variant')).toBe('pill');
      expect(plain.getAttribute('data-kui-orientation')).toBe('vertical');
      expect(plain.querySelector('[role="tablist"]')?.getAttribute('aria-orientation')).toBe(
        'vertical',
      );
    });

    it('lets local inputs win', () => {
      const { local } = create(TabsHost, {
        defaults: { tabs: { size: 'lg', variant: 'pill', orientation: 'vertical' } },
      });

      expect(local.getAttribute('data-kui-size')).toBe('md');
      expect(local.getAttribute('data-kui-variant')).toBe('line');
      expect(local.getAttribute('data-kui-orientation')).toBeNull();
    });

    it('follows a runtime change', () => {
      const { fixture, plain } = create(TabsHost);

      TestBed.inject(KuiDefaults).set('tabs', { variant: 'pill', orientation: 'vertical' });
      fixture.detectChanges();

      expect(plain.getAttribute('data-kui-variant')).toBe('pill');
      expect(plain.getAttribute('data-kui-orientation')).toBe('vertical');
    });
  });

  describe('stepper', () => {
    function upcomingIsClickable(el: HTMLElement): boolean {
      return el.querySelectorAll('kui-step')[1].querySelector('button.kui-step-circle') !== null;
    }

    it('keeps the built-in look without defaults', () => {
      const { plain } = create(StepperHost);

      expect(plain.getAttribute('data-kui-size')).toBe('md');
      expect(plain.getAttribute('data-kui-orientation')).toBeNull();
      expect(plain.getAttribute('data-kui-compact')).toBeNull();
      expect(upcomingIsClickable(plain)).toBe(false);
    });

    it('applies the configured size, orientation, linear and compact', () => {
      const { plain } = create(StepperHost, {
        defaults: {
          stepper: { size: 'lg', orientation: 'vertical', linear: false, compact: true },
        },
      });

      expect(plain.getAttribute('data-kui-size')).toBe('lg');
      expect(plain.getAttribute('data-kui-orientation')).toBe('vertical');
      expect(plain.getAttribute('data-kui-compact')).toBe('');
      expect(upcomingIsClickable(plain)).toBe(true);
    });

    it('lets local inputs win', () => {
      const { local } = create(StepperHost, {
        defaults: {
          stepper: { size: 'lg', orientation: 'vertical', linear: false, compact: true },
        },
      });

      expect(local.getAttribute('data-kui-size')).toBe('md');
      expect(local.getAttribute('data-kui-orientation')).toBeNull();
      expect(local.getAttribute('data-kui-compact')).toBeNull();
      expect(upcomingIsClickable(local)).toBe(false);
    });

    it('follows a runtime change', () => {
      const { fixture, plain } = create(StepperHost);

      TestBed.inject(KuiDefaults).set('stepper', { linear: false, compact: true });
      fixture.detectChanges();

      expect(plain.getAttribute('data-kui-compact')).toBe('');
      expect(upcomingIsClickable(plain)).toBe(true);
    });
  });

  describe('tree', () => {
    it('keeps the built-in size and mode without defaults', () => {
      const { plain } = create(TreeHost);

      expect(plain.getAttribute('data-kui-size')).toBe('md');
      expect(plain.getAttribute('aria-multiselectable')).toBeNull();
      expect(plain.querySelector('[role="treeitem"]')?.getAttribute('aria-selected')).toBe('false');
    });

    it('applies the configured size and mode', () => {
      const { plain } = create(TreeHost, { defaults: { tree: { size: 'lg', mode: 'checkable' } } });

      expect(plain.getAttribute('data-kui-size')).toBe('lg');
      expect(plain.getAttribute('aria-multiselectable')).toBe('true');
      expect(plain.querySelector('[role="treeitem"]')?.getAttribute('aria-checked')).toBe('false');
    });

    it('lets local inputs win', () => {
      const { local } = create(TreeHost, { defaults: { tree: { size: 'lg', mode: 'checkable' } } });

      expect(local.getAttribute('data-kui-size')).toBe('md');
      expect(local.getAttribute('aria-multiselectable')).toBeNull();
      expect(local.querySelector('[role="treeitem"]')?.getAttribute('aria-checked')).toBeNull();
    });

    it('follows a runtime change', () => {
      const { fixture, plain } = create(TreeHost);

      TestBed.inject(KuiDefaults).set('tree', { size: 'sm', mode: 'checkable' });
      fixture.detectChanges();

      expect(plain.getAttribute('data-kui-size')).toBe('sm');
      expect(plain.getAttribute('aria-multiselectable')).toBe('true');
    });
  });

  describe('group', () => {
    it('keeps the built-in look without defaults', () => {
      const { plain } = create(GroupHost);

      expect(plain.getAttribute('data-kui-size')).toBe('md');
      expect(plain.getAttribute('data-kui-orientation')).toBe('horizontal');
      expect(plain.getAttribute('data-kui-collapsed')).toBeNull();
      expect(plain.getAttribute('data-kui-rounded')).toBe('');
    });

    it('applies the configured size, orientation, collapsed and rounded', () => {
      const { plain } = create(GroupHost, {
        defaults: {
          group: { size: 'lg', orientation: 'vertical', collapsed: true, rounded: false },
        },
      });

      expect(plain.getAttribute('data-kui-size')).toBe('lg');
      expect(plain.getAttribute('data-kui-orientation')).toBe('vertical');
      expect(plain.getAttribute('data-kui-collapsed')).toBe('');
      expect(plain.getAttribute('data-kui-rounded')).toBeNull();
    });

    it('lets local inputs win', () => {
      const { local } = create(GroupHost, {
        defaults: {
          group: { size: 'lg', orientation: 'vertical', collapsed: true, rounded: false },
        },
      });

      expect(local.getAttribute('data-kui-size')).toBe('md');
      expect(local.getAttribute('data-kui-orientation')).toBe('horizontal');
      expect(local.getAttribute('data-kui-collapsed')).toBeNull();
      expect(local.getAttribute('data-kui-rounded')).toBe('');
    });

    it('follows a runtime change', () => {
      const { fixture, plain } = create(GroupHost);

      TestBed.inject(KuiDefaults).set('group', { orientation: 'vertical', collapsed: true });
      fixture.detectChanges();

      expect(plain.getAttribute('data-kui-orientation')).toBe('vertical');
      expect(plain.getAttribute('data-kui-collapsed')).toBe('');
    });
  });
});
