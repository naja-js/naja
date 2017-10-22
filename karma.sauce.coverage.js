var path = require('path');


module.exports = function(config) {
  if ( ! process.env.SAUCE_USERNAME || ! process.env.SAUCE_ACCESS_KEY) {
    console.error('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.');
    process.exit(1);
  }

  var customLaunchers = {
    'chrome': {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10',
      version: 'latest'
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
      'tests/index.js': ['webpack', 'sourcemap']
    },
    webpack: {
      module: {
        rules: [
          {
            test: /\.js$/,
            use: {
              loader: 'babel-loader'
            },
            exclude: /node_modules/
          },
          {
            test: /\.js$/,
            use: {
              loader: 'istanbul-instrumenter-loader',
              options: {
                esModules: true
              }
            },
            include: path.resolve('src'),
            enforce: 'post'
          }
        ],
      },
      devtool: 'inline-source-map'
    },

    reporters: ['dots', 'saucelabs', 'coverage-istanbul'],
    coverageIstanbulReporter: {
      reports: ['text-summary', 'lcovonly'],
      fixWebpackSourcePaths: true
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

    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    concurrency: 5
  })
};
