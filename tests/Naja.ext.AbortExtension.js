import mockNaja from './setup/mockNaja';
import fakeFetch from './setup/fakeFetch';
import {assert} from 'chai';

import AbortExtension from '../src/extensions/AbortExtension';


describe('AbortExtension', function () {
	fakeFetch();

	const createKeyboardEvent = () => {
		return new KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
			key: 'Escape',
			keyCode: 27,
		});
	};

	it('aborts request on Esc', function () {
		const naja = mockNaja();
		const abortExtension = new AbortExtension(naja);
		abortExtension.initialize();

		this.fetchMock.when()
			.handler = (request) => new Promise((resolve, reject) => {
				const abortError = new Error('AbortError');
				abortError.name = 'AbortError';
				request.signal.onabort = () => reject(abortError);
			});

		const request = naja.makeRequest('GET', '/AbortExtension/abortable');

		// some browsers do not initialize event's keyCode
		const evt = createKeyboardEvent();
		if (evt.key === 'Escape' || evt.keyCode === 27) {
			document.dispatchEvent(evt);
		} else {
			this.skip();
		}

		return request.catch((error) => {
			assert.equal(error.name, 'AbortError');
		});
	});

	it('does not abort non-abortable request', function () {
		const naja = mockNaja();
		const abortExtension = new AbortExtension(naja);
		abortExtension.initialize();

		this.fetchMock.when()
			.handler = (request) => new Promise((resolve, reject) => {
				const abortError = new Error('AbortError');
				abortError.name = 'AbortError';
				request.signal.onabort = () => reject(abortError);

				const body = new Blob(['{}']);
				const response = new Response(body, {status: 200, headers: {'Content-Type': 'application/json'}});
				setTimeout(() => resolve(response), 1000);
			});

		const request = naja.makeRequest('GET', '/AbortExtension/nonAbortable', null, {abort: false});

		// some browsers do not initialize event's keyCode
		const evt = createKeyboardEvent();
		if (evt.key === 'Escape' || evt.keyCode === 27) {
			document.dispatchEvent(evt);
		} else {
			this.skip();
		}

		return request;
	});
});
