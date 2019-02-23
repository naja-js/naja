import mockNaja from './setup/mockNaja';
import fakeXhr from './setup/fakeXhr';
import cleanPopstateListener from "./setup/cleanPopstateListener";
import {assert} from 'chai';
import sinon from 'sinon';

import SnippetHandler from '../src/core/SnippetHandler';
import HistoryHandler from '../src/core/HistoryHandler';
import UIHandler from '../src/core/UIHandler';


describe('HistoryHandler', function () {
	fakeXhr();

	it('constructor()', function () {
		const naja = mockNaja();
		const mock = sinon.mock(naja);

		mock.expects('addEventListener')
			.withExactArgs('init', sinon.match.instanceOf(Function))
			.once();

		mock.expects('addEventListener')
			.withExactArgs('interaction', sinon.match.instanceOf(Function))
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

		historyHandler.initialize();
		cleanPopstateListener(historyHandler);

		mock.verify();
		mock.restore();
	});

	it('pushes new state after successful request', function (done) {
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
			href: '/HistoryHandler/pushState',
			title: '',
			ui: {
				'snippet-history-foo': 'foo'
			},
		}, '', '/HistoryHandler/pushState').once();

		naja.makeRequest('GET', '/HistoryHandler/pushState').then(() => {
			mock.verify();
			mock.restore();

			document.body.removeChild(el);
			document.body.removeChild(ignoredEl);
			done();
		});

		this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet-history-foo': 'foo'}}));
	});

	it('replaces the state after successful request if options.history === "replace"', function (done) {
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
			href: '/HistoryHandler/replaceState',
			title: '',
			ui: {
				'snippet-history-foo': 'foo'
			},
		}, '', '/HistoryHandler/replaceState').once();

		naja.makeRequest('GET', '/HistoryHandler/replaceState', null, {history: 'replace'}).then(() => {
			mock.verify();
			mock.restore();

			document.body.removeChild(el);
			done();
		});

		this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet-history-foo': 'foo'}}));
	});

	it('replaces the state after successful request if payload.replaceHistory', function (done) {
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
			href: '/HistoryHandler/replaceState',
			title: '',
			ui: {
				'snippet-history-foo': 'foo'
			},
		}, '', '/HistoryHandler/replaceState').once();

		naja.makeRequest('GET', '/HistoryHandler/replaceState').then(() => {
			mock.verify();
			mock.restore();

			document.body.removeChild(el);
			done();
		});

		this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet-history-foo': 'foo'}, replaceHistory: true}));
	});

	it('uses the url from payload if postGet is present', function (done) {
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

		naja.makeRequest('GET', '/HistoryHandler/postGet').then(() => {
			mock.verify();
			mock.restore();
			done();
		});

		this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({url: '/HistoryHandler/postGet/targetUrl', postGet: true}));
	});

	it('does not alter the history if options.history === false', function (done) {
		const naja = mockNaja({
			snipperHandler: SnippetHandler,
			historyHandler: HistoryHandler,
		});
		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const mock = sinon.mock(naja.historyHandler.historyAdapter);
		mock.expects('pushState').never();
		mock.expects('replaceState').never();

		naja.makeRequest('GET', '/HistoryHandler/disabled', null, {history: false}).then(() => {
			mock.verify();
			mock.restore();
			done();
		});

		this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet-history-foo': 'foo'}}));
	});

	describe('configures mode properly on interaction', function () {
		it('missing data-naja-history', () => {
			const naja = mockNaja();
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

			new UIHandler(naja).clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('does not override naja.defaultOptions.history', function () {
			const naja = mockNaja();
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

			new UIHandler(naja).clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('data-naja-history=replace', () => {
			const naja = mockNaja();
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

			new UIHandler(naja).clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('data-naja-history=off', () => {
			const naja = mockNaja();
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

			new UIHandler(naja).clickElement(link);

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

			historyHandler.initialize();
			cleanPopstateListener(historyHandler);

			mock.verify();
			mock.restore();
		});

		it('does not push snippets to state if uiCache is disabled globally', function (done) {
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
				href: '/HistoryHandler/pushStateWithoutCache',
				ui: false,
			}, 'new title', '/HistoryHandler/pushStateWithoutCache').once();

			naja.makeRequest('GET', '/HistoryHandler/pushStateWithoutCache').then(() => {
				mock.verify();
				mock.restore();

				document.body.removeChild(el);
				done();
			});

			this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet-history-foo': 'foo'}}));
		});

		it('does not push snippets to state if uiCache is enabled globally but disabled via options', function (done) {
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
				href: '/HistoryHandler/pushStateWithoutCacheOption',
				ui: false,
			}, 'new title', '/HistoryHandler/pushStateWithoutCacheOption').once();

			naja.makeRequest('GET', '/HistoryHandler/pushStateWithoutCacheOption', null, {historyUiCache: false}).then(() => {
				mock.verify();
				mock.restore();

				document.body.removeChild(el);
				done();
			});

			this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet-history-foo': 'foo'}}));
		});

		it('pushes snippets to state if uiCache is disabled globally but enabled via options', function (done) {
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
				href: '/HistoryHandler/pushStateWithCache',
				title: 'new title',
				ui: {
					'snippet-history-foo': 'foo'
				},
			}, 'new title', '/HistoryHandler/pushStateWithCache').once();

			naja.makeRequest('GET', '/HistoryHandler/pushStateWithCache', null, {historyUiCache: true}).then(() => {
				mock.verify();
				mock.restore();

				document.body.removeChild(el);
				done();
			});

			this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet-history-foo': 'foo'}}));
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
		if (typeof(PopStateEvent) === 'function') {
			return new PopStateEvent('popstate', {
				bubbles: true,
				cancelable: true,
				state,
			});

		} else {
			// https://msdn.microsoft.com/en-us/library/dn705473(v=vs.85).aspx
			const event = document.createEvent('PopStateEvent');
			event.initPopStateEvent('popstate', true, true, state);
			return event;
		}
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
});
