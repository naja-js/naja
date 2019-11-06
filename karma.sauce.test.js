var babel = require('rollup-plugin-babel');
var commonjs = require('rollup-plugin-commonjs');
var resolve = require('rollup-plugin-node-resolve');

module.exports = (config) => {
  if ( ! process.env.SAUCE_USERNAME || ! process.env.SAUCE_ACCESS_KEY) {
    console.error('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.');
    process.exit(1);
  }

  var customLaunchers = {
    'chrome-1': {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'macOS 10.14',
      version: 'latest-1'
    },
    'firefox': {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Windows 10',
      version: 'latest'
    },
    'firefox-1': {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'macOS 10.14',
      version: 'latest-1'
    },

    'edge': {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10',
      version: 'latest'
    },
    'edge-1': {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10',
      version: 'latest-1'
    },

    'safari12': {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'macOS 10.14',
      version: '12.0'
    },
    'safari13': {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'macOS 10.13',
      version: '13.0'
    },

    'ios11': {
      base: 'SauceLabs',
      browserName: 'Safari',
      platformName: 'iOS',
      platformVersion: '11.3',
      deviceName: 'iPhone X Simulator',
      idleTimeout: 120
    },
    'ios12': {
      base: 'SauceLabs',
      browserName: 'Safari',
      platformName: 'iOS',
      platformVersion: '12.2',
      deviceName: 'iPhone XR Simulator',
      idleTimeout: 120
    },

    'android6': {
      base: 'SauceLabs',
      browserName: 'Chrome',
      platformName: 'Android',
      platformVersion: '6.0',
      deviceName: 'Android GoogleAPI Emulator'
    },
    'android8': {
      base: 'SauceLabs',
      browserName: 'Chrome',
      platformName: 'Android',
      platformVersion: '8.0',
      deviceName: 'Android GoogleAPI Emulator'
    }
  };

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
          exclude: /node_modules\/(?!event-target-shim|sinon)/,
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

    reporters: ['dots', 'saucelabs'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,

    sauceLabs: {
      testName: 'Naja.js',
      build: process.env.TRAVIS_BUILD_NUMBER
    },

    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    browserDisconnectTolerance: 2,
    browserNoActivityTimeout: 120000,
    captureTimeout: 120000, // try to give ios simulators some time to boot up
    concurrency: 5,
  });
};
