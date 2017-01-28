import jsdom from './jsdomRegister';
import {assert} from 'chai';
import sinon from 'sinon';


describe('FormsHandler', function () {
	jsdom();

	beforeEach(function (done) {
		this.Naja = require('../src/Naja').default;
		this.FormsHandler = require('../src/core/FormsHandler').default;
		done();
	});

	it('registered in Naja.initialize()', function () {
		const naja = new this.Naja();
		naja.initialize();
		assert.instanceOf(naja.formsHandler, this.FormsHandler);
	});

	it('constructor()', function () {
		const naja = new this.Naja();
		const mock = sinon.mock(naja);

		mock.expects('addEventListener')
			.withExactArgs('load', sinon.match.instanceOf(Function))
			.once();

		mock.expects('addEventListener')
			.withExactArgs('interaction', sinon.match.instanceOf(Function))
			.once();

		new this.FormsHandler(naja);
		mock.verify();
	});

	it('initializes nette-forms', function () {
		const initForm = sinon.spy();
		window.Nette = {initForm};

		const form1 = document.createElement('form');
		const form2 = document.createElement('form');
		document.body.appendChild(form1);
		document.body.appendChild(form2);

		const naja = new this.Naja();
		new this.FormsHandler(naja);
		naja.load();

		assert.equal(initForm.callCount, 2);
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

		this.FormsHandler.processForm(evt);

		assert.equal(element, element.form['nette-submittedBy']);
		assert.isTrue(originalEvent.stopImmediatePropagation.called);
		assert.isTrue(originalEvent.preventDefault.called);
		assert.isTrue(evt.preventDefault.called);
	});
});
