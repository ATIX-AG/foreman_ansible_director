import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import stylistic from '@stylistic/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';

export default [
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
            react: reactPlugin,
            import: importPlugin,
            'react-hooks': reactHooks,
            '@stylistic': stylistic,
        },
        settings: {
            react: {
                version: 'detect',
            },
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
                },
            },
        },
        rules: {
            // TypeScript rules
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/explicit-function-return-type': ['error', {
                allowExpressions: true,
            }],

            'no-unused-vars': 'off',
            'linebreak-style': ['error', 'unix'],
            'no-undef': 'off',
            'camelcase': 'off',

            'indent': 'off',
            '@stylistic/indent': ['error', 2, {'CallExpression': {'arguments': 1}}],

            'react/require-default-props': 'off',
            'react-hooks/exhaustive-deps': 'warn',
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/immutability': 'off',

            'import/order': [
                'error',
                {
                    groups: [
                        'external',
                        ['internal', 'parent', 'sibling'],
                    ],
                },
            ],

            // Style Rules

            'quotes': 'off',
            '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
            '@stylistic/jsx-quotes': ['error', 'prefer-double'],

            '@stylistic/semi': ['error', 'always'],
            '@stylistic/semi-spacing': ['error', { before: false, after: true }],
            '@stylistic/semi-style': ['error', 'last'],

            '@stylistic/comma-dangle': [
                'error',
                {
                    arrays: 'always-multiline',
                    objects: 'always-multiline',
                    imports: 'always-multiline',
                    exports: 'always-multiline',
                    functions: 'never',
                    enums: 'never',
                    generics: 'never',
                    tuples: 'never',
                    importAttributes: 'never',
                    dynamicImports: 'never',
                },
            ],
            '@stylistic/comma-spacing': ['error', { before: false, after: true }],
            '@stylistic/comma-style': ['error', 'last'],

            '@stylistic/keyword-spacing': ['error', { before: true, after: true }],
            '@stylistic/arrow-spacing': ['error', { before: true, after: true }],
            '@stylistic/block-spacing': ['error', 'always'],

            '@stylistic/object-curly-spacing': ['error', 'always'],

            '@stylistic/space-in-parens': ['error', 'never'],

            '@stylistic/space-before-blocks': ['error', 'always'],
            '@stylistic/space-before-function-paren': ['error', 'always'],

            '@stylistic/space-unary-ops': ['error', { words: true, nonwords: false }],

            '@stylistic/space-infix-ops': 'error',

            '@stylistic/key-spacing': ['error', { beforeColon: false, afterColon: true }],

            '@stylistic/computed-property-spacing': ['error', 'never'],

            '@stylistic/arrow-parens': ['error', 'as-needed'],

            '@stylistic/function-call-spacing': ['error', 'never'],
            '@stylistic/function-paren-newline': ['error', 'multiline-arguments'],

            '@stylistic/eol-last': 'error',
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/no-multi-spaces': 'error',
            '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1, maxBOF: 0 }],

            '@stylistic/operator-linebreak': ['error', 'after', { "overrides": { "|": "before" , "?": "before", ":": "before"} }],
            '@stylistic/multiline-ternary': ['error', 'always-multiline', {'ignoreJSX': true}],

            '@stylistic/jsx-curly-spacing': ['error', 'never'],
            '@stylistic/jsx-tag-spacing': [
                'error',
                {
                    beforeSelfClosing: 'always',
                    afterOpening: 'never',
                    beforeClosing: 'never',
                },
            ],
            '@stylistic/jsx-one-expression-per-line': ['error', { allow: 'single-line' }],
            '@stylistic/jsx-curly-newline': ['error', 'consistent'],
            '@stylistic/jsx-wrap-multilines': [
                'error',
                {
                    "declaration": "parens",
                    "assignment": "parens",
                    "return": "parens",
                    "arrow": "parens",
                    "condition": "ignore",
                    "logical": "ignore",
                    "prop": "ignore",
                    "propertyValue": "ignore"
                },
            ],
            '@stylistic/jsx-pascal-case': 'error',
            '@stylistic/jsx-closing-bracket-location': ['error', 'line-aligned'],
            '@stylistic/jsx-first-prop-new-line': ['error', 'multiline'],
            '@stylistic/jsx-indent-props': ['error', 2],
            '@stylistic/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }],
            '@stylistic/jsx-self-closing-comp': 'error',
            '@stylistic/jsx-shorthand-boolean': 'error',
            '@stylistic/jsx-shorthand-fragment': 'error',

            '@stylistic/spaced-comment': ['error', 'always', { markers: ['/'] }],

            '@stylistic/member-delimiter-style': [
                'error'
            ],
        },
    },
    {
        ignores: ['node_modules/**', './webpack/global_index.js'],
    },
];
