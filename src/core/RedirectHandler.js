import Component from '../Component';


export default class RedirectHandler extends Component {
	constructor(naja) {
		super(naja);
		naja.addEventListener('success', (evt) => {
			const {response} = evt;
			if (response.redirect) {
				this.makeRedirect(response.redirect, response.forceRedirect);
				evt.stopImmediatePropagation();
			}
		});

		this.locationAdapter = {
			assign: (url) => window.location.assign(url),
		};
	}

	makeRedirect(url, force) {
		// window.location.origin is not supported in IE 10
		const origin = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
		const externalRedirect = /^https?/i.test(url) && ! new RegExp(`^${origin}`, 'i').test(url);
		if (force || externalRedirect) {
			this.locationAdapter.assign(url);

		} else {
			this.naja.makeRequest('GET', url);
		}
	}
}
