import './jsdomRegister';
import {assert} from 'chai';
import sinon from 'sinon';

import Naja from '../src/Naja';
import SnippetHandler from '../src/core/SnippetHandler';


describe('SnippetHandler', function () {
	it('registered in Naja.initialize()', function () {
		const naja = new Naja();
		naja.initialize();
		assert.instanceOf(naja.snippetHandler, SnippetHandler);
	});

	it('constructor()', function () {
		const naja = new Naja();
		const mock = sinon.mock(naja);
		mock.expects('addEventListener')
			.withExactArgs('success', sinon.match.instanceOf(Function))
			.once();

		new SnippetHandler(naja);
		mock.verify();
	});

	it('reads snippets from response', function (done) {
		const xhr = sinon.useFakeXMLHttpRequest();
		global.window.XMLHttpRequest = window.XMLHttpRequest = XMLHttpRequest;
		const requests = [];
		xhr.onCreate = requests.push.bind(requests);

		const naja = new Naja();
		const snippetHandler = new SnippetHandler(naja);

		const mock = sinon.mock(snippetHandler);
		mock.expects('updateSnippets')
			.withExactArgs({'snippet--foo': 'foo'})
			.once();

		naja.makeRequest('GET', '/foo').then(() => {
			mock.verify();
			xhr.restore();
			done();
		});

		requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet--foo': 'foo'}}));
	});

	it('updateSnippets()', function () {
		const naja = new Naja();
		const snippetHandler = new SnippetHandler(naja);

		const snippet1 = document.createElement('div');
		snippet1.id = 'snippet--foo';
		document.body.appendChild(snippet1);

		const snippet2 = document.createElement('div');
		snippet2.id = 'snippet-bar-baz';
		document.body.appendChild(snippet2);

		const mock = sinon.mock(snippetHandler);
		mock.expects('updateSnippet')
			.withExactArgs(sinon.match.instanceOf(HTMLElement).and(sinon.match(value => value.id === 'snippet--foo')), 'foo')
			.once();

		mock.expects('updateSnippet')
			.withExactArgs(sinon.match.instanceOf(HTMLElement).and(sinon.match(value => value.id === 'snippet-bar-baz')), 'bar.baz')
			.once();

		snippetHandler.updateSnippets({
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
		const snippetHandler = new SnippetHandler(naja);

		const titleEl = document.createElement('title');
		titleEl.id = 'snippet--title';
		titleEl.innerHTML = 'Foo';
		document.head.appendChild(titleEl);

		assert.equal(titleEl.innerHTML, 'Foo');
		assert.equal(document.title, 'Foo');

		snippetHandler.updateSnippet(titleEl, 'Bar');

		assert.equal(titleEl.innerHTML, 'Bar');
		assert.equal(document.title, 'Bar');
	});

	it('updateSnippet() [data-ajax-prepend]', function () {
		const naja = new Naja();
		const snippetHandler = new SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--prepend';
		el.innerHTML = 'Foo';
		el.setAttribute('data-ajax-prepend', true);
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		snippetHandler.updateSnippet(el, 'prefix-');
		assert.equal(el.innerHTML, 'prefix-Foo');
	});

	it('updateSnippet() [data-ajax-append]', function () {
		const naja = new Naja();
		const snippetHandler = new SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--append';
		el.innerHTML = 'Foo';
		el.setAttribute('data-ajax-append', true);
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		snippetHandler.updateSnippet(el, '-suffix');
		assert.equal(el.innerHTML, 'Foo-suffix');
	});
});
