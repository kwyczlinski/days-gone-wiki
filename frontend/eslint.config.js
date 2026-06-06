import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: ['dist', 'node_modules'],
  },

  {
    files: ['**/*.{js,jsx}'],

    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    rules: {
      // base JS rules
      ...js.configs.recommended.rules,

      // React rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,

      // Hooks rules
      ...reactHooks.configs.recommended.rules,

      // React Refresh (Vite HMR safety)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      'react/prop-types': 'off',
    },
  },
])