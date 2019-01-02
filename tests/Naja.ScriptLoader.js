import mockNaja from './setup/mockNaja';
import fakeFetch from './setup/fakeFetch';
import {assert} from 'chai';
import sinon from 'sinon';

import ScriptLoader from '../src/core/ScriptLoader';


describe('ScriptLoader', function () {
	fakeFetch();

	it('constructor()', function () {
		const naja = mockNaja();
		const mock = sinon.mock(naja);

		mock.expects('addEventListener')
			.withExactArgs('success', sinon.match.instanceOf(Function))
			.once();

		new ScriptLoader(naja);
		mock.verify();
	});

	it('loads scripts in snippets', function () {
		const naja = mockNaja();
		const scriptLoader = new ScriptLoader(naja);

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

		const snippets = {
			'snippet--foo': 'foo',
			'snippet--bar': 'foo <script type="text/javascript">window.SCRIPT_LOADED = true;</script> bar',
		};

		scriptLoader.loadScripts(snippets);
		assert.isTrue(window.SCRIPT_LOADED);
		document.body.removeChild(el);
	});
});
