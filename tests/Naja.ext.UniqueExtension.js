import jsdom from './jsdomRegister';
import {assert} from 'chai';


describe('UniqueExtension', function () {
	jsdom();

	beforeEach(function (done) {
		this.Naja = require('../src/Naja').default;
		this.UniqueExtension = require('../src/extensions/UniqueExtension').default;
		done();
	});

	it('aborts previous request', function () {
		const naja = new this.Naja();
		new this.UniqueExtension(naja);

		naja.makeRequest('GET', '/foo');
		naja.makeRequest('GET', '/bar');

		let thrown = false;

		try {
			this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({answer: 42}));

		} catch (e) {
			// sinon's fake XHR throws error if readyState is not DONE
			if (e.message === "INVALID_STATE_ERR - " + XMLHttpRequest.UNSENT) {
				thrown = true;
			}
		}

		assert.isTrue(thrown);
	});

	it('does not abort request if disabled', function (done) {
		const naja = new this.Naja();
		new this.UniqueExtension(naja);

		naja.makeRequest('GET', '/foo').then(() => {
			done();
		});

		naja.makeRequest('GET', '/bar', null, {unique: false});

		this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({answer: 42}));
	});
});
