# Snippets

Naja redraws snippets that come in the response payload's `snippets` key, as marked on the server via `$control->redrawControl()`.


## Snippet update operation

By default, the snippet content is replaced by what appears in the response payload. You can alter this behaviour, e.g. to implement infinite scrolling; you can mark the snippet element with `data-naja-snippet-prepend` or `data-naja-snippet-append` attribute to prepend or append the snippet content, respectively, instead of replacing it:

```html
<div n:snippet="products" data-naja-snippet-append>
	<div n:foreach="$productsOnPage as $product">
        <!-- ... -->
    </div>
</div>
```


## Snippet update events

Naja dispatches events both before and after the snippet is updated. Both are dispatched for each and every updated snippet, and both give you access to the HTML element and the new content from response payload. Both can also tell you whether the snippet has been updated [from cache after user navigation](snippet-cache.md) (e.g. going back in history), or as a result of an AJAX request to the server (`event.detail.fromCache`).

You can use them like this:

```js
naja.snippetHandler.addEventListener('afterUpdate', (event) => {
	if (event.detail.snippet.id === 'snippet--alert') {
		window.alert(event.detail.content);
	}
});
```

The `beforeUpdate` event listener might also prevent the snippet from updating by calling `event.preventDefault()`. In such case, the `afterUpdate` event is not dispatched for that snippet.

```js
naja.snippetHandler.addEventListener('beforeUpdate', (event) => {
    if (event.detail.snippet.id === 'snippet--immutable') {
        event.preventDefault();
    }
});
```

You can learn more in the [events reference](events.md#snippethandler).

### Changing snippet update operation

In addition to the attributes above, the snippet update events both contain the `event.detail.operation` to be done. The `beforeUpdate` event allows you to override the operation via its `event.detail.changeOperation` method. You can either use one of the predefined operations available via `naja.snippetHandler.op`:

```js
naja.snippetHandler.addEventListener('beforeUpdate', (event) => {
    if (event.detail.options.forceUpdate) {
        event.detail.changeOperation(naja.snippetHandler.op.replace);
    }
});
```

Or you can also write your own implementation. A snippet update operation needs to implement a pair of methods:

- `updateElement(snippet: Element, content: string): void | Promise<void>`

  This method should update the `snippet` element with the `content` received from the server.

- `updateIndex(currentContent: string, newContent: string): string`

  This method should apply the `newContent` received from the server onto the snippet's [cached](snippet-cache.md) `currentContent`, and return the result.

Example:

```js
naja.snippetHandler.addEventListener('beforeUpdate', (event) => {
    event.detail.changeOperation({
        updateElement(snippet, content) { /* do some super clever DOM diff magic here */ },
        updateIndex: (_, newContent) => newContent,
    });
});
```


## Scripts in snippets

Naja automatically executes scripts that are dynamically added to the page via snippets:

```html
<div n:snippet="scripts">
    <!-- this script will be executed when the "scripts" snippet is redrawn -->
    <script>third.party.service.init();</script>
</div>
```

?> Note that in many cases, it is also possible (and often more convenient) to implement the desired behaviour using [extensions](extensibility.md).

### Scripts deduplication

If you have scripts in your snippets, be aware that they might be executed multiple times as the user navigates the site. To prevent this, you can add a `data-naja-script-id` attribute to the `<script>` tag – scripts with the same ID will be executed only once, even if the user navigates to the same page multiple times:

```html
<div n:snippet="scripts">
    <!-- this script will be loaded only once -->
    <script src="https://third.party.service/sdk/loader.js" data-naja-script-id="3rd-party-service"></script>

    <!-- this script will be executed every time it appears in snippets -->
    <script>third.party.service.init();</script>
</div>
```
