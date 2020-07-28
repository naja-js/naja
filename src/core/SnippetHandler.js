export class SnippetHandler extends EventTarget {
	op = {
		replace: (snippet, content) => {
			snippet.innerHTML = content;
		},
		prepend: (snippet, content) => snippet.insertAdjacentHTML('afterbegin', content),
		append: (snippet, content) => snippet.insertAdjacentHTML('beforeend', content),
	};

	constructor(naja) {
		super();
		naja.addEventListener('success', (event) => {
			const {options, payload} = event.detail;
			if (payload.snippets) {
				this.updateSnippets(payload.snippets, false, options);
			}
		});
	}

	updateSnippets(snippets, fromCache = false, options = {}) {
		Object.keys(snippets).forEach((id) => {
			const snippet = document.getElementById(id);
			if (snippet) {
				this.updateSnippet(snippet, snippets[id], fromCache, options);
			}
		});
	}

	updateSnippet(snippet, content, fromCache, options) {
		let operation = this.op.replace;
		if ((snippet.hasAttribute('data-naja-snippet-prepend') || snippet.hasAttribute('data-ajax-prepend')) && ! fromCache) {
			operation = this.op.prepend;
		} else if ((snippet.hasAttribute('data-naja-snippet-append') || snippet.hasAttribute('data-ajax-append')) && ! fromCache) {
			operation = this.op.append;
		}

		const canUpdate = this.dispatchEvent(new CustomEvent('beforeUpdate', {
			cancelable: true,
			detail: {
				snippet,
				content,
				fromCache,
				operation,
				changeOperation(value) {
					operation = value;
				},
				options,
			},
		}));

		if ( ! canUpdate) {
			return;
		}

		if (snippet.tagName.toLowerCase() === 'title') {
			document.title = content;
		} else {
			operation(snippet, content);
		}

		this.dispatchEvent(new CustomEvent('afterUpdate', {
			cancelable: true,
			detail: {
				snippet,
				content,
				fromCache,
				operation,
				options,
			},
		}));
	}
}
