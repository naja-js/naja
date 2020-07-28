# Snippets

`SnippetHandler` redraws snippets that come in the response payload's `snippets` key. You can mark the snippet element
with `data-naja-snippet-prepend` or `data-naja-snippet-append` attribute to prepend or append the snippet content,
respectively, instead of replacing it. (`data-ajax-prepend` and `data-ajax-append` are supported as well.)


## Snippet update events

`SnippetHandler` dispatches events both before and after the snippet is updated. Both are dispatched for each and every
updated snippet, and both give you access to the HTML element and the new content from response payload. Both can also
tell you whether the snippet has been updated from cache after user navigation (e.g. going back in history), or as
a result of an AJAX request to the server (`event.detail.fromCache`).

You can use them like this:

```js
naja.snippetHandler.addEventListener('afterUpdate', (event) => {
	if (event.detail.snippet.id === 'snippet--alert') {
		window.alert(event.detail.content);
	}
});
```

The `beforeUpdate` event listener might also prevent the snippet from updating by calling `event.preventDefault()`.
In such case, the `afterUpdate` event is not dispatched for that snippet.

```js
naja.snippetHandler.addEventListener('beforeUpdate', (event) => {
    if (event.detail.snippet.id === 'snippet--immutable') {
        event.preventDefault();
    }
});
```


### Changing snippet update operation

In addition to the attributes above, the snippet update events both contain the `event.detail.operation` to be done.
The `beforeUpdate` event allows you to override the operation via its `event.detail.changeOperation` method. You can
either use one of the predefined operations available via `naja.snippetHandler.op`:

```js
naja.snippetHandler.addEventListener('beforeUpdate', (event) => {
    if (event.detail.options.forceUpdate) {
        event.detail.changeOperation(naja.snippetHandler.op.replace);
    }
});
```

Or you can also write your own implementation that accepts the updated `snippet: Element`, and the new `content: string`:

```js
naja.snippetHandler.addEventListener('beforeUpdate', (event) => {
    event.detail.changeOperation((snippet, content) => { /* do some super clever Virtual DOM magic here */ });
});
```
