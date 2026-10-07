/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'custom-property-pattern': '^_?[a-z][a-z0-9]*(?:-[a-z0-9]+)*$',
    'declaration-empty-line-before': null,
    'alpha-value-notation': 'number',
    'media-feature-range-notation': null,
    'no-empty-source': null,
    'rule-empty-line-before': null,
    'scss/double-slash-comment-empty-line-before': null,
    'selector-class-pattern':
      '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?(?:--[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?$',
  },
};
