module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'prettier',
    'plugin:react-hooks/recommended',
    'airbnb',
  ],
  overrides: [
    {
      files: 'packages/**/*.spec.{ts,tsx}',
      plugins: ['jest', 'jest-dom'],
      extends: [
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:jest-dom/recommended',
      ],
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'import'],
  rules: {
    'arrow-body-style': 'off',
    'dot-notation': 'off',
    'func-names': 'off',
    'import/no-duplicates': 'off',
    'import/no-useless-path-segments': 'off',
    'lines-between-class-members': 'off',
    'no-else-return': 'off',
    'no-extra-boolean-cast': 'off',
    'no-unneeded-ternary': 'off',
    'no-useless-computed-key': 'off',
    'no-useless-return': 'off',
    'object-shorthand': 'off',
    'one-var': 'off',
    'operator-assignment': 'off',
    'prefer-arrow-callback': 'off',
    'prefer-const': 'off',
    'prefer-object-spread': 'off',
    'prefer-template': 'off',
    'quote-props': 'off',
    'react/jsx-boolean-value': 'off',
    'react/jsx-closing-tag-location': 'off',
    'react/jsx-curly-brace-presence': 'off',
    'react/jsx-fragments': 'off',
    'react/self-closing-comp': 'off',
    'spaced-comment': 'off',
    'comma-dangle': 'off',
    'object-curly-newline': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'no-confusing-arrow': 'off',
    'function-paren-newline': 'off',
    'react/jsx-wrap-multilines': 'off',
    'nonblock-statement-body-position': 'off',
    'react/jsx-curly-newline': 'off',
    'react/jsx-indent': 'off',
    'consistent-return': 'off',
    'default-case': 'off',
    'global-require': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      { packageDir: ['.', './packages/odf'] },
    ],
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'max-classes-per-file': 'off',
    'max-len': 'off',
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'error',
    'no-empty-pattern': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-prototype-builtins': 'off',
    'no-redeclare': 'off',
    'no-restricted-globals': 'off',
    'no-restricted-syntax': 'off',
    'no-return-assign': 'off',
    'no-shadow': 'off',
    'no-tabs': 'off',
    'no-undef': 'off',
    'no-underscore-dangle': 'off',
    'no-unreachable': 'off',
    'no-unused-expressions': 'off',
    'no-use-before-define': 'off',
    'no-useless-catch': 'off',
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    'operator-linebreak': 'off',
    'prefer-destructuring': 'off',
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': 'off',
    'react/jsx-no-bind': 'off',
    'react/jsx-pascal-case': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-array-index-key': 'off',
    'react/no-unused-state': 'off',
    'react/sort-comp': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'react/prop-types': 'off',
    'import/order': [
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
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: '@patternfly/*',
            group: 'external',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin', 'react'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'never',
      },
    ],
    quotes: 'off',
    indent: 'off',
    curly: 'off',
    camelcase: 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
