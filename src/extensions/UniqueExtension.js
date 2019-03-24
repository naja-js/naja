export default class UniqueExtension {
	constructor(naja) {
		naja.addEventListener('interaction', this.checkUniqueness.bind(this));
		naja.addEventListener('start', this.abortPreviousRequest.bind(this));
		naja.addEventListener('complete', this.clearRequest.bind(this));
	}


	previousAbortController = null;

	checkUniqueness(event) {
		const {element, options} = event.detail;
		options.unique = element.getAttribute('data-naja-unique') !== 'off';
	}

	abortPreviousRequest(event) {
		const {abortController, options} = event.detail;
		if (this.previousAbortController !== null && options.unique !== false) {
			this.previousAbortController.abort();
		}

		this.previousAbortController = abortController;
	}

	clearRequest() {
		this.previousAbortController = null;
	}
}
