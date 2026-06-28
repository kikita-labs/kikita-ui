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

### `kui-accordion-item`

| Input      | Type      | Default | Notes                                                     |
| ---------- | --------- | ------- | --------------------------------------------------------- |
| `header`   | `string`  | `''`    | Trigger label.                                            |
| `id`       | `string`  | auto    | Stable ID for state and ARIA wiring.                      |
| `disabled` | `boolean` | `false` | Removes the trigger from tab order and prevents toggling. |

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
