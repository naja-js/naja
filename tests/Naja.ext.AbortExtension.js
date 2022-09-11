import {mockNaja} from './setup/mockNaja';
import {fakeFetch} from './setup/fakeFetch';
import {assert} from 'chai';

import {AbortExtension} from '../src/extensions/AbortExtension';


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
		const abortExtension = new AbortExtension();
		abortExtension.initialize(naja);
		abortExtension.onInitialize();

		let aborted = false;

		this.fetchMock.when()
			.handler = (request) => new Promise((resolve, reject) => {
				const abortError = new Error('AbortError');
				abortError.name = 'AbortError';
				request.signal.addEventListener('abort', () => {
					aborted = true;
					reject(abortError);
				});
			});

		const request = naja.makeRequest('GET', '/AbortExtension/abortable');
		assert.equal(abortExtension.abortControllers.size, 1);

		const evt = createKeyboardEvent();
		document.dispatchEvent(evt);

		return request.then(() => {
			assert.isTrue(aborted);
			assert.equal(abortExtension.abortControllers.size, 0);
		});
	});

	it('does not abort non-abortable request', function () {
		this.timeout(4000);

		const naja = mockNaja();
		const abortExtension = new AbortExtension();
		abortExtension.initialize(naja);
		abortExtension.onInitialize();

		let aborted = false;

		this.fetchMock.when()
			.handler = (request) => new Promise((resolve, reject) => {
				const abortError = new Error('AbortError');
				abortError.name = 'AbortError';
				request.signal.addEventListener('abort', () => {
					aborted = true;
					reject(abortError);
				});

				const body = new Blob(['{}']);
				const response = new Response(body, {status: 200, headers: {'Content-Type': 'application/json'}});
				setTimeout(() => resolve(response), 1000);
			});

		const request = naja.makeRequest('GET', '/AbortExtension/nonAbortable', null, {abort: false});

		const evt = createKeyboardEvent();
		document.dispatchEvent(evt);

		return request.then(() => {
			assert.isFalse(aborted);
		});
	});
});
