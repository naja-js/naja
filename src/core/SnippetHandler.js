import Component from '../Component';


export default class SnippetHandler extends Component {
	constructor(naja) {
		super(naja);
		naja.addEventListener('success', ({response}) => {
			if (response.snippets) {
				this.updateSnippets(response.snippets);
			}
		});
	}

	updateSnippets(snippets) {
		Object.keys(snippets).forEach((id) => {
			const el = document.getElementById(id);
			if (el) {
				this.updateSnippet(el, snippets[id]);
			}
		});
	}

	updateSnippet(el, content) {
		if (el.tagName.toLowerCase() === 'title') {
			document.title = content;

		} else {
			if (el.getAttribute('data-naja-snippet-prepend') || el.getAttribute('data-ajax-prepend')) {
				el.innerHTML = content + el.innerHTML;

			} else if (el.getAttribute('data-naja-snippet-append') || el.getAttribute('data-ajax-append')) {
				el.innerHTML = el.innerHTML + content;

			} else {
				el.innerHTML = content;
			}
		}
	}
}
