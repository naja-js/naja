# Redirection

Naja performs a redirection if there is `redirect` key in the response payload, e.g. as a result of a call to `$presenter->redirect()`.

Note that if the target URL points to one of the [allowed origins](ui-binding.md#allowed-origins), the redirect is actually done via another AJAX request. To mimic the behaviour of a standard HTTP redirect, the redirection request reuses the `options` of the original request.

To prevent this and make a proper HTTP redirect, you can add `forceRedirect: true`to the request options or add `data-naja-force-redirect` attribute to the `.ajax` element:

```js
naja.makeRequest('GET', '/redirect', null, { forceRedirect: true });
```

```html
<a href="/redirect" class="ajax" data-naja-force-redirect>Link</a>
```


## Redirect event

Prior to redirecting, RedirectHandler dispatches the `redirect` event. The event gives you access to the request options in `event.detail.options`, to the target URL in `event.detail.url`, and to the information whether the redirect is going to be an asynchronous one, or a hard one (`event.detail.isHardRedirect`). You can alter that behaviour by calling `event.detail.setHardRedirect(value)` with a boolean value:

```js
naja.redirectHandler.addEventListener('redirect', (event) => {
	if (event.detail.url.includes('/sign-in')) {
		event.detail.setHardRedirect(true);
	}
});
```

The event listener can also entirely prevent the redirection by calling `event.preventDefault()`:

```js
naja.redirectHandler.addEventListener('redirect', (event) => {
	event.preventDefault();
});
```

You can learn more in the [events reference](events.md#redirecthandler).
