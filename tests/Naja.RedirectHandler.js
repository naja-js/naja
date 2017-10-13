import jsdom from './jsdomRegister';
import {assert} from 'chai';
import sinon from 'sinon';


describe('RedirectHandler', function () {
	jsdom();

	beforeEach(function () {
		this.mockNaja = require('./setup/mockNaja').default;
		this.RedirectHandler = require('../src/core/RedirectHandler').default;
	});

	it('constructor()', function () {
		const naja = this.mockNaja();
		const mock = sinon.mock(naja);
		mock.expects('addEventListener')
			.withExactArgs('success', sinon.match.instanceOf(Function))
			.once();

		new this.RedirectHandler(naja);
		mock.verify();
	});

	it('reads redirect from response', function (done) {
		const naja = this.mockNaja();
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
		const naja = this.mockNaja();
		new this.RedirectHandler(naja);

		const mock = sinon.mock(window.location);
		mock.expects('assign')
			.withExactArgs('/foo')
			.once();

		const nextListener = sinon.spy();
		naja.addEventListener('success', nextListener);

		naja.makeRequest('GET', '/foo').then(() => {
			assert.isFalse(nextListener.called);
			mock.verify();
			mock.restore();
			done();
		});

		this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({redirect: '/foo', forceRedirect: true}));
	});

	it('makes request if forceRedirect is false', function () {
		const naja = this.mockNaja();
		const redirectHandler = new this.RedirectHandler(naja);

		const mock = sinon.mock(naja);
		mock.expects('makeRequest')
			.withExactArgs('GET', '/foo')
			.once();

		redirectHandler.makeRedirect('/foo', false);
		mock.verify();
	});

	it('redirects if forceRedirect is true', function () {
		const naja = this.mockNaja();
		const redirectHandler = new this.RedirectHandler(naja);

		assert.equal(window.location.href, 'http://example.com/');

		const mock = sinon.mock(window.location);
		mock.expects('assign')
			.withExactArgs('/foo')
			.once();

		redirectHandler.makeRedirect('/foo', true);
		mock.verify();
		mock.restore();
	});

	it('makes request if url is local', function () {
		const naja = this.mockNaja();
		const redirectHandler = new this.RedirectHandler(naja);

		const mock = sinon.mock(naja);
		mock.expects('makeRequest')
			.withExactArgs('GET', 'http://example.com/bar')
			.once();

		redirectHandler.makeRedirect('http://example.com/bar', false);
		mock.verify();
	});

	it('redirects if url is external', function () {
		const naja = this.mockNaja();
		const redirectHandler = new this.RedirectHandler(naja);

		assert.equal(window.location.href, 'http://example.com/');

		const mock = sinon.mock(window.location);
		mock.expects('assign')
			.withExactArgs('http://another-site.com/bar')
			.once();

		redirectHandler.makeRedirect('http://another-site.com/bar', false);
		mock.verify();
		mock.restore();
	});
});
