import 'jsdom-global/register';
import {assert} from 'chai';
import sinon from 'sinon';

import Naja from '../src/Naja';
import SnippetManager from '../src/core/SnippetManager';


describe('SnippetManager', function () {
	it('registered in Naja.initialize()', function () {
		const naja = new Naja();
		naja.initialize();
		assert.instanceOf(naja.snippetManager, SnippetManager);
	});

	it('constructor()', function () {
		const naja = new Naja();
		const mock = sinon.mock(naja);
		mock.expects('addEventListener')
			.withExactArgs('success', sinon.match.instanceOf(Function))
			.once();

		new SnippetManager(naja);
		mock.verify();
	});

	it('updateSnippets()', function () {
		const naja = new Naja();
		const snippetManager = new SnippetManager(naja);

		const snippet1 = document.createElement('div');
		snippet1.id = 'snippet--foo';
		document.body.appendChild(snippet1);

		const snippet2 = document.createElement('div');
		snippet2.id = 'snippet-bar-baz';
		document.body.appendChild(snippet2);

		const mock = sinon.mock(snippetManager);
		mock.expects('updateSnippet')
			.withExactArgs(sinon.match.instanceOf(HTMLElement).and(sinon.match(value => value.id === 'snippet--foo')), 'foo')
			.once();

		mock.expects('updateSnippet')
			.withExactArgs(sinon.match.instanceOf(HTMLElement).and(sinon.match(value => value.id === 'snippet-bar-baz')), 'bar.baz')
			.once();

		snippetManager.updateSnippets({
			'snippet--foo': 'foo',
			'snippet-bar-baz': 'bar.baz',
			'snippet--qux': 'is not there',
		});

		document.body.removeChild(snippet1);
		document.body.removeChild(snippet2);
		mock.verify();
	});

	it('updateSnippet() title', function () {
		const naja = new Naja();
		const snippetManager = new SnippetManager(naja);

		const titleEl = document.createElement('title');
		titleEl.id = 'snippet--title';
		titleEl.innerHTML = 'Foo';
		document.head.appendChild(titleEl);

		assert.equal(titleEl.innerHTML, 'Foo');
		assert.equal(document.title, 'Foo');

		snippetManager.updateSnippet(titleEl, 'Bar');

		assert.equal(titleEl.innerHTML, 'Bar');
		assert.equal(document.title, 'Bar');
	});

	it('updateSnippet() [data-ajax-prepend]', function () {
		const naja = new Naja();
		const snippetManager = new SnippetManager(naja);

		const el = document.createElement('div');
		el.id = 'snippet--prepend';
		el.innerHTML = 'Foo';
		el.setAttribute('data-ajax-prepend', true);
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		snippetManager.updateSnippet(el, 'prefix-');
		assert.equal(el.innerHTML, 'prefix-Foo');
	});

	it('updateSnippet() [data-ajax-append]', function () {
		const naja = new Naja();
		const snippetManager = new SnippetManager(naja);

		const el = document.createElement('div');
		el.id = 'snippet--append';
		el.innerHTML = 'Foo';
		el.setAttribute('data-ajax-append', true);
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		snippetManager.updateSnippet(el, '-suffix');
		assert.equal(el.innerHTML, 'Foo-suffix');
	});
});
