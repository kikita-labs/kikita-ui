import { OverlayContainer } from '@angular/cdk/overlay';
import {
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KuiChipDirective } from '../components/chip/kui-chip.directive';
import { KuiDialogService } from '../components/dialog/kui-dialog.service';
import type { KuiDialogContext } from '../components/dialog/kui-dialog-context.token';
import { KUI_DIALOG_CONTEXT } from '../components/dialog/kui-dialog-context.token';
import { KuiDrawerService } from '../components/drawer/kui-drawer.service';
import type { KuiDrawerContext } from '../components/drawer/kui-drawer-context.token';
import { KUI_DRAWER_CONTEXT } from '../components/drawer/kui-drawer-context.token';
import { KuiDropdownComponent } from '../components/dropdown/kui-dropdown.component';
import { KuiOptionDirective } from '../components/dropdown/kui-option.directive';
import { KuiFieldComponent } from '../components/field/kui-field.component';
import type { KuiIconGlyph } from '../components/icon/kui-icon-glyph.type';
import { provideKuiIcons } from '../components/icon/provide-kui-icons';
import { KuiSelectDirective } from '../components/select/kui-select.directive';
import { provideKikitaUi } from '../root';
import { KuiDefaults } from './kui-defaults.service';
import { kuiProvideDefaults } from './provide-kui-defaults';

const ROLE_GLYPH: KuiIconGlyph = { node: [['path', { d: 'M1 1 role' }]] };
const SLOT_GLYPH: KuiIconGlyph = { node: [['path', { d: 'M2 2 slot' }]] };
const NESTED_GLYPH: KuiIconGlyph = { node: [['path', { d: 'M3 3 nested' }]] };
const BROKEN_GLYPH = { node: [['script', { d: 'x' }]] } as unknown as KuiIconGlyph;

@Component({ template: `<p>Dialog</p>` })
class DialogContent {
  readonly dialogContext = inject(KUI_DIALOG_CONTEXT) as KuiDialogContext<void, unknown>;
}

@Component({ template: `<p>Drawer</p>` })
class DrawerContent {
  readonly drawerContext = inject(KUI_DRAWER_CONTEXT) as KuiDrawerContext<void, unknown>;
}

@Component({
  imports: [KuiChipDirective],
  template: `<span kuiChip removable removeLabel="Remove Backend">Backend</span>`,
})
class ChipHost {}

@Component({
  imports: [KuiFieldComponent, KuiSelectDirective, KuiDropdownComponent, KuiOptionDirective],
  template: `
    <kui-field>
      <input kuiSelect [clearable]="true" [(value)]="value" />
      <kui-dropdown>
        <div kuiOption value="a">Option A</div>
      </kui-dropdown>
    </kui-field>
  `,
})
class SelectHost {
  readonly value = signal<string | null>('a');
}

function glyphPaths(root: ParentNode, selector: string): string[] {
  return Array.from(root.querySelectorAll(`${selector} svg path`)).map(
    (path) => path.getAttribute('d') ?? '',
  );
}

describe('KuiDefaults structural icons', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('built-in glyphs', () => {
    it('draws the built-in cross and chevron when nothing is configured', () => {
      TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

      const dialogContainer = TestBed.inject(OverlayContainer).getContainerElement();
      TestBed.inject(KuiDialogService).open(DialogContent, {});
      TestBed.tick();

      expect(glyphPaths(dialogContainer, '.kui-dialog-close')).toEqual([
        'M18 6 6 18',
        'm6 6 12 12',
      ]);

      const fixture = TestBed.createComponent(SelectHost);
      fixture.detectChanges();

      expect(glyphPaths(fixture.nativeElement, '.kui-select-chevron')).toEqual(['m6 9 6 6 6-6']);
    });

    it('renders the glyph as a real svg with the call-site stroke weight and no stroke attribute', () => {
      TestBed.configureTestingModule({ providers: [provideKikitaUi()] });
      TestBed.inject(KuiDialogService).open(DialogContent, {});
      TestBed.tick();

      const svg = TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector('.kui-dialog-close svg') as SVGElement;

      expect(svg.getAttribute('width')).toBe('16');
      expect(svg.style.getPropertyValue('--_kui-glyph-stroke')).toBe('1.5');
      expect(svg.getAttribute('stroke')).toBe('currentColor');
      expect(svg.hasAttribute('stroke-width')).toBe(false);
    });
  });

  describe('roles', () => {
    it('lets the close role change dialogs and drawers, and the clear and chevron roles change a select', () => {
      TestBed.configureTestingModule({
        providers: [
          provideKikitaUi({
            defaults: {
              icons: { close: ROLE_GLYPH, clear: ROLE_GLYPH, pickerChevron: SLOT_GLYPH },
            },
          }),
        ],
      });
      const container = TestBed.inject(OverlayContainer).getContainerElement();

      TestBed.inject(KuiDialogService).open(DialogContent, {});
      TestBed.inject(KuiDrawerService).open(DrawerContent, {});
      TestBed.tick();

      expect(glyphPaths(container, '.kui-dialog-close')).toEqual(['M1 1 role']);
      expect(glyphPaths(container, '.kui-drawer-close')).toEqual(['M1 1 role']);

      const fixture = TestBed.createComponent(SelectHost);
      fixture.detectChanges();

      expect(glyphPaths(fixture.nativeElement, '.kui-select-clear')).toEqual(['M1 1 role']);
      expect(glyphPaths(fixture.nativeElement, '.kui-select-chevron')).toEqual(['M2 2 slot']);
    });

    it('lets the remove role change a chip, including its default remove button', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { icons: { remove: ROLE_GLYPH } } })],
      });

      const fixture = TestBed.createComponent(ChipHost);
      fixture.detectChanges();

      expect(glyphPaths(fixture.nativeElement, '.kui-chip-remove')).toEqual(['M1 1 role']);
    });
  });

  describe('precedence', () => {
    it('lets a component slot win over its role, and the role win over the built-in glyph', () => {
      TestBed.configureTestingModule({
        providers: [
          provideKikitaUi({
            defaults: {
              icons: { close: ROLE_GLYPH, remove: ROLE_GLYPH },
              dialog: { closeIcon: SLOT_GLYPH },
              chip: { removeIcon: SLOT_GLYPH },
            },
          }),
        ],
      });
      const container = TestBed.inject(OverlayContainer).getContainerElement();

      TestBed.inject(KuiDialogService).open(DialogContent, {});
      TestBed.inject(KuiDrawerService).open(DrawerContent, {});
      TestBed.tick();

      expect(glyphPaths(container, '.kui-dialog-close')).toEqual(['M2 2 slot']);
      expect(glyphPaths(container, '.kui-drawer-close')).toEqual(['M1 1 role']);

      const fixture = TestBed.createComponent(ChipHost);
      fixture.detectChanges();

      expect(glyphPaths(fixture.nativeElement, '.kui-chip-remove')).toEqual(['M2 2 slot']);
    });

    it('ignores an invalid override and uses the next level', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      TestBed.configureTestingModule({
        providers: [
          provideKikitaUi({
            defaults: { icons: { close: ROLE_GLYPH }, dialog: { closeIcon: BROKEN_GLYPH } },
          }),
        ],
      });

      TestBed.inject(KuiDialogService).open(DialogContent, {});
      TestBed.tick();

      const container = TestBed.inject(OverlayContainer).getContainerElement();

      expect(glyphPaths(container, '.kui-dialog-close')).toEqual(['M1 1 role']);
      // A broken override never costs the control its accessible name or its behavior.
      expect(container.querySelector('.kui-dialog-close')?.getAttribute('aria-label')).toBe(
        'Close',
      );
    });

    it('is not touched by an icon registered under the same name for kui-icon', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi(), provideKuiIcons({ close: ROLE_GLYPH, clear: ROLE_GLYPH })],
      });

      TestBed.inject(KuiDialogService).open(DialogContent, {});
      TestBed.tick();

      expect(
        glyphPaths(TestBed.inject(OverlayContainer).getContainerElement(), '.kui-dialog-close'),
      ).toEqual(['M18 6 6 18', 'm6 6 12 12']);
    });

    it('falls back to the built-in glyph when every override is invalid', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { icons: { close: BROKEN_GLYPH } } })],
      });

      TestBed.inject(KuiDialogService).open(DialogContent, {});
      TestBed.tick();

      expect(
        glyphPaths(TestBed.inject(OverlayContainer).getContainerElement(), '.kui-dialog-close'),
      ).toEqual(['M18 6 6 18', 'm6 6 12 12']);
    });
  });

  describe('scope and runtime', () => {
    it('applies a nested level to dialogs opened with its injector without changing the root', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { icons: { close: ROLE_GLYPH } } })],
      });
      const nested = createEnvironmentInjector(
        [kuiProvideDefaults({ icons: { close: NESTED_GLYPH } })],
        TestBed.inject(EnvironmentInjector),
      );
      const container = TestBed.inject(OverlayContainer).getContainerElement();
      const service = TestBed.inject(KuiDialogService);

      service.open(DialogContent, { injector: nested });
      service.open(DialogContent, {});
      TestBed.tick();

      expect(glyphPaths(container, '.kui-dialog-close')).toEqual(['M3 3 nested', 'M1 1 role']);
      expect(TestBed.inject(KuiDefaults).effective().icons?.close).toBe(ROLE_GLYPH);
    });

    it('follows a runtime change of the defaults', () => {
      TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

      const fixture = TestBed.createComponent(SelectHost);
      fixture.detectChanges();

      expect(glyphPaths(fixture.nativeElement, '.kui-select-chevron')).toEqual(['m6 9 6 6 6-6']);

      TestBed.inject(KuiDefaults).set('icons', { pickerChevron: ROLE_GLYPH });
      fixture.detectChanges();

      expect(glyphPaths(fixture.nativeElement, '.kui-select-chevron')).toEqual(['M1 1 role']);

      TestBed.inject(KuiDefaults).set('select', { chevronIcon: SLOT_GLYPH });
      fixture.detectChanges();

      expect(glyphPaths(fixture.nativeElement, '.kui-select-chevron')).toEqual(['M2 2 slot']);
    });

    it('swaps the glyph of an existing chip remove button when the default changes', () => {
      TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

      const fixture = TestBed.createComponent(ChipHost);
      fixture.detectChanges();

      expect(glyphPaths(fixture.nativeElement, '.kui-chip-remove')).toEqual([
        'M18 6 6 18',
        'm6 6 12 12',
      ]);

      TestBed.inject(KuiDefaults).set('icons', { remove: ROLE_GLYPH });
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('.kui-chip-remove');

      expect(buttons).toHaveLength(1);
      expect(buttons[0].querySelectorAll('svg')).toHaveLength(1);
      expect(glyphPaths(fixture.nativeElement, '.kui-chip-remove')).toEqual(['M1 1 role']);
    });

    it('accepts a signal as a role value', () => {
      const glyph = signal<KuiIconGlyph>(ROLE_GLYPH);

      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { icons: { pickerChevron: glyph } } })],
      });

      const fixture = TestBed.createComponent(SelectHost);
      fixture.detectChanges();

      expect(glyphPaths(fixture.nativeElement, '.kui-select-chevron')).toEqual(['M1 1 role']);

      glyph.set(SLOT_GLYPH);
      fixture.detectChanges();

      expect(glyphPaths(fixture.nativeElement, '.kui-select-chevron')).toEqual(['M2 2 slot']);
    });
  });
});
