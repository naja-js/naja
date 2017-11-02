import EventTarget from 'event-target-shim';


export default class SnippetHandler extends EventTarget {
	constructor(naja) {
		super();
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
		const canUpdate = this.dispatchEvent({
			type: 'beforeUpdate',
			cancelable: true,
			snippet: el,
			content,
		});

		if ( ! canUpdate) {
			return;
		}

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

		this.dispatchEvent({
			type: 'afterUpdate',
			cancelable: true,
			snippet: el,
			content,
		});
	}
}
