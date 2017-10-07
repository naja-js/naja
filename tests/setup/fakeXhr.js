import sinon from 'sinon';


export default () => {
	beforeEach(function () {
		this.requests = [];
		this.xhr = sinon.useFakeXMLHttpRequest();
		this.xhr.onCreate = (request) => this.requests.push(request);
	});

	afterEach(function () {
		this.xhr.restore();
	});
};
