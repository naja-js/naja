import {mockNaja} from './setup/mockNaja';
import {fakeFetch} from './setup/fakeFetch';
import {assert} from 'chai';
import sinon from 'sinon';

import {ScriptLoader} from '../src/core/ScriptLoader';


describe('ScriptLoader', function () {
	fakeFetch();

	it('constructor()', function () {
		const naja = mockNaja();
		const mock = sinon.mock(naja);

		mock.expects('addEventListener')
			.withExactArgs('init', sinon.match.instanceOf(Function))
			.once();

		new ScriptLoader(naja);
		mock.verify();
	});

	it('loads scripts in snippets', function () {
		const naja = mockNaja();
		const scriptLoader = new ScriptLoader(naja);
		naja.initialize();

		const mock = sinon.mock(scriptLoader);
		mock.expects('loadScripts')
			.withExactArgs({'snippet--foo': 'foo'})
			.once();

		this.fetchMock.respond(200, {'Content-Type': 'application/json'}, {snippets: {'snippet--foo': 'foo'}});
		return naja.makeRequest('GET', '/ScriptLoader/loadScripts').then(() => {
			mock.verify();
		});
	});

	it('loadScripts()', function () {
		const naja = mockNaja();
		const scriptLoader = new ScriptLoader(naja);

		const el = document.createElement('div');
		el.id = 'snippet--bar';
		document.body.appendChild(el);

		window.SCRIPT_LOADED = false;

		const snippets = {
			'snippet--foo': 'foo',
			'snippet--bar': 'foo <script type="text/javascript">window.SCRIPT_LOADED = true;</script> bar',
		};

		scriptLoader.loadScripts(snippets);
		assert.isTrue(window.SCRIPT_LOADED);
		document.body.removeChild(el);
	});

	it('deduplicates scripts by id', function() {
		const script = document.createElement('script');
		script.setAttribute('data-naja-script-id', 'initial');
		document.body.appendChild(script);

		const naja = mockNaja();
		const scriptLoader = new ScriptLoader(naja);
		naja.initialize();

		const foo = document.createElement('div');
		foo.id = 'snippet--foo';
		document.body.appendChild(foo);

		const bar = document.createElement('div');
		bar.id = 'snippet--bar';
		document.body.appendChild(bar);

		const baz = document.createElement('div');
		baz.id = 'snippet--baz';
		document.body.appendChild(baz);

		window.SCRIPT_COUNTER = 0;
		window.DEDUPE_COUNTER = 0;
		window.INITIAL_COUNTER = 0;

		const snippets = {
			'snippet--foo': 'foo <script type="text/javascript">window.SCRIPT_COUNTER++;</script> bar',
			'snippet--bar': 'foo <script type="text/javascript" data-naja-script-id="dedupe">window.DEDUPE_COUNTER++;</script> bar',
			'snippet--baz': 'foo <script type="text/javascript" data-naja-script-id="initial">window.INITIAL_COUNTER++;</script> bar',
		};

		scriptLoader.loadScripts(snippets);
		scriptLoader.loadScripts(snippets);

		assert.strictEqual(window.SCRIPT_COUNTER, 2);
		assert.strictEqual(window.DEDUPE_COUNTER, 1);
		assert.strictEqual(window.INITIAL_COUNTER, 0);
		document.body.removeChild(script);
		document.body.removeChild(foo);
		document.body.removeChild(bar);
		document.body.removeChild(baz);
	});
});
