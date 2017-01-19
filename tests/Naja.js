import Naja from '../src/Naja';
import {assert} from 'chai';


describe('Naja.js', () => {
	it('should initialize once', done => {
		const naja = new Naja();
		let thrown = false;
		assert.isFalse(naja.initialized);

		naja.initialize();
		assert.isTrue(naja.initialized);

		try {
			naja.initialize();

		} catch (e) {
			assert.instanceOf(e, Error);
			assert.equal(e.message, "Cannot initialize Naja, it is already initialized.");
			thrown = true;
		}

		assert.isTrue(thrown);

		done();
	});

	describe('event system', () => {
		it('should call event listener', done => {
			const naja = new Naja();
			let initCalled = false;

			naja.addEventListener('init', evt => initCalled = true);
			naja.initialize();

			assert.isTrue(initCalled);

			done();
		});

		it('should not call listener after evt.stopImmediatePropagation() call', done => {
			const naja = new Naja();
			let loadCalled = false;
			let loadCalled2 = false;

			naja.addEventListener('load', evt => { loadCalled = true; evt.stopImmediatePropagation(); });
			naja.addEventListener('load', evt => loadCalled2 = true);
			naja.initialize();

			assert.isTrue(loadCalled);
			assert.isFalse(loadCalled2);

			done();
		});

		it('should return false after evt.preventDefault() call', done => {
			const naja = new Naja();
			assert.isTrue(naja.fireEvent('foo'));

			naja.addEventListener('foo', evt => evt.preventDefault());
			assert.isFalse(naja.fireEvent('foo'));

			done();
		});
	});
});
