import Component from '../Component';


export default class ScriptLoader extends Component {
	constructor(naja) {
		super(naja);
		naja.addEventListener('success', ({response}) => {
			if (response.snippets) {
				this.loadScripts(response.snippets);
			}
		});
	}

	loadScripts(snippets) {
		for (const id in snippets) {
			if (snippets.hasOwnProperty(id) && /<[^>]*script/i.test(snippets[id])) {
				if ( ! document.getElementById(id)) {
					continue;
				}

				const el = window.document.createElement('div');
				el.innerHTML = snippets[id];

				el.querySelectorAll('script').forEach((script) => {
					window.document.head.appendChild(script)
						.parentNode.removeChild(script);
				});
			}
		}
	}
}
