import jsdom from './jsdomRegister';
import {assert} from 'chai';


describe('AbortExtension', function () {
	jsdom();

	beforeEach(function () {
		this.mockNaja = require('./setup/mockNaja').default;
		this.AbortExtension = require('../src/extensions/AbortExtension').default;
	});

	it('aborts request on Esc', function () {
		const naja = this.mockNaja();
		const abortExtension = new this.AbortExtension(naja);
		abortExtension.initialize();

		naja.makeRequest('GET', '/foo').then(() => {
			assert.equal(this.requests[0].readyState, XMLHttpRequest.UNSENT);
			done();
		});

		document.body.dispatchEvent(new KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
			ctrlKey: false,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			key: 'Escape',
		}));

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

	it('does not abort non-abortable request', function (done) {
		const naja = this.mockNaja();
		const abortExtension = new this.AbortExtension(naja);
		abortExtension.initialize();

		naja.makeRequest('GET', '/foo', null, {abort: false}).then(() => {
			done();
		});

		document.dispatchEvent(new KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
			ctrlKey: false,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			key: 'Escape',
		}));

		this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({answer: 42}));
	});
});
