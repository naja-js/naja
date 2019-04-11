import {Naja} from '../../src/Naja';


class UIHandlerMock {
	isUrlAllowed(url) {}
}

class RedirectHandlerMock extends EventTarget {
}

class SnippetHandlerMock {
	updateSnippets(snippets, forceReplace = false) {}
}

class FormsHandlerMock {
	initForms() {}
	processForm(evt) {}
}

class HistoryHandlerMock {
}

class ScriptLoaderMock {
	loadScripts(snippets) {}
}


export const mockNaja = (mocks = {}) => {
	return new Naja(
		mocks.uiHandler || UIHandlerMock,
		mocks.redirectHandler || RedirectHandlerMock,
		mocks.snippetHandler || SnippetHandlerMock,
		mocks.formsHandler || FormsHandlerMock,
		mocks.historyHandler || HistoryHandlerMock,
		mocks.scriptLoader || ScriptLoaderMock
	);
};
