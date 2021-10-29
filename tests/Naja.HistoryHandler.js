import {mockNaja} from './setup/mockNaja';
import {fakeFetch} from './setup/fakeFetch';
import {cleanPopstateListener} from './setup/cleanPopstateListener';
import {assert} from 'chai';
import sinon from 'sinon';

import {SnippetHandler} from '../src/core/SnippetHandler';
import {HistoryHandler} from '../src/core/HistoryHandler';
import {UIHandler} from '../src/core/UIHandler';


describe('HistoryHandler', function () {
	fakeFetch();

	it('constructor()', function () {
		const naja = mockNaja();
		const mock = sinon.mock(naja);

		mock.expects('addEventListener')
			.withExactArgs('init', sinon.match.instanceOf(Function))
			.once();

		mock.expects('addEventListener')
			.withExactArgs('before', sinon.match.instanceOf(Function))
			.once();

		mock.expects('addEventListener')
			.withExactArgs('success', sinon.match.instanceOf(Function))
			.once();

		new HistoryHandler(naja);
		mock.verify();
	});

	it('saves initial state', function () {
		const naja = mockNaja();
		const historyHandler = new HistoryHandler(naja);

		const mock = sinon.mock(historyHandler.historyAdapter);
		mock.expects('replaceState').withExactArgs({
			href: 'http://localhost:9876/context.html',
			title: '',
			ui: {},
		}, '', 'http://localhost:9876/context.html').once();

		historyHandler.initialize(new CustomEvent('init', {detail: {defaultOptions: {}}}));
		cleanPopstateListener(historyHandler);

		mock.verify();
		mock.restore();
	});

	it('pushes new state after successful request', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const el = document.createElement('div');
		el.id = 'snippet-history-foo';
		document.body.appendChild(el);

		const ignoredEl = document.createElement('div');
		ignoredEl.id = 'snippet-history-bar';
		ignoredEl.setAttribute('data-naja-history-nocache', true);
		document.body.appendChild(ignoredEl);

		const mock = sinon.mock(naja.historyHandler.historyAdapter);
		mock.expects('pushState').withExactArgs({
			href: 'http://localhost:9876/HistoryHandler/pushState',
			title: '',
			ui: {
				'snippet-history-foo': 'foo'
			},
		}, '', 'http://localhost:9876/HistoryHandler/pushState').once();

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {snippets: {'snippet-history-foo': 'foo'}});
		return naja.makeRequest('GET', '/HistoryHandler/pushState').then(() => {
			mock.verify();
			mock.restore();

			document.body.removeChild(el);
			document.body.removeChild(ignoredEl);
		});
	});

	it('replaces the state after successful request if options.history === "replace"', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const el = document.createElement('div');
		el.id = 'snippet-history-foo';
		document.body.appendChild(el);

		const mock = sinon.mock(naja.historyHandler.historyAdapter);
		mock.expects('replaceState').withExactArgs({
			href: 'http://localhost:9876/HistoryHandler/replaceState',
			title: '',
			ui: {
				'snippet-history-foo': 'foo'
			},
		}, '', 'http://localhost:9876/HistoryHandler/replaceState').once();

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {snippets: {'snippet-history-foo': 'foo'}});
		return naja.makeRequest('GET', '/HistoryHandler/replaceState', null, {history: 'replace'}).then(() => {
			mock.verify();
			mock.restore();

			document.body.removeChild(el);
		});
	});

	it('uses the url from payload if postGet is present', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const mock = sinon.mock(naja.historyHandler.historyAdapter);
		mock.expects('pushState').withExactArgs({
			href: '/HistoryHandler/postGet/targetUrl',
			title: '',
			ui: {},
		}, '', '/HistoryHandler/postGet/targetUrl').once();

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
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const mock = sinon.mock(naja.historyHandler.historyAdapter);
		mock.expects('pushState').never();
		mock.expects('replaceState').never();

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {snippets: {'snippet-history-foo': 'foo'}});
		return naja.makeRequest('GET', '/HistoryHandler/disabled', null, {history: false}).then(() => {
			mock.verify();
			mock.restore();
		});
	});

	it('dispatches event on build state', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const el = document.createElement('div');
		el.id = 'snippet-history-foo';
		document.body.appendChild(el);

		const mock = sinon.mock(naja.historyHandler.historyAdapter);
		mock.expects('pushState').once();

		const buildStateCallback = sinon.spy();
		naja.historyHandler.addEventListener('buildState', buildStateCallback);

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {snippets: {'snippet-history-foo': 'foo'}});
		return naja.makeRequest('GET', '/HistoryHandler/event').then(() => {
			assert.isTrue(buildStateCallback.calledOnce);
			assert.isTrue(buildStateCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('state', sinon.match.object))
					.and(sinon.match.has('options', sinon.match.object))
				))
			));

			mock.verify();
			mock.restore();

			document.body.removeChild(el);
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


	describe('disabling uiCache', () => {
		it('does not save snippets in initial state if uiCache is disabled globally', () => {
			const naja = mockNaja();
			const historyHandler = new HistoryHandler(naja);
			historyHandler.uiCache = false;

			const mock = sinon.mock(historyHandler.historyAdapter);
			mock.expects('replaceState').withExactArgs({
				href: 'http://localhost:9876/context.html',
				ui: false,
			}, 'new title', 'http://localhost:9876/context.html').once();

			historyHandler.initialize(new CustomEvent('init', {detail: {defaultOptions: {}}}));
			cleanPopstateListener(historyHandler);

			mock.verify();
			mock.restore();
		});

		it('does not push snippets to state if uiCache is disabled globally', function () {
			const naja = mockNaja({
				historyHandler: HistoryHandler,
			});
			naja.historyHandler.uiCache = false;
			naja.initialize();
			cleanPopstateListener(naja.historyHandler);

			const el = document.createElement('div');
			el.id = 'snippet-history-foo';
			document.body.appendChild(el);

			const mock = sinon.mock(naja.historyHandler.historyAdapter);
			mock.expects('pushState').withExactArgs({
				href: 'http://localhost:9876/HistoryHandler/pushStateWithoutCache',
				ui: false,
			}, 'new title', 'http://localhost:9876/HistoryHandler/pushStateWithoutCache').once();

			this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {snippets: {'snippet-history-foo': 'foo'}});
			return naja.makeRequest('GET', '/HistoryHandler/pushStateWithoutCache').then(() => {
				mock.verify();
				mock.restore();

				document.body.removeChild(el);
			});
		});

		it('does not push snippets to state if uiCache is enabled globally but disabled via options', function () {
			const naja = mockNaja({
				historyHandler: HistoryHandler,
			});
			naja.initialize();
			cleanPopstateListener(naja.historyHandler);

			const el = document.createElement('div');
			el.id = 'snippet-history-foo';
			document.body.appendChild(el);

			const mock = sinon.mock(naja.historyHandler.historyAdapter);
			mock.expects('pushState').withExactArgs({
				href: 'http://localhost:9876/HistoryHandler/pushStateWithoutCacheOption',
				ui: false,
			}, 'new title', 'http://localhost:9876/HistoryHandler/pushStateWithoutCacheOption').once();

			this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {snippets: {'snippet-history-foo': 'foo'}});
			return naja.makeRequest('GET', '/HistoryHandler/pushStateWithoutCacheOption', null, {historyUiCache: false}).then(() => {
				mock.verify();
				mock.restore();

				document.body.removeChild(el);
			});
		});

		it('pushes snippets to state if uiCache is disabled globally but enabled via options', function () {
			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				historyHandler: HistoryHandler,
			});
			naja.historyHandler.uiCache = false;
			naja.initialize();
			cleanPopstateListener(naja.historyHandler);

			const el = document.createElement('div');
			el.id = 'snippet-history-foo';
			document.body.appendChild(el);

			const mock = sinon.mock(naja.historyHandler.historyAdapter);
			mock.expects('pushState').withExactArgs({
				href: 'http://localhost:9876/HistoryHandler/pushStateWithCache',
				title: 'new title',
				ui: {
					'snippet-history-foo': 'foo'
				},
			}, 'new title', 'http://localhost:9876/HistoryHandler/pushStateWithCache').once();

			this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {snippets: {'snippet-history-foo': 'foo'}});
			return naja.makeRequest('GET', '/HistoryHandler/pushStateWithCache', null, {historyUiCache: true}).then(() => {
				mock.verify();
				mock.restore();

				document.body.removeChild(el);
			});
		});

		it('replays request on popstate if it had uiCache disabled', () => {
			const naja = mockNaja({
				historyHandler: HistoryHandler,
			});
			naja.initialize();

			const mock = sinon.mock(naja);
			mock.expects('makeRequest').withExactArgs(
				'GET',
				'/HistoryHandler/popStateWithoutCache',
				null,
				{
					fetch: {},
					history: false,
					historyUiCache: false,
				},
			).once();

			window.dispatchEvent(createPopStateEvent({
				href: '/HistoryHandler/popStateWithoutCache',
				ui: false,
			}));

			cleanPopstateListener(naja.historyHandler);
			mock.verify();
			mock.restore();
		});
	});


	const createPopStateEvent = (state) => {
		return new PopStateEvent('popstate', {
			bubbles: true,
			cancelable: true,
			state,
		});
	};


	it('redraws snippets on popstate', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});
		naja.initialize();

		const el = document.createElement('div');
		el.id = 'snippet-history-foo';
		document.body.appendChild(el);

		window.dispatchEvent(createPopStateEvent({
			href: '/HistoryHandler/popState',
			title: 'new title',
			ui: {
				'snippet-history-foo': 'foo bar baz',
			},
		}));

		assert.equal(document.title, 'new title');
		assert.equal(el.innerHTML, 'foo bar baz');
		document.body.removeChild(el);
		cleanPopstateListener(naja.historyHandler);
	});

	it('does not trigger on initial pop', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});
		naja.initialize();

		const el = document.createElement('div');
		el.id = 'snippet-history-foo';
		el.innerHTML = 'foo';
		document.body.appendChild(el);

		const previousTitle = document.title;
		window.dispatchEvent(createPopStateEvent(null));

		assert.equal(document.title, previousTitle);
		assert.equal(el.innerHTML, 'foo');
		document.body.removeChild(el);
		cleanPopstateListener(naja.historyHandler);
	});

	it('dispatches event on popstate', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});
		naja.initialize();

		const mock = sinon.mock(naja);
		mock.expects('makeRequest')
			.withExactArgs('GET', '/HistoryHandler/popState/event', null, {
				fetch: {},
				history: false,
				historyUiCache: false,
				customOption: 42,
			})
			.once();

		const restoreCallback = sinon.spy((event) => {
			event.detail.options.customOption = 42;
		});
		naja.historyHandler.addEventListener('restoreState', restoreCallback);

		const state = {
			href: '/HistoryHandler/popState/event',
			title: 'new title',
			ui: false,
		};
		window.dispatchEvent(createPopStateEvent(state));

		assert.isTrue(restoreCallback.calledOnce);
		assert.isTrue(restoreCallback.calledWith(
			sinon.match((event) => event.constructor.name === 'CustomEvent')
			.and(sinon.match.has('detail', sinon.match.object
				.and(sinon.match.has('state', state))
				.and(sinon.match.has('options', sinon.match.object))
			))
		));

		mock.verify();
		cleanPopstateListener(naja.historyHandler);
	});

	it('cancels popstate if event.defaultPrevented', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});
		naja.initialize();

		const mock = sinon.mock(naja);
		mock.expects('makeRequest').never();

		const restoreCallback = sinon.spy((event) => event.preventDefault());
		naja.historyHandler.addEventListener('restoreState', restoreCallback);

		const state = {
			href: '/HistoryHandler/popState/event',
			title: 'new title',
			ui: false,
		};
		window.dispatchEvent(createPopStateEvent(state));

		assert.isTrue(restoreCallback.calledOnce);
		assert.isTrue(restoreCallback.calledWith(
			sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('state', state))
					.and(sinon.match.has('options', sinon.match.object))
				))
		));

		mock.verify();
		cleanPopstateListener(naja.historyHandler);
	});
});
