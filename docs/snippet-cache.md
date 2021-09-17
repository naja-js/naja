# Snippet cache

Building upon the integration into the [History API](history.md), Naja stores the state of all snippets in the history entry's state and then reapplies it when navigating through the history, so that going back in history doesn't require a roundtrip back to the server, and thus feels almost instantaneous.


## Omitting snippets from cache

You might want to omit specific snippets from the cache, though, so that their content is not reverted when the user navigates through the history. A great example of such snippet is a shopping cart widget. This can be done by marking the snippet element with the `data-naja-snippet-cache="off"` attribute:

```html
<div n:snippet="cart" data-naja-snippet-cache="off">
    <!-- ... -->
</div>
```


## Session storage

Various browsers have different limits of the history entry state size. If you have large snippets, or a large number of them, you might have hit such limit, e.g. in the form of a cryptic `NS_ERROR_ILLEGAL_VALUE` error.

To get around this limitation, Naja implements a snippet cache storage mechanism that uses the Web Storage API which often has a larger quota (although it differs in each browser too). You can switch to the session storage by adding `snippetCache: 'session'` to the options or `data-naja-snippet-cache="session"` to the `.ajax` element:

```js
naja.makeRequest('GET', '/action', null, { snippetCache: 'session' });
```

```html
<a href="/action" class="ajax" data-naja-snippet-cache="session">Link</a>
```


## Disabling the cache

The snippet cache can also be disabled entirely. Apart from when even session storage is not big enough for your snippets, this can be useful in other situations, such as when you have snippets with fast-changing data that you want to keep up-to-date. If you disable snippet cache, Naja will fetch the snippets live by replaying the original request in background. You can disable the snippet cache by adding `snippetCache: 'off'` to the options or `data-naja-snippet-cache="off"` to the `.ajax` element:

```js
naja.makeRequest('GET', '/action', null, { snippetCache: 'off' });
```

```html
<a href="/action" class="ajax" data-naja-snippet-cache="off">Link</a>
```

!> To refetch snippets, Naja sends a new `GET` request to the original URL (or to the URL provided from the server via [`postGet`](history.md#prg-considerations)). Make sure that all the reachable actions and signals are able to respond to AJAX requests with redrawn snippets, otherwise Naja will break.


## Snippet cache events

Snippet cache dispatches a set of events:

The `store` event is dispatched when snippets are being stored in cache and can be used e.g. to alter the stored snippets:

```js
naja.snippetCache.addEventListener('store', (event) => {
	delete event.detail.snippets['snippet--userProfile'];
});
```

The `fetch` event is dispatched when snippets are being fetched from cache and can be used e.g. to alter the cache behaviour (such as forcing a refetch of snippets), or configuring `options` for the refetch request:

```js
naja.snippetCache.addEventListener('fetch', (event) => {
	event.detail.options.snippetCache = 'off';
	event.detail.options.abort = false;
});
```

The `restore` events is dispatched when snippets are being restored from the cache and can be used e.g. to alter the restored snippets:

```js
naja.snippetCache.addEventListener('restore', (event) => {
	delete event.detail.snippets['snippet--userProfile'];
});
```

You can learn more in the [events reference](events.md#snippetcache).
