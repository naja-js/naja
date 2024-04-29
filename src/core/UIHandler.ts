import {Naja, Options, Payload} from '../Naja';
import {assert, TypedEventListener} from '../utils';

export class UIHandler extends EventTarget {
	public selector: string = '.ajax';
	public allowedOrigins: (string | URL)[] = [window.location.origin];
	private clickSelector: string = '';
	private formSelector: string = '';

	public constructor(private readonly naja: Naja) {
		super();
		naja.addEventListener('init', this.initialize.bind(this));
	}

	private initialize(): void {
		this.clickSelector = [
			`a${this.selector}`,
			`input[type="submit"]${this.selector}`,
			`input[type="image"]${this.selector}`,
			`button[type="submit"]${this.selector}`,
			`button[form]:not([type])${this.selector}`,
			`form button:not([type])${this.selector}`,
			`form${this.selector} input[type="submit"]`,
			`form${this.selector} input[type="image"]`,
			`form${this.selector} button[type="submit"]`,
			`form${this.selector} button:not([type])`,
		].join(', ');

		this.formSelector = `form${this.selector}`;

		addEventListener('click', this, false);
		document.addEventListener('submit', this, false);
	}

	public handleEvent(event: Event | MouseEvent | SubmitEvent): void {
		const mouseEvent = event as MouseEvent;
		if (mouseEvent.altKey || mouseEvent.ctrlKey || mouseEvent.shiftKey || mouseEvent.metaKey || mouseEvent.button) {
			return;
		}

		const element = event.target;
		const options = this.naja.prepareOptions();

		const ignoreErrors = () => {
			// don't reject the promise in case of an error as developers have no way of handling the rejection
			// in this situation; errors should be handled in `naja.addEventListener('error', errorHandler)`
		};

		if (event.type === 'submit') {
			if ((element as HTMLFormElement).matches(this.formSelector)) {
				this.submitForm(element as HTMLFormElement, options, event).catch(ignoreErrors);
			}
		} else if (event.type === 'click') {
			const matchedElement = (element as HTMLElement).closest(this.clickSelector);
			if (matchedElement) {
				this.clickElement(matchedElement as HTMLElement, options, mouseEvent).catch(ignoreErrors);
			}
		}
	}

	public async clickElement(element: HTMLElement, options: Options = {}, event?: MouseEvent): Promise<Payload> {
		let method: string = 'GET', url: string = '', data: any;

		if (element.tagName === 'A') {
			assert(element instanceof HTMLAnchorElement);

			method = 'GET';
			url = element.href;
			data = null;

		} else if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
			assert(element instanceof HTMLInputElement || element instanceof HTMLButtonElement);

			const {form} = element;
			// eslint-disable-next-line no-nested-ternary,no-extra-parens
			method = element.getAttribute('formmethod')?.toUpperCase() ?? form?.getAttribute('method')?.toUpperCase() ?? 'GET';
			url = element.getAttribute('formaction') ?? form?.getAttribute('action') ?? window.location.pathname + window.location.search;
			data = new FormData(form ?? undefined);

			if (element.type === 'submit' && element.name !== '') {
				data.append(element.name, element.value || '');

			} else if (element.type === 'image') {
				const coords = element.getBoundingClientRect();
				const prefix = element.name !== '' ? `${element.name}.` : '';
				data.append(`${prefix}x`, Math.max(0, Math.floor(event !== undefined ? event.pageX - coords.left : 0)));
				data.append(`${prefix}y`, Math.max(0, Math.floor(event !== undefined ? event.pageY - coords.top : 0)));
			}
		}

		return this.processInteraction(element, method, url, data, options, event);
	}

	public async submitForm(form: HTMLFormElement, options: Options = {}, event?: Event): Promise<Payload> {
		const method = form.getAttribute('method')?.toUpperCase() ?? 'GET';
		const url = form.getAttribute('action') ?? window.location.pathname + window.location.search;
		const data = new FormData(form);

		return this.processInteraction(form, method, url, data, options, event);
	}

	public async processInteraction(
		element: HTMLElement,
		method: string,
		url: string | URL,
		data: any | null = null,
		options: Options = {},
		event?: Event,
	): Promise<Payload> {
		if ( ! this.dispatchEvent(new CustomEvent('interaction', {cancelable: true, detail: {element, originalEvent: event, options}}))) {
			event?.preventDefault();
			return {};
		}

		if ( ! this.isUrlAllowed(`${url}`)) {
			throw new Error(`Cannot dispatch async request, URL is not allowed: ${url}`);
		}

		event?.preventDefault();
		return this.naja.makeRequest(method, url, data, options);
	}

	public isUrlAllowed(url: string): boolean {
		const urlObject = new URL(url, location.href);

		// ignore non-URL URIs (javascript:, data:, mailto:, ...)
		if (urlObject.origin === 'null') {
			return false;
		}

		return this.allowedOrigins.includes(urlObject.origin);
	}

	declare public addEventListener: <K extends keyof UIHandlerEventMap | string>(type: K, listener: TypedEventListener<UIHandler, K extends keyof UIHandlerEventMap ? UIHandlerEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
	declare public removeEventListener: <K extends keyof UIHandlerEventMap | string>(type: K, listener: TypedEventListener<UIHandler, K extends keyof UIHandlerEventMap ? UIHandlerEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
}

export type InteractionEvent = CustomEvent<{element: Element, originalEvent?: Event, options: Options}>;

interface UIHandlerEventMap {
	interaction: InteractionEvent;
}
