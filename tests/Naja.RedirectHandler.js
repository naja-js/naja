import {mockNaja} from './setup/mockNaja';
import {fakeFetch} from './setup/fakeFetch';
import {assert} from 'chai';
import sinon from 'sinon';

import {RedirectHandler} from '../src/core/RedirectHandler';
import {UIHandler} from '../src/core/UIHandler';


describe('RedirectHandler', function () {
	fakeFetch();

	it('constructor()', function () {
		const naja = mockNaja();
		const mock = sinon.mock(naja);

		mock.expects('addEventListener')
			.withExactArgs('success', sinon.match.instanceOf(Function))
			.once();

		new RedirectHandler(naja);
		mock.verify();
	});

	it('reads forceRedirect from options', function () {
		const naja = mockNaja();
		const redirectHandler = new RedirectHandler(naja);

		const mock = sinon.mock(redirectHandler);
		mock.expects('makeRedirect')
			.withExactArgs('/RedirectHandler/redirect/redirectTo', true, sinon.match({forceRedirect: true}))
			.once();

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {redirect: '/RedirectHandler/redirect/redirectTo', forceRedirect: false});
		return naja.makeRequest('GET', '/RedirectHandler/forceRedirect/options', null, {forceRedirect: true}).then(() => {
			mock.verify();
		});
	});

	describe('configures forceRedirect from data-naja-force-redirect', function () {
		it('missing data-naja-force-redirect', () => {
			const naja = mockNaja({uiHandler: UIHandler});
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/foo', null, {})
				.once();

			new RedirectHandler(naja);

			const link = document.createElement('a');
			link.href = '/foo';
			link.classList.add('ajax');
			document.body.appendChild(link);

			naja.uiHandler.clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('data-naja-force-redirect=true', () => {
			const naja = mockNaja({uiHandler: UIHandler});
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

			naja.uiHandler.clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('data-naja-force-redirect=off', () => {
			const naja = mockNaja({uiHandler: UIHandler});
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

			naja.uiHandler.clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});
	});

	it('stops event propagation', function () {
		const naja = mockNaja();
		const redirectHandler = new RedirectHandler(naja);

		const mock = sinon.mock(redirectHandler.locationAdapter);
		mock.expects('assign')
			.withExactArgs('/RedirectHandler/stopEventPropagation/redirectTo')
			.once();

		const nextListener = sinon.spy();
		naja.addEventListener('success', nextListener);

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {redirect: '/RedirectHandler/stopEventPropagation/redirectTo'});
		return naja.makeRequest('GET', '/RedirectHandler/stopEventPropagation', null, {forceRedirect: true}).then(() => {
			assert.isFalse(nextListener.called);
			mock.verify();
			mock.restore();
		});
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

	describe('"redirect" event', function () {
		it('can prevent redirection', function () {
			const naja = mockNaja();
			const redirectHandler = new RedirectHandler(naja);

			const redirectCallback = sinon.spy((evt) => evt.preventDefault());
			redirectHandler.addEventListener('redirect', redirectCallback);

			const mock = sinon.mock(redirectHandler.locationAdapter);
			mock.expects('assign').never();

			redirectHandler.makeRedirect('/RedirectHandler/event/preventDefault', true);
			mock.verify();

			assert.isTrue(redirectCallback.calledOnce);
			assert.isTrue(redirectCallback.calledWith(sinon.match.instanceOf(CustomEvent)
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('url', '/RedirectHandler/event/preventDefault'))
					.and(sinon.match.has('isHardRedirect', true))
				))
			));
		});

		it('can override hardRedirect settings', function () {
			const naja = mockNaja();
			const redirectHandler = new RedirectHandler(naja);

			const redirectCallback = sinon.spy((event) => event.detail.setHardRedirect(true));
			redirectHandler.addEventListener('redirect', redirectCallback);

			const uiHandlerMock = sinon.mock(naja.uiHandler);
			uiHandlerMock.expects('isUrlAllowed').withExactArgs('/RedirectHandler/event/setHardRedirect').once().returns(true);

			const mock = sinon.mock(redirectHandler.locationAdapter);
			mock.expects('assign')
				.withExactArgs('/RedirectHandler/event/setHardRedirect')
				.once();

			redirectHandler.makeRedirect('/RedirectHandler/event/setHardRedirect', false);
			mock.verify();
			uiHandlerMock.verify();

			assert.isTrue(redirectCallback.calledOnce);
			assert.isTrue(redirectCallback.calledWith(sinon.match.instanceOf(CustomEvent)
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('url', '/RedirectHandler/event/setHardRedirect'))
					.and(sinon.match.has('isHardRedirect', false))
				))
			));
		});
	});
});
