import {Naja, Options, Payload} from '../Naja';
import {onDomReady, TypedEventListener} from '../utils';

export class UIHandler extends EventTarget {
	public selector: string = '.ajax';
	public allowedOrigins: (string | URL)[] = [window.location.origin];
	private handler = this.handleUI.bind(this);

	public constructor(private readonly naja: Naja) {
		super();
		naja.addEventListener('init', this.initialize.bind(this));
	}

	private initialize(): void {
		onDomReady(() => this.bindUI(window.document.body));
		this.naja.snippetHandler.addEventListener('afterUpdate', (event) => {
			const {snippet} = event.detail;
			this.bindUI(snippet);
		});
	}

	public bindUI(element: Element): void {
		const selector = `a${this.selector}`;

		const bindElement = (element: HTMLAnchorElement) => {
			element.removeEventListener('click', this.handler);
			element.addEventListener('click', this.handler);
		};

		const elements = element.querySelectorAll(selector);
		elements.forEach((element) => bindElement(element as HTMLAnchorElement));

		if (element.matches(selector)) {
			bindElement(element as HTMLAnchorElement);
		}

		const bindForm = (form: HTMLFormElement) => {
			form.removeEventListener('submit', this.handler);
			form.addEventListener('submit', this.handler);
		};

		if (element.tagName === 'FORM') {
			bindForm(element as HTMLFormElement);
		}

		const forms = element.querySelectorAll('form');
		forms.forEach((form) => bindForm(form as HTMLFormElement));
	}

	private handleUI(event: Event | MouseEvent | SubmitEvent): void {
		const mouseEvent = event as MouseEvent;
		if (mouseEvent.altKey || mouseEvent.ctrlKey || mouseEvent.shiftKey || mouseEvent.metaKey || mouseEvent.button) {
			return;
		}

		const element = event.currentTarget;
		const options = this.naja.prepareOptions();

		const ignoreErrors = () => {
			// don't reject the promise in case of an error as developers have no way of handling the rejection
			// in this situation; errors should be handled in `naja.addEventListener('error', errorHandler)`
		};

		if (event.type === 'submit') {
			const {submitter} = (event as SubmitEvent);
			if ((element as HTMLFormElement).matches(this.selector) || submitter?.matches(this.selector)) {
				this.submitForm(element as HTMLFormElement, options, event as SubmitEvent).catch(ignoreErrors);
			}

		} else if (event.type === 'click') {
			this.processInteraction(element as HTMLAnchorElement, 'GET', (element as HTMLAnchorElement).href, null, options, mouseEvent).catch(ignoreErrors);

		}
	}

	public async clickElement(element: HTMLElement, options: Options = {}, event?: MouseEvent): Promise<Payload> {
		if (element.tagName === 'A') {
			return this.processInteraction(element, 'GET', (element as HTMLAnchorElement).href, null, options, event);

		} else if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
			const {form} = element as HTMLButtonElement | HTMLInputElement;
			if (form) {
				return this.submitForm(form, options, event);
			}

		}

		return {};
	}

	public async submitForm(form: HTMLFormElement, options: Options = {}, event?: Event): Promise<Payload> {
		const submitter = event?.type === 'submit' ? (event as SubmitEvent)?.submitter : null;
		const method = (submitter?.getAttribute('formmethod') ?? form.getAttribute('method') ?? 'GET').toUpperCase();
		const url = submitter?.getAttribute('formaction') ?? form.getAttribute('action') ?? window.location.pathname + window.location.search;
		const data = new FormData(form, submitter);

		return this.processInteraction(submitter ?? form, method, url, data, options, event);
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
