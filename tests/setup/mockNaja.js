import Naja from '../../src/Naja';
import Component from '../../src/Component';


class UIHandlerMock extends Component {
	constructor(naja) {
		super(naja);
	}
}

class RedirectHandlerMock extends Component {
	constructor(naja) {
		super(naja);
	}
}

class SnippetHandlerMock extends Component {
	constructor(naja) {
		super(naja);
	}

	updateSnippets(snippets, forceReplace = false) {}
}

class FormsHandlerMock extends Component {
	constructor(naja) {
		super(naja);
	}

	static initForms() {}
	static processForm(evt) {}
}

class HistoryHandlerMock extends Component {
	constructor(naja) {
		super(naja);
	}
}

class ScriptLoaderMock extends Component {
	constructor(naja) {
		super(naja);
	}

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
