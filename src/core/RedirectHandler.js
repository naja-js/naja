import EventTarget from 'event-target-shim';
import objectAssign from 'object-assign';


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
			const {response, options} = evt;
			if (response.redirect) {
				if ('forceRedirect' in response) {
					// eslint-disable-next-line no-console
					console.warn(
						'Support for `forceRedirect` key in response payload is deprecated and will be removed in Naja 2.0. '
						+ 'Please use `options.forceRedirect = true` option or `data-naja-force-redirect` attribute.'
					);
				}

				this.makeRedirect(response.redirect, response.forceRedirect || options.forceRedirect, options);
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
			const redirectOptions = objectAssign({}, options, {
				history: 'history' in options && ! options.history ? false : 'replace',
			});

			this.naja.makeRequest('GET', url, null, redirectOptions);
		}
	}
}
