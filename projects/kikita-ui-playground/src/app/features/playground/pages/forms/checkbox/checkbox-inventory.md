# Checkbox Inventory

## Covered

- Default unchecked checkbox at the default `md` size, with native pointer and keyboard toggling.
- All supported sizes: `xs`, `sm`, `md`, and `lg`; checked examples at `sm` and `md`.
- Checked, disabled, disabled and checked, invalid with a visible field error, indeterminate, a real focus-visible example, pointer-hovered, and pressed states.
- The focused example receives focus after rendering so its `Focused` label matches the visible native focus ring on both initial load and sidebar navigation.
- Visible labels and error association through `kui-field`.

## Omitted combinations

- The full size-by-state matrix is omitted because size and state styling are independently visible; repeating every state at every size would add duplicate examples. Hover, pressed, and focus are captured on the default-sized control rather than crossed with every size/value state.
- Disabled and invalid together is omitted because an unavailable control with a validation error is not a useful form state.
- Checked and indeterminate together is omitted because the native mixed marker takes precedence visually and communicates the same indeterminate state.
