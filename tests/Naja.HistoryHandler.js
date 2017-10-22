import mockNaja from './setup/mockNaja';
import fakeXhr from './setup/fakeXhr';
import cleanPopstateListener from "./setup/cleanPopstateListener";
import {assert} from 'chai';
import sinon from 'sinon';

import SnippetHandler from '../src/core/SnippetHandler';
import HistoryHandler from '../src/core/HistoryHandler';


describe('HistoryHandler', function () {
	fakeXhr();

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

		initPopStateEvent
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
