import 'jsdom-global/register';
import {assert} from 'chai';
import sinon from 'sinon';

import Naja from '../src/Naja';


describe('Naja.js', () => {
	it('should initialize once', function () {
		const naja = new Naja();
		let thrown = false;
		assert.isFalse(naja.initialized);

		naja.initialize();
		assert.isTrue(naja.initialized);

		try {
			naja.initialize();

		} catch (e) {
			assert.instanceOf(e, Error);
			assert.equal(e.message, "Cannot initialize Naja, it is already initialized.");
			thrown = true;
		}

		assert.isTrue(thrown);
	});

	describe('event system', function () {
		it('should call event listener', function () {
			const naja = new Naja();
			let initCalled = false;

			naja.addEventListener('init', evt => initCalled = true);
			naja.initialize();

			assert.isTrue(initCalled);
		});

		it('should not call listener after evt.stopImmediatePropagation() call', function () {
			const naja = new Naja();
			let loadCalled = false;
			let loadCalled2 = false;

			naja.addEventListener('load', evt => { loadCalled = true; evt.stopImmediatePropagation(); });
			naja.addEventListener('load', evt => loadCalled2 = true);
			naja.initialize();

			assert.isTrue(loadCalled);
			assert.isFalse(loadCalled2);
		});

		it('should return false after evt.preventDefault() call', function () {
			const naja = new Naja();
			assert.isTrue(naja.fireEvent('foo'));

			naja.addEventListener('foo', evt => evt.preventDefault());
			assert.isFalse(naja.fireEvent('foo'));
		});
	});

	describe('makeRequest()', function () {
		beforeEach(function () {
			this.xhr = sinon.useFakeXMLHttpRequest();
			global.window.XMLHttpRequest = window.XMLHttpRequest = XMLHttpRequest;
			const requests = this.requests = [];

	        this.xhr.onCreate = function (xhr) {
	            requests.push(xhr);
	        };
		});

		afterEach(function () {
			this.xhr.restore();
		})

		it('should call success event if the request succeeds', function (done) {
			const naja = new Naja();
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
				assert.isTrue(startCallback.called);
				assert.isTrue(startCallback.calledBefore(successCallback));
				assert.isTrue(successCallback.called);
				assert.isTrue(successCallback.calledBefore(completeCallback));
				assert.isTrue(completeCallback.called);
				assert.isTrue(completeCallback.calledBefore(loadCallback));
				assert.isTrue(loadCallback.called);
				assert.isFalse(errorCallback.called);
				done();
			})

			this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({answer: 42}));
		});

		it('should call error event if the request fails', function (done) {
			const naja = new Naja();
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
				assert.isTrue(startCallback.called);
				assert.isTrue(errorCallback.called);
				assert.isTrue(errorCallback.calledBefore(completeCallback));
				assert.isTrue(completeCallback.called);
				assert.isTrue(loadCallback.called);
				assert.isFalse(successCallback.called);
				done();
			})

			this.requests[0].respond(500, {'Content-Type': 'application/json'}, JSON.stringify({error: 'Internal Server Error'}));
		});
	});
});
