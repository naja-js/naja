import jsdom from './jsdomRegister';
import {assert} from 'chai';
import sinon from 'sinon';


describe('RedirectHandler', function () {
	jsdom();

	beforeEach(function (done) {
		this.Naja = require('../src/Naja').default;
		this.RedirectHandler = require('../src/core/RedirectHandler').default;
		done();
	});

	it('registered in Naja.initialize()', function () {
		const naja = new this.Naja();
		naja.initialize();
		assert.instanceOf(naja.redirectHandler, this.RedirectHandler);
	});

	it('constructor()', function () {
		const naja = new this.Naja();
		const mock = sinon.mock(naja);
		mock.expects('addEventListener')
			.withExactArgs('success', sinon.match.instanceOf(Function))
			.once();

		new this.RedirectHandler(naja);
		mock.verify();
	});

	it('reads redirect from response', function (done) {
		const naja = new this.Naja();
		const redirectHandler = new this.RedirectHandler(naja);

		const mock = sinon.mock(redirectHandler);
		mock.expects('makeRedirect')
			.withExactArgs('/foo', true)
			.once();

		naja.makeRequest('GET', '/foo').then(() => {
			mock.verify();
			done();
		});

		this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({redirect: '/foo', forceRedirect: true}));
	});

	it('stops event propagation', function (done) {
		const naja = new this.Naja();
		new this.RedirectHandler(naja);

		const nextListener = sinon.spy();
		naja.addEventListener('success', nextListener);

		naja.makeRequest('GET', '/foo').then(() => {
			assert.isFalse(nextListener.called);
			done();
		});

		this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({redirect: '/foo', forceRedirect: true}));
	});

	it('makes request if forceRedirect is false', function () {
		const naja = new this.Naja();
		const redirectHandler = new this.RedirectHandler(naja);

		const mock = sinon.mock(naja);
		mock.expects('makeRequest')
			.withExactArgs('GET', '/foo')
			.once();

		redirectHandler.makeRedirect('/foo', false);
		mock.verify();
	});

	it('redirects if forceRedirect is true', function () {
		const naja = new this.Naja();
		const redirectHandler = new this.RedirectHandler(naja);

		assert.equal(window.location.href, 'http://example.com/');
		redirectHandler.makeRedirect('/foo', true);
		assert.equal(window.location.href, '/foo');
	});

	it('makes request if url is local', function () {
		const naja = new this.Naja();
		const redirectHandler = new this.RedirectHandler(naja);

		const mock = sinon.mock(naja);
		mock.expects('makeRequest')
			.withExactArgs('GET', 'http://example.com/bar')
			.once();

		redirectHandler.makeRedirect('http://example.com/bar', false);
		mock.verify();
	});

	it('redirects if url is external', function () {
		const naja = new this.Naja();
		const redirectHandler = new this.RedirectHandler(naja);

		assert.equal(window.location.href, 'http://example.com/');
		redirectHandler.makeRedirect('http://another-site.com/bar', false);
		assert.equal(window.location.href, 'http://another-site.com/bar');
	});
});
