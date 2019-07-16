import {UIHandler} from './core/UIHandler';
import {FormsHandler} from './core/FormsHandler';
import {RedirectHandler} from './core/RedirectHandler';
import {SnippetHandler} from './core/SnippetHandler';
import {HistoryHandler} from './core/HistoryHandler';
import {ScriptLoader} from './core/ScriptLoader';

export type Options = {
	fetch?: RequestInit;
	[key: string]: any;
};

export interface Payload {
	snippets?: { [id: string]: string };

	redirect?: string;
	forceRedirect?: boolean;

	postGet?: boolean;
	url?: string;

	[key: string]: any;
}

export declare class Naja extends EventTarget {
	public readonly uiHandler: UIHandler;
	public readonly redirectHandler: RedirectHandler;
	public readonly snippetHandler: SnippetHandler;
	public readonly formsHandler: FormsHandler;
	public readonly historyHandler: HistoryHandler;
	public readonly scriptLoader: ScriptLoader;

	public constructor();

	public registerExtension(
		extensionClass: { new(naja: Naja, ...args: any[]): any },
		...args: any[],
	): void;

	public initialize(
		defaultOptions: Options,
	): void;

	public makeRequest(
		method: string,
		url: URL | string,
		data?: any | null,
		options?: Options,
	): Promise<Payload>;

	public addEventListener<K extends keyof NajaEventMap>(type: K, listener: (this: Naja, event: NajaEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	public addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
	public removeEventListener<K extends keyof NajaEventMap>(type: K, listener: (this: Naja, event: NajaEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	public removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
}

export declare class HttpError extends Error {
	public readonly response: Response;
}

export type InitEvent = CustomEvent<{defaultOptions: Options}>;
export type LoadEvent = CustomEvent<never>;
export type BeforeEvent = CustomEvent<{request: Request, method: string, url: string, data: any, options: Options}>;
export type StartEvent = CustomEvent<{request: Request, promise: Promise<Response>, abortController: AbortController, options: Options}>;
export type AbortEvent = CustomEvent<{request: Request, error: Error, options: Options}>;
export type SuccessEvent = CustomEvent<{request: Request, response: Response, payload: Payload, options: Options}>;
export type ErrorEvent = CustomEvent<{request: Request, response: Response | undefined, error: Error, options: Options}>;
export type CompleteEvent = CustomEvent<{request: Request, response: Response | undefined, error: Error | undefined, payload: Payload | undefined, options: Options}>;

interface NajaEventMap {
	"init": InitEvent;
	"load": LoadEvent;
	"before": BeforeEvent;
	"start": StartEvent;
	"abort": AbortEvent;
	"success": SuccessEvent;
	"error": ErrorEvent;
	"complete": CompleteEvent;
}
