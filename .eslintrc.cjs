module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'coverage', 'e2e'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  plugins: ['react', 'react-refresh', 'react-hooks'],
  rules: {
    'react-refresh/only-export-components': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'warn', // Solo warning, no error
    'no-prototype-builtins': 'off',
    'no-useless-escape': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
  overrides: [
    {
      files: ['public/sw.js'],
      env: {
        serviceworker: true
      },
      globals: {
        self: 'readonly',
        clients: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        skipWaiting: 'readonly',
        addEventListener: 'readonly'
      }
    }
  ],
}
