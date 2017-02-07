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
		Object.keys(snippets).forEach((id) => {
			const content = snippets[id];
			if ( ! /<[^>]*script/i.test(content)) {
				return;
			}

			const el = window.document.createElement('div');
			el.innerHTML = content;

			el.querySelectorAll('script').forEach((script) => {
				window.document.head.appendChild(script)
					.parentNode.removeChild(script);
			});
		});
	}
}
