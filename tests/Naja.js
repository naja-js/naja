import Naja from '../src/Naja';
import {assert} from 'chai';


describe('Naja.js', function () {
	it('initialization', function (done) {
		const naja = new Naja();
		assert.isFalse(naja.initialized);

		naja.initialize();
		assert.isTrue(naja.initialized);

		try {
			naja.initialize();

		} catch (e) {
			assert.instanceOf(e, Error);
			assert.equal(e.message, "Cannot initialize Naja, it is already initialized.");
		}

		done();
	});
});
