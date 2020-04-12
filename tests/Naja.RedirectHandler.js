import mockNaja from './setup/mockNaja';
import fakeXhr from './setup/fakeXhr';
import {assert} from 'chai';
import sinon from 'sinon';

import RedirectHandler from '../src/core/RedirectHandler';
import UIHandler from '../src/core/UIHandler';


describe('RedirectHandler', function () {
	fakeXhr();

	it('constructor()', function () {
		const naja = mockNaja();
		const mock = sinon.mock(naja);

		mock.expects('addEventListener')
			.withExactArgs('interaction', sinon.match.instanceOf(Function))
			.once();

		mock.expects('addEventListener')
			.withExactArgs('success', sinon.match.instanceOf(Function))
			.once();

		new RedirectHandler(naja);
		mock.verify();
	});

	it('reads redirect from response', function (done) {
		const naja = mockNaja();
		const redirectHandler = new RedirectHandler(naja);

		const mock = sinon.mock(redirectHandler);
		mock.expects('makeRedirect')
			.withExactArgs('/RedirectHandler/redirect/redirectTo', true, sinon.match({}))
			.once();

		naja.makeRequest('GET', '/RedirectHandler/redirect').then(() => {
			mock.verify();
			done();
		});

		this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({redirect: '/RedirectHandler/redirect/redirectTo', forceRedirect: true}));
	});

	it('reads forceRedirect from options', function (done) {
		const naja = mockNaja();
		const redirectHandler = new RedirectHandler(naja);

		const mock = sinon.mock(redirectHandler);
		mock.expects('makeRedirect')
			.withExactArgs('/RedirectHandler/redirect/redirectTo', true, sinon.match({forceRedirect: true}))
			.once();

		naja.makeRequest('GET', '/RedirectHandler/forceRedirect/options', null, {forceRedirect: true}).then(() => {
			mock.verify();
			done();
		});

		this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({redirect: '/RedirectHandler/redirect/redirectTo', forceRedirect: false}));
	});

	describe('configures forceRedirect from data-naja-force-redirect', function () {
		it('missing data-naja-force-redirect', () => {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/foo', null, {})
				.once();

			new RedirectHandler(naja);

			const link = document.createElement('a');
			link.href = '/foo';
			link.classList.add('ajax');
			document.body.appendChild(link);

			new UIHandler(naja).clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('data-naja-force-redirect=true', () => {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/foo', null, {forceRedirect: true})
				.once();

			new RedirectHandler(naja);

			const link = document.createElement('a');
			link.href = '/foo';
			link.classList.add('ajax');
			link.setAttribute('data-naja-force-redirect', 'on');
			document.body.appendChild(link);

			new UIHandler(naja).clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('data-naja-force-redirect=off', () => {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/foo', null, {forceRedirect: false})
				.once();

			new RedirectHandler(naja);

			const link = document.createElement('a');
			link.href = '/foo';
			link.classList.add('ajax');
			link.setAttribute('data-naja-force-redirect', 'off');
			document.body.appendChild(link);

			new UIHandler(naja).clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});
	});

	it('stops event propagation', function (done) {
		const naja = mockNaja();
		const redirectHandler = new RedirectHandler(naja);

		const mock = sinon.mock(redirectHandler.locationAdapter);
		mock.expects('assign')
			.withExactArgs('/RedirectHandler/stopEventPropagation/redirectTo')
			.once();

		const nextListener = sinon.spy();
		naja.addEventListener('success', nextListener);

		naja.makeRequest('GET', '/RedirectHandler/stopEventPropagation').then(() => {
			assert.isFalse(nextListener.called);
			mock.verify();
			mock.restore();
			done();
		});

		this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({redirect: '/RedirectHandler/stopEventPropagation/redirectTo', forceRedirect: true}));
	});

	it('redirects if forceRedirect is true', function () {
		const naja = mockNaja();
		const redirectHandler = new RedirectHandler(naja);

		const uiHandlerMock = sinon.mock(naja.uiHandler);
		uiHandlerMock.expects('isUrlAllowed').never();

		const mock = sinon.mock(redirectHandler.locationAdapter);
		mock.expects('assign')
			.withExactArgs('/RedirectHandler/forceRedirect')
			.once();

		redirectHandler.makeRedirect('/RedirectHandler/forceRedirect', true);
		mock.verify();
		mock.restore();
		uiHandlerMock.verify();
		uiHandlerMock.restore();
	});

	it('makes request if url is allowed', function () {
		const naja = mockNaja();
		const redirectHandler = new RedirectHandler(naja);

		const uiHandlerMock = sinon.mock(naja.uiHandler);
		uiHandlerMock.expects('isUrlAllowed')
			.withExactArgs('http://localhost:9876/RedirectHandler/localUrl')
			.once()
			.returns(true);

		const mock = sinon.mock(naja);
		mock.expects('makeRequest')
			.withExactArgs('GET', 'http://localhost:9876/RedirectHandler/localUrl', null, sinon.match({}))
			.once();

		redirectHandler.makeRedirect('http://localhost:9876/RedirectHandler/localUrl', false);
		mock.verify();
		uiHandlerMock.verify();
	});

	it('redirects if url is not allowed', function () {
		const naja = mockNaja();
		const redirectHandler = new RedirectHandler(naja);

		const uiHandlerMock = sinon.mock(naja.uiHandler);
		uiHandlerMock.expects('isUrlAllowed')
			.withExactArgs('http://another-site.com/bar')
			.once()
			.returns(false);

		const mock = sinon.mock(redirectHandler.locationAdapter);
		mock.expects('assign')
			.withExactArgs('http://another-site.com/bar')
			.once();

		redirectHandler.makeRedirect('http://another-site.com/bar', false);
		mock.verify();
		mock.restore();
		uiHandlerMock.verify();
		uiHandlerMock.restore();
	});

	describe('overrides history settings', function () {
		it('if options.history is undefined', function () {
			const naja = mockNaja();
			const redirectHandler = new RedirectHandler(naja);

			const uiHandlerMock = sinon.mock(naja.uiHandler);
			uiHandlerMock.expects('isUrlAllowed').withExactArgs('/RedirectHandler/history/undefined').once().returns(true);

			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', '/RedirectHandler/history/undefined', null, sinon.match({history: 'replace'}))
				.once();

			redirectHandler.makeRedirect('/RedirectHandler/history/undefined', false, {});
			mock.verify();
			uiHandlerMock.verify();
		});

		it('if options.history is true', function () {
			const naja = mockNaja();
			const redirectHandler = new RedirectHandler(naja);

			const uiHandlerMock = sinon.mock(naja.uiHandler);
			uiHandlerMock.expects('isUrlAllowed').withExactArgs('/RedirectHandler/history/true').once().returns(true);

			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', '/RedirectHandler/history/true', null, sinon.match({history: 'replace'}))
				.once();

			redirectHandler.makeRedirect('/RedirectHandler/history/true', false, {history: true});
			mock.verify();
			uiHandlerMock.verify();
		});

		it('NOT if options.history is false', function () {
			const naja = mockNaja();
			const redirectHandler = new RedirectHandler(naja);

			const uiHandlerMock = sinon.mock(naja.uiHandler);
			uiHandlerMock.expects('isUrlAllowed').withExactArgs('/RedirectHandler/history/false').once().returns(true);

			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', '/RedirectHandler/history/false', null, sinon.match({history: false}))
				.once();

			redirectHandler.makeRedirect('/RedirectHandler/history/false', false, {history: false});
			mock.verify();
			uiHandlerMock.verify();
		});
	});
});
