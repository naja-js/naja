import jsdom from './jsdomRegister';
import {assert} from 'chai';
import sinon from 'sinon';


describe('UIHandler', function () {
	jsdom();

	beforeEach(function () {
		this.mockNaja = require('./setup/mockNaja').default;
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
	});

	it('constructor()', function () {
		const naja = this.mockNaja();
		const mock = sinon.mock(naja);
		mock.expects('addEventListener')
			.withExactArgs('load', sinon.match.instanceOf(Function))
			.once();

		new this.UIHandler(naja);
		mock.verify();
	});

	describe('bindUI()', function () {
		it('binds to .ajax elements by default', function () {
			const spy = sinon.spy();
			this.input.form.addEventListener('submit', (evt) => evt.preventDefault());

			const handler = new this.UIHandler(this.mockNaja());
			handler.bindUI(spy);

			this.a.dispatchEvent(new Event('click'));
			this.form.dispatchEvent(new Event('submit'));
			this.input.dispatchEvent(new Event('click'));

			assert.isTrue(spy.calledThrice);
		});

		it('binds to elements specified by custom selector', function () {
			const customSelectorLink = document.createElement('a');
			customSelectorLink.href = '/foo';
			customSelectorLink.dataset.naja = true;
			document.body.appendChild(customSelectorLink);

			const spy = sinon.spy();
			const handler = new this.UIHandler(this.mockNaja());
			handler.selector = '[data-naja]';
			handler.bindUI(spy);

			customSelectorLink.dispatchEvent(new Event('click'));
			assert.isTrue(spy.called);
		});
	});

	describe('handleUI()', function () {
		it('modifier keys should abort request', function () {
			const naja = this.mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.never();

			const handler = new this.UIHandler(naja);

			const evt = {
				type: 'click',
				currentTarget: this.a,
				button: 2,
			};
			handler.handleUI(evt);

			const evt2 = {
				type: 'click',
				currentTarget: this.a,
				ctrlKey: true,
			};
			handler.handleUI(evt2);

			mock.verify();
		});

		it('triggers interaction event', function () {
			const naja = this.mockNaja();
			const listener = sinon.spy();
			naja.addEventListener('interaction', listener);

			const handler = new this.UIHandler(naja);

			const evt = {
				type: 'click',
				currentTarget: this.a,
				preventDefault: () => true,
			};
			handler.handleUI(evt);

			assert.isTrue(listener.calledWithMatch(sinon.match.object
				.and(sinon.match.has('element', this.a))
				.and(sinon.match.has('originalEvent', evt))
			));
		});

		it('interaction event listener can abort request', function () {
			const naja = this.mockNaja();
			naja.addEventListener('interaction', evt => evt.preventDefault());

			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.never();

			const handler = new this.UIHandler(naja);

			const evt = {
				type: 'click',
				currentTarget: this.a,
			};
			handler.handleUI(evt);

			mock.verify();
		});

		it('interaction event listener can alter options', function () {
			const naja = this.mockNaja();
			naja.addEventListener('interaction', ({options}) => {
				options.foo = 42;
			});

			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://example.com/foo', null, {foo: 42})
				.once();

			const handler = new this.UIHandler(naja);

			const evt = {
				type: 'click',
				currentTarget: this.a,
				preventDefault: () => true,
			};
			handler.handleUI(evt);

			mock.verify();
		});

		it('a.ajax', function () {
			const naja = this.mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://example.com/foo', null, {})
				.once();

			const handler = new this.UIHandler(naja);

			const preventDefault = sinon.spy();
			const evt = {
				type: 'click',
				currentTarget: this.a,
				preventDefault,
			};
			handler.handleUI(evt);

			assert.isTrue(preventDefault.called);
			mock.verify();
		});

		it('form.ajax', function () {
			const naja = this.mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('POST', 'http://example.com/bar', sinon.match.instanceOf(FormData), {})
				.once();

			const handler = new this.UIHandler(naja);

			const preventDefault = sinon.spy();
			const evt = {
				type: 'submit',
				currentTarget: this.form,
				preventDefault,
			};
			handler.handleUI(evt);

			assert.isTrue(preventDefault.called);
			mock.verify();
		});

		it('form input[type="submit"].ajax', function () {
			const naja = this.mockNaja();
			const mock = sinon.mock(naja);
			const containsSubmit = sinon.match(value => value.has('submit'), 'contains submit');
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://example.com/baz', sinon.match.instanceOf(FormData).and(containsSubmit), {})
				.once();

			const handler = new this.UIHandler(naja);

			const preventDefault = sinon.spy();
			const evt = {
				type: 'click',
				currentTarget: this.input,
				preventDefault,
			};
			handler.handleUI(evt);

			assert.isTrue(preventDefault.called);
			mock.verify();
		});

		it('form input[type="image"].ajax', function () {
			const naja = this.mockNaja();
			const mock = sinon.mock(naja);
			const containsImage = sinon.match(value => value.has('image.x') && value.has('image.y'), 'contains image');
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://example.com/qux', sinon.match.instanceOf(FormData).and(containsImage), {})
				.once();

			const handler = new this.UIHandler(naja);

			const preventDefault = sinon.spy();
			const evt = {
				type: 'click',
				currentTarget: this.image,
				preventDefault,
			};
			handler.handleUI(evt);

			assert.isTrue(preventDefault.called);
			mock.verify();
		});
	});
});
