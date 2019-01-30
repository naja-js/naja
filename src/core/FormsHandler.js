export default class FormsHandler {
	netteForms;

	constructor(naja) {
		this.naja = naja;

		naja.addEventListener('init', this.initialize.bind(this));
		naja.addEventListener('interaction', this.processForm.bind(this));
	}

	initialize() {
		this.initForms(window.document.body);
		this.naja.snippetHandler.addEventListener('afterUpdate', ({snippet}) => {
			this.initForms(snippet);
		});
	}

	initForms(element) {
		const netteForms = this.netteForms || window.Nette;
		if (netteForms) {
			if (element.tagName === 'form') {
				netteForms.initForm(element);
			}

			const forms = element.querySelectorAll('form');
			for (let i = 0; i < forms.length; i++) {
				netteForms.initForm(forms.item(i));
			}
		}
	}

	processForm(evt) {
		const {element, originalEvent} = evt;

		if (element.form) {
			element.form['nette-submittedBy'] = element;
		}

		const netteForms = this.netteForms || window.Nette;
		if ((element.tagName === 'form' || element.form) && netteForms && ! netteForms.validateForm(element)) {
			if (originalEvent) {
				originalEvent.stopImmediatePropagation();
				originalEvent.preventDefault();
			}

			evt.preventDefault();
		}
	}
}
