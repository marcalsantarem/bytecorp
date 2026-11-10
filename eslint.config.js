import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'cyber_corp_node_tycoon.html'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // O núcleo de lógica não pode depender da apresentação (GDD 24.2 e 24.4).
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['react', 'react-dom', 'react/*', 'three', 'three/*', 'lucide-react'], message: 'src/core não pode importar bibliotecas de interface ou renderização.' },
            { group: ['**/ui/**', '**/render/**', '**/audio/**', '**/platform/**'], message: 'src/core não pode importar camadas de apresentação ou plataforma.' },
          ],
        },
      ],
    },
  },
)
