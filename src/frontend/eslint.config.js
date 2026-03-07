import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

const files = ['src/**/*.{ts,tsx}'];

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '__tests__/**',
      'e2e/**',
      'test/**',
      '*.js',
      'scripts/**',
      'capture-*.js',
    ],
  },
  {
    files,
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: { ...globals.browser, ...globals.es2020 },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/bg-slate-900/]",
          message: "Do not use bg-slate-900. Use V1 child-centric light theme classes instead (e.g. bg-[#FFF8F0], white cards)."
        },
        {
          selector: "TemplateElement[value.raw=/bg-slate-900/]",
          message: "Do not use bg-slate-900. Use V1 child-centric light theme classes instead (e.g. bg-[#FFF8F0], white cards)."
        }
      ],
    },
  },
];
