import {UIHandler} from './core/UIHandler';
import {FormsHandler} from './core/FormsHandler';
import {RedirectHandler} from './core/RedirectHandler';
import {SnippetHandler} from './core/SnippetHandler';
import {HistoryHandler} from './core/HistoryHandler';
import {ScriptLoader} from './core/ScriptLoader';

export class Naja extends EventTarget {
	VERSION = 2;

	initialized = false;

	uiHandler = null;
	redirectHandler = null;
	snippetHandler = null;
	formsHandler = null;
	historyHandler = null;
	scriptLoader = null;
	extensions = [];

	defaultOptions = {};


	constructor(uiHandler, redirectHandler, snippetHandler, formsHandler, historyHandler, scriptLoader) {
		super();
		this.uiHandler = uiHandler ? new uiHandler(this) : new UIHandler(this);
		this.redirectHandler = redirectHandler ? new redirectHandler(this) : new RedirectHandler(this);
		this.snippetHandler = snippetHandler ? new snippetHandler(this) : new SnippetHandler(this);
		this.formsHandler = formsHandler ? new formsHandler(this) : new FormsHandler(this);
		this.historyHandler = historyHandler ? new historyHandler(this) : new HistoryHandler(this);
		this.scriptLoader = scriptLoader ? new scriptLoader(this) : new ScriptLoader(this);
	}


	registerExtension(extension) {
		if (this.initialized) {
			extension.initialize(this);
		}

		this.extensions.push(extension);
	}


	initialize(defaultOptions = {}) {
		if (this.initialized) {
			throw new Error('Cannot initialize Naja, it is already initialized.');
		}

		this.defaultOptions = defaultOptions;
		this.extensions.forEach((extension) => extension.initialize(this));

		this.dispatchEvent(new CustomEvent('init', {detail: {defaultOptions}}));
		this.initialized = true;
	}


	async makeRequest(method, url, data = null, options = {}) {
		if (url instanceof URL) {
			url = url.href;
		}

		options = {
			...this.defaultOptions,
			...options,
			fetch: {
				...this.defaultOptions.fetch || {},
				...options.fetch || {},
			},
		};

		if (method.toUpperCase() === 'GET' && data instanceof FormData) {
			const urlObject = new URL(url, location.href);
			for (const [key, value] of data) {
				urlObject.searchParams.append(key, value);
			}

			url = urlObject.toString();
			data = null;
		}

		const abortController = new AbortController();
		const request = new Request(url, {
			credentials: 'same-origin',
			...options.fetch,
			method,
			headers: new Headers(options.fetch.headers || {}),
			body: data !== null && Object.getPrototypeOf(data) === Object.prototype
				? new URLSearchParams(data)
				: data,
			signal: abortController.signal,
		});

		// impersonate XHR so that Nette can detect isAjax()
		request.headers.set('X-Requested-With', 'XMLHttpRequest');

		if ( ! this.dispatchEvent(new CustomEvent('before', {cancelable: true, detail: {request, method, url, data, options}}))) {
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

		} catch (error) {
			if (error.name === 'AbortError') {
				this.dispatchEvent(new CustomEvent('abort', {detail: {request, error, options}}));
				this.dispatchEvent(new CustomEvent('complete', {detail: {request, response, payload: undefined, error, options}}));
				return {};
			}

			this.dispatchEvent(new CustomEvent('error', {detail: {request, response, error, options}}));
			this.dispatchEvent(new CustomEvent('complete', {detail: {request, response, payload: undefined, error, options}}));

			throw error;
		}

		this.dispatchEvent(new CustomEvent('success', {detail: {request, response, payload, options}}));
		this.dispatchEvent(new CustomEvent('complete', {detail: {request, response, payload, error: undefined, options}}));

		return payload;
	}
}

export class HttpError extends Error {
	constructor(response) {
		const message = `HTTP ${response.status}: ${response.statusText}`;
		super(message);

		this.name = this.constructor.name;
		this.stack = new Error(message).stack;
		this.response = response;
	}
}
