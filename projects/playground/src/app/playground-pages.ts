import { Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, email, form, minLength, required } from '@angular/forms/signals';

import {
  KUI_THEME,
  KuiBadgeDirective,
  KuiButtonDirective,
  KuiCardDirective,
  KuiCheckboxDirective,
  KuiFieldComponent,
  KuiGroupDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
  KuiInputDirective,
  KuiLoaderDirective,
  KuiRadioDirective,
  KuiSegmentDirective,
  KuiSegmentedComponent,
  KuiSwitchDirective,
  KuiTabDirective,
  KuiTabPanelDirective,
  KuiTabsComponent,
  KuiTextareaDirective,
  KuiTooltipDirective,
} from '@kikita-labs/ui';

import {
  BADGE_APPEARANCE_ROWS,
  BUTTON_VARIANTS,
  CHECK_STATE_ROWS,
  SELECTION_STATE_COLUMNS,
  SIZE_ROWS,
  STATE_COLUMNS,
  SWITCH_STATE_ROWS,
  createCssText,
  createPaletteRows,
  createPreviewStyle,
  createSeedRows,
  createSemanticRows,
} from './playground-data';

@Component({
  selector: 'app-tokens-page',
  imports: [],
  template: `
    <section class="panel pipeline">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Theme pipeline</h2>
          <p>Library source: <code>createKuiTheme(DEFAULT_KUI_THEME)</code></p>
        </div>
      </div>

      <div class="pipeline__steps">
        <article>
          <strong>Seed</strong>
          <code>--kui-seed-primary</code>
        </article>
        <article>
          <strong>Palette</strong>
          <code>--kui-primary-1..12</code>
        </article>
        <article>
          <strong>Semantic</strong>
          <code>--kui-color-primary-fill</code>
        </article>
        <article>
          <strong>Component vars</strong>
          <code>--kui-btn-solid-bg</code>
        </article>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>Seed tokens</h2>
          <p>Ember seeds are the current experimental defaults.</p>
        </div>
      </div>

      <div class="seed-table">
        @for (seed of seedRows; track seed.token) {
          <article>
            <i [style.background]="seed.value"></i>
            <strong>{{ seed.name }}</strong>
            <code>{{ seed.token }}</code>
            <small>{{ seed.purpose }}</small>
            <code>{{ seed.value }}</code>
          </article>
        }
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>03</span>
        <div>
          <h2>Generated OKLCH palettes</h2>
          <p>Step 6 is the seed. Ramps below come from the library generator.</p>
        </div>
      </div>

      <div class="ramps">
        @for (ramp of paletteRows; track ramp.token) {
          <article>
            <div>
              <strong>{{ ramp.name }}</strong>
              <code>{{ ramp.token }}</code>
            </div>
            <div class="ramp">
              @for (stop of ramp.stops; track $index) {
                <span
                  [class.is-seed]="$index === 5"
                  [style.background]="stop"
                  [attr.aria-label]="ramp.name + ' step ' + ($index + 1)"
                ></span>
              }
            </div>
          </article>
        }
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>04</span>
        <div>
          <h2>CSS variable output</h2>
          <p>This is the public runtime theming contract.</p>
        </div>
      </div>

      <pre><code>{{ cssText() }}</code></pre>
    </section>
  `,
})
export class TokensPage {
  private readonly theme = inject(KUI_THEME);
  protected readonly seedRows = createSeedRows();
  protected readonly paletteRows = createPaletteRows(this.theme);
  protected readonly cssText = computed(() => createCssText(this.theme, 'dark'));
}

@Component({
  selector: 'app-theme-page',
  imports: [KuiButtonDirective, KuiFieldComponent, KuiInputDirective],
  template: `
    <section class="panel forms-panel">
      <div>
        <div class="panel__title">
          <span>01</span>
          <div>
            <h2>Semantic variables</h2>
            <p>Light and dark maps from the current generated theme.</p>
          </div>
        </div>

        <div class="var-table">
          @for (row of semanticRows(); track row.token) {
            <div>
              <code>{{ row.token }}</code>
              <span>{{ row.value }}</span>
            </div>
          }
        </div>
      </div>

      <div class="theme-stack">
        <article class="runtime-preview" [attr.style]="lightStyle()">
          <h3>Light</h3>
          <p>Surface, text, primary action, and input tokens.</p>
          <button kuiButton type="button">Primary action</button>
          <kui-field label="Email" hint="Generated field and input tokens.">
            <input kuiInput type="email" placeholder="nikita@kikita.dev" />
          </kui-field>
        </article>

        <article class="runtime-preview" [attr.style]="darkStyle()">
          <h3>Dark</h3>
          <p>Same component styles, semantic values rebound.</p>
          <button kuiButton type="button">Primary action</button>
          <kui-field label="Email" hint="Generated field and input tokens.">
            <input kuiInput type="email" placeholder="nikita@kikita.dev" />
          </kui-field>
        </article>
      </div>
    </section>
  `,
})
export class ThemePage {
  private readonly theme = inject(KUI_THEME);
  protected readonly semanticRows = computed(() => createSemanticRows(this.theme, 'dark'));
  protected readonly lightStyle = computed(() => createPreviewStyle(this.theme, 'light'));
  protected readonly darkStyle = computed(() => createPreviewStyle(this.theme, 'dark'));
}

@Component({
  selector: 'app-density-page',
  imports: [
    KuiButtonDirective,
    KuiCheckboxDirective,
    KuiFieldComponent,
    KuiInputDirective,
    KuiSwitchDirective,
  ],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Density</h2>
          <p>
            Local <code>data-kui-density</code> scopes rebind control height and x-padding tokens.
          </p>
        </div>
      </div>

      <div class="density-grid">
        @for (density of densities; track density.name) {
          <article class="density-card" [attr.data-kui-density]="density.name">
            <div>
              <h3>{{ density.label }}</h3>
              <code>data-kui-density="{{ density.name }}"</code>
            </div>

            <div class="density-card__controls">
              <button kuiButton type="button">Button</button>
              <button kuiButton appearance="soft" type="button">Soft</button>
              <kui-field label="Input" [hint]="density.hint">
                <input kuiInput placeholder="kikita.dev" />
              </kui-field>
              <label class="check-row">
                <input kuiCheckbox type="checkbox" checked />
                <span>Checkbox</span>
              </label>
              <label class="check-row">
                <input kuiSwitch type="checkbox" checked />
                <span>Switch</span>
              </label>
            </div>
          </article>
        }
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>Mobile check</h2>
          <p>Same controls in a constrained column for narrow viewport inspection.</p>
        </div>
      </div>

      <div class="mobile-check" data-kui-density="comfortable">
        <button kuiButton wrap type="button">Comfortable touch action</button>
        <kui-field label="Project" hint="Should not overflow at mobile widths.">
          <input kuiInput placeholder="Kikita UI" />
        </kui-field>
        <label class="check-row">
          <input kuiSwitch type="checkbox" checked />
          <span>Comfortable mobile switch</span>
        </label>
      </div>
    </section>
  `,
})
export class DensityPage {
  protected readonly densities = [
    { name: 'compact', label: 'Compact', hint: '24px controls for dense tooling.' },
    { name: 'regular', label: 'Regular', hint: '32px default from the Ember spec.' },
    { name: 'comfortable', label: 'Comfortable', hint: '40px controls for touch-heavy UI.' },
  ] as const;
}

@Component({
  selector: 'app-button-page',
  imports: [KuiButtonDirective, KuiGroupDirective, KuiIconButtonDirective, KuiIconComponent],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Button directive</h2>
          <p>Real <code>kuiButton</code> directive on native button and anchor elements.</p>
        </div>
      </div>

      <div class="button-grid">
        <button kuiButton type="button">
          <kui-icon name="check" />
          Primary
        </button>
        <button kuiButton appearance="soft" type="button">Soft</button>
        <button kuiButton appearance="outline" size="sm" type="button">Outline small</button>
        <button kuiButton appearance="ghost" type="button">Ghost</button>
        <button kuiButton appearance="danger" type="button">
          <kui-icon name="warning" />
          Danger
        </button>
        <a kuiButton appearance="outline" href="/">Anchor</a>
        <div kuiGroup collapsed size="sm">
          <button kuiButton appearance="outline" type="button">One</button>
          <button kuiButton appearance="outline" type="button">Two</button>
          <button kuiIconButton appearance="outline" aria-label="More" type="button">
            <kui-icon name="spark" />
          </button>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>Appearance matrix</h2>
          <p>All <code>appearance</code> values × default / hover / active / focus / disabled.</p>
        </div>
      </div>

      <div class="state-matrix" aria-label="Button appearance matrix">
        <div class="state-matrix__header"></div>
        @for (state of stateColumns; track state.value) {
          <div class="state-matrix__header">{{ state.label }}</div>
        }

        @for (variant of buttonVariants; track variant.value) {
          <div class="state-matrix__label">
            <strong>{{ variant.label }}</strong>
            <code>appearance="{{ variant.value }}"</code>
          </div>

          @for (state of stateColumns; track state.value) {
            <div class="state-matrix__cell" [attr.data-state]="state.value">
              <button
                kuiButton
                [appearance]="variant.value"
                type="button"
                [disabled]="state.value === 'disabled'"
              >
                Button
              </button>
            </div>
          }
        }
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>03</span>
        <div>
          <h2>Size matrix</h2>
          <p>xs / sm / md / lg × all states. Solid appearance.</p>
        </div>
      </div>

      <div class="state-matrix" aria-label="Button size matrix">
        <div class="state-matrix__header"></div>
        @for (state of stateColumns; track state.value) {
          <div class="state-matrix__header">{{ state.label }}</div>
        }

        @for (sizeRow of sizeRows; track sizeRow.value) {
          <div class="state-matrix__label">
            <strong>{{ sizeRow.label }}</strong>
            <code>size="{{ sizeRow.value }}"</code>
          </div>

          @for (state of stateColumns; track state.value) {
            <div class="state-matrix__cell" [attr.data-state]="state.value">
              <button
                kuiButton
                [size]="sizeRow.value"
                type="button"
                [disabled]="state.value === 'disabled'"
              >
                Button
              </button>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class ButtonPage {
  protected readonly buttonVariants = BUTTON_VARIANTS;
  protected readonly stateColumns = STATE_COLUMNS;
  protected readonly sizeRows = SIZE_ROWS;
}

@Component({
  selector: 'app-field-page',
  imports: [KuiFieldComponent, KuiInputDirective, KuiTextareaDirective],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Field</h2>
          <p>Label, hint, error, required marker, and ARIA description wiring.</p>
        </div>
      </div>

      <div class="field-grid">
        <kui-field label="Project name" hint="Default md size">
          <input kuiInput value="Kikita UI" />
        </kui-field>

        <kui-field label="Owner email" error="Email is required" required>
          <input kuiInput type="email" placeholder="nikita@kikita.dev" />
        </kui-field>

        <kui-field label="Notes" hint="Textarea keeps native behavior">
          <textarea kuiTextarea placeholder="Token decisions, component notes"></textarea>
        </kui-field>
      </div>
    </section>
  `,
})
export class FieldPage {}

@Component({
  selector: 'app-input-page',
  imports: [KuiFieldComponent, KuiInputDirective],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Input state matrix</h2>
          <p>Real <code>kuiInput</code> directive inside <code>kui-field</code>.</p>
        </div>
      </div>

      <div class="input-state-grid input-state-grid--wide">
        <kui-field label="Default">
          <input kuiInput placeholder="Placeholder" />
        </kui-field>
        <kui-field label="Hover" class="is-hover-preview">
          <input kuiInput value="Hovered" />
        </kui-field>
        <kui-field label="Focus" class="is-focus-preview">
          <input kuiInput value="Focused" />
        </kui-field>
        <kui-field label="Error" error="Error text">
          <input kuiInput invalid value="Invalid" />
        </kui-field>
        <kui-field label="Disabled">
          <input kuiInput disabled value="Disabled" />
        </kui-field>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>Size matrix</h2>
          <p>xs / sm / md / lg × default / hover / focus / invalid / disabled.</p>
        </div>
      </div>

      <div class="state-matrix" aria-label="Input size matrix">
        <div class="state-matrix__header"></div>
        @for (state of inputStateCols; track state.value) {
          <div class="state-matrix__header">{{ state.label }}</div>
        }

        @for (sizeRow of sizeRows; track sizeRow.value) {
          <div class="state-matrix__label">
            <strong>{{ sizeRow.label }}</strong>
            <code>size="{{ sizeRow.value }}"</code>
          </div>

          @for (state of inputStateCols; track state.value) {
            <div class="state-matrix__cell" [attr.data-state]="state.value">
              <input
                kuiInput
                [size]="sizeRow.value"
                [invalid]="state.value === 'invalid'"
                [disabled]="state.value === 'disabled'"
                [placeholder]="sizeRow.value"
              />
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class InputPage {
  protected readonly inputStateCols = SELECTION_STATE_COLUMNS;
  protected readonly sizeRows = SIZE_ROWS;
}

@Component({
  selector: 'app-textarea-page',
  imports: [KuiFieldComponent, KuiTextareaDirective],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Textarea</h2>
          <p>Real <code>kuiTextarea</code> directive on native textarea elements.</p>
        </div>
      </div>

      <div class="field-grid">
        <kui-field label="Default" hint="Native resize is allowed by default.">
          <textarea kuiTextarea rows="4" placeholder="Write a note"></textarea>
        </kui-field>

        <kui-field label="Error" error="Description is required" required>
          <textarea kuiTextarea invalid rows="4">Missing project context</textarea>
        </kui-field>

        <kui-field label="Disabled" hint="Disabled keeps readable multiline content.">
          <textarea kuiTextarea rows="4" disabled>Readonly generated output</textarea>
        </kui-field>
      </div>
    </section>
  `,
})
export class TextareaPage {}

@Component({
  selector: 'app-checkbox-page',
  imports: [KuiCheckboxDirective, KuiFieldComponent],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Checkbox</h2>
          <p>Real <code>kuiCheckbox</code> directive on native checkbox inputs.</p>
        </div>
      </div>

      <div class="component-board">
        <div class="state-board__row">
          <label class="check-row">
            <input kuiCheckbox type="checkbox" />
            Default
          </label>
          <label class="check-row">
            <input kuiCheckbox type="checkbox" checked />
            Checked
          </label>
          <label class="check-row">
            <input kuiCheckbox type="checkbox" invalid />
            Invalid
          </label>
          <label class="check-row">
            <input kuiCheckbox type="checkbox" disabled />
            Disabled
          </label>
        </div>

        <div class="state-board__row">
          <label class="check-row">
            <input kuiCheckbox type="checkbox" size="xs" checked />
            xs
          </label>
          <label class="check-row">
            <input kuiCheckbox type="checkbox" size="sm" checked />
            sm
          </label>
          <label class="check-row">
            <input kuiCheckbox type="checkbox" checked />
            md
          </label>
          <label class="check-row">
            <input kuiCheckbox type="checkbox" size="lg" checked />
            lg
          </label>
        </div>

        <kui-field label="Field wiring" hint="Label, hint, and error connect through kui-field.">
          <input kuiCheckbox type="checkbox" />
        </kui-field>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>State matrix</h2>
          <p>Unchecked / checked × default / hover / focus / invalid / disabled.</p>
        </div>
      </div>

      <div class="state-matrix" aria-label="Checkbox state matrix">
        <div class="state-matrix__header"></div>
        @for (state of selectionStateCols; track state.value) {
          <div class="state-matrix__header">{{ state.label }}</div>
        }

        @for (checkRow of checkStateRows; track checkRow.label) {
          <div class="state-matrix__label">
            <strong>{{ checkRow.label }}</strong>
          </div>

          @for (state of selectionStateCols; track state.value) {
            <div class="state-matrix__cell" [attr.data-state]="state.value">
              <label class="check-row">
                <input
                  kuiCheckbox
                  type="checkbox"
                  [checked]="checkRow.checked"
                  [invalid]="state.value === 'invalid'"
                  [disabled]="state.value === 'disabled'"
                />
                {{ checkRow.label }}
              </label>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class CheckboxPage {
  protected readonly checkStateRows = CHECK_STATE_ROWS;
  protected readonly selectionStateCols = SELECTION_STATE_COLUMNS;
}

@Component({
  selector: 'app-switch-page',
  imports: [KuiFieldComponent, KuiSwitchDirective],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Switch</h2>
          <p>
            Real <code>kuiSwitch</code> directive on native checkbox inputs with
            <code>role="switch"</code>.
          </p>
        </div>
      </div>

      <div class="component-board">
        <div class="state-board__row">
          <label class="check-row">
            <input kuiSwitch type="checkbox" />
            Off
          </label>
          <label class="check-row">
            <input kuiSwitch type="checkbox" checked />
            On
          </label>
          <label class="check-row">
            <input kuiSwitch type="checkbox" invalid />
            Invalid
          </label>
          <label class="check-row">
            <input kuiSwitch type="checkbox" disabled />
            Disabled
          </label>
        </div>

        <div class="state-board__row">
          <label class="check-row">
            <input kuiSwitch type="checkbox" size="xs" checked />
            xs
          </label>
          <label class="check-row">
            <input kuiSwitch type="checkbox" size="sm" checked />
            sm
          </label>
          <label class="check-row">
            <input kuiSwitch type="checkbox" checked />
            md
          </label>
          <label class="check-row">
            <input kuiSwitch type="checkbox" size="lg" checked />
            lg
          </label>
        </div>

        <kui-field label="Field wiring" hint="Switch can still use kui-field description wiring.">
          <input kuiSwitch type="checkbox" />
        </kui-field>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>State matrix</h2>
          <p>Off / on × default / hover / focus / invalid / disabled.</p>
        </div>
      </div>

      <div class="state-matrix" aria-label="Switch state matrix">
        <div class="state-matrix__header"></div>
        @for (state of selectionStateCols; track state.value) {
          <div class="state-matrix__header">{{ state.label }}</div>
        }

        @for (switchRow of switchStateRows; track switchRow.label) {
          <div class="state-matrix__label">
            <strong>{{ switchRow.label }}</strong>
          </div>

          @for (state of selectionStateCols; track state.value) {
            <div class="state-matrix__cell" [attr.data-state]="state.value">
              <label class="check-row">
                <input
                  kuiSwitch
                  type="checkbox"
                  [checked]="switchRow.checked"
                  [invalid]="state.value === 'invalid'"
                  [disabled]="state.value === 'disabled'"
                />
                {{ switchRow.label }}
              </label>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class SwitchPage {
  protected readonly switchStateRows = SWITCH_STATE_ROWS;
  protected readonly selectionStateCols = SELECTION_STATE_COLUMNS;
}

@Component({
  selector: 'app-radio-page',
  imports: [KuiFieldComponent, KuiRadioDirective],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Radio</h2>
          <p>Real <code>kuiRadio</code> directive on native radio inputs.</p>
        </div>
      </div>

      <div class="component-board">
        <div class="state-board__row" role="radiogroup" aria-label="Plan">
          <label class="check-row">
            <input kuiRadio type="radio" name="plan-demo" value="starter" />
            Starter
          </label>
          <label class="check-row">
            <input kuiRadio type="radio" name="plan-demo" value="pro" checked />
            Pro
          </label>
          <label class="check-row">
            <input kuiRadio type="radio" name="plan-demo" value="team" />
            Team
          </label>
          <label class="check-row">
            <input kuiRadio type="radio" name="plan-demo-disabled" disabled />
            Disabled
          </label>
        </div>

        <div class="state-board__row">
          <label class="check-row">
            <input kuiRadio type="radio" name="radio-size" size="xs" checked />
            xs
          </label>
          <label class="check-row">
            <input kuiRadio type="radio" name="radio-size" size="sm" />
            sm
          </label>
          <label class="check-row">
            <input kuiRadio type="radio" name="radio-size" />
            md
          </label>
          <label class="check-row">
            <input kuiRadio type="radio" name="radio-size" size="lg" />
            lg
          </label>
        </div>

        <kui-field label="Field wiring" error="Choose one option" required>
          <input kuiRadio type="radio" name="field-radio-demo" invalid />
        </kui-field>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>State matrix</h2>
          <p>Unchecked / checked × default / hover / focus / invalid / disabled.</p>
        </div>
      </div>

      <div class="state-matrix" aria-label="Radio state matrix">
        <div class="state-matrix__header"></div>
        @for (state of selectionStateCols; track state.value) {
          <div class="state-matrix__header">{{ state.label }}</div>
        }

        @for (checkRow of checkStateRows; track checkRow.label) {
          <div class="state-matrix__label">
            <strong>{{ checkRow.label }}</strong>
          </div>

          @for (state of selectionStateCols; track state.value) {
            <div class="state-matrix__cell" [attr.data-state]="state.value">
              <label class="check-row">
                <input
                  kuiRadio
                  type="radio"
                  [name]="'radio-matrix-' + checkRow.label + '-' + state.value"
                  [checked]="checkRow.checked"
                  [invalid]="state.value === 'invalid'"
                  [disabled]="state.value === 'disabled'"
                />
                {{ checkRow.label }}
              </label>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class RadioPage {
  protected readonly checkStateRows = CHECK_STATE_ROWS;
  protected readonly selectionStateCols = SELECTION_STATE_COLUMNS;
}

@Component({
  selector: 'app-badge-page',
  imports: [KuiBadgeDirective],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Badge</h2>
          <p>Inline status and metadata primitive using Kikita status tokens.</p>
        </div>
      </div>

      <div class="component-board">
        <div class="state-board__row">
          <span kuiBadge>Neutral</span>
          <span kuiBadge appearance="primary">Primary</span>
          <span kuiBadge appearance="success">Success</span>
          <span kuiBadge appearance="warning">Warning</span>
          <span kuiBadge appearance="danger">Danger</span>
          <span kuiBadge appearance="info">Info</span>
        </div>

        <div class="state-board__row">
          <span kuiBadge size="xs" appearance="primary">xs</span>
          <span kuiBadge size="sm" appearance="primary">sm</span>
          <span kuiBadge appearance="primary">md</span>
          <span kuiBadge size="lg" appearance="primary">lg</span>
        </div>

        <div class="state-board__row">
          <a kuiBadge appearance="info" href="/">Linked badge</a>
          <strong kuiBadge appearance="success">Strong badge</strong>
          <code kuiBadge appearance="neutral">--kui-badge-*</code>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>Appearance × size</h2>
          <p>All 6 appearances across xs / sm / md / lg.</p>
        </div>
      </div>

      <div class="badge-matrix">
        <div class="badge-matrix__header"></div>
        @for (sizeRow of sizeRows; track sizeRow.value) {
          <div class="badge-matrix__header">{{ sizeRow.label }}</div>
        }

        @for (appearance of badgeAppearances; track appearance.value) {
          <div class="badge-matrix__label">
            <strong>{{ appearance.label }}</strong>
          </div>

          @for (sizeRow of sizeRows; track sizeRow.value) {
            <div class="badge-matrix__cell">
              <span kuiBadge [appearance]="appearance.value" [size]="sizeRow.value">
                {{ appearance.label }}
              </span>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class BadgePage {
  protected readonly badgeAppearances = BADGE_APPEARANCE_ROWS;
  protected readonly sizeRows = SIZE_ROWS;
}

@Component({
  selector: 'app-loader-page',
  imports: [KuiButtonDirective, KuiLoaderDirective],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Loader</h2>
          <p>CSS-only loading indicator using Kikita motion and color tokens.</p>
        </div>
      </div>

      <div class="component-board">
        <div class="state-board__row">
          <span kuiLoader size="xs" label="Loading small"></span>
          <span kuiLoader size="sm" label="Loading small"></span>
          <span kuiLoader label="Loading"></span>
          <span kuiLoader size="lg" label="Loading large"></span>
        </div>

        <div class="state-board__row">
          <button kuiButton type="button" disabled>
            <span kuiLoader size="sm" label="Saving"></span>
            Saving
          </button>
          <button kuiButton appearance="soft" type="button">
            <span kuiLoader size="sm" label="Syncing"></span>
            Syncing
          </button>
        </div>
      </div>
    </section>
  `,
})
export class LoaderPage {}

@Component({
  selector: 'app-card-page',
  imports: [KuiBadgeDirective, KuiCardDirective],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Card</h2>
          <p>Semantic surface primitive using Kikita surface, border, radius, and shadow tokens.</p>
        </div>
      </div>

      <div class="field-grid">
        <article kuiCard>
          <span kuiBadge>Surface</span>
          <h3>Default surface</h3>
          <p>Use for grouped content that needs a real boundary.</p>
        </article>

        <article kuiCard appearance="elevated">
          <span kuiBadge appearance="primary">Elevated</span>
          <h3>Elevated surface</h3>
          <p>Use for popover-like or high-priority content blocks.</p>
        </article>

        <article kuiCard appearance="sunken">
          <span kuiBadge appearance="info">Sunken</span>
          <h3>Sunken surface</h3>
          <p>Use for inset previews, logs, or low-emphasis content.</p>
        </article>
      </div>

      <button kuiCard interactive type="button" class="card-action">
        <span kuiBadge appearance="success">Interactive</span>
        <strong>Button-backed card</strong>
        <span>Focusable and clickable without losing native button semantics.</span>
      </button>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>Interactive states</h2>
          <p>Hover and focus on <code>interactive</code> cards. CSS-simulated.</p>
        </div>
      </div>

      <div class="field-grid">
        <button kuiCard interactive type="button" class="card-action">
          <span kuiBadge>Default</span>
          <strong>Interactive default</strong>
          <span>Base resting state.</span>
        </button>

        <button kuiCard interactive type="button" class="card-action is-card-hover">
          <span kuiBadge appearance="primary">Hover</span>
          <strong>Interactive hover</strong>
          <span>Border strengthens on cursor hover.</span>
        </button>

        <button kuiCard interactive type="button" class="card-action is-card-focus">
          <span kuiBadge appearance="info">Focus</span>
          <strong>Interactive focus</strong>
          <span>Primary focus ring on keyboard focus.</span>
        </button>
      </div>
    </section>
  `,
})
export class CardPage {}

@Component({
  selector: 'app-group-page',
  imports: [KuiButtonDirective, KuiGroupDirective, KuiIconButtonDirective, KuiIconComponent],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Group primitive</h2>
          <p>Horizontal and vertical grouped native controls.</p>
        </div>
      </div>

      <div class="component-board">
        <div kuiGroup collapsed>
          <button kuiButton appearance="outline" type="button">Left</button>
          <button kuiButton appearance="outline" type="button">Center</button>
          <button kuiButton appearance="outline" type="button">Right</button>
        </div>

        <div kuiGroup collapsed size="sm">
          <button kuiButton appearance="outline" type="button">One</button>
          <button kuiButton appearance="outline" type="button">Two</button>
          <button kuiIconButton appearance="outline" aria-label="More" type="button">
            <kui-icon name="spark" />
          </button>
        </div>

        <div kuiGroup collapsed orientation="vertical" class="group-demo-vertical">
          <button kuiButton appearance="outline" type="button">Top</button>
          <button kuiButton appearance="outline" type="button">Middle</button>
          <button kuiButton appearance="outline" type="button">Bottom</button>
        </div>
      </div>
    </section>
  `,
})
export class GroupPage {}

@Component({
  selector: 'app-icons-page',
  imports: [KuiIconButtonDirective, KuiIconComponent],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Icon abstraction</h2>
          <p>Registry-backed <code>kui-icon</code> and icon-only actions.</p>
        </div>
      </div>

      <div class="icon-grid">
        <article>
          <kui-icon name="check" label="Success icon" size="24px" />
          <code>name="check"</code>
        </article>
        <article>
          <kui-icon name="spark" label="Spark icon" size="24px" />
          <code>name="spark"</code>
        </article>
        <article>
          <kui-icon name="warning" label="Warning icon" size="24px" />
          <code>name="warning"</code>
        </article>
      </div>

      <div class="state-board__row">
        <button kuiIconButton aria-label="Confirm" type="button">
          <kui-icon name="check" />
        </button>
        <button kuiIconButton appearance="soft" aria-label="Spark" type="button">
          <kui-icon name="spark" />
        </button>
        <button kuiIconButton appearance="danger" aria-label="Warning" type="button">
          <kui-icon name="warning" />
        </button>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>Icon button appearance matrix</h2>
          <p>All <code>appearance</code> values × default / hover / active / focus / disabled.</p>
        </div>
      </div>

      <div class="state-matrix" aria-label="Icon button appearance matrix">
        <div class="state-matrix__header"></div>
        @for (state of stateColumns; track state.value) {
          <div class="state-matrix__header">{{ state.label }}</div>
        }

        @for (variant of buttonVariants; track variant.value) {
          <div class="state-matrix__label">
            <strong>{{ variant.label }}</strong>
            <code>appearance="{{ variant.value }}"</code>
          </div>

          @for (state of stateColumns; track state.value) {
            <div class="state-matrix__cell" [attr.data-state]="state.value">
              <button
                kuiIconButton
                [appearance]="variant.value"
                type="button"
                [disabled]="state.value === 'disabled'"
                [attr.aria-label]="variant.label"
              >
                <kui-icon name="spark" />
              </button>
            </div>
          }
        }
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>03</span>
        <div>
          <h2>Icon button size matrix</h2>
          <p>xs / sm / md / lg × all states. Ghost appearance.</p>
        </div>
      </div>

      <div class="state-matrix" aria-label="Icon button size matrix">
        <div class="state-matrix__header"></div>
        @for (state of stateColumns; track state.value) {
          <div class="state-matrix__header">{{ state.label }}</div>
        }

        @for (sizeRow of sizeRows; track sizeRow.value) {
          <div class="state-matrix__label">
            <strong>{{ sizeRow.label }}</strong>
            <code>size="{{ sizeRow.value }}"</code>
          </div>

          @for (state of stateColumns; track state.value) {
            <div class="state-matrix__cell" [attr.data-state]="state.value">
              <button
                kuiIconButton
                [size]="sizeRow.value"
                type="button"
                [disabled]="state.value === 'disabled'"
                aria-label="Action"
              >
                <kui-icon name="spark" />
              </button>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class IconsPage {
  protected readonly buttonVariants = BUTTON_VARIANTS;
  protected readonly stateColumns = STATE_COLUMNS;
  protected readonly sizeRows = SIZE_ROWS;
}

@Component({
  selector: 'app-forms-page',
  imports: [FormField, FormRoot, KuiButtonDirective, KuiFieldComponent, KuiInputDirective],
  template: `
    <section class="panel forms-panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Signal Forms spike</h2>
          <p>
            Native Angular Signal Forms field binding on the same input as <code>kuiInput</code>.
          </p>
        </div>
      </div>

      <div class="forms-panel__body">
        <form class="form-preview" [formRoot]="profileForm">
          <kui-field
            label="Email"
            hint="Required email field from Angular Signal Forms."
            [required]="profileForm.email().required()"
            [error]="fieldError(profileForm.email)"
          >
            <input
              kuiInput
              type="email"
              placeholder="nikita@kikita.dev"
              [formField]="profileForm.email"
            />
          </kui-field>

          <kui-field
            label="Project"
            hint="Minimum 3 characters."
            [required]="profileForm.project().required()"
            [error]="fieldError(profileForm.project)"
          >
            <input kuiInput placeholder="Kikita UI" [formField]="profileForm.project" />
          </kui-field>

          <button kuiButton type="submit" [disabled]="profileForm().invalid()">Save</button>
        </form>

        <div class="form-debug">
          <h3>Live model</h3>
          <pre><code>{{ formValue() }}</code></pre>
          <div class="var-table">
            <div>
              <code>email.valid()</code>
              <span>{{ profileForm.email().valid() }}</span>
            </div>
            <div>
              <code>project.valid()</code>
              <span>{{ profileForm.project().valid() }}</span>
            </div>
            <div>
              <code>form.valid()</code>
              <span>{{ profileForm().valid() }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class FormsPage {
  protected readonly model = signal({
    email: '',
    project: '',
  });

  protected readonly profileForm = form(this.model, (path) => {
    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Enter a valid email' });
    required(path.project, { message: 'Project is required' });
    minLength(path.project, 3, { message: 'Use at least 3 characters' });
  });

  protected readonly formValue = computed(() => JSON.stringify(this.model(), null, 2));

  protected fieldError(field: typeof this.profileForm.email): string | undefined {
    const state = field();

    if (!state.touched() && !state.dirty()) {
      return undefined;
    }

    return state.errors()[0]?.message;
  }
}

@Component({
  selector: 'app-segmented-page',
  imports: [KuiBadgeDirective, KuiIconComponent, KuiSegmentDirective, KuiSegmentedComponent],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Segmented</h2>
          <p>
            Compact single-select control. <code>kui-segmented</code> +
            <code>[kuiSegment]</code>. Keyboard: ←→ ↑↓ Home End.
          </p>
        </div>
      </div>

      <div class="component-board">
        <div class="state-board__row">
          <kui-segmented [selected]="view()" (selectedChange)="view.set($event)" aria-label="View mode">
            <button kuiSegment value="list">List</button>
            <button kuiSegment value="grid">Grid</button>
            <button kuiSegment value="table">Table</button>
          </kui-segmented>
          <span kuiBadge appearance="primary">{{ view() }}</span>
        </div>

        <div class="state-board__row">
          <kui-segmented [selected]="period()" (selectedChange)="period.set($event)" aria-label="Time period">
            <button kuiSegment value="day">Day</button>
            <button kuiSegment value="week">Week</button>
            <button kuiSegment value="month">Month</button>
            <button kuiSegment value="year">Year</button>
          </kui-segmented>
        </div>

        <div class="state-board__row">
          <kui-segmented [selected]="align()" (selectedChange)="align.set($event)" aria-label="Text alignment">
            <button kuiSegment value="left">
              <kui-icon name="check" size="14px" label="Left" />
            </button>
            <button kuiSegment value="center">
              <kui-icon name="spark" size="14px" label="Center" />
            </button>
            <button kuiSegment value="right">
              <kui-icon name="warning" size="14px" label="Right" />
            </button>
          </kui-segmented>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>State preview</h2>
          <p>All segment states in one control. Hover and focus are CSS-simulated.</p>
        </div>
      </div>

      <div class="component-board">
        <div class="state-board__row">
          <kui-segmented [selected]="'seg-selected'" aria-label="Segment states">
            <button kuiSegment value="seg-default">Default</button>
            <button kuiSegment value="seg-hover" class="kui-seg-demo-hover">Hover</button>
            <button kuiSegment value="seg-focus" class="kui-seg-demo-focus">Focus</button>
            <button kuiSegment value="seg-selected">Selected</button>
            <button kuiSegment value="seg-disabled" disabled>Disabled</button>
          </kui-segmented>
        </div>
      </div>
    </section>
  `,
})
export class SegmentedPage {
  protected readonly view = signal('list');
  protected readonly period = signal('week');
  protected readonly align = signal('left');
}

@Component({
  selector: 'app-tabs-page',
  imports: [KuiBadgeDirective, KuiTabDirective, KuiTabPanelDirective, KuiTabsComponent],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Tabs</h2>
          <p>
            Compound component: <code>kui-tabs</code>, <code>[kuiTab]</code>,
            <code>[kuiTabPanel]</code>. Keyboard: ←→ Home End.
          </p>
        </div>
      </div>

      <div class="component-board">
        <kui-tabs selected="general">
          <button kuiTab value="general">General</button>
          <button kuiTab value="advanced">Advanced</button>
          <button kuiTab value="billing">Billing</button>
          <div kuiTabPanel value="general">
            <p>General settings panel. Token: <code>--kui-tab-indicator</code>.</p>
          </div>
          <div kuiTabPanel value="advanced">
            <p>Advanced settings panel. Keyboard navigation works across all tabs.</p>
          </div>
          <div kuiTabPanel value="billing">
            <p>Billing panel. Focus ring follows <code>--kui-color-primary-focus-ring</code>.</p>
          </div>
        </kui-tabs>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>With badge</h2>
          <p>Tab labels can include badge or icon children.</p>
        </div>
      </div>

      <div class="component-board">
        <kui-tabs selected="open">
          <button kuiTab value="open">
            Open
            <span kuiBadge appearance="primary">12</span>
          </button>
          <button kuiTab value="closed">
            Closed
            <span kuiBadge>4</span>
          </button>
          <button kuiTab value="archived">Archived</button>
          <div kuiTabPanel value="open">
            <p>12 open items.</p>
          </div>
          <div kuiTabPanel value="closed">
            <p>4 closed items.</p>
          </div>
          <div kuiTabPanel value="archived">
            <p>No archived items.</p>
          </div>
        </kui-tabs>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>03</span>
        <div>
          <h2>Pill variant</h2>
          <p>
            <code>variant="pill"</code> — активный таб получает фон
            <code>primary-soft-bg</code>, нет индикатора снизу.
          </p>
        </div>
      </div>

      <div class="component-board">
        <kui-tabs variant="pill" selected="general">
          <button kuiTab value="general">General</button>
          <button kuiTab value="advanced">Advanced</button>
          <button kuiTab value="billing">Billing</button>
          <div kuiTabPanel value="general"><p>General settings panel.</p></div>
          <div kuiTabPanel value="advanced"><p>Advanced settings panel.</p></div>
          <div kuiTabPanel value="billing"><p>Billing panel.</p></div>
        </kui-tabs>

        <kui-tabs variant="pill" selected="open">
          <button kuiTab value="open">
            Open
            <span kuiBadge appearance="primary">12</span>
          </button>
          <button kuiTab value="closed">Closed <span kuiBadge>4</span></button>
          <button kuiTab value="archived">Archived</button>
          <div kuiTabPanel value="open"><p>12 open items.</p></div>
          <div kuiTabPanel value="closed"><p>4 closed items.</p></div>
          <div kuiTabPanel value="archived"><p>No archived items.</p></div>
        </kui-tabs>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>04</span>
        <div>
          <h2>Overflow scroll</h2>
          <p>Many tabs scroll horizontally. At &lt;480px scroll-snap applies.</p>
        </div>
      </div>

      <div class="component-board">
        <kui-tabs selected="tab1">
          @for (tab of manyTabs; track tab) {
            <button kuiTab [value]="tab">{{ tab }}</button>
          }
          @for (tab of manyTabs; track tab) {
            <div kuiTabPanel [value]="tab">
              <p>Content for {{ tab }}.</p>
            </div>
          }
        </kui-tabs>
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>05</span>
        <div>
          <h2>State preview</h2>
          <p>All tab states per variant. Hover and focus are CSS-simulated.</p>
        </div>
      </div>

      <div class="component-board">
        <div>
          <p class="tab-state-label">Line variant</p>
          <kui-tabs selected="tab-selected-line">
            <button kuiTab value="tab-default-line">Default</button>
            <button kuiTab value="tab-hover-line" class="kui-tab-demo-hover">Hover</button>
            <button kuiTab value="tab-focus-line" class="kui-tab-demo-focus">Focus</button>
            <button kuiTab value="tab-selected-line">Selected</button>
            <button kuiTab value="tab-disabled-line" disabled>Disabled</button>
            <div kuiTabPanel value="tab-default-line"></div>
            <div kuiTabPanel value="tab-hover-line"></div>
            <div kuiTabPanel value="tab-focus-line"></div>
            <div kuiTabPanel value="tab-selected-line"><p>Selected tab panel.</p></div>
            <div kuiTabPanel value="tab-disabled-line"></div>
          </kui-tabs>
        </div>

        <div>
          <p class="tab-state-label">Pill variant</p>
          <kui-tabs variant="pill" selected="tab-selected-pill">
            <button kuiTab value="tab-default-pill">Default</button>
            <button kuiTab value="tab-hover-pill" class="kui-tab-demo-hover">Hover</button>
            <button kuiTab value="tab-focus-pill" class="kui-tab-demo-focus">Focus</button>
            <button kuiTab value="tab-selected-pill">Selected</button>
            <button kuiTab value="tab-disabled-pill" disabled>Disabled</button>
            <div kuiTabPanel value="tab-default-pill"></div>
            <div kuiTabPanel value="tab-hover-pill"></div>
            <div kuiTabPanel value="tab-focus-pill"></div>
            <div kuiTabPanel value="tab-selected-pill"><p>Selected tab panel.</p></div>
            <div kuiTabPanel value="tab-disabled-pill"></div>
          </kui-tabs>
        </div>
      </div>
    </section>
  `,
})
export class TabsPage {
  protected readonly manyTabs = [
    'tab1', 'tab2', 'tab3', 'tab4', 'tab5', 'tab6', 'tab7', 'tab8',
  ];
}

@Component({
  selector: 'app-tooltip-page',
  imports: [KuiButtonDirective, KuiIconButtonDirective, KuiIconComponent, KuiTooltipDirective],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Tooltip</h2>
          <p>Text tooltip on hover and keyboard focus. Not shown on touch.</p>
        </div>
      </div>

      <div class="component-board">
        <div class="state-board__row">
          <button kuiButton type="button" [kuiTooltip]="'Save changes'">Top (default)</button>
          <button kuiButton appearance="soft" type="button" [kuiTooltip]="'View details'" placement="bottom">Bottom</button>
          <button kuiButton appearance="outline" type="button" [kuiTooltip]="'Go back'" placement="left">Left</button>
          <button kuiButton appearance="ghost" type="button" [kuiTooltip]="'Next step'" placement="right">Right</button>
        </div>

        <div class="state-board__row">
          <button kuiIconButton aria-label="Confirm" type="button" [kuiTooltip]="'Confirm action'">
            <kui-icon name="check" />
          </button>
          <button kuiIconButton appearance="soft" aria-label="Spark" type="button" [kuiTooltip]="'Generate with AI'" placement="bottom">
            <kui-icon name="spark" />
          </button>
          <button kuiIconButton appearance="danger" aria-label="Warning" type="button" [kuiTooltip]="'Destructive action'" placement="right">
            <kui-icon name="warning" />
          </button>
        </div>

        <div class="state-board__row">
          <button kuiButton appearance="ghost" type="button" [kuiTooltip]="''">No tooltip (empty)</button>
          <button kuiButton appearance="outline" type="button" [kuiTooltip]="'Longer tooltip text that wraps across multiple lines when the content exceeds the max width of 280px'" placement="bottom">Long text</button>
        </div>
      </div>
    </section>
  `,
})
export class TooltipPage {}
