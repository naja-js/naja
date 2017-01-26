import Component from '../Component';


export default class RedirectHandler extends Component {
	constructor(naja) {
		super(naja);
		naja.addEventListener('success', evt => {
			const {response} = evt;
			if (response.redirect) {
				this.makeRedirect(response.redirect, response.forward);
				evt.stopImmediatePropagation();
			}
		});
	}

	makeRedirect(url, forward) {
		if (forward) {
			this.naja.makeRequest('GET', url);

		} else {
			window.location.href = url;
		}
	}
}
