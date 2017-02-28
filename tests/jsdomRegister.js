import jsdomRegister from 'jsdom-global';
import sinon from 'sinon';


export default () => {
	beforeEach(function (done) {
		const url = 'http://example.com/';
		this.jsdomCleanup = jsdomRegister(undefined, {url});
		Object.defineProperty(window.location, 'href', {
			writable: true,
			value: url,
		});

		this.requests = [];
		this.xhr = sinon.useFakeXMLHttpRequest();
		this.xhr.onCreate = this.requests.push.bind(this.requests);
		global.window.XMLHttpRequest = window.XMLHttpRequest = this.xhr;

		done();
	});

	afterEach(function (done) {
		this.jsdomCleanup();
		this.xhr.restore();
		done();
	});
};
