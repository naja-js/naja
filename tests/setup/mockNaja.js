import {Naja} from '../../src/Naja';


class UIHandlerMock extends EventTarget {
	isUrlAllowed(url) {}
}

class RedirectHandlerMock extends EventTarget {
}

class SnippetHandlerMock extends EventTarget {
	updateSnippets(snippets, forceReplace = false) {}
}

class FormsHandlerMock {
	initForms() {}
	processForm(evt) {}
}

class HistoryHandlerMock extends EventTarget {
}

class SnippetCacheMock extends EventTarget {
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
		mocks.snippetCache || SnippetCacheMock,
		mocks.scriptLoader || ScriptLoaderMock,
	);
};
