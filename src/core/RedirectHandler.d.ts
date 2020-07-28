import {Options} from '../Naja';

export interface LocationAdapter {
	assign(url: string): void;
}

export declare class RedirectHandler extends EventTarget {
	public locationAdapter: LocationAdapter;
	public makeRedirect(url: string | URL, force: boolean): void;

	public addEventListener(type: 'redirect', listener: (this: RedirectHandler, event: RedirectEvent) => any, options?: boolean | AddEventListenerOptions): void;
	public addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
	public removeEventListener(type: 'redirect', listener: (this: RedirectHandler, event: RedirectEvent) => any, options?: boolean | AddEventListenerOptions): void;
	public removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
}

export type RedirectEvent = CustomEvent<{url: string, isHardRedirect: boolean, setHardRedirect: (value: boolean) => void, options: Options}>;
