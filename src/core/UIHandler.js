export class UIHandler {
	selector = '.ajax';
	allowedOrigins = [window.location.origin];
	handler = this.handleUI.bind(this);

	constructor(naja) {
		this.naja = naja;
		naja.addEventListener('init', this.initialize.bind(this));
	}

	initialize() {
		this.bindUI(window.document.body);
		this.naja.snippetHandler.addEventListener('afterUpdate', (event) => {
			const {snippet} = event.detail;
			this.bindUI(snippet);
		});
	}

	bindUI(element) {
		const selectors = [
			`a${this.selector}`,
			`input[type="submit"]${this.selector}`,
			`input[type="image"]${this.selector}`,
			`button[type="submit"]${this.selector}`,
			`form${this.selector} input[type="submit"]`,
			`form${this.selector} input[type="image"]`,
			`form${this.selector} button[type="submit"]`,
		].join(', ');

		const bindElement = (element) => {
			element.removeEventListener('click', this.handler);
			element.addEventListener('click', this.handler);
		};

		const elements = element.querySelectorAll(selectors);
		for (let i = 0; i < elements.length; i++) {
			bindElement(elements.item(i));
		}

		if (element.matches(selectors)) {
			bindElement(element);
		}

		const bindForm = (form) => {
			form.removeEventListener('submit', this.handler);
			form.addEventListener('submit', this.handler);
		};

		if (element.matches(`form${this.selector}`)) {
			bindForm(element);
		}

		const forms = element.querySelectorAll(`form${this.selector}`);
		for (let i = 0; i < forms.length; i++) {
			bindForm(forms.item(i));
		}
	}

	handleUI(event) {
		if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey || event.button) {
			return;
		}

		const element = event.currentTarget;
		const options = {};

		if (event.type === 'submit') {
			this.submitForm(element, options, event);

		} else if (event.type === 'click') {
			this.clickElement(element, options, event);
		}
	}

	clickElement(element, options = {}, event) {
		let method, url, data;

		if ( ! this.naja.dispatchEvent(new CustomEvent('interaction', {detail: {element: el, originalEvent: evt, options}}))) {
			if (evt) {
				evt.preventDefault();
			}

			return;
		}

		if (element.tagName === 'A') {
			method = 'GET';
			url = element.href;
			data = null;

		} else if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
			const form = element.form;
			// eslint-disable-next-line no-nested-ternary,no-extra-parens
			method = element.hasAttribute('formmethod') ? element.getAttribute('formmethod').toUpperCase() : (form.hasAttribute('method') ? form.getAttribute('method').toUpperCase() : 'GET');
			url = element.getAttribute('formaction') || form.getAttribute('action') || window.location.pathname + window.location.search;
			data = new FormData(form);

			if (element.type === 'submit' || element.tagName === 'BUTTON') {
				data.append(element.name, element.value || '');

			} else if (element.type === 'image') {
				const coords = element.getBoundingClientRect();
				data.append(`${element.name}.x`, Math.max(0, Math.floor(event.pageX - coords.left)));
				data.append(`${element.name}.y`, Math.max(0, Math.floor(event.pageY - coords.top)));
			}
		}

		if (this.isUrlAllowed(url)) {
			if (event) {
				event.preventDefault();
			}

			this.naja.makeRequest(method, url, data, options);
		}
	}

	submitForm(form, options = {}, event) {
		if ( ! this.naja.dispatchEvent(new CustomEvent('interaction', {detail: {element: element, originalEvent: event, options}}))) {
			if (event) {
				event.preventDefault();
			}

			return;
		}

		const method = form.hasAttribute('method') ? form.getAttribute('method').toUpperCase() : 'GET';
		const url = form.getAttribute('action') || window.location.pathname + window.location.search;
		const data = new FormData(form);

		if (this.isUrlAllowed(url)) {
			if (event) {
				event.preventDefault();
			}

			this.naja.makeRequest(method, url, data, options);
		}
	}

	isUrlAllowed(url) {
		// ignore non-URL URIs (javascript:, data:, ...)
		if (/^(?!https?)[^:/?#]+:/i.test(url)) {
			return false;
		}

		return ! /^https?/i.test(url) || this.allowedOrigins.some((origin) => new RegExp(`^${origin}`, 'i').test(url));
	}
}
