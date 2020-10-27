import {BeforeEvent, InitEvent, Naja, SuccessEvent} from '../Naja';
import {InteractionEvent} from './UIHandler';

declare module '../Naja' {
	interface Options {
		history?: HistoryMode;
		historyUiCache?: boolean;
	}
}

export interface HistoryAdapter {
	replaceState(data: any, title: string, url: string): void;
	pushState(data: any, title: string, url: string): void;
}

export type HistoryMode = boolean | 'replace';

export class HistoryHandler {
	private href: string | null = null;
	public popStateHandler = this.handlePopState.bind(this);

	public uiCache: boolean = true;
	public historyAdapter: HistoryAdapter;

	public constructor(private readonly naja: Naja) {
		naja.addEventListener('init', this.initialize.bind(this));
		naja.addEventListener('before', this.saveUrl.bind(this));
		naja.addEventListener('success', this.pushNewState.bind(this));

		naja.uiHandler.addEventListener('interaction', this.configureMode.bind(this));

		this.historyAdapter = {
			replaceState: (data, title, url) => window.history.replaceState(data, title, url),
			pushState: (data, title, url) => window.history.pushState(data, title, url),
		};
	}

	private initialize(event: InitEvent): void {
		const {defaultOptions} = event.detail;
		if ('historyUiCache' in defaultOptions && defaultOptions.historyUiCache !== undefined) {
			this.uiCache = defaultOptions.historyUiCache;
		}

		window.addEventListener('popstate', this.popStateHandler);
		this.historyAdapter.replaceState(
			this.buildState(window.location.href, this.uiCache),
			window.document.title,
			window.location.href,
		);
	}

	private handlePopState(e: PopStateEvent): void {
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

	private saveUrl(event: BeforeEvent): void {
		const {url} = event.detail;
		this.href = url;
	}

	private configureMode(event: InteractionEvent): void {
		const {element, options} = event.detail;

		// propagate mode to options
		if ( ! element) {
			return;
		}

		if (element.hasAttribute('data-naja-history') || (element as HTMLInputElement).form?.hasAttribute('data-naja-history')) {
			const value = element.getAttribute('data-naja-history') ?? (element as HTMLInputElement).form?.getAttribute('data-naja-history');
			options.history = HistoryHandler.normalizeMode(value);
		}

		if (element.hasAttribute('data-naja-history-cache') || (element as HTMLInputElement).form?.hasAttribute('data-naja-history-nocache')) {
			const value = element.getAttribute('data-naja-history-cache') ?? (element as HTMLInputElement).form?.getAttribute('data-naja-history-cache');
			options.historyUiCache = value !== 'off';
		}
	}

	public static normalizeMode(mode: string | boolean | null | undefined): HistoryMode {
		if (mode === 'off' || mode === false) {
			return false;

		} else if (mode === 'replace') {
			return 'replace';
		}

		return true;
	}

	private pushNewState(event: SuccessEvent): void {
		const {payload, options} = event.detail;
		const mode = HistoryHandler.normalizeMode(options.history);
		if (mode === false) {
			return;
		}

		if (payload.postGet && payload.url) {
			this.href = payload.url;
		}

		const method = mode === 'replace' ? 'replaceState' : 'pushState';
		const uiCache = options.historyUiCache === true || (options.historyUiCache !== false && this.uiCache); // eslint-disable-line no-extra-parens
		this.historyAdapter[method](
			this.buildState(this.href!, uiCache),
			window.document.title,
			this.href!,
		);

		this.href = null;
	}

	private buildState(href: string, uiCache: boolean): any {
		const state: any = {
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

	private findSnippets(): Record<string, string> {
		const result: Record<string, string> = {};
		const snippets = window.document.querySelectorAll('[id^="snippet-"]');
		for (let i = 0; i < snippets.length; i++) {
			const snippet = snippets.item(i);
			if (!snippet.hasAttribute('data-naja-history-nocache') && !snippet.hasAttribute('data-history-nocache')) {
				result[snippet.id] = snippet.innerHTML;
			}
		}

		return result;
	}

	private handleSnippets(snippets: Record<string, string>): void {
		this.naja.snippetHandler.updateSnippets(snippets, true);
		this.naja.scriptLoader.loadScripts(snippets);
	}

	private handleTitle(title: string): void {
		window.document.title = title;
	}
}
