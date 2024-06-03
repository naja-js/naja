import {Naja, Options, Payload} from '../Naja';
import {onDomReady, TypedEventListener} from '../utils';

export class UIHandler extends EventTarget {
	public selector: string = '.ajax';
	public allowedOrigins: (string | URL)[] = [window.location.origin];
	private handler = this.handleUI.bind(this);

	public binding: BindingStrategyType = 'direct';
	private _bindingStrategy: BindingStrategy|undefined;
	private readonly bindingStrategies: Record<BindingStrategyType, BindingStrategy>;

	private get bindingStrategy() {
		this._bindingStrategy ??= this.bindingStrategies[this.binding];
		return this._bindingStrategy;
	}

	public constructor(private readonly naja: Naja) {
		super();

		this.bindingStrategies = {
			direct: new DirectBindingStrategy(naja),
			delegated: new DelegatedBindingStrategy(naja),
		};

		naja.addEventListener('init', this.initialize.bind(this));
	}

	private initialize(): void {
		this.bindingStrategy.initialize(this.handler);
	}

	public bindUI(element: Element): void {
		this.bindingStrategy.bind(element);
	}

	private handleUI(element: HTMLElement, event: MouseEvent | SubmitEvent): void {
		const options = this.naja.prepareOptions();

		const ignoreErrors = () => {
			// don't reject the promise in case of an error as developers have no way of handling the rejection
			// in this situation; errors should be handled in `naja.addEventListener('error', errorHandler)`
		};

		if (event instanceof MouseEvent) {
			if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey || event.button) {
				return;
			}

			this.clickElement(element, options, event).catch(ignoreErrors);
			return;
		}

		const {submitter} = event;
		if (this.selector === '' || element.matches(this.selector) || submitter?.matches(this.selector)) {
			this.submitForm(submitter ?? element, options, event).catch(ignoreErrors);
		}
	}

	public async clickElement(element: HTMLElement, options: Options = {}, event?: MouseEvent): Promise<Payload> {
		if (element instanceof HTMLAnchorElement) {
			return this.processInteraction(element, 'GET', element.href, null, options, event);
		}

		if ((element instanceof HTMLInputElement || element instanceof HTMLButtonElement) && element.form) {
			return this.submitForm(element, options, event);
		}

		throw new Error('Unsupported element in clickElement(): element must be an anchor or a submitter element attached to a form.');
	}

	public async submitForm(formOrSubmitter: HTMLFormElement | HTMLElement, options: Options = {}, event?: Event): Promise<Payload> {
		let form: HTMLFormElement;
		let submitter: HTMLElement | null = null;

		if ((formOrSubmitter instanceof HTMLInputElement || formOrSubmitter instanceof HTMLButtonElement) && formOrSubmitter.form) {
			// eslint-disable-next-line prefer-destructuring
			form = formOrSubmitter.form;
			submitter = formOrSubmitter;

		} else if (formOrSubmitter instanceof HTMLFormElement) {
			form = formOrSubmitter;
			submitter = event instanceof SubmitEvent ? event.submitter : null;

		} else {
			throw new Error('Unsupported element in submitForm(): formOrSubmitter must be either a form or a submitter element attached to a form.');
		}

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

type BindingStrategyType = 'direct' | 'delegated';

interface BindingStrategy {
	readonly type: BindingStrategyType;
	initialize(handler: (target: HTMLElement, event: MouseEvent | SubmitEvent) => unknown): void;
	bind(element: Element): void;
}

class DirectBindingStrategy implements BindingStrategy {
	public readonly type = 'direct';

	private eventListener: (event: MouseEvent | SubmitEvent) => unknown = () => {
		throw new Error('UIHandler: binding strategy must be initialized first.');
	};

	// eslint-disable-next-line no-empty-function
	public constructor(private readonly naja: Naja) {}

	public initialize(
		handler: (target: HTMLElement, event: MouseEvent | SubmitEvent) => unknown,
	): void {
		this.eventListener = (event: MouseEvent | SubmitEvent) => handler(event.currentTarget as HTMLElement, event);

		onDomReady(() => this.bind(window.document.body));
		this.naja.snippetHandler.addEventListener('afterUpdate', (event) => {
			const {snippet} = event.detail;
			this.bind(snippet);
		});
	}

	public bind(element: Element): void {
		const linkSelector = `a${this.naja.uiHandler.selector}`;
		if (element.matches(linkSelector)) {
			(element as HTMLAnchorElement).removeEventListener('click', this.eventListener);
			(element as HTMLAnchorElement).addEventListener('click', this.eventListener);
			return;
		}

		const links = element.querySelectorAll(linkSelector);
		links.forEach((link) => {
			(link as HTMLAnchorElement).removeEventListener('click', this.eventListener);
			(link as HTMLAnchorElement).addEventListener('click', this.eventListener);
		});

		if (element instanceof HTMLFormElement) {
			element.removeEventListener('submit', this.eventListener);
			element.addEventListener('submit', this.eventListener);
			return;
		}

		const forms = element.querySelectorAll('form');
		forms.forEach((form) => {
			form.removeEventListener('submit', this.eventListener);
			form.addEventListener('submit', this.eventListener);
		});
	}
}

class DelegatedBindingStrategy implements BindingStrategy {
	public readonly type = 'delegated';

	private clickEventListener: (event: MouseEvent) => unknown = () => {
		throw new Error('UIHandler: binding strategy must be initialized first.');
	};

	private submitEventListener: (event: SubmitEvent) => unknown = () => {
		throw new Error('UIHandler: binding strategy must be initialized first.');
	};

	// eslint-disable-next-line no-empty-function
	public constructor(private readonly naja: Naja) {}

	public initialize(
		handler: (target: HTMLElement, event: MouseEvent | SubmitEvent) => unknown,
	): void {
		this.clickEventListener = (event: MouseEvent) => {
			const linkSelector = `a${this.naja.uiHandler.selector}`;
			const target = (event.target as HTMLElement).closest(linkSelector);
			if (target !== null) {
				handler(target as HTMLAnchorElement, event);
			}
		};

		this.submitEventListener = (event: SubmitEvent) => {
			handler(event.target as HTMLFormElement, event);
		};

		onDomReady(() => {
			window.document.body.addEventListener('click', this.clickEventListener);
			window.document.body.addEventListener('submit', this.submitEventListener);
		});
	}

	public bind(): void {
		// no-op
	}
}
