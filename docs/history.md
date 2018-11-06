# History

`HistoryHandler` synchronizes AJAX requests with the browser's History API. When a request finishes, HistoryHandler
pushes the new state including the document's title, URL, and a snapshot of snippets content into the browser's history.


## P/R/G considerations

Sometimes, in cases where you would employ the [Post/Redirect/Get](https://en.wikipedia.org/wiki/Post/Redirect/Get)
scheme, this behavior can add unneeded things to the URL. To prevent this, you need to hint Naja on what the target URL
should be by adding `postGet: true` and `url: <targetUrl>` to the response payload. Generally, where you would do this:

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


## UI cache

HistoryHandler caches the UI state (content of all snippets) in the history entry's state and reapplies it when
navigating through the history. (And does so cleverly, so that `-prepend` and `-append` snippets do not break.)

You might, however, want to disable the cache for specific snippets (e.g. the shopping cart) so that their content is
not reverted when the user navigates through the history. This can be done by adding the `data-naja-history-nocache`
attribute to the snippet element.


## Replace instead of push

If you want to replace the current state instead of pushing a new one, which makes sense for certain types of signals,
you can add `history: 'replace'` to the options object or add `data-naja-history="replace"` attribute to the `.ajax`
element.


## Disabling history

Similarly, you can keep a request off-the-record and not alter the browser's history at all by adding `history: false`
to the options or `data-naja-history="off"` attribute to the element.

?> The `history` option is available since version 1.1.0.
