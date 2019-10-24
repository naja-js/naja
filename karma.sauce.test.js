var path = require('path');


module.exports = function(config) {
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
    'msie10': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8',
      version: '10.0'
    },
    'msie11': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 10',
      version: '11.103'
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

    'android51': {
      base: 'SauceLabs',
      browserName: 'Browser',
      platformName: 'Android',
      platformVersion: '5.1',
      deviceName: 'Android Emulator'
    },
    'android9': {
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
      'tests/index.js': ['webpack']
    },
    webpack: {
      module: {
        rules: [
          {
            test: /\.js$/,
            use: {
              loader: 'babel-loader',
              options: {
                sourceMap: false
              }
            },
            exclude: /node_modules/
          }
        ],
      },
      devtool: ''
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
    concurrency: 5
  })
};
