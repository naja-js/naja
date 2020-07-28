import {Options} from '../Naja';

type SnippetUpdateOperation = (snippet: Element, content: string) => void;

export declare class SnippetHandler extends EventTarget {
	public op: {
		replace: SnippetUpdateOperation;
		prepend: SnippetUpdateOperation;
		append: SnippetUpdateOperation;
	};

	public addEventListener(type: 'beforeUpdate', listener: (this: SnippetHandler, event: BeforeUpdateEvent) => any, options?: boolean | AddEventListenerOptions): void;
	public addEventListener(type: 'afterUpdate', listener: (this: SnippetHandler, event: AfterUpdateEvent) => any, options?: boolean | AddEventListenerOptions): void;
	public addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
	public removeEventListener(type: 'beforeUpdate', listener: (this: SnippetHandler, event: BeforeUpdateEvent) => any, options?: boolean | AddEventListenerOptions): void;
	public removeEventListener(type: 'afterUpdate', listener: (this: SnippetHandler, event: AfterUpdateEvent) => any, options?: boolean | AddEventListenerOptions): void;
	public removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
}

export type BeforeUpdateEvent = CustomEvent<{snippet: Element, content: string, fromCache: boolean, operation: SnippetUpdateOperation, changeOperation: (value: SnippetUpdateOperation) => void, options: Options}>;
export type AfterUpdateEvent = CustomEvent<{snippet: Element, content: string, fromCache: boolean, operation: SnippetUpdateOperation, options: Options}>;
