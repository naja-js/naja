import {Naja, Options} from '../Naja';
import {InteractionEvent} from './UIHandler';
import {BuildStateEvent, HistoryState, RestoreStateEvent} from './HistoryHandler';
import {AfterUpdateEvent, SnippetHandler} from './SnippetHandler';
import {onDomReady, TypedEventListener} from '../utils';

declare module '../Naja' {
	interface Options {
		snippetCache?: boolean | SnippetCacheStorageType;
	}
}

declare module './HistoryHandler' {
	interface HistoryState {
		snippets?: {
			readonly storage: SnippetCacheStorageType;
			readonly key: SnippetCacheKey;
		};
	}
}

export class SnippetCache extends EventTarget {
	private readonly storages: Record<SnippetCacheStorageType, SnippetCacheStorage>;
	private currentSnippets: Map<string, string> = new Map();

	public constructor(private readonly naja: Naja) {
		super();

		this.storages = {
			off: new OffCacheStorage(naja),
			history: new HistoryCacheStorage(),
			session: new SessionCacheStorage(),
		};

		naja.addEventListener('init', this.initializeIndex.bind(this));
		naja.snippetHandler.addEventListener('afterUpdate', this.updateIndex.bind(this));

		naja.uiHandler.addEventListener('interaction', this.configureCache.bind(this));
		naja.historyHandler.addEventListener('buildState', this.buildHistoryState.bind(this));
		naja.historyHandler.addEventListener('restoreState', this.restoreHistoryState.bind(this));
	}

	private resolveStorage(option?: boolean | SnippetCacheStorageType): SnippetCacheStorage {
		let storageType: SnippetCacheStorageType;
		if (option === true || option === undefined) {
			storageType = 'history';
		} else if (option === false) {
			storageType = 'off';
		} else {
			storageType = option;
		}

		return this.storages[storageType];
	}

	private static shouldCacheSnippet(snippet: Element): boolean {
		return ! snippet.hasAttribute('data-naja-history-nocache')
			&& ! snippet.hasAttribute('data-history-nocache')
			&& ( ! snippet.hasAttribute('data-naja-snippet-cache')
				|| snippet.getAttribute('data-naja-snippet-cache') !== 'off');
	}

	private initializeIndex(): void {
		onDomReady(() => {
			const currentSnippets = SnippetHandler.findSnippets(SnippetCache.shouldCacheSnippet);
			this.currentSnippets = new Map(Object.entries(currentSnippets));
		});
	}

	private updateIndex(event: AfterUpdateEvent): void {
		const {snippet, content, operation} = event.detail;
		if ( ! SnippetCache.shouldCacheSnippet(snippet)) {
			return;
		}

		const currentContent = this.currentSnippets.get(snippet.id) ?? '';

		if (operation === this.naja.snippetHandler.op.replace) {
			this.currentSnippets.set(snippet.id, content);
		} else if (operation === this.naja.snippetHandler.op.append) {
			this.currentSnippets.set(snippet.id, currentContent + content);
		} else if (operation === this.naja.snippetHandler.op.prepend) {
			this.currentSnippets.set(snippet.id, content + currentContent);
		} else {
			this.currentSnippets.set(snippet.id, snippet.innerHTML);
		}
	}

	private configureCache(event: InteractionEvent): void {
		const {element, options} = event.detail;

		if ( ! element) {
			return;
		}

		if (element.hasAttribute('data-naja-snippet-cache') || (element as HTMLInputElement).form?.hasAttribute('data-naja-snippet-cache')
			|| element.hasAttribute('data-naja-history-cache') || (element as HTMLInputElement).form?.hasAttribute('data-naja-history-cache')
		) {
			const value = element.getAttribute('data-naja-snippet-cache')
				?? (element as HTMLInputElement).form?.getAttribute('data-naja-snippet-cache')
				?? element.getAttribute('data-naja-history-cache')
				?? (element as HTMLInputElement).form?.getAttribute('data-naja-history-cache');
			options.snippetCache = value as SnippetCacheStorageType;
		}
	}

	private buildHistoryState(event: BuildStateEvent): void {
		const {state, options} = event.detail;

		if ('historyUiCache' in options) {
			console.warn('Naja: options.historyUiCache is deprecated, use options.snippetCache instead.');
			options.snippetCache = options.historyUiCache;
		}

		const presentSnippetIds = Object.keys(SnippetHandler.findSnippets(SnippetCache.shouldCacheSnippet));
		const snippets = Object.fromEntries(Array.from(this.currentSnippets).filter(([id]) => presentSnippetIds.includes(id)));

		if ( ! this.dispatchEvent(new CustomEvent('store', {cancelable: true, detail: {snippets, state, options}}))) {
			return;
		}

		const storage = this.resolveStorage(options.snippetCache);
		state.snippets = {
			storage: storage.type,
			key: storage.store(snippets),
		};
	}

	private restoreHistoryState(event: RestoreStateEvent): void {
		const {state, options} = event.detail;

		if (state.snippets === undefined) {
			return;
		}

		options.snippetCache = state.snippets.storage;
		if ( ! this.dispatchEvent(new CustomEvent('fetch', {cancelable: true, detail: {state, options}}))) {
			return;
		}

		const storage = this.resolveStorage(options.snippetCache);
		const snippets = storage.fetch(state.snippets.key, state, options);
		if (snippets === null) {
			return;
		}

		if ( ! this.dispatchEvent(new CustomEvent('restore', {cancelable: true, detail: {snippets, state, options}}))) {
			return;
		}

		this.naja.snippetHandler.updateSnippets(snippets, true, options);
	}

	declare public addEventListener: <K extends keyof SnippetCacheEventMap | string>(type: K, listener: TypedEventListener<SnippetHandler, K extends keyof SnippetCacheEventMap ? SnippetCacheEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
	declare public removeEventListener: <K extends keyof SnippetCacheEventMap | string>(type: K, listener: TypedEventListener<SnippetHandler, K extends keyof SnippetCacheEventMap ? SnippetCacheEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
}

export type StoreEvent = CustomEvent<{snippets: CachedSnippets, state: HistoryState, options: Options}>;
export type FetchEvent = CustomEvent<{state: HistoryState, options: Options}>;
export type RestoreEvent = CustomEvent<{snippets: CachedSnippets, state: HistoryState, options: Options}>;

interface SnippetCacheEventMap {
	store: StoreEvent;
	fetch: FetchEvent;
	restore: RestoreEvent;
}

type CachedSnippets = Record<string, string>;
type SnippetCacheKey = CachedSnippets | string | null;

type SnippetCacheStorageType = 'off' | 'history' | 'session';

interface SnippetCacheStorage {
	readonly type: SnippetCacheStorageType;
	store(data: CachedSnippets): SnippetCacheKey;
	fetch(key: SnippetCacheKey, state: HistoryState, options: Options): CachedSnippets | null;
}

class OffCacheStorage implements SnippetCacheStorage {
	public readonly type = 'off';
	public constructor(private readonly naja: Naja) {} // eslint-disable-line no-empty-function

	public store(): null {
		return null;
	}

	public fetch(key: null, state: HistoryState, options: Options): CachedSnippets | null {
		this.naja.makeRequest(
			'GET',
			state.href,
			null,
			{
				...options,
				history: false,
				snippetCache: false,
			},
		);

		return null;
	}
}

class HistoryCacheStorage implements SnippetCacheStorage {
	public readonly type = 'history';

	public store(data: CachedSnippets): CachedSnippets {
		return data;
	}

	public fetch(key: CachedSnippets): CachedSnippets | null {
		return key;
	}
}

class SessionCacheStorage implements SnippetCacheStorage {
	public readonly type = 'session';

	public store(data: CachedSnippets): string {
		const key = Math.random().toString(36).substring(2, 8);
		window.sessionStorage.setItem(key, JSON.stringify(data));
		return key;
	}

	public fetch(key: string): CachedSnippets | null {
		const data = window.sessionStorage.getItem(key);
		if (data === null) {
			return null;
		}

		return JSON.parse(data);
	}
}
