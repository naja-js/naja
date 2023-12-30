import {Naja} from '../Naja';
import {onDomReady} from '../utils';

export class ScriptLoader {
	private loadedScripts = new Set<string>();

	private static parser = new DOMParser();

	public constructor(private readonly naja: Naja) {
		naja.addEventListener('init', this.initialize.bind(this));
	}

	private initialize(): void {
		onDomReady(() => {
			document.querySelectorAll('script[data-naja-script-id]').forEach((script) => {
				const scriptId = script.getAttribute('data-naja-script-id');
				if (scriptId !== null && scriptId !== '') {
					this.loadedScripts.add(scriptId);
				}
			});
		});

		this.naja.snippetHandler.addEventListener('afterUpdate', (event) => {
			const {content} = event.detail;
			this.loadScripts(content);
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

		const snippetContent = ScriptLoader.parser.parseFromString(content, 'text/html');
		const scripts = snippetContent.querySelectorAll('script');

		scripts.forEach((script) => {
			const scriptId = script.getAttribute('data-naja-script-id');
			if (scriptId !== null && scriptId !== '' && this.loadedScripts.has(scriptId)) {
				return;
			}

			const scriptEl = window.document.createElement('script');
			scriptEl.innerHTML = script.innerHTML;

			if (script.hasAttributes()) {
				for (const attribute of script.attributes) {
					scriptEl.setAttribute(attribute.name, attribute.value);
				}
			}

			window.document.head.appendChild(scriptEl)
				.parentNode!.removeChild(scriptEl);

			if (scriptId !== null && scriptId !== '') {
				this.loadedScripts.add(scriptId);
			}
		});
	}
}
