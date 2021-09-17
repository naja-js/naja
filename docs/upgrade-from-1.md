# Upgrading from Naja 1.x

Naja 2.0 has introduced a number of BC breaks to keep it in sync with modern standards and APIs. This section of the docs describes all of these changes and the way to upgrade.


## Naja 2.0 uses Fetch API

The most notable, and at the same time the most internal change is that Naja now directly uses Fetch API to dispatch requests. As a result, there is no longer an `XMLHttpRequest`, which led to a change in the contents of most of Naja's events: they no longer reference the `xhr`, and instead hold the `Request` instance, as well as the `Response`where possible.

Please refer to the [Events reference](events.md) for more information about the new events.

!> Pay special attention to `success` and `complete` events. In 1.x, these events held the response payload in `event.response`. In 2.0, `event.detail.response` holds the Fetch API's `Response` instance, while the response payload is accessible via `event.detail.payload`.


## The interaction event has moved

The `interaction` event has moved to where it belongs better, the UIHandler. Luckily, the migration path is quite straight-forward: just add `.uiHandler`. In other words, change this:

```js
naja.addEventListener('interaction', interactionHandler);
```

to this:

```js
naja.uiHandler.addEventListener('interaction', interactionHandler);
```


## The load event has been removed

The `load` event has been removed because it didn't fit that nicely into the set of events that Naja dispatches during the request's lifecycle. Besides, it has already had better replacements for quite a long time.

Probably its most dominant use case has been to reinitialize scripts after updating snippets, so that e.g. social media widgets from snippets would come alive. The SnippetHandler dispatches a pair of events for each updated snippet; you can use these to achieve the same behaviour, and possibly gain a little performance boost, because you can restrict the reinitialization only to the snippet and its subset of DOM.

Consider the following example using [Twitter's JavaScript API](https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-loading-and-initialization):

Before:

```js
naja.addEventListener('load', () => {
    twttr.widgets.load();
});
```

After:

```js
naja.snippetHandler.addEventListener('afterUpdate', (event) => {
    twttr.widgets.load(event.detail.snippet);
});
```

For other use cases, the `load` event is dispatched during Naja's initialization – which can be replaced by the `init`event or by calling the code directly during initialization –, and then after every request, be it successful or not, which can be replaced by the `complete` event.


## All events are proper CustomEvents

Naja and its event-dispatching components now properly implement the `EventTarget` interface. Also, events are no longer plain objects duck-typed to resemble events; events now make use of the `CustomEvent` API. The practical consequence is that event-specific data have moved from the event itself to its `detail` attribute. The following code:

```js
naja.addEventListener('before', (event) => {
    console.log(event.request);
});
```

must therefore be rewritten to this:

```js
naja.addEventListener('before', (event) => {
    console.log(event.detail.request);
});
```


## Extensions API is refactored

The extensions API in Naja 1.0 had been designed in a bit slapdash manner. Well, more like half-baked than designed. In Naja 2.0, the entry point of an [extension](extensibility.md) has moved from its constructor to the `initialize()`method. That's where extensions receive the instance of Naja and where they should bind their event listeners. The extension can utilize its constructor however it needs, or not at all.

As a result, you no longer register the extension's constructor and you no longer have to pass arguments through Naja. Extensions are registered as instances and initialized later by Naja through the `initialize()` method.

Before:

```js
class LoaderExtension {
    constructor(naja, loaderSelector) {
        this.loader = document.querySelector(loaderSelector);
        naja.addEventListener('start', () => { /* show this.loader */ });
        naja.addEventListener('complete', () => { /* hide this.loader */ });
    }
}

naja.registerExtension(LoaderExtension, '#loader');
```

After:

```js
class LoaderExtension {
    constructor(loaderSelector) {
        this.loader = document.querySelector(loaderSelector);
    }

    initialize(naja) {
        naja.addEventListener('start', () => { /* show this.loader */ });
        naja.addEventListener('complete', () => { /* hide this.loader */ });
    }
}

naja.registerExtension(new LoaderExtension('#loader'));
```

As an added bonus, extensions no longer have to be "classes". Even a plain object is fine as long as it implements the `initialize()` method:

```js
const loggerExtension = {
    initialize(naja) {
        naja.addEventListener('complete', (event) => console.log(event.detail));
    }
};

naja.registerExtension(loggerExtension);
```


## Options are no longer read from response payload

Naja 1.7.0 has deprecated the support for reading some options from the response payload, namely `forceRedirect` and `replaceHistory`. This mechanism is now entirely removed and the only way you can configure these is through the request`options` or via respective data-atrributes. Please refer to the docs of [RedirectHandler](redirection.md) and [HistoryHandler](history.md) for more information.


## Farewell Internet Explorer

Naja 2.0 has dropped support for Internet Explorer. Naja is no longer tested on this browser and therefore cannot guarantee that it works properly. If you still need to support IE, you can always stick with the 1.x version.

In theory, it *might* be possible to make Naja 2.0 work on IE by including polyfills for:

- [Promise](https://www.npmjs.com/package/es6-promise),
- [Fetch API](https://www.npmjs.com/package/whatwg-fetch),
- [URL and URLSearchParams](https://www.npmjs.com/package/url-polyfill),
- [window.location.origin](https://gist.github.com/haydenbleasel/332e10a733ef74e1fedce6099a31a805),
- [CustomEvent](https://www.npmjs.com/package/custom-event).

Note that this list might not be complete.


## Considerations for third-party extensions authors

If you develop and maintain your own extension for Naja and distribute it as an open-source software, probably the best thing to do is to bump the required version of Naja in your extension's `package.json` and release a new version that supports Naja 2.0 only.

If you for some reason need or want to support both versions of Naja and don't want to maintain two versions at once, you can list both version ranges of Naja in your extension's `package.json` (for example like this: `^1.0 || ^2.0`) and write code in a way that detects the version of Naja and uses the appropriate available APIs based on the version.

To facilitate this, Naja as of 2.0 exposes its version number in a field named `VERSION`:

```js
if (naja.VERSION >= 2) {
    // we have >=2.0
}
```
