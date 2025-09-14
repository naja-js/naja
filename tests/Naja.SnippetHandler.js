import {mockNaja} from './setup/mockNaja';
import {fakeFetch} from './setup/fakeFetch';
import {assert} from 'chai';
import sinon from 'sinon';

import {SnippetHandler} from '../src/core/SnippetHandler';


describe('SnippetHandler', function () {
	fakeFetch();

	it('constructor()', function () {
		const naja = mockNaja();
		const mock = sinon.mock(naja);
		mock.expects('addEventListener')
			.withExactArgs('success', sinon.match.instanceOf(Function))
			.once();

		new SnippetHandler(naja);
		mock.verify();
	});

	it('reads snippets from response', function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const mock = sinon.mock(snippetHandler);
		mock.expects('updateSnippets')
			.withExactArgs({'snippet--foo': 'foo'}, false, sinon.match.object)
			.once();

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {snippets: {'snippet--foo': 'foo'}});
		return naja.makeRequest('GET', '/SnippetHandler/updateSnippets').then(() => {
			mock.verify();
		});
	});

	it('updateSnippets()', async function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const snippet1 = document.createElement('div');
		snippet1.id = 'snippet--foo';
		document.body.appendChild(snippet1);

		const snippet2 = document.createElement('div');
		snippet2.id = 'snippet-bar-baz';
		document.body.appendChild(snippet2);

		const mock = sinon.mock(snippetHandler);
		mock.expects('updateSnippet')
			.withExactArgs(snippet1, 'foo', false, {})
			.once();

		mock.expects('updateSnippet')
			.withExactArgs(snippet2, 'bar.baz', false, {})
			.once();

		await snippetHandler.updateSnippets({
			'snippet--foo': 'foo',
			'snippet-bar-baz': 'bar.baz',
			'snippet--qux': 'is not there',
		});

		mock.verify();
		document.body.removeChild(snippet1);
		document.body.removeChild(snippet2);
	});

	it('updateSnippet', async function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--qux';
		el.innerHTML = 'Foo';
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		await snippetHandler.updateSnippet(el, 'Bar', false, {});
		assert.equal(el.innerHTML, 'Bar');
		document.body.removeChild(el);
	});

	it('updateSnippet() title', async function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		let titleEl = document.querySelector('title');
		if ( ! titleEl) {
			titleEl = document.createElement('title');
			document.head.appendChild(titleEl);
		}

		titleEl.id = 'snippet--title';
		titleEl.innerHTML = 'Foo';

		assert.equal(titleEl.innerHTML, 'Foo');
		assert.equal(document.title, 'Foo');

		await snippetHandler.updateSnippet(titleEl, 'Bar', false, {});

		assert.equal(titleEl.innerHTML, 'Bar');
		assert.equal(document.title, 'Bar');
	});

	it('updateSnippet() [data-ajax-prepend]', async function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--prepend';
		el.innerHTML = 'Foo';
		el.setAttribute('data-ajax-prepend', true);
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		await snippetHandler.updateSnippet(el, 'prefix-', false, {});
		assert.equal(el.innerHTML, 'prefix-Foo');
		document.body.removeChild(el);
	});

	it('updateSnippet() [data-ajax-append]', async function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--append';
		el.innerHTML = 'Foo';
		el.setAttribute('data-ajax-append', true);
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		await snippetHandler.updateSnippet(el, '-suffix', false, {});
		assert.equal(el.innerHTML, 'Foo-suffix');
		document.body.removeChild(el);
	});

	it('updateSnippet() fromCache', async function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--append';
		el.innerHTML = 'Foo';
		el.setAttribute('data-ajax-append', true);
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		await snippetHandler.updateSnippet(el, 'new content', true, {});
		assert.equal(el.innerHTML, 'new content');
		document.body.removeChild(el);
	});

	it('updateSnippet() events', async function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const beforeCallback = sinon.spy();
		const pendingCallback = sinon.spy();
		const afterCallback = sinon.spy();
		snippetHandler.addEventListener('beforeUpdate', beforeCallback);
		snippetHandler.addEventListener('pendingUpdate', pendingCallback);
		snippetHandler.addEventListener('afterUpdate', afterCallback);

		const el = document.createElement('div');
		el.id = 'snippet--foo';
		el.innerHTML = 'Foo';
		document.body.appendChild(el);
		await snippetHandler.updateSnippet(el, 'Bar', false, {});

		assert.isTrue(beforeCallback.calledOnce);
		assert.isTrue(beforeCallback.calledWith(
			sinon.match((event) => event.constructor.name === 'CustomEvent')
			.and(sinon.match.has('detail', sinon.match.object
				.and(sinon.match.has('snippet', el))
				.and(sinon.match.has('content', sinon.match.string))
				.and(sinon.match.has('fromCache', false))
				.and(sinon.match.has('operation', snippetHandler.op.replace))
				.and(sinon.match.has('options', {}))
			))
		));

		assert.isTrue(pendingCallback.calledOnce);
		assert.isTrue(pendingCallback.calledAfter(beforeCallback));
		assert.isTrue(pendingCallback.calledWith(
			sinon.match((event) => event.constructor.name === 'CustomEvent')
			.and(sinon.match.has('detail', sinon.match.object
				.and(sinon.match.has('snippet', el))
				.and(sinon.match.has('content', sinon.match.string))
				.and(sinon.match.has('fromCache', false))
				.and(sinon.match.has('operation', snippetHandler.op.replace))
				.and(sinon.match.has('options', {}))
			))
		));

		assert.isTrue(afterCallback.calledOnce);
		assert.isTrue(afterCallback.calledAfter(pendingCallback));
		assert.isTrue(afterCallback.calledWith(
			sinon.match((event) => event.constructor.name === 'CustomEvent')
			.and(sinon.match.has('detail', sinon.match.object
				.and(sinon.match.has('snippet', el))
				.and(sinon.match.has('content', sinon.match.string))
				.and(sinon.match.has('fromCache', false))
				.and(sinon.match.has('operation', snippetHandler.op.replace))
				.and(sinon.match.has('options', {}))
			))
		));

		document.body.removeChild(el);
	});

	it('updateSnippet() beforeUpdate event can cancel the update', async function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const beforeCallback = sinon.spy((evt) => evt.preventDefault());
		const pendingCallback = sinon.spy();
		const afterCallback = sinon.spy();
		snippetHandler.addEventListener('beforeUpdate', beforeCallback);
		snippetHandler.addEventListener('pendingUpdate', pendingCallback);
		snippetHandler.addEventListener('afterUpdate', afterCallback);

		const el = document.createElement('div');
		el.id = 'snippet--foo';
		el.innerHTML = 'Foo';
		document.body.appendChild(el);
		await snippetHandler.updateSnippet(el, 'Bar', true, {});

		assert.isTrue(beforeCallback.calledOnce);
		assert.isTrue(beforeCallback.calledWith(
			sinon.match((event) => event.constructor.name === 'CustomEvent')
			.and(sinon.match.has('detail', sinon.match.object
				.and(sinon.match.has('snippet', el))
				.and(sinon.match.has('content', sinon.match.string))
				.and(sinon.match.has('fromCache', true))
				.and(sinon.match.has('options', {}))
			))
		));

		assert.isFalse(pendingCallback.called);
		assert.isFalse(afterCallback.called);

		assert.equal(el.innerHTML, 'Foo');
		document.body.removeChild(el);
	});

	it('updateSnippet() beforeUpdate event can change the operation', async function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const operation = sinon.spy();
		snippetHandler.addEventListener('beforeUpdate', (evt) => evt.detail.changeOperation(operation));

		const el = document.createElement('div');
		el.id = 'snippet--foo';
		el.innerHTML = 'Foo';
		document.body.appendChild(el);
		await snippetHandler.updateSnippet(el, 'Bar', false, {});

		assert.isTrue(operation.calledOnce);
		assert.isTrue(operation.calledWith(el, 'Bar'));

		document.body.removeChild(el);
	});

	it('updateSnippet() is synchronous when possible', async function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const afterCallback = sinon.spy();
		snippetHandler.addEventListener('afterUpdate', afterCallback);

		const el1 = document.createElement('div');
		el1.id = 'snippet--foo';
		el1.innerHTML = 'Foo';
		document.body.appendChild(el1);

		const el2 = document.createElement('div');
		el2.id = 'snippet--bar';
		el2.innerHTML = 'Bar';
		document.body.appendChild(el2);

		snippetHandler.addEventListener('beforeUpdate', (event) => {
			// make el1 update async
			if (event.detail.snippet === el1) {
				event.detail.changeOperation((snippet, content) => Promise.resolve(content));
			}
		});

		await snippetHandler.updateSnippets({
			'snippet--foo': 'updated Foo',
			'snippet--bar': 'updated Bar',
		});

		assert.isTrue(afterCallback.calledTwice);

		assert.isTrue(afterCallback.firstCall.calledWith(
			sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object.and(
					sinon.match.has('snippet', el2),
				))),
		));

		assert.isTrue(afterCallback.secondCall.calledWith(
			sinon.match((event) => event.constructor.name === 'CustomEvent')
				.and(sinon.match.has('detail', sinon.match.object.and(
					sinon.match.has('snippet', el1),
				))),
		));

		document.body.removeChild(el1);
		document.body.removeChild(el2);
	});
});
