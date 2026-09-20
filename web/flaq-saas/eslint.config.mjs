import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  eslintConfigPrettier,
  globalIgnores([
    '**/dist/**',
    '**/node_modules/**',
    '**/.next/**',
    '**/.vscode/**',
    '**/build/**',
    '**/messages/**',
    '**/components.json',
    '**/components/ui/**',
    '**/components/magicui/**',
  ]),
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'jsx-quotes': ['error', 'prefer-single'],
      'react/jsx-one-expression-per-line': 'off',
      'function-paren-newline': 'off',
      'max-len': 'off',
      'implicit-arrow-linebreak': 'off',
      'operator-linebreak': 'off',
      '@next/next/no-img-element': 'off',
      'react/require-default-props': 'off',
      'object-curly-newline': 'off',
      'react/jsx-props-no-spreading': 'off',
      'jsx-a11y/control-has-associated-label': 'off',
      'react/no-array-index-key': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/destructuring-assignment': 'off',
    },
  },
]);
