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


	registerExtension(extensionClass) {
		const extension = new extensionClass(this);
		this.extensions.push(extension);
	}


	initialize() {
		if (this.initialized) {
			throw new Error("Cannot initialize Naja, it is already initialized.");
		}

		this.uiHandler = new UIHandler(this);
		this.redirectHandler = new RedirectHandler(this);
		this.snippetHandler = new SnippetHandler(this);
		this.formsHandler = new FormsHandler(this);
		this.historyHandler = new HistoryHandler(this);
		this.scriptLoader = new ScriptLoader(this);

		this.fireEvent('init');
		this.initialized = true;
		this.load();
	}


	load() {
		this.fireEvent('load');
	}


	fireEvent(type, args = {}) {
		const evt = Object.assign(args, {type, cancelable: true});
		return this.dispatchEvent(evt);
	}


	makeRequest(method, url, data, options) {
		const defaultOptions = {
			dataType: 'post',
			responseType: 'auto',
		};

		options = objectAssign({}, defaultOptions, options || {});

		let currentXhr;
		const beforeCallback = xhr => {
			currentXhr = xhr;
			this.fireEvent('before', {xhr, method, url, data, options});
		};

		const request = qwest.map(method, url, data, options, beforeCallback)
			.then((xhr, response) => {
				this.fireEvent('success', {xhr, response});
				this.fireEvent('complete', {error: null, xhr, response});
				this.load();
			})
			.catch((error, xhr, response) => {
				this.fireEvent('error', {error, xhr, response});
				this.fireEvent('complete', {error, xhr, response});
				this.load();
			});

		this.fireEvent('start', {request, xhr: currentXhr});
		return request;
	}
}
