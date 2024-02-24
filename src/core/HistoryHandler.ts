import {BeforeEvent, Naja, Options, SuccessEvent} from '../Naja';
import {RedirectEvent} from './RedirectHandler';
import {InteractionEvent} from './UIHandler';
import {onDomReady, TypedEventListener} from '../utils';

declare module '../Naja' {
	interface Options {
		history?: HistoryMode;
		href?: string;
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
	replaceState(state: HistoryState, url: string): void;
	pushState(state: HistoryState, url: string): void;
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
		naja.addEventListener('before', this.replaceInitialState.bind(this));
		naja.addEventListener('success', this.pushNewState.bind(this));

		naja.redirectHandler.addEventListener('redirect', this.saveRedirectedUrl.bind(this));

		naja.uiHandler.addEventListener('interaction', this.configureMode.bind(this));

		this.historyAdapter = {
			replaceState: (state, url) => window.history.replaceState(state, '', url),
			pushState: (state, url) => window.history.pushState(state, '', url),
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

		const direction = state.cursor - this.cursor;
		this.cursor = state.cursor;

		const options = this.naja.prepareOptions();
		this.dispatchEvent(new CustomEvent('restoreState', {detail: {state, direction, options}}));
	}

	private initialize(): void {
		window.addEventListener('popstate', this.popStateHandler);
	}

	private saveUrl(event: BeforeEvent): void {
		const {url, options} = event.detail;
		options.href ??= url;
	}

	private saveRedirectedUrl(event: RedirectEvent): void {
		const {url, options} = event.detail;
		options.href = url;
	}

	private replaceInitialState(event: BeforeEvent): void {
		const {options} = event.detail;
		const mode = HistoryHandler.normalizeMode(options.history);
		if (mode !== false && ! this.initialized) {
			onDomReady(() => this.historyAdapter.replaceState(
				this.buildState(window.location.href, 'replace', this.cursor, options),
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

		this.historyAdapter[method](
			this.buildState(options.href!, mode, cursor, options),
			options.href!,
		);
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
				options,
			},
		}));

		return state;
	}

	declare public addEventListener: <K extends keyof HistoryHandlerEventMap | string>(type: K, listener: TypedEventListener<HistoryHandler, K extends keyof HistoryHandlerEventMap ? HistoryHandlerEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
	declare public removeEventListener: <K extends keyof HistoryHandlerEventMap | string>(type: K, listener: TypedEventListener<HistoryHandler, K extends keyof HistoryHandlerEventMap ? HistoryHandlerEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
}

export type BuildStateEvent = CustomEvent<{state: HistoryState, operation: 'pushState' | 'replaceState', options: Options}>;
export type RestoreStateEvent = CustomEvent<{state: HistoryState, direction: number, options: Options}>;

interface HistoryHandlerEventMap {
	buildState: BuildStateEvent;
	restoreState: RestoreStateEvent;
}
