import Component from '../Component';


export default class FormsHandler extends Component {
	constructor(naja) {
		super(naja);
		naja.addEventListener('load', FormsHandler.initForms);
		naja.addEventListener('interaction', FormsHandler.processForm);
	}

	static initForms() {
		if (window.Nette) {
			const forms = window.document.querySelectorAll('form');
			for (let i = 0; i < forms.length; i++) {
				window.Nette.initForm(forms.item(i));
			}
		}
	}

	static processForm(evt) {
		const {element, originalEvent} = evt;

		if (element.form) {
			element.form['nette-submittedBy'] = element;
		}

		if ((element.tagName === 'form' || element.form) && window.Nette && ! window.Nette.validateForm(element)) {
			originalEvent.stopImmediatePropagation();
			originalEvent.preventDefault();
			evt.preventDefault();
		}
	}
}
