import { Component, computed, inject } from '@angular/core';

import {
  KUI_THEME,
  KuiButtonDirective,
  KuiFieldComponent,
  KuiGroupDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
  KuiInputDirective,
} from '@kikita-labs/ui';

import {
  BUTTON_VARIANTS,
  STATE_COLUMNS,
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
    <section class="panel split">
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
          <h2>Button state matrix</h2>
          <p>Default, hover, active, focus, and disabled states.</p>
        </div>
      </div>

      <div class="state-matrix" aria-label="Button state matrix">
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
  `,
})
export class ButtonPage {
  protected readonly buttonVariants = BUTTON_VARIANTS;
  protected readonly stateColumns = STATE_COLUMNS;
}

@Component({
  selector: 'app-field-page',
  imports: [KuiFieldComponent, KuiInputDirective],
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
          <textarea kuiInput placeholder="Token decisions, component notes"></textarea>
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
  `,
})
export class InputPage {}

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
  `,
})
export class IconsPage {}

@Component({
  selector: 'app-forms-page',
  imports: [KuiButtonDirective, KuiFieldComponent, KuiInputDirective],
  template: `
    <section class="panel">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Forms route</h2>
          <p>
            Signal Forms integration is planned; this route currently verifies native field wiring.
          </p>
        </div>
      </div>

      <form class="form-preview">
        <kui-field label="Email" hint="Native input now; Signal Forms binding comes later.">
          <input kuiInput type="email" placeholder="nikita@kikita.dev" />
        </kui-field>

        <kui-field label="Project" error="Required for error-state verification" required>
          <input kuiInput invalid value="" />
        </kui-field>

        <button kuiButton type="button">Save</button>
      </form>
    </section>
  `,
})
export class FormsPage {}
