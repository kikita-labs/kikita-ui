// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

const commonTsConfig = {
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
    angular.configs.tsRecommended,
  ],
  plugins: {
    'simple-import-sort': simpleImportSort,
  },
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ['eslint.config.js'],
        maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 16,
      },
      tsconfigRootDir: __dirname,
    },
  },
  processor: angular.processInlineTemplates,
  rules: {
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        disallowTypeAnnotations: false,
        fixStyle: 'separate-type-imports',
        prefer: 'type-imports',
      },
    ],
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/prefer-readonly': 'warn',
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^@angular/(?!core/rxjs-interop$)'],
          ['^@angular/core/rxjs-interop$', '^rxjs(?:/|$)'],
          ['^@kikita-labs/ui$'],
          ['^@?(?!kikita-labs/ui(?:/|$))'],
          ['^\\.'],
          ['^\\u0000'],
        ],
      },
    ],
  },
};

module.exports = defineConfig([
  {
    files: ['projects/ui/**/*.ts'],
    ...commonTsConfig,
    rules: {
      ...commonTsConfig.rules,
      '@angular-eslint/directive-selector': [
        'warn',
        {
          type: 'attribute',
          prefix: 'kui',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'warn',
        {
          type: 'element',
          prefix: 'kui',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/no-input-rename': 'warn',
      '@angular-eslint/no-output-native': 'warn',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@kikita-labs/ui',
              message:
                'Library internals must use relative imports, not the public package barrel.',
            },
          ],
          patterns: [
            {
              group: ['@kikita-labs/ui/*'],
              message: 'Library internals must use relative imports, not public package subpaths.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['projects/playground/**/*.ts'],
    ...commonTsConfig,
    rules: {
      ...commonTsConfig.rules,
      '@angular-eslint/directive-selector': [
        'warn',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'warn',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['*.ts', 'tests/e2e/*.ts', 'tests/e2e/support/*.ts'],
    ...commonTsConfig,
    rules: {
      ...commonTsConfig.rules,
    },
  },
  {
    files: ['**/*.spec.ts', 'tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-readonly': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'warn',
    },
  },
]);
