import jsdom from './jsdomRegister';
import {assert} from 'chai';
import sinon from 'sinon';


describe('UIHandler', function () {
	jsdom();

	beforeEach(function (done) {
		this.Naja = require('../src/Naja').default;
		this.UIHandler = require('../src/core/UIHandler').default;

		// a.ajax
		this.a = document.createElement('a');
		this.a.href = '/foo';
		this.a.classList.add('ajax');
		document.body.appendChild(this.a);

		// form.ajax
		this.form = document.createElement('form');
		this.form.method = 'POST';
		this.form.action = '/bar';
		this.form.classList.add('ajax');
		document.body.appendChild(this.form);

		// form input[type="submit"].ajax
		const form2 = document.createElement('form');
		form2.action = '/baz';
		this.input = document.createElement('input');
		this.input.type = 'submit';
		this.input.name = 'submit';
		this.input.classList.add('ajax');
		form2.appendChild(this.input);
		document.body.appendChild(form2);

		// form input[type="image"].ajax
		const form3 = document.createElement('form');
		form3.action = '/qux';
		this.image = document.createElement('input');
		this.image.type = 'image';
		this.image.name = 'image';
		this.image.classList.add('ajax');
		form3.appendChild(this.image);
		document.body.appendChild(form3);

		done();
	});

	it('registered in Naja.initialize()', function () {
		const naja = new this.Naja();
		naja.initialize();
		assert.instanceOf(naja.uiHandler, this.UIHandler);
	});

	it('constructor()', function () {
		const naja = new this.Naja();
		const mock = sinon.mock(naja);
		mock.expects('addEventListener')
			.withExactArgs('load', sinon.match.instanceOf(Function))
			.once();

		new this.UIHandler(naja);
		mock.verify();
	});

	it('bindUI()', function () {
		const spy = sinon.spy();

		const handler = new this.UIHandler(new this.Naja());
		handler.bindUI(spy);

		this.a.dispatchEvent(new Event('click'));
		this.form.dispatchEvent(new Event('submit'));
		this.input.dispatchEvent(new Event('click'));

		assert.isTrue(spy.calledThrice);
	});

	describe('handleUI()', function () {
		it('modifier keys should abort request', function () {
			const naja = new this.Naja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.never();

			const handler = new this.UIHandler(naja);

			const evt = {
				type: 'click',
				target: this.a,
				button: 2,
			};
			handler.handleUI(evt);

			const evt2 = {
				type: 'click',
				target: this.a,
				ctrlKey: true,
			};
			handler.handleUI(evt2);

			mock.verify();
		});

		it('triggers interaction event', function () {
			const naja = new this.Naja();
			const listener = sinon.spy();
			naja.addEventListener('interaction', listener);

			const handler = new this.UIHandler(naja);

			const evt = {
				type: 'click',
				target: this.a,
				preventDefault: () => true,
			};
			handler.handleUI(evt);

			assert.isTrue(listener.calledWithMatch(sinon.match.object
				.and(sinon.match.has('element', this.a))
				.and(sinon.match.has('originalEvent', evt))
			));
		});

		it('interaction event listener can abort request', function () {
			const naja = new this.Naja();
			naja.addEventListener('interaction', evt => evt.preventDefault());

			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.never();

			const handler = new this.UIHandler(naja);

			const evt = {
				type: 'click',
				target: this.a,
			};
			handler.handleUI(evt);

			mock.verify();
		});

		it('a.ajax', function () {
			const naja = new this.Naja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://example.com/foo', null)
				.once();

			const handler = new this.UIHandler(naja);

			const preventDefault = sinon.spy();
			const evt = {
				type: 'click',
				target: this.a,
				preventDefault,
			};
			handler.handleUI(evt);

			assert.isTrue(preventDefault.called);
			mock.verify();
		});

		it('form.ajax', function () {
			const naja = new this.Naja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('POST', 'http://example.com/bar', sinon.match.instanceOf(FormData))
				.once();

			const handler = new this.UIHandler(naja);

			const preventDefault = sinon.spy();
			const evt = {
				type: 'submit',
				target: this.form,
				preventDefault,
			};
			handler.handleUI(evt);

			assert.isTrue(preventDefault.called);
			mock.verify();
		});

		it('form input[type="submit"].ajax', function () {
			const naja = new this.Naja();
			const mock = sinon.mock(naja);
			const containsSubmit = sinon.match(value => value.has('submit'), 'contains submit');
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://example.com/baz', sinon.match.instanceOf(FormData).and(containsSubmit))
				.once();

			const handler = new this.UIHandler(naja);

			const preventDefault = sinon.spy();
			const evt = {
				type: 'click',
				target: this.input,
				preventDefault,
			};
			handler.handleUI(evt);

			assert.isTrue(preventDefault.called);
			mock.verify();
		});

		it('form input[type="image"].ajax', function () {
			const naja = new this.Naja();
			const mock = sinon.mock(naja);
			const containsImage = sinon.match(value => value.has('image.x') && value.has('image.y'), 'contains image');
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://example.com/qux', sinon.match.instanceOf(FormData).and(containsImage))
				.once();

			const handler = new this.UIHandler(naja);

			const preventDefault = sinon.spy();
			const evt = {
				type: 'click',
				target: this.image,
				preventDefault,
			};
			handler.handleUI(evt);

			assert.isTrue(preventDefault.called);
			mock.verify();
		});
	});
});
