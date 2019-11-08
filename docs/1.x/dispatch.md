# Dispatching requests

You can dispatch an AJAX request by calling Naja's `makeRequest()` method. It takes the following arguments:

```js
naja.makeRequest(method, url, data = null, options = {})
```

- `method: string` is the request method, usually `GET` or `POST`. It is case-insensitive.
- `url: string` is the target URL.
- `data: ?mixed` can be array, object, string, `ArrayBuffer`, `Blob`, `FormData`, &hellip;
- `options: ?Object` can be used to alter the behavior of some components or [extensions](extensions-custom.md).

The `makeRequest` method returns a Promise which either resolves to the `response` object containing the parsed response
body, or is rejected with the thrown `error`.


## Options

The `options` object has multiple roles:

1. It can contain various configuration directives that are further described in respective pages of the documentation.
2. It is passed along in Naja's events, and thus [custom extensions](extensions-custom.md) can make use of the options
    system too.
3. On top of that, it carries the options for the underlying AJAX library, [`qwest`](https://github.com/pyrsmk/qwest).
    Please refer to its docs for reference.


### Default options

You can also configure the default options for your extensions or Naja's core components via the `initialize` method:

```js
naja.initialize({
	history: false,
	myCustomOption: 42
});
```

?> The default options configuration through the `initialize()` method is available since version 1.6.0. Previously
(since version 1.3.0), the default options could only be configured by directly modifying `naja.defaultOptions`.
