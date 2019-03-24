import mockNaja from './setup/mockNaja';
import fakeFetch from './setup/fakeFetch';
import {assert} from 'chai';
import sinon from 'sinon';

import SnippetHandler from '../src/core/SnippetHandler';


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
			.withExactArgs({'snippet--foo': 'foo'})
			.once();

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {snippets: {'snippet--foo': 'foo'}});
		return naja.makeRequest('GET', '/SnippetHandler/updateSnippets').then(() => {
			mock.verify();
		});
	});

	it('updateSnippets()', function () {
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
			.withExactArgs(snippet1, 'foo', false)
			.once();

		mock.expects('updateSnippet')
			.withExactArgs(snippet2, 'bar.baz', false)
			.once();

		snippetHandler.updateSnippets({
			'snippet--foo': 'foo',
			'snippet-bar-baz': 'bar.baz',
			'snippet--qux': 'is not there',
		});

		mock.verify();
		document.body.removeChild(snippet1);
		document.body.removeChild(snippet2);
	});

	it('updateSnippet', function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--qux';
		el.innerHTML = 'Foo';
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		snippetHandler.updateSnippet(el, 'Bar');
		assert.equal(el.innerHTML, 'Bar');
		document.body.removeChild(el);
	});

	it('updateSnippet() title', function () {
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

		snippetHandler.updateSnippet(titleEl, 'Bar');

		assert.equal(titleEl.innerHTML, 'Bar');
		assert.equal(document.title, 'Bar');
	});

	it('updateSnippet() [data-ajax-prepend]', function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--prepend';
		el.innerHTML = 'Foo';
		el.setAttribute('data-ajax-prepend', true);
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		snippetHandler.updateSnippet(el, 'prefix-');
		assert.equal(el.innerHTML, 'prefix-Foo');
		document.body.removeChild(el);
	});

	it('updateSnippet() [data-ajax-append]', function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--append';
		el.innerHTML = 'Foo';
		el.setAttribute('data-ajax-append', true);
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		snippetHandler.updateSnippet(el, '-suffix');
		assert.equal(el.innerHTML, 'Foo-suffix');
		document.body.removeChild(el);
	});

	it('updateSnippet() forceReplace', function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--append';
		el.innerHTML = 'Foo';
		el.setAttribute('data-ajax-append', true);
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		snippetHandler.updateSnippet(el, 'new content', true);
		assert.equal(el.innerHTML, 'new content');
		document.body.removeChild(el);
	});

	it('updateSnippet() events', function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const beforeCallback = sinon.spy();
		const afterCallback = sinon.spy();
		snippetHandler.addEventListener('beforeUpdate', beforeCallback);
		snippetHandler.addEventListener('afterUpdate', afterCallback);

		const el = document.createElement('div');
		el.id = 'snippet--foo';
		el.innerHTML = 'Foo';
		document.body.appendChild(el);
		snippetHandler.updateSnippet(el, 'Bar');

		assert.isTrue(beforeCallback.calledOnce);
		assert.isTrue(beforeCallback.calledWith(sinon.match.instanceOf(CustomEvent)
			.and(sinon.match.has('detail', sinon.match.object
				.and(sinon.match.has('snippet', el))
				.and(sinon.match.has('content', sinon.match.string))
			))
		));

		assert.isTrue(afterCallback.calledOnce);
		assert.isTrue(afterCallback.calledAfter(beforeCallback));
		assert.isTrue(beforeCallback.calledWith(sinon.match.instanceOf(CustomEvent)
			.and(sinon.match.has('detail', sinon.match.object
				.and(sinon.match.has('snippet', el))
				.and(sinon.match.has('content', sinon.match.string))
			))
		));

		document.body.removeChild(el);
	});

	it('updateSnippet() beforeUpdate event can cancel the update', function () {
		const naja = mockNaja();
		const snippetHandler = new SnippetHandler(naja);

		const beforeCallback = sinon.spy((evt) => evt.preventDefault());
		const afterCallback = sinon.spy();
		snippetHandler.addEventListener('beforeUpdate', beforeCallback);
		snippetHandler.addEventListener('afterUpdate', afterCallback);

		const el = document.createElement('div');
		el.id = 'snippet--foo';
		el.innerHTML = 'Foo';
		document.body.appendChild(el);
		snippetHandler.updateSnippet(el, 'Bar');

		assert.isTrue(beforeCallback.calledOnce);
		assert.isTrue(beforeCallback.calledWith(sinon.match.instanceOf(CustomEvent)
			.and(sinon.match.has('detail', sinon.match.object
				.and(sinon.match.has('snippet', el))
				.and(sinon.match.has('content', sinon.match.string))
			))
		));

		assert.isFalse(afterCallback.called);

		assert.equal(el.innerHTML, 'Foo');
		document.body.removeChild(el);
	});
});
