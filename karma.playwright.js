const {chromium, firefox, webkit} = require('playwright');

function PlaywrightBrowser(
	browserType,
	baseLauncherDecorator,
	captureTimeoutLauncherDecorator,
	retryLauncherDecorator,
) {
	baseLauncherDecorator(this);
	captureTimeoutLauncherDecorator(this);
	retryLauncherDecorator(this);

	let browser;

	this.name = browserType.name();

	this.on('start', async (url) => {
		browser = await browserType.launch({headless: true});
		const page = await browser.newPage();
		await page.goto(url);
	});

	this.on('done', () => browser && browser.close());
}

const ChromiumPlaywrightBrowser = function() {
	PlaywrightBrowser.apply(this, [chromium, ...arguments]);
};
ChromiumPlaywrightBrowser.$inject = ['baseLauncherDecorator', 'captureTimeoutLauncherDecorator', 'retryLauncherDecorator'];

const FirefoxPlaywrightBrowser = function() {
	PlaywrightBrowser.apply(this, [firefox, ...arguments]);
};
FirefoxPlaywrightBrowser.$inject = ['baseLauncherDecorator', 'captureTimeoutLauncherDecorator', 'retryLauncherDecorator'];

const WebKitPlaywrightBrowser = function() {
	PlaywrightBrowser.apply(this, [webkit, ...arguments]);
};
WebKitPlaywrightBrowser.$inject = ['baseLauncherDecorator', 'captureTimeoutLauncherDecorator', 'retryLauncherDecorator'];

module.exports = {
	'launcher:Chromium': ['type', ChromiumPlaywrightBrowser],
	'launcher:Firefox': ['type', FirefoxPlaywrightBrowser],
	'launcher:WebKit': ['type', WebKitPlaywrightBrowser],
};
