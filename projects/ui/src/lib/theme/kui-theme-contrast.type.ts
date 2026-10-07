/**
 * Contrast mode of the generated theme.
 *
 * @remarks
 * `strict` keeps control borders at 3:1 against the surface (WCAG 1.4.11). `soft` reads quieter
 * neutral steps for control borders and falls below that ratio, so it is an explicit opt-in.
 */
export type KuiThemeContrast = 'strict' | 'soft';
