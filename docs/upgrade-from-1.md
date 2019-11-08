# Upgrading from Naja 1.x

Naja 2.0 has introduced a number of BC breaks to keep it in sync with modern standards and APIs. This section
of the docs describes all of these changes and the way to upgrade.


## Naja 2.0 uses Fetch API

The most notable change is that Naja now directly uses Fetch API to dispatch the requests. As a result, there is
no longer an `XMLHttpRequest`, which led to a change in the contents of most of Naja's events: they no longer
reference the `xhr`, and instead hold the `Request` instance, as well as the `Response` where possible.

Please refer to the [Events reference](events.md) for more information about the new events.


## Interaction event has moved

The `interaction` event has moved to where it belongs better, the UIHandler. Luckily, the migration path is quite
straight-forward: just add `.uiHandler`. In other words, change this:

```js
naja.addEventListener('interaction', interactionHandler);
```

to this:

```js
naja.uiHandler.addEventListener('interaction', interactionHandler);
```


## All events are proper CustomEvents

Naja and its event-dispatching components now properly implement the `EventTarget` interface. Also, events are no longer
plain objects duck-typed to resemble events; events now make use of the `CustomEvent` API. The practical consequence is
that event-specific data have moved from the event itself to its `detail` attribute. The following code:

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


## Options are no longer read from response payload

Naja 1.7.0 has deprecated the support for reading some options from the response payload, namely `forceRedirect` and
`replaceHistory`. This mechanism is now entirely removed and the only way you can configure these is through the request
`options` or via respective data-atrributes. Please refer to the docs of [RedirectHandler](redirection.md) and
[HistoryHandler](history.md) for more information.


## Farewell Internet Explorer

Naja 2.0 has dropped support for Internet Explorer. Naja is no longer tested on this browser and therefore cannot
guarantee that it works properly. If you still need to support IE, you can always stick with the 1.x version.

In theory, it *might* be possible to make Naja 2.0 work on IE by including polyfills for:

- [Promise](https://www.npmjs.com/package/es6-promise),
- [Fetch API](https://www.npmjs.com/package/whatwg-fetch),
- [URL and URLSearchParams](https://www.npmjs.com/package/url-polyfill),
- [window.location.origin](https://gist.github.com/haydenbleasel/332e10a733ef74e1fedce6099a31a805),
- [CustomEvent](https://www.npmjs.com/package/custom-event).

Note that this list might not be complete.
