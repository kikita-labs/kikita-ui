import { Component, PLATFORM_ID } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { KuiField } from '../field';
import { KuiColorInput } from './kui-color-input.directive';

@Component({
  imports: [KuiColorInput],
  template: '<input kuiColorInput value="#5b4fe0" size="sm" />',
})
class ColorInputHost {}

@Component({
  imports: [KuiColorInput],
  template: '<input kuiColorInput value="#5b4fe0" readonly />',
})
class ReadonlyColorInputHost {}

@Component({
  imports: [KuiField, KuiColorInput],
  template: `
    <kui-field label="Primary seed" hint="Hex or oklch().">
      <input kuiColorInput value="oklch(0.52 0.25 285)" />
    </kui-field>
  `,
})
class FieldColorInputHost {}

describe('KuiColorInput', () => {
  it('wraps the native input with a swatch and size state', () => {
    const fixture = createFixture(ColorInputHost);

    const wrapper = fixture.nativeElement.querySelector('.kui-color-input') as HTMLElement;
    const input = fixture.nativeElement.querySelector('input[kuiColorInput]') as HTMLInputElement;
    const swatch = fixture.nativeElement.querySelector(
      '.kui-color-input__swatch',
    ) as HTMLButtonElement;

    expect(wrapper).toBeTruthy();
    expect(wrapper.getAttribute('data-kui-size')).toBe('sm');
    expect(input.classList.contains('kui-color-input__control')).toBe(true);
    expect(swatch.getAttribute('aria-label')).toContain('#5b4fe0');
    expect(swatch.hasAttribute('title')).toBe(false);
  });

  it('uses Kikita tooltips for generated picker controls', () => {
    const fixture = createFixture(ColorInputHost);
    const swatch = fixture.nativeElement.querySelector(
      '.kui-color-input__swatch',
    ) as HTMLButtonElement;

    swatch.dispatchEvent(new Event('mouseenter'));

    const swatchTooltip = document.querySelector('.kui-tooltip') as HTMLElement;

    expect(swatchTooltip?.textContent).toBe('#5b4fe0');
    expect(swatch.getAttribute('aria-describedby')).toBe(swatchTooltip.id);

    swatch.dispatchEvent(new Event('mouseleave'));
    swatch.click();
    fixture.detectChanges();

    const preset = document.querySelector('.kui-color-input-preset') as HTMLButtonElement;
    preset.dispatchEvent(new Event('mouseenter'));

    const tooltips = document.querySelectorAll('.kui-tooltip');
    const presetTooltip = tooltips[tooltips.length - 1] as HTMLElement;

    expect(presetTooltip?.textContent).toContain('Primary seed');
    expect(preset.hasAttribute('title')).toBe(false);
  });

  it('uses parent field ids and descriptions', () => {
    const fixture = createFixture(FieldColorInputHost);

    const field = fixture.nativeElement.querySelector('kui-field') as HTMLElement;
    const label = field.querySelector('label') as HTMLLabelElement;
    const input = field.querySelector('input[kuiColorInput]') as HTMLInputElement;

    expect(input.id).toBeTruthy();
    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toContain(`${input.id}-hint`);
  });

  it('marks unsupported color values invalid', () => {
    const fixture = createFixture(ColorInputHost);
    const input = fixture.nativeElement.querySelector('input[kuiColorInput]') as HTMLInputElement;

    input.value = 'not-a-color';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.kui-color-input') as HTMLElement;

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(wrapper.hasAttribute('data-kui-invalid')).toBe(true);
  });

  it('opens the Kikita picker even when the typed value is invalid', () => {
    const fixture = createFixture(ColorInputHost);
    const input = fixture.nativeElement.querySelector('input[kuiColorInput]') as HTMLInputElement;
    const swatch = fixture.nativeElement.querySelector(
      '.kui-color-input__swatch',
    ) as HTMLButtonElement;

    input.value = 'not-a-color';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    swatch.click();
    fixture.detectChanges();

    expect(document.querySelector('.kui-color-input-popover')).toBeTruthy();
    expect(swatch.disabled).toBe(false);
  });

  it('keeps its own dropdown out of the surrounding field', () => {
    const fixture = createFixture(FieldColorInputHost);
    const swatch = fixture.nativeElement.querySelector(
      '.kui-color-input__swatch',
    ) as HTMLButtonElement;
    const field = fixture.debugElement.query(By.directive(KuiField)).componentInstance as KuiField;

    swatch.click();
    fixture.detectChanges();

    expect(document.querySelector('.kui-color-input-popover')).toBeTruthy();
    expect(field.getDropdown()).toBeUndefined();
    expect(
      fixture.nativeElement.querySelector('kui-field').hasAttribute('data-dropdown-open'),
    ).toBe(false);
  });

  it('hides the chevron trigger when readonly', () => {
    const fixture = createFixture(ReadonlyColorInputHost);

    const trigger = fixture.nativeElement.querySelector(
      '.kui-color-input__trigger',
    ) as HTMLButtonElement;
    const swatch = fixture.nativeElement.querySelector(
      '.kui-color-input__swatch',
    ) as HTMLButtonElement;

    expect(trigger.hidden).toBe(true);
    expect(swatch.disabled).toBe(true);
  });

  it('keeps the picker thumb at the selected OKLCH position after RGB clipping', () => {
    const fixture = createFixture(ColorInputHost);
    const swatch = fixture.nativeElement.querySelector(
      '.kui-color-input__swatch',
    ) as HTMLButtonElement;

    swatch.click();
    fixture.detectChanges();

    const picker = document.querySelector('.kui-color-input-picker') as HTMLElement;
    Object.defineProperty(picker, 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, width: 100, height: 100 }),
    });

    const event = new Event('pointerdown', { bubbles: true }) as PointerEvent;
    Object.defineProperties(event, {
      clientX: { value: 100 },
      clientY: { value: 76 },
      pointerId: { value: 1 },
    });
    picker.dispatchEvent(event);
    fixture.detectChanges();

    const thumb = document.querySelector('.kui-color-input-thumb') as HTMLElement;

    expect(thumb.style.left).toBe('100%');
  });
});

describe('KuiColorInput on the server', () => {
  it('leaves the native input unwrapped so hydration can match the template DOM', async () => {
    await TestBed.configureTestingModule({
      imports: [ColorInputHost],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ColorInputHost);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.kui-color-input')).toBeNull();
    expect(fixture.nativeElement.querySelector('input[kuiColorInput]')).not.toBeNull();
  });
});

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [component],
  });

  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();

  return fixture;
}
