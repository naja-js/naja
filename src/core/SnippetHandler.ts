import {Naja, Options} from '../Naja';
import {TypedEventListener} from '../utils';

declare module '../Naja' {
	interface Payload {
		snippets?: Record<string, string>;
	}
}

type SnippetUpdateOperation = (snippet: Element, content: string) => void;

export class SnippetHandler extends EventTarget {
	public readonly op: Record<'replace' | 'prepend' | 'append', SnippetUpdateOperation> = {
		replace: (snippet, content) => {
			snippet.innerHTML = content;
		},
		prepend: (snippet, content) => snippet.insertAdjacentHTML('afterbegin', content),
		append: (snippet, content) => snippet.insertAdjacentHTML('beforeend', content),
	};

	public constructor(private readonly naja: Naja) {
		super();
		naja.addEventListener('success', (event) => {
			const {options, payload} = event.detail;
			if (payload.snippets) {
				this.updateSnippets(payload.snippets, false, options);
			}
		});
	}

	public static findSnippets(predicate?: (snippet: Element) => boolean): Record<string, string> {
		const result: Record<string, string> = {};
		const snippets = window.document.querySelectorAll('[id^="snippet-"]');
		for (let i = 0; i < snippets.length; i++) {
			const snippet = snippets.item(i);
			if (predicate?.(snippet) ?? true) {
				result[snippet.id] = snippet.innerHTML;
			}
		}

		return result;
	}

	public updateSnippets(snippets: Record<string, string>, fromCache = false, options: Options = {}): void {
		Object.keys(snippets).forEach((id) => {
			const snippet = document.getElementById(id);
			if (snippet) {
				this.updateSnippet(snippet, snippets[id], fromCache, options);
			}
		});
	}

	public updateSnippet(snippet: HTMLElement, content: string, fromCache: boolean, options: Options): void {
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

		if (snippet.tagName.toLowerCase() === 'title') {
			document.title = content;
		} else {
			operation(snippet, content);
		}

		this.dispatchEvent(new CustomEvent('afterUpdate', {
			cancelable: true,
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
export type AfterUpdateEvent = CustomEvent<{snippet: Element, content: string, fromCache: boolean, operation: SnippetUpdateOperation, options: Options}>;

interface SnippetHandlerEventMap {
	beforeUpdate: BeforeUpdateEvent;
	afterUpdate: AfterUpdateEvent;
}
