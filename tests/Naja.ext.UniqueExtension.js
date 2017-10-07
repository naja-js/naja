import mockNaja from './setup/mockNaja';
import fakeXhr from './setup/fakeXhr';
import {assert} from 'chai';

import UniqueExtension from '../src/extensions/UniqueExtension';


describe('UniqueExtension', function () {
	fakeXhr();

	it('aborts previous request', function () {
		const naja = mockNaja();
		new UniqueExtension(naja);

		naja.makeRequest('GET', '/UniqueExtension/enabled/first');
		naja.makeRequest('GET', '/UniqueExtension/enabled/second');

		assert.isTrue(this.requests[0].aborted);
	});

	it('does not abort request if disabled', function (done) {
		const naja = mockNaja();
		new UniqueExtension(naja);

		naja.makeRequest('GET', '/UniqueExtension/disabled/first').then(() => {
			done();
		});

		naja.makeRequest('GET', '/UniqueExtension/disabled/second', null, {unique: false});

		this.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({answer: 42}));
	});
});
