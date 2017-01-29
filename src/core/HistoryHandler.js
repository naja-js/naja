import Component from '../Component';


export default class HistoryHandler extends Component {
	popped = false;
	href = null;
	initialState = null;

	constructor(naja) {
		super(naja);
		naja.addEventListener('init', this.initialize.bind(this));
		naja.addEventListener('before', this.saveUrl.bind(this));
		naja.addEventListener('success', this.pushNewState.bind(this));
	}

	initialize() {
		this.popped = !!window.history.state;
		const initialUrl = window.location.href;

		window.addEventListener('popstate', e => {
			const state = e.state || this.initialState;
			const initialPop = !this.popped && initialUrl === state.href;
			this.popped = true;

			if (initialPop) {
				return;
			}

			if (!!state.ui) {
				this.handleSnippets(state.ui);
				this.handleTitle(state.title);
			}
		});

		window.history.replaceState(this.initialState = {
			href: window.location.href,
			title: window.document.title,
			ui: this.findSnippets(),
		}, window.document.title, window.location.href);
	}

	saveUrl({url}) {
		this.href = url;
	}

	pushNewState({response}) {
		if (response.postGet && response.url) {
			this.href = response.url;
		}

		const method = response.replaceHistory ? 'replaceState' : 'pushState';
		history[method]({
			href: this.href,
			title: window.document.title,
			ui: this.findSnippets(),
		}, window.document.title, this.href);

		this.href = null;
		this.popped = true;
	}

	findSnippets() {
		const result = {};
		window.document.querySelectorAll('[id^="snippet-"]').forEach(snippet => {
			if (!snippet.getAttribute('data-history-nocache')) {
				result[snippet.id] = snippet.innerHTML;
			}
		});

		return result;
	}

	handleSnippets(snippets) {
		this.naja.snippetHandler.updateSnippets(snippets);
		this.naja.scriptLoader.loadScripts(snippets);
		this.naja.load();
	}

	handleTitle(title) {
		window.document.title = title;
	}
}
