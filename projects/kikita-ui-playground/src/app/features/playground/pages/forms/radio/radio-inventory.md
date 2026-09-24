# Radio Inventory

## Covered

- Default exclusive plan group with a selected initial option, a visible `legend`, native labels, and `kui-field` hint wiring.
- Every supported size: `xs`, `sm`, `md`, and `lg`.
- Checked and unchecked radios, disabled and disabled-checked radios, and standalone `invalid` inputs.
- A required radio group with `kui-field` hint, visible error, and field-inherited invalid state.
- Native pointer selection and arrow-key selection; browser snapshots cover real hover, focus-visible, and pressed states.
- At desktop width the complete state card is captured together; at 320px its native fieldsets are captured separately within the shell's short mobile workspace.

## Omitted combinations

- Size-by-state cross-products are omitted because each size has its own visible sample and selected, disabled, invalid, focus, hover, and active states are shown at the default size.
- A disabled-invalid combination is omitted because a disabled choice cannot be selected or corrected and does not represent a useful validation state.
- Read-only and indeterminate states are omitted because native radio inputs do not support those states.
- The invalid field group is left unselected so its required error has a meaningful state; checked and invalid are not crossed because the displayed field error represents a missing choice.
