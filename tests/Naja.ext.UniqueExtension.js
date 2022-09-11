import {mockNaja} from './setup/mockNaja';
import {fakeFetch} from './setup/fakeFetch';
import {assert} from 'chai';

import {UniqueExtension} from '../src/extensions/UniqueExtension';


describe('UniqueExtension', function () {
	fakeFetch();

	it('aborts previous request', function () {
		const naja = mockNaja();
		const uniqueExtension = new UniqueExtension();
		uniqueExtension.initialize(naja);

		let aborted = false;

		this.fetchMock.when((request) => /first/.test(request.url))
			.handler = (request) => new Promise((resolve, reject) => {
				const abortError = new Error('AbortError');
				abortError.name = 'AbortError';
				request.signal.addEventListener('abort', () => {
					aborted = true;
					reject(abortError);
				});
			});

		this.fetchMock.when((request) => /second/.test(request.url))
			.respond(200, {}, {});

		const firstRequest = naja.makeRequest('GET', '/UniqueExtension/enabled/first');
		const secondRequest = naja.makeRequest('GET', '/UniqueExtension/enabled/second');

		return Promise.all([firstRequest, secondRequest]).then(() => {
			assert.isTrue(aborted);
		});
	});

	it('aborts previous request with the same key', function () {
		const naja = mockNaja();
		const uniqueExtension = new UniqueExtension();
		uniqueExtension.initialize(naja);

		let aborted = false;

		this.fetchMock.when((request) => /first/.test(request.url))
			.handler = (request) => new Promise((resolve, reject) => {
				const abortError = new Error('AbortError');
				abortError.name = 'AbortError';
				request.signal.addEventListener('abort', () => {
					aborted = true;
					reject(abortError);
				});
			});

		this.fetchMock.when((request) => /(second|third)/.test(request.url))
			.respond(200, {}, {});

		const firstRequest = naja.makeRequest('GET', '/UniqueExtension/enabled/first', null, {unique: 'differentKey'});
		const secondRequest = naja.makeRequest('GET', '/UniqueExtension/enabled/second');
		const thirdRequest = naja.makeRequest('GET', '/UniqueExtension/enabled/third', null, {unique: 'differentKey'});

		return Promise.all([firstRequest, secondRequest, thirdRequest]).then(() => {
			assert.isTrue(aborted);
		});
	});

	it('does not abort request if disabled', function () {
		const naja = mockNaja();
		const uniqueExtension = new UniqueExtension();
		uniqueExtension.initialize(naja);

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

		const firstRequest = naja.makeRequest('GET', '/UniqueExtension/disabled/first');
		const secondRequest = naja.makeRequest('GET', '/UniqueExtension/disabled/second', null, {unique: false});

		return Promise.all([firstRequest, secondRequest]).then(() => {
			assert.isFalse(aborted);
		});
	});

	it('does not abort request with different key', function () {
		const naja = mockNaja();
		const uniqueExtension = new UniqueExtension();
		uniqueExtension.initialize(naja);

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

		const firstRequest = naja.makeRequest('GET', '/UniqueExtension/disabled/first');
		const secondRequest = naja.makeRequest('GET', '/UniqueExtension/disabled/second', null, {unique: 'differentKey'});

		return Promise.all([firstRequest, secondRequest]).then(() => {
			assert.isFalse(aborted);
		});
	});
});
