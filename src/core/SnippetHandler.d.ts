export declare class SnippetHandler extends EventTarget {
	public addEventListener(type: 'beforeUpdate' | 'afterUpdate', listener: (this: SnippetHandler, event: SnippetUpdateEvent) => any, options?: boolean | AddEventListenerOptions): void;
	public addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
	public removeEventListener(type: 'beforeUpdate' | 'afterUpdate', listener: (this: SnippetHandler, event: SnippetUpdateEvent) => any, options?: boolean | AddEventListenerOptions): void;
	public removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
}

export type SnippetUpdateEvent = CustomEvent<{snippet: Element, content: string, fromCache: boolean}>;
