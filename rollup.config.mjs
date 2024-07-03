import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import path from 'path';

import pkg from './package.json' assert { type: 'json' };

const output = {
	banner: `/*\n * Naja.js\n * ${pkg.version}\n *\n * by Jiří Pudil <https://jiripudil.cz>\n */`,
	sourcemap: true,
};

export default [
	{
		// ESM build for modern tools like webpack
		input: 'src/index.esm.ts',
		output: {
			...output,
			file: pkg.exports['.'].import,
			format: 'esm',
		},
		external: [
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.peerDependencies || {}),
		],
		plugins: [
			resolve(),
			commonjs(),
			typescript(),
		],
	},
	{
		// type declaration files for ESM build
		input: 'src/index.esm.ts',
		output: {
			...output,
			dir: path.dirname(pkg.exports['.'].types),
			format: 'esm',
		},
		external: [
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.peerDependencies || {}),
		],
		plugins: [
			typescript({
				declaration: true,
				declarationDir: path.dirname(pkg.exports['.'].types),
				emitDeclarationOnly: true,
			}),
		],
	},
	{
		// minified
		input: 'src/index.ts',
		output: {
			...output,
			file: pkg.exports['.'].default.replace(/\.js$/, '.min.js'),
			format: 'umd',
			name: 'naja',
		},
		external: Object.keys(pkg.peerDependencies || {}),
		plugins: [
			resolve(),
			commonjs(),
			typescript(),
			terser(),
		],
	},
	{
		// non-minified
		input: 'src/index.ts',
		output: {
			...output,
			file: pkg.exports['.'].default,
			format: 'umd',
			name: 'naja',
		},
		external: Object.keys(pkg.peerDependencies || {}),
		plugins: [
			resolve(),
			commonjs(),
			typescript(),
		],
	},
];
