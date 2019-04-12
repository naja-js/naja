export class AbortExtension {
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
		document.addEventListener('keydown', (event) => {
			if (this.abortController !== null
				&& ('key' in event ? event.key === 'Escape' : event.keyCode === 27)
				&& !(event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)
				&& this.abortable
			) {
				this.abortController.abort();
				this.abortController = null;
			}
		});
	}

	checkAbortable(event) {
		const {element, options} = event.detail;
		this.abortable = element
			? element.getAttribute('data-naja-abort') !== 'off'
			: options.abort !== false;

		// propagate to options if called in interaction event
		options.abort = this.abortable;
	}

	saveAbortController(event) {
		const {abortController} = event.detail;
		this.abortController = abortController;
	}

	clearAbortController() {
		this.abortController = null;
		this.abortable = true;
	}
}
