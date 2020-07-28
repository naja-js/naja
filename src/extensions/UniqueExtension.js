export class UniqueExtension {
	initialize(naja) {
		naja.uiHandler.addEventListener('interaction', this.checkUniqueness.bind(this));
		naja.addEventListener('start', this.abortPreviousRequest.bind(this));
		naja.addEventListener('complete', this.clearRequest.bind(this));
	}


	abortControllers = new Map();

	checkUniqueness(event) {
		const {element, options} = event.detail;
		const unique = element.getAttribute('data-naja-unique') ?? element.form?.getAttribute('data-naja-unique');
		options.unique = unique === 'off' ? false : unique ?? 'default';
	}

	abortPreviousRequest(event) {
		const {abortController, options} = event.detail;
		if (options.unique !== false) {
			this.abortControllers.get(options.unique)?.abort();
			this.abortControllers.set(options.unique, abortController);
		}
	}

	clearRequest(event) {
		const {options} = event.detail;
		this.abortControllers.delete(options.unique);
	}
}
