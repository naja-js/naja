import qwest from 'qwest';
import objectAssign from 'object-assign';
import EventTarget from 'event-target-shim';

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


	initialize() {
		if (this.initialized) {
			throw new Error('Cannot initialize Naja, it is already initialized.');
		}

		this.extensions = this.extensions.map(([extensionClass, args]) => new extensionClass(this, ...args));

		this.fireEvent('init');
		this.initialized = true;
		this.load();
	}


	load() {
		this.fireEvent('load');
	}


	fireEvent(type, args = {}) {
		const evt = objectAssign(args, {type, cancelable: true});
		return this.dispatchEvent(evt);
	}


	makeRequest(method, url, data, options) {
		const defaultOptions = {
			dataType: 'post',
			responseType: 'auto',
		};

		options = objectAssign({}, defaultOptions, options || {});

		let currentXhr;
		const beforeCallback = (xhr) => {
			currentXhr = xhr;

			// abort request if beforeEvent.preventDefault() is called
			if ( ! this.fireEvent('before', {xhr, method, url, data, options})) {
				xhr.abort();
			}

			// qwest does not handle response at all if the request is aborted
			xhr.addEventListener('abort', () => {
				this.fireEvent('abort', {xhr});
				this.fireEvent('complete', {error: new Error('Request aborted'), xhr, response: null});
			});
		};

		const request = qwest.map(method, url, data, options, beforeCallback)
			.then((xhr, response) => {
				this.fireEvent('success', {xhr, response});
				this.fireEvent('complete', {error: null, xhr, response});
				this.load();

				return response;
			})
			.catch((error, xhr, response) => {
				this.fireEvent('error', {error, xhr, response});
				this.fireEvent('complete', {error, xhr, response});
				this.load();

				throw error;
			});

		this.fireEvent('start', {request, xhr: currentXhr});
		return request;
	}
}
