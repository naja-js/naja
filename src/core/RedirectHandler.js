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
	}

	makeRedirect(url, force) {
		const externalRedirect = /^https?/i.test(url) && ! new RegExp(`^${window.location.origin}`, 'i').test(url);
		if (force || externalRedirect) {
			window.location.href = url;

		} else {
			this.naja.makeRequest('GET', url);
		}
	}
}
