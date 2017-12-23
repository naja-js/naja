import mockNaja from './setup/mockNaja';
import fakeXhr from './setup/fakeXhr';
import cleanPopstateListener from "./setup/cleanPopstateListener";
import {assert} from 'chai';
import sinon from 'sinon';


describe('makeRequest()', function () {
	fakeXhr();

	it('should call success event if the request succeeds', function (done) {
		const naja = mockNaja();
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);
		sinon.stub(naja.historyHandler.historyAdapter);

		const loadCallback = sinon.spy();
		const beforeCallback = sinon.spy();
		const startCallback = sinon.spy();
		const successCallback = sinon.spy();
		const errorCallback = sinon.spy();
		const completeCallback = sinon.spy();

		naja.addEventListener('load', loadCallback);
		naja.addEventListener('before', beforeCallback);
		naja.addEventListener('start', startCallback);
		naja.addEventListener('success', successCallback);
		naja.addEventListener('error', errorCallback);
		naja.addEventListener('complete', completeCallback);

		const request = naja.makeRequest('GET', '/makeRequest/success/events');
		assert.equal(1, this.requests.length);

		request.then(() => {
			assert.isTrue(beforeCallback.called);
			assert.isTrue(beforeCallback.calledBefore(startCallback));
			assert.isTrue(beforeCallback.calledWith(sinon.match.object
				.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
				.and(sinon.match.has('method', sinon.match.string))
				.and(sinon.match.has('url', sinon.match.string))
				.and(sinon.match.has('data'))
				.and(sinon.match.has('options', sinon.match.object))
			));

			assert.isTrue(startCallback.called);
			assert.isTrue(startCallback.calledBefore(successCallback));
			assert.isTrue(startCallback.calledWith(sinon.match.object
				.and(sinon.match.has('request'))
				.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
			));

			assert.isTrue(successCallback.called);
			assert.isTrue(successCallback.calledBefore(completeCallback));
			assert.isTrue(successCallback.calledWith(sinon.match.object
				.and(sinon.match.has('response'))
				.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
				.and(sinon.match.has('options', sinon.match.object))
			));

			assert.isTrue(completeCallback.called);
			assert.isTrue(completeCallback.calledBefore(loadCallback));
			assert.isTrue(completeCallback.calledWith(sinon.match.object
				.and(sinon.match.has('error', null))
				.and(sinon.match.has('response'))
				.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
				.and(sinon.match.has('options', sinon.match.object))
			));

			assert.isTrue(loadCallback.called);
			assert.isFalse(errorCallback.called);
			done();
		});

		this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({answer: 42}));
	});

	it('should resolve with the response if the request succeeds', function (done) {
		const naja = mockNaja();
		naja.initialize();

		const request = naja.makeRequest('GET', '/makeRequest/success/resolve');
		assert.equal(1, this.requests.length);

		request.then((response) => {
			assert.deepEqual(response, {answer: 42});
			done();
		});

		this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({answer: 42}));
	});

	it('should call error event if the request fails', function (done) {
		const naja = mockNaja();
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const loadCallback = sinon.spy();
		const beforeCallback = sinon.spy();
		const startCallback = sinon.spy();
		const successCallback = sinon.spy();
		const errorCallback = sinon.spy();
		const completeCallback = sinon.spy();

		naja.addEventListener('load', loadCallback);
		naja.addEventListener('before', beforeCallback);
		naja.addEventListener('start', startCallback);
		naja.addEventListener('success', successCallback);
		naja.addEventListener('error', errorCallback);
		naja.addEventListener('complete', completeCallback);

		const request = naja.makeRequest('GET', '/makeRequest/error/events');
		assert.equal(1, this.requests.length);

		request.catch(() => {
			assert.isTrue(beforeCallback.calledWith(sinon.match.object
				.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
				.and(sinon.match.has('method', sinon.match.string))
				.and(sinon.match.has('url', sinon.match.string))
				.and(sinon.match.has('data'))
				.and(sinon.match.has('options', sinon.match.object))
			));

			assert.isTrue(startCallback.called);
			assert.isTrue(startCallback.calledBefore(successCallback));
			assert.isTrue(startCallback.calledWith(sinon.match.object
				.and(sinon.match.has('request'))
				.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
			));

			assert.isTrue(errorCallback.called);
			assert.isTrue(errorCallback.calledBefore(completeCallback));
			assert.isTrue(errorCallback.calledWith(sinon.match.object
				.and(sinon.match.has('error', sinon.match.truthy))
				.and(sinon.match.has('response'))
				.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
				.and(sinon.match.has('options', sinon.match.object))
			));

			assert.isTrue(completeCallback.called);
			assert.isTrue(completeCallback.calledBefore(loadCallback));
			assert.isTrue(completeCallback.calledWith(sinon.match.object
				.and(sinon.match.has('error', sinon.match.truthy))
				.and(sinon.match.has('response'))
				.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
				.and(sinon.match.has('options', sinon.match.object))
			));

			assert.isTrue(loadCallback.called);
			assert.isFalse(successCallback.called);
			done();
		});

		this.requests.pop().respond(500, {'Content-Type': 'application/json'}, JSON.stringify({error: 'Internal Server Error'}));
	});

	it('should reject with the error if the request fails', function (done) {
		const naja = mockNaja();
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);
		sinon.stub(naja.historyHandler.historyAdapter);

		const request = naja.makeRequest('GET', '/makeRequest/error/reject');
		assert.equal(1, this.requests.length);

		request.catch((error) => {
			assert.isOk(error); // isOk = truthy
			done();
		});

		this.requests.pop().respond(500, {'Content-Type': 'application/json'}, JSON.stringify({error: 'Internal Server Error'}));
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

		naja.makeRequest('GET', '/makeRequest/abort');
		this.requests.pop().abort();

		assert.isTrue(abortCallback.called);
		assert.isFalse(successCallback.called);
		assert.isFalse(errorCallback.called);

		assert.isTrue(completeCallback.called);
		assert.isTrue(completeCallback.calledWith(sinon.match.object
			.and(sinon.match.has('error', sinon.match.instanceOf(Error)))
			.and(sinon.match.has('response', null))
			.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
			.and(sinon.match.has('options', sinon.match.object))
		));
	});

	it('should not send the request if before event is aborted', function () {
		const naja = mockNaja();
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const completeCallback = sinon.spy();
		naja.addEventListener('complete', completeCallback);
		naja.addEventListener('before', (evt) => evt.preventDefault());

		let thrown = false;

		try {
			naja.makeRequest('GET', '/makeRequest/abortedBefore');

		} catch (e) {
			// sinon's fake XHR throws error if readyState is not OPENED
			if (e.message === "INVALID_STATE_ERR") {
				thrown = true;
			}
		}

		assert.isTrue(thrown);
		assert.isFalse(completeCallback.called);
	});

	describe('options', function () {
		it('should be set to default options', function (done) {
			const naja = mockNaja();
			naja.initialize();
			cleanPopstateListener(naja.historyHandler);

			const beforeCallback = sinon.spy();
			naja.addEventListener('before', beforeCallback);

			const request = naja.makeRequest('GET', '/makeRequest/options/defaultOptions');
			assert.equal(1, this.requests.length);

			request.then(() => {
				assert.isTrue(beforeCallback.called);
				assert.isTrue(beforeCallback.calledWith(sinon.match.object
					.and(sinon.match.has('options', sinon.match.object
						.and(sinon.match.has('dataType', 'post'))
						.and(sinon.match.has('responseType', 'auto'))
					))
				));

				done();
			});

			this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({answer: 42}));
		});

		it('should be overridden by defaultOptions', function (done) {
			const naja = mockNaja();
			naja.initialize();
			cleanPopstateListener(naja.historyHandler);

			const beforeCallback = sinon.spy();
			naja.addEventListener('before', beforeCallback);

			naja.defaultOptions = {
				'dataType': 'json',
				'customOption': 42,
			};

			const request = naja.makeRequest('GET', '/makeRequest/options/defaultOptions');
			assert.equal(1, this.requests.length);

			request.then(() => {
				assert.isTrue(beforeCallback.called);
				assert.isTrue(beforeCallback.calledWith(sinon.match.object
					.and(sinon.match.has('options', sinon.match.object
						.and(sinon.match.has('dataType', 'json'))
						.and(sinon.match.has('responseType', 'auto'))
						.and(sinon.match.has('customOption', 42))
					))
				));

				done();
			});

			this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({answer: 42}));
		});

		it('should be overridden by ad-hoc options', function (done) {
			const naja = mockNaja();
			naja.initialize();
			cleanPopstateListener(naja.historyHandler);

			const beforeCallback = sinon.spy();
			naja.addEventListener('before', beforeCallback);

			naja.defaultOptions = {
				'customOption': 42,
			};

			const request = naja.makeRequest('GET', '/makeRequest/options/defaultOptions', null, {'customOption': 24, 'anotherOption': 42});
			assert.equal(1, this.requests.length);

			request.then(() => {
				assert.isTrue(beforeCallback.called);
				assert.isTrue(beforeCallback.calledWith(sinon.match.object
					.and(sinon.match.has('options', sinon.match.object
						.and(sinon.match.has('dataType', 'post'))
						.and(sinon.match.has('responseType', 'auto'))
						.and(sinon.match.has('customOption', 24))
						.and(sinon.match.has('anotherOption', 42))
					))
				));

				done();
			});

			this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({answer: 42}));
		});
	});
});
