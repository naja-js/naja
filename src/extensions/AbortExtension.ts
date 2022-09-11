import {CompleteEvent, Extension, Naja, StartEvent} from '../Naja';
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
		naja.addEventListener('start', this.saveAbortController.bind(this));
		naja.addEventListener('complete', this.removeAbortController.bind(this));
	}


	private readonly abortControllers: Set<AbortController> = new Set();

	private onInitialize(): void {
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && !(event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)) {
				for (const controller of this.abortControllers) {
					controller.abort();
				}

				this.abortControllers.clear();
			}
		});
	}

	private checkAbortable(event: InteractionEvent): void {
		const {element, options} = event.detail;
		if (element.hasAttribute('data-naja-abort') || (element as HTMLInputElement).form?.hasAttribute('data-naja-abort')) {
			options.abort = (element.getAttribute('data-naja-abort') ?? (element as HTMLInputElement).form?.getAttribute('data-naja-abort')) !== 'off';
		}
	}

	private saveAbortController(event: StartEvent): void {
		const {abortController, options} = event.detail;
		if (options.abort !== false) {
			this.abortControllers.add(abortController);
			options.clearAbortExtension = () => this.abortControllers.delete(abortController);
		}
	}

	private removeAbortController(event: CompleteEvent): void {
		const {options} = event.detail;
		if (options.abort !== false && !!options.clearAbortExtension) {
			options.clearAbortExtension();
		}
	}
}
