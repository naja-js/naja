import mockNaja from './setup/mockNaja';
import fakeXhr from './setup/fakeXhr';
import {assert} from 'chai';
import sinon from 'sinon';

import ScriptLoader from '../src/core/ScriptLoader';


describe('ScriptLoader', function () {
	fakeXhr();

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

		naja.makeRequest('GET', '/ScriptLoader/loadScripts').then(() => {
			mock.verify();
			done();
		});

		this.requests.pop().respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet--foo': 'foo'}}));
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
