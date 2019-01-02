import EventTarget from 'event-target-shim';


export default class RedirectHandler extends EventTarget {
	constructor(naja) {
		super();
		this.naja = naja;

		naja.addEventListener('interaction', (evt) => {
			const {element, options} = evt;
			if ( ! element) {
				return;
			}

			if (element.hasAttribute('data-naja-force-redirect')) {
				options.forceRedirect = element.getAttribute('data-naja-force-redirect') !== 'off';
			}
		});

		naja.addEventListener('success', (evt) => {
			const {payload, options} = evt;
			if (payload.redirect) {
				if ('forceRedirect' in payload) {
					// eslint-disable-next-line no-console
					console.warn(
						'Support for `forceRedirect` key in response payload is deprecated and will be removed in Naja 2.0. '
						+ 'Please use `options.forceRedirect = true` option or `data-naja-force-redirect` attribute.'
					);
				}

				this.makeRedirect(payload.redirect, payload.forceRedirect || options.forceRedirect, options);
				evt.stopImmediatePropagation();
			}
		});

		this.locationAdapter = {
			assign: (url) => window.location.assign(url),
		};
	}

	makeRedirect(url, force, options = {}) {
		let isHardRedirect = force || ! this.naja.uiHandler.isUrlAllowed(url);
		const canRedirect = this.dispatchEvent({
			type: 'redirect',
			cancelable: true,
			url,
			isHardRedirect,
			setHardRedirect(value) {
				isHardRedirect = !!value;
			},
		});

		if ( ! canRedirect) {
			return;
		}

		if (isHardRedirect) {
			this.locationAdapter.assign(url);

		} else {
			this.naja.makeRequest('GET', url, null, options);
		}
	}
}
