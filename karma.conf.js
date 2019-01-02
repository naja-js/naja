var babel = require('rollup-plugin-babel');
var commonjs = require('rollup-plugin-commonjs');
var resolve = require('rollup-plugin-node-resolve');

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
        babel({
          exclude: 'node_modules/**',
          runtimeHelpers: true,
        }),
        resolve(),
        commonjs({
          namedExports: {
            'node_modules/chai/index.js': ['assert'],
          },
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
      reports: ['text-summary', 'html', 'lcovonly'],
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: false,

    browsers: ['Chrome', 'Firefox'],
    concurrency: Infinity,
  });
};
