import Component from '../Component';


export default class UIHandler extends Component {
	constructor(naja) {
		super(naja);
		const handler = this.handleUI.bind(this);
		naja.addEventListener('load', this.bindUI.bind(this, handler));
	}

	bindUI(handler) {
		const selectors = [
			'a.ajax',
			'input[type="submit"].ajax',
			'input[type="image"].ajax',
			'button[type="submit"].ajax',
			'form.ajax input[type="submit"]',
			'form.ajax input[type="image"]',
			'form.ajax button[type="submit"]',
		].join(', ');

		document.querySelectorAll(selectors).forEach((node) => {
			node.removeEventListener('click', handler);
			node.addEventListener('click', handler);
		});

		document.querySelectorAll('form.ajax').forEach((form) => {
			form.removeEventListener('submit', handler);
			form.addEventListener('submit', handler);
		});
	}

	handleUI(evt) {
		if (evt.altKey || evt.ctrlKey || evt.shiftKey || evt.metaKey || evt.button) {
			return;
		}

		const el = evt.target, options = {};
		let method, url, data;

		if ( ! this.naja.fireEvent('interaction', {element: el, originalEvent: evt, options})) {
			return;
		}

		if (evt.type === 'submit') {
			method = el.method ? el.method.toUpperCase() : 'GET';
			url = el.action || window.location.pathname + window.location.search;
			data = new FormData(el);

		} else if (evt.type === 'click') {
			if (el.tagName.toLowerCase() === 'a') {
				method = 'GET';
				url = el.href;
				data = null;

			} else if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'button') {
				const {form} = el;
				method = form.method ? form.method.toUpperCase() : 'GET';
				url = form.action || window.location.pathname + window.location.search;
				data = new FormData(form);

				if (el.type === 'submit' || el.tagName.toLowerCase() === 'button') {
					data.set(el.name, el.value || '');

				} else if (el.type === 'image') {
					const coords = el.getBoundingClientRect();
					data.set(`${el.name}.x`, Math.max(0, Math.floor(evt.pageX - coords.left)));
					data.set(`${el.name}.y`, Math.max(0, Math.floor(evt.pageY - coords.top)));
				}
			}
		}

		evt.preventDefault();
		this.naja.makeRequest(method, url, data, options);
	}
}
