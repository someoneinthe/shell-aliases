import eslint from '@eslint/js';
import eslintPluginStylistic from '@stylistic/eslint-plugin';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginN from 'eslint-plugin-n';
import eslintPluginPerfectionist from 'eslint-plugin-perfectionist';
import eslintPluginSortKeysShorthand from 'eslint-plugin-sort-keys-shorthand';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  eslintPluginStylistic.configs['all-flat'],
  eslintPluginUnicorn.configs['flat/recommended'],
  eslintPluginPerfectionist.configs['recommended-natural'],
  eslintPluginN.configs['flat/recommended'],
  {
    ignores: ['node_modules/'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        strictPropertyInitialization: true,
      },
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      '@stylistic': eslintPluginStylistic,
      import: eslintPluginImport,
      'sort-keys-shorthand': eslintPluginSortKeysShorthand,
    },
    rules: {
      '@stylistic/array-element-newline': ['error', 'consistent'],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/brace-style': ['error', 'stroustrup'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      '@stylistic/newline-per-chained-call': ['error', {ignoreChainWithDepth: 3}],
      '@stylistic/object-curly-spacing': ['error', 'never'],
      '@stylistic/object-property-newline': ['error', {allowAllPropertiesOnSameLine: true}],
      '@stylistic/padded-blocks': ['error', 'never'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      'arrow-body-style': [
        'error',
        'as-needed',
      ],
      'arrow-parens': [
        'error',
        'as-needed',
      ],
      'comma-dangle': [
        'error',
        'always-multiline',
      ],
      'n/no-process-exit': 'off',
      'n/shebang': 'off',
      'no-trailing-spaces': 'error',
      'no-useless-concat': 'error',
      'perfectionist/sort-array-includes': [
        'error',
        {
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-classes': 'off',
      'perfectionist/sort-enums': [
        'error',
        {
          ignoreCase: true,
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'unknown',
          ],
          ignoreCase: true,
          newlinesBetween: 'never',
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-interfaces': [
        'error',
        {
          ignoreCase: true,
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-named-imports': [
        'error',
        {
          ignoreCase: true,
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-object-types': [
        'error',
        {
          ignoreCase: true,
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-objects': 'off',
      'prefer-template': 'error',
      'sort-keys-shorthand/sort-keys-shorthand': [
        'error',
        'asc',
        {
          caseSensitive: false,
          minKeys: 2,
          natural: true,
          shorthand: 'first',
        },
      ],
      'unicorn/explicit-length-check': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'warn',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-unreadable-array-destructuring': 'off',
      'unicorn/prefer-module': 'error',
    },
    settings: {
      'import/resolver': {
        node: true,
      },
    },
  },
];
