const {babel} = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const {nodeResolve} = require('@rollup/plugin-node-resolve');

module.exports = (config) => {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      'https://unpkg.com/nette-forms/src/assets/netteForms.js',
      'tests/index.js'
    ],

    preprocessors: {
      'tests/index.js': ['rollup']
    },
    rollupPreprocessor: {
      plugins: [
        nodeResolve(),
        commonjs(),
        babel({
          exclude: /node_modules\/(?!event-target-shim)/,
          babelHelpers: 'runtime',
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
      reports: ['text-summary', 'lcovonly'],
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: !process.env.CI,
    singleRun: !!process.env.CI,

    plugins: [
      'karma-*',
      require('./karma.playwright'),
    ],
    browsers: process.env.CI
      ? ['Chromium', 'Firefox', 'WebKit']
      : ['Chromium'],
    concurrency: Infinity,
  });
};
