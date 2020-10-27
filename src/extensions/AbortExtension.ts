import {BeforeEvent, Extension, Naja, StartEvent} from '../Naja';
import {InteractionEvent} from '../core/UIHandler';

declare module '../Naja' {
	interface Options {
		abort?: boolean;
	}
}

export class AbortExtension implements Extension {
	public initialize(naja: Naja): void {
		naja.uiHandler.addEventListener('interaction', this.checkAbortable.bind(this));
		naja.addEventListener('init', this.onInitialize.bind(this));
		naja.addEventListener('before', this.checkAbortable.bind(this));
		naja.addEventListener('start', this.saveAbortController.bind(this));
		naja.addEventListener('complete', this.clearAbortController.bind(this));
	}


	private abortable: boolean = true;
	private abortController: AbortController | null = null;
	private onInitialize(): void {
		document.addEventListener('keydown', (event) => {
			if (this.abortController !== null
				&& event.key === 'Escape'
				&& !(event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)
				&& this.abortable
			) {
				this.abortController.abort();
				this.abortController = null;
			}
		});
	}

	private checkAbortable(event: InteractionEvent | BeforeEvent): void {
		const {options} = event.detail;
		this.abortable = 'element' in event.detail
			? (event.detail.element.getAttribute('data-naja-abort') ?? (event.detail.element as HTMLInputElement).form?.getAttribute('data-naja-abort')) !== 'off' // eslint-disable-line no-extra-parens
			: options.abort !== false;

		// propagate to options if called in interaction event
		options.abort = this.abortable;
	}

	private saveAbortController(event: StartEvent): void {
		const {abortController} = event.detail;
		this.abortController = abortController;
	}

	private clearAbortController(): void {
		this.abortController = null;
		this.abortable = true;
	}
}
