import jsdom from './jsdomRegister';
import {assert} from 'chai';
import sinon from 'sinon';


describe('HistoryHandler', function () {
	jsdom();

	beforeEach(function () {
		this.mockNaja = require('./setup/mockNaja').default;
		this.SnippetHandler = require('../src/core/SnippetHandler').default;
		this.HistoryHandler = require('../src/core/HistoryHandler').default;
	});

	it('constructor()', function () {
		const naja = this.mockNaja();
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

		new this.HistoryHandler(naja);
		mock.verify();
	});

	it('saves initial state', function () {
		const naja = this.mockNaja();
		const historyHandler = new this.HistoryHandler(naja);
		historyHandler.initialize();

		assert.deepEqual({
			href: 'http://example.com/',
			title: '',
			ui: {},
		}, window.history.state);

		// cleanup
		window.removeEventListener('popstate', historyHandler.popStateHandler);
	});

	it('pushes new state after successful request', function (done) {
		const naja = this.mockNaja({
			snippetHandler: this.SnippetHandler,
			historyHandler: this.HistoryHandler,
		});
		naja.initialize();

		const el = document.createElement('div');
		el.id = 'snippet-history-foo';
		document.body.appendChild(el);

		naja.makeRequest('GET', '/foo').then(() => {
			assert.equal(2, window.history.length);
			assert.deepEqual({
				href: '/foo',
				title: '',
				ui: {
					'snippet-history-foo': 'foo'
				},
			}, window.history.state);

			// cleanup
			window.removeEventListener('popstate', naja.historyHandler.popStateHandler);

			done();
		});

		this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet-history-foo': 'foo'}}));
	});

	it('replaces the state after successful request if payload.history.replace', function () {
		const naja = this.mockNaja({
			snippetHandler: this.SnippetHandler,
			historyHandler: this.HistoryHandler,
		});
		naja.initialize();

		const el = document.createElement('div');
		el.id = 'snippet-history-foo';
		document.body.appendChild(el);

		naja.makeRequest('GET', '/foo').then(() => {
			assert.equal(1, window.history.length);
			assert.deepEqual({
				href: '/foo',
				title: '',
				ui: {
					'snippet-history-foo': 'foo'
				},
			}, window.history.state);

			// cleanup
			window.removeEventListener('popstate', naja.historyHandler.popStateHandler);

			done();
		});

		this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet-history-foo': 'foo'}, history: {replace: true}}));
	});

	it('uses the url from payload if postGet is present', function (done) {
		const naja = this.mockNaja({
			snippetHandler: this.SnippetHandler,
			historyHandler: this.HistoryHandler,
		});
		naja.initialize();

		naja.makeRequest('GET', '/foo').then(() => {
			assert.equal(2, window.history.length);
			assert.deepEqual({
				href: '/bar',
				title: '',
				ui: {},
			}, window.history.state);

			// cleanup
			window.removeEventListener('popstate', naja.historyHandler.popStateHandler);

			done();
		});

		this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({url: '/bar', postGet: true}));
	});

	it('redraws snippets on popstate', function () {
		const naja = this.mockNaja({
			snippetHandler: this.SnippetHandler,
			historyHandler: this.HistoryHandler,
		});
		naja.initialize();

		const el = document.createElement('div');
		el.id = 'snippet-history-foo';
		document.body.appendChild(el);

		window.dispatchEvent(new PopStateEvent('popstate', {
			bubbles: false,
			cancelable: false,
			state: {
				href: '/qux',
				title: 'new title',
				ui: {
					'snippet-history-foo': 'foo bar baz',
				},
			},
		}));

		assert.equal(document.title, 'new title');
		assert.equal(el.innerHTML, 'foo bar baz');

		// cleanup
		window.removeEventListener('popstate', naja.historyHandler.popStateHandler);
	});

	it('does not trigger on initial pop', function () {
		const naja = this.mockNaja({
			snippetHandler: this.SnippetHandler,
			historyHandler: this.HistoryHandler,
		});
		naja.initialize();

		const el = document.createElement('div');
		el.id = 'snippet-history-foo';
		el.innerHTML = 'foo';
		document.body.appendChild(el);

		window.dispatchEvent(new PopStateEvent('popstate', {
			bubbles: false,
			cancelable: false,
			state: null,
		}));

		assert.equal(document.title, '');
		assert.equal(el.innerHTML, 'foo');

		// cleanup
		window.removeEventListener('popstate', naja.historyHandler.popStateHandler);
	});
});
