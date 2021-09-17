# History

Naja synchronizes AJAX requests with the browser's History API. When a request finishes, HistoryHandler pushes the new state into the browser's history, and restores it when the user navigates through their browser history.


## P/R/G considerations

Sometimes, in cases where you would employ the [Post/Redirect/Get](https://en.wikipedia.org/wiki/Post/Redirect/Get) scheme, this behavior can add unneeded things to the URL (such as the `_do` parameter). To prevent this, you need to hint Naja on what the target URL should be by adding `postGet: true` and `url: <targetUrl>` to the response payload. Generally, where you would do this:

```php
if ($this->isAjax()) {
	$this->redrawControl('content');

} else {
	$this->redirect('this');
}
```

you should now do this instead:

```php
if ($this->isAjax()) {
	$this->redrawControl('content');
	$this->payload->postGet = TRUE;
	$this->payload->url = $this->link('this');

} else {
	$this->redirect('this');
}
```


## History mode

### Replace instead of push

If you want to replace the current state instead of pushing a new one, you can add `history: 'replace'` to the options object or add `data-naja-history="replace"` attribute to the `.ajax` element. This makes sense for certain types of actions and signals, such as adding items to the shopping cart:

```js
naja.makeRequest('POST', '/addToCart', { itemId: 42 }, { history: 'replace' });
```

```html
<form n:name="addToCart" class="ajax" data-naja-history="replace">
    <!-- ... -->
</form>
```

### Disabling history

Similarly, you can keep a request off-the-record and not alter the browser's history at all by adding `history: false` to the options or `data-naja-history="off"` attribute to the `.ajax` element:

```js
naja.makeRequest('POST', '/ping', null, { history: false });
```


## History integration events

HistoryHandler exposes a pair of events that allow you to store additional information within the history entry's state, and then add behaviour based on that added information when the state is restored:

```js
naja.historyHandler.addEventListener('buildState', (event) => {
	if (event.detail.options.reloadOnRestore) {
		event.detail.state.reloadOnRestore = true;
    }
});

naja.historyHandler.addEventListener('restoreState', (event) => {
	if (event.detail.state.reloadOnRestore) {
		event.stopImmediatePropagation();
		naja.makeRequest('GET', event.detail.state.href, null, { history: false });
    }
});
```

You can learn more in the [events reference](events.md#historyhandler).


## Snippet cache

As an extension of the HistoryHandler's behaviour, Naja also implements a mechanism that stores the state of all snippets in the history entry's state and then reapplies it when navigating through the history. You can read more in the [snippet cache](snippet-cache.md) section.
