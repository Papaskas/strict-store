import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import type { Linter } from 'eslint';

const config: Linter.Config[] = [
  {
    ignores: ['dist/**', 'coverage/**', 'docs/**', '**/*.d.ts'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  eslintConfigPrettier,
];

export default config;
