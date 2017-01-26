import './jsdomRegister';
import {assert} from 'chai';
import sinon from 'sinon';

import Naja from '../src/Naja';
import FormsHandler from '../src/core/FormsHandler';


describe('FormsHandler', function () {
	it('registered in Naja.initialize()', function () {
		const naja = new Naja();
		naja.initialize();
		assert.instanceOf(naja.formsHandler, FormsHandler);
	});

	it('constructor()', function () {
		const naja = new Naja();
		const mock = sinon.mock(naja);

		mock.expects('addEventListener')
			.withExactArgs('load', sinon.match.instanceOf(Function))
			.once();

		mock.expects('addEventListener')
			.withExactArgs('interaction', sinon.match.instanceOf(Function))
			.once();

		new FormsHandler(naja);
		mock.verify();
	});

	it('initializes nette-forms', function () {
		const initForm = sinon.spy();
		window.Nette = {initForm};

		const form1 = document.createElement('form');
		const form2 = document.createElement('form');
		document.body.appendChild(form1);
		document.body.appendChild(form2);

		const naja = new Naja();
		new FormsHandler(naja);
		naja.load();

		assert.equal(initForm.callCount, 2);

		document.body.removeChild(form1);
		document.body.removeChild(form2);

		window.Nette = undefined;
	});

	it('processes form', function () {
		window.Nette = {validateForm: () => false};

		const form = document.createElement('form');
		const element = document.createElement('input');
		form.appendChild(element);

		const originalEvent = {
			stopImmediatePropagation: sinon.spy(),
			preventDefault: sinon.spy(),
		};

		const evt = {
			element,
			originalEvent,
			preventDefault: sinon.spy(),
		};

		FormsHandler.processForm(evt);

		assert.equal(element, element.form['nette-submittedBy']);
		assert.isTrue(originalEvent.stopImmediatePropagation.called);
		assert.isTrue(originalEvent.preventDefault.called);
		assert.isTrue(evt.preventDefault.called);

		window.Nette = undefined;
	});
});
