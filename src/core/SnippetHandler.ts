import {Naja, Options} from '../Naja';
import {TypedEventListener} from '../utils';

declare module '../Naja' {
	interface Payload {
		snippets?: Record<string, string>;
	}
}

export type SnippetUpdateOperation =
	((snippet: Element, content: string) => void | Promise<void>) | {
		updateElement(snippet: Element, content: string): void | Promise<void>;
		updateIndex(currentContent: string, newContent: string): string;
	};

export class SnippetHandler extends EventTarget {
	public readonly op: Record<'replace' | 'prepend' | 'append', SnippetUpdateOperation> = {
		replace: {
			updateElement(snippet, content) {
				snippet.innerHTML = content;
			},
			updateIndex(_, newContent) {
				return newContent;
			},
		},
		prepend: {
			updateElement(snippet, content) {
				snippet.insertAdjacentHTML('afterbegin', content);
			},
			updateIndex(currentContent, newContent) {
				return newContent + currentContent;
			},
		},
		append: {
			updateElement(snippet, content) {
				snippet.insertAdjacentHTML('beforeend', content);
			},
			updateIndex(currentContent, newContent) {
				return currentContent + newContent;
			},
		},
	};

	public constructor(naja: Naja) {
		super();
		naja.addEventListener('success', (event) => {
			const {options, payload} = event.detail;
			if ( ! payload.snippets) {
				return;
			}

			this.updateSnippets(payload.snippets, false, options);
		});
	}

	public static findSnippets(
		predicate?: (snippet: Element) => boolean,
		document: Document = window.document,
	): Record<string, string> {
		const result: Record<string, string> = {};
		const snippets = document.querySelectorAll('[id^="snippet-"]');
		snippets.forEach((snippet) => {
			if (predicate?.(snippet) ?? true) {
				result[snippet.id] = snippet.innerHTML;
			}
		});

		return result;
	}

	public async updateSnippets(snippets: Record<string, string>, fromCache = false, options: Options = {}): Promise<void> {
		await Promise.all(Object.keys(snippets).map(async (id) => {
			const snippet = document.getElementById(id);
			if (snippet) {
				await this.updateSnippet(snippet, snippets[id], fromCache, options);
			}
		}));
	}

	public async updateSnippet(snippet: Element, content: string, fromCache: boolean, options: Options): Promise<void> {
		let operation = this.op.replace;
		if ((snippet.hasAttribute('data-naja-snippet-prepend') || snippet.hasAttribute('data-ajax-prepend')) && ! fromCache) {
			operation = this.op.prepend;
		} else if ((snippet.hasAttribute('data-naja-snippet-append') || snippet.hasAttribute('data-ajax-append')) && ! fromCache) {
			operation = this.op.append;
		}

		const canUpdate = this.dispatchEvent(new CustomEvent('beforeUpdate', {
			cancelable: true,
			detail: {
				snippet,
				content,
				fromCache,
				operation,
				changeOperation(value: SnippetUpdateOperation) {
					operation = value;
				},
				options,
			},
		}));

		if ( ! canUpdate) {
			return;
		}

		this.dispatchEvent(new CustomEvent('pendingUpdate', {
			detail: {
				snippet,
				content,
				fromCache,
				operation,
				options,
			},
		}));

		const updateElement = typeof operation === 'function' ? operation : operation.updateElement;
		const updateOperation = updateElement(snippet, content);
		if (updateOperation instanceof Promise) {
			await updateOperation;
		}

		this.dispatchEvent(new CustomEvent('afterUpdate', {
			detail: {
				snippet,
				content,
				fromCache,
				operation,
				options,
			},
		}));
	}

	declare public addEventListener: <K extends keyof SnippetHandlerEventMap | string>(type: K, listener: TypedEventListener<SnippetHandler, K extends keyof SnippetHandlerEventMap ? SnippetHandlerEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
	declare public removeEventListener: <K extends keyof SnippetHandlerEventMap | string>(type: K, listener: TypedEventListener<SnippetHandler, K extends keyof SnippetHandlerEventMap ? SnippetHandlerEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
}

export type BeforeUpdateEvent = CustomEvent<{snippet: Element, content: string, fromCache: boolean, operation: SnippetUpdateOperation, changeOperation: (value: SnippetUpdateOperation) => void, options: Options}>;
export type PendingUpdateEvent = CustomEvent<{snippet: Element, content: string, fromCache: boolean, operation: SnippetUpdateOperation, options: Options}>;
export type AfterUpdateEvent = CustomEvent<{snippet: Element, content: string, fromCache: boolean, operation: SnippetUpdateOperation, options: Options}>;

interface SnippetHandlerEventMap {
	beforeUpdate: BeforeUpdateEvent;
	pendingUpdate: PendingUpdateEvent;
	afterUpdate: AfterUpdateEvent;
}
