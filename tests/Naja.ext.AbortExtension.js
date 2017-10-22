import mockNaja from './setup/mockNaja';
import fakeXhr from './setup/fakeXhr';
import {assert} from 'chai';

import AbortExtension from '../src/extensions/AbortExtension';


describe('AbortExtension', function () {
	fakeXhr();

	const createKeyboardEvent = () => {
		if (typeof(KeyboardEvent) === 'function') {
			return new KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Escape',
				keyCode: 27,
			});

		} else {
			const event = document.createEvent('KeyboardEvent');
			event.initKeyboardEvent('keydown', true, true, document.defaultView, 'Escape', 27, '', '', false, '');
			return event;
		}
	};

	it('aborts request on Esc', function () {
		const naja = mockNaja();
		const abortExtension = new AbortExtension(naja);
		abortExtension.initialize();

		naja.makeRequest('GET', '/AbortExtension/abortable');
		const evt = createKeyboardEvent();

		// some browsers do not initialize event's keyCode
		if (evt.key === 'Escape' || evt.keyCode === 27) {
			document.dispatchEvent(evt);
			assert.isTrue(this.requests.pop().aborted);
		}
	});

	it('does not abort non-abortable request', function (done) {
		const naja = mockNaja();
		const abortExtension = new AbortExtension(naja);
		abortExtension.initialize();

		naja.makeRequest('GET', '/AbortExtension/nonAbortable', null, {abort: false}).then(() => {
			done();
		});

		const evt = createKeyboardEvent();

		// some browsers do not initialize event's keyCode
		if (evt.key === 'Escape' || evt.keyCode === 27) {
			document.dispatchEvent(evt);
			this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({answer: 42}));

		} else {
			done();
		}
	});
});
