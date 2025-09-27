import {BeforeEvent, Naja, Options, SuccessEvent} from '../Naja';
import {RedirectEvent} from './RedirectHandler';
import {InteractionEvent} from './UIHandler';
import {onDomReady, TypedEventListener} from '../utils';

const originalTitleKey = Symbol();

declare module '../Naja' {
	interface Options {
		history?: HistoryMode;
		href?: string;
		[originalTitleKey]?: string;
	}

	interface Payload {
		postGet?: boolean;
		url?: string;
	}
}

export interface HistoryState extends Record<string, any> {
	source: string;
	cursor: number;
	href: string;
}

export interface HistoryAdapter {
	state: HistoryState | null;
	replaceState(state: HistoryState, title: string, url: string): void;
	pushState(state: HistoryState, title: string, url: string): void;
}

export type HistoryMode = boolean | 'replace';

export class HistoryHandler extends EventTarget {
	private initialized = false;
	private cursor = 0;

	public popStateHandler = this.handlePopState.bind(this);
	public historyAdapter: HistoryAdapter;

	public constructor(private readonly naja: Naja) {
		super();

		naja.addEventListener('init', this.initialize.bind(this));
		naja.addEventListener('before', this.saveUrl.bind(this));
		naja.addEventListener('before', this.saveOriginalTitle.bind(this));
		naja.addEventListener('before', this.replaceInitialStateBeforeRequest.bind(this));
		naja.addEventListener('success', this.pushNewState.bind(this));

		naja.redirectHandler.addEventListener('redirect', this.saveRedirectedUrl.bind(this));

		naja.uiHandler.addEventListener('interaction', this.configureMode.bind(this));

		this.historyAdapter = {
			get state() {
				return window.history.state;
			},
			replaceState: (state, title, url) => window.history.replaceState(state, title, url),
			pushState: (state, title, url) => window.history.pushState(state, title, url),
		};
	}

	public set uiCache(value: boolean) {
		console.warn('Naja: HistoryHandler.uiCache is deprecated, use options.snippetCache instead.');
		this.naja.defaultOptions.snippetCache = value;
	}

	private handlePopState(event: PopStateEvent): void {
		const {state} = event;
		if (state?.source !== 'naja') {
			return;
		}

		this.replaceInitialState();

		const direction = state.cursor - this.cursor;
		this.cursor = state.cursor;

		const options = this.naja.prepareOptions();
		this.dispatchEvent(new CustomEvent('restoreState', {detail: {state, direction, options}}));
	}

	private initialize(): void {
		window.addEventListener('popstate', this.popStateHandler);

		if (this.historyAdapter.state?.source === 'naja') {
			this.cursor = this.historyAdapter.state.cursor;
			this.replaceInitialState();
		}
	}

	private saveOriginalTitle(event: BeforeEvent): void {
		const {options} = event.detail;
		options[originalTitleKey] = window.document.title;
	}

	private saveUrl(event: BeforeEvent): void {
		const {url, options} = event.detail;
		options.href ??= url;
	}

	private saveRedirectedUrl(event: RedirectEvent): void {
		const {url, options} = event.detail;
		options.href = url;
	}

	private replaceInitialStateBeforeRequest(event: BeforeEvent): void {
		const {options} = event.detail;
		const mode = HistoryHandler.normalizeMode(options.history);
		if (mode !== false) {
			this.replaceInitialState(options);
		}
	}

	private replaceInitialState(options: Options = this.naja.prepareOptions()): void {
		if ( ! this.initialized) {
			onDomReady(() => this.historyAdapter.replaceState(
				this.buildState(window.location.href, 'replace', this.cursor, options),
				window.document.title,
				window.location.href,
			));

			this.initialized = true;
		}
	}

	private configureMode(event: InteractionEvent): void {
		const {element, options} = event.detail;
		if (element.hasAttribute('data-naja-history') || (element as HTMLInputElement).form?.hasAttribute('data-naja-history')) {
			const value = element.getAttribute('data-naja-history') ?? (element as HTMLInputElement).form?.getAttribute('data-naja-history');
			options.history = HistoryHandler.normalizeMode(value);
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
			options.href = payload.url;
		}

		const method = mode === 'replace' ? 'replaceState' : 'pushState';
		const cursor = mode === 'replace' ? this.cursor : ++this.cursor;
		const state = this.buildState(options.href!, mode, cursor, options);

		// before the state is pushed into history, revert to the original title
		const newTitle = window.document.title;
		window.document.title = options[originalTitleKey]!;

		this.historyAdapter[method](
			state,
			newTitle,
			options.href!,
		);

		// after the state is pushed into history, update back to the new title
		window.document.title = newTitle;
	}

	private buildState(href: string, mode: HistoryMode, cursor: number, options: Options): HistoryState {
		const state: HistoryState = {
			source: 'naja',
			cursor,
			href,
		};

		this.dispatchEvent(new CustomEvent('buildState', {
			detail: {
				state,
				operation: mode === 'replace' ? 'replaceState' : 'pushState',
				isInitial: ! this.initialized,
				options,
			},
		}));

		return state;
	}

	declare public addEventListener: <K extends keyof HistoryHandlerEventMap | string>(type: K, listener: TypedEventListener<HistoryHandler, K extends keyof HistoryHandlerEventMap ? HistoryHandlerEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
	declare public removeEventListener: <K extends keyof HistoryHandlerEventMap | string>(type: K, listener: TypedEventListener<HistoryHandler, K extends keyof HistoryHandlerEventMap ? HistoryHandlerEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
}

export type BuildStateEvent = CustomEvent<{state: HistoryState, operation: 'pushState' | 'replaceState', isInitial: boolean, options: Options}>;
export type RestoreStateEvent = CustomEvent<{state: HistoryState, direction: number, options: Options}>;

interface HistoryHandlerEventMap {
	buildState: BuildStateEvent;
	restoreState: RestoreStateEvent;
}
