# Accordion

`kui-accordion` groups expandable sections and manages open state for
`kui-accordion-item` children.

## Import

```ts
import { KuiAccordionComponent, KuiAccordionItemComponent } from '@kikita-labs/ui';
```

## Usage

```html
<kui-accordion mode="exclusive" appearance="default" size="md">
  <kui-accordion-item id="general" header="General settings">
    Configure display and behavior options.
  </kui-accordion-item>

  <kui-accordion-item id="security" header="Security">
    Account security parameters.
  </kui-accordion-item>
</kui-accordion>
```

## Multi Mode

```html
<kui-accordion mode="multi" [(expandedItems)]="expanded">
  <kui-accordion-item id="profile" header="Profile">Profile content</kui-accordion-item>
  <kui-accordion-item id="billing" header="Billing">Billing content</kui-accordion-item>
</kui-accordion>
```

## Icon Slot

```html
<kui-accordion-item header="Settings">
  <ng-template kuiAccordionIcon>
    <kui-icon name="settings" />
  </ng-template>

  Settings content.
</kui-accordion-item>
```

## Inputs

### `kui-accordion`

| Input           | Type                                 | Default       | Notes                                                      |
| --------------- | ------------------------------------ | ------------- | ---------------------------------------------------------- |
| `mode`          | `'exclusive' \| 'multi'`             | `'exclusive'` | Single-open or multi-open behavior.                        |
| `appearance`    | `'default' \| 'bordered' \| 'ghost'` | `'default'`   | Container and divider treatment.                           |
| `size`          | `KuiSize`                            | `'md'`        | Trigger height and text size.                              |
| `expandedItems` | `string[]`                           | `[]`          | IDs of currently expanded items. Supports two-way binding. |

`mode`, `appearance`, and `size` are configuration inputs. Only
`expandedItems` is component-owned mutable state and supports two-way binding.

### `kui-accordion-item`

| Input      | Type      | Default | Notes                                                     |
| ---------- | --------- | ------- | --------------------------------------------------------- |
| `header`   | `string`  | `''`    | Trigger label.                                            |
| `id`       | `string`  | auto    | Stable ID for state and ARIA wiring.                      |
| `disabled` | `boolean` | `false` | Removes the trigger from tab order and prevents toggling. |

## Provider Defaults

Set `defaults.accordion` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    accordion: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  kuiProvideDefaults({
    accordion: {
      /* options below */
    },
  }),
];
```

| Option       | Values                               | Description                                                       |
| ------------ | ------------------------------------ | ----------------------------------------------------------------- |
| `size`       | `'xs' \| 'sm' \| 'md' \| 'lg'`       | Component size. Takes precedence over the global `defaults.size`. |
| `mode`       | `'exclusive' \| 'multi'`             | Default mode.                                                     |
| `appearance` | `'default' \| 'bordered' \| 'ghost'` | Default appearance.                                               |

Each option resolves as `local input > defaults.accordion.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Accessibility

Each item renders a native button trigger with `aria-expanded`, `aria-controls`,
and a region body linked through `aria-labelledby`.

## Styles

Import the Kikita UI style entrypoint once:

```scss
@import '@kikita-labs/ui/styles';
```

Accordion styles live in `projects/ui/src/styles/accordion.css` and are included
through `@kikita-labs/ui/styles`.

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                      | Default                      | Controls                 |
| ------------------------------------------ | ---------------------------- | ------------------------ |
| `--kui-accordion-trigger-focus-ring-color` | `--kui-color-focus`          | Trigger focus ring color |
| `--kui-accordion-icon-color`               | `--kui-color-text-secondary` | Icon color               |
| `--kui-accordion-chevron-color`            | `--kui-color-text-secondary` | Chevron color            |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                              | Default                | Controls                          |
| -------------------------------------------------- | ---------------------- | --------------------------------- |
| `--kui-accordion-trigger-gap`                      | `--kui-space-2`        | Trigger gap                       |
| `--kui-accordion-trigger-font-size`                | `--kui-text-base-size` | Trigger font size                 |
| `--kui-accordion-trigger-radius-focus`             | `--kui-radius-xs`      | Trigger corner radius, focus      |
| `--kui-accordion-body-content-font-size`           | `--kui-text-sm-size`   | Body content font size            |
| `--kui-accordion-trigger-font-size-sm`             | `--kui-text-sm-size`   | Trigger font size, sm             |
| `--kui-accordion-trigger-font-size-lg`             | `--kui-text-md-size`   | Trigger font size, lg             |
| `--kui-accordion-body-content-padding-bottom-sm`   | `--kui-space-3`        | Body content padding, bottom sm   |
| `--kui-accordion-body-content-padding-top-lg`      | `--kui-space-3`        | Body content padding, top lg      |
| `--kui-accordion-body-content-padding-bottom-lg`   | `--kui-space-5`        | Body content padding, bottom lg   |
| `--kui-accordion-body-content-padding-block-start` | `--kui-space-1`        | Body content padding, block start |
| `--kui-accordion-body-content-padding-block-end`   | `--kui-space-4`        | Body content padding, block end   |
| `--kui-accordion-trigger-min-height-sm`            | `36px`                 | Trigger minimum height, sm        |
| `--kui-accordion-trigger-min-height-lg`            | `52px`                 | Trigger minimum height, lg        |

<!-- geometry-tokens:end -->
