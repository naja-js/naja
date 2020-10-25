import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import path from 'path';

import pkg from './package.json';
const output = {
	banner: `/*\n * Naja.js\n * ${pkg.version}\n *\n * by Jiří Pudil <https://jiripudil.cz>\n */`,
	sourcemap: true,
};

const babelPlugin = babel({
	exclude: /node_modules\/(?!event-target-shim)/,
	include: [
		'src/**',
		'node_modules/event-target-shim/**',
	],
	babelHelpers: 'runtime',
});

export default [
	{
		// ESM build for modern tools like webpack
		input: 'src/index.esm.js',
		output: {
			...output,
			file: pkg.module,
			format: 'esm',
		},
		external: [
			/@babel\/runtime/,
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.peerDependencies || {}),
		],
		plugins: [
			resolve(),
			commonjs(),
			babelPlugin,
		],
	},
	{
		// minified
		input: 'src/index.js',
		output: {
			...output,
			file: pkg.unpkg,
			format: 'umd',
			name: 'naja',
		},
		external: Object.keys(pkg.peerDependencies || {}),
		plugins: [
			resolve(),
			commonjs(),
			babelPlugin,
			terser(),
		],
	},
	{
		// non-minified
		input: 'src/index.js',
		output: {
			...output,
			file: pkg.main,
			format: 'umd',
			name: 'naja',
		},
		external: Object.keys(pkg.peerDependencies || {}),
		plugins: [
			resolve(),
			commonjs(),
			babelPlugin,
		],
	},
];
