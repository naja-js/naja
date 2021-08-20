export const createPopstateEvent = (state) =>
	new PopStateEvent('popstate', {
		bubbles: true,
		cancelable: true,
		state,
	});
