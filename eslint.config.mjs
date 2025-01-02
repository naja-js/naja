import {FlatCompat} from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [...compat.extends(
	'eslint:recommended',
	'plugin:@typescript-eslint/eslint-recommended',
	'plugin:@typescript-eslint/recommended',
), {
	plugins: {
		'@typescript-eslint': typescriptEslint,
	},

	languageOptions: {
		globals: {
			...globals.browser,
		},

		parser: tsParser,
	},

	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'array-bracket-spacing': 'error',
		'arrow-body-style': 'error',
		'arrow-parens': 'error',
		'arrow-spacing': 'error',
		'block-scoped-var': 'error',
		'block-spacing': 'error',
		'brace-style': 'error',
		camelcase: 'error',
		'comma-dangle': ['error', 'always-multiline'],
		'comma-spacing': 'error',
		'comma-style': 'error',
		'computed-property-spacing': 'error',
		curly: ['error', 'all'],
		'dot-notation': 'error',
		'eol-last': 'error',
		eqeqeq: 'error',
		'func-call-spacing': 'error',
		'func-names': ['error', 'never'],
		'func-style': 'error',
		indent: ['error', 'tab'],
		'keyword-spacing': 'error',
		'linebreak-style': ['error', 'unix'],
		'max-depth': 'error',
		'max-statements-per-line': 'error',
		'new-parens': 'error',
		'no-array-constructor': 'error',
		'no-empty-function': 'error',
		'no-extra-bind': 'error',
		'no-extra-parens': 'off',
		'no-implicit-globals': 'error',
		'no-multi-spaces': 'error',
		'no-nested-ternary': 'error',
		'no-redeclare': 'error',
		'no-return-assign': 'error',
		'no-throw-literal': 'error',
		'no-trailing-spaces': 'error',
		'no-unneeded-ternary': 'error',
		'no-unused-expressions': 'error',
		'no-useless-return': 'error',
		'no-var': 'error',
		'object-curly-spacing': 'error',
		'object-shorthand': 'error',
		'prefer-arrow-callback': 'error',
		'prefer-const': 'error',
		'prefer-destructuring': 'error',
		'prefer-rest-params': 'error',
		'prefer-spread': 'error',
		'prefer-template': 'error',
		quotes: ['error', 'single'],
		semi: ['error', 'always'],
		'space-before-blocks': 'error',

		'space-before-function-paren': ['error', {
			anonymous: 'always',
			named: 'never',
		}],

		'spaced-comment': 'error',
		'template-curly-spacing': 'error',
		'unicode-bom': 'error',
		yoda: 'error',
	},
}];
