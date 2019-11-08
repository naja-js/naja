# Snippets

`SnippetHandler` redraws snippets that come in the response payload's `snippets` key. You can mark the snippet with
`data-naja-snippet-prepend` or `data-naja-snippet-append` attribute to prepend or append the snippet content,
respectively, instead of replacing it. (`data-ajax-prepend` and `data-ajax-append` are supported as well.)


## Snippet update events

While Naja exposes various events in the request's lifecycle to provide a flexible way of extending its behavior,
sometimes a more granular approach is handy. You can therefore attach event listeners to two SnippetHandler's events:
`beforeUpdate` and `afterUpdate`. Both are dispatched for each updated snippet: the former is dispatched right before
the snippet's content is updated, the latter after that. Both give you access to the HTML element in `event.snippet`
and the content from payload in `event.content`, and both can tell you whether the snippet has been updated from cache
after user navigation (e.g. going back in history), or as a result of an AJAX request to the server (`event.fromCache`).

You can use them like this:

```js
naja.snippetHandler.addEventListener('afterUpdate', (event) => {
	if (event.snippet.id === 'snippet--alert') {
		window.alert(event.content);
	}
});
```

The `beforeUpdate` event listener might also prevent the snippet from updating by calling `event.preventDefault()`.
In such case, the `afterUpdate` event is not dispatched for that snippet.

?> The snippet update events are available since version 1.2.0.

?> The `event.fromCache` flag is available since version 1.8.0.
