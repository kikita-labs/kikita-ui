import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormField, FormRoot, email, form, minLength, required } from '@angular/forms/signals';

import {
  KUI_THEME,
  KuiBadgeDirective,
  KuiButtonDirective,
  KuiCardDirective,
  KuiCellDirective,
  KuiCheckboxDirective,
  KuiFieldComponent,
  KuiGroupDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
  KuiInputDirective,
  KuiLoaderDirective,
  KuiRadioDirective,
  KuiRowDirective,
  KuiSegmentDirective,
  KuiSegmentedComponent,
  KuiSelectCellComponent,
  KuiSelectThComponent,
  KuiSwitchDirective,
  KuiTabDirective,
  KuiTabPanelDirective,
  KuiTableDirective,
  KuiTabsComponent,
  KuiTextareaDirective,
  KuiThDirective,
  KuiThGroupDirective,
  KuiTooltipDirective,
} from '@kikita-labs/ui';

import {
  BADGE_APPEARANCE_ROWS,
  BUTTON_VARIANTS,
  CHECK_STATE_ROWS,
  SELECTION_SIZE_COL_DEFS,
  SELECTION_STATE_COLUMNS,
  SIZE_ROWS,
  STATE_COLUMNS,
  SWITCH_SIZE_COL_DEFS,
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

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>Size matrix</h2>
          <p>xs / sm / md / lg × default / error / disabled.</p>
        </div>
      </div>

      <div class="state-matrix" style="grid-template-columns: minmax(150px, 0.8fr) repeat(3, minmax(180px, 1fr));" aria-label="Field size matrix">
        <div class="state-matrix__header"></div>
        <div class="state-matrix__header">Default</div>
        <div class="state-matrix__header">Error</div>
        <div class="state-matrix__header">Disabled</div>

        @for (sizeRow of sizeRows; track sizeRow.value) {
          <div class="state-matrix__label">
            <strong>{{ sizeRow.label }}</strong>
            <code>size="{{ sizeRow.value }}"</code>
          </div>

          <div class="state-matrix__cell" style="align-items: stretch; padding: 12px;">
            <kui-field [size]="sizeRow.value" label="Label" hint="Hint text" style="inline-size: 100%;">
              <input kuiInput [size]="sizeRow.value" placeholder="Value" />
            </kui-field>
          </div>

          <div class="state-matrix__cell" style="align-items: stretch; padding: 12px;">
            <kui-field [size]="sizeRow.value" label="Label" [error]="'Required'" style="inline-size: 100%;">
              <input kuiInput [size]="sizeRow.value" placeholder="Value" />
            </kui-field>
          </div>

          <div class="state-matrix__cell" style="align-items: stretch; padding: 12px;">
            <kui-field [size]="sizeRow.value" label="Label" hint="Hint text" style="inline-size: 100%;">
              <input kuiInput [size]="sizeRow.value" placeholder="Value" disabled />
            </kui-field>
          </div>
        }
      </div>
    </section>
  `,
})
export class FieldPage {
  protected readonly sizeRows = SIZE_ROWS;
}

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
          <h2>Size matrix</h2>
          <p>xs / sm / md / lg × unchecked / checked / focus / disabled.</p>
        </div>
      </div>

      <div class="state-matrix state-matrix--4" aria-label="Checkbox size matrix">
        <div class="state-matrix__header"></div>
        @for (col of sizeColDefs; track col.label) {
          <div class="state-matrix__header">{{ col.label }}</div>
        }

        @for (sizeRow of sizeRows; track sizeRow.value) {
          <div class="state-matrix__label">
            <strong>{{ sizeRow.label }}</strong>
            <code>size="{{ sizeRow.value }}"</code>
          </div>

          @for (col of sizeColDefs; track col.label) {
            <div class="state-matrix__cell" [attr.data-state]="col.state || null">
              <label class="check-row">
                <input
                  kuiCheckbox
                  type="checkbox"
                  [size]="sizeRow.value"
                  [checked]="col.checked"
                  [disabled]="col.disabled"
                />
                {{ col.label }}
              </label>
            </div>
          }
        }
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>03</span>
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
  protected readonly sizeRows = SIZE_ROWS;
  protected readonly sizeColDefs = SELECTION_SIZE_COL_DEFS;
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
          <h2>Size matrix</h2>
          <p>xs / sm / md / lg × off / on / focus / disabled.</p>
        </div>
      </div>

      <div class="state-matrix state-matrix--4" aria-label="Switch size matrix">
        <div class="state-matrix__header"></div>
        @for (col of switchSizeColDefs; track col.label) {
          <div class="state-matrix__header">{{ col.label }}</div>
        }

        @for (sizeRow of sizeRows; track sizeRow.value) {
          <div class="state-matrix__label">
            <strong>{{ sizeRow.label }}</strong>
            <code>size="{{ sizeRow.value }}"</code>
          </div>

          @for (col of switchSizeColDefs; track col.label) {
            <div class="state-matrix__cell" [attr.data-state]="col.state || null">
              <label class="check-row">
                <input
                  kuiSwitch
                  type="checkbox"
                  [size]="sizeRow.value"
                  [checked]="col.checked"
                  [disabled]="col.disabled"
                />
                {{ col.label }}
              </label>
            </div>
          }
        }
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>03</span>
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
  protected readonly sizeRows = SIZE_ROWS;
  protected readonly switchSizeColDefs = SWITCH_SIZE_COL_DEFS;
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
          <h2>Size matrix</h2>
          <p>xs / sm / md / lg × unchecked / checked / focus / disabled.</p>
        </div>
      </div>

      <div class="state-matrix state-matrix--4" aria-label="Radio size matrix">
        <div class="state-matrix__header"></div>
        @for (col of sizeColDefs; track col.label) {
          <div class="state-matrix__header">{{ col.label }}</div>
        }

        @for (sizeRow of sizeRows; track sizeRow.value) {
          <div class="state-matrix__label">
            <strong>{{ sizeRow.label }}</strong>
            <code>size="{{ sizeRow.value }}"</code>
          </div>

          @for (col of sizeColDefs; track col.label) {
            <div class="state-matrix__cell" [attr.data-state]="col.state || null">
              <label class="check-row">
                <input
                  kuiRadio
                  type="radio"
                  [name]="'radio-size-matrix-' + sizeRow.value + '-' + col.label"
                  [size]="sizeRow.value"
                  [checked]="col.checked"
                  [disabled]="col.disabled"
                />
                {{ col.label }}
              </label>
            </div>
          }
        }
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>03</span>
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
  protected readonly sizeRows = SIZE_ROWS;
  protected readonly sizeColDefs = SELECTION_SIZE_COL_DEFS;
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

    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>Size matrix</h2>
          <p>xs / sm / md / lg standalone and inside button.</p>
        </div>
      </div>

      <div class="loader-size-grid">
        @for (sizeRow of sizeRows; track sizeRow.value) {
          <div class="loader-size-card">
            <span kuiLoader [size]="sizeRow.value" label="Loading"></span>
            <code>{{ sizeRow.label }}</code>
          </div>
        }
      </div>

      <div class="state-board__row">
        @for (sizeRow of sizeRows; track sizeRow.value) {
          <button kuiButton [size]="sizeRow.value" type="button" disabled>
            <span kuiLoader size="sm" label="Loading"></span>
            {{ sizeRow.label }}
          </button>
        }
      </div>
    </section>
  `,
})
export class LoaderPage {
  protected readonly sizeRows = SIZE_ROWS;
}

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

    <section class="panel">
      <div class="panel__title">
        <span>03</span>
        <div>
          <h2>Size matrix</h2>
          <p>xs / sm / md / lg × surface / elevated / sunken — controls internal padding.</p>
        </div>
      </div>

      <div class="state-matrix" style="grid-template-columns: minmax(150px, 0.8fr) repeat(3, minmax(180px, 1fr));" aria-label="Card size matrix">
        <div class="state-matrix__header"></div>
        <div class="state-matrix__header">Surface</div>
        <div class="state-matrix__header">Elevated</div>
        <div class="state-matrix__header">Sunken</div>

        @for (sizeRow of sizeRows; track sizeRow.value) {
          <div class="state-matrix__label">
            <strong>{{ sizeRow.label }}</strong>
            <code>size="{{ sizeRow.value }}"</code>
          </div>
          @for (appearance of cardAppearances; track appearance) {
            <div class="state-matrix__cell" style="align-items: stretch; padding: 12px;">
              <article kuiCard [size]="sizeRow.value" [appearance]="appearance" style="inline-size: 100%;">
                <strong>Card</strong>
                <p>{{ appearance }}</p>
              </article>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class CardPage {
  protected readonly sizeRows = SIZE_ROWS;
  protected readonly cardAppearances = ['surface', 'elevated', 'sunken'] as const;
}

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
          <h2>Size matrix</h2>
          <p>xs / sm / md / lg × default / selected / focus / disabled.</p>
        </div>
      </div>

      <div class="state-matrix state-matrix--4" aria-label="Segmented size matrix">
        <div class="state-matrix__header"></div>
        <div class="state-matrix__header">Default</div>
        <div class="state-matrix__header">Selected</div>
        <div class="state-matrix__header">Focus</div>
        <div class="state-matrix__header">Disabled</div>

        @for (sizeRow of sizeRows; track sizeRow.value) {
          <div class="state-matrix__label">
            <strong>{{ sizeRow.label }}</strong>
            <code>size="{{ sizeRow.value }}"</code>
          </div>

          <div class="state-matrix__cell">
            <kui-segmented [size]="sizeRow.value" selected="seg-b-{{ sizeRow.value }}">
              <button kuiSegment value="seg-a-{{ sizeRow.value }}">A</button>
              <button kuiSegment value="seg-b-{{ sizeRow.value }}">B</button>
            </kui-segmented>
          </div>

          <div class="state-matrix__cell">
            <kui-segmented [size]="sizeRow.value" selected="seg-sel-a-{{ sizeRow.value }}">
              <button kuiSegment value="seg-sel-a-{{ sizeRow.value }}">A</button>
              <button kuiSegment value="seg-sel-b-{{ sizeRow.value }}">B</button>
            </kui-segmented>
          </div>

          <div class="state-matrix__cell">
            <kui-segmented [size]="sizeRow.value" selected="seg-foc-b-{{ sizeRow.value }}">
              <button kuiSegment value="seg-foc-a-{{ sizeRow.value }}" class="kui-seg-demo-focus">A</button>
              <button kuiSegment value="seg-foc-b-{{ sizeRow.value }}">B</button>
            </kui-segmented>
          </div>

          <div class="state-matrix__cell">
            <kui-segmented [size]="sizeRow.value" selected="seg-dis-b-{{ sizeRow.value }}">
              <button kuiSegment value="seg-dis-a-{{ sizeRow.value }}" disabled>A</button>
              <button kuiSegment value="seg-dis-b-{{ sizeRow.value }}">B</button>
            </kui-segmented>
          </div>
        }
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>03</span>
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
  protected readonly sizeRows = SIZE_ROWS;
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
          <h2>Variant × state matrix</h2>
          <p>Line / Pill × default / hover / focus / selected / disabled. Hover and focus CSS-simulated.</p>
        </div>
      </div>

      <div class="state-matrix" style="grid-template-columns: minmax(150px, 0.8fr) repeat(5, minmax(180px, 1fr));" aria-label="Tabs variant state matrix">
        <div class="state-matrix__header"></div>
        @for (col of tabStateCols; track col.value) {
          <div class="state-matrix__header">{{ col.label }}</div>
        }

        @for (variant of tabVariants; track variant.value) {
          <div class="state-matrix__label">
            <strong>{{ variant.label }}</strong>
            <code>variant="{{ variant.value }}"</code>
          </div>

          @for (col of tabStateCols; track col.value) {
            <div class="state-matrix__cell" style="align-items: flex-start; padding-block: 16px;">
              <kui-tabs
                [variant]="variant.value"
                [selected]="col.value === 'selected' ? 'ta-' + variant.value + '-' + col.value : 'tb-' + variant.value + '-' + col.value"
              >
                <button
                  kuiTab
                  value="ta-{{ variant.value }}-{{ col.value }}"
                  [class.kui-tab-demo-hover]="col.value === 'hover'"
                  [class.kui-tab-demo-focus]="col.value === 'focus'"
                  [disabled]="col.value === 'disabled'"
                >Tab</button>
                <button kuiTab value="tb-{{ variant.value }}-{{ col.value }}">Other</button>
                <div kuiTabPanel value="ta-{{ variant.value }}-{{ col.value }}"></div>
                <div kuiTabPanel value="tb-{{ variant.value }}-{{ col.value }}"></div>
              </kui-tabs>
            </div>
          }
        }
      </div>
    </section>

    <section class="panel">
      <div class="panel__title">
        <span>06</span>
        <div>
          <h2>Size matrix</h2>
          <p>xs / sm / md / lg × line / pill.</p>
        </div>
      </div>

      <div class="state-matrix state-matrix--2" aria-label="Tabs size matrix">
        <div class="state-matrix__header"></div>
        <div class="state-matrix__header">Line</div>
        <div class="state-matrix__header">Pill</div>

        @for (sizeRow of sizeRows; track sizeRow.value) {
          <div class="state-matrix__label">
            <strong>{{ sizeRow.label }}</strong>
            <code>size="{{ sizeRow.value }}"</code>
          </div>

          <div class="state-matrix__cell" style="align-items: flex-start; padding-block: 16px;">
            <kui-tabs [size]="sizeRow.value" selected="tab-line-b-{{ sizeRow.value }}">
              <button kuiTab value="tab-line-a-{{ sizeRow.value }}">Overview</button>
              <button kuiTab value="tab-line-b-{{ sizeRow.value }}">Activity</button>
              <button kuiTab value="tab-line-c-{{ sizeRow.value }}">Settings</button>
              <div kuiTabPanel value="tab-line-a-{{ sizeRow.value }}"></div>
              <div kuiTabPanel value="tab-line-b-{{ sizeRow.value }}"></div>
              <div kuiTabPanel value="tab-line-c-{{ sizeRow.value }}"></div>
            </kui-tabs>
          </div>

          <div class="state-matrix__cell" style="align-items: flex-start; padding-block: 16px;">
            <kui-tabs variant="pill" [size]="sizeRow.value" selected="tab-pill-b-{{ sizeRow.value }}">
              <button kuiTab value="tab-pill-a-{{ sizeRow.value }}">Overview</button>
              <button kuiTab value="tab-pill-b-{{ sizeRow.value }}">Activity</button>
              <button kuiTab value="tab-pill-c-{{ sizeRow.value }}">Settings</button>
              <div kuiTabPanel value="tab-pill-a-{{ sizeRow.value }}"></div>
              <div kuiTabPanel value="tab-pill-b-{{ sizeRow.value }}"></div>
              <div kuiTabPanel value="tab-pill-c-{{ sizeRow.value }}"></div>
            </kui-tabs>
          </div>
        }
      </div>
    </section>
  `,
})
export class TabsPage {
  protected readonly manyTabs = [
    'tab1', 'tab2', 'tab3', 'tab4', 'tab5', 'tab6', 'tab7', 'tab8',
  ];
  protected readonly sizeRows = SIZE_ROWS;
  protected readonly tabVariants = [
    { label: 'Line', value: 'line' as const },
    { label: 'Pill', value: 'pill' as const },
  ];
  protected readonly tabStateCols = [
    { label: 'Default', value: 'default' },
    { label: 'Hover', value: 'hover' },
    { label: 'Focus', value: 'focus' },
    { label: 'Selected', value: 'selected' },
    { label: 'Disabled', value: 'disabled' },
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

interface TableUser {
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joined: Date;
  score: number;
}

const TABLE_USERS: TableUser[] = [
  { name: 'Alice Martin', role: 'Engineer', status: 'active', joined: new Date('2022-03-14'), score: 98 },
  { name: 'Bob Chen', role: 'Designer', status: 'active', joined: new Date('2021-07-01'), score: 85 },
  { name: 'Carol Wang', role: 'PM', status: 'inactive', joined: new Date('2023-01-20'), score: 72 },
  { name: 'Dan Patel', role: 'Engineer', status: 'pending', joined: new Date('2024-05-10'), score: 61 },
  { name: 'Eva Ruiz', role: 'QA', status: 'active', joined: new Date('2020-11-03'), score: 90 },
];

@Component({
  selector: 'app-table-page',
  imports: [
    DatePipe,
    KuiTableDirective,
    KuiThGroupDirective,
    KuiThDirective,
    KuiRowDirective,
    KuiCellDirective,
    KuiSelectThComponent,
    KuiSelectCellComponent,
  ],
  template: `
    <!-- 01 Basic -->
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Basic (read-only)</h2>
          <p>No sort, no selection. Pure display table.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table kuiTable [data]="users">
          <thead>
            <tr kuiThGroup>
              <th kuiTh>Name</th>
              <th kuiTh>Role</th>
              <th kuiTh>Status</th>
              <th kuiTh>Score</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users; track u.name) {
              <tr kuiRow [value]="u">
                <td kuiCell>{{ u.name }}</td>
                <td kuiCell>{{ u.role }}</td>
                <td kuiCell>{{ u.status }}</td>
                <td kuiCell>{{ u.score }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <!-- 02 Client-side sort -->
    <section class="panel">
      <div class="panel__title">
        <span>02</span>
        <div>
          <h2>Sortable (client-side)</h2>
          <p>Click headers to sort. Date column uses custom comparator.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table kuiTable #sortTable="kuiTable" [data]="users">
          <thead>
            <tr kuiThGroup>
              <th kuiTh sortKey="name">Name</th>
              <th kuiTh sortKey="role">Role</th>
              <th kuiTh sortKey="status">Status</th>
              <th kuiTh sortKey="joined" [comparator]="dateCompare">Joined</th>
              <th kuiTh sortKey="score">Score</th>
            </tr>
          </thead>
          <tbody>
            @for (u of sortTable.sortedData(); track u.name) {
              <tr kuiRow [value]="u">
                <td kuiCell>{{ u.name }}</td>
                <td kuiCell>{{ u.role }}</td>
                <td kuiCell>{{ u.status }}</td>
                <td kuiCell>{{ u.joined | date: 'yyyy-MM-dd' }}</td>
                <td kuiCell>{{ u.score }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <!-- 03 Selectable -->
    <section class="panel">
      <div class="panel__title">
        <span>03</span>
        <div>
          <h2>Selectable</h2>
          <p>Checkboxes appear automatically when <code>(selectionChange)</code> is bound. Selected: {{ selectedNames() }}</p>
        </div>
      </div>
      <div class="table-wrap">
        <table kuiTable [data]="users" (selectionChange)="onSelect($event)">
          <thead>
            <tr kuiThGroup>
              <th kuiSelectTh></th>
              <th kuiTh>Name</th>
              <th kuiTh>Role</th>
              <th kuiTh>Status</th>
              <th kuiTh>Score</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users; track u.name) {
              <tr kuiRow [value]="u">
                <td kuiSelectCell></td>
                <td kuiCell>{{ u.name }}</td>
                <td kuiCell>{{ u.role }}</td>
                <td kuiCell>{{ u.status }}</td>
                <td kuiCell>{{ u.score }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <!-- 04 Sortable + Selectable -->
    <section class="panel">
      <div class="panel__title">
        <span>04</span>
        <div>
          <h2>Sortable + Selectable</h2>
          <p>Combined: client-side sort with row selection.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table kuiTable #comboTable="kuiTable" [data]="users" (selectionChange)="onSelect($event)">
          <thead>
            <tr kuiThGroup>
              <th kuiSelectTh></th>
              <th kuiTh sortKey="name">Name</th>
              <th kuiTh sortKey="role">Role</th>
              <th kuiTh sortKey="status">Status</th>
              <th kuiTh sortKey="score">Score</th>
            </tr>
          </thead>
          <tbody>
            @for (u of comboTable.sortedData(); track u.name) {
              <tr kuiRow [value]="u">
                <td kuiSelectCell></td>
                <td kuiCell>{{ u.name }}</td>
                <td kuiCell>{{ u.role }}</td>
                <td kuiCell>{{ u.status }}</td>
                <td kuiCell>{{ u.score }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <!-- 05 Sticky header -->
    <section class="panel">
      <div class="panel__title">
        <span>05</span>
        <div>
          <h2>Sticky header</h2>
          <p>Header stays visible while scrolling. Wrapped in a fixed-height container.</p>
        </div>
      </div>
      <div class="table-wrap table-wrap--scroll">
        <table kuiTable [data]="manyUsers">
          <thead>
            <tr kuiThGroup [sticky]="true">
              <th kuiTh>Name</th>
              <th kuiTh>Role</th>
              <th kuiTh>Status</th>
              <th kuiTh>Score</th>
            </tr>
          </thead>
          <tbody>
            @for (u of manyUsers; track u.name) {
              <tr kuiRow [value]="u">
                <td kuiCell>{{ u.name }}</td>
                <td kuiCell>{{ u.role }}</td>
                <td kuiCell>{{ u.status }}</td>
                <td kuiCell>{{ u.score }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <!-- 06 Size matrix -->
    <section class="panel">
      <div class="panel__title">
        <span>06</span>
        <div>
          <h2>Sizes</h2>
          <p>xs / sm / md (default) / lg</p>
        </div>
      </div>
      <div class="state-matrix" style="grid-template-columns: repeat(4, 1fr)">
        @for (sz of sizes; track sz) {
          <div class="state-matrix__cell">
            <div class="state-matrix__label">{{ sz }}</div>
            <div class="table-wrap">
              <table kuiTable [size]="sz" [data]="users.slice(0, 3)">
                <thead>
                  <tr kuiThGroup>
                    <th kuiTh>Name</th>
                    <th kuiTh>Score</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of users.slice(0, 3); track u.name) {
                    <tr kuiRow [value]="u">
                      <td kuiCell>{{ u.name }}</td>
                      <td kuiCell>{{ u.score }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- 07 Server-side sort -->
    <section class="panel">
      <div class="panel__title">
        <span>07</span>
        <div>
          <h2>Server-side sort</h2>
          <p>Parent subscribes to <code>(sortChange)</code> — table emits event instead of sorting locally. Last event: <code>{{ serverSortLabel() }}</code></p>
        </div>
      </div>
      <div class="table-wrap">
        <table kuiTable [data]="serverData()" (sortChange)="onServerSort($event)">
          <thead>
            <tr kuiThGroup>
              <th kuiTh sortKey="name">Name</th>
              <th kuiTh sortKey="role">Role</th>
              <th kuiTh sortKey="score">Score</th>
            </tr>
          </thead>
          <tbody>
            @for (u of serverData(); track u.name) {
              <tr kuiRow [value]="u">
                <td kuiCell>{{ u.name }}</td>
                <td kuiCell>{{ u.role }}</td>
                <td kuiCell>{{ u.score }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class TablePage {
  protected readonly users = TABLE_USERS;
  protected readonly manyUsers = [...TABLE_USERS, ...TABLE_USERS, ...TABLE_USERS, ...TABLE_USERS];
  protected readonly sizes = ['xs', 'sm', 'md', 'lg'] as const;

  private readonly _selected = signal<TableUser[]>([]);
  protected readonly selectedNames = computed(() => {
    const sel = this._selected();
    return sel.length === 0 ? 'none' : sel.map((u) => u.name).join(', ');
  });

  protected readonly dateCompare = (a: unknown, b: unknown) =>
    (a as TableUser).joined.getTime() - (b as TableUser).joined.getTime();

  protected onSelect(items: TableUser[]): void {
    this._selected.set(items);
  }

  private readonly _serverSort = signal<{ key: string; direction: string } | null>(null);
  protected readonly serverSortLabel = computed(() => {
    const s = this._serverSort();
    return s ? `${s.key} ${s.direction}` : 'none';
  });
  protected readonly serverData = computed(() => {
    const s = this._serverSort();
    if (!s) return TABLE_USERS;
    return [...TABLE_USERS].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[s.key];
      const bv = (b as unknown as Record<string, unknown>)[s.key];
      const cmp = String(av).localeCompare(String(bv));
      return s.direction === 'asc' ? cmp : -cmp;
    });
  });
  protected onServerSort(evt: { key: string; direction: 'asc' | 'desc' }): void {
    this._serverSort.set(evt);
  }
}
