const {babel} = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const {nodeResolve} = require('@rollup/plugin-node-resolve');

module.exports = (config) => {
	config.set({
		basePath: '',
		frameworks: ['mocha'],
		files: [
			'https://unpkg.com/nette-forms/src/assets/netteForms.js',
			'tests/index.js',
		],

		preprocessors: {
			'tests/index.js': ['rollup'],
		},
		rollupPreprocessor: {
			plugins: [
				nodeResolve({
					extensions: ['.js', '.ts'],
				}),
				commonjs(),
				babel({
					exclude: /node_modules/,
					babelHelpers: 'runtime',
					extensions: ['.js', '.ts'],
					presets: [
						['@babel/preset-typescript', {
							allowDeclareFields: true,
						}],
						'@babel/preset-env',
					],
					plugins: [
						'@babel/plugin-transform-runtime',
						['babel-plugin-istanbul', {
							include: [
								'src/**/*.ts',
							],
							exclude: [
								'node_modules/**',
								'tests/**/*.js',
							],
						}],
					],
				}),
			],
			output: {
				name: 'naja',
				format: 'iife',
				sourcemap: 'inline',
			},
		},

		reporters: ['dots', 'coverage-istanbul'],
		coverageIstanbulReporter: {
			reports: ['text-summary', 'lcovonly', 'html'],
		},

		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: !process.env.CI,
		singleRun: !!process.env.CI,

		plugins: [
			'karma-*',
			'@onslip/karma-playwright-launcher',
		],
		browsers: process.env.CI
			? ['ChromiumHeadless', 'FirefoxHeadless', 'WebKitHeadless']
			: ['ChromiumHeadless'],
		concurrency: Infinity,
	});
};
