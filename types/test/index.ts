import naja from 'naja';

type Naja = typeof naja;

class Extension {
    public constructor(naja: Naja) {
    }
}

naja.registerExtension(Extension);

class ExtensionWithAdditionalParameters {
    public constructor(naja: Naja, additionalParameter: string) {
    }
}

naja.registerExtension(ExtensionWithAdditionalParameters, 'foo');

naja.makeRequest('GET', '/example', {}, {})
    .then((response: object) => {});

naja.initialize();
naja.initialize({});

naja.uiHandler.isUrlAllowed('https://example.com') === true;

naja.addEventListener('init', (options: object) => {});
