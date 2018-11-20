var babel = require('rollup-plugin-babel');
var commonjs = require('rollup-plugin-commonjs');
var istanbul = require('rollup-plugin-istanbul');
var resolve = require('rollup-plugin-node-resolve');

module.exports = (config) => {
  if ( ! process.env.SAUCE_USERNAME || ! process.env.SAUCE_ACCESS_KEY) {
    console.error('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.');
    process.exit(1);
  }

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
        commonjs(),
      ],
      format: 'iife',
      sourceMap: 'inline',
    },

    reporters: ['dots', 'saucelabs', 'coverage-istanbul'],
    coverageIstanbulReporter: {
      reports: ['text-summary', 'lcovonly'],
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,

    sauceLabs: {
      testName: 'Naja.js',
      build: process.env.TRAVIS_BUILD_NUMBER
    },

    customLaunchers: {
      'chrome': {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 10',
        version: 'latest'
      }
    },
    browsers: ['chrome'],
    concurrency: 5,
  });
};
