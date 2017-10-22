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
      platform: 'macOS 10.12',
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
      platform: 'macOS 10.12',
      version: 'latest-1'
    },

    'edge': {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10',
      version: 'latest'
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

    'safari10': {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11',
      version: '10.0'
    },
    'safari11': {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'macOS 10.12',
      version: '11.0'
    },

    'ios10': {
      base: 'SauceLabs',
      browserName: 'Safari',
      platformName: 'iOS',
      platformVersion: '10.3',
      deviceName: 'iPhone 7 Simulator'
    },
    'ios11': {
      base: 'SauceLabs',
      browserName: 'Safari',
      platformName: 'iOS',
      platformVersion: '11.0',
      deviceName: 'iPhone 7 Simulator'
    },

    'android51': {
      base: 'SauceLabs',
      browserName: 'Browser',
      platformName: 'Android',
      platformVersion: '5.1',
      deviceName: 'Android Emulator'
    },
    'android71': {
      base: 'SauceLabs',
      browserName: 'Chrome',
      platformName: 'Android',
      platformVersion: '7.1',
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
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 120000, // try to give simulators some time to boot up
    concurrency: 5
  })
};
