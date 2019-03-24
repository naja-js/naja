export default class SnippetHandler extends EventTarget {
	constructor(naja) {
		super();
		naja.addEventListener('success', (event) => {
			const {payload} = event.detail;
			if (payload.snippets) {
				this.updateSnippets(payload.snippets);
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
		const canUpdate = this.dispatchEvent(new CustomEvent('beforeUpdate', {
			cancelable: true,
			detail: {
				snippet: el,
				content,
			},
		}));

		if ( ! canUpdate) {
			return;
		}

		if (el.tagName.toLowerCase() === 'title') {
			document.title = content;

		} else {
			if ((el.hasAttribute('data-naja-snippet-prepend') || el.hasAttribute('data-ajax-prepend')) && ! forceReplace) {
				el.insertAdjacentHTML('afterbegin', content);

			} else if ((el.hasAttribute('data-naja-snippet-append') || el.hasAttribute('data-ajax-append')) && ! forceReplace) {
				el.insertAdjacentHTML('beforeend', content);

			} else {
				el.innerHTML = content;
			}
		}

		this.dispatchEvent(new CustomEvent('afterUpdate', {
			cancelable: true,
			detail: {
				snippet: el,
				content,
			},
		}));
	}
}
