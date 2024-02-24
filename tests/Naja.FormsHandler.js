import {mockNaja} from './setup/mockNaja';
import {assert} from 'chai';
import netteForms from 'nette-forms';
import sinon from 'sinon';

import {FormsHandler} from '../src/core/FormsHandler';
import {SnippetHandler} from '../src/core/SnippetHandler';
import {UIHandler} from '../src/core/UIHandler';


describe('FormsHandler', function () {
	before(function (done ) {
		const netteForms = document.createElement('script');
		netteForms.src = 'https://unpkg.com/nette-forms/src/assets/netteForms.js';
		netteForms.onload = () => done();

		document.body.appendChild(netteForms);
	});

	it('constructor()', function () {
		const naja = mockNaja();
		const mock = sinon.mock(naja);

		mock.expects('addEventListener')
			.withExactArgs('init', sinon.match.instanceOf(Function))
			.once();

		new FormsHandler(naja);
		mock.verify();
	});

	it('initializes nette-forms', function () {
		sinon.spy(window.Nette, 'initForm');

		const form1 = document.createElement('form');
		const form2 = document.createElement('form');
		document.body.appendChild(form1);
		document.body.appendChild(form2);

		const naja = mockNaja({
			formsHandler: FormsHandler,
			snippetHandler: SnippetHandler,
			uiHandler: UIHandler,
		});
		naja.initialize();

		assert.equal(window.Nette.initForm.callCount, 2);
		window.Nette.initForm.restore();

		document.body.removeChild(form1);
		document.body.removeChild(form2);
	});

	it('initializes on snippet update', async function () {
		sinon.spy(window.Nette, 'initForm');

		const snippetDiv = document.createElement('div');
		snippetDiv.id = 'snippet-formsHandler-snippet-init';
		document.body.appendChild(snippetDiv);

		const naja = mockNaja({
			formsHandler: FormsHandler,
			snippetHandler: SnippetHandler,
			uiHandler: UIHandler,
		});
		naja.initialize();

		await naja.snippetHandler.updateSnippets({
			'snippet-formsHandler-snippet-init': '<form><input type="hidden" name="test"></form>',
		});

		assert.isTrue(window.Nette.initForm.calledOnce);
		window.Nette.initForm.restore();

		document.body.removeChild(snippetDiv);
	});

	it('processes form', function () {
		const mock = sinon.mock(window.Nette);
		mock.expects('validateForm').once().returns(false);

		const form = document.createElement('form');
		const element = document.createElement('input');
		form.appendChild(element);

		const originalEvent = {
			stopImmediatePropagation: sinon.spy(),
			preventDefault: sinon.spy(),
		};

		const evt = new CustomEvent('interaction', {
			detail: {
				element,
				originalEvent,
			},
		});

		sinon.spy(evt, 'preventDefault');

		const naja = mockNaja();
		const formsHandler = new FormsHandler(naja);
		formsHandler.processForm(evt);

		assert.equal(element, element.form['nette-submittedBy']);
		assert.isTrue(originalEvent.stopImmediatePropagation.called);
		assert.isTrue(originalEvent.preventDefault.called);
		assert.isTrue(evt.preventDefault.called);

		mock.verify();
		mock.restore();
	});

	it('does not process non-form interactions', function () {
		const mock = sinon.mock(window.Nette);
		mock.expects('validateForm').never();

		const element = document.createElement('a');

		const originalEvent = {
			stopImmediatePropagation: sinon.spy(),
			preventDefault: sinon.spy(),
		};

		const evt = new CustomEvent('interaction', {
			detail: {
				element,
				originalEvent,
			},
		});

		sinon.spy(evt, 'preventDefault');

		const naja = mockNaja();
		const formsHandler = new FormsHandler(naja);
		formsHandler.processForm(evt);

		assert.isUndefined(element.form);
		assert.isFalse(originalEvent.stopImmediatePropagation.called);
		assert.isFalse(originalEvent.preventDefault.called);
		assert.isFalse(evt.preventDefault.called);

		mock.verify();
		mock.restore();
	});

	it('accepts local netteForms reference', () => {
		sinon.spy(window.Nette, 'initForm');
		const mock = sinon.mock(netteForms);
		mock.expects('initForm').once();
		mock.expects('validateForm').once().returns(false);

		const form = document.createElement('form');
		const element = document.createElement('input');
		form.appendChild(element);
		document.body.appendChild(form);

		const naja = mockNaja({
			formsHandler: FormsHandler,
			snippetHandler: SnippetHandler,
			uiHandler: UIHandler,
		});
		naja.formsHandler.netteForms = netteForms;
		naja.initialize();

		assert.equal(window.Nette.initForm.callCount, 0);

		const originalEvent = {
			stopImmediatePropagation: sinon.spy(),
			preventDefault: sinon.spy(),
		};

		const evt = new CustomEvent('interaction', {
			detail: {
				element,
				originalEvent,
			},
		});

		sinon.spy(evt, 'preventDefault');

		naja.formsHandler.processForm(evt);

		assert.equal(element, element.form['nette-submittedBy']);
		assert.isTrue(originalEvent.stopImmediatePropagation.called);
		assert.isTrue(originalEvent.preventDefault.called);
		assert.isTrue(evt.preventDefault.called);

		mock.verify();
		mock.restore();

		document.body.removeChild(form);
	});
});
