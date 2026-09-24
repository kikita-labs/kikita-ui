# Color Input Inventory

- Minimal example: `<input kuiColorInput>` inside `kui-field` for a visible label and hint. The directive styles a native text input and adds the Kikita picker affordances.
- Sizes: `xs`, `sm`, `md`, and `lg` on editable text inputs, matching the directive's documented size input and its color-text editing use case.
- Values: hex and OKLCH text values, both documented by the directive.
- Field states: hint and label association, disabled and readonly inputs, focused text input, keyboard-focused picker trigger, hover, and explicit `invalid` with the field's visible error.
- The directive also exposes `id` and `swatchLabel`; `id` is omitted because `kui-field` supplies the associated control id, while examples set a localized swatch label on the size and state inputs.
- The picker popover is provided by the directive. Browser checks capture the custom popover and exercise text-input value changes; they do not invoke any browser or OS color picker.
- Focus and hover are captured separately after browser interaction so the page does not steal focus on navigation. No size-by-value cross-product or repeated hover/focus state for every size/value is shown because it repeats the same styling without adding a distinct state.
