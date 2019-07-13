export class RedirectHandler extends EventTarget {
	constructor(naja) {
		super();
		this.naja = naja;

		naja.uiHandler.addEventListener('interaction', (event) => {
			const {element, options} = event.detail;
			if ( ! element) {
				return;
			}

			if (element.hasAttribute('data-naja-force-redirect')) {
				options.forceRedirect = element.getAttribute('data-naja-force-redirect') !== 'off';
			}
		});

		naja.addEventListener('success', (event) => {
			const {payload, options} = event.detail;
			if (payload.redirect) {
				if ('forceRedirect' in payload) {
					// eslint-disable-next-line no-console
					console.warn(
						'Support for `forceRedirect` key in response payload is deprecated and will be removed in Naja 2.0. '
						+ 'Please use `options.forceRedirect = true` option or `data-naja-force-redirect` attribute.'
					);
				}

				this.makeRedirect(payload.redirect, payload.forceRedirect || options.forceRedirect, options);
				event.stopImmediatePropagation();
			}
		});

		this.locationAdapter = {
			assign: (url) => window.location.assign(url),
		};
	}

	makeRedirect(url, force, options = {}) {
		if (url instanceof URL) {
			url = url.href;
		}

		let isHardRedirect = force || ! this.naja.uiHandler.isUrlAllowed(url);
		const canRedirect = this.dispatchEvent(new CustomEvent('redirect', {
			cancelable: true,
			detail: {
				url,
				isHardRedirect,
				setHardRedirect(value) {
					isHardRedirect = !!value;
				},
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
}
