export default class SnippetHandler {
	constructor(naja) {
		naja.addEventListener('success', ({response}) => {
			if (response.snippets) {
				this.updateSnippets(response.snippets);
			}
		});
	}

	updateSnippets(snippets, forceReplace = false) {
		Object.keys(snippets).forEach((id) => {
			const el = document.getElementById(id);
			if (el) {
				this.updateSnippet(el, snippets[id], forceReplace);
			}
		});
	}

	updateSnippet(el, content, forceReplace) {
		if (el.tagName.toLowerCase() === 'title') {
			document.title = content;

		} else {
			if ((el.getAttribute('data-naja-snippet-prepend') || el.getAttribute('data-ajax-prepend')) && ! forceReplace) {
				el.innerHTML = content + el.innerHTML;

			} else if ((el.getAttribute('data-naja-snippet-append') || el.getAttribute('data-ajax-append')) && ! forceReplace) {
				el.innerHTML = el.innerHTML + content;

			} else {
				el.innerHTML = content;
			}
		}
	}
}
