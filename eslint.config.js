import tseslint from 'typescript-eslint'

export default tseslint.config(
  tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    ignores: ['**/*.spec.ts', 'dist', 'node_modules'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      'prefer-const': 'error',
      'object-curly-spacing': ['warn', 'always'],
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['warn', 'never'],
      'comma-dangle': ['error', 'only-multiline'],
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    ignores: ['dist', 'node_modules', 'coverage'],
  }
)
