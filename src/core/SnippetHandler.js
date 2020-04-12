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

	updateSnippets(snippets, fromCache = false) {
		Object.keys(snippets).forEach((id) => {
			const el = document.getElementById(id);
			if (el) {
				this.updateSnippet(el, snippets[id], fromCache);
			}
		});
	}

	updateSnippet(el, content, fromCache) {
		const canUpdate = this.dispatchEvent({
			type: 'beforeUpdate',
			cancelable: true,
			snippet: el,
			content,
			fromCache,
		});

		if ( ! canUpdate) {
			return;
		}

		if (el.tagName.toLowerCase() === 'title') {
			document.title = content;

		} else {
			if ((el.hasAttribute('data-naja-snippet-prepend') || el.hasAttribute('data-ajax-prepend')) && ! fromCache) {
				el.insertAdjacentHTML('afterbegin', content);

			} else if ((el.hasAttribute('data-naja-snippet-append') || el.hasAttribute('data-ajax-append')) && ! fromCache) {
				el.insertAdjacentHTML('beforeend', content);

			} else {
				el.innerHTML = content;
			}
		}

		this.dispatchEvent({
			type: 'afterUpdate',
			cancelable: true,
			snippet: el,
			content,
			fromCache,
		});
	}
}
