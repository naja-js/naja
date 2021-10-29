import {BeforeEvent, InitEvent, Naja, Options, SuccessEvent} from '../Naja';
import {InteractionEvent} from './UIHandler';
import {onDomReady, TypedEventListener} from '../utils';

declare module '../Naja' {
	interface Options {
		history?: HistoryMode;
	}

	interface Payload {
		postGet?: boolean;
		url?: string;
	}
}

export interface HistoryState extends Record<string, any> {
	href: string;
}

export interface HistoryAdapter {
	replaceState(state: HistoryState, title: string, url: string): void;
	pushState(state: HistoryState, title: string, url: string): void;
}

export type HistoryMode = boolean | 'replace';

export class HistoryHandler extends EventTarget {
	private href: string | null = null;
	public popStateHandler = this.handlePopState.bind(this);
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

	public set uiCache(value: boolean) {
		console.warn('Naja: HistoryHandler.uiCache is deprecated, use options.snippetCache instead.');
		this.naja.defaultOptions.snippetCache = value;
	}

	private initialize(event: InitEvent): void {
		const {defaultOptions} = event.detail;
		window.addEventListener('popstate', this.popStateHandler);
		onDomReady(() => this.historyAdapter.replaceState(
			this.buildState(window.location.href, defaultOptions),
			window.document.title,
			window.location.href,
		));
	}

	private handlePopState(event: PopStateEvent): void {
		const {state} = event;
		if ( ! state) {
			return;
		}

		const options = this.naja.prepareOptions();
		this.dispatchEvent(new CustomEvent('restoreState', {detail: {state, options}}));
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
		this.historyAdapter[method](
			this.buildState(this.href!, options),
			window.document.title,
			this.href!,
		);

		this.href = null;
	}

	private buildState(href: string, options: Options): HistoryState {
		const state: HistoryState = {href};
		this.dispatchEvent(new CustomEvent('buildState', {detail: {state, options}}));
		return state;
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
