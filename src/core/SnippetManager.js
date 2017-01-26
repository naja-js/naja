import Component from '../Component';


export default class SnippetManager extends Component {
	constructor(naja) {
		super(naja);
		naja.addEventListener('success', ({response}) => {
			if ('snippets' in response) {
				this.updateSnippets(snippets);
			}
		});
	}

	updateSnippets(snippets) {
		for (let id in snippets) {
			if (snippets.hasOwnProperty(id)) {
				const el = document.getElementById(id);
				if (!!el) {
					this.updateSnippet(el, snippets[id]);
				}
			}
		}
	}

	updateSnippet(el, content) {
		if (el.tagName.toLowerCase() === 'title') {
			document.title = content;

		} else {
			if (el.getAttribute('data-ajax-prepend')) {
				el.innerHTML = content + el.innerHTML;

			} else if (el.getAttribute('data-ajax-append')) {
				el.innerHTML = el.innerHTML + content;

			} else {
				el.innerHTML = content;
			}
		}
	}
}
