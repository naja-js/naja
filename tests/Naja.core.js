import Naja from '../src/Naja';
import mockNaja from './setup/mockNaja';
import {assert} from 'chai';
import sinon from 'sinon';


describe('Naja.js', function () {
	describe('initialize', function () {
		it('should initialize once', function () {
			const naja = mockNaja();
			assert.isFalse(naja.initialized);

			naja.initialize();
			assert.isTrue(naja.initialized);

			assert.throws(
				() => naja.initialize(),
				Error,
				'Cannot initialize Naja, it is already initialized.'
			);
		});

		it('should initialize with default options', function () {
			const naja = mockNaja();
			naja.initialize({answer: 42});
			assert.deepEqual({answer: 42}, naja.defaultOptions);
		});

		it('dispatches init event with default options', function () {
			const naja = mockNaja();

			const initCallback = sinon.spy();
			naja.addEventListener('init', initCallback);

			const defaultOptions = {answer: 42};
			naja.initialize(defaultOptions);

			assert.isTrue(initCallback.calledOnce);
			assert.isTrue(initCallback.calledWith(sinon.match.instanceOf(CustomEvent)
				.and(sinon.match.has('detail', sinon.match.object
					.and(sinon.match.has('defaultOptions', defaultOptions))
				))
			));
		});
	});

	describe('event system', function () {
		it('should call event listener', function () {
			const naja = mockNaja();
			let initCalled = false;

			naja.addEventListener('init', () => initCalled = true);
			naja.initialize();

			assert.isTrue(initCalled);
		});

		it('should not call listener after evt.stopImmediatePropagation() call', function () {
			const naja = mockNaja();
			let loadCalled = false;
			let loadCalled2 = false;

			naja.addEventListener('load', (evt) => { loadCalled = true; evt.stopImmediatePropagation(); });
			naja.addEventListener('load', () => loadCalled2 = true);
			naja.initialize();

			assert.isTrue(loadCalled);
			assert.isFalse(loadCalled2);
		});

		it('should return false after evt.preventDefault() call', function () {
			const naja = mockNaja();
			assert.isTrue(naja.fireEvent('foo'));

			naja.addEventListener('foo', (evt) => evt.preventDefault());
			assert.isFalse(naja.fireEvent('foo'));
		});
	});

	describe('extensions system', function () {
		it('registers extensions', function () {
			const naja = mockNaja();

			let initialized = false;
			const extension = class {
				constructor(naja, foo, bar) {
					initialized = true;
					assert.instanceOf(naja, Naja);
					assert.equal(42, foo);
					assert.equal('42', bar);
				}
			};

			naja.registerExtension(extension, 42, '42');
			assert.equal(1, naja.extensions.length);

			naja.initialize();
			assert.isTrue(initialized);
		});
	});
});
