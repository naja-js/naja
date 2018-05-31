export default class FormsHandler {
	netteForms;

	constructor(naja) {
		naja.addEventListener('load', this.initForms.bind(this));
		naja.addEventListener('interaction', this.processForm.bind(this));
	}

	initForms() {
		const netteForms = this.netteForms || window.Nette;
		if (netteForms) {
			const forms = window.document.querySelectorAll('form');
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
