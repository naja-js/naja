import {UIHandler} from './core/UIHandler';
import {FormsHandler} from './core/FormsHandler';
import {RedirectHandler} from './core/RedirectHandler';
import {SnippetHandler} from './core/SnippetHandler';
import {HistoryHandler} from './core/HistoryHandler';
import {SnippetCache} from './core/SnippetCache';
import {ScriptLoader} from './core/ScriptLoader';
import {TypedEventListener} from './utils';

export interface Options extends Record<string, any> {
	fetch?: RequestInit;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Payload extends Record<string, any> {}

export class Naja extends EventTarget {
	public readonly VERSION: number = 3;

	private initialized: boolean = false;

	public readonly uiHandler: UIHandler;
	public readonly redirectHandler: RedirectHandler;
	public readonly snippetHandler: SnippetHandler;
	public readonly formsHandler: FormsHandler;
	public readonly historyHandler: HistoryHandler;
	public readonly snippetCache: SnippetCache;
	public readonly scriptLoader: ScriptLoader;
	private readonly extensions: Extension[] = [];

	public defaultOptions: Options = {};


	public constructor(
		uiHandler?: { new(naja: Naja): UIHandler },
		redirectHandler?: { new(naja: Naja): RedirectHandler },
		snippetHandler?: { new(naja: Naja): SnippetHandler },
		formsHandler?: { new(naja: Naja): FormsHandler },
		historyHandler?: { new(naja: Naja): HistoryHandler },
		snippetCache?: { new(naja: Naja): SnippetCache },
		scriptLoader?: { new(naja: Naja): ScriptLoader },
	) {
		super();
		this.uiHandler = new (uiHandler ?? UIHandler)(this);
		this.redirectHandler = new (redirectHandler ?? RedirectHandler)(this);
		this.snippetHandler = new (snippetHandler ?? SnippetHandler)(this);
		this.formsHandler = new (formsHandler ?? FormsHandler)(this);
		this.historyHandler = new (historyHandler ?? HistoryHandler)(this);
		this.snippetCache = new (snippetCache ?? SnippetCache)(this);
		this.scriptLoader = new (scriptLoader ?? ScriptLoader)(this);
	}


	public registerExtension(extension: Extension): void {
		if (this.initialized) {
			extension.initialize(this);
		}

		this.extensions.push(extension);
	}


	public initialize(defaultOptions: Options = {}): void {
		if (this.initialized) {
			throw new Error('Cannot initialize Naja, it is already initialized.');
		}

		this.defaultOptions = this.prepareOptions(defaultOptions);
		this.extensions.forEach((extension) => extension.initialize(this));

		this.dispatchEvent(new CustomEvent('init', {detail: {defaultOptions: this.defaultOptions}}));
		this.initialized = true;
	}


	public prepareOptions(options?: Options): Options {
		return {
			...this.defaultOptions,
			...options,
			fetch: {
				...this.defaultOptions.fetch,
				...options?.fetch,
			},
		};
	}


	public async makeRequest(
		method: string,
		url: string | URL,
		data: any | null = null,
		options: Options = {},
	): Promise<Payload> {
		// normalize url to instanceof URL
		if (typeof url === 'string') {
			url = new URL(url, location.href);
		}

		options = this.prepareOptions(options);

		const headers = new Headers(options.fetch!.headers || {});
		const body = this.transformData(url, method, data);

		const abortController = new AbortController();
		const request = new Request(url.toString(), {
			credentials: 'same-origin',
			...options.fetch,
			method,
			headers,
			body,
			signal: abortController.signal,
		});

		// impersonate XHR so that Nette can detect isAjax()
		request.headers.set('X-Requested-With', 'XMLHttpRequest');

		// hint the server that Naja expects response to be JSON
		request.headers.set('Accept', 'application/json');

		if ( ! this.dispatchEvent(new CustomEvent('before', {cancelable: true, detail: {request, method, url: url.toString(), data, options}}))) {
			return {};
		}

		const promise = window.fetch(request);
		this.dispatchEvent(new CustomEvent('start', {detail: {request, promise, abortController, options}}));

		let response, payload;

		try {
			response = await promise;
			if ( ! response.ok) {
				throw new HttpError(response);
			}

			payload = await response.json();

		} catch (error: any) {
			if (error.name === 'AbortError') {
				this.dispatchEvent(new CustomEvent('abort', {detail: {request, error, options}}));
				this.dispatchEvent(new CustomEvent('complete', {detail: {request, response, payload: undefined, error, options}}));
				return {};
			}

			this.dispatchEvent(new CustomEvent('error', {detail: {request, response, error, options}}));
			this.dispatchEvent(new CustomEvent('complete', {detail: {request, response, payload: undefined, error, options}}));

			throw error;
		}

		this.dispatchEvent(new CustomEvent('payload', {detail: {request, response, payload, options}}));
		this.dispatchEvent(new CustomEvent('success', {detail: {request, response, payload, options}}));
		this.dispatchEvent(new CustomEvent('complete', {detail: {request, response, payload, error: undefined, options}}));

		return payload;
	}

	private appendToQueryString(searchParams: URLSearchParams, key: string, value: any): void {
		if (value === null || value === undefined) {
			return;
		}

		if (Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype) {
			for (const [subkey, subvalue] of Object.entries(value)) {
				this.appendToQueryString(searchParams, `${key}[${subkey}]`, subvalue);
			}

		} else {
			searchParams.append(key, String(value));
		}
	}

	private transformData(url: URL, method: string, data: any): BodyInit | null {
		const isGet = ['GET', 'HEAD'].includes(method.toUpperCase());

		// sending a form via GET -> serialize FormData into URL and return empty request body
		if (isGet && data instanceof FormData) {
			for (const [key, value] of data) {
				if (value !== null && value !== undefined) {
					url.searchParams.append(key, String(value));
				}
			}

			return null;
		}

		// sending a POJO -> serialize it recursively into URLSearchParams
		const isDataPojo = data !== null && Object.getPrototypeOf(data) === Object.prototype;
		if (isDataPojo || Array.isArray(data)) {
			// for GET requests, append values to URL and return empty request body
			// otherwise build `new URLSearchParams()` to act as the request body
			const transformedData = isGet ? url.searchParams : new URLSearchParams();
			for (const [key, value] of Object.entries(data)) {
				this.appendToQueryString(transformedData, key, value);
			}

			return isGet
				? null
				: transformedData;
		}

		return data;
	}

	declare public addEventListener: <K extends keyof NajaEventMap | string>(type: K, listener: TypedEventListener<Naja, K extends keyof NajaEventMap ? NajaEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
	declare public removeEventListener: <K extends keyof NajaEventMap | string>(type: K, listener: TypedEventListener<Naja, K extends keyof NajaEventMap ? NajaEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
}

export interface Extension {
	initialize(naja: Naja): void;
}

export class HttpError extends Error {
	public readonly response: Response;

	constructor(response: Response) {
		const message = `HTTP ${response.status}: ${response.statusText}`;
		super(message);

		this.name = this.constructor.name;
		this.stack = new Error(message).stack;
		this.response = response;
	}
}

export type InitEvent = CustomEvent<{defaultOptions: Options}>;
export type BeforeEvent = CustomEvent<{request: Request, method: string, url: string, data: any, options: Options}>;
export type StartEvent = CustomEvent<{request: Request, promise: Promise<Response>, abortController: AbortController, options: Options}>;
export type AbortEvent = CustomEvent<{request: Request, error: Error, options: Options}>;
export type PayloadEvent = CustomEvent<{request: Request, response: Response, payload: Payload, options: Options}>;
export type SuccessEvent = CustomEvent<{request: Request, response: Response, payload: Payload, options: Options}>;
export type ErrorEvent = CustomEvent<{request: Request, response: Response | undefined, error: Error, options: Options}>;
export type CompleteEvent = CustomEvent<{request: Request, response: Response | undefined, error: Error | undefined, payload: Payload | undefined, options: Options}>;

interface NajaEventMap {
	init: InitEvent;
	before: BeforeEvent;
	start: StartEvent;
	abort: AbortEvent;
	payload: PayloadEvent;
	success: SuccessEvent;
	error: ErrorEvent;
	complete: CompleteEvent;
}
