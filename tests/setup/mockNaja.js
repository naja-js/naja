import Naja from '../../src/Naja';


class UIHandlerMock {
}

class RedirectHandlerMock {
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


export default (mocks = {}) => {
	return new Naja(
		mocks.uiHandler || UIHandlerMock,
		mocks.redirectHandler || RedirectHandlerMock,
		mocks.snippetHandler || SnippetHandlerMock,
		mocks.formsHandler || FormsHandlerMock,
		mocks.historyHandler || HistoryHandlerMock,
		mocks.scriptLoader || ScriptLoaderMock
	);
};
