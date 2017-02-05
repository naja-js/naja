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
			if (!!this.xhr && evt.key === 'Escape' && !(evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey) && this.abortable) {
				this.xhr.abort();
				this.xhr = null;
			}
		});
	}

	checkAbortable({el, options}) {
		this.abortable = el
			? el.getAttribute('data-naja-abort') !== 'off'
			: options.abort !== false;
	}

	saveXhr({xhr}) {
		this.xhr = xhr;
	}

	clearXhr() {
		this.xhr = null;
		this.abortable = true;
	}
}
