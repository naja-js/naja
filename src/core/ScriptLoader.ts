import {Naja} from '../Naja';

export class ScriptLoader {
	public constructor(naja: Naja) {
		naja.addEventListener('success', (event) => {
			const {payload} = event.detail;
			if (payload.snippets) {
				this.loadScripts(payload.snippets);
			}
		});
	}

	public loadScripts(snippets: Record<string, string>): void {
		Object.keys(snippets).forEach((id) => {
			const content = snippets[id];
			if ( ! /<script/i.test(content)) {
				return;
			}

			const el = window.document.createElement('div');
			el.innerHTML = content;

			const scripts = el.querySelectorAll('script');
			for (let i = 0; i < scripts.length; i++) {
				const script = scripts.item(i);
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
			}
		});
	}
}
