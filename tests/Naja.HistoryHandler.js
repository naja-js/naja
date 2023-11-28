import {mockNaja} from './setup/mockNaja';
import {fakeFetch} from './setup/fakeFetch';
import {cleanPopstateListener} from './setup/cleanPopstateListener';
import {createPopstateEvent} from './setup/createPopstateEvent';
import {assert} from 'chai';
import sinon from 'sinon';

import {SnippetHandler} from '../src/core/SnippetHandler';
import {HistoryHandler} from '../src/core/HistoryHandler';
import {UIHandler} from '../src/core/UIHandler';


describe('HistoryHandler', function () {
	fakeFetch();

	it('is initialized when history-enabled request is dispatched', function () {
		const naja = mockNaja({
			historyHandler: HistoryHandler,
		});

		assert.isFalse(naja.historyHandler.initialized);

		naja.addEventListener('before', (event) => event.preventDefault());

		return naja.makeRequest('GET', '/HistoryHandler/initialize').then(() => {
			assert.isTrue(naja.historyHandler.initialized);
		});
	});

	it('is not initialized when non-history-enabled request is dispatched', function () {
		const naja = mockNaja({
			historyHandler: HistoryHandler,
		});

		assert.isFalse(naja.historyHandler.initialized);

		naja.addEventListener('before', (event) => event.preventDefault());

		return naja.makeRequest('GET', '/HistoryHandler/initialize', null, {history: false}).then(() => {
			assert.isFalse(naja.historyHandler.initialized);
		});
	});

	it('saves initial state', function () {
		const naja = mockNaja();
		const historyHandler = new HistoryHandler(naja);

		const mock = sinon.mock(historyHandler.historyAdapter);
		const href = sinon.match.string.and(sinon.match((value) => value.startsWith('http://localhost:9876/?wtr-session-id=')));
		mock.expects('replaceState').withExactArgs({source: 'naja', cursor: 0, href}, '', href).once();

		historyHandler.replaceInitialState(new CustomEvent('before', {detail: {options: {history: true}}}));

		mock.verify();
		mock.restore();
	});

	it('pushes new state after successful request', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});

		naja.historyHandler.initialized = true;

		const mock = sinon.mock(naja.historyHandler.historyAdapter);
		mock.expects('pushState').withExactArgs({source: 'naja', cursor: 1, href: 'http://localhost:9876/HistoryHandler/pushState'}, '', 'http://localhost:9876/HistoryHandler/pushState').once();

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {});
		return naja.makeRequest('GET', '/HistoryHandler/pushState').then(() => {
			mock.verify();
			mock.restore();
		});
	});

	it('replaces the state after successful request if options.history === "replace"', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});

		naja.historyHandler.initialized = true;

		const mock = sinon.mock(naja.historyHandler.historyAdapter);
		mock.expects('replaceState').withExactArgs({source: 'naja', cursor: 0, href: 'http://localhost:9876/HistoryHandler/replaceState'}, '', 'http://localhost:9876/HistoryHandler/replaceState').once();

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {});
		return naja.makeRequest('GET', '/HistoryHandler/replaceState', null, {history: 'replace'}).then(() => {
			mock.verify();
			mock.restore();
		});
	});

	it('uses the url from payload if postGet is present', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});

		naja.historyHandler.initialized = true;

		const mock = sinon.mock(naja.historyHandler.historyAdapter);
		mock.expects('pushState').withExactArgs({source: 'naja', cursor: 1, href: '/HistoryHandler/postGet/targetUrl'}, '', '/HistoryHandler/postGet/targetUrl').once();

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {url: '/HistoryHandler/postGet/targetUrl', postGet: true});
		return naja.makeRequest('GET', '/HistoryHandler/postGet').then(() => {
			mock.verify();
			mock.restore();
		});
	});

	it('does not alter the history if options.history === false', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});

		const mock = sinon.mock(naja.historyHandler.historyAdapter);
		mock.expects('pushState').never();
		mock.expects('replaceState').never();

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {});
		return naja.makeRequest('GET', '/HistoryHandler/disabled', null, {history: false}).then(() => {
			mock.verify();
			mock.restore();
		});
	});

	describe('configures mode properly on interaction', function () {
		it('missing data-naja-history', () => {
			const naja = mockNaja({uiHandler: UIHandler});
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/foo', null, {})
				.once();

			// initialize history handler
			new HistoryHandler(naja);

			const link = document.createElement('a');
			link.href = '/foo';
			link.classList.add('ajax');
			document.body.appendChild(link);

			naja.uiHandler.clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('does not override naja.defaultOptions.history', function () {
			const naja = mockNaja({uiHandler: UIHandler});
			const mock = sinon.mock(naja);

			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/foo', null, {})
				.once();

			// initialize history handler
			new HistoryHandler(naja);
			naja.defaultOptions.history = false;

			const link = document.createElement('a');
			link.href = '/foo';
			link.classList.add('ajax');
			document.body.appendChild(link);

			naja.uiHandler.clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('data-naja-history=replace', () => {
			const naja = mockNaja({uiHandler: UIHandler});
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/foo', null, {history: 'replace'})
				.once();

			// initialize history handler
			new HistoryHandler(naja);

			const link = document.createElement('a');
			link.href = '/foo';
			link.classList.add('ajax');
			link.setAttribute('data-naja-history', 'replace');
			document.body.appendChild(link);

			naja.uiHandler.clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('data-naja-history=off', () => {
			const naja = mockNaja({uiHandler: UIHandler});
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/foo', null, {history: false})
				.once();

			// initialize history handler
			new HistoryHandler(naja);

			const link = document.createElement('a');
			link.href = '/foo';
			link.classList.add('ajax');
			link.setAttribute('data-naja-history', 'off');
			document.body.appendChild(link);

			naja.uiHandler.clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});
	});

	describe('event system', function () {
		it('dispatches event on build state during push', function () {
			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				historyHandler: HistoryHandler,
			});

			naja.historyHandler.initialized = true;

			const mock = sinon.mock(naja.historyHandler.historyAdapter);
			mock.expects('pushState').once();

			const buildStateCallback = sinon.spy();
			naja.historyHandler.addEventListener('buildState', buildStateCallback);

			this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {});
			return naja.makeRequest('GET', '/HistoryHandler/event').then(() => {
				assert.isTrue(buildStateCallback.calledOnce);
				assert.isTrue(buildStateCallback.calledWith(
					sinon.match((event) => event.constructor.name === 'CustomEvent')
						.and(sinon.match.has('detail', sinon.match.object
							.and(sinon.match.has('state', sinon.match.object))
							.and(sinon.match.has('operation', 'pushState'))
							.and(sinon.match.has('options', sinon.match.object))
						))
				));

				mock.verify();
				mock.restore();
			});
		});

		it('dispatches event on build state during replacement', function () {
			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				historyHandler: HistoryHandler,
			});

			naja.historyHandler.initialized = true;

			const mock = sinon.mock(naja.historyHandler.historyAdapter);
			mock.expects('replaceState').once();

			const buildStateCallback = sinon.spy();
			naja.historyHandler.addEventListener('buildState', buildStateCallback);

			this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {});
			return naja.makeRequest('GET', '/HistoryHandler/event/replace', null, {history: 'replace'}).then(() => {
				assert.isTrue(buildStateCallback.calledOnce);
				assert.isTrue(buildStateCallback.calledWith(
					sinon.match((event) => event.constructor.name === 'CustomEvent')
						.and(sinon.match.has('detail', sinon.match.object
							.and(sinon.match.has('state', sinon.match.object))
							.and(sinon.match.has('operation', 'replaceState'))
							.and(sinon.match.has('options', sinon.match.object))
						))
				));

				mock.verify();
				mock.restore();
			});
		});

		it('dispatches event on popstate', function () {
			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				historyHandler: HistoryHandler,
			});
			naja.historyHandler.initialize();

			const restoreCallback = sinon.spy();
			naja.historyHandler.addEventListener('restoreState', restoreCallback);

			assert.equal(naja.historyHandler.cursor, 0);

			const state = {source: 'naja', cursor: 1, href: '/HistoryHandler/popState/event'};
			window.dispatchEvent(createPopstateEvent(state));

			assert.equal(naja.historyHandler.cursor, 1);

			assert.isTrue(restoreCallback.calledOnce);
			assert.isTrue(restoreCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
					.and(sinon.match.has('detail', sinon.match.object
						.and(sinon.match.has('state', state))
						.and(sinon.match.has('direction', 1))
						.and(sinon.match.has('options', sinon.match.object))
					))
			));

			cleanPopstateListener(naja.historyHandler);
		});

		it('does not dispatch event on initial popstate', function () {
			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				historyHandler: HistoryHandler,
			});
			naja.historyHandler.initialize();

			const restoreCallback = sinon.spy();
			naja.historyHandler.addEventListener('restoreState', restoreCallback);

			window.dispatchEvent(createPopstateEvent(null));

			assert.isTrue(restoreCallback.notCalled);
			cleanPopstateListener(naja.historyHandler);
		});

		it('does not dispatch event on foreign popstate', function () {
			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				historyHandler: HistoryHandler,
			});
			naja.historyHandler.initialize();

			const restoreCallback = sinon.spy();
			naja.historyHandler.addEventListener('restoreState', restoreCallback);

			const state = {source: 'definitely-not-naja'};
			window.dispatchEvent(createPopstateEvent(state));

			assert.isTrue(restoreCallback.notCalled);
			cleanPopstateListener(naja.historyHandler);
		});
	});
});
