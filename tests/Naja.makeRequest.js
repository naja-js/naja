import jsdom from './jsdomRegister';
import {assert} from 'chai';
import sinon from 'sinon';


describe('makeRequest()', function () {
	jsdom();

	beforeEach(function (done) {
		this.Naja = require('../src/Naja').default;
		done();
	});

	it('should call success event if the request succeeds', function (done) {
		const naja = new this.Naja();
		naja.initialize();

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

		const request = naja.makeRequest('GET', '/foo');
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
			));

			assert.isTrue(completeCallback.called);
			assert.isTrue(completeCallback.calledBefore(loadCallback));
			assert.isTrue(completeCallback.calledWith(sinon.match.object
				.and(sinon.match.has('error', null))
				.and(sinon.match.has('response'))
				.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
			));

			assert.isTrue(loadCallback.called);
			assert.isFalse(errorCallback.called);
			done();
		});

		this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({answer: 42}));
	});

	it('should call error event if the request fails', function (done) {
		const naja = new this.Naja();
		naja.initialize();

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

		const request = naja.makeRequest('GET', '/foo');
		assert.equal(1, this.requests.length);

		request.then(() => {
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
			));

			assert.isTrue(completeCallback.called);
			assert.isTrue(completeCallback.calledBefore(loadCallback));
			assert.isTrue(completeCallback.calledWith(sinon.match.object
				.and(sinon.match.has('error', sinon.match.truthy))
				.and(sinon.match.has('response'))
				.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
			));

			assert.isTrue(loadCallback.called);
			assert.isFalse(successCallback.called);
			done();
		});

		this.requests[0].respond(500, {'Content-Type': 'application/json'}, JSON.stringify({error: 'Internal Server Error'}));
	});

	it('should call error event if the request is aborted', function () {
		const naja = new this.Naja();
		naja.initialize();

		const errorCallback = sinon.spy();
		const completeCallback = sinon.spy();
		naja.addEventListener('start', ({xhr}) => xhr.abort());
		naja.addEventListener('error', errorCallback);
		naja.addEventListener('complete', completeCallback);

		naja.makeRequest('GET', '/foo');

		assert.isTrue(errorCallback.called);
		assert.isTrue(errorCallback.calledWith(sinon.match.object
			.and(sinon.match.has('error', sinon.match.truthy))
			.and(sinon.match.has('response', sinon.match.typeOf('null')))
			.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
		));

		assert.isTrue(completeCallback.called);
		assert.isTrue(completeCallback.calledWith(sinon.match.object
			.and(sinon.match.has('error', sinon.match.truthy))
			.and(sinon.match.has('response', sinon.match.typeOf('null')))
			.and(sinon.match.has('xhr', sinon.match.instanceOf(window.XMLHttpRequest)))
		));
	});

	it('should not send the request if before event is aborted', function () {
		const Naja = require('../src/Naja').default;
		const naja = new Naja();
		naja.initialize();

		const completeCallback = sinon.spy();
		naja.addEventListener('complete', completeCallback);
		naja.addEventListener('before', (evt) => evt.preventDefault());

		let thrown = false;

		try {
			naja.makeRequest('GET', '/foo');

		} catch (e) {
			// sinon's fake XHR throws error if readyState is not OPENED
			if (e.message === "INVALID_STATE_ERR") {
				thrown = true;
			}
		}

		assert.isTrue(thrown);
		assert.isFalse(completeCallback.called);
	});
});
