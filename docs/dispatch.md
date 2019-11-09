# Dispatching requests

You can dispatch an AJAX request by calling Naja's `makeRequest()` method. It takes the following arguments:

```js
naja.makeRequest(method, url, data = null, options = {})
```

- `method: string` is the request method, usually `GET` or `POST`. It is case-insensitive.
- `url: string` is the target URL.
- `data: ?mixed` can be array, object, string, `ArrayBuffer`, `Blob`, `FormData`, &hellip;
- `options: ?Object` can be used to alter the behavior of some components or [extensions](extensibility.md).

The `makeRequest` method returns a Promise which either resolves to an object containing the parsed response payload,
or is rejected with the thrown error.

Under the hood, Naja uses Fetch API, which only rejects the promise in case of a network error or a similar condition,
not when the response yields a non-200 HTTP code. Naja alters this behaviour and rejects the promise with an `HttpError`
in such case, which also exposes the `Response` for further inspection:

```js
naja.makeRequest(method, url)
    .catch((error) => {
        if (error.name === 'HttpError' && error.response.status === 401) {
            // ...
        }
    });
```


## Options

The `options` object has multiple roles:

1. It can contain various configuration directives that are further described in respective pages of the documentation.
2. It is passed along in Naja's events, and thus [custom extensions](extensions-custom.md) can make use of the options
    system too.
3. On top of that, it can carry options for the Fetch API request. These are expected in the `fetch` key.


### Default options

You can configure the default options for your extensions or Naja's core components via the `initialize` method:

```js
naja.initialize({
	history: false,
	myCustomOption: 42,
    fetch: {
		credentials: 'same-origin',
    },
});
```

Default options can later be changed by modifying Naja's `defaultOptions` attribute:

```js
naja.defaultOptions.myCustomOption = 41;
```


## Events

Naja and some of its components dispatch various events during the lifecycle of the request and its processing.
These allow for a great degree of extensibility; you can learn more about the dispatched events in the [Events
reference](events.md)
