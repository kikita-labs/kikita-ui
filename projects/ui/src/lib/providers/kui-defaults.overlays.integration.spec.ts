import { FlexibleConnectedPositionStrategy, OverlayContainer } from '@angular/cdk/overlay';
import {
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
  viewChild,
} from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiDialogService } from '../components/dialog/kui-dialog.service';
import type { KuiDialogContext } from '../components/dialog/kui-dialog-context.token';
import { KUI_DIALOG_CONTEXT } from '../components/dialog/kui-dialog-context.token';
import { KuiDrawerService } from '../components/drawer/kui-drawer.service';
import type { KuiDrawerContext } from '../components/drawer/kui-drawer-context.token';
import { KUI_DRAWER_CONTEXT } from '../components/drawer/kui-drawer-context.token';
import { KuiDropdownComponent } from '../components/dropdown/kui-dropdown.component';
import { KuiDropdownForDirective } from '../components/dropdown/kui-dropdown-for.directive';
import { KuiOptionDirective } from '../components/dropdown/kui-option.directive';
import { KuiMenuComponent } from '../components/menu/kui-menu.component';
import { KuiMenuForDirective } from '../components/menu/kui-menu-for.directive';
import { KuiMenuItemDirective } from '../components/menu/kui-menu-item.directive';
import { KuiPopoverComponent } from '../components/popover/kui-popover.component';
import { KuiPopoverForDirective } from '../components/popover/kui-popover-for.directive';
import { KuiTooltipDirective } from '../components/tooltip/kui-tooltip.directive';
import { provideKikitaUi } from '../root';
import { KuiDefaults } from './kui-defaults.service';
import { kuiProvideDefaults } from './provide-kui-defaults';

@Component({ template: `<p>Dialog</p>` })
class DialogContent {
  readonly dialogContext = inject(KUI_DIALOG_CONTEXT) as KuiDialogContext<void, unknown>;
}

@Component({
  template: `<p
    data-testid="drawer-content"
    [attr.data-side]="drawerContext.side"
    [attr.data-size]="drawerContext.size"
  >
    Drawer
  </p>`,
})
class DrawerContent {
  readonly drawerContext = inject(KUI_DRAWER_CONTEXT) as KuiDrawerContext<void, unknown>;
}

@Component({
  imports: [KuiMenuComponent, KuiMenuForDirective, KuiMenuItemDirective],
  template: `
    <button type="button" [kuiMenuFor]="menu" id="default-trigger">Actions</button>
    <kui-menu #menu><button type="button" kuiMenuItem>Open</button></kui-menu>
    <button type="button" [kuiMenuFor]="local" id="local-trigger">Local</button>
    <kui-menu #local [minWidth]="null"><button type="button" kuiMenuItem>Open</button></kui-menu>
  `,
})
class MenuHost {}

@Component({
  imports: [KuiPopoverComponent, KuiPopoverForDirective],
  template: `
    <button type="button" [kuiPopoverFor]="pop">Open</button>
    <kui-popover #pop>Content</kui-popover>
    <button type="button" [kuiPopoverFor]="plain">Plain</button>
    <kui-popover #plain [arrow]="false">Plain</kui-popover>
  `,
})
class PopoverHost {
  readonly pop = viewChild.required<KuiPopoverComponent>('pop');
}

@Component({
  imports: [KuiDropdownComponent, KuiDropdownForDirective, KuiOptionDirective],
  template: `
    <button id="trigger" type="button" [kuiDropdownFor]="dropdown">Open</button>
    <kui-dropdown #dropdown>
      <div kuiOption value="first">First</div>
    </kui-dropdown>
  `,
})
class DropdownHost {
  readonly dropdown = viewChild.required(KuiDropdownComponent);
}

function panel(): HTMLElement | null {
  return TestBed.inject(OverlayContainer)
    .getContainerElement()
    .querySelector('.kui-popover, .kui-menu');
}

describe('KuiDefaults read by overlays', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
    TestBed.resetTestingModule();
  });

  function create<T>(type: new () => T): ComponentFixture<T> {
    const fixture = TestBed.createComponent(type);
    fixture.detectChanges();

    return fixture;
  }

  describe('dialog and drawer services', () => {
    it('opens a dialog with the configured size and closable, and a local config wins', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { dialog: { size: 'lg', closable: false } } })],
      });
      const service = TestBed.inject(KuiDialogService);
      const overlay = TestBed.inject(OverlayContainer);

      service.open(DialogContent, {});
      TestBed.tick();

      const container = overlay.getContainerElement();

      expect(container.querySelector('.kui-dialog--lg')).not.toBeNull();
      expect(container.querySelector('.kui-dialog-close')).toBeNull();
    });

    it('reads the defaults of the injector passed with the config, and a local size wins', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { dialog: { size: 'lg' } } })],
      });
      const nested = createEnvironmentInjector(
        [kuiProvideDefaults({ dialog: { size: 'sm' } })],
        TestBed.inject(EnvironmentInjector),
      );
      const container = TestBed.inject(OverlayContainer).getContainerElement();
      const service = TestBed.inject(KuiDialogService);

      service.open(DialogContent, { injector: nested });
      TestBed.tick();

      expect(container.querySelector('.kui-dialog--sm')).not.toBeNull();
      expect(container.querySelector('.kui-dialog--lg')).toBeNull();
    });

    it('opens a drawer from the configured side and size', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { drawer: { side: 'left', size: 'lg' } } })],
      });

      TestBed.inject(KuiDrawerService).open(DrawerContent, {});
      TestBed.tick();

      const content = TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector('[data-testid="drawer-content"]');

      expect(content?.getAttribute('data-side')).toBe('left');
      expect(content?.getAttribute('data-size')).toBe('lg');
    });

    it('lets a local drawer config win over the defaults', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { drawer: { side: 'left' } } })],
      });

      TestBed.inject(KuiDrawerService).open(DrawerContent, { side: 'top' });
      TestBed.tick();

      expect(
        TestBed.inject(OverlayContainer)
          .getContainerElement()
          .querySelector('[data-testid="drawer-content"]')
          ?.getAttribute('data-side'),
      ).toBe('top');
    });
  });

  describe('menu', () => {
    it('applies the default min width and lets a local null remove it', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { menu: { minWidth: '260px' } } })],
      });
      const fixture = create(MenuHost);
      const host = fixture.nativeElement as HTMLElement;

      host.querySelector<HTMLButtonElement>('#default-trigger')!.click();
      fixture.detectChanges();

      expect(panel()?.style.minInlineSize).toBe('260px');
    });

    it('lets a local null min width remove the default', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { menu: { minWidth: '260px' } } })],
      });
      const fixture = create(MenuHost);

      (fixture.nativeElement as HTMLElement)
        .querySelector<HTMLButtonElement>('#local-trigger')!
        .click();
      fixture.detectChanges();

      expect(panel()?.style.minInlineSize).toBe('');
    });
  });

  describe('dropdown', () => {
    async function openAndSelect(fixture: ComponentFixture<DropdownHost>): Promise<void> {
      (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('#trigger')!.click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const option = TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector<HTMLElement>('.kui-listbox-option');

      expect(option).not.toBeNull();

      option!.click();
      fixture.detectChanges();
    }

    it('closes after a selection by default', async () => {
      TestBed.configureTestingModule({ providers: [provideKikitaUi()] });
      const fixture = create(DropdownHost);

      await openAndSelect(fixture);

      expect(fixture.componentInstance.dropdown().openState()).toBe(false);
    });

    it('stays open after a selection when closeOnSelect is false in the defaults', async () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { dropdown: { closeOnSelect: false } } })],
      });
      const fixture = create(DropdownHost);

      await openAndSelect(fixture);

      expect(fixture.componentInstance.dropdown().openState()).toBe(true);
    });
  });

  describe('popover', () => {
    it('shows the arrow by default from the defaults and lets a local false hide it', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { popover: { arrow: true } } })],
      });
      const fixture = create(PopoverHost);
      const host = fixture.nativeElement as HTMLElement;

      host.querySelectorAll<HTMLButtonElement>('button')[0]!.click();
      fixture.detectChanges();

      expect(panel()?.querySelector('.kui-popover-arrow')).not.toBeNull();
    });

    it('resolves the trigger type from the defaults for the trigger directive', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { popover: { triggerType: 'hover' } } })],
      });
      const fixture = create(PopoverHost);

      expect(fixture.componentInstance.pop().effectiveTriggerType()).toBe('hover');
    });

    it('follows a runtime change of the default', () => {
      TestBed.configureTestingModule({ providers: [provideKikitaUi()] });
      const fixture = create(PopoverHost);

      expect(fixture.componentInstance.pop().effectiveTriggerType()).toBe('click');

      TestBed.inject(KuiDefaults).set('popover', { triggerType: 'hover' });

      expect(fixture.componentInstance.pop().effectiveTriggerType()).toBe('hover');
    });
  });
});

@Component({
  imports: [KuiTooltipDirective],
  template: `
    <button id="default" [kuiTooltip]="'Info'">Default</button>
    <button id="local" [kuiTooltip]="'Info'" placement="left" [offset]="2">Local</button>
  `,
})
class TooltipHost {}

describe('KuiDefaults read by the tooltip placement and offset', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  function hover(button: HTMLElement): void {
    button.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse', bubbles: true }));
  }

  it('uses the placement and offset from the defaults and lets local inputs win', () => {
    vi.useFakeTimers();
    const withPositions = vi.spyOn(FlexibleConnectedPositionStrategy.prototype, 'withPositions');

    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ defaults: { tooltip: { placement: 'bottom', offset: 20 } } })],
    });
    const fixture = TestBed.createComponent(TooltipHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    hover(host.querySelector<HTMLElement>('#default')!);
    fixture.detectChanges();

    const tooltip = document.querySelector('.kui-tooltip');

    expect(tooltip?.getAttribute('data-kui-placement')).toBe('bottom');
    expect(withPositions.mock.lastCall?.[0][0]?.offsetY).toBe(20);

    host
      .querySelector<HTMLElement>('#default')!
      .dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse', bubbles: true }));
    vi.runAllTimers();
    hover(host.querySelector<HTMLElement>('#local')!);
    fixture.detectChanges();

    expect(withPositions.mock.lastCall?.[0][0]?.offsetX).toBe(-2);
  });
});
