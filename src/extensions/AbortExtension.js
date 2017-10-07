export default class AbortExtension {
	constructor(naja) {
		naja.addEventListener('init', this.initialize.bind(this));
		naja.addEventListener('interaction', this.checkAbortable.bind(this));
		naja.addEventListener('before', this.checkAbortable.bind(this));
		naja.addEventListener('start', this.saveXhr.bind(this));
		naja.addEventListener('complete', this.clearXhr.bind(this));
	}


	abortable = true;
	xhr = null;
	initialize() {
		document.addEventListener('keydown', (evt) => {
			if (!!this.xhr
				&& ('key' in evt ? evt.key === 'Escape' : evt.keyCode === 27)
				&& !(evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey)
				&& this.abortable
			) {
				this.xhr.abort();
				this.xhr = null;
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

	saveXhr({xhr}) {
		this.xhr = xhr;
	}

	clearXhr() {
		this.xhr = null;
		this.abortable = true;
	}
}
