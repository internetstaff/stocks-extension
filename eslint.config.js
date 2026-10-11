import js from '@eslint/js';

// Rules modeled on GNOME Shell's own ESLint config / the extension review guidelines.
export default [
    js.configs.recommended,
    {
        files: ['stocks@infinicode.de/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                global: 'readonly',
                log: 'readonly',
                logError: 'readonly',
                print: 'readonly',
                printerr: 'readonly',
                console: 'readonly',
                TextDecoder: 'readonly',
                TextEncoder: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                imports: 'readonly',
                ARGV: 'readonly',
            },
        },
        rules: {
            'no-var': 'error',
            'prefer-const': 'error',
            'eqeqeq': ['error', 'always', {null: 'ignore'}],
            'no-unused-vars': ['error', {vars: 'all', args: 'none', caughtErrors: 'none'}],
            'no-trailing-spaces': 'error',
            'eol-last': 'error',
            'no-multiple-empty-lines': ['error', {max: 2}],
        },
    },
];
