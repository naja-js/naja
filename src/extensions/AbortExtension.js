export default class AbortExtension {
	constructor(naja) {
		naja.addEventListener('init', this.initialize.bind(this));
		naja.addEventListener('interaction', this.checkAbortable.bind(this));
		naja.addEventListener('before', this.checkAbortable.bind(this));
		naja.addEventListener('start', this.saveAbortController.bind(this));
		naja.addEventListener('complete', this.clearAbortController.bind(this));
	}


	abortable = true;
	abortController = null;
	initialize() {
		document.addEventListener('keydown', (evt) => {
			if (this.abortController !== null
				&& ('key' in evt ? evt.key === 'Escape' : evt.keyCode === 27)
				&& !(evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey)
				&& this.abortable
			) {
				this.abortController.abort();
				this.abortController = null;
			}
		});
	}

	checkAbortable({element, options}) {
		this.abortable = element
			? element.getAttribute('data-naja-abort') !== 'off'
			: options.abort !== false;

		// propagate to options if called in interaction event
		options.abort = this.abortable;
	}

	saveAbortController({abortController}) {
		this.abortController = abortController;
	}

	clearAbortController() {
		this.abortController = null;
		this.abortable = true;
	}
}
