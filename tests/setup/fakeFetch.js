class FetchMock {
	constructor() {
		this.expectations = [];
		this.originalFetch = window.fetch;

		window.fetch = (input, init) => {
			const request = new Request(input, init);
			const expectation = this.expectations.find((expectation) => expectation.matches(request));
			if (expectation === undefined) {
				throw new Error('Request has no configured expectation.');
			}

			return expectation.handler(request);
		};
	}

	when(...matchers) {
		const expectation = new Expectation(matchers);
		this.expectations.push(expectation);
		return expectation;
	}

	respond(status, headers, payload) {
		this.when().respond(status, headers, payload);
	}

	reject(error) {
		this.when().reject(error);
	}

	abort() {
		this.when().abort();
	}

	restore() {
		window.fetch = this.originalFetch;
	}
}

class Expectation {
	constructor(matchers) {
		this.matchers = matchers;
		this.handler = () => Promise.reject(new Error('Request has no configured handler.'));
	}

	matches(request) {
		return this.matchers.every((matcher) => matcher(request));
	}

	respond(status, headers, payload) {
		const body = new Blob([JSON.stringify(payload)]);
		const response = new Response(body, {status, headers});
		this.handler = () => Promise.resolve(response);
	}

	reject(error) {
		this.handler = () => Promise.reject(error);
	}

	abort() {
		const abortError = new Error('Request aborted');
		abortError.name = 'AbortError';
		this.handler = () => Promise.reject(abortError);
	}
}

export default () => {
	beforeEach('mock fetch()', function () {
		this.fetchMock = new FetchMock();
	});

	afterEach('restore fetch()', function () {
		this.fetchMock.restore();
	});
};
