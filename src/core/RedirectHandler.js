export class RedirectHandler extends EventTarget {
	constructor(naja) {
		super();
		this.naja = naja;

		naja.uiHandler.addEventListener('interaction', (event) => {
			const {element, options} = event.detail;
			if ( ! element) {
				return;
			}

			if (element.hasAttribute('data-naja-force-redirect') || element.form?.hasAttribute('data-naja-force-redirect')) {
				const value = element.getAttribute('data-naja-force-redirect') ?? element.form?.getAttribute('data-naja-force-redirect');
				options.forceRedirect = value !== 'off';
			}
		});

		naja.addEventListener('success', (event) => {
			const {payload, options} = event.detail;
			if (payload.redirect) {
				this.makeRedirect(payload.redirect, options.forceRedirect, options);
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
}
