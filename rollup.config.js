const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const {terser} = require('rollup-plugin-terser');

const pkg = require('./package.json');
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
	runtimeHelpers: true,
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
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.peerDependencies || {}),
		],
		plugins: [
			babelPlugin,
			resolve(),
			commonjs(),
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
			babelPlugin,
			resolve(),
			commonjs(),
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
			babelPlugin,
			resolve(),
			commonjs(),
		],
	},
];
