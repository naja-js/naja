import {Options} from '../Naja';

export declare class UIHandler extends EventTarget {
	public selector: string;
	public allowedOrigins: string[];

	public isUrlAllowed(url: string | URL): boolean;

	public bindUI(element: Element): void;
	public clickElement(element: Element, options: Options, event?: Event): void;
	public submitForm(form: HTMLFormElement, options: Options, event?: Event): void;

	public addEventListener(type: 'interaction', listener: (this: UIHandler, event: InteractionEvent) => any, options?: boolean | AddEventListenerOptions): void;
	public addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
	public removeEventListener(type: 'interaction', listener: (this: UIHandler, event: InteractionEvent) => any, options?: boolean | AddEventListenerOptions): void;
	public removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
}

export type InteractionEvent = CustomEvent<{element: Element, originalEvent?: Event, options: Options}>;
