import {BeforeEvent, InitEvent, Naja, Options, SuccessEvent} from '../Naja';
import {InteractionEvent} from './UIHandler';
import {TypedEventListener} from '../utils';

declare module '../Naja' {
	interface Options {
		history?: HistoryMode;
		historyUiCache?: boolean;
	}
}

export interface HistoryState extends Record<string, any> {
	href: string;
	title?: string;
	ui: Record<string, string> | false;
}

export interface HistoryAdapter {
	replaceState(state: HistoryState, title: string, url: string): void;
	pushState(state: HistoryState, title: string, url: string): void;
}

export type HistoryMode = boolean | 'replace';

export class HistoryHandler extends EventTarget {
	private href: string | null = null;
	public popStateHandler = this.handlePopState.bind(this);

	public uiCache: boolean = true;
	public historyAdapter: HistoryAdapter;

	public constructor(private readonly naja: Naja) {
		super();

		naja.addEventListener('init', this.initialize.bind(this));
		naja.addEventListener('before', this.saveUrl.bind(this));
		naja.addEventListener('success', this.pushNewState.bind(this));

		naja.uiHandler.addEventListener('interaction', this.configureMode.bind(this));

		this.historyAdapter = {
			replaceState: (state, title, url) => window.history.replaceState(state, title, url),
			pushState: (state, title, url) => window.history.pushState(state, title, url),
		};
	}

	private initialize(event: InitEvent): void {
		const {defaultOptions} = event.detail;
		if ('historyUiCache' in defaultOptions && defaultOptions.historyUiCache !== undefined) {
			this.uiCache = defaultOptions.historyUiCache;
		}

		window.addEventListener('popstate', this.popStateHandler);
		this.historyAdapter.replaceState(
			this.buildState(window.location.href, this.uiCache, defaultOptions),
			window.document.title,
			window.location.href,
		);
	}

	private handlePopState(event: PopStateEvent): void {
		const {state} = event;
		if ( ! state) {
			return;
		}

		const options = this.naja.prepareOptions();
		if ( ! this.dispatchEvent(new CustomEvent('restoreState', {cancelable: true, detail: {state, options}}))) {
			return;
		}

		if (state.ui) {
			this.handleSnippets(state.ui);
			this.handleTitle(state.title);

		} else if (state.ui === false) {
			this.naja.makeRequest(
				'GET',
				state.href,
				null,
				{
					...options,
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

		if (element.hasAttribute('data-naja-history-cache') || (element as HTMLInputElement).form?.hasAttribute('data-naja-history-cache')) {
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
			this.buildState(this.href!, uiCache, options),
			window.document.title,
			this.href!,
		);

		this.href = null;
	}

	private buildState(href: string, uiCache: boolean, options: Options): HistoryState {
		let state: HistoryState;

		if (uiCache) {
			state = {
				href,
				title: window.document.title,
				ui: this.findSnippets(),
			};

		} else {
			state = {
				href,
				ui: false,
			};
		}

		this.dispatchEvent(new CustomEvent('buildState', {detail: {state, options}}));
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

	declare public addEventListener: <K extends keyof HistoryHandlerEventMap | string>(type: K, listener: TypedEventListener<HistoryHandler, K extends keyof HistoryHandlerEventMap ? HistoryHandlerEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
	declare public removeEventListener: <K extends keyof HistoryHandlerEventMap | string>(type: K, listener: TypedEventListener<HistoryHandler, K extends keyof HistoryHandlerEventMap ? HistoryHandlerEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
}

export type BuildStateEvent = CustomEvent<{state: HistoryState, options: Options}>;
export type RestoreStateEvent = CustomEvent<{state: HistoryState, options: Options}>;

interface HistoryHandlerEventMap {
	buildState: BuildStateEvent;
	restoreState: RestoreStateEvent;
}
