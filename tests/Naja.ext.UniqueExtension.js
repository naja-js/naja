import mockNaja from './setup/mockNaja';
import fakeFetch from './setup/fakeFetch';
import {assert} from 'chai';

import UniqueExtension from '../src/extensions/UniqueExtension';


describe('UniqueExtension', function () {
	fakeFetch();

	it('aborts previous request', function () {
		const naja = mockNaja();
		new UniqueExtension(naja);

		this.fetchMock.when((request) => /first/.test(request.url))
			.handler = (request) => new Promise((resolve, reject) => {
				const abortError = new Error('AbortError');
				abortError.name = 'AbortError';
				request.signal.onabort = () => reject(abortError);
			});

		this.fetchMock.when((request) => /second/.test(request.url))
			.respond(200, {}, {});

		const firstRequest = naja.makeRequest('GET', '/UniqueExtension/enabled/first');
		naja.makeRequest('GET', '/UniqueExtension/enabled/second');

		return firstRequest.catch((error) => {
			assert.equal(error.name, 'AbortError');
		});
	});

	it('does not abort request if disabled', function () {
		const naja = mockNaja();
		new UniqueExtension(naja);

		this.fetchMock.when()
			.handler = (request) => new Promise((resolve, reject) => {
				const abortError = new Error('AbortError');
				abortError.name = 'AbortError';
				request.signal.onabort = () => reject(abortError);

				const body = new Blob(['{}']);
				const response = new Response(body, {status: 200, headers: {'Content-Type': 'application/json'}});
				setTimeout(() => resolve(response), 1000);
			});

		const firstRequest = naja.makeRequest('GET', '/UniqueExtension/disabled/first');
		const secondRequest = naja.makeRequest('GET', '/UniqueExtension/disabled/second', null, {unique: false});

		return Promise.all([firstRequest, secondRequest]);
	});
});
