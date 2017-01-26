import 'jsdom-global/register';
import {assert} from 'chai';
import sinon from 'sinon';

import Naja from '../src/Naja';
import RedirectHandler from '../src/core/RedirectHandler';


describe('RedirectHandler', function () {
	it('registered in Naja.initialize()', function () {
		const naja = new Naja();
		naja.initialize();
		assert.instanceOf(naja.redirectHandler, RedirectHandler);
	});

	it('constructor()', function () {
		const naja = new Naja();
		const mock = sinon.mock(naja);
		mock.expects('addEventListener')
			.withExactArgs('success', sinon.match.instanceOf(Function))
			.once();

		new RedirectHandler(naja);
		mock.verify();
	});

	it('reads redirect from response', function (done) {
		const xhr = sinon.useFakeXMLHttpRequest();
		global.window.XMLHttpRequest = window.XMLHttpRequest = XMLHttpRequest;
		const requests = [];
		xhr.onCreate = requests.push.bind(requests);

		const naja = new Naja();
		const redirectHandler = new RedirectHandler(naja);

		const mock = sinon.mock(redirectHandler);
		mock.expects('makeRedirect')
			.withExactArgs('/foo', true)
			.once();

		naja.makeRequest('GET', '/foo').then(() => {
			mock.verify();
			xhr.restore();
			done();
		});

		requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({redirect: '/foo', forward: true}));
	});

	it('stops event propagation', function (done) {
		const xhr = sinon.useFakeXMLHttpRequest();
		global.window.XMLHttpRequest = window.XMLHttpRequest = XMLHttpRequest;
		const requests = [];
		xhr.onCreate = requests.push.bind(requests);

		const naja = new Naja();
		new RedirectHandler(naja);

		const nextListener = sinon.spy();
		naja.addEventListener('success', nextListener);

		naja.makeRequest('GET', '/foo').then(() => {
			assert.isFalse(nextListener.called);
			xhr.restore();
			done();
		});

		requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({redirect: '/foo', forward: true}));
	});

	it('makes request if forward is true', function () {
		const naja = new Naja();
		const redirectHandler = new RedirectHandler(naja);

		const mock = sinon.mock(naja);
		mock.expects('makeRequest')
			.withExactArgs('GET', 'http://example.com')
			.once();

		redirectHandler.makeRedirect('http://example.com', true);
		mock.verify();
	});

	it('redirects if forward is false', function () {
		const naja = new Naja();
		const redirectHandler = new RedirectHandler(naja);

		Object.defineProperty(window.location, 'href', {
			writable: true,
			value: 'about:blank'
		});

		assert.equal(window.location.href, 'about:blank');
		redirectHandler.makeRedirect('http://example.com', false);
		assert.equal(window.location.href, 'http://example.com');
	});
});
