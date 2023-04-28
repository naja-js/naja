import {CompleteEvent, Extension, Naja, StartEvent} from '../Naja';
import {InteractionEvent} from '../core/UIHandler';

declare module '../Naja' {
	interface Options {
		unique?: string | false;
	}
}

export class UniqueExtension implements Extension {
	public initialize(naja: Naja): void {
		naja.uiHandler.addEventListener('interaction', this.checkUniqueness.bind(this));
		naja.addEventListener('start', this.abortPreviousRequest.bind(this));
		naja.addEventListener('complete', this.clearRequest.bind(this));
	}


	private readonly abortControllers: Map<string, AbortController> = new Map();

	private checkUniqueness(event: InteractionEvent): void {
		const {element, options} = event.detail;
		if (element.hasAttribute('data-naja-unique') ?? (element as HTMLInputElement).form?.hasAttribute('data-naja-unique')) {
			const unique = element.getAttribute('data-naja-unique') ?? (element as HTMLInputElement).form?.getAttribute('data-naja-unique');
			options.unique = unique === 'off' ? false : unique ?? 'default';
		}
	}

	private abortPreviousRequest(event: StartEvent): void {
		const {abortController, options} = event.detail;
		if (options.unique !== false) {
			this.abortControllers.get(options.unique ?? 'default')?.abort();
			this.abortControllers.set(options.unique ?? 'default', abortController);
		}
	}

	private clearRequest(event: CompleteEvent): void {
		const {request, options} = event.detail;
		if ( ! request.signal.aborted && options.unique !== false) {
			this.abortControllers.delete(options.unique ?? 'default');
		}
	}
}
