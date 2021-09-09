import {Naja} from '../Naja';
import {InteractionEvent} from './UIHandler';
import {onDomReady} from '../utils';

export class FormsHandler {
	public netteForms: any;

	public constructor(private readonly naja: Naja) {
		naja.addEventListener('init', this.initialize.bind(this));
		naja.uiHandler.addEventListener('interaction', this.processForm.bind(this));
	}

	private initialize(): void {
		onDomReady(() => this.initForms(window.document.body));
		this.naja.snippetHandler.addEventListener('afterUpdate', (event) => {
			const {snippet} = event.detail;
			this.initForms(snippet);
		});
	}

	private initForms(element: Element): void {
		const netteForms = this.netteForms || (window as any).Nette;
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

	private processForm(event: InteractionEvent): void {
		const {element, originalEvent} = event.detail;

		const inputElement = element as HTMLInputElement;
		if (inputElement.form !== undefined && inputElement.form !== null) {
			inputElement.form['nette-submittedBy'] = element;
		}

		const netteForms = this.netteForms || (window as any).Nette;
		if ((element.tagName === 'FORM' || (element as HTMLInputElement).form) && netteForms && ! netteForms.validateForm(element)) {
			if (originalEvent) {
				originalEvent.stopImmediatePropagation();
				originalEvent.preventDefault();
			}

			event.preventDefault();
		}
	}
}
