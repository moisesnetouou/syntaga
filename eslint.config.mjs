import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      'next/core-web-vitals',
      'next/typescript',
      'plugin:prettier/recommended',
      'plugin:@tanstack/eslint-plugin-query/recommended',
    ],
    plugins: ['eslint-plugin-import-helpers', '@tanstack/query'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'react-hooks/exhaustive-deps': 'off',
      'import-helpers/order-imports': [
        'warn',
        {
          newlinesBetween: 'always',
          groups: [
            ['/^react/', '/^next/', '/^@next/'],
            ['module'],
            [
              '/^@/components/',
              '/^@/contexts/',
              '/^@/data/',
              '/^@/hooks/',
              '/^@/pages/',
              '/^@/store/',
              '/^@/templates/',
              '/^@/utils/',
              '/^@/lib/',
            ],
            ['parent', 'sibling', 'index', '/assets/'],
          ],
          alphabetize: { order: 'asc', ignoreCase: true },
        },
      ],
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn',
      '@tanstack/query/stable-query-client': 'error',
    },
  }),
];

export default eslintConfig;
