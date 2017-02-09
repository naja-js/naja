import jsdom from './jsdomRegister';
import {assert} from 'chai';
import sinon from 'sinon';


describe('SnippetHandler', function () {
	jsdom();

	beforeEach(function (done) {
		this.Naja = require('../src/Naja').default;
		this.SnippetHandler = require('../src/core/SnippetHandler').default;
		done();
	});

	it('registered in Naja.initialize()', function () {
		const naja = new this.Naja();
		naja.initialize();
		assert.instanceOf(naja.snippetHandler, this.SnippetHandler);
	});

	it('constructor()', function () {
		const naja = new this.Naja();
		const mock = sinon.mock(naja);
		mock.expects('addEventListener')
			.withExactArgs('success', sinon.match.instanceOf(Function))
			.once();

		new this.SnippetHandler(naja);
		mock.verify();
	});

	it('reads snippets from response', function (done) {
		const naja = new this.Naja();
		const snippetHandler = new this.SnippetHandler(naja);

		const mock = sinon.mock(snippetHandler);
		mock.expects('updateSnippets')
			.withExactArgs({'snippet--foo': 'foo'})
			.once();

		naja.makeRequest('GET', '/foo').then(() => {
			mock.verify();
			done();
		});

		this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet--foo': 'foo'}}));
	});

	it('updateSnippets()', function () {
		const naja = new this.Naja();
		const snippetHandler = new this.SnippetHandler(naja);

		const snippet1 = document.createElement('div');
		snippet1.id = 'snippet--foo';
		document.body.appendChild(snippet1);

		const snippet2 = document.createElement('div');
		snippet2.id = 'snippet-bar-baz';
		document.body.appendChild(snippet2);

		const mock = sinon.mock(snippetHandler);
		mock.expects('updateSnippet')
			.withExactArgs(sinon.match.instanceOf(HTMLElement).and(sinon.match(value => value.id === 'snippet--foo')), 'foo', false)
			.once();

		mock.expects('updateSnippet')
			.withExactArgs(sinon.match.instanceOf(HTMLElement).and(sinon.match(value => value.id === 'snippet-bar-baz')), 'bar.baz', false)
			.once();

		snippetHandler.updateSnippets({
			'snippet--foo': 'foo',
			'snippet-bar-baz': 'bar.baz',
			'snippet--qux': 'is not there',
		});

		mock.verify();
	});

	it('updateSnippet', function () {
		const naja = new this.Naja();
		const snippetHandler = new this.SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--qux';
		el.innerHTML = 'Foo';
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		snippetHandler.updateSnippet(el, 'Bar');
		assert.equal(el.innerHTML, 'Bar');
	});

	it('updateSnippet() title', function () {
		const naja = new this.Naja();
		const snippetHandler = new this.SnippetHandler(naja);

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
		const naja = new this.Naja();
		const snippetHandler = new this.SnippetHandler(naja);

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
		const naja = new this.Naja();
		const snippetHandler = new this.SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--append';
		el.innerHTML = 'Foo';
		el.setAttribute('data-ajax-append', true);
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		snippetHandler.updateSnippet(el, '-suffix');
		assert.equal(el.innerHTML, 'Foo-suffix');
	});

	it('updateSnippet() forceReplace', function () {
		const naja = new this.Naja();
		const snippetHandler = new this.SnippetHandler(naja);

		const el = document.createElement('div');
		el.id = 'snippet--append';
		el.innerHTML = 'Foo';
		el.setAttribute('data-ajax-append', true);
		document.body.appendChild(el);

		assert.equal(el.innerHTML, 'Foo');
		snippetHandler.updateSnippet(el, 'new content', true);
		assert.equal(el.innerHTML, 'new content');
	});
});
