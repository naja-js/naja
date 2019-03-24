import UIHandler from './core/UIHandler';
import FormsHandler from './core/FormsHandler';
import RedirectHandler from './core/RedirectHandler';
import SnippetHandler from './core/SnippetHandler';
import HistoryHandler from './core/HistoryHandler';
import ScriptLoader from './core/ScriptLoader';


export default class Naja extends EventTarget {
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


	registerExtension(extensionClass, ...args) {
		this.extensions.push([extensionClass, args]);
	}


	initialize(defaultOptions = {}) {
		if (this.initialized) {
			throw new Error('Cannot initialize Naja, it is already initialized.');
		}

		this.defaultOptions = defaultOptions;
		this.extensions = this.extensions.map(([extensionClass, args]) => new extensionClass(this, ...args));

		this.fireEvent('init', {defaultOptions});
		this.initialized = true;
		this.load();
	}


	load() {
		this.fireEvent('load');
	}


	fireEvent(type, detail = {}) {
		const event = new CustomEvent(type, {
			cancelable: true,
			detail,
		});
		return this.dispatchEvent(event);
	}


	async makeRequest(method, url, data = null, options = {}) {
		options = {
			...this.defaultOptions,
			...options,
			fetch: {
				...this.defaultOptions.fetch || {},
				...options.fetch || {},
			},
		};

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

		if ( ! this.fireEvent('before', {request, method, url, data, options})) {
			return {};
		}

		const promise = window.fetch(request);
		this.fireEvent('start', {request, promise, abortController, options});

		let response, payload;

		try {
			response = await promise;
			if ( ! response.ok) {
				throw new HttpError(response);
			}

			payload = await response.json();

		} catch (error) {
			if (error.name === 'AbortError') {
				this.fireEvent('abort', {request, error, options});
				this.fireEvent('complete', {request, response, payload: undefined, error, options});
				return {};
			}

			this.fireEvent('error', {request, response, error, options});
			this.fireEvent('complete', {request, response, payload: undefined, error, options});
			this.load();

			throw error;
		}

		this.fireEvent('success', {request, response, payload, options});
		this.fireEvent('complete', {request, response, payload, error: undefined, options});
		this.load();

		return payload;
	}
}

class HttpError extends Error {
	constructor(response) {
		const message = `HTTP ${response.status}: ${response.statusText}`;
		super(message);

		this.name = this.constructor.name;
		this.stack = (new Error(message)).stack;
		this.response = response;
	}
}
