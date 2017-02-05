export default class UniqueExtension {
	constructor(naja) {
		naja.addEventListener('interaction', this.checkUniqueness.bind(this));
		naja.addEventListener('before', this.abortPreviousRequest.bind(this));
		naja.addEventListener('complete', this.clearRequest.bind(this));
	}


	xhr = null;

	checkUniqueness({element, options}) {
		options.unique = element.getAttribute('data-naja-unique') !== 'off';
	}

	abortPreviousRequest({xhr, options}) {
		if (!!this.xhr && options.unique !== false) {
			this.xhr.abort();
		}

		this.xhr = xhr;
	}

	clearRequest() {
		this.xhr = null;
	}
}
