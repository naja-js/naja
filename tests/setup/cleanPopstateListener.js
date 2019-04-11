export const cleanPopstateListener = (historyHandler) => {
	if (historyHandler) {
		window.removeEventListener('popstate', historyHandler.popStateHandler);
	}
};
