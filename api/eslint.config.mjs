// ESLint flat config: recommended JS + TypeScript rules.
// Run with `npm run lint`. Claude Code's lint hook runs `eslint --fix` after each edit.
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      // Unused function arguments are allowed when prefixed with _, e.g. Express's _next.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
