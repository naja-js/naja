export class AssertionError extends Error {}
export const assert: (condition: boolean, description?: string) => asserts condition = (condition, description) => {
	if ( ! condition) {
		const message = `Assertion failed${description !== undefined ? `: ${description}` : '.'}`;
		throw new AssertionError(message);
	}
};


// typed EventTarget

type TypedEventListenerFunction<ET extends EventTarget, E extends Event> = (this: ET, event: E) => boolean | void;
type TypedEventListenerObject<E extends Event> = {
	handleEvent(event: E): void;
};

export type TypedEventListener<ET extends EventTarget, E extends Event> =
	TypedEventListenerFunction<ET, E>
	| TypedEventListenerObject<E>
	| null;
