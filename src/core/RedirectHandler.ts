import {Naja, Options} from '../Naja';
import {TypedEventListener} from '../utils';

declare module '../Naja' {
	interface Options {
		forceRedirect?: boolean;
	}

	interface Payload {
		redirect?: string;
	}
}

interface LocationAdapter {
	assign(url: string): void;
}

export class RedirectHandler extends EventTarget {
	public locationAdapter: LocationAdapter;

	public constructor(private readonly naja: Naja) {
		super();

		naja.uiHandler.addEventListener('interaction', (event) => {
			const {element, options} = event.detail;
			if (element.hasAttribute('data-naja-force-redirect') || (element as HTMLInputElement).form?.hasAttribute('data-naja-force-redirect')) {
				const value = element.getAttribute('data-naja-force-redirect') ?? (element as HTMLInputElement).form?.getAttribute('data-naja-force-redirect');
				options.forceRedirect = value !== 'off';
			}
		});

		naja.addEventListener('success', (event) => {
			const {payload, options} = event.detail;
			if ( ! payload.redirect) {
				return;
			}

			this.makeRedirect(payload.redirect, options.forceRedirect ?? false, options);
			event.stopImmediatePropagation();
		});

		this.locationAdapter = {
			assign: (url) => window.location.assign(url),
		};
	}

	public makeRedirect(url: string | URL, force: boolean, options: Options = {}): void {
		if (url instanceof URL) {
			url = url.href;
		}

		let isHardRedirect = force || ! this.naja.uiHandler.isUrlAllowed(url);
		const canRedirect = this.dispatchEvent(new CustomEvent('redirect', {
			cancelable: true,
			detail: {
				url,
				setUrl(value: string) {
					url = value;
				},
				isHardRedirect,
				setHardRedirect(value: boolean) {
					isHardRedirect = !!value;
				},
				options,
			},
		}));

		if ( ! canRedirect) {
			return;
		}

		if (isHardRedirect) {
			this.locationAdapter.assign(url);

		} else {
			this.naja.makeRequest('GET', url, null, options);
		}
	}

	declare public addEventListener: <K extends keyof RedirectHandlerEventMap | string>(type: K, listener: TypedEventListener<RedirectHandler, K extends keyof RedirectHandlerEventMap ? RedirectHandlerEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
	declare public removeEventListener: <K extends keyof RedirectHandlerEventMap | string>(type: K, listener: TypedEventListener<RedirectHandler, K extends keyof RedirectHandlerEventMap ? RedirectHandlerEventMap[K] : CustomEvent>, options?: boolean | AddEventListenerOptions) => void;
}

export type RedirectEvent = CustomEvent<{url: string, setUrl: (value: string) => void, isHardRedirect: boolean, setHardRedirect: (value: boolean) => void, options: Options}>;

interface RedirectHandlerEventMap {
	redirect: RedirectEvent;
}
