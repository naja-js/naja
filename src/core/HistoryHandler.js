export default class HistoryHandler {
	href = null;
	uiCache = true;

	constructor(naja) {
		this.naja = naja;

		naja.addEventListener('init', this.initialize.bind(this));
		naja.addEventListener('interaction', this.configureMode.bind(this));
		naja.addEventListener('before', this.saveUrl.bind(this));
		naja.addEventListener('success', this.pushNewState.bind(this));

		this.popStateHandler = this.handlePopState.bind(this);
		this.historyAdapter = {
			replaceState: (data, title, url) => window.history.replaceState(data, title, url),
			pushState: (data, title, url) => window.history.pushState(data, title, url),
		};
	}

	initialize() {
		window.addEventListener('popstate', this.popStateHandler);
		this.historyAdapter.replaceState(
			this.buildState(window.location.href, this.uiCache),
			window.document.title,
			window.location.href,
		);
	}

	handlePopState(e) {
		if ( ! e.state) {
			return;
		}

		if (e.state.ui) {
			this.handleSnippets(e.state.ui);
			this.handleTitle(e.state.title);

		} else if (e.state.ui === false) {
			this.naja.makeRequest(
				'GET',
				e.state.href,
				null,
				{
					history: false,
					historyUiCache: false,
				},
			);
		}
	}

	saveUrl({url}) {
		this.href = url;
	}

	configureMode({element, options}) {
		// propagate mode to options
		if ( ! element) {
			return;
		}

		if (element.hasAttribute('data-naja-history')) {
			options.history = this.constructor.normalizeMode(element.getAttribute('data-naja-history'));
		}

		if (element.hasAttribute('data-naja-history-cache')) {
			options.historyUiCache = element.getAttribute('data-naja-history-cache') !== 'off';
		}
	}

	static normalizeMode(mode) {
		if (mode === 'off' || mode === false) {
			return false;

		} else if (mode === 'replace') {
			return 'replace';
		}

		return true;
	}

	pushNewState({response, options}) {
		const mode = this.constructor.normalizeMode(options.history);
		if (mode === false) {
			return;
		}

		if (response.postGet && response.url) {
			this.href = response.url;
		}

		const method = response.replaceHistory || mode === 'replace' ? 'replaceState' : 'pushState';
		const uiCache = options.historyUiCache === true || (options.historyUiCache !== false && this.uiCache); // eslint-disable-line no-extra-parens
		this.historyAdapter[method](
			this.buildState(this.href, uiCache),
			window.document.title,
			this.href,
		);

		this.href = null;
	}

	buildState(href, uiCache) {
		const state = {
			href,
		};

		if (uiCache) {
			state.title = window.document.title;
			state.ui = this.findSnippets();

		} else {
			state.ui = false;
		}

		return state;
	}

	findSnippets() {
		const result = {};
		const snippets = window.document.querySelectorAll('[id^="snippet-"]');
		for (let i = 0; i < snippets.length; i++) {
			const snippet = snippets.item(i);
			if (!snippet.hasAttribute('data-naja-history-nocache') && !snippet.hasAttribute('data-history-nocache')) {
				result[snippet.id] = snippet.innerHTML;
			}
		}

		return result;
	}

	handleSnippets(snippets) {
		this.naja.snippetHandler.updateSnippets(snippets, true);
		this.naja.scriptLoader.loadScripts(snippets);
		this.naja.load();
	}

	handleTitle(title) {
		window.document.title = title;
	}
}
