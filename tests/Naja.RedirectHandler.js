import './jsdomRegister';
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

		requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({redirect: '/foo', forceRedirect: true}));
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

		requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({redirect: '/foo', forceRedirect: true}));
	});

	it('makes request if forceRedirect is false', function () {
		const naja = new Naja();
		const redirectHandler = new RedirectHandler(naja);

		const mock = sinon.mock(naja);
		mock.expects('makeRequest')
			.withExactArgs('GET', '/foo')
			.once();

		redirectHandler.makeRedirect('/foo', false);
		mock.verify();
	});

	it('redirects if forceRedirect is true', function () {
		const naja = new Naja();
		const redirectHandler = new RedirectHandler(naja);

		Object.defineProperty(window.location, 'href', {
			writable: true,
			value: 'about:blank'
		});

		assert.equal(window.location.href, 'about:blank');
		redirectHandler.makeRedirect('/foo', true);
		assert.equal(window.location.href, '/foo');
	});

	it('makes request if url is local', function () {
		const naja = new Naja();
		const redirectHandler = new RedirectHandler(naja);

		Object.defineProperty(window.location, 'origin', {
			writable: false,
			value: 'http://example.com'
		});

		const mock = sinon.mock(naja);
		mock.expects('makeRequest')
			.withExactArgs('GET', 'http://example.com/bar')
			.once();

		redirectHandler.makeRedirect('http://example.com/bar', false);
		mock.verify();
	});

	it('redirects if url is external', function () {
		const naja = new Naja();
		const redirectHandler = new RedirectHandler(naja);

		Object.defineProperty(window.location, 'href', {
			writable: true,
			value: 'http://example.com/foo'
		});

		Object.defineProperty(window.location, 'origin', {
			writable: false,
			value: 'http://example.com'
		});

		assert.equal(window.location.href, 'http://example.com/foo');
		redirectHandler.makeRedirect('http://another-site.com/bar', false);
		assert.equal(window.location.href, 'http://another-site.com/bar');
	});
});
