import {mockNaja} from './setup/mockNaja';
import {assert} from 'chai';
import sinon from 'sinon';

import {UIHandler} from '../src/core/UIHandler';
import {SnippetHandler} from '../src/core/SnippetHandler';


describe('UIHandler', function () {
	beforeEach(function () {
		// a.ajax
		this.a = document.createElement('a');
		this.a.href = '/UIHandler/a';
		this.a.classList.add('ajax');
		document.body.appendChild(this.a);

		// form.ajax
		this.form = document.createElement('form');
		this.form.method = 'POST';
		this.form.action = '/UIHandler/form';
		this.form.classList.add('ajax');
		document.body.appendChild(this.form);

		// form input[type="submit"].ajax
		this.form2 = document.createElement('form');
		this.form2.action = '/UIHandler/submit';
		this.input = document.createElement('input');
		this.input.type = 'submit';
		this.input.name = 'submit';
		this.input.classList.add('ajax');
		this.form2.appendChild(this.input);
		document.body.appendChild(this.form2);

		// form input[type="image"].ajax
		this.form3 = document.createElement('form');
		this.form3.action = '/UIHandler/image';
		this.image = document.createElement('input');
		this.image.type = 'image';
		this.image.name = 'image';
		this.image.classList.add('ajax');
		this.form3.appendChild(this.image);
		document.body.appendChild(this.form3);

		// form button.ajax
		this.form4 = document.createElement('form');
		this.form4.action = '/UIHandler/defaultSubmit';
		this.submitButton = document.createElement('button');
		this.submitButton.name = 'defaultSubmit';
		this.submitButton.classList.add('ajax');
		this.form4.appendChild(this.submitButton);
		document.body.appendChild(this.form4);

		// button[form].ajax
		this.form5 = document.createElement('form');
		this.form5.action = '/UIHandler/externalSubmit';
		this.form5.id = 'externalForm';
		this.externalButton = document.createElement('button');
		this.externalButton.setAttribute('form', 'externalForm');
		this.externalButton.formAction = '/UIHandler/externalSubmitOverride';
		this.externalButton.formMethod = 'POST';
		this.externalButton.name = 'externalSubmit';
		this.externalButton.classList.add('ajax');
		document.body.appendChild(this.form5);
		document.body.appendChild(this.externalButton);
	});

	afterEach(function () {
		document.body.removeChild(this.a);
		document.body.removeChild(this.form);
		document.body.removeChild(this.form2);
		document.body.removeChild(this.form3);
		document.body.removeChild(this.form4);
		document.body.removeChild(this.form5);
		document.body.removeChild(this.externalButton);
	});

	it('constructor()', function () {
		const naja = mockNaja();
		const mock = sinon.mock(naja);
		mock.expects('addEventListener')
			.withExactArgs('init', sinon.match.instanceOf(Function))
			.once();

		new UIHandler(naja);
		mock.verify();
	});

	describe('bindUI()', function () {
		it('binds to .ajax elements by default', function () {
			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				uiHandler: UIHandler,
			});
			naja.uiHandler.handler = sinon.spy((evt) => evt.preventDefault());
			naja.initialize();

			this.a.dispatchEvent(new MouseEvent('click', {cancelable: true}));
			this.form.dispatchEvent(new SubmitEvent('submit', {cancelable: true}));

			assert.equal(naja.uiHandler.handler.callCount, 2);
		});

		it('binds to elements specified by custom selector', function () {
			const customSelectorLink = document.createElement('a');
			customSelectorLink.href = '/UIHandler/customSelector';
			customSelectorLink.setAttribute('data-naja', true);
			document.body.appendChild(customSelectorLink);

			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				uiHandler: UIHandler,
			});
			naja.uiHandler.selector = '[data-naja]';
			naja.uiHandler.handler = sinon.spy((evt) => evt.preventDefault());
			naja.initialize();

			customSelectorLink.dispatchEvent(new MouseEvent('click', {cancelable: true}));
			assert.isTrue(naja.uiHandler.handler.called);
			document.body.removeChild(customSelectorLink);
		});

		it('binds after snippet update', async function () {
			const snippetDiv = document.createElement('div');
			snippetDiv.id = 'snippet-uiHandler-snippet-bind';
			document.body.appendChild(snippetDiv);

			const naja = mockNaja({
				snippetHandler: SnippetHandler,
				uiHandler: UIHandler,
			});
			naja.uiHandler.handler = sinon.spy((evt) => evt.preventDefault());
			naja.initialize();

			await naja.snippetHandler.updateSnippets({
				'snippet-uiHandler-snippet-bind': '<a href="/UIHandler/snippetBind" class="ajax" id="uiHandler-snippet-bind">test</a>',
			});

			const a = document.getElementById('uiHandler-snippet-bind');
			a.dispatchEvent(new MouseEvent('click', {cancelable: true}));

			assert.isTrue(naja.uiHandler.handler.called);
			document.body.removeChild(snippetDiv);
		});
	});

	describe('handleUI()', function () {
		function simulateInteraction(handler, target, event) {
			target.addEventListener(event.type, (event) => {
				event.preventDefault();
				handler.handleUI(event);
			}, {once: true});

			target.dispatchEvent(event);
		}

		it('modifier keys should abort request', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.never();

			const handler = new UIHandler(naja);

			simulateInteraction(
				handler,
				this.a,
				new MouseEvent('click', {cancelable: true, button: 2}),
			);

			simulateInteraction(
				handler,
				this.a,
				new MouseEvent('click', {cancelable: true, ctrlKey: true}),
			);

			mock.verify();
		});

		it('request for a non-URL URI should not be dispatched', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.never();

			const handler = new UIHandler(naja);

			const voidLink = document.createElement('a');
			voidLink.href = 'javascript:void(0)';
			voidLink.classList.add('ajax');
			document.body.appendChild(voidLink);

			simulateInteraction(
				handler,
				voidLink,
				new MouseEvent('click', {cancelable: true}),
			);

			mock.verify();
			document.body.removeChild(voidLink);
		});

		it('request for a relative URL should be dispatched', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/UIHandler/relative', null, {fetch: {}})
				.once();

			const handler = new UIHandler(naja);

			const externalLink = document.createElement('a');
			externalLink.href = '/UIHandler/relative';
			externalLink.classList.add('ajax');
			document.body.appendChild(externalLink);

			const event = new MouseEvent('click', {cancelable: true});
			simulateInteraction(handler, externalLink, event);

			mock.verify();
			assert.isTrue(event.defaultPrevented);
			document.body.removeChild(externalLink);
		});

		it('request for an absolute URL with same origin should be dispatched', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/UIHandler/sameOrigin', null, {fetch: {}})
				.once();

			const handler = new UIHandler(naja);

			const externalLink = document.createElement('a');
			externalLink.href = 'http://localhost:9876/UIHandler/sameOrigin';
			externalLink.classList.add('ajax');
			document.body.appendChild(externalLink);

			const event = new MouseEvent('click', {cancelable: true});
			simulateInteraction(handler, externalLink, event);

			mock.verify();
			assert.isTrue(event.defaultPrevented);
			document.body.removeChild(externalLink);
		});

		it('request for an external URL with allowed origin should be dispatched', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://another-site.com/foo', null, {fetch: {}})
				.once();

			const handler = new UIHandler(naja);
			handler.allowedOrigins.push('http://another-site.com');

			const externalLink = document.createElement('a');
			externalLink.href = 'http://another-site.com/foo';
			externalLink.classList.add('ajax');
			document.body.appendChild(externalLink);

			const event = new MouseEvent('click', {cancelable: true});
			simulateInteraction(handler, externalLink, event);

			mock.verify();
			assert.isTrue(event.defaultPrevented);
			document.body.removeChild(externalLink);
		});

		it('request for a protocol-relative external URL with allowed origin should be dispatched', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://another-site.com/foo', null, {fetch: {}})
				.once();

			const handler = new UIHandler(naja);
			handler.allowedOrigins.push('http://another-site.com');

			const externalLink = document.createElement('a');
			externalLink.href = '//another-site.com/foo';
			externalLink.classList.add('ajax');
			document.body.appendChild(externalLink);

			const event = new MouseEvent('click', {cancelable: true});
			simulateInteraction(handler, externalLink, event);

			mock.verify();
			assert.isTrue(event.defaultPrevented);
			document.body.removeChild(externalLink);
		});

		it('request for an external URL with disallowed origin should not be dispatched', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.never();

			const handler = new UIHandler(naja);

			const externalLink = document.createElement('a');
			externalLink.href = 'https://google.com';
			externalLink.classList.add('ajax');
			document.body.appendChild(externalLink);

			simulateInteraction(
				handler,
				externalLink,
				new MouseEvent('click', {cancelable: true}),
			);

			mock.verify();
			document.body.removeChild(externalLink);
		});

		it('triggers interaction event', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/UIHandler/a', null, {fetch: {}})
				.once();

			const listener = sinon.spy();
			const handler = new UIHandler(naja);
			handler.addEventListener('interaction', listener);

			const event = new MouseEvent('click', {cancelable: true});
			simulateInteraction(handler, this.a, event);

			assert.isTrue(listener.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
					.and(sinon.match.has('detail', sinon.match.object
						.and(sinon.match.has('element', this.a))
						.and(sinon.match.has('originalEvent', event))
					))
			));

			mock.verify();
		});

		it('interaction event listener can abort request', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.never();

			const handler = new UIHandler(naja);
			handler.addEventListener('interaction', (evt) => evt.preventDefault());

			const event = new MouseEvent('click', {cancelable: true});
			simulateInteraction(handler, this.a, event);

			mock.verify();
		});

		it('interaction event listener can alter options', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/UIHandler/a', null, {fetch: {}, foo: 42})
				.once();

			const handler = new UIHandler(naja);
			handler.addEventListener('interaction', (event) => {
				event.detail.options.foo = 42;
			});

			simulateInteraction(
				handler,
				this.a,
				new MouseEvent('click', {cancelable: true}),
			);

			mock.verify();
		});

		it('failed request should not cause unhandled rejection', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/UIHandler/a', null, {fetch: {}})
				.once()
				.returns(Promise.reject(new Error()));

			const handler = new UIHandler(naja);

			simulateInteraction(
				handler,
				this.a,
				new MouseEvent('click', {cancelable: true}),
			);

			mock.verify();
		});

		it('a.ajax', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/UIHandler/a', null, {fetch: {}})
				.once();

			const handler = new UIHandler(naja);

			const event = new MouseEvent('click', {cancelable: true});
			simulateInteraction(handler, this.a, event);

			assert.isTrue(event.defaultPrevented);
			mock.verify();
		});

		it('form.ajax', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			mock.expects('makeRequest')
				.withExactArgs('POST', '/UIHandler/form', sinon.match.instanceOf(FormData), {fetch: {}})
				.once();

			const handler = new UIHandler(naja);

			const event = new SubmitEvent('submit', {cancelable: true});
			simulateInteraction(handler, this.form, event);

			assert.isTrue(event.defaultPrevented);
			mock.verify();
		});

		it('form input[type="submit"].ajax', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			const containsSubmit = sinon.match((value) => value.has('submit'));

			mock.expects('makeRequest')
				.withExactArgs('GET', '/UIHandler/submit', sinon.match.instanceOf(FormData).and(containsSubmit), {fetch: {}})
				.once();

			const handler = new UIHandler(naja);

			const event = new SubmitEvent('submit', {cancelable: true, submitter: this.input});
			simulateInteraction(handler, this.form2, event);

			assert.isTrue(event.defaultPrevented);
			mock.verify();
		});

		it('form input[type="image"].ajax', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			const containsImage = sinon.match((value) => value.has('image.x') && value.has('image.y'));

			mock.expects('makeRequest')
				.withExactArgs('GET', '/UIHandler/image', sinon.match.instanceOf(FormData).and(containsImage), {fetch: {}})
				.once();

			const handler = new UIHandler(naja);

			const event = new SubmitEvent('submit', {cancelable: true, submitter: this.image});
			simulateInteraction(handler, this.form3, event);

			assert.isTrue(event.defaultPrevented);
			mock.verify();
		});

		it('form button.ajax', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			const containsSubmit = sinon.match((value) => value.has('defaultSubmit'));

			mock.expects('makeRequest')
				.withExactArgs('GET', '/UIHandler/defaultSubmit', sinon.match.instanceOf(FormData).and(containsSubmit), {fetch: {}})
				.once();

			const handler = new UIHandler(naja);

			const event = new SubmitEvent('submit', {cancelable: true, submitter: this.submitButton});
			simulateInteraction(handler, this.form4, event);

			assert.isTrue(event.defaultPrevented);
			mock.verify();
		});

		it('button[form].ajax', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			const containsSubmit = sinon.match((value) => value.has('externalSubmit'));

			mock.expects('makeRequest')
				.withExactArgs('POST', '/UIHandler/externalSubmitOverride', sinon.match.instanceOf(FormData).and(containsSubmit), {fetch: {}})
				.once();

			const handler = new UIHandler(naja);

			const event = new SubmitEvent('submit', {cancelable: true, submitter: this.externalButton});
			simulateInteraction(handler, this.form5, event);

			assert.isTrue(event.defaultPrevented);
			mock.verify();
		});
	});

	describe('clickElement()', function () {
		it('dispatches request', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);

			const expectedResult = {answer: 42};

			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/UIHandler/clickElement', null, {})
				.once()
				.returns(Promise.resolve(expectedResult));

			const a = document.createElement('a');
			a.href = '/UIHandler/clickElement';

			const handler = new UIHandler(naja);
			return handler.clickElement(a)
				.then((result) => {
					assert.deepEqual(result, expectedResult);
					mock.verify();
				});
		});

		it('dispatches request on button[form]|input[form]', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);
			const expectedResult = {answer: 42};

			mock.expects('makeRequest')
				.withExactArgs('POST', '/UIHandler/submitForm', sinon.match.instanceOf(FormData), {})
				.once()
				.returns(Promise.resolve(expectedResult));

			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '/UIHandler/submitForm';
			const input = document.createElement('input');
			input.type = 'submit';
			form.appendChild(input);

			const handler = new UIHandler(naja);
			handler.clickElement(input);

			mock.verify();
		});

		it('rejects clicks on unsupported elements', function () {
			const naja = mockNaja();

			const btn = document.createElement('button');
			const handler = new UIHandler(naja);

			return handler.clickElement(btn).catch((error) => {
				assert.isOk(error); // isOk = truthy
				assert.equal('Unsupported element in clickElement(): element must be an anchor or a submitter element attached to a form.', error.message);
			});
		});

		it('triggers interaction event', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);

			mock.expects('makeRequest')
				.withExactArgs('GET', 'http://localhost:9876/UIHandler/clickElement', null, {})
				.once();

			const a = document.createElement('a');
			a.href = '/UIHandler/clickElement';

			const listener = sinon.spy();
			const handler = new UIHandler(naja);
			handler.addEventListener('interaction', listener);

			handler.clickElement(a);

			assert.isTrue(listener.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
					.and(sinon.match.has('detail', sinon.match.object
						.and(sinon.match.has('element', a))
						.and(sinon.match.has('originalEvent', undefined))
					))
			));

			mock.verify();
		});
	});

	describe('submitForm()', function () {
		it('dispatches request', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);

			const expectedResult = {answer: 42};

			mock.expects('makeRequest')
				.withExactArgs('POST', '/UIHandler/submitForm', sinon.match.instanceOf(FormData), {})
				.once()
				.returns(Promise.resolve(expectedResult));

			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '/UIHandler/submitForm';

			const handler = new UIHandler(naja);
			return handler.submitForm(form)
				.then((result) => {
					assert.deepEqual(result, expectedResult);
					mock.verify();
				});
		});

		it('dispatches request on button[form]|input[form]', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);

			const expectedResult = {answer: 42};

			mock.expects('makeRequest')
				.withExactArgs('POST', '/UIHandler/submitForm', sinon.match.instanceOf(FormData), {})
				.once()
				.returns(Promise.resolve(expectedResult));

			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '/UIHandler/submitForm';

			const submitter = document.createElement('input');
			submitter.type = 'submit';
			form.appendChild(submitter);

			const handler = new UIHandler(naja);
			return handler.submitForm(submitter)
				.then((result) => {
					assert.deepEqual(result, expectedResult);
					mock.verify();
				});
		});

		it('rejects submits of unsupported elements', function () {
			const naja = mockNaja();

			const btn = document.createElement('button');
			const handler = new UIHandler(naja);

			return handler.submitForm(btn).catch((error) => {
				assert.isOk(error); // isOk = truthy
				assert.equal('Unsupported element in submitForm(): formOrSubmitter must be either a form or a submitter element attached to a form.', error.message);
			});
		});

		it('triggers interaction event', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);

			mock.expects('makeRequest')
				.withExactArgs('POST', '/UIHandler/submitForm', sinon.match.instanceOf(FormData), {})
				.once();

			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '/UIHandler/submitForm';

			const listener = sinon.spy();
			const handler = new UIHandler(naja);
			handler.addEventListener('interaction', listener);

			handler.submitForm(form);

			assert.isTrue(listener.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
					.and(sinon.match.has('detail', sinon.match.object
						.and(sinon.match.has('element', form))
						.and(sinon.match.has('originalEvent', undefined))
					))
			));

			mock.verify();
		});
	});

	describe('processInteraction()', function () {
		it('dispatches request', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);

			const expectedResult = {answer: 42};

			mock.expects('makeRequest')
				.withExactArgs('GET', '/UIHandler/processInteraction', null, {})
				.once()
				.returns(Promise.resolve(expectedResult));

			const button = document.createElement('button');

			const handler = new UIHandler(naja);
			return handler.processInteraction(button, 'GET', '/UIHandler/processInteraction')
				.then((result) => {
					assert.deepEqual(result, expectedResult);
					mock.verify();
				});
		});

		it('triggers interaction event', function () {
			const naja = mockNaja();
			const mock = sinon.mock(naja);

			mock.expects('makeRequest')
				.withExactArgs('GET', '/UIHandler/processInteraction', null, {})
				.once();

			const button = document.createElement('button');

			const listener = sinon.spy();
			const handler = new UIHandler(naja);
			handler.addEventListener('interaction', listener);

			const event = new MouseEvent('click');

			handler.processInteraction(button, 'GET', '/UIHandler/processInteraction', null, {}, event);

			assert.isTrue(listener.calledWith(
				sinon.match((event) => event.constructor.name === 'CustomEvent')
					.and(sinon.match.has('detail', sinon.match.object
						.and(sinon.match.has('element', button))
						.and(sinon.match.has('originalEvent', event))
					))
			));

			mock.verify();
		});
	});
});
