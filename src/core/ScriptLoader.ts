import {Naja} from '../Naja';
import {onDomReady} from '../utils';

export class ScriptLoader {
	private loadedScripts = new Set<string>();

	public constructor(naja: Naja) {
		naja.addEventListener('init', () => {
			onDomReady(() => {
				document.querySelectorAll('script[data-naja-script-id]').forEach((script) => {
					const scriptId = script.getAttribute('data-naja-script-id');
					if (scriptId !== null && scriptId !== '') {
						this.loadedScripts.add(scriptId);
					}
				});
			});

			naja.snippetHandler.addEventListener('afterUpdate', (event) => {
				const {content} = event.detail;
				this.loadScripts(content);
			});
		});
	}

	public loadScripts(content: string): void;
	public loadScripts(snippets: Record<string, string>): void;
	public loadScripts(snippetsOrSnippet: Record<string, string> | string): void {
		if (typeof snippetsOrSnippet === 'string') {
			this.loadScriptsInSnippet(snippetsOrSnippet);
			return;
		}

		Object.keys(snippetsOrSnippet).forEach((id) => {
			const content = snippetsOrSnippet[id];
			this.loadScriptsInSnippet(content);
		});
	}

	private loadScriptsInSnippet(content: string) {
		if (!/<script/i.test(content)) {
			return;
		}

		const el = window.document.createElement('div');
		el.innerHTML = content;

		const scripts = el.querySelectorAll('script');
		for (let i = 0; i < scripts.length; i++) {
			const script = scripts.item(i);
			const scriptId = script.getAttribute('data-naja-script-id');
			if (scriptId !== null && scriptId !== '' && this.loadedScripts.has(scriptId)) {
				continue;
			}

			const scriptEl = window.document.createElement('script');
			scriptEl.innerHTML = script.innerHTML;

			if (script.hasAttributes()) {
				const attrs = script.attributes;
				for (let j = 0; j < attrs.length; j++) {
					const attrName = attrs[j].name;
					scriptEl.setAttribute(attrName, attrs[j].value);
				}
			}

			window.document.head.appendChild(scriptEl)
				.parentNode!.removeChild(scriptEl);

			if (scriptId !== null && scriptId !== '') {
				this.loadedScripts.add(scriptId);
			}
		}
	}
}
