// require all source files to provide accurate coverage
const sourceContext = require.context('../src', true, /\.js$/);
sourceContext.keys().forEach(sourceContext);

// require all tests
const testsContext = require.context('.', false, /Naja\..+\.js$/);
testsContext.keys().forEach(testsContext);
