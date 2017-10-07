export default (historyHandler) => {
	if (historyHandler) {
		window.removeEventListener('popstate', historyHandler.popStateHandler);
	}
};
