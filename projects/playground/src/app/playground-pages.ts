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
  KuiSwitchDirective,
  KuiTextareaDirective,
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
  `,
})
export class InputPage {}

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
  `,
})
export class CheckboxPage {}

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
  `,
})
export class SwitchPage {}

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
  `,
})
export class RadioPage {}

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
  `,
})
export class BadgePage {}

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
  `,
})
export class IconsPage {}

@Component({
  selector: 'app-forms-page',
  imports: [FormField, FormRoot, KuiButtonDirective, KuiFieldComponent, KuiInputDirective],
  template: `
    <section class="panel split">
      <div class="panel__title">
        <span>01</span>
        <div>
          <h2>Signal Forms spike</h2>
          <p>
            Native Angular Signal Forms field binding on the same input as <code>kuiInput</code>.
          </p>
        </div>
      </div>

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
