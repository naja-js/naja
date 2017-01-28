import jsdom from './jsdomRegister';
import {assert} from 'chai';
import sinon from 'sinon';


describe('ScriptLoader', function () {
	jsdom();

	beforeEach(function (done) {
		this.Naja = require('../src/Naja').default;
		this.ScriptLoader = require('../src/core/ScriptLoader').default;
		done();
	});

	it('registered in Naja.initialize()', function () {
		const naja = new this.Naja();
		naja.initialize();
		assert.instanceOf(naja.scriptLoader, this.ScriptLoader);
	});

	it('constructor()', function () {
		const naja = new this.Naja();
		const mock = sinon.mock(naja);

		mock.expects('addEventListener')
			.withExactArgs('success', sinon.match.instanceOf(Function))
			.once();

		new this.ScriptLoader(naja);
		mock.verify();
	});

	it('loads scripts in snippets', function () {
		const naja = new this.Naja();
		const scriptLoader = new this.ScriptLoader(naja);

		const mock = sinon.mock(scriptLoader);
		mock.expects('loadScripts')
			.withExactArgs({'snippet--foo': 'foo'})
			.once();

		naja.makeRequest('GET', '/foo').then(() => {
			mock.verify();
			done();
		});

		this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({snippets: {'snippet--foo': 'foo'}}));
	});

	it('loadScripts()', function () {
		const naja = new this.Naja();
		const scriptLoader = new this.ScriptLoader(naja);

		const el = document.createElement('div');
		el.id = 'snippet--bar';
		document.body.appendChild(el);

		const snippets = {
			'snippet--foo': 'foo',
			'snippet--bar': 'foo <script>window.SCRIPT_LOADED = true;</script> bar',
		};

		scriptLoader.loadScripts(snippets);
		assert.isTrue(window.SCRIPT_LOADED);
	});
});
