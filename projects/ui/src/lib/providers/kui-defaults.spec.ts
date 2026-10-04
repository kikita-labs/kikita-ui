import {
  computed,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { KuiButtonShape } from '../components/button/kui-button-shape.type';
import { provideKikitaUi } from '../root';
import { KuiDefaults } from './kui-defaults';
import type { KuiDefaultsSource } from './kui-defaults.interface';
import { provideKuiDefaults } from './provide-kui-defaults';

function nested(
  source: KuiDefaultsSource,
  parent = TestBed.inject(EnvironmentInjector),
): KuiDefaults {
  return createEnvironmentInjector([provideKuiDefaults(source)], parent).get(KuiDefaults);
}

describe('KuiDefaults', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('is empty without any provider', () => {
    expect(TestBed.inject(KuiDefaults).effective()).toEqual({});
  });

  it('is seeded by provideKikitaUi', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ defaults: { size: 'sm', button: { shape: 'ghost' } } })],
    });

    expect(TestBed.inject(KuiDefaults).effective()).toEqual({
      size: 'sm',
      button: { shape: 'ghost' },
    });
  });

  it('runs a function seed in an injection context and tracks the signals it returns', () => {
    const shape = signal<KuiButtonShape>('solid');

    TestBed.configureTestingModule({
      providers: [
        { provide: 'shape', useValue: shape },
        provideKikitaUi({
          defaults: () => {
            const source = inject<typeof shape>('shape' as never);

            return { button: { shape: computed(() => source()) } };
          },
        }),
      ],
    });

    const defaults = TestBed.inject(KuiDefaults);

    expect(defaults.get('button')()?.shape).toBe('solid');

    shape.set('ghost');

    expect(defaults.get('button')()?.shape).toBe('ghost');
  });

  it('merges a nested level per component key and per property without touching the parent', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({
          defaults: {
            size: 'sm',
            button: { shape: 'ghost', size: 'sm' },
            select: { clearable: true },
          },
        }),
      ],
    });

    const root = TestBed.inject(KuiDefaults);
    const child = nested({ button: { size: 'lg' } });

    expect(child.effective()).toEqual({
      size: 'sm',
      button: { shape: 'ghost', size: 'lg' },
      select: { clearable: true },
    });
    expect(root.effective().button).toEqual({ shape: 'ghost', size: 'sm' });
  });

  it('lets false override an inherited true and undefined inherit it', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({ defaults: { select: { clearable: true, maxVisibleChips: 3 } } }),
      ],
    });

    const off = nested({ select: { clearable: false } });
    const inherit = nested({ select: { clearable: undefined } });

    expect(off.effective().select).toEqual({ clearable: false, maxVisibleChips: 3 });
    expect(inherit.effective().select).toEqual({ clearable: true, maxVisibleChips: 3 });
  });

  it('does not inherit the seed of the parent level as its own layer', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ defaults: { button: { shape: 'ghost' } } })],
    });

    const child = nested({});

    child.set('button', { size: 'sm' });

    expect(child.effective().button).toEqual({ shape: 'ghost', size: 'sm' });
    expect(TestBed.inject(KuiDefaults).effective().button).toEqual({ shape: 'ghost' });
  });

  it('passes a change of a parent signal to the child level', () => {
    const shape = signal<KuiButtonShape>('solid');

    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ defaults: { button: { shape } } })],
    });

    const child = nested({ button: { size: 'sm' } });

    expect(child.effective().button).toEqual({ shape: 'solid', size: 'sm' });

    shape.set('outline');

    expect(child.effective().button).toEqual({ shape: 'outline', size: 'sm' });
  });

  describe('set and update', () => {
    it('merges object options into the layer of this level', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { button: { shape: 'ghost' } } })],
      });

      const defaults = TestBed.inject(KuiDefaults);

      defaults.set('button', { size: 'sm' });

      expect(defaults.effective().button).toEqual({ shape: 'ghost', size: 'sm' });
    });

    it('replaces the global size', () => {
      const defaults = TestBed.inject(KuiDefaults);

      defaults.set('size', 'sm');
      defaults.set('size', 'lg');

      expect(defaults.effective().size).toBe('lg');
    });

    it('accepts a signal for a property and follows it', () => {
      const defaults = TestBed.inject(KuiDefaults);
      const shape = signal<KuiButtonShape>('solid');

      defaults.set('button', { shape });
      shape.set('ghost');

      expect(defaults.get('button')()?.shape).toBe('ghost');
    });

    it('update receives the resolved options of this level', () => {
      const defaults = TestBed.inject(KuiDefaults);

      defaults.set('select', { clearable: true });
      defaults.update('select', (current) => ({ clearable: !current?.clearable }));

      expect(defaults.effective().select).toEqual({ clearable: false });
    });

    it('never writes to the parent level', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { select: { clearable: true } } })],
      });

      const child = nested({});

      child.set('select', { clearable: false });

      expect(TestBed.inject(KuiDefaults).effective().select).toEqual({ clearable: true });
    });
  });

  it('keeps separate injectors isolated even when they share one source object', () => {
    const source = { button: { shape: 'ghost' as const } };
    const first = createEnvironmentInjector(
      [provideKikitaUi({ defaults: source })],
      TestBed.inject(EnvironmentInjector),
    ).get(KuiDefaults);
    const second = createEnvironmentInjector(
      [provideKikitaUi({ defaults: source })],
      TestBed.inject(EnvironmentInjector),
    ).get(KuiDefaults);

    first.set('button', { size: 'sm' });

    expect(first.effective().button).toEqual({ shape: 'ghost', size: 'sm' });
    expect(second.effective().button).toEqual({ shape: 'ghost' });
    expect(source).toEqual({ button: { shape: 'ghost' } });
  });
});

describe('KuiDefaults with several providers on one level', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('combines them in provider order, the later one winning per property', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({ defaults: { size: 'sm', button: { shape: 'ghost', size: 'sm' } } }),
        provideKuiDefaults({ button: { size: 'lg' }, select: { clearable: true } }),
      ],
    });

    expect(TestBed.inject(KuiDefaults).effective()).toEqual({
      size: 'sm',
      button: { shape: 'ghost', size: 'lg' },
      select: { clearable: true },
    });
  });
});
