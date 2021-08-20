import {mockNaja} from './setup/mockNaja';
import {fakeFetch} from './setup/fakeFetch';
import {cleanPopstateListener} from './setup/cleanPopstateListener';
import {createPopstateEvent} from './setup/createPopstateEvent';
import {assert} from 'chai';
import sinon from 'sinon';

import {SnippetHandler} from '../src/core/SnippetHandler';
import {HistoryHandler} from '../src/core/HistoryHandler';
import {UIHandler} from '../src/core/UIHandler';
import {SnippetCache} from '../src/core/SnippetCache';


const TEST_STORAGE_TYPE = 'test';
class TestSnippetCacheStorage {
	constructor(snippets = {}) {
		this.type = TEST_STORAGE_TYPE;
		this.snippets = snippets;
	}
	store(snippets) {
		this.snippets = snippets;
		return 'key';
	}
	fetch() {
		return this.snippets;
	}
}

describe('SnippetCache', function () {
	fakeFetch();

	it('stores snippets in storage on buildState', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
			snippetCache: SnippetCache,
		});

		const testStorage = new TestSnippetCacheStorage();
		naja.snippetCache.storages[TEST_STORAGE_TYPE] = testStorage;

		naja.initialize();
		cleanPopstateListener(naja.historyHandler);

		const historyAdapterMock = sinon.mock(naja.historyHandler.historyAdapter);
		historyAdapterMock.expects('pushState').withExactArgs({
			href: 'http://localhost:9876/SnippetCache/store',
			snippets: {
				storage: TEST_STORAGE_TYPE,
				key: 'key',
			},
		}, '', 'http://localhost:9876/SnippetCache/store').once();

		const el = document.createElement('div');
		el.id = 'snippet-cache-foo';
		document.body.appendChild(el);

		const ignoredEl = document.createElement('div');
		ignoredEl.id = 'snippet-cache-bar';
		ignoredEl.setAttribute('data-naja-snippet-cache', 'off');
		document.body.appendChild(ignoredEl);

		const bcIgnoredEl = document.createElement('div');
		bcIgnoredEl.id = 'snippet-cache-baz';
		bcIgnoredEl.setAttribute('data-naja-history-nocache', true);
		document.body.appendChild(bcIgnoredEl);

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {snippets: {'snippet-cache-foo': 'foo'}});
		return naja.makeRequest('GET', '/SnippetCache/store', null, {snippetCache: TEST_STORAGE_TYPE}).then(() => {
			assert.deepEqual(testStorage.snippets, {'snippet-cache-foo': 'foo'});
			historyAdapterMock.verify();
			historyAdapterMock.restore();

			document.body.removeChild(el);
			document.body.removeChild(ignoredEl);
			document.body.removeChild(bcIgnoredEl);
		});
	});

	it('restores snippets from storage on restoreState', function () {
		const naja = mockNaja({
			snippetHandler: SnippetHandler,
			historyHandler: HistoryHandler,
			snippetCache: SnippetCache,
		});

		const testStorage = new TestSnippetCacheStorage({
			'snippet-cache-foo': 'foo',
		});
		naja.snippetCache.storages[TEST_STORAGE_TYPE] = testStorage;

		naja.initialize();

		const el = document.createElement('div');
		el.id = 'snippet-cache-foo';
		document.body.appendChild(el);

		window.dispatchEvent(createPopstateEvent({
			href: '/snippetCache/restore',
			snippets: {
				storage: TEST_STORAGE_TYPE,
				key: null,
			},
		}));

		assert.equal(el.innerHTML, 'foo');

		document.body.removeChild(el);
		cleanPopstateListener(naja.historyHandler);
	});

	describe('storages', function () {
		it('off', function () {
			const naja = mockNaja();
			const snippetCache = new SnippetCache(naja);

			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', '/SnippetCache/OffStorage', null, {history: false, snippetCache: false})
				.once();

			const storage = snippetCache.storages.off;

			const key = storage.store({'snippet-cache-foo': 'foo'});
			assert.isNull(key);

			const data = storage.fetch(key, {href: '/SnippetCache/OffStorage'});
			assert.isNull(data);
			mock.verify();
			mock.restore();
		});

		it('history', function () {
			const naja = mockNaja();
			const snippetCache = new SnippetCache(naja);

			const storage = snippetCache.storages.history;

			const key = storage.store({'snippet-cache-foo': 'foo'});
			assert.deepEqual(key, {'snippet-cache-foo': 'foo'});

			const data = storage.fetch(key);
			assert.deepEqual(data, {'snippet-cache-foo': 'foo'});
		});

		it('session', function () {
			const naja = mockNaja();
			const snippetCache = new SnippetCache(naja);

			const storage = snippetCache.storages.session;

			const key = storage.store({'snippet-cache-foo': 'foo'});
			assert.typeOf(key, 'string');

			const storageItem = window.sessionStorage.getItem(key);
			assert.equal(storageItem, '{"snippet-cache-foo":"foo"}');

			const data = storage.fetch(key);
			assert.deepEqual(data, {'snippet-cache-foo': 'foo'});
		});
	});

	describe('configures storage on interaction', function () {
		it('missing data-naja-snippet-cache', function () {
			const naja = mockNaja({uiHandler: UIHandler});
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/foo', null, {/* snippetCache: undefined */})
				.once();

			// initialize snippet cache
			new SnippetCache(naja);

			const link = document.createElement('a');
			link.href = '/foo';
			link.classList.add('ajax');
			document.body.appendChild(link);

			naja.uiHandler.clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('data-naja-snippet-cache=off', function () {
			const naja = mockNaja({uiHandler: UIHandler});
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/foo', null, {snippetCache: 'off'})
				.once();

			// initialize snippet cache
			new SnippetCache(naja);

			const link = document.createElement('a');
			link.href = '/foo';
			link.classList.add('ajax');
			link.setAttribute('data-naja-snippet-cache', 'off');
			document.body.appendChild(link);

			naja.uiHandler.clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('data-naja-snippet-cache=session', function () {
			const naja = mockNaja({uiHandler: UIHandler});
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/foo', null, {snippetCache: 'session'})
				.once();

			// initialize snippet cache
			new SnippetCache(naja);

			const link = document.createElement('a');
			link.href = '/foo';
			link.classList.add('ajax');
			link.setAttribute('data-naja-snippet-cache', 'session');
			document.body.appendChild(link);

			naja.uiHandler.clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});

		it('is backward-compatible with data-naja-history-cache', function () {
			const naja = mockNaja({uiHandler: UIHandler});
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/foo', null, {snippetCache: 'off'})
				.once();

			// initialize snippet cache
			new SnippetCache(naja);

			const link = document.createElement('a');
			link.href = '/foo';
			link.classList.add('ajax');
			link.setAttribute('data-naja-history-cache', 'off');
			document.body.appendChild(link);

			naja.uiHandler.clickElement(link);

			mock.verify();
			document.body.removeChild(link);
		});
	});

	describe('event system', function () {
		it('dispatches event on store', function () {
			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				historyHandler: HistoryHandler,
				snippetCache: SnippetCache,
			});

			const testStorage = new TestSnippetCacheStorage();
			naja.snippetCache.storages[TEST_STORAGE_TYPE] = testStorage;

			naja.initialize();
			cleanPopstateListener(naja.historyHandler);
			sinon.stub(naja.historyHandler.historyAdapter);

			const el = document.createElement('div');
			el.id = 'snippet-cache-foo';
			document.body.appendChild(el);

			const storeCallback = sinon.spy();
			naja.snippetCache.addEventListener('store', storeCallback);

			this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {snippets: {'snippet-cache-foo': 'foo'}});
			return naja.makeRequest('GET', '/SnippetCache/storeEvent', null, {snippetCache: TEST_STORAGE_TYPE}).then(() => {
				assert.isTrue(storeCallback.calledOnce);
				assert.isTrue(storeCallback.calledWith(
					sinon.match((event) => event.constructor.name === 'CustomEvent')
						.and(sinon.match.has('detail', sinon.match.object
							.and(sinon.match.has('snippets', {'snippet-cache-foo': 'foo'}))
							.and(sinon.match.has('state', {href: 'http://localhost:9876/SnippetCache/storeEvent', snippets: {storage: TEST_STORAGE_TYPE, key: 'key'}}))
							.and(sinon.match.has('options', {snippetCache: TEST_STORAGE_TYPE, fetch: {}}))
						))
				));

				assert.deepEqual(testStorage.snippets, {'snippet-cache-foo': 'foo'});

				document.body.removeChild(el);
			});
		});

		it('preventing store event cancels storing snippets', function () {
			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				historyHandler: HistoryHandler,
				snippetCache: SnippetCache,
			});

			const testStorage = new TestSnippetCacheStorage();
			naja.snippetCache.storages[TEST_STORAGE_TYPE] = testStorage;

			naja.initialize();
			cleanPopstateListener(naja.historyHandler);
			sinon.stub(naja.historyHandler.historyAdapter);

			const storeCallback = sinon.spy((evt) => evt.preventDefault());
			naja.snippetCache.addEventListener('store', storeCallback);

			this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {});
			return naja.makeRequest('GET', '/SnippetCache/storeEventCancel', null, {snippetCache: TEST_STORAGE_TYPE}).then(() => {
				assert.isTrue(storeCallback.calledOnce);
				assert.deepEqual(testStorage.snippets, {});
			});
		});

		it('dispatches events on restore', function () {
			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				historyHandler: HistoryHandler,
				snippetCache: SnippetCache,
			});

			const testStorage = new TestSnippetCacheStorage({
				'snippet-cache-foo': 'foo',
			});
			naja.snippetCache.storages[TEST_STORAGE_TYPE] = testStorage;

			naja.initialize();

			const fetchCallback = sinon.spy();
			const restoreCallback = sinon.spy();
			naja.snippetCache.addEventListener('fetch', fetchCallback);
			naja.snippetCache.addEventListener('restore', restoreCallback);

			const el = document.createElement('div');
			el.id = 'snippet-cache-foo';
			document.body.appendChild(el);

			const state = {
				href: '/snippetCache/restoreEvents',
				snippets: {
					storage: TEST_STORAGE_TYPE,
					key: null,
				},
			};
			window.dispatchEvent(createPopstateEvent(state));

			assert.isTrue(fetchCallback.calledOnce);
			assert.isTrue(fetchCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
					.and(sinon.match.has('detail', sinon.match.object
						.and(sinon.match.has('state', state))
						.and(sinon.match.has('options', sinon.match.object))
					))
			));

			assert.isTrue(restoreCallback.calledOnce);
			assert.isTrue(restoreCallback.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
					.and(sinon.match.has('detail', sinon.match.object
						.and(sinon.match.has('snippets', {'snippet-cache-foo': 'foo'}))
						.and(sinon.match.has('state', state))
						.and(sinon.match.has('options', sinon.match.object))
					))
			));

			document.body.removeChild(el);
			cleanPopstateListener(naja.historyHandler);
		});

		it('preventing fetch event cancels restoring snippets', function () {
			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				historyHandler: HistoryHandler,
				snippetCache: SnippetCache,
			});

			const testStorage = new TestSnippetCacheStorage({
				'snippet-cache-foo': 'foo',
			});
			naja.snippetCache.storages[TEST_STORAGE_TYPE] = testStorage;

			naja.initialize();

			const fetchCallback = sinon.spy((evt) => evt.preventDefault());
			const restoreCallback = sinon.spy();
			naja.snippetCache.addEventListener('fetch', fetchCallback);
			naja.snippetCache.addEventListener('restore', restoreCallback);

			const el = document.createElement('div');
			el.id = 'snippet-cache-foo';
			document.body.appendChild(el);

			const state = {
				href: '/snippetCache/fetchEventCancel',
				snippets: {
					storage: TEST_STORAGE_TYPE,
					key: null,
				},
			};
			window.dispatchEvent(createPopstateEvent(state));

			assert.isTrue(fetchCallback.calledOnce);
			assert.isTrue(restoreCallback.notCalled);
			assert.equal(el.innerHTML, '');

			document.body.removeChild(el);
			cleanPopstateListener(naja.historyHandler);
		});

		it('preventing restore event cancels restoring snippets', function () {
			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				historyHandler: HistoryHandler,
				snippetCache: SnippetCache,
			});

			const testStorage = new TestSnippetCacheStorage({
				'snippet-cache-foo': 'foo',
			});
			naja.snippetCache.storages[TEST_STORAGE_TYPE] = testStorage;

			naja.initialize();

			const restoreCallback = sinon.spy((evt) => evt.preventDefault());
			naja.snippetCache.addEventListener('restore', restoreCallback);

			const el = document.createElement('div');
			el.id = 'snippet-cache-foo';
			document.body.appendChild(el);

			const state = {
				href: '/snippetCache/restoreEventCancel',
				snippets: {
					storage: TEST_STORAGE_TYPE,
					key: null,
				},
			};
			window.dispatchEvent(createPopstateEvent(state));

			assert.isTrue(restoreCallback.calledOnce);
			assert.equal(el.innerHTML, '');

			document.body.removeChild(el);
			cleanPopstateListener(naja.historyHandler);
		});
	});
});
