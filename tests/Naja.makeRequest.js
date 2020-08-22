import {mockNaja} from './setup/mockNaja';
import {fakeFetch} from './setup/fakeFetch';
import {cleanPopstateListener} from './setup/cleanPopstateListener';
import {assert} from 'chai';
import sinon from 'sinon';


describe('makeRequest()', function () {
	fakeFetch();

	it('should call success event if the request succeeds', function () {
		const naja = mockNaja();
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);
		sinon.stub(naja.historyHandler.historyAdapter);

		const beforeCallback = sinon.spy();
		const startCallback = sinon.spy();
		const successCallback = sinon.spy();
		const errorCallback = sinon.spy();
		const completeCallback = sinon.spy();

		naja.addEventListener('before', beforeCallback);
		naja.addEventListener('start', startCallback);
		naja.addEventListener('success', successCallback);
		naja.addEventListener('error', errorCallback);
		naja.addEventListener('complete', completeCallback);

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {answer: 42});
		const request = naja.makeRequest('GET', '/makeRequest/success/events');

		return request.then(() => {
			assert.isTrue(beforeCallback.called);
			assert.isTrue(beforeCallback.calledBefore(startCallback));
			assert.isTrue(beforeCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('method', sinon.match.string))
					.and(sinon.match.has('url', sinon.match.string))
					.and(sinon.match.has('data'))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isTrue(startCallback.called);
			assert.isTrue(startCallback.calledBefore(successCallback));
			assert.isTrue(startCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('promise', sinon.match.instanceOf(Promise)))
					.and(sinon.match.has('abortController', sinon.match.instanceOf(AbortController)))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isTrue(successCallback.called);
			assert.isTrue(successCallback.calledBefore(completeCallback));
			assert.isTrue(successCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('response', sinon.match.instanceOf(Response)))
					.and(sinon.match.has('payload'))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isTrue(completeCallback.called);
			assert.isTrue(completeCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('response', sinon.match.instanceOf(Response)))
					.and(sinon.match.has('payload'))
					.and(sinon.match.has('error', undefined))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isFalse(errorCallback.called);
		});
	});

	it('should resolve with the response if the request succeeds', function () {
		const naja = mockNaja();
		naja.initialize();

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {answer: 42});
		const request = naja.makeRequest('GET', '/makeRequest/success/resolve');

		return request.then((response) => {
			assert.deepEqual(response, {answer: 42});
		});
	});

	it('should call error event if the response is non-ok', function () {
		const naja = mockNaja();
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const beforeCallback = sinon.spy();
		const startCallback = sinon.spy();
		const successCallback = sinon.spy();
		const errorCallback = sinon.spy();
		const completeCallback = sinon.spy();

		naja.addEventListener('before', beforeCallback);
		naja.addEventListener('start', startCallback);
		naja.addEventListener('success', successCallback);
		naja.addEventListener('error', errorCallback);
		naja.addEventListener('complete', completeCallback);

		this.fetchMock.respond(500, {'Content-Type': 'application/json'}, {});
		const request = naja.makeRequest('GET', '/makeRequest/error/events');

		return request.catch(() => {
			assert.isTrue(beforeCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('method', sinon.match.string))
					.and(sinon.match.has('url', sinon.match.string))
					.and(sinon.match.has('data'))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isTrue(startCallback.called);
			assert.isTrue(startCallback.calledBefore(successCallback));
			assert.isTrue(startCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('promise', sinon.match.instanceOf(Promise)))
					.and(sinon.match.has('abortController', sinon.match.instanceOf(AbortController)))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isTrue(errorCallback.called);
			assert.isTrue(errorCallback.calledBefore(completeCallback));
			assert.isTrue(errorCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('response', sinon.match.instanceOf(Response)))
					.and(sinon.match.has('error', sinon.match.truthy))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isTrue(completeCallback.called);
			assert.isTrue(completeCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('response', sinon.match.instanceOf(Response)))
					.and(sinon.match.has('payload', undefined))
					.and(sinon.match.has('error', sinon.match.truthy))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isFalse(successCallback.called);
		});
	});

	it('should reject with the error if the response is non-ok', function () {
		const naja = mockNaja();
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);
		sinon.stub(naja.historyHandler.historyAdapter);

		this.fetchMock.respond(500, {'Content-Type': 'application/json'}, {});
		const request = naja.makeRequest('GET', '/makeRequest/error/reject');

		return request.catch((error) => {
			assert.isOk(error); // isOk = truthy
			assert.equal(error.name, 'HttpError');
			assert.instanceOf(error.response, Response);
		});
	});

	it('should call error event if the request fails', function () {
		const naja = mockNaja();
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const beforeCallback = sinon.spy();
		const startCallback = sinon.spy();
		const successCallback = sinon.spy();
		const errorCallback = sinon.spy();
		const completeCallback = sinon.spy();

		naja.addEventListener('before', beforeCallback);
		naja.addEventListener('start', startCallback);
		naja.addEventListener('success', successCallback);
		naja.addEventListener('error', errorCallback);
		naja.addEventListener('complete', completeCallback);

		const error = new Error('NetworkError');
		this.fetchMock.reject(error);

		const request = naja.makeRequest('GET', '/makeRequest/error/events');

		return request.catch(() => {
			assert.isTrue(beforeCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('method', sinon.match.string))
					.and(sinon.match.has('url', sinon.match.string))
					.and(sinon.match.has('data'))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isTrue(startCallback.called);
			assert.isTrue(startCallback.calledBefore(successCallback));
			assert.isTrue(startCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('promise', sinon.match.instanceOf(Promise)))
					.and(sinon.match.has('abortController', sinon.match.instanceOf(AbortController)))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isTrue(errorCallback.called);
			assert.isTrue(errorCallback.calledBefore(completeCallback));
			assert.isTrue(errorCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('response', undefined))
					.and(sinon.match.has('error', error))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isTrue(completeCallback.called);
			assert.isTrue(completeCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('response', undefined))
					.and(sinon.match.has('payload', undefined))
					.and(sinon.match.has('error', error))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isFalse(successCallback.called);
		});
	});

	it('should reject with the error if the request fails', function () {
		const naja = mockNaja();
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);
		sinon.stub(naja.historyHandler.historyAdapter);

		const error = new Error('NetworkError');
		this.fetchMock.reject(error);

		const request = naja.makeRequest('GET', '/makeRequest/error/reject');

		return request.catch((actual) => {
			assert.strictEqual(actual, error);
		});
	});

	it('should call abort event if the request is aborted', function () {
		const naja = mockNaja();
		naja.initialize();

		const abortCallback = sinon.spy();
		const successCallback = sinon.spy();
		const errorCallback = sinon.spy();
		const completeCallback = sinon.spy();
		naja.addEventListener('abort', abortCallback);
		naja.addEventListener('success', successCallback);
		naja.addEventListener('error', errorCallback);
		naja.addEventListener('complete', completeCallback);

		this.fetchMock.abort();
		const request = naja.makeRequest('GET', '/makeRequest/abort');

		return request.then((payload) => {
			assert.deepEqual(payload, {});

			assert.isTrue(abortCallback.called);
			assert.isTrue(abortCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('error', sinon.match.truthy))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			assert.isFalse(successCallback.called);
			assert.isFalse(errorCallback.called);

			assert.isTrue(completeCallback.called);
			assert.isTrue(completeCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('request', sinon.match.instanceOf(Request)))
					.and(sinon.match.has('response', undefined))
					.and(sinon.match.has('payload', undefined))
					.and(sinon.match.has('error', sinon.match.truthy))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));
		});
	});

	it('should not send the request if before event is aborted', function () {
		const naja = mockNaja();
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const completeCallback = sinon.spy();
		naja.addEventListener('complete', completeCallback);
		naja.addEventListener('before', (evt) => evt.preventDefault());

		const request = naja.makeRequest('GET', '/makeRequest/abortedBefore');
		return request.then((payload) => {
			assert.deepEqual(payload, {});
			assert.isFalse(completeCallback.called);
		});
	});

	it('should submit GET FormData in URL', function () {
		const naja = mockNaja();
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const formData = new FormData();
		formData.append('foo', 'bar');
		formData.append('baz', '42');

		this.fetchMock.when((request) => request.url === 'http://localhost:9876/makeRequest/getFormData?foo=bar&baz=42')
			.respond(200, {'Content-Type': 'application/json'}, {answer: 42});

		const request = naja.makeRequest('GET', '/makeRequest/getFormData', formData);
		return request.then((payload) => {
			assert.deepEqual(payload, {answer: 42});
		})
	});

	describe('options', function () {
		it('should be set to default options', function () {
			const naja = mockNaja();
			naja.initialize();
			cleanPopstateListener(naja.historyHandler);

			const beforeCallback = sinon.spy();
			naja.addEventListener('before', beforeCallback);

			this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {answer: 42});
			const request = naja.makeRequest('GET', '/makeRequest/options/defaultOptions');

			return request.then(() => {
				assert.isTrue(beforeCallback.called);
				assert.isTrue(beforeCallback.calledWith(
					sinon.match((event) => event.constructor.name === 'CustomEvent')
					.and(sinon.match.has('detail', sinon.match.object
						.and(sinon.match.has('options', sinon.match.object))
					))
				));
			});
		});

		it('should be overridden by ad-hoc options', function () {
			const naja = mockNaja();
			naja.initialize();
			cleanPopstateListener(naja.historyHandler);

			const beforeCallback = sinon.spy();
			naja.addEventListener('before', beforeCallback);

			naja.defaultOptions = {
				'customOption': 42,
			};

			this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {answer: 42});
			const request = naja.makeRequest('GET', '/makeRequest/options/defaultOptions', null, {'customOption': 24, 'anotherOption': 42});

			return request.then(() => {
				assert.isTrue(beforeCallback.called);
				assert.isTrue(beforeCallback.calledWith(
					sinon.match((event) => event.constructor.name === 'CustomEvent')
					.and(sinon.match.has('detail', sinon.match.object
						.and(sinon.match.has('options', sinon.match.object
							.and(sinon.match.has('customOption', 24))
						))
					))
				));
			});
		});

		it('should pass options to fetch', function () {
			const naja = mockNaja();
			naja.initialize();
			cleanPopstateListener(naja.historyHandler);

			this.fetchMock.when((request) => request.credentials === 'include')
				.respond(200, {'Content-Type': 'application/json'}, {answer: 42});

			return naja.makeRequest('GET', '/makeRequest/options/defaultOptions', null, {fetch: {credentials: 'include'}});
		});
	});
});
